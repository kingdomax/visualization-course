#ifndef UTILS_HPP
#define UTILS_HPP

// -----------------------------------------------------------------------------
// Copyright  : (C) 2014 Andreas-C. Bernstein
// License    : MIT (see the file LICENSE)
// Maintainer : Andreas-C. Bernstein <andreas.bernstein@uni-weimar.de>
// Stability  : experimental
//
// utils
// -----------------------------------------------------------------------------

#include <GL/glew.h>
#ifdef __APPLE__
# define __gl3_h_
# define GL_DO_NOT_WARN_IF_MULTI_GL_VERSION_HEADERS_INCLUDED
#include <OpenGL/gl3.h>
#else
#include <GL/gl.h>
#endif

#include <glm/glm.hpp>


#include <string>
#include <fstream>
#include <streambuf>
#include <cerrno>
#include <iostream>

// Read a small text file.
inline std::string readFile(std::string const& file)
{
  std::ifstream in(file.c_str());
  if (in) {
    std::string str((std::istreambuf_iterator<char>(in)),
                         std::istreambuf_iterator<char>());
    return str;
  }
  throw (errno);
}


glm::uvec3 get_3d_index(uint32_t singleIndex, const glm::uvec3& gridRes);

uint32_t get_1d_index(const glm::uvec3& multiIndex, const glm::uvec3& gridRes);

GLuint loadShader(GLenum type, std::string const& s);
GLuint createProgram(std::string const& v, std::string const& f);
GLuint updateTexture2D(unsigned const texture_id, unsigned const& width, unsigned const& height,
    const char* data);
GLuint createTexture2D(unsigned const& width, unsigned const& height,
    const char* data);
GLuint createTexture3D(unsigned const& width, unsigned const& height,
    unsigned const& depth, unsigned const channel_size,
    unsigned const channel_count, const char* data);
#endif // #ifndef UTILS_HPP
