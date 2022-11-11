ExSciVis
========

Framework for Lab Class Scientific Visualization.

How To Install:
* Download Framework
* Install CMake

Windows:
* Open CMake, set Source Directory as the project root (./ExSciVis2021/) and Target Dir (./ExSciVis2021/build)
* click Configure 
* click Generate
* open generated ".sln" file in Visual Studio (location: ./ExSciVis2021/build )
* set "MyVolumeRaycaster" as StartUp project (right click in solution explorer)
* Go to the Project Properties for "MyVolumeRaycaster" and change the working dir to *${TargetDir}* (PROJECT -> PROPERTIES -> Configuration Properties -> Debugging -> Working Directory)
* Compile and run

Linux/macOS:
* create build folder (ExSciVis2021/build/)
* navigate into build folder
* run CMake from the command line ("ccmake ..")
* press 'C' to configure (you may need to do this twice)
* press 'G' to generate make files
* enter "make install" to build the app
* navigate to "ExSciVis2021/build/build/Release/"
* run the app: "./MyVolumeRaycaster"
 

GUI created with ImGui
https://github.com/ocornut/imgui