# ========================================
# SuperMarket Application Startup Script
# ========================================

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host " SuperMarket Application Launcher"  -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting backend and frontend servers..." -ForegroundColor Yellow
Write-Host ""

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Backend directory
$backendPath = Join-Path $scriptPath "SuperMarket Backend"

# Frontend directory
$frontendPath = Join-Path $scriptPath "SuperMarket New Frontend"

# Start backend in new PowerShell window
Write-Host "[1/2] Starting Backend (Spring Boot)..." -ForegroundColor Green
$backendJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; Write-Host 'Starting Spring Boot Backend...' -ForegroundColor Cyan; .\mvnw.cmd spring-boot:run"
) -PassThru -WindowStyle Normal

Write-Host "Backend starting on http://localhost:8080" -ForegroundColor Gray
Write-Host ""

# Wait for backend to initialize
Write-Host "Waiting 8 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Start frontend in new PowerShell window
Write-Host "[2/2] Starting Frontend (React + Vite)..." -ForegroundColor Green
$frontendJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; Write-Host 'Starting React Frontend...' -ForegroundColor Cyan; npm run dev"
) -PassThru -WindowStyle Normal

Write-Host "Frontend will start on http://localhost:3000" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Both servers are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: Backend may take 20-30 seconds to fully start" -ForegroundColor Yellow
Write-Host "      Wait for 'Started TsarITApplication' message" -ForegroundColor Yellow
Write-Host ""

# Wait before opening browser
Write-Host "Waiting 15 more seconds before opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Open application in default browser
Write-Host "Opening application in browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Application launched successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To stop servers:" -ForegroundColor Yellow
Write-Host "- Close the backend PowerShell window" -ForegroundColor Gray
Write-Host "- Close the frontend PowerShell window" -ForegroundColor Gray
Write-Host "- Or press Ctrl+C in each window" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
