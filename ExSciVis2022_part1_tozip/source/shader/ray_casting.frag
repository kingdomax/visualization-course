#version 150
#extension GL_ARB_explicit_attrib_location : require

#define TASK 00
#define ENABLE_LIGHTING 0
#define ENABLE_BINARY_SEARCH 0


// input 'varyings': can be different for each fragment ----------------------------

in vec3 ray_entry_position;

// input 'uniforms': same for all fragments ----------------------------

uniform mat4 Modelview;

uniform sampler3D volume_texture;
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

const float light_ambient_reflection_constant = 0.4f;
const float light_diffuse_reflection_constant = 0.8f;
const float light_specular_reflection_constant = 0.8f;
uniform float light_shininess;

// output: colour of this fragment ----------------------------

layout(location = 0) out vec4 FragColor;

// helper functions ----------------------------

// INPUT: sampling position
// OUTPUT: true if given position is inside the volume, false otherwise
bool inside_volume_bounds(const in vec3 sampling_position)
{
	return (all(greaterThanEqual(sampling_position, vec3(0.0))) && all(lessThanEqual(sampling_position, max_bounds)));
}

// INPUT: sampling position
// OUTPUT: the trilinearly-interpolated data value from the volume at the given position
float sample_data_volume(vec3 in_sampling_pos)
{
	vec3 obj_to_tex = vec3(1.0) / max_bounds;
	return texture(volume_texture, in_sampling_pos * obj_to_tex).r;
}

// INPUT: sampling position in volume space
// OUTPUT: gradient at given sampling position
vec3 calculate_gradient(vec3 in_sampling_pos)
{
	// Dx = ( f(x+1, y, z) - f(x-1, y, z) ) / 2
	vec3 diff = vec3(in_sampling_pos.x+1, in_sampling_pos.y + 1, in_sampling_pos.z + 1) - vec3(in_sampling_pos.x -1, in_sampling_pos.y - 1, in_sampling_pos.z - 1);
	return diff/2;
}

void main()
{
	vec4 out_col = vec4(0.0, 0.0, 0.0, 0.0); // Init color of fragment

	vec3 ray_direction = normalize(ray_entry_position - camera_location);
	vec3 ray_increment = ray_direction * sampling_distance; // One step through the volume
	vec3 sampling_pos  = ray_entry_position + ray_increment; // Current position in volume, small increment just to be sure we are in the volume

	// check that we are inside volume
	bool inside_volume = inside_volume_bounds(sampling_pos);
	if (!inside_volume)
		discard;

// example - average intensity projection
#if TASK == 0 
	vec4  sum_intensity = vec4(0.f);
	float num_samples = 0.f;

	// the traversal loop
	// termination when the sampling position is outside volume boundary
	while (inside_volume) 
	{      
		// sample data value from volume at sampling point
		float data_value = sample_data_volume(sampling_pos);

		// convert data value to an intensity value
		vec4 intensity = vec4(data_value, data_value, data_value, 1.f);

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
		out_col = sum_intensity / num_samples;
	} else {
		out_col = vec4(0.f);
	}
#endif

// maximum intensity projection
#if TASK == 12 
	float max_intensity = 0.f;

	while (inside_volume) 
	{      
		float data_value = sample_data_volume(sampling_pos);

		if (data_value > max_intensity)
		{
			max_intensity = data_value;
		}

		sampling_pos += ray_increment;
		inside_volume = inside_volume_bounds(sampling_pos);
	}

	out_col = vec4(max_intensity, max_intensity, max_intensity, 1.f);
#endif

// first-hit iso-surface raycasting
#if TASK == 13 

	float data_value = 0f;
	bool found_first_hit = false;
	float first_hit_intensity = 0f;

	while (inside_volume && !found_first_hit)
	{      
		data_value = sample_data_volume(sampling_pos);

		if (data_value >= iso_value)
		{
			found_first_hit = true;	
			first_hit_intensity = light_ambient_reflection_constant;
		}

		if (!found_first_hit)
        {
			sampling_pos += ray_increment;
			inside_volume = inside_volume_bounds(sampling_pos);
		}
	}
	
	vec4 final_col = vec4(first_hit_intensity, first_hit_intensity, first_hit_intensity, 1.f);

	#if ENABLE_BINARY_SEARCH
		//1.Set initial upper and lower bounds
		vec3 lower_bound = sampling_pos - ray_increment;
		vec3 upper_bound = sampling_pos;
		vec3 mid_point = vec3(0f, 0f, 0f);
		int max_iteration = 10;

		//2. Find midpoint between lower and upper bounds and sample data value
		while (data_value != iso_value && max_iteration != 0)
		{
			mid_point = vec3((lower_bound.x + upper_bound.x) / 2, (lower_bound.y + upper_bound.y) / 2, (lower_bound.z + upper_bound.z) / 2);
			data_value = sample_data_volume(mid_point);
			max_iteration--;

			if (data_value < iso_value) // If data value at midpoint is less than iso value, set lower bound to midpoint
			{
				lower_bound = mid_point;
			} 
			else if (data_value > iso_value) // If data value at midpoint is greater than iso value, set upper bound to midpoint
			{
				upper_bound = mid_point;
			}
		}

		sampling_pos = mid_point;
	#endif

	#if ENABLE_LIGHTING
		// prepare
		vec3 camera_view = normalize(camera_location);
		vec3 light_direction = normalize(light_position);
		vec3 normal_vector = normalize(calculate_gradient(sampling_pos));

		// ambient comp
		vec3 ambient_color = light_ambient_color * light_ambient_reflection_constant;
		vec4 ambient_color_4 = vec4(ambient_color.x, ambient_color.y, ambient_color.z, 1.f);

		// diffuse comp
		float n_dot_l = max(0, dot(normal_vector, light_direction));
		vec3 diffuse_color = (light_diffuse_color * light_diffuse_reflection_constant) * n_dot_l;
		vec4 diffuse_color_4 = vec4(diffuse_color.x, diffuse_color.y, diffuse_color.z, 1.f);

		// specular comp
		vec3 r_vector = normalize(light_direction + camera_view);
		float n_dot_r = max(0, dot(normal_vector, r_vector));
		float specular_intensity = pow(n_dot_r, light_shininess);
		vec3 specular_color = (light_specular_color * light_specular_reflection_constant) * specular_intensity;
		vec4 specular_color_4 = vec4(specular_color.x, specular_color.y, specular_color.z, 1.f);

		// (ambient + diffuse + specular) * object_colour
		final_col = (ambient_color_4 + diffuse_color_4 + specular_color_4) * vec4(data_value, data_value, data_value, 1.f);
	#endif

	out_col = final_col;
#endif

	FragColor = out_col; // return the calculated color value
}
