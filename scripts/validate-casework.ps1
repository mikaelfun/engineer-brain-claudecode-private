#!/usr/bin/env pwsh
<#
.SYNOPSIS
    验证 /casework 2603090040000814 的输出结果是否符合预期。
.DESCRIPTION
    检查 case 目录下的文件是否完整、内容是否正确。
    返回 JSON 结构的验证报告。
#>
param(
    [string]$CaseDir = "C:\Users\fangkun\Documents\Claude Code Projects\EngineerBrain\cases\active\2603090040000814"
)

$results = @()
$pass = 0
$fail = 0
$warn = 0

function Check($name, $condition, $detail) {
    $script:results += [PSCustomObject]@{ name = $name; pass = $condition; detail = $detail }
    if ($condition) { $script:pass++ } else { $script:fail++ }
}

function Warn($name, $detail) {
    $script:results += [PSCustomObject]@{ name = $name; pass = "WARN"; detail = $detail }
    $script:warn++
}

# === 1. 核心文件存在性 ===
$requiredFiles = @(
    "case-info.md",
    "emails.md",
    "notes.md",
    "casehealth-meta.json"
)
foreach ($f in $requiredFiles) {
    $exists = Test-Path (Join-Path $CaseDir $f)
    Check "file:$f" $exists $(if ($exists) { "exists" } else { "MISSING" })
}

# === 2. 可选但重要的文件/目录 ===
$optionalChecks = @(
    @{ path = "teams/_search-log.md"; name = "teams:_search-log.md" },
    @{ path = "teams/_chat-index.json"; name = "teams:_chat-index.json" },
    @{ path = "timing.json"; name = "timing.json" }
)
foreach ($o in $optionalChecks) {
    $exists = Test-Path (Join-Path $CaseDir $o.path)
    Check $o.name $exists $(if ($exists) { "exists" } else { "MISSING" })
}

# === 3. Todo 文件存在 ===
$todoDir = Join-Path $CaseDir "todo"
$todoFiles = @()
if (Test-Path $todoDir) {
    $todoFiles = @(Get-ChildItem $todoDir -Filter "*.md" -File)
}
Check "todo:has_file" ($todoFiles.Count -gt 0) "$($todoFiles.Count) todo file(s)"

# === 4. Inspection 文件存在 ===
$inspectionFiles = @(Get-ChildItem $CaseDir -Filter "inspection-*.md" -File -ErrorAction SilentlyContinue)
Check "inspection:has_file" ($inspectionFiles.Count -gt 0) "$($inspectionFiles.Count) inspection file(s)"

# === 5. Images 检查 ===
$imagesDir = Join-Path $CaseDir "images"
if (Test-Path $imagesDir) {
    $images = @(Get-ChildItem $imagesDir -File)
    # 所有图片必须有扩展名
    $noExt = @($images | Where-Object { -not $_.Extension -or $_.Extension.Length -le 1 })
    Check "images:all_have_extension" ($noExt.Count -eq 0) "$($images.Count) images, $($noExt.Count) without extension"
    # 签名图片应该被过滤（< 5KB 不应存在）
    $tinyImages = @($images | Where-Object { $_.Length -lt 5120 })
    Check "images:no_tiny_signature" ($tinyImages.Count -eq 0) "$($tinyImages.Count) images < 5KB (should be filtered)"
    # 至少应该有一些有效图片
    Check "images:has_images" ($images.Count -gt 0) "$($images.Count) total images"
} else {
    Warn "images:dir_missing" "images/ directory does not exist"
}

# === 6. Attachments 检查 ===
$attDir = Join-Path $CaseDir "attachments"
if (Test-Path $attDir) {
    $attFiles = @(Get-ChildItem $attDir -File)
    Check "attachments:has_files" ($attFiles.Count -gt 0) "$($attFiles.Count) attachment(s)"
} else {
    Warn "attachments:dir_missing" "attachments/ directory not created (may be OK if no DTM attachments)"
}

# === 7. casehealth-meta.json 内容检查 ===
$metaFile = Join-Path $CaseDir "casehealth-meta.json"
if (Test-Path $metaFile) {
    try {
        $meta = Get-Content $metaFile -Raw | ConvertFrom-Json

        # IR 不能是 unknown 或 missing（接受原始值和 kebab-case）
        $irStatus = if ($meta.irSla -and $meta.irSla.status) { $meta.irSla.status } else { "missing" }
        $irInvalid = @("unknown", "missing")
        Check "meta:ir_not_unknown" ($irStatus -notin $irInvalid) "IR=$irStatus"

        # FDR 不能是 unknown 或 missing
        $fdrStatus = if ($meta.fdr -and $meta.fdr.status) { $meta.fdr.status } else { "missing" }
        Check "meta:fdr_not_unknown" ($fdrStatus -notin $irInvalid) "FDR=$fdrStatus"

        # FWR 不能是 unknown 或 missing
        $fwrStatus = if ($meta.fwr -and $meta.fwr.status) { $meta.fwr.status } else { "missing" }
        Check "meta:fwr_not_unknown" ($fwrStatus -notin $irInvalid) "FWR=$fwrStatus"

        # actualStatus 应该存在且有值
        Check "meta:has_actualStatus" ([bool]$meta.actualStatus) "actualStatus=$($meta.actualStatus)"

        # 21v Convert 应该被识别
        $is21v = $meta.compliance.is21vConvert
        Check "meta:21v_detected" ($is21v -eq $true) "is21vConvert=$is21v"

    } catch {
        Check "meta:parseable" $false "JSON parse error: $_"
    }
}

# === 8. Logs 检查 ===
$logsDir = Join-Path $CaseDir "logs"
if (Test-Path $logsDir) {
    $logFiles = @(Get-ChildItem $logsDir -Filter "*.log" -File)
    Check "logs:has_files" ($logFiles.Count -gt 0) "$($logFiles.Count) log file(s): $($logFiles.Name -join ', ')"
} else {
    Warn "logs:dir_missing" "logs/ directory not created (subagent logging may not be working)"
}

# === 9. case-info.md 关键内容 ===
$caseInfo = Join-Path $CaseDir "case-info.md"
if (Test-Path $caseInfo) {
    $content = Get-Content $caseInfo -Raw
    Check "caseinfo:has_title" ($content -match '\| Title \| .+\|') "title field present"
    Check "caseinfo:has_severity" ($content -match '\| Severity \| .+\|') "severity field present"
    Check "caseinfo:has_contact" ($content -match '\| Name \| .+\|') "contact name present"
    Check "caseinfo:has_entitlement" ($content -match '\| Service Level \| .+\|') "entitlement present"
}

# === 10. emails.md 内容 ===
$emailsFile = Join-Path $CaseDir "emails.md"
if (Test-Path $emailsFile) {
    $content = Get-Content $emailsFile -Raw
    $emailCount = ([regex]::Matches($content, '<!-- id: ')).Count
    Check "emails:has_emails" ($emailCount -gt 0) "$emailCount emails found"
    Check "emails:min_expected" ($emailCount -ge 20) "$emailCount emails (expected >= 20)"
}

# === Output ===
Write-Host ""
Write-Host "=========================================="
Write-Host "  Casework Validation Report"
Write-Host "=========================================="
Write-Host ""

foreach ($r in $results) {
    $icon = if ($r.pass -eq $true) { "PASS" } elseif ($r.pass -eq "WARN") { "WARN" } else { "FAIL" }
    $color = if ($r.pass -eq $true) { "Green" } elseif ($r.pass -eq "WARN") { "Yellow" } else { "Red" }
    Write-Host "  [$icon] $($r.name) — $($r.detail)" -ForegroundColor $color
}

Write-Host ""
Write-Host "  Total: $pass PASS / $fail FAIL / $warn WARN"
Write-Host "=========================================="

# Return structured result
@{
    pass = $pass
    fail = $fail
    warn = $warn
    allPassed = ($fail -eq 0)
    results = $results
} | ConvertTo-Json -Depth 3
