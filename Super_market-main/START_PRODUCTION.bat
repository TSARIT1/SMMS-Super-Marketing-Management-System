@echo off
echo ========================================
echo  SuperMarket - Production Quick Start
echo ========================================
echo.

echo [1/3] Stopping old services...
powershell -Command "Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"
timeout /t 2 /nobreak >nul

echo [2/3] Starting Backend Server (Port 8080)...
cd "SuperMarket Backend"
start "SuperMarket Backend" cmd /k "java -jar target/SuperMarketBackend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev"
cd ..
timeout /t 8 /nobreak >nul

echo [3/3] Starting Frontend Server (Port 3000)...
cd "SuperMarket New Frontend"
start "SuperMarket Frontend" cmd /k "npm run dev"
cd ..

timeout /t 3 /nobreak >nul
echo.
echo ========================================
echo  SERVERS STARTED SUCCESSFULLY!
echo ========================================
echo  Backend:  http://localhost:8080
echo  Frontend: http://localhost:3000
echo ========================================
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
