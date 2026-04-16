$lines = Get-Content "skills/products/avd/known-issues-ado-wiki.jsonl"
$seen = @{}
$result = @()
# Process in reverse to keep last occurrence of each ID
$reversed = $lines.Clone()
[array]::Reverse($reversed)
foreach ($line in $reversed) {
    if ($line.Trim() -eq "") { continue }
    # Extract id using regex instead of JSON parsing
    if ($line -match '"id"\s*:\s*"([^"]+)"') {
        $id = $Matches[1]
        if (-not $seen.ContainsKey($id)) {
            $seen[$id] = $true
            $result += $line
        }
    } else {
        # Keep lines without id field
        $result += $line
    }
}
[array]::Reverse($result)
$result | Set-Content -Path "skills/products/avd/known-issues-ado-wiki.jsonl" -Encoding UTF8
Write-Output "Deduplicated: $($result.Count) lines (was $($lines.Count))"
# Show last 12 IDs
$result[-12..-1] | ForEach-Object {
    if ($_ -match '"id"\s*:\s*"([^"]+)"') { Write-Output "  $($Matches[1])" }
}
