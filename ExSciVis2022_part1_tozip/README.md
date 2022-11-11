# Scientific Visualization Lab Class 
Exercise Framework Setup

This document will help you to build and run the applications that you will use to complete the assignments for the SciVis part of the Visualization course. Note that the instructions differ depending on your operating system. 

For a demonstration of the build process, see the accompanying video clips.

## Download
Download the assignment framework as a .zip file from the moodle page. Extract to your chosen location.
Prerequisites
In order to build the applications, a C++ compiler is required. If you have not programmed using C++ before, then you may need to install a compiler. We will also use the CMake build tool. Operating system specific instructions are below.

### Windows
Install Microsoft Visual Studio. The free Community version can be downloaded from https://visualstudio.microsoft.com/downloads/. When the installer prompts you to choose ‘Workloads’, choose Desktop development with C++.
Download CMake from https://cmake.org/download/ 


### MacOS
The built in compiler should be sufficient.
Download CMake from https://cmake.org/download/ . To enable calling CMake from within a terminal window, enter:

    $ PATH="/Applications/CMake.app/Contents/bin":"$PATH"

### Linux
Install the build-essentials package, which contains g++, a C++ compiler. In the terminal, enter:

$ sudo apt install build-essential

Download CMake from https://cmake.org/download/, from Ubuntu Software, or install using a package manager such as apt or snappy



## Building and Running the Applications
We will use CMake to build the applications and the libraries included in the framework.

### Windows
 * Open CMake GUI
 * In the first input field, labeled ‘where is the source code’, browse to the root directory of the framework (the directory should contain the file CMakeLists.txt)
 * In the second input field, labeled ‘where to build the binaries’, copy the input from the first field and add ‘/build’ to the end of the path
 * Click ‘Configure’
 * If prompted, click ‘Yes’ to confirm that a new build directory should be created
 * Specify your preferred Visual Studio version, and click ‘Finish’
 * Click ‘Generate’
 * Click ‘Open Project’ to open the project in Visual Studio. Alternatively, one can open the ‘.sln’ file generated inside the build folder
 * To prepare an application for running:
 * Right-click on the application name in the Solution Explorer (e.g. ray_casting) and select ‘Set as Startup Project’
 * Right-click again on the application name in the Solution Explorer and select ‘Properties’
 * In the Properties dialog, select the ‘Debugging’ tab on the left, and change the ‘Working Directory’ to $(TargetDir)
 * Run the application by clicking the run symbol (green triangle in the toolbar).

### MacOS and Linux

 * Open a terminal inside the root directory of the assignment framework, ExSciVis202X_partX
 * Create a build directory, in which the applications will be built, and navigate into the directory: 

$ mkdir build
$ cd build

 * Run CMake [note the two dots, to tell CMake that the build script is in the parent directory]:

$ ccmake .. 

 * Press ‘C’ to configure CMake (you need to do this twice when the framework is built for the first time).
 * Press ‘G’ to generate the makefiles. After this, the terminal interface of CMake will disappear.
 * Build the applications by entering:

    $ make install

 * To be able to run the applications, we need to navigate to the directory where the binaries are located:

    $ cd build/Release

 * Start the applications by entering ./<name_of_application>, for example:

    $ ./ray_tracing



## Troubleshooting

If you have any issues:
 * Please make sure you are in the correct directory when executing commands in the terminal (Mac & Linux)
 * Please make sure you have selected the correct directories in CMake GUI (Windows)

Getting Help:
 * Ask your colleagues
 * Contact tutors through the Moodle forum
 * Search online with error text 


GUI created with ImGui
https://github.com/ocornut/imgui
