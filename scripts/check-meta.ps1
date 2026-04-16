$projRoot = (Resolve-Path "$PSScriptRoot\..").Path
$cfg = Get-Content "$projRoot\config.json" -Raw | ConvertFrom-Json
$cr = if ([IO.Path]::IsPathRooted($cfg.casesRoot)) { $cfg.casesRoot } else { Join-Path $projRoot $cfg.casesRoot }
$dirs = Get-ChildItem "$cr\active" -Directory
foreach ($d in $dirs) {
    $meta = Join-Path $d.FullName 'casework-meta.json'
    if (Test-Path $meta) {
        $m = Get-Content $meta -Raw | ConvertFrom-Json
        Write-Output "$($d.Name) | lastInspected=$($m.lastInspected)"
    } else {
        Write-Output "$($d.Name) | no meta"
    }
}
