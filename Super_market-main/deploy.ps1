# Super Market Docker Deployment Script (PowerShell)
# This script builds and deploys the entire Super Market application using Docker

$ErrorActionPreference = "Stop"

Write-Host "🚀 Super Market - Docker Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Navigate to script directory
Set-Location $PSScriptRoot

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created. Please review and update if needed." -ForegroundColor Green
}

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#].+?)=(.+)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "env:$name" -Value $value
    }
}

Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "   - MySQL Database: $env:MYSQL_DATABASE"
Write-Host "   - Backend Port: $env:BACKEND_PORT"
Write-Host "   - Frontend Port: $env:FRONTEND_PORT"
Write-Host ""

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Build images
Write-Host ""
Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
docker-compose build --no-cache

# Start services
Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose up -d

# Wait for services to be healthy
Write-Host ""
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

# Check MySQL health
Write-Host ""
Write-Host "🔍 Checking MySQL..." -ForegroundColor Cyan
$timeout = 60
$counter = 0
while ($counter -lt $timeout) {
    try {
        docker-compose exec -T mysql mysqladmin ping -h localhost -uroot -p"$env:MYSQL_ROOT_PASSWORD" --silent 2>&1 | Out-Null
        Write-Host "✅ MySQL is healthy" -ForegroundColor Green
        break
    } catch {
        $counter++
        Write-Host "⏳ Waiting for MySQL... ($counter/$timeout)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        if ($counter -eq $timeout) {
            Write-Host "❌ MySQL failed to start within $timeout seconds" -ForegroundColor Red
            docker-compose logs mysql
            exit 1
        }
    }
}

# Check Backend health
Write-Host ""
Write-Host "🔍 Checking Backend..." -ForegroundColor Cyan
$timeout = 120
$counter = 0
while ($counter -lt $timeout) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$env:BACKEND_PORT/actuator/health" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend is healthy" -ForegroundColor Green
            break
        }
    } catch {
        $counter++
        Write-Host "⏳ Waiting for Backend... ($counter/$timeout)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        if ($counter -eq $timeout) {
            Write-Host "❌ Backend failed to start within $timeout seconds" -ForegroundColor Red
            docker-compose logs backend
            exit 1
        }
    }
}

# Check Frontend health
Write-Host ""
Write-Host "🔍 Checking Frontend..." -ForegroundColor Cyan
$timeout = 30
$counter = 0
while ($counter -lt $timeout) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$env:FRONTEND_PORT/health" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend is healthy" -ForegroundColor Green
            break
        }
    } catch {
        $counter++
        Write-Host "⏳ Waiting for Frontend... ($counter/$timeout)" -ForegroundColor Yellow
        Start-Sleep -Seconds 1
        if ($counter -eq $timeout) {
            Write-Host "❌ Frontend failed to start within $timeout seconds" -ForegroundColor Red
            docker-compose logs frontend
            exit 1
        }
    }
}

# Display final status
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Super Market Application Deployed Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access URLs:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:$env:FRONTEND_PORT"
Write-Host "   - Backend API: http://localhost:$env:BACKEND_PORT"
Write-Host "   - MySQL: localhost:$env:MYSQL_PORT"
Write-Host ""
Write-Host "🔐 Default Super Admin Credentials:" -ForegroundColor Cyan
Write-Host "   - Email: superadmin@tsar.com"
Write-Host "   - Password: SuperAdmin@123"
Write-Host ""
Write-Host "📊 Useful Commands:" -ForegroundColor Cyan
Write-Host "   - View logs: docker-compose logs -f"
Write-Host "   - Stop: docker-compose stop"
Write-Host "   - Restart: docker-compose restart"
Write-Host "   - Remove: docker-compose down"
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
