#version 150
#extension GL_ARB_explicit_attrib_location : require

#define TASK 00
#define ENABLE_EMPTY_SPACE_SKIPPING 0
#define ENABLE_ADAPTIVE_SAMPLING 0
#define ENABLE_LIGHTING 0

// input 'varyings': can be different for each fragment ----------------------------

in vec3 ray_entry_position;

// input 'uniforms': same for all fragments ----------------------------

uniform mat4 Modelview;

uniform sampler3D volume_texture;
uniform sampler3D min_max_accel_texture;
uniform sampler2D transfer_func_texture;

uniform vec3    camera_location;
uniform float   sampling_distance;
uniform float   iso_value;
uniform float   iso_value_2;
uniform vec3    max_bounds;
uniform ivec3   volume_dimensions;

uniform vec3    light_position;
uniform vec3    light_ambient_color;
uniform vec3    light_diffuse_color;
uniform vec3    light_specular_color;
uniform float   light_shininess;

const float light_ambient_reflection_constant = 0.4f;
const float light_diffuse_reflection_constant = 0.8f;
const float light_specular_reflection_constant = 0.8f;


uniform uvec3 accel_struct_dims;
uniform vec3  accel_struct_cell_size;
uniform vec3  accel_struct_bounds;

// output: colour of this fragment ----------------------------

layout(location = 0) out vec4 FragColor;


// helper functions ----------------------------


// INPUT: sampling position
// OUTPUT: true if given position is inside the volume, false otherwise
bool inside_volume_bounds(const in vec3 sampling_position)
{
    return (all(greaterThanEqual(sampling_position, vec3(0.0)))
            && all(lessThan(sampling_position, max_bounds)));
}

// INPUT: sampling position
// OUTPUT: the trilinearly-interpolated data value from the volume at the given position
float sample_data_volume(vec3 in_sampling_pos)
{
    vec3 obj_to_tex = vec3(1.0) / max_bounds;
    return texture(volume_texture, in_sampling_pos * obj_to_tex).r;
}

// INPUT: sampling position
// OUTPUT: a vec2 containing the minimum and maximum values in the cell that the sampling position falls into 
vec2 sample_min_max_acceleration_struct(vec3 in_sampling_pos)
{
    return texelFetch(min_max_accel_texture, ivec3(in_sampling_pos * accel_struct_dims), 0).rg;
    //vec3 obj_to_tex = vec3(1.0) / accel_struct_bounds;
    //return texture(min_max_accel_texture, obj_to_tex * (in_sampling_pos + accel_struct_cell_size*0.0001)).rg;
}

// INPUT: scalar data value 
// OUTPUT: the colour and opacity from the transfer function for the given data value
vec4 get_color_and_opacity_for_data_value(float data_value){
    return texture(transfer_func_texture, vec2(data_value, 0.5f));
}

// NOTE: helper for find_cell_exit_point(): you do not need to call this function
// INPUT current ray and the corners of an axis-aligned bounding box (AABB)
// OUTPUT the second intersection of the ray with the AABB
vec3 get_exit_intersection_of_ray_in_AABB(vec3 rayOrigin, vec3 rayDir, vec3 boxMin, vec3 boxMax) {
    vec3 tMin = (boxMin - rayOrigin) / rayDir;
    vec3 tMax = (boxMax - rayOrigin) / rayDir;
    //vec3 t1 = min(tMin, tMax);
    vec3 t2 = max(tMin, tMax);
    // float tNear = max(max(t1.x, t1.y), t1.z);
    float tFar = min(min(t2.x, t2.y), t2.z);

    return rayOrigin + tFar*rayDir;
}

// NOTE: helper for find_cell_exit_point(): you do not need to call this function
// INPUT: sampling position
// OUTPUT: the 3d index of the acceleration structure cell that contains the given sampling point 
uvec3 get_accel_struct_cell(vec3 sampling_pos){
    return uvec3(sampling_pos * accel_struct_dims);
}

// INPUT: current sample position and direction of the ray
// OUTPUT: the point at which the given ray leaves the acceleration structure cell that contains the sampling point
vec3 find_cell_exit_point (vec3 sampling_pos, vec3 ray_direction) {

    // determine which cell the sampling position falls into
    uvec3 accel_struct_cell = get_accel_struct_cell(sampling_pos);

    // calculate min and max corners of current cell, expand slightly
    vec3 cell_min = accel_struct_cell_size * accel_struct_cell - (accel_struct_cell_size*0.001);
    vec3 cell_max = cell_min + accel_struct_cell_size + (accel_struct_cell_size * 0.001);
    
    // get exit point of ray from cell
    return get_exit_intersection_of_ray_in_AABB(ray_entry_position, normalize(ray_direction), cell_min, cell_max);
}

// INPUT: sampling point
// OUTPUT: the gradient at the given sample point
vec3 calculate_gradient(vec3 in_sampling_pos)
{
    float step = sampling_distance;
    vec3 grad;
    grad.x = (sample_data_volume(in_sampling_pos + vec3(step, 0, 0)) - sample_data_volume(in_sampling_pos - vec3(step, 0, 0))) / (2 * step);
    grad.y = (sample_data_volume(in_sampling_pos + vec3(0, step, 0)) - sample_data_volume(in_sampling_pos - vec3(0, step, 0))) / (2 * step);
    grad.z = (sample_data_volume(in_sampling_pos + vec3(0, 0, step)) - sample_data_volume(in_sampling_pos - vec3(0, 0, step))) / (2 * step);

    return grad;
}

// INPUT: sampling position and surface normal at the sampling position
// OUTPUT: the lighting component for the given sample point
vec3 calculate_lighting_component(vec3 in_sampling_pos, vec3 surface_normal, vec3 ray_direction)
{
    // avoid divide by 0 during normalization
    if (length(surface_normal) == 0.f)
    {
        return vec3(0.f);
    }

    vec3 normal = normalize(surface_normal);

    vec3 pnt_to_light = normalize(light_position - in_sampling_pos);
    float lambertian = max(dot(pnt_to_light, normal), 0.0);

    vec3 pnt_to_cam = normalize(camera_location - in_sampling_pos);
    vec3 R = reflect(-pnt_to_light, normal);

    float spec = max(dot(R, -normalize(ray_direction)), 0);
    float specular = pow(spec, light_shininess);

    vec3 shade_col = light_ambient_reflection_constant * light_ambient_color
                + light_diffuse_reflection_constant * light_diffuse_color * lambertian
                + light_specular_reflection_constant * light_specular_color * specular
                ;

    return shade_col;
}




// --------------------------------------------------------------------------------------------------------------------

void main()
{
    vec3 ray_direction = normalize(ray_entry_position - camera_location);
    vec3 ray_increment = ray_direction * sampling_distance; // One step through the volume
    vec3 sampling_pos = ray_entry_position + (ray_increment*0.001); // current position in volume, small increment just to be sure we are in the volume
    vec4 out_col = vec4(0.0, 0.0, 0.0, 0.0); // Init color of fragment

    // check that we are inside volume
    bool inside_volume = inside_volume_bounds(sampling_pos);
    if (!inside_volume)
        discard;


    // example - average intensity projection
#if TASK == 0 

    vec3  sum_intensity = vec3(0.f);
    float num_samples = 0.f;

    // the traversal loop
    // termination when the sampling position is outside volume boundary
    while (inside_volume) 
    {      
        // sample data value from volume at sampling point
        float data_value = sample_data_volume(sampling_pos);

        // convert data value to an intensity value
        vec4 color_opacity = get_color_and_opacity_for_data_value(data_value);
        vec3 intensity = color_opacity.rgb * color_opacity.a;

        // accumulate intensity
        sum_intensity += intensity;
        num_samples   += 1.f;

        // increment the ray sampling position
        sampling_pos  += ray_increment;

        // update the loop termination condition
        inside_volume  = inside_volume_bounds(sampling_pos);
    }

    // assign average intensity to output
    if (num_samples > 0.f){
        out_col = vec4(sum_intensity / num_samples, 1.f); 
    } else {
        out_col = vec4(0.f);
    }

#endif


    // TASK 1 - front-to-back compositing
#if TASK == 01 
    vec3  sum_intensity = vec3(0.f);
    float alpha = 0.f;
    int sampling_distance_factor = 1;
    bool adaptive_sampling_enable = false;

    while (inside_volume)
    {
        float data_value = sample_data_volume(sampling_pos);
        vec4 color_opacity = get_color_and_opacity_for_data_value(data_value);
        float opacity = color_opacity.a;
        vec3 intensity = color_opacity.rgb * opacity;

        // Make sure you include opacity correction for adaptive sampling
        if (adaptive_sampling_enable)
        {
            opacity = 1 - pow(1 - opacity, 2);
            intensity = color_opacity.rgb * opacity;
        }

        sum_intensity += (1 - alpha) * intensity;
        alpha = 1 - (1 - alpha) * (1 - opacity);
        out_col = vec4(sum_intensity, alpha);

#if ENABLE_ADAPTIVE_SAMPLING
        // For the sampling distance to increase by a factor approaching 2.0 as the opacity approaches 1.0
        if ((1-alpha < 0.1f) && !adaptive_sampling_enable)
        {
            sampling_distance_factor = 2;
            adaptive_sampling_enable = true;
        }
#endif

#if ENABLE_LIGHTING
        vec3 gradient = calculate_gradient(sampling_pos);
        vec3 lighting = calculate_lighting_component(sampling_pos, -gradient, ray_direction);
        out_col *= vec4(lighting, 1.f);
#endif

        sampling_pos += (ray_increment * sampling_distance_factor);
        inside_volume = inside_volume_bounds(sampling_pos);
    }
#endif


    // TASK 2 - multi-isosurface compositing
#if TASK == 02
    vec3  sum_intensity = vec3(0.f);
    float alpha = 0.f;
    bool found_first = false;
    bool found_second = false;

    while (inside_volume)
    {
        float data_value = sample_data_volume(sampling_pos);
        
        if (data_value >= iso_value && !found_first)
        {
            vec4 color_opacity = get_color_and_opacity_for_data_value(data_value);
            vec3 intensity = color_opacity.rgb * color_opacity.a;

            sum_intensity += (1 - alpha) * intensity;
            alpha = 1 - (1 - alpha) * (1 - color_opacity.a);
            
            found_first = true;
        } 
        else if (data_value >= iso_value_2 && !found_second)
        {
            vec4 color_opacity = get_color_and_opacity_for_data_value(data_value);
            vec3 intensity = color_opacity.rgb * color_opacity.a;

            sum_intensity += (1 - alpha) * intensity;
            alpha = 1 - (1 - alpha) * (1 - color_opacity.a);

            found_second = true;
        }

        sampling_pos += ray_increment;
        inside_volume = inside_volume_bounds(sampling_pos);
    }

    out_col = vec4(sum_intensity, alpha);
#endif


    // TASK 4 - empty space skipping for first-hit iso-surface raycasting
#if TASK == 03 
	while (inside_volume)
	{
        float data_value = sample_data_volume(sampling_pos);

        if (data_value >= iso_value)
        {
            out_col = get_color_and_opacity_for_data_value(data_value);
            break;
        }

        sampling_pos += ray_increment;
        inside_volume = inside_volume_bounds(sampling_pos);
    }
#if ENABLE_EMPTY_SPACE_SKIPPING
    // TODO: implement empty space skipping here
#endif

#endif

    FragColor = out_col;
}
