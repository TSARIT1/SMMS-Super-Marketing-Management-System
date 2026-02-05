@echo off
REM SUPERMARKET POS - ULTRA-FAST BILLING
REM Quick Start Script for Windows

echo.
echo ====================================
echo   SUPERMARKET POS - FAST BILLING
echo ====================================
echo.

REM Kill existing processes
echo Cleaning up old processes...
powershell -Command "Get-Process java, node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1
timeout /t 3 /nobreak

REM Start Backend
cd /d "d:\SuperMarket Project\SuperMarket\Super_market-main\SuperMarket Backend"
echo Starting Backend (Port 8080)...
start "SuperMarket Backend" cmd /k "java -jar target/SuperMarketBackend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev"
timeout /t 8 /nobreak

REM Start Frontend
cd /d "d:\SuperMarket Project\SuperMarket\Super_market-main\SuperMarket New Frontend"
echo Starting Frontend (Port 3000)...
start "SuperMarket Frontend" cmd /k "npm run dev -- --port 3000"
timeout /t 5 /nobreak

REM Open browser
echo.
echo ✅ Services Started!
echo.
echo 🌐 Opening Browser...
timeout /t 3 /nobreak
start "" "http://localhost:3000/cart"

echo.
echo ====================================
echo   SUPERMARKET POS IS RUNNING
echo ====================================
echo.
echo 🛒 Cart: http://localhost:3000/cart
echo 💳 Backend: http://localhost:8080
echo.
echo ⚡ Print Receipt: INSTANT (<0.5 seconds)
echo 📄 Download PDF: FAST (1-2 seconds)
echo.
echo Happy Billing! 
echo.
pause
