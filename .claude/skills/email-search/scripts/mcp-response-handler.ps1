# mcp-response-handler.ps1
# MCP 响应处理器：从 stdin 读取 MCP 工具返回的 raw JSON，解析并保存
# 用法：
#   搜索结果：echo $MCP_OUTPUT | pwsh -File mcp-response-handler.ps1 -Mode search -OutputPath search-results.json -LogFile email-search.log
#   邮件body：echo $MCP_OUTPUT | pwsh -File mcp-response-handler.ps1 -Mode body -OutputPath body-xxx.html -LogFile email-search.log

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("search", "body")]
    [string]$Mode,

    [Parameter(Mandatory=$true)]
    [string]$OutputPath,

    [string]$LogFile
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

function Write-Log {
    param([string]$Message)
    if ($LogFile) {
        $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Add-Content -Path $LogFile -Value "[$ts] $Message" -Encoding UTF8
    }
    Write-Host $Message
}

# 从 stdin 读取 MCP 输出
$rawInput = [Console]::In.ReadToEnd()

if (-not $rawInput -or $rawInput.Trim().Length -eq 0) {
    Write-Log "MCP_HANDLER ERROR | Empty input"
    Write-Host "STATUS=ERROR"
    exit 1
}

# 检测 MCP 错误
if ($rawInput -match "error.*-32001" -or $rawInput -match "Remote connection error") {
    Write-Log "MCP_HANDLER RETRY | error -32001 detected"
    Write-Host "STATUS=RETRY"
    exit 2  # 特殊退出码表示需要重试
}

if ($rawInput -match '"error"') {
    Write-Log "MCP_HANDLER ERROR | MCP returned error: $($rawInput.Substring(0, [Math]::Min(200, $rawInput.Length)))"
    Write-Host "STATUS=ERROR"
    exit 1
}

try {
    # MCP 返回格式: [{"type":"text","text":"{\"rawResponse\":\"...\"}"}]
    # 或直接是 {"rawResponse":"...","message":"..."}
    # 需要处理多层 JSON 转义

    $parsed = $null

    # 尝试方式1: 直接解析为 JSON 数组
    try {
        $arr = $rawInput | ConvertFrom-Json -ErrorAction Stop
        if ($arr -is [array] -and $arr.Count -gt 0 -and $arr[0].text) {
            $inner = $arr[0].text | ConvertFrom-Json -ErrorAction Stop
            $parsed = $inner
        } elseif ($arr.rawResponse) {
            $parsed = $arr
        }
    } catch {}

    # 尝试方式2: 直接作为 object 解析
    if (-not $parsed) {
        try {
            $obj = $rawInput | ConvertFrom-Json -ErrorAction Stop
            if ($obj.rawResponse) {
                $parsed = $obj
            }
        } catch {}
    }

    # 尝试方式3: 提取 rawResponse 字符串并解析
    if (-not $parsed) {
        if ($rawInput -match '"rawResponse"\s*:\s*"(.*)"') {
            # 这里的 rawResponse 值本身是转义的 JSON 字符串
            $rawResponseStr = $Matches[1]
            # 反转义
            $rawResponseStr = $rawResponseStr -replace '\\u0022', '"'
            $rawResponseStr = $rawResponseStr -replace '\\\\u0022', '"'
            $rawResponseStr = $rawResponseStr -replace '\\"', '"'
            $rawResponseStr = $rawResponseStr -replace '\\n', "`n"
            $rawResponseStr = $rawResponseStr -replace '\\r', "`r"
            $rawResponseStr = $rawResponseStr -replace '\\t', "`t"
            try {
                $parsed = @{ rawResponse = $rawResponseStr }
            } catch {}
        }
    }

    if (-not $parsed) {
        Write-Log "MCP_HANDLER ERROR | Cannot parse MCP response (length=$($rawInput.Length))"
        Write-Host "STATUS=PARSE_ERROR"
        exit 1
    }

    # 确保输出目录存在
    $outDir = Split-Path -Parent $OutputPath
    if ($outDir -and -not (Test-Path $outDir)) {
        New-Item -ItemType Directory -Path $outDir -Force | Out-Null
    }

    if ($Mode -eq "search") {
        # 解析 rawResponse 中的 value 数组
        $responseData = $null
        if ($parsed.rawResponse -is [string]) {
            $responseData = $parsed.rawResponse | ConvertFrom-Json -ErrorAction Stop
        } else {
            $responseData = $parsed.rawResponse
        }

        $emails = $responseData.value
        $count = 0
        if ($emails) { $count = $emails.Count }

        # 写入标准格式
        $output = @{ value = $emails }
        $json = $output | ConvertTo-Json -Depth 10 -Compress:$false
        [System.IO.File]::WriteAllText($OutputPath, $json, [System.Text.UTF8Encoding]::new($false))

        Write-Log "MCP_HANDLER OK | Search: $count emails saved to $OutputPath"
        Write-Host "STATUS=OK"
        Write-Host "EMAIL_COUNT=$count"

    } elseif ($Mode -eq "body") {
        # 提取 body 字段
        $msgData = $null
        if ($parsed.rawResponse) {
            # rawResponse 可能不存在于 GetMessage 响应
            $msgData = $parsed
        }
        if ($parsed.data) {
            $msgData = $parsed.data
        }

        $body = ""
        if ($msgData.data -and $msgData.data.body) {
            $body = $msgData.data.body
        } elseif ($msgData.body) {
            $body = $msgData.body
        } elseif ($parsed.body) {
            $body = $parsed.body
        }

        if ($body.Length -eq 0) {
            # 尝试从原始输入中提取 body
            if ($rawInput -match '"body"\s*:\s*"((?:[^"\\]|\\.)*)') {
                $body = $Matches[1]
                $body = $body -replace '\\"', '"'
                $body = $body -replace '\\n', "`n"
                $body = $body -replace '\\r', "`r"
                $body = $body -replace '\\t', "`t"
                # Decode unicode escapes
                $body = [System.Text.RegularExpressions.Regex]::Replace($body, '\\u([0-9a-fA-F]{4})', {
                    param($m) [char]::ConvertFromUtf32([Convert]::ToInt32($m.Groups[1].Value, 16))
                })
            }
        }

        if ($body.Length -gt 0) {
            [System.IO.File]::WriteAllText($OutputPath, $body, [System.Text.UTF8Encoding]::new($false))
            $sizeKB = [math]::Round($body.Length / 1024, 1)
            Write-Log "MCP_HANDLER OK | Body: ${sizeKB}KB saved to $OutputPath"
            Write-Host "STATUS=OK"
            Write-Host "BODY_SIZE_KB=$sizeKB"
        } else {
            Write-Log "MCP_HANDLER WARN | No body found in response"
            Write-Host "STATUS=NO_BODY"
        }
    }

} catch {
    Write-Log "MCP_HANDLER ERROR | $($_.Exception.Message)"
    Write-Host "STATUS=ERROR"
    Write-Host "DETAIL=$($_.Exception.Message)"
    exit 1
}
