@echo off
REM Docker Container Management Script for SuperMarket Application
REM ================================================================

echo.
echo ========================================
echo  SUPERMARKET DOCKER CONTAINER MANAGER
echo ========================================
echo.

:MENU
echo.
echo Select an option:
echo.
echo [1] Start All Containers (Build + Run)
echo [2] Start All Containers (No Build)
echo [3] Stop All Containers
echo [4] Restart All Containers
echo [5] View Container Status
echo [6] View Logs (All Services)
echo [7] View Backend Logs
echo [8] View Frontend Logs
echo [9] View MySQL Logs
echo [10] Remove All Containers
echo [11] Full Clean (Remove Containers + Images + Volumes)
echo [12] Open Application in Browser
echo [0] Exit
echo.

set /p choice="Enter your choice: "

if "%choice%"=="1" goto BUILD_START
if "%choice%"=="2" goto START
if "%choice%"=="3" goto STOP
if "%choice%"=="4" goto RESTART
if "%choice%"=="5" goto STATUS
if "%choice%"=="6" goto LOGS_ALL
if "%choice%"=="7" goto LOGS_BACKEND
if "%choice%"=="8" goto LOGS_FRONTEND
if "%choice%"=="9" goto LOGS_MYSQL
if "%choice%"=="10" goto REMOVE
if "%choice%"=="11" goto CLEAN
if "%choice%"=="12" goto OPEN_BROWSER
if "%choice%"=="0" goto EXIT
goto MENU

:BUILD_START
echo.
echo [*] Building and starting all containers...
docker-compose up -d --build
echo.
echo [✓] All containers started successfully!
echo [i] Frontend: http://localhost:3000
echo [i] Backend API: http://localhost:8080
echo [i] MySQL Database: localhost:3307
timeout /t 3 >nul
goto MENU

:START
echo.
echo [*] Starting all containers...
docker-compose up -d
echo.
echo [✓] All containers started successfully!
echo [i] Frontend: http://localhost:3000
echo [i] Backend API: http://localhost:8080
timeout /t 3 >nul
goto MENU

:STOP
echo.
echo [*] Stopping all containers...
docker-compose down
echo [✓] All containers stopped successfully!
timeout /t 2 >nul
goto MENU

:RESTART
echo.
echo [*] Restarting all containers...
docker-compose restart
echo [✓] All containers restarted successfully!
timeout /t 2 >nul
goto MENU

:STATUS
echo.
echo [*] Container Status:
echo.
docker-compose ps
echo.
echo [*] Detailed Container Info:
echo.
docker ps -a --filter "name=supermarket"
echo.
pause
goto MENU

:LOGS_ALL
echo.
echo [*] Viewing logs from all services (Press Ctrl+C to exit)...
docker-compose logs -f
goto MENU

:LOGS_BACKEND
echo.
echo [*] Viewing backend logs (Press Ctrl+C to exit)...
docker-compose logs -f backend
goto MENU

:LOGS_FRONTEND
echo.
echo [*] Viewing frontend logs (Press Ctrl+C to exit)...
docker-compose logs -f frontend
goto MENU

:LOGS_MYSQL
echo.
echo [*] Viewing MySQL logs (Press Ctrl+C to exit)...
docker-compose logs -f mysql
goto MENU

:REMOVE
echo.
echo [!] WARNING: This will remove all containers but keep volumes (data preserved)
set /p confirm="Are you sure? (y/n): "
if /i not "%confirm%"=="y" goto MENU
echo [*] Removing all containers...
docker-compose down
echo [✓] All containers removed successfully!
timeout /t 2 >nul
goto MENU

:CLEAN
echo.
echo [!] WARNING: This will remove ALL containers, images, and volumes
echo [!] ALL DATA WILL BE LOST (Database, Uploads, etc.)
set /p confirm="Are you sure? Type YES to confirm: "
if /i not "%confirm%"=="YES" goto MENU
echo [*] Performing full cleanup...
docker-compose down -v --rmi all
echo [✓] Full cleanup completed!
timeout /t 2 >nul
goto MENU

:OPEN_BROWSER
echo.
echo [*] Opening application in browser...
start http://localhost:3000
timeout /t 2 >nul
goto MENU

:EXIT
echo.
echo [✓] Exiting Docker Container Manager
echo.
exit /b 0
