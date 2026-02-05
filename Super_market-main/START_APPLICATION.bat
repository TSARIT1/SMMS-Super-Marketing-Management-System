@echo off
REM ========================================
REM SuperMarket Application Startup Script
REM ========================================
echo.
echo ========================================
echo  SuperMarket Application Launcher
echo ========================================
echo.
echo Starting backend and frontend servers...
echo.

REM Change to backend directory
cd /d "%~dp0SuperMarket Backend"

REM Start backend in a new window
echo [1/2] Starting Backend (Spring Boot)...
start "SuperMarket Backend" cmd /k ".\mvnw.cmd spring-boot:run"
echo Backend starting on http://localhost:8080
echo.

REM Wait a bit for backend to initialize
echo Waiting 5 seconds before starting frontend...
timeout /t 5 /nobreak >nul

REM Change to frontend directory
cd /d "%~dp0SuperMarket New Frontend"

REM Start frontend in a new window
echo [2/2] Starting Frontend (React + Vite)...
start "SuperMarket Frontend" cmd /k "npm run dev"
echo Frontend will start on http://localhost:3000
echo.

echo ========================================
echo  Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo NOTE: Backend may take 20-30 seconds to fully start
echo       Wait for "Started TsarITApplication" message
echo.
echo Press any key to open application in browser...
pause >nul

REM Open application in default browser after user confirmation
start http://localhost:3000

echo.
echo Application opened in browser!
echo.
echo To stop servers:
echo - Close the "SuperMarket Backend" window
echo - Close the "SuperMarket Frontend" window
echo - Or press Ctrl+C in each window
echo.
pause
