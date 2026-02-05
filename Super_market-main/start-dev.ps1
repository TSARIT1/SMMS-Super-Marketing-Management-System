# Starts frontend (Vite) and backend (jar or mvnw) and opens browser to http://localhost:3000
# Run this from PowerShell (ExecutionPolicy may need to allow script execution)

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$frontendDir = Join-Path $root 'SuperMarket New Frontend'
$backendDir = Join-Path $root 'SuperMarket Backend'
$frontendUrl = 'http://localhost:3000'

Write-Host "Starting frontend in $frontendDir..." -ForegroundColor Green
# Start frontend (npm run dev) if not already running
Start-Process -FilePath "npm" -ArgumentList 'run','dev' -WorkingDirectory $frontendDir -NoNewWindow -PassThru | Out-Null

Write-Host "Starting backend in $backendDir..." -ForegroundColor Green
# If packaged jar exists, run it; otherwise use mvnw spring-boot:run
$jarPath = Join-Path $backendDir 'target\SuperMarketBackend-0.0.1-SNAPSHOT.jar'
if (Test-Path $jarPath) {
    Start-Process -FilePath 'java' -ArgumentList '-jar', $jarPath, '--spring.profiles.active=local' -WorkingDirectory $backendDir -NoNewWindow -PassThru | Out-Null
} else {
    Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','mvnw.cmd -DskipTests spring-boot:run -Dspring-boot.run.profiles=local' -WorkingDirectory $backendDir -NoNewWindow -PassThru | Out-Null
}

Write-Host "Waiting for $frontendUrl to become available..." -ForegroundColor Yellow
# Wait for frontend port 3000
for ($i=0; $i -lt 60; $i++) {
    try {
        $r = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { break }
    } catch {}
    Start-Sleep -Seconds 1
}

Write-Host "Opening $frontendUrl/admin/login in default browser" -ForegroundColor Green
Start-Process "$frontendUrl/admin/login"

Write-Host "Done. Frontend: http://localhost:3000  Backend: http://localhost:8080" -ForegroundColor Cyan
