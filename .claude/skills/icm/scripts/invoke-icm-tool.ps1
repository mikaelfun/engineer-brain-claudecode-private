param(
  [Parameter(Mandatory)][string]$ToolName,
  [Parameter(Mandatory)][string]$ArgumentsJson,
  [int]$StartupTimeoutSec = 15,
  [int]$CallTimeoutSec = 60
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$agency = 'C:\Users\fangkun\AppData\Roaming\agency\CurrentVersion\agency.exe'
if (-not (Test-Path $agency)) {
  throw "agency.exe not found: $agency"
}

$tempDir = Join-Path $env:TEMP ('agency-icm-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
$stdoutPath = Join-Path $tempDir 'stdout.log'
$stderrPath = Join-Path $tempDir 'stderr.log'

$proc = Start-Process -FilePath $agency -ArgumentList @('mcp','icm','--transport','http') -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath -PassThru -WindowStyle Hidden

try {
  $port = $null
  $deadline = (Get-Date).AddSeconds($StartupTimeoutSec)
  while ((Get-Date) -lt $deadline) {
    if (Test-Path $stdoutPath) {
      $raw = Get-Content -Path $stdoutPath -Raw -ErrorAction SilentlyContinue
      if ($raw -match '(?m)^\s*(\d{2,5})\s*$') {
        $port = [int]$Matches[1]
        break
      }
    }
    if ($proc.HasExited) {
      $stderr = if (Test-Path $stderrPath) { Get-Content -Path $stderrPath -Raw -ErrorAction SilentlyContinue } else { '' }
      throw "agency mcp icm exited before yielding port. stderr: $stderr"
    }
    Start-Sleep -Milliseconds 300
  }

  if (-not $port) {
    $stderr = if (Test-Path $stderrPath) { Get-Content -Path $stderrPath -Raw -ErrorAction SilentlyContinue } else { '' }
    throw "Failed to get local port from agency mcp icm within ${StartupTimeoutSec}s. stderr: $stderr"
  }

  $baseUrl = "http://127.0.0.1:$port/"

  $initBody = @{
    jsonrpc = '2.0'
    id = 1
    method = 'initialize'
    params = @{
      protocolVersion = '2024-11-05'
      capabilities = @{}
      clientInfo = @{
        name = 'engineer-brain-agency-icm'
        version = '1.0'
      }
    }
  } | ConvertTo-Json -Depth 8 -Compress

  $initResp = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $initBody -ContentType 'application/json' -TimeoutSec $CallTimeoutSec
  if (-not $initResp) {
    throw 'ICM MCP initialize returned empty response'
  }

  $notifyBody = '{"jsonrpc":"2.0","method":"notifications/initialized"}'
  Invoke-RestMethod -Uri $baseUrl -Method Post -Body $notifyBody -ContentType 'application/json' -TimeoutSec $CallTimeoutSec | Out-Null

  $argsObj = $ArgumentsJson | ConvertFrom-Json
  $callBody = @{
    jsonrpc = '2.0'
    id = 2
    method = 'tools/call'
    params = @{
      name = $ToolName
      arguments = $argsObj
    }
  } | ConvertTo-Json -Depth 12 -Compress

  $resp = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $callBody -ContentType 'application/json' -TimeoutSec $CallTimeoutSec

  $payload = $null
  if ($resp -is [string]) {
    if ($resp -match 'data:\s*(\{.*\})') {
      $payload = $Matches[1] | ConvertFrom-Json -Depth 20
    }
  } else {
    $payload = $resp
  }

  if (-not $payload) {
    throw 'ICM MCP tools/call returned no parseable payload'
  }

  $result = $payload.result
  $contentText = $null
  if ($result.content -and $result.content.Count -gt 0) {
    $contentText = $result.content[0].text
  }

  $parsedData = $null
  if ($result.structuredContent) {
    if ($result.structuredContent.result -is [string]) {
      try {
        $parsedData = $result.structuredContent.result | ConvertFrom-Json -Depth 50
      } catch {
        $parsedData = $result.structuredContent.result
      }
    } else {
      $parsedData = $result.structuredContent
    }
  } elseif ($contentText) {
    try {
      $parsedData = $contentText | ConvertFrom-Json -Depth 50
    } catch {
      $parsedData = $contentText
    }
  }

  @{
    ok = -not [bool]$result.isError
    tool = $ToolName
    data = $parsedData
    rawText = $contentText
    source = 'agency-mcp-icm'
    fetchedAt = (Get-Date).ToString('o')
  } | ConvertTo-Json -Depth 50
}
finally {
  if ($proc -and -not $proc.HasExited) {
    try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
  }
  if (Test-Path $tempDir) {
    try { Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue } catch {}
  }
}
