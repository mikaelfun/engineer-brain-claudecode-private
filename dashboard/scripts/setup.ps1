# Engineer Brain Dashboard - Setup Script
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup.ps1

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Engineer Brain Dashboard - Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
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

# 2. Detect OpenClaw workspace
Write-Host "[2/5] Detecting OpenClaw workspace..." -ForegroundColor Yellow
$openclawRoot = "$env:USERPROFILE\.openclaw"
$workspace = "$openclawRoot\workspace"

if (Test-Path $workspace) {
    Write-Host "  Found: $workspace" -ForegroundColor Green
} else {
    Write-Host "  WARNING: OpenClaw workspace not found at $workspace" -ForegroundColor Yellow
    Write-Host "  You'll need to set OPENCLAW_WORKSPACE in .env manually" -ForegroundColor Yellow
    $workspace = ""
}

# 3. Check for GitHub Copilot token
Write-Host "[3/5] Checking GitHub Copilot token..." -ForegroundColor Yellow
$copilotToken = $env:GITHUB_COPILOT_TOKEN
if ($copilotToken) {
    Write-Host "  Found token in environment" -ForegroundColor Green
} else {
    Write-Host "  No token found (AI features will be disabled)" -ForegroundColor Yellow
    Write-Host "  Set GITHUB_COPILOT_TOKEN in .env to enable AI analysis" -ForegroundColor Yellow
    $copilotToken = ""
}

# 4. Generate .env
Write-Host "[4/5] Generating .env file..." -ForegroundColor Yellow
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })

$envContent = @"
# Engineer Brain Dashboard - Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# OpenClaw workspace path
OPENCLAW_WORKSPACE=$workspace
OPENCLAW_ROOT=$openclawRoot

# GitHub Copilot API token (optional, for AI analysis)
GITHUB_COPILOT_TOKEN=$copilotToken

# Auto-generated
JWT_SECRET=$jwtSecret
PORT=3001
"@

$scriptDir = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $scriptDir ".env"

if (Test-Path $envPath) {
    Write-Host "  .env already exists, skipping (delete it to regenerate)" -ForegroundColor Yellow
} else {
    $envContent | Out-File -FilePath $envPath -Encoding utf8
    Write-Host "  Created: $envPath" -ForegroundColor Green
}

# 5. Install dependencies
Write-Host "[5/5] Installing dependencies..." -ForegroundColor Yellow
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
