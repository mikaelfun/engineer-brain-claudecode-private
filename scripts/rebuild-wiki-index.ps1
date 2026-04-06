<#
.SYNOPSIS
    Rebuild ADO Wiki page index for a product.
.PARAMETER ProductId
    Product ID (e.g., "vm", "entra-id")
.PARAMETER WikiConfigs
    JSON string of adoWikis config array
.PARAMETER PathScopes
    Optional - only crawl paths under these scopes
.PARAMETER OutputFile
    Path to write the leaf pages JSON
#>
param(
    [Parameter(Mandatory=$true)][string]$ProductId,
    [Parameter(Mandatory=$true)][string]$WikiConfigsJson,
    [Parameter(Mandatory=$true)][string]$OutputFile
)

$ErrorActionPreference = "Continue"
$allLeaves = @()
$wikiConfigs = $WikiConfigsJson | ConvertFrom-Json

foreach ($wikiCfg in $wikiConfigs) {
    $org = $wikiCfg.org
    $project = $wikiCfg.project
    $orgUrl = "https://dev.azure.com/$org"
    $pathScopes = @()
    if ($wikiCfg.pathScope) {
        $pathScopes = @($wikiCfg.pathScope)
    }

    # Determine wiki name
    $wikiName = $null
    if ($wikiCfg.wiki) {
        $wikiName = $wikiCfg.wiki
    } else {
        # List wikis and pick the first one (usually project-named wiki)
        try {
            $wikiListRaw = az devops wiki list --org $orgUrl --project $project --output json 2>$null
            if ($wikiListRaw) {
                $wikiList = $wikiListRaw | ConvertFrom-Json
                if ($wikiList.Count -gt 0) {
                    # Prefer wiki with same name as project
                    $match = $wikiList | Where-Object { $_.name -eq $project -or $_.name -eq "$project.wiki" }
                    if ($match) {
                        $wikiName = ($match | Select-Object -First 1).name
                    } else {
                        $wikiName = $wikiList[0].name
                    }
                }
            }
        } catch {
            Write-Error "Failed to list wikis for $org/$project : $_"
            continue
        }
    }

    if (-not $wikiName) {
        Write-Warning "No wiki found for $org/$project, skipping"
        continue
    }

    $prefix = "$org/$project/${wikiName}:"
    Write-Host "  Crawling: $org/$project/$wikiName ..."

    # Function to extract leaf pages recursively
    function Get-LeafPages {
        param($Page, [string]$Prefix)
        $leaves = @()
        if ((-not $Page.subPages) -or ($Page.subPages.Count -eq 0)) {
            if ($Page.path -and $Page.path -ne "/") {
                $key = "$Prefix$($Page.path)"
                $leaves += $key
            }
        } else {
            foreach ($sub in $Page.subPages) {
                $leaves += Get-LeafPages -Page $sub -Prefix $Prefix
            }
        }
        return $leaves
    }

    if ($pathScopes.Count -gt 0) {
        # Scoped crawl: crawl each path scope separately
        foreach ($scope in $pathScopes) {
            Write-Host "    Scope: $scope"
            try {
                $env:MSYS_NO_PATHCONV = "1"
                $raw = az devops wiki page show `
                    --org $orgUrl `
                    --project $project `
                    --wiki $wikiName `
                    --path $scope `
                    --recursion-level full `
                    --output json 2>$null
                $env:MSYS_NO_PATHCONV = $null

                if ($raw) {
                    $resp = $raw | ConvertFrom-Json
                    $page = if ($resp.page) { $resp.page } else { $resp }
                    $leaves = Get-LeafPages -Page $page -Prefix $prefix
                    $allLeaves += $leaves
                    Write-Host "    Found $($leaves.Count) leaf pages under $scope"
                }
            } catch {
                Write-Warning "    Failed to crawl scope $scope : $_"
            }
        }
    } else {
        # Full crawl from root
        # Try full recursion first
        try {
            $env:MSYS_NO_PATHCONV = "1"
            $raw = az devops wiki page show `
                --org $orgUrl `
                --project $project `
                --wiki $wikiName `
                --path "/" `
                --recursion-level full `
                --output json 2>$null
            $env:MSYS_NO_PATHCONV = $null

            if ($raw) {
                $resp = $raw | ConvertFrom-Json
                $page = if ($resp.page) { $resp.page } else { $resp }
                $leaves = Get-LeafPages -Page $page -Prefix $prefix
                $allLeaves += $leaves
                Write-Host "    Found $($leaves.Count) leaf pages (full crawl)"
            }
        } catch {
            Write-Warning "    Full crawl failed, trying segmented..."
            # Segmented crawl: get top-level, then crawl each
            try {
                $env:MSYS_NO_PATHCONV = "1"
                $rawTop = az devops wiki page show `
                    --org $orgUrl `
                    --project $project `
                    --wiki $wikiName `
                    --path "/" `
                    --recursion-level oneLevel `
                    --output json 2>$null
                $env:MSYS_NO_PATHCONV = $null

                if ($rawTop) {
                    $respTop = $rawTop | ConvertFrom-Json
                    $topPage = if ($respTop.page) { $respTop.page } else { $respTop }
                    foreach ($sub in $topPage.subPages) {
                        $subPath = $sub.path
                        Write-Host "    Segment: $subPath"
                        try {
                            $env:MSYS_NO_PATHCONV = "1"
                            $rawSub = az devops wiki page show `
                                --org $orgUrl `
                                --project $project `
                                --wiki $wikiName `
                                --path $subPath `
                                --recursion-level full `
                                --output json 2>$null
                            $env:MSYS_NO_PATHCONV = $null

                            if ($rawSub) {
                                $respSub = $rawSub | ConvertFrom-Json
                                $subPage = if ($respSub.page) { $respSub.page } else { $respSub }
                                $leaves = Get-LeafPages -Page $subPage -Prefix $prefix
                                $allLeaves += $leaves
                            }
                        } catch {
                            Write-Warning "    Failed segment $subPath"
                        }
                    }
                }
            } catch {
                Write-Error "    Segmented crawl also failed for $org/$project/$wikiName"
            }
        }
    }
}

# Deduplicate
$allLeaves = @($allLeaves | Sort-Object -Unique)

# Validate: every key must contain ":"
$invalid = $allLeaves | Where-Object { $_ -notmatch ":" }
if ($invalid.Count -gt 0) {
    Write-Warning "Found $($invalid.Count) keys without ':' prefix - these are invalid!"
    $allLeaves = $allLeaves | Where-Object { $_ -match ":" }
}

# Output
$result = @{
    product = $ProductId
    leafCount = $allLeaves.Count
    leaves = $allLeaves
    crawledAt = (Get-Date -Format "o")
}

$result | ConvertTo-Json -Depth 5 -Compress | Out-File -FilePath $OutputFile -Encoding utf8
Write-Host "[$ProductId] Total leaf pages: $($allLeaves.Count) -> $OutputFile"
