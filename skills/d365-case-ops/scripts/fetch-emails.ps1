<#
.SYNOPSIS
    抓取 Case 完整邮件内容并保存为 emails.md

.DESCRIPTION
    通过 OData API 抓取 Case 关联的所有邮件（subject, from, to, description, direction, time），
    格式化为 Markdown 保存到 cases/{CaseNumber}/emails.md。
    支持增量更新：如果本地已有 emails.md，只追加新邮件（按 activityid 去重）。
    自动过滤系统通知邮件（Ownership accepted, File Uploaded, Case created 等）。

.PARAMETER TicketNumber
    Case 编号（16位数字）

.PARAMETER OutputDir
    输出根目录，默认为 dfmworker workspace 的 cases/ 目录

.PARAMETER Force
    强制全量重新抓取（忽略本地缓存）

.EXAMPLE
    pwsh scripts/fetch-emails.ps1 -TicketNumber 2602130040001034
    pwsh scripts/fetch-emails.ps1 -TicketNumber 2602130040001034 -Force
#>
param(
    [Parameter(Mandatory)][string]$TicketNumber,
    [string]$OutputDir = $(if ($env:D365_CASES_ROOT) { "$env:D365_CASES_ROOT\active" } else {
        $projRoot = (Resolve-Path "$PSScriptRoot\..\..\..").Path
        $cfg = Get-Content "$projRoot\config.json" -Raw | ConvertFrom-Json
        $cr = if ([IO.Path]::IsPathRooted($cfg.casesRoot)) { $cfg.casesRoot } else { Join-Path $projRoot $cfg.casesRoot }
        "$cr\active"
    }),
    [switch]$Force
)

. "$PSScriptRoot\_init.ps1"

$caseDir = Join-Path $OutputDir $TicketNumber
if (-not (Test-Path $caseDir)) { New-Item -ItemType Directory -Path $caseDir -Force | Out-Null }
$emailsFile = Join-Path $caseDir "emails.md"
$imagesDir = Join-Path $caseDir "images"

# --- 获取 incidentid ---
Write-Host "🔵 Resolving incidentid for $TicketNumber ..."
$incidentId = Get-IncidentId -TicketNumber $TicketNumber
if (-not $incidentId) {
    Write-Host "❌ ERR: Could not resolve incidentid for $TicketNumber"
    exit 1
}

# --- 读取本地已有的 activityid + 最后拉取时间（增量模式）---
$existingIds = @{}
$lastFetchTime = $null
if (-not $Force -and (Test-Path $emailsFile)) {
    $content = Get-Content $emailsFile -Raw
    # 从 <!-- id: xxx --> 注释中提取已有的 activityid（用于去重安全网）
    $idMatches = [regex]::Matches($content, '<!-- id: ([a-f0-9\-]+) -->')
    foreach ($m in $idMatches) {
        $existingIds[$m.Groups[1].Value] = $true
    }
    # 从 header 提取上次拉取时间（UTC），用于服务端 createdon ge 过滤
    # Generated 时间戳始终为 UTC，与 D365 createdon (UTC) 对齐
    if ($content -match 'Generated:\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})') {
        $rawTimestamp = $Matches[1]
        # 检查是否有 (UTC) 标记 — 旧版本生成的文件没有此标记，时间戳是本地时间
        if ($content -match 'Generated:\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+\(UTC\)') {
            $lastFetchTime = $rawTimestamp
        } else {
            # 旧版本文件：时间戳是本地时间，不是 UTC
            # 强制全量重新抓取以避免时区偏移导致遗漏邮件
            Write-Host "⚠️ Stale header detected (no UTC marker): Generated: $rawTimestamp"
            Write-Host "⚠️ Forcing full re-fetch to avoid timezone offset (local time treated as UTC)"
            $existingIds = @{}
            $lastFetchTime = $null
        }
    }
    Write-Host "🔵 Found $($existingIds.Count) existing emails in local cache (lastFetch: $lastFetchTime)"
}

# --- 抓取邮件 ---
# 增量模式：服务端按 createdon 过滤，只返回新邮件
$filterXml = "<condition attribute=`"regardingobjectid`" operator=`"eq`" value=`"$incidentId`"/>"
if ($lastFetchTime) {
    $filterXml += "`n      <condition attribute=`"createdon`" operator=`"ge`" value=`"$lastFetchTime`"/>"
    Write-Host "🔵 Fetching emails created since $lastFetchTime ..."
} else {
    Write-Host "🔵 Fetching all emails from OData API ..."
}

$emailFetch = @"
<fetch count="200">
  <entity name="email">
    <attribute name="activityid"/>
    <attribute name="subject"/>
    <attribute name="to"/>
    <attribute name="from"/>
    <attribute name="statuscode"/>
    <attribute name="directioncode"/>
    <attribute name="createdon"/>
    <attribute name="senton"/>
    <attribute name="description"/>
    <order attribute="createdon" descending="false"/>
    <filter>
      $filterXml
    </filter>
  </entity>
</fetch>
"@

$result = Invoke-D365Api -Endpoint "/api/data/v9.0/emails" -FetchXml $emailFetch
if (-not $result -or $result._status -ne 200) {
    Write-Host "❌ ERR: API request failed (status: $($result._status))"
    exit 1
}

$allEmails = @()
if ($result.value) { $allEmails = $result.value }
Write-Host "🔵 API returned $($allEmails.Count) emails"

# --- 过滤系统通知邮件 ---
$systemPatterns = @(
    '^\[Automated Notification\]',
    '^New File Uploaded for Case',
    'Case \d+ .* Your question was succe',
    'Your question was succe',
    'Ownership accepted',
    'has been (created|updated|resolved|closed)',
    'File Uploaded',
    '^Automatic reply:',
    '^自动回复[:：]'
)

function Test-SystemEmail {
    param([string]$Subject)
    foreach ($p in $systemPatterns) {
        if ($Subject -match $p) { return $true }
    }
    return $false
}

# --- 分离新邮件和已有邮件 ---
$newEmails = @()
$skippedSystem = 0
$skippedExisting = 0

foreach ($e in $allEmails) {
    $id = $e.activityid
    if ($existingIds.ContainsKey($id)) {
        $skippedExisting++
        continue
    }
    if (Test-SystemEmail -Subject $e.subject) {
        $skippedSystem++
        continue
    }
    $newEmails += $e
}

Write-Host "🔵 New: $($newEmails.Count) | Skipped (existing): $skippedExisting | Skipped (system): $skippedSystem"

if ($newEmails.Count -eq 0 -and -not $Force) {
    Write-Host "✅ No new emails to archive"
    if (Test-Path $emailsFile) {
        Write-Host "📄 $emailsFile"
        Get-Content $emailsFile -Raw
    }
    exit 0
}

# --- 内联图片提取 ---
# --- 签名图片过滤 ---
# 文件名命中以下模式的视为签名/社交图标，直接跳过
$script:SignatureFilePatterns = @(
    'logo', 'icon', 'badge', 'banner', 'sig[_\-]', 'signature',
    'linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'github',
    'wechat', 'weixin', 'qrcode', 'qr[_\-]',
    'outlook', 'teams[_\-]', 'skype',
    '^image\d{3}\.(png|gif)$'   # Outlook 自动命名的签名小图（image001.png 等）
)
$script:SignatureMinBytes = 5120  # < 5KB 跳过签名图标/跟踪像素

function Test-SignatureImage {
    param(
        [string]$FileName,
        [int]$SizeBytes
    )
    # 极小图片直接跳过（tracking pixel / spacer）
    if ($SizeBytes -gt 0 -and $SizeBytes -lt $script:SignatureMinBytes) { return $true }
    if (-not $FileName) { return $false }
    $lower = $FileName.ToLower()
    foreach ($p in $script:SignatureFilePatterns) {
        if ($lower -match $p) { return $true }
    }
    return $false
}

# --- 根据 MIME type 获取正确扩展名 ---
function Get-ImageExtension {
    param([string]$MimeType)
    switch -Regex ($MimeType) {
        'png'  { return 'png' }
        'gif'  { return 'gif' }
        'bmp'  { return 'bmp' }
        'webp' { return 'webp' }
        'svg'  { return 'svg' }
        default { return 'jpg' }
    }
}

# --- 确保文件名有正确扩展名 ---
function Ensure-Extension {
    param(
        [string]$FileName,
        [string]$ExpectedExt
    )
    $currentExt = [System.IO.Path]::GetExtension($FileName)
    if ($currentExt -and $currentExt.Length -gt 1) {
        # 已有扩展名，保留
        return $FileName
    }
    # 没有扩展名，追加
    return "$FileName.$ExpectedExt"
}

function Extract-InlineImages {
    param(
        [string]$EmailId,
        [string]$HtmlBody,
        [string]$ImagesDir
    )

    $imageRefs = @()
    $skippedSig = 0

    # 1. 提取 data: URI 内联图片（base64 嵌入的图片）
    $dataMatches = [regex]::Matches($HtmlBody, 'src="(data:image/(png|jpeg|jpg|gif|bmp|webp);base64,([A-Za-z0-9+/=]+))"')
    $dataIdx = 0
    foreach ($dm in $dataMatches) {
        $ext = $dm.Groups[2].Value
        if ($ext -eq 'jpeg') { $ext = 'jpg' }
        $b64Data = $dm.Groups[3].Value

        # 签名过滤：data URI 按大小判断（无文件名）
        $estimatedBytes = [math]::Floor($b64Data.Length * 3 / 4)
        if ($estimatedBytes -lt $script:SignatureMinBytes) {
            $skippedSig++
            continue
        }

        $fileName = "$EmailId-data-$dataIdx.$ext"
        $filePath = Join-Path $ImagesDir $fileName

        try {
            $bytes = [System.Convert]::FromBase64String($b64Data)
            [System.IO.File]::WriteAllBytes($filePath, $bytes)
            $imageRefs += @{ Original = $dm.Groups[1].Value; LocalPath = "images/$fileName" }
            $dataIdx++
        } catch {
            Write-Host "⚠️ Failed to save data: image: $($_.Exception.Message)"
        }
    }

    # 2. 提取 cid: 引用的图片
    $cidMatches = [regex]::Matches($HtmlBody, 'src="cid:([^"]+)"')
    if ($cidMatches.Count -gt 0) {
        # 优先使用批量预取缓存
        $attachments = $null
        if ($script:CidAttachmentCache.ContainsKey($EmailId)) {
            $attachments = $script:CidAttachmentCache[$EmailId]
        } else {
            # Fallback: 单独查询（缓存未命中时）
            $attachEndpoint = "/api/data/v9.0/activitymimeattachments?`$filter=_objectid_value eq '$EmailId'&`$select=filename,mimetype,body,objecttypecode"
            $attachResult = Invoke-D365Api -Endpoint $attachEndpoint
            if ($attachResult -and $attachResult.value) {
                $attachments = $attachResult.value
            }
        }

        if ($attachments) {
            foreach ($att in $attachments) {
                if ($att.body -and $att.mimetype -match '^image/') {
                    $ext = Get-ImageExtension -MimeType $att.mimetype

                    # 签名过滤：按文件名 + 大小
                    $bodyBytes = [math]::Floor($att.body.Length * 3 / 4)
                    if (Test-SignatureImage -FileName $att.filename -SizeBytes $bodyBytes) {
                        $skippedSig++
                        Write-Host "  ⏭️ Skipped signature image: $($att.filename) ($bodyBytes bytes)"
                        continue
                    }

                    # 安全化文件名并确保有正确扩展名
                    $safeName = if ($att.filename) {
                        $sanitized = $att.filename -replace '[^\w\-.]', '_'
                        Ensure-Extension -FileName $sanitized -ExpectedExt $ext
                    } else {
                        "$EmailId-cid-$([guid]::NewGuid().ToString('N').Substring(0,6)).$ext"
                    }

                    # Ensure unique filename
                    $filePath = Join-Path $ImagesDir $safeName
                    $counter = 1
                    while (Test-Path $filePath) {
                        $base = [System.IO.Path]::GetFileNameWithoutExtension($safeName)
                        $filePath = Join-Path $ImagesDir "$base-$counter.$ext"
                        $counter++
                    }
                    $finalName = [System.IO.Path]::GetFileName($filePath)

                    try {
                        $bytes = [System.Convert]::FromBase64String($att.body)
                        [System.IO.File]::WriteAllBytes($filePath, $bytes)
                        # Map any cid reference to this attachment
                        $imageRefs += @{ Original = "cid:$($att.filename)"; LocalPath = "images/$finalName" }
                    } catch {
                        Write-Host "⚠️ Failed to save cid image ($($att.filename)): $($_.Exception.Message)"
                    }
                }
            }
        }
    }

    if ($skippedSig -gt 0) {
        Write-Host "  🧹 Skipped $skippedSig signature/icon image(s)"
    }

    return $imageRefs
}

# --- 格式化邮件 ---
function Format-EmailEntry {
    param($Email)

    $dir = if ($Email.directioncode) { "📤 Sent" } else { "📥 Received" }
    $time = $Email.'createdon@OData.Community.Display.V1.FormattedValue'
    if (-not $time) { $time = $Email.createdon }
    $subj = $Email.subject
    $id = $Email.activityid

    # from/to 是 party list (数组)，提取名称
    $fromStr = ""
    if ($Email.from) {
        $fromStr = ($Email.from | ForEach-Object {
            if ($_.name) { $_.name } elseif ($_.addressused) { $_.addressused } else { "Unknown" }
        }) -join ", "
    }
    $toStr = ""
    if ($Email.to) {
        $toStr = ($Email.to | ForEach-Object {
            if ($_.name) { $_.name } elseif ($_.addressused) { $_.addressused } else { "Unknown" }
        }) -join ", "
    }

    # 提取内联图片（在 HTML 清理前）
    # 增量检查：如果 images/ 已有该邮件的图片文件，复用引用不重新提取
    $imageSection = ""
    $rawBody = $Email.description
    if ($rawBody -and ($rawBody -match 'src="(cid:|data:image/)')) {
        # 检查本地是否已有该邮件的图片
        $existingImgs = @()
        if (Test-Path $imagesDir) {
            $existingImgs = @(Get-ChildItem $imagesDir -File | Where-Object { $_.BaseName -match "^$id" -or $_.BaseName -match "^inlineimg_" })
        }
        # 如果是增量模式且已有图片，跳过提取，直接引用已有文件
        if (-not $Force -and $existingImgs.Count -gt 0 -and $existingIds.ContainsKey($id)) {
            $imgLines = $existingImgs | ForEach-Object { "![inline-image](images/$($_.Name))" }
            $imageSection = "`n**Inline Images:**`n" + ($imgLines -join "`n") + "`n"
        } else {
            if (-not (Test-Path $imagesDir)) { New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null }
            $imgRefs = Extract-InlineImages -EmailId $id -HtmlBody $rawBody -ImagesDir $imagesDir
            if ($imgRefs -and $imgRefs.Count -gt 0) {
                $imgLines = $imgRefs | ForEach-Object { "![inline-image]($($_.LocalPath))" }
                $imageSection = "`n**Inline Images:**`n" + ($imgLines -join "`n") + "`n"
                Write-Host "🖼️ Extracted $($imgRefs.Count) inline image(s) from email $id"
            }
        }
    }

    # 清理 HTML 正文为纯文本
    $body = $rawBody
    if ($body) {
        # Block-level HTML tags → newline (before stripping all tags)
        $body = $body -replace '</p>', "`n"
        $body = $body -replace '</div>', "`n"
        $body = $body -replace '</tr>', "`n"
        $body = $body -replace '</li>', "`n"
        $body = $body -replace '<li[^>]*>', "• "
        $body = $body -replace '<br\s*/?>', "`n"
        # 移除剩余 HTML 标签
        $body = $body -replace '<[^>]+>', ''
        # 解码 HTML entities
        $body = [System.Net.WebUtility]::HtmlDecode($body)
        # 压缩多余空行
        $body = ($body -replace "(\r?\n){3,}", "`n`n").Trim()

        # 移除邮件安全提示横幅
        $body = $body -replace 'You don''t often get email from [^\n]+Learn why this is important\s*', ''
        $body = $body -replace '\[\*\*EXTERNAL E-MAIL\*\*\]\s*', ''

        # 截断引用链（reply chain）— 只保留当前邮件正文，去掉引用的历史邮件
        # 策略：所有 pattern 都试一遍，取最靠前的截断点（避免嵌套引用只截掉内层）
        $quotePatterns = @(
            '(?m)^-{2,}\s*Original Message\s*-{2,}',
            '(?m)^_{10,}',
            '(?m)^From:\s+.+?\n\s*Sent:\s+',
            '(?m)^From:\s+.+?\nSent:\s+',
            '(?ms)From:\s+[^\n]+<[^>]+>\s*\nSent:\s+',
            '(?m)^发件人:\s+.+?\n\s*发送时间:\s+',
            '发件人:\s+[^\n]+\n\s*日期:\s+',
            '发件人:\s+[^\n]+\n\s*发送时间:\s+'
        )
        $bestIdx = $body.Length
        foreach ($qp in $quotePatterns) {
            if ($body -match $qp) {
                $idx = $body.IndexOf($Matches[0])
                if ($idx -gt 20 -and $idx -lt $bestIdx) {
                    $bestIdx = $idx
                }
            }
        }
        if ($bestIdx -lt $body.Length) {
            $body = $body.Substring(0, $bestIdx).Trim()
        }
    } else {
        $body = "(empty)"
    }

    $entry = @"
<!-- id: $id -->
### $dir | $time
**Subject:** $subj
**From:** $fromStr
**To:** $toStr

$body
$imageSection
---

"@
    return $entry
}

# --- 批量预取 cid 图片附件（一次 batch API 替代 N 次串行调用） ---
$emailsWithCid = @()
foreach ($e in $newEmails) {
    if ($e.description -and $e.description -match 'src="cid:') {
        $emailsWithCid += $e.activityid
    }
}

$script:CidAttachmentCache = @{}
if ($emailsWithCid.Count -gt 0) {
    Write-Host "🔵 Batch-fetching cid attachments for $($emailsWithCid.Count) emails (parallel)..."
    # 用 Invoke-D365ApiBatch 并行查所有邮件的 cid 附件
    $batchRequests = @()
    foreach ($eid in $emailsWithCid) {
        $batchRequests += @{
            Endpoint = "/api/data/v9.0/activitymimeattachments?`$filter=_objectid_value eq '$eid'&`$select=filename,mimetype,body,objecttypecode"
        }
    }
    $batchResults = Invoke-D365ApiBatch -Requests $batchRequests
    if ($batchResults -and $batchResults.Count -eq $emailsWithCid.Count) {
        for ($i = 0; $i -lt $emailsWithCid.Count; $i++) {
            $eid = $emailsWithCid[$i]
            $res = $batchResults[$i]
            if ($res -and $res.value) {
                $script:CidAttachmentCache[$eid] = $res.value
            }
        }
        $totalAtt = ($script:CidAttachmentCache.Values | ForEach-Object { $_.Count } | Measure-Object -Sum).Sum
        Write-Host "🔵 Cached $totalAtt cid attachment(s) for $($script:CidAttachmentCache.Count) email(s)"
    } else {
        Write-Host "⚠️ Batch cid fetch incomplete, falling back to per-email queries"
    }
}

# --- 写入文件 ---
if ($Force -or -not (Test-Path $emailsFile)) {
    # 全量写入
    $header = @"
# Emails — Case $TicketNumber

> Generated: $((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm:ss')) (UTC) | Total: $($newEmails.Count) emails (excluding system notifications)

"@
    $entries = $newEmails | ForEach-Object { Format-EmailEntry -Email $_ }
    $content = $header + ($entries -join "`n")
    Set-Content -Path $emailsFile -Value $content -Encoding UTF8
    Write-Host "✅ Saved $($newEmails.Count) emails: $emailsFile"
} else {
    # 增量追加
    $entries = $newEmails | ForEach-Object { Format-EmailEntry -Email $_ }
    $appendContent = "`n" + ($entries -join "`n")
    Add-Content -Path $emailsFile -Value $appendContent -Encoding UTF8

    # 更新 header 中的 Total 计数
    $totalCount = $existingIds.Count + $newEmails.Count
    $existingContent = Get-Content $emailsFile -Raw
    $existingContent = $existingContent -replace 'Total: \d+ emails', "Total: $totalCount emails"
    $existingContent = $existingContent -replace 'Generated: .+? \|', "Generated: $((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm:ss')) (UTC) |"
    Set-Content -Path $emailsFile -Value $existingContent -Encoding UTF8
    Write-Host "✅ Appended $($newEmails.Count) new emails (total: $totalCount): $emailsFile"
}

# 输出内容
Get-Content $emailsFile -Raw
