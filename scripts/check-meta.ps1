$dirs = Get-ChildItem 'C:\Users\fangkun\.openclaw\workspace\cases\active' -Directory
foreach ($d in $dirs) {
    $meta = Join-Path $d.FullName 'casehealth-meta.json'
    if (Test-Path $meta) {
        $m = Get-Content $meta -Raw | ConvertFrom-Json
        Write-Output "$($d.Name) | lastInspected=$($m.lastInspected)"
    } else {
        Write-Output "$($d.Name) | no meta"
    }
}
