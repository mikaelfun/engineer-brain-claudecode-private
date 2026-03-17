param(
  [string[]]$Targets = @('ado', 'workiq'),
  [string]$AdoOrganization = 'Supportability',
  [int]$StartupTimeoutSec = 240
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$agency = 'C:\Users\fangkun\AppData\Roaming\agency\CurrentVersion\agency.exe'
if (-not (Test-Path $agency)) {
  throw "agency.exe not found: $agency"
}

function Start-WarmTarget {
  param(
    [string]$Target,
    [string]$Organization,
    [int]$TimeoutSec
  )

  $tempDir = Join-Path $env:TEMP ('warm-agency-' + $Target + '-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
  $stdoutPath = Join-Path $tempDir 'stdout.log'
  $stderrPath = Join-Path $tempDir 'stderr.log'

  $args = @('mcp', $Target, '--transport', 'http')
  if ($Target -eq 'ado' -and $Organization) {
    $args = @('mcp', 'ado', '--organization', $Organization, '--transport', 'http')
  }

  $proc = Start-Process -FilePath $agency -ArgumentList $args -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath -PassThru -WindowStyle Hidden

  try {
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    $port = $null
    $ready = $false
    $stdoutRaw = ''
    $stderrRaw = ''

    while ((Get-Date) -lt $deadline) {
      $stdoutRaw = if (Test-Path $stdoutPath) { Get-Content -Path $stdoutPath -Raw -ErrorAction SilentlyContinue } else { '' }
      $stderrRaw = if (Test-Path $stderrPath) { Get-Content -Path $stderrPath -Raw -ErrorAction SilentlyContinue } else { '' }
      $combined = ($stdoutRaw + "`n" + $stderrRaw)

      if ($combined -match '(?m)^\s*(\d{2,5})\s*$') {
        $port = [int]$Matches[1]
      }

      if ($combined -match 'Starting MCP Proxy' -or $combined -match 'Child process spawned' -or $port) {
        $ready = $true
        break
      }

      if ($proc.HasExited) {
        throw "agency process for '$Target' exited early. stdout/stderr:`n$combined"
      }

      Start-Sleep -Milliseconds 500
    }

    if (-not $ready) {
      throw "Timeout warming '$Target' after ${TimeoutSec}s. stdout:`n$stdoutRaw`n--- stderr:`n$stderrRaw"
    }

    $safeStdout = if ($null -eq $stdoutRaw) { '' } else { "$stdoutRaw" }
    $safeStderr = if ($null -eq $stderrRaw) { '' } else { "$stderrRaw" }
    $readySignal = if ($combined -match 'Starting MCP Proxy') { 'Starting MCP Proxy' } elseif ($combined -match 'Child process spawned') { 'Child process spawned' } elseif ($port) { 'Port discovered' } else { 'Unknown' }

    return [PSCustomObject]@{
      target = $Target
      ok = $true
      port = $port
      stdout = $safeStdout.Trim()
      stderr = $safeStderr.Trim()
      pid = $proc.Id
      readySignal = $readySignal
    }
  }
  finally {
    if ($proc -and -not $proc.HasExited) {
      try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
    }
    if (Test-Path $tempDir) {
      try { Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue } catch {}
    }
  }
}

$results = @()
foreach ($target in $Targets) {
  Write-Host "== Warming agency MCP: $target ==" -ForegroundColor Cyan
  try {
    $r = Start-WarmTarget -Target $target -Organization $AdoOrganization -TimeoutSec $StartupTimeoutSec
    $results += $r
    Write-Host "✅ $target warmed" -ForegroundColor Green
    if ($r.port) { Write-Host "   Port: $($r.port)" }
  } catch {
    $line = if ($_.InvocationInfo -and $_.InvocationInfo.ScriptLineNumber) { $_.InvocationInfo.ScriptLineNumber } else { 0 }
    $results += [PSCustomObject]@{
      target = $target
      ok = $false
      port = $null
      stdout = ''
      stderr = ("line " + $line + ': ' + $_.Exception.Message)
      pid = $null
    }
    Write-Host "❌ $target failed (line $line): $($_.Exception.Message)" -ForegroundColor Red
  }
  Write-Host ''
}

$summary = [PSCustomObject]@{
  warmedAt = (Get-Date).ToString('o')
  results = $results
}

$summary | ConvertTo-Json -Depth 6
