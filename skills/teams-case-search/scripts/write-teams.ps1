<#
.SYNOPSIS
  Write Teams chat messages to disk (search-log, chat-index, per-chat md files).
  This is the "writer" half of the teams-case-search skill.
  MCP search/fetch is done by the Claude subagent; results are piped here as JSON.

.DESCRIPTION
  Accepts pre-fetched Teams data (from MCP SearchTeamsMessages + ListChatMessages)
  and handles all file I/O: incremental write, search-log, chat-index.

  Input JSON format (via -InputJson or stdin):
  {
    "caseNumber": "2603090040000814",
    "searchResults": [
      { "keyword": "messages about case ...", "status": "success", "chatIds": ["19:..."] }
    ],
    "chats": [
      {
        "chatId": "19:...",
        "messages": [
          { "id": "...", "createdDateTime": "2026-03-12T09:11:44Z",
            "from": { "displayName": "Yang, Zhao" },
            "body": { "contentType": "Html", "content": "<p>hello</p>" } }
        ]
      }
    ],
    "searchMode": "full",
    "fallbackTriggered": false,
    "elapsed": 45.2
  }

.PARAMETER OutputDir
  Output directory (typically cases/active/{case-id}/teams/)

.PARAMETER InputJson
  JSON string with search results and chat messages. If omitted, reads from stdin.

.PARAMETER InputFile
  Path to a JSON file with the input data. Alternative to InputJson/stdin.

.EXAMPLE
  # From subagent: pipe JSON
  $json | pwsh write-teams.ps1 -OutputDir "cases/active/2603090040000814/teams"

  # From file
  pwsh write-teams.ps1 -OutputDir "..." -InputFile "teams-data.json"
#>
param(
  [Parameter(Mandatory)][string]$OutputDir,
  [string]$InputJson,
  [string]$InputFile
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# --- Read input ---
if ($InputFile) {
  $InputJson = Get-Content $InputFile -Raw -Encoding UTF8
} elseif (-not $InputJson) {
  $InputJson = $input | Out-String
}
$data = $InputJson | ConvertFrom-Json

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$logPath = Join-Path $OutputDir '_search-log.md'
$indexPath = Join-Path $OutputDir '_chat-index.json'

# --- Utility functions ---
function Strip-Html([string]$html) {
  $text = $html -replace '<img[^>]*alt="([^"]*)"[^>]*>', '[$1]'
  $text = $text -replace '<img[^>]*>', '[image]'
  $text = $text -replace '<br\s*/?>', "`n"
  $text = $text -replace '</p>\s*<p>', "`n"
  $text = $text -replace '<[^>]+>', ''
  $text = [System.Net.WebUtility]::HtmlDecode($text)
  $text.Trim()
}

function Sanitize-Name([string]$name) {
  $safe = $name.ToLower() -replace '[^a-z0-9\-]', '-'
  $safe = $safe -replace '-+', '-' -replace '^-|-$', ''
  if ($safe.Length -gt 60) { $safe = $safe.Substring(0, 60) }
  $safe
}

function To-Gmt8([object]$utcVal) {
  try {
    if ($utcVal -is [datetime]) {
      # ConvertFrom-Json converts "...Z" to DateTime with Kind=Utc
      $dto = [DateTimeOffset]::new($utcVal, [TimeSpan]::Zero)
    } else {
      $dto = [DateTimeOffset]::Parse([string]$utcVal)
    }
    $dto.ToOffset([TimeSpan]::FromHours(8)).ToString('HH:mm')
  }
  catch { "$utcVal" }
}

function To-Gmt8Date([object]$utcVal) {
  try {
    if ($utcVal -is [datetime]) {
      $dto = [DateTimeOffset]::new($utcVal, [TimeSpan]::Zero)
    } else {
      $dto = [DateTimeOffset]::Parse([string]$utcVal)
    }
    $dto.ToOffset([TimeSpan]::FromHours(8)).ToString('yyyy-MM-dd')
  }
  catch { '' }
}

function Get-NowGmt8String {
  (Get-Date).ToUniversalTime().AddHours(8).ToString('yyyy-MM-dd HH:mm') + ' GMT+8'
}

function Load-ChatIndex([string]$path) {
  if (-not (Test-Path $path)) { return @{} }
  try {
    $raw = Get-Content $path -Raw -Encoding UTF8
    $obj = $raw | ConvertFrom-Json
    $map = @{}
    if ($obj) {
      foreach ($p in $obj.PSObject.Properties) { $map[$p.Name] = $p.Value }
    }
    return $map
  } catch { return @{} }
}

function Save-ChatIndex([string]$path, $indexMap) {
  $ordered = [ordered]@{}
  foreach ($key in ($indexMap.Keys | Sort-Object)) {
    $ordered[$key] = $indexMap[$key]
  }
  $ordered | ConvertTo-Json -Depth 6 | Set-Content -Path $path -Encoding UTF8
}

function Render-MessageLines($messages) {
  $lines = @()
  foreach ($msg in $messages) {
    $bodyLines = $msg.Body -split "`n"
    $firstLine = $bodyLines[0]
    $rest = if ($bodyLines.Count -gt 1) { $bodyLines[1..($bodyLines.Count - 1)] -join "`n" } else { '' }
    $lines += "**$($msg.From)** ($($msg.TimeStr)): $firstLine"
    if ($rest) { $lines += $rest }
  }
  return $lines
}

function New-MessageKey($msg) {
  "$($msg.Time)|$($msg.From)|$($msg.Body)"
}

# --- Parse messages from MCP format ---
function Parse-ChatMessages($chatData) {
  $messages = @()
  $others = @()

  foreach ($msg in $chatData.messages) {
    $from = if ($msg.from -and $msg.from.displayName) { $msg.from.displayName } else { $null }
    $bodyContent = if ($msg.body) { $msg.body.content } else { '' }
    $body = Strip-Html $bodyContent
    if (-not $body -or $body -match '^\s*$' -or $body -eq '<systemEventMessage/>' -or $body -eq '[systemEventMessage/]') { continue }
    if (-not $from) { continue }

    if ($from -ne 'Kun Fang' -and $others -notcontains $from) { $others += $from }

    $messages += [PSCustomObject]@{
      Time    = $msg.createdDateTime
      Date    = To-Gmt8Date $msg.createdDateTime
      TimeStr = To-Gmt8 $msg.createdDateTime
      From    = $from
      Body    = $body
    }
  }

  $chatName = if ($others.Count -gt 0) { ($others | Select-Object -First 3) -join ', ' } else { 'unknown-chat' }
  return [PSCustomObject]@{ displayName = $chatName; messages = $messages }
}

# --- Write chat file (incremental) ---
function Write-ChatFileIncremental([string]$filePath, [string]$chatId, [string]$displayName, $allMessages, $existingMeta) {
  $now = Get-NowGmt8String
  $allMessages = @($allMessages | Sort-Object { $_.Time })
  $lastMessageTime = if ($allMessages.Count -gt 0) { $allMessages[-1].Time } else { $null }

  $writeMode = 'rewrite'
  $newMessages = $allMessages
  $appendedCount = 0

  if ((Test-Path $filePath) -and $existingMeta -and $existingMeta.lastMessageTime) {
    try {
      $lastSeen = [DateTimeOffset]::Parse([string]$existingMeta.lastMessageTime)
      $newMessages = @($allMessages | Where-Object { [DateTimeOffset]::Parse($_.Time) -gt $lastSeen })
      if ($newMessages.Count -eq 0) {
        $writeMode = 'noop'
      } else {
        $existingContent = Get-Content $filePath -Raw -Encoding UTF8
        $appendLines = @()
        $seenDateHeaders = @{}
        foreach ($line in ($existingContent -split "`r?`n")) {
          if ($line -match '^##\s+(\d{4}-\d{2}-\d{2})$') { $seenDateHeaders[$Matches[1]] = $true }
        }

        foreach ($group in ($newMessages | Group-Object Date | Sort-Object Name)) {
          if (-not $seenDateHeaders.ContainsKey($group.Name)) {
            if (-not $existingContent.EndsWith("`n")) { $appendLines += '' }
            $appendLines += "## $($group.Name)"
            $appendLines += ''
            $seenDateHeaders[$group.Name] = $true
          } else {
            $appendLines += ''
          }
          $appendLines += @(Render-MessageLines -messages $group.Group)
          $appendLines += ''
        }

        $headerReplaced = $existingContent -replace '(?m)^> 最后更新：.*$', "> 最后更新：$now"
        $newContent = ($headerReplaced.TrimEnd() + "`n" + (($appendLines -join "`n").Trim()))
        Set-Content -Path $filePath -Value $newContent -Encoding UTF8
        $writeMode = 'append'
        $appendedCount = $newMessages.Count
      }
    } catch {
      $writeMode = 'rewrite'
      $newMessages = $allMessages
    }
  }

  if ($writeMode -eq 'rewrite') {
    $byDate = $allMessages | Group-Object Date | Sort-Object Name
    $lines = @()
    $lines += "# Teams Chat — $displayName"
    $lines += ''
    $lines += "> 最后更新：$now"
    $lines += "> chatId: $chatId"
    $lines += ''
    foreach ($group in $byDate) {
      $lines += "## $($group.Name)"
      $lines += ''
      $lines += @(Render-MessageLines -messages $group.Group)
      $lines += ''
    }
    Set-Content -Path $filePath -Value ($lines -join "`n") -Encoding UTF8
    $appendedCount = $allMessages.Count
  }

  return [PSCustomObject]@{
    WriteMode = $writeMode
    AppendedCount = $appendedCount
    TotalMessages = $allMessages.Count
    LastMessageTime = $lastMessageTime
  }
}

# ========================
# Main processing
# ========================

$chatIndex = Load-ChatIndex -path $indexPath
$filesCreated = @()
$totalMessagesWritten = 0
$writeSummary = @()

# Process each chat's messages
if ($data.chats) {
  foreach ($chatData in $data.chats) {
    try {
      $chatId = $chatData.chatId
      if (-not $chatId) { continue }

      $existingMeta = if ($chatIndex.ContainsKey($chatId)) { $chatIndex[$chatId] } else { $null }
      $parsed = Parse-ChatMessages -chatData $chatData
      $chatName = $parsed.displayName
      $messages = @($parsed.messages)

      if (-not $chatName -or $messages.Count -eq 0) {
        Write-Host "Skip chatId $chatId (no messages or no display name)"
        continue
      }

      $sanitized = Sanitize-Name $chatName
      $fileName = "$sanitized.md"
      $filePath = Join-Path $OutputDir $fileName
      $writeResult = Write-ChatFileIncremental -filePath $filePath -chatId $chatId -displayName $chatName -allMessages $messages -existingMeta $existingMeta

      if (-not ($filesCreated -contains $fileName)) { $filesCreated += $fileName }
      $totalMessagesWritten += [int]$writeResult.AppendedCount
      $writeSummary += [PSCustomObject]@{
        chatId = $chatId
        file = $fileName
        mode = $writeResult.WriteMode
        appended = $writeResult.AppendedCount
        total = $writeResult.TotalMessages
      }

      $chatIndex[$chatId] = [PSCustomObject]@{
        fileName = $fileName
        displayName = $chatName
        lastMessageTime = $writeResult.LastMessageTime
        totalMessages = $writeResult.TotalMessages
        lastFetchedAt = (Get-Date).ToUniversalTime().ToString('o')
      }

      Write-Host "OK ${fileName}: $($writeResult.WriteMode) ($($writeResult.AppendedCount) new / $($writeResult.TotalMessages) total)"
    } catch {
      Write-Warning "Failed to write chatId $($chatData.chatId): $_"
    }
  }
  Save-ChatIndex -path $indexPath -indexMap $chatIndex
}

# --- Write search log ---
$now = Get-NowGmt8String
if (-not (Test-Path $logPath)) {
  $logLines = @(
    '# Teams Search Log',
    '',
    '| 时间 | 关键词 | 状态 | 模式 | 时间窗 | 回退 | 耗时(s) | 会话数 | 抓取 | 说明 |',
    '|------|--------|------|------|--------|------|---------|--------|------|------|'
  )
  Set-Content -Path $logPath -Value ($logLines -join "`n") -Encoding UTF8
}

$searchMode = if ($data.searchMode) { $data.searchMode } else { 'full' }
$fallbackText = if ($data.fallbackTriggered) { 'yes' } else { 'no' }
$elapsedText = if ($data.elapsed) { $data.elapsed } else { '?' }

if ($data.searchResults) {
  foreach ($s in $data.searchResults) {
    $statusEmoji = switch ($s.status) {
      'success'     { '✅ 成功' }
      'timeout'     { '⚠️ 超时' }
      'parse_error' { '❌ 解析失败' }
      default       { '❓ 未知' }
    }
    $chatCount = @($s.chatIds).Count
    $windowText = if ($data.windowDays) { "$($data.windowDays)d" } else { '-' }
    $fetchText = if ($writeSummary.Count -gt 0) { 'done' } else { 'none' }
    $desc = if ($s.status -eq 'success') { "$chatCount 个会话" } else { '未返回' }
    Add-Content -Path $logPath -Value "| $now | $($s.keyword) | $statusEmoji | $searchMode | $windowText | $fallbackText | $elapsedText | $chatCount | $fetchText | $desc |" -Encoding UTF8
  }
}

# --- Output summary ---
$result = @{
  status           = 'success'
  searchMode       = $searchMode
  uniqueChats      = $chatIndex.Count
  messagesWritten  = $totalMessagesWritten
  filesCreated     = $filesCreated
  writes           = $writeSummary
}

$result | ConvertTo-Json -Depth 6
