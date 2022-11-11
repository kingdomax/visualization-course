file(GLOB_RECURSE FRAMEWORK_SHADER_VERTEX RELATIVE ${CMAKE_CURRENT_SOURCE_DIR} *.vert)
file(GLOB_RECURSE FRAMEWORK_SHADER_FRAGME RELATIVE ${CMAKE_CURRENT_SOURCE_DIR} *.frag)

add_executable(ray_casting ray_casting.cpp
              ${FRAMEWORK_SHADER_VERTEX}
              ${FRAMEWORK_SHADER_FRAGME})


target_link_libraries(ray_casting ${FRAMEWORK_NAME} ${BINARY_FILES})
add_dependencies(ray_casting glfw ${FRAMEWORK_NAME} ${COPY_BINARY})

