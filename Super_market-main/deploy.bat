@echo off
REM Super Market Docker Deployment - Windows Batch Script
REM For systems without PowerShell script execution enabled

echo.
echo ========================================
echo   Super Market - Docker Deployment
echo ========================================
echo.

REM Check Docker installation
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Docker is installed

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed
    pause
    exit /b 1
)

echo [OK] Docker Compose is installed
echo.

REM Navigate to script directory
cd /d "%~dp0"

REM Check .env file
if not exist .env (
    echo [WARNING] .env file not found. Creating from .env.example...
    copy .env.example .env
    echo [OK] .env file created
    echo.
)

REM Stop existing containers
echo [INFO] Stopping existing containers...
docker-compose down
echo.

REM Build images
echo [INFO] Building Docker images...
echo This may take 5-10 minutes on first build...
docker-compose build --no-cache
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
echo.

REM Start services
echo [INFO] Starting services...
docker-compose up -d
echo.

REM Wait for services
echo [INFO] Waiting for services to start...
timeout /t 15 /nobreak >nul
echo.

REM Check service status
echo [INFO] Service Status:
docker-compose ps
echo.

REM Wait for MySQL
echo [INFO] Waiting for MySQL to be ready...
timeout /t 30 /nobreak >nul
echo.

REM Wait for Backend
echo [INFO] Waiting for Backend to be ready...
timeout /t 60 /nobreak >nul
echo.

REM Display access information
echo ========================================
echo  DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:8080
echo  MySQL:    localhost:3307
echo.
echo  Super Admin Credentials:
echo    Email: superadmin@tsar.com
echo    Password: SuperAdmin@123
echo.
echo  Useful Commands:
echo    View logs:    docker-compose logs -f
echo    Stop:         docker-compose stop
echo    Restart:      docker-compose restart
echo    Remove:       docker-compose down
echo.
echo ========================================
echo.

pause
