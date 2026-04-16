$lines = Get-Content "skills/products/avd/known-issues-ado-wiki.jsonl"
$ids = @()
foreach ($line in $lines) {
    if ($line -match '"id"\s*:\s*"([^"]+)"') {
        $ids += $Matches[1]
    }
}
Write-Output "Total entries: $($ids.Count)"
$nums = $ids | ForEach-Object { if ($_ -match '(\d+)$') { [int]$Matches[1] } } | Sort-Object
$expected = 1..$nums[-1]
$missing = $expected | Where-Object { $_ -notin $nums }
if ($missing.Count -gt 0) {
    Write-Output "Missing IDs: $($missing -join ', ')"
} else {
    Write-Output "No gaps in sequence"
}
Write-Output "ID range: $($nums[0]) to $($nums[-1])"
$guideCount = ($lines | Where-Object { $_ -match '"quality"\s*:\s*"guide-draft"' }).Count
Write-Output "guide-draft entries: $guideCount"
Write-Output "raw entries: $($lines.Count - $guideCount)"
