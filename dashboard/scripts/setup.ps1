# Engineer Brain Dashboard - Setup Script
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup.ps1

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Engineer Brain Dashboard - Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
Write-Host "[1/4] Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = $null
try {
    $nodeVersion = (node --version 2>$null)
} catch {}

if (-not $nodeVersion) {
    Write-Host "  ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "  Please install Node.js 20+ from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

$versionNum = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($versionNum -lt 20) {
    Write-Host "  WARNING: Node.js $nodeVersion detected. Version 20+ recommended." -ForegroundColor Yellow
} else {
    Write-Host "  OK: Node.js $nodeVersion" -ForegroundColor Green
}

# 2. Check project config.json
Write-Host "[2/4] Checking project config.json..." -ForegroundColor Yellow
$scriptDir = Split-Path -Parent $PSScriptRoot
$projectRoot = Split-Path -Parent $scriptDir
$configFile = Join-Path $projectRoot "config.json"

if (Test-Path $configFile) {
    $cfg = Get-Content $configFile -Raw | ConvertFrom-Json
    Write-Host "  Found: $configFile" -ForegroundColor Green
    Write-Host "  casesRoot: $($cfg.casesRoot)" -ForegroundColor Green
} else {
    Write-Host "  WARNING: config.json not found at $configFile" -ForegroundColor Yellow
    Write-Host "  Creating default config.json..." -ForegroundColor Yellow
    '{ "casesRoot": "./cases", "dataRoot": "./data" }' | Out-File -FilePath $configFile -Encoding utf8
    Write-Host "  Created: $configFile" -ForegroundColor Green
}

# 3. Generate .env
Write-Host "[3/4] Generating .env file..." -ForegroundColor Yellow
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })

# Check for GitHub Copilot token
$copilotToken = $env:GITHUB_COPILOT_TOKEN
if ($copilotToken) {
    Write-Host "  Found GitHub Copilot token in environment" -ForegroundColor Green
} else {
    Write-Host "  No GitHub Copilot token found (AI features will be disabled)" -ForegroundColor Yellow
    $copilotToken = ""
}

$envContent = @"
# Engineer Brain Dashboard - Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# GitHub Copilot API token (optional, for AI analysis)
GITHUB_COPILOT_TOKEN=$copilotToken

# Auto-generated
JWT_SECRET=$jwtSecret
PORT=3001
"@

$envPath = Join-Path $scriptDir ".env"

if (Test-Path $envPath) {
    Write-Host "  .env already exists, skipping (delete it to regenerate)" -ForegroundColor Yellow
} else {
    $envContent | Out-File -FilePath $envPath -Encoding utf8
    Write-Host "  Created: $envPath" -ForegroundColor Green
}

# 4. Install dependencies
Write-Host "[4/4] Installing dependencies..." -ForegroundColor Yellow
$rootDir = Split-Path -Parent $PSScriptRoot
Push-Location $rootDir
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: npm install failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Dependencies installed" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  To start the dashboard:" -ForegroundColor White
Write-Host "    npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Then open: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
