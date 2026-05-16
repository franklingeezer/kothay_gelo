@echo off
echo Copying app icons...
xcopy /E /I /Y "android-icons\res" "android\app\src\main\res"
echo Done! Icons copied successfully.
pause
