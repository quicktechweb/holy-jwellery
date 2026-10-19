@echo off
cd /d "%~dp0"
echo === Production mode: shobcheye druto (click korle instant) ===
echo Prothombar build hote ektu shomoy lagbe.
echo.
call npm run build
if errorlevel 1 pause & exit /b 1
call npm run start
pause
