@echo off
echo Starting ArchPortal...
echo.

:: Start backend
start "ArchPortal Backend" cmd /k "cd /d %~dp0backend && node server.js"

:: Wait a moment then start frontend
timeout /t 2 /nobreak > nul
start "ArchPortal Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ArchPortal is starting...
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo.
pause
