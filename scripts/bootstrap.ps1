# Engineer Brain — Full Bootstrap Script
# One-click setup for new machines / fresh clones.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/bootstrap.ps1

param(
    [switch]$SkipAgency,       # Skip Agency CLI install (if already installed)
    [switch]$SkipLocalRag,     # Skip local-rag MCP setup
    [switch]$SkipDashboard,    # Skip dashboard npm install
    [switch]$NonInteractive    # Don't prompt, use defaults / env vars
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Engineer Brain — Full Bootstrap" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot

# ═══════════════════════════════════════════════════
# Step 1: Prerequisites
# ═══════════════════════════════════════════════════
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

# Node.js
$nodeVersion = $null
try { $nodeVersion = (node --version 2>$null) } catch {}
if (-not $nodeVersion) {
    Write-Host "  ERROR: Node.js not found. Install from https://nodejs.org/ (v20+)" -ForegroundColor Red
    exit 1
}
$versionNum = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($versionNum -lt 20) {
    Write-Host "  WARNING: Node.js $nodeVersion detected, 20+ recommended" -ForegroundColor Yellow
} else {
    Write-Host "  OK Node.js $nodeVersion" -ForegroundColor Green
}

# Git
try {
    $gitVer = git --version 2>$null
    Write-Host "  OK $gitVer" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: git not found" -ForegroundColor Yellow
}

# Edge browser (for Playwright MCP)
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
}
if (Test-Path $edgePath) {
    Write-Host "  OK Microsoft Edge found" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Edge not found (Playwright MCP needs msedge)" -ForegroundColor Yellow
}

# ═══════════════════════════════════════════════════
# Step 2: Agency CLI (ICM/Teams/Kusto/Mail/Learn MCP)
# ═══════════════════════════════════════════════════
if (-not $SkipAgency) {
    Write-Host ""
    Write-Host "[2/6] Installing Agency CLI..." -ForegroundColor Yellow

    $agencyExe = "$env:APPDATA\agency\CurrentVersion\agency.exe"
    if (Test-Path $agencyExe) {
        Write-Host "  OK Agency CLI already installed at $agencyExe" -ForegroundColor Green
    } else {
        Write-Host "  Installing Agency CLI..." -ForegroundColor Cyan
        try {
            iex "& { $(irm aka.ms/InstallTool.ps1) } agency"
            if (Test-Path $agencyExe) {
                Write-Host "  OK Agency CLI installed" -ForegroundColor Green
            } else {
                Write-Host "  WARNING: Agency CLI install completed but exe not found" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ERROR: Agency CLI install failed: $_" -ForegroundColor Red
            Write-Host "  Manual install: iex `"& { `$(irm aka.ms/InstallTool.ps1) } agency`"" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host ""
    Write-Host "[2/6] Skipping Agency CLI (--SkipAgency)" -ForegroundColor DarkGray
}

# ═══════════════════════════════════════════════════
# Step 2.5: Playwright CLI (D365 browser automation)
# ═══════════════════════════════════════════════════
Write-Host ""
Write-Host "[2.5/6] Checking playwright-cli..." -ForegroundColor Yellow

$playwrightCli = $null
try { $playwrightCli = (Get-Command playwright-cli -ErrorAction SilentlyContinue).Source } catch {}
if ($playwrightCli) {
    Write-Host "  OK playwright-cli found at $playwrightCli" -ForegroundColor Green
} else {
    Write-Host "  Installing @playwright/cli globally..." -ForegroundColor Cyan
    try {
        npm install -g @playwright/cli 2>&1 | Select-Object -Last 3
        $verify = $null
        try { $verify = (Get-Command playwright-cli -ErrorAction SilentlyContinue).Source } catch {}
        if ($verify) {
            Write-Host "  OK playwright-cli installed" -ForegroundColor Green
        } else {
            Write-Host "  WARNING: Installed but not in PATH. Add npm global bin to PATH." -ForegroundColor Yellow
            Write-Host "  npm global bin: $(npm prefix -g)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ERROR: playwright-cli install failed: $_" -ForegroundColor Red
        Write-Host "  Manual install: npm install -g @playwright/cli" -ForegroundColor Yellow
    }
}

# ═══════════════════════════════════════════════════
# Step 3: local-rag MCP Server
# ═══════════════════════════════════════════════════
if (-not $SkipLocalRag) {
    Write-Host ""
    Write-Host "[3/6] Setting up local-rag MCP server..." -ForegroundColor Yellow

    $localRagDir = Join-Path $env:USERPROFILE ".claude\mcp-servers\local-rag"
    $localRagRepo = "https://github.com/mikaelfun/eb-local-rag.git"

    if (Test-Path (Join-Path $localRagDir "dist\index.js")) {
        Write-Host "  OK local-rag already installed at $localRagDir" -ForegroundColor Green
    } else {
        # Ensure parent directory exists
        $parentDir = Split-Path $localRagDir -Parent
        if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
        }

        if (Test-Path (Join-Path $localRagDir "package.json")) {
            Write-Host "  Found existing local-rag, running npm install..." -ForegroundColor Cyan
        } else {
            Write-Host "  Cloning from $localRagRepo ..." -ForegroundColor Cyan
            try {
                git clone $localRagRepo $localRagDir 2>&1 | Select-Object -Last 3
            } catch {
                Write-Host "  ERROR: git clone failed: $_" -ForegroundColor Red
                Write-Host "  Manual: git clone $localRagRepo $localRagDir" -ForegroundColor Yellow
            }
        }

        if (Test-Path (Join-Path $localRagDir "package.json")) {
            Push-Location $localRagDir
            try {
                npm install 2>&1 | Select-Object -Last 3
                Write-Host "  OK local-rag installed (pre-built dist, no build step needed)" -ForegroundColor Green
            } catch {
                Write-Host "  ERROR: npm install failed: $_" -ForegroundColor Red
            } finally {
                Pop-Location
            }
        } else {
            Write-Host "  ERROR: local-rag clone failed, package.json not found" -ForegroundColor Red
        }
    }
} else {
    Write-Host ""
    Write-Host "[3/6] Skipping local-rag (--SkipLocalRag)" -ForegroundColor DarkGray
}

# ═══════════════════════════════════════════════════
# Step 4: config.json
# ═══════════════════════════════════════════════════
Write-Host ""
Write-Host "[4/6] Checking config.json..." -ForegroundColor Yellow

$configFile = Join-Path $projectRoot "config.json"
if (Test-Path $configFile) {
    $cfg = Get-Content $configFile -Raw | ConvertFrom-Json
    Write-Host "  OK config.json exists (casesRoot=$($cfg.casesRoot))" -ForegroundColor Green
} else {
    Write-Host "  config.json not found. Creating from template..." -ForegroundColor Cyan
    $templateFile = Join-Path $projectRoot "config.template.json"

    if ($NonInteractive) {
        $dataRoot = if ($env:EB_DATA_ROOT) { $env:EB_DATA_ROOT } else { "./data" }
        $podAlias = if ($env:EB_POD_ALIAS) { $env:EB_POD_ALIAS } else { "yourname@microsoft.com" }
    } else {
        $defaultData = Join-Path (Split-Path $projectRoot) "EngineerBrain-Data"
        $dataRoot = Read-Host "  Data directory path [$defaultData]"
        if ([string]::IsNullOrWhiteSpace($dataRoot)) { $dataRoot = $defaultData }

        $podAlias = Read-Host "  Pod alias email [yourname@microsoft.com]"
        if ([string]::IsNullOrWhiteSpace($podAlias)) { $podAlias = "yourname@microsoft.com" }
    }

    $configContent = @"
{
  "casesRoot": "./cases",
  "dataRoot": "$($dataRoot -replace '\\', '\\\\')",
  "teamsSearchCacheHours": 4,
  "noteGapThresholdDays": 3,
  "podAlias": "$podAlias",
  "onenote": {
    "personalNotebook": "My OneNote",
    "teamNotebooks": ["MCVKB"],
    "freshnessThresholdMonths": 12,
    "autoRagSync": true
  }
}
"@
    $configContent | Out-File -FilePath $configFile -Encoding utf8
    Write-Host "  OK Created config.json" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════
# Step 5: .mcp.json
# ═══════════════════════════════════════════════════
Write-Host ""
Write-Host "[5/6] Checking .mcp.json..." -ForegroundColor Yellow

$mcpFile = Join-Path $projectRoot ".mcp.json"
if (Test-Path $mcpFile) {
    Write-Host "  OK .mcp.json exists" -ForegroundColor Green
} else {
    Write-Host "  .mcp.json not found. Generating from template..." -ForegroundColor Cyan

    $agencyExe = "$env:APPDATA\agency\CurrentVersion\agency.exe" -replace '\\', '\\\\'
    $homeDir = $env:USERPROFILE -replace '\\', '\\\\'
    $cfg = Get-Content $configFile -Raw | ConvertFrom-Json
    $dataRootEsc = $cfg.dataRoot -replace '\\', '\\\\'

    # Read secrets interactively or from env
    if ($NonInteractive) {
        $openaiKey = if ($env:OPENAI_API_KEY) { $env:OPENAI_API_KEY } else { "" }
        $openaiBase = if ($env:OPENAI_BASE_URL) { $env:OPENAI_BASE_URL } else { "https://api.openai.com/v1" }
        $azEmbedKey = if ($env:AZURE_EMBEDDING_API_KEY) { $env:AZURE_EMBEDDING_API_KEY } else { "" }
        $azEmbedBase = if ($env:AZURE_EMBEDDING_BASE_URL) { $env:AZURE_EMBEDDING_BASE_URL } else { "" }
        $kustoUri = if ($env:KUSTO_CLUSTER_URI) { $env:KUSTO_CLUSTER_URI } else { "https://your-cluster.kusto.chinacloudapi.cn" }
        $kustoDB = if ($env:KUSTO_DATABASE) { $env:KUSTO_DATABASE } else { "AKSprod" }
        $azConfigDir = if ($env:AZURE_CONFIG_DIR) { $env:AZURE_CONFIG_DIR -replace '\\', '\\\\' } else { "" }
    } else {
        $kustoUri = Read-Host "  Kusto cluster URI [https://your-cluster.kusto.chinacloudapi.cn]"
        if ([string]::IsNullOrWhiteSpace($kustoUri)) { $kustoUri = "https://your-cluster.kusto.chinacloudapi.cn" }

        $kustoDB = Read-Host "  Kusto database [AKSprod]"
        if ([string]::IsNullOrWhiteSpace($kustoDB)) { $kustoDB = "AKSprod" }

        $azConfigDir = Read-Host "  Azure config dir (for Kusto auth, e.g. C:\Users\you\.azure-profiles\profile1) [skip]"
        $azConfigDir = $azConfigDir -replace '\\', '\\\\'

        $openaiKey = Read-Host "  OpenAI API key (for local-rag embeddings) [skip]"
        $openaiBase = Read-Host "  OpenAI base URL [https://api.openai.com/v1]"
        if ([string]::IsNullOrWhiteSpace($openaiBase)) { $openaiBase = "https://api.openai.com/v1" }

        $azEmbedKey = Read-Host "  Azure Embedding API key (fallback) [skip]"
        $azEmbedBase = Read-Host "  Azure Embedding base URL [skip]"
    }

    # Build AZURE_CONFIG_DIR env block
    $kustoEnv = ""
    if (-not [string]::IsNullOrWhiteSpace($azConfigDir)) {
        $kustoEnv = @"
,
      "env": {
        "AZURE_CONFIG_DIR": "$azConfigDir"
      }
"@
    }

    $mcpContent = @"
{
  "mcpServers": {
    "playwright": {
      "command": "cmd",
      "args": ["/c", "npx", "@playwright/mcp@latest", "--browser", "msedge", "--output-dir", ".playwright-output"]
    },
    "icm": {
      "command": "$agencyExe",
      "args": ["mcp", "icm"]
    },
    "teams": {
      "command": "$agencyExe",
      "args": ["mcp", "teams"]
    },
    "kusto": {
      "command": "$agencyExe",
      "args": ["mcp", "kusto", "--service-uri", "$kustoUri", "--database", "$kustoDB"]$kustoEnv
    },
    "msft-learn": {
      "command": "$agencyExe",
      "args": ["mcp", "msft-learn"]
    },
    "mail": {
      "command": "$agencyExe",
      "args": ["mcp", "mail"]
    },
    "local-rag": {
      "command": "node",
      "args": ["$homeDir\\.claude\\mcp-servers\\local-rag\\dist\\index.js"],
      "env": {
        "BASE_DIR": "$dataRootEsc\\OneNote Export",
        "DB_PATH": "$dataRootEsc\\lancedb",
        "EMBEDDING_PROVIDER": "openai",
        "OPENAI_API_KEY": "$openaiKey",
        "OPENAI_BASE_URL": "$openaiBase",
        "MODEL_NAME": "text-embedding-3-small",
        "FALLBACK_PROVIDER": "azure",
        "FALLBACK_API_KEY": "$azEmbedKey",
        "FALLBACK_BASE_URL": "$azEmbedBase",
        "FALLBACK_API_VERSION": "2023-05-15"
      }
    }
  }
}
"@
    $mcpContent | Out-File -FilePath $mcpFile -Encoding utf8
    Write-Host "  OK Generated .mcp.json" -ForegroundColor Green
    Write-Host "  IMPORTANT: .mcp.json contains API keys - do NOT commit to git" -ForegroundColor Red
}

# ═══════════════════════════════════════════════════
# Step 6: Dashboard Dependencies
# ═══════════════════════════════════════════════════
if (-not $SkipDashboard) {
    Write-Host ""
    Write-Host "[6/6] Installing Dashboard dependencies..." -ForegroundColor Yellow

    $dashboardDir = Join-Path $projectRoot "dashboard"
    Push-Location $dashboardDir
    try {
        # Generate .env if missing
        $envFile = Join-Path $dashboardDir ".env"
        if (-not (Test-Path $envFile)) {
            $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
            @"
JWT_SECRET=$jwtSecret
PORT=3010
"@ | Out-File -FilePath $envFile -Encoding utf8
            Write-Host "  Generated .env (JWT_SECRET + PORT=3010)" -ForegroundColor Green
        }

        # npm install (triggers postinstall -> web npm install)
        npm install 2>&1 | Select-Object -Last 3
        Write-Host "  OK Dashboard dependencies installed (backend + frontend)" -ForegroundColor Green
    } catch {
        Write-Host "  ERROR: Dashboard install failed: $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
} else {
    Write-Host ""
    Write-Host "[6/6] Skipping Dashboard (--SkipDashboard)" -ForegroundColor DarkGray
}

# ═══════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  Bootstrap Complete!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Start Dashboard:" -ForegroundColor White
Write-Host "    cd dashboard && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3010" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "    1. Verify .mcp.json API keys are correct" -ForegroundColor White
Write-Host "    2. Run 'az login' in your Azure profile for Kusto access" -ForegroundColor White
Write-Host "    3. Start Claude Code: claude" -ForegroundColor White
Write-Host ""
