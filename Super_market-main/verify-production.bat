@echo off
REM ================================================
REM SuperMarket Production Verification Script
REM ================================================
REM This script verifies that all production requirements are met

setlocal enabledelayedexpansion
cls

echo.
echo ================================================
echo  SuperMarket Production Verification Script
echo ================================================
echo.

set /a PASS=0
set /a FAIL=0

REM ================================================
REM 1. Check Docker Installation
REM ================================================
echo [1/10] Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Docker is installed
    set /a PASS+=1
) else (
    echo ✗ Docker is NOT installed - Install Docker Desktop
    set /a FAIL+=1
)

REM ================================================
REM 2. Check Docker Compose
REM ================================================
echo [2/10] Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Docker Compose is installed
    set /a PASS+=1
) else (
    echo ✗ Docker Compose is NOT installed
    set /a FAIL+=1
)

REM ================================================
REM 3. Check .env file exists
REM ================================================
echo [3/10] Checking .env configuration file...
if exist ".env" (
    echo ✓ .env file exists
    set /a PASS+=1
) else (
    echo ✗ .env file NOT found - Copy from .env.example
    set /a FAIL+=1
)

REM ================================================
REM 4. Check Required Files
REM ================================================
echo [4/10] Checking required configuration files...
if exist "docker-compose.yml" (
    echo ✓ docker-compose.yml found
    set /a PASS+=1
) else (
    echo ✗ docker-compose.yml NOT found
    set /a FAIL+=1
)

REM ================================================
REM 5. Check Dockerfile
REM ================================================
echo [5/10] Checking Dockerfile...
if exist "SuperMarket Backend\Dockerfile" (
    echo ✓ Backend Dockerfile found
    set /a PASS+=1
) else (
    echo ✗ Backend Dockerfile NOT found
    set /a FAIL+=1
)

if exist "SuperMarket New Frontend\Dockerfile" (
    echo ✓ Frontend Dockerfile found
    set /a PASS+=1
) else (
    echo ✗ Frontend Dockerfile NOT found
    set /a FAIL+=1
)

REM ================================================
REM 6. Check Available Disk Space
REM ================================================
echo [6/10] Checking available disk space...
for /f "tokens=3" %%A in ('dir /-c ^| find "bytes free"') do set DISK_FREE=%%A
if defined DISK_FREE (
    REM Check if we have at least 1GB (1000000000 bytes)
    if %DISK_FREE% gtr 1000000000 (
        echo ✓ Sufficient disk space available
        set /a PASS+=1
    ) else (
        echo ✗ Low disk space - at least 10GB recommended
        set /a FAIL+=1
    )
) else (
    echo ? Could not determine disk space
)

REM ================================================
REM 7. Check Ports Available
REM ================================================
echo [7/10] Checking ports availability...
echo Checking port 3000 (Frontend)...
netstat -ano | find ":3000" >nul 2>&1
if %errorlevel% neq 0 (
    echo ✓ Port 3000 is available
    set /a PASS+=1
) else (
    echo ✗ Port 3000 is already in use
    set /a FAIL+=1
)

echo Checking port 8080 (Backend)...
netstat -ano | find ":8080" >nul 2>&1
if %errorlevel% neq 0 (
    echo ✓ Port 8080 is available
    set /a PASS+=1
) else (
    echo ✗ Port 8080 is already in use
    set /a FAIL+=1
)

echo Checking port 3307 (MySQL)...
netstat -ano | find ":3307" >nul 2>&1
if %errorlevel% neq 0 (
    echo ✓ Port 3307 is available
    set /a PASS+=1
) else (
    echo ✗ Port 3307 is already in use
    set /a FAIL+=1
)

REM ================================================
REM 8. Check Environment Variables Security
REM ================================================
echo [8/10] Checking environment variables...
for /f "tokens=*" %%a in ('findstr "JWT_SECRET" .env 2^>nul') do set JWT_LINE=%%a
if defined JWT_LINE (
    echo ✓ JWT_SECRET is configured
    set /a PASS+=1
) else (
    echo ✗ JWT_SECRET not found in .env
    set /a FAIL+=1
)

REM Check if passwords are not default (basic check)
findstr "SuperMarket@2026" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠ WARNING: Default passwords found in .env
    set /a FAIL+=1
) else (
    echo ✓ Passwords appear to be customized
    set /a PASS+=1
)

REM ================================================
REM 9. Check Git Ignore
REM ================================================
echo [9/10] Checking .gitignore for sensitive files...
if exist ".gitignore" (
    findstr ".env" .gitignore >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ .env is in .gitignore
        set /a PASS+=1
    ) else (
        echo ✗ .env is NOT in .gitignore - add it!
        set /a FAIL+=1
    )
) else (
    echo ⚠ No .gitignore found
)

REM ================================================
REM 10. Check Documentation
REM ================================================
echo [10/10] Checking documentation...
if exist "PRODUCTION_READY.md" (
    echo ✓ Production guide found
    set /a PASS+=1
) else (
    echo ✗ PRODUCTION_READY.md NOT found
    set /a FAIL+=1
)

REM ================================================
REM Summary
REM ================================================
echo.
echo ================================================
echo  VERIFICATION SUMMARY
echo ================================================
echo Passed: %PASS%
echo Failed: %FAIL%
echo.

if %FAIL% equ 0 (
    echo ✓ All checks passed! Ready for production deployment.
    echo.
    echo Next steps:
    echo 1. Review .env settings
    echo 2. Run: docker-compose up -d
    echo 3. Access: http://localhost:3000
    echo.
    pause
    exit /b 0
) else (
    echo ✗ Some checks failed. Fix the issues above before deploying.
    echo.
    echo Common fixes:
    echo - Install Docker Desktop from https://www.docker.com/products/docker-desktop
    echo - Free up ports: netstat -ano ^| findstr ":PORT"
    echo - Copy and update .env file
    echo.
    pause
    exit /b 1
)
