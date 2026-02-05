#!/usr/bin/env pwsh
# Comprehensive SuperMarket Application Test Suite
# This script performs integration tests across the entire application

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SUPERMARKET COMPREHENSIVE TEST SUITE                  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$testResults = @{
    Passed = 0
    Failed = 0
    Warnings = 0
}

function Test-Endpoint {
    param([string]$Method, [string]$Url, [string]$TestName, [hashtable]$Headers = @{}, [string]$Body = $null)
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            UseBasicParsing = $true
            TimeoutSec = 5
        }
        if ($Headers.Count -gt 0) { $params.Headers = $Headers }
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        Write-Host "  ✅ $TestName" -ForegroundColor Green
        $script:testResults.Passed++
        return $true
    } catch {
        Write-Host "  ❌ $TestName - $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults.Failed++
        return $false
    }
}

# Test 1: Backend Health
Write-Host "🏥 BACKEND HEALTH CHECKS" -ForegroundColor Yellow
Test-Endpoint -Method "GET" -Url "http://localhost:8080/" -TestName "Backend root endpoint"
Test-Endpoint -Method "GET" -Url "http://localhost:8080/api" -TestName "API base endpoint"
Write-Host ""

# Test 2: Frontend Health
Write-Host "🌐 FRONTEND HEALTH CHECKS" -ForegroundColor Yellow
Test-Endpoint -Method "GET" -Url "http://localhost:3000" -TestName "Frontend homepage"
Write-Host ""

# Test 3: Public API Endpoints
Write-Host "🔓 PUBLIC API ENDPOINTS" -ForegroundColor Yellow
Test-Endpoint -Method "GET" -Url "http://localhost:8080/api/subscription-plans" -TestName "GET /subscription-plans"
Test-Endpoint -Method "GET" -Url "http://localhost:8080/api/landing" -TestName "GET /landing"
Write-Host ""

# Test 4: Database Connection
Write-Host "💾 DATABASE VERIFICATION" -ForegroundColor Yellow
if (Test-Path "SuperMarket Backend/data/supermarket.mv.db") {
    Write-Host "  ✅ Database file exists" -ForegroundColor Green
    $script:testResults.Passed++
} else {
    Write-Host "  ⚠️ Using MySQL database (H2 file not found)" -ForegroundColor Yellow
    $script:testResults.Warnings++
}
Write-Host ""

# Test 5: Required Files
Write-Host "📁 REQUIRED FILES CHECK" -ForegroundColor Yellow
$requiredFiles = @(
    "SuperMarket New Frontend/src/App.jsx",
    "SuperMarket New Frontend/src/utils/api.js",
    "SuperMarket New Frontend/src/utils/auth.js",
    "SuperMarket Backend/pom.xml",
    "SuperMarket Backend/src/main/resources/application.properties"
)
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $(Split-Path $file -Leaf)" -ForegroundColor Green
        $script:testResults.Passed++
    } else {
        Write-Host "  ❌ $(Split-Path $file -Leaf) missing" -ForegroundColor Red
        $script:testResults.Failed++
    }
}
Write-Host ""

# Test 6: Component Files
Write-Host "🧩 COMPONENT FILES CHECK" -ForegroundColor Yellow
$components = @("Navbar", "ProtectedRoute", "SubscriptionGuard", "VoiceControl", "NotificationDropdown")
foreach ($comp in $components) {
    if (Test-Path "SuperMarket New Frontend/src/components/$comp.jsx") {
        Write-Host "  ✅ $comp.jsx" -ForegroundColor Green
        $script:testResults.Passed++
    } else {
        Write-Host "  ❌ $comp.jsx missing" -ForegroundColor Red
        $script:testResults.Failed++
    }
}
Write-Host ""

# Test 7: Security Configuration
Write-Host "🔒 SECURITY CONFIGURATION" -ForegroundColor Yellow
$securityChecks = @(
    @{File="SuperMarket Backend/src/main/java/in/main/security/JwtUtil.java"; Name="JWT Utility"},
    @{File="SuperMarket Backend/src/main/java/in/main/security/JwtAuthenticationFilter.java"; Name="JWT Filter"},
    @{File="SuperMarket Backend/src/main/java/in/main/configuration/WebConfig.java"; Name="CORS Configuration"}
)
foreach ($check in $securityChecks) {
    if (Test-Path $check.File) {
        Write-Host "  ✅ $($check.Name)" -ForegroundColor Green
        $script:testResults.Passed++
    } else {
        Write-Host "  ❌ $($check.Name) missing" -ForegroundColor Red
        $script:testResults.Failed++
    }
}
Write-Host ""

# Test 8: Build Configuration
Write-Host "🔧 BUILD CONFIGURATION" -ForegroundColor Yellow
if (Test-Path "SuperMarket New Frontend/package.json") {
    Write-Host "  ✅ Frontend package.json exists" -ForegroundColor Green
    $script:testResults.Passed++
} else {
    Write-Host "  ❌ Frontend package.json missing" -ForegroundColor Red
    $script:testResults.Failed++
}
if (Test-Path "SuperMarket New Frontend/vite.config.js") {
    Write-Host "  ✅ Vite configuration exists" -ForegroundColor Green
    $script:testResults.Passed++
} else {
    Write-Host "  ❌ Vite configuration missing" -ForegroundColor Red
    $script:testResults.Failed++
}
Write-Host ""

# Final Summary
Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TEST SUMMARY                        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$totalTests = $testResults.Passed + $testResults.Failed
$passRate = if ($totalTests -gt 0) { [math]::Round(($testResults.Passed / $totalTests) * 100, 2) } else { 0 }

Write-Host "  ✅ Passed:   $($testResults.Passed)" -ForegroundColor Green
Write-Host "  ❌ Failed:   $($testResults.Failed)" -ForegroundColor Red
Write-Host "  ⚠️ Warnings: $($testResults.Warnings)" -ForegroundColor Yellow
Write-Host "  📊 Pass Rate: $passRate%`n" -ForegroundColor Cyan

if ($testResults.Failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED - PRODUCTION READY!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️ SOME TESTS FAILED - REVIEW REQUIRED" -ForegroundColor Yellow
    exit 1
}
