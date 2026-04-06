<#
.SYNOPSIS
  Crawl an ADO wiki's page tree recursively and output leaf page keys as JSON.

.PARAMETER Org
  ADO organization name (e.g., "Supportability")

.PARAMETER Project
  ADO project name (e.g., "AzureIaaSVM")

.PARAMETER Wiki
  Wiki name. If not specified, auto-detects from project.

.PARAMETER PathScope
  JSON array of path prefixes to INCLUDE. If empty, all pages included.

.PARAMETER ExcludeScope
  JSON array of path prefixes to EXCLUDE. Applied after PathScope.

.PARAMETER SegmentedCrawl
  If set, crawl top-level first then each subtree separately (for large wikis).

.EXAMPLE
  pwsh -NoProfile -File scripts/crawl-wiki-leaves.ps1 -Org Supportability -Project AzureIaaSVM -PathScope '["/SME Topics"]'
#>

param(
    [Parameter(Mandatory)]
    [string]$Org,

    [Parameter(Mandatory)]
    [string]$Project,

    [string]$Wiki = "",

    [string]$PathScope = "[]",

    [string]$ExcludeScope = "[]",

    [switch]$SegmentedCrawl
)

$ErrorActionPreference = "Stop"

# Determine wiki name
if (-not $Wiki) {
    try {
        $wikiListJson = az devops wiki list --org "https://dev.azure.com/$Org" --project $Project --output json 2>$null
        $wikiList = $wikiListJson | ConvertFrom-Json
        if ($wikiList.Count -eq 0) {
            Write-Error "No wikis found for $Org/$Project"
            exit 1
        }
        $Wiki = $wikiList[0].name
        [Console]::Error.WriteLine("Auto-detected wiki: $Wiki")
    } catch {
        # Fallback: use project name as wiki name
        $Wiki = $Project
        [Console]::Error.WriteLine("Wiki list failed, using project name as wiki: $Wiki")
    }
}

$prefix = "$Org/$Project/${Wiki}:"

# Parse PathScope
$scopes = @()
if ($PathScope -ne "[]") {
    $scopes = $PathScope | ConvertFrom-Json
}

# Parse ExcludeScope
$excludes = @()
if ($ExcludeScope -ne "[]") {
    $excludes = $ExcludeScope | ConvertFrom-Json
}

function Get-Leaves {
    param($Page, [string]$ParentPath = "")

    $pagePath = $Page.path
    if (-not $pagePath) { $pagePath = $Page.Path }

    $hasSubPages = $false
    if ($Page.subPages -and $Page.subPages.Count -gt 0) {
        $hasSubPages = $true
    }

    if (-not $hasSubPages) {
        # Leaf node
        if ($pagePath -and $pagePath -ne "/") {
            Write-Output "$prefix$pagePath"
        }
    } else {
        foreach ($sub in $Page.subPages) {
            Get-Leaves -Page $sub -ParentPath $pagePath
        }
    }
}

function Unwrap-Page {
    param($Obj)
    # az devops wiki page show may wrap result in { "eTag": ..., "page": { ... } }
    if ($Obj.page) { return $Obj.page }
    return $Obj
}

function Crawl-Full {
    [Console]::Error.WriteLine("Crawling $Org/$Project/$Wiki (full recursion)...")
    $env:MSYS_NO_PATHCONV = "1"
    try {
        $json = az devops wiki page show `
            --org "https://dev.azure.com/$Org" `
            --project $Project `
            --wiki $Wiki `
            --path "/" `
            --recursion-level full `
            --output json 2>$null
        return (Unwrap-Page ($json | ConvertFrom-Json))
    } catch {
        [Console]::Error.WriteLine("Full crawl failed: $_")
        return $null
    }
}

function Crawl-Segmented {
    [Console]::Error.WriteLine("Crawling $Org/$Project/$Wiki (segmented)...")
    $env:MSYS_NO_PATHCONV = "1"

    # Get top-level pages
    try {
        $topJson = az devops wiki page show `
            --org "https://dev.azure.com/$Org" `
            --project $Project `
            --wiki $Wiki `
            --path "/" `
            --recursion-level oneLevel `
            --output json 2>$null
        $topPage = Unwrap-Page ($topJson | ConvertFrom-Json)
    } catch {
        [Console]::Error.WriteLine("Top-level crawl failed: $_")
        return $null
    }

    if (-not $topPage.subPages -or $topPage.subPages.Count -eq 0) {
        return $topPage
    }

    $allSubPages = @()
    foreach ($sub in $topPage.subPages) {
        $subPath = $sub.path
        if (-not $subPath) { $subPath = $sub.Path }

        # If pathScope is set, skip top-level sections not matching any scope
        if ($scopes.Count -gt 0) {
            $matchesScope = $false
            foreach ($scope in $scopes) {
                if ($subPath.StartsWith($scope) -or $scope.StartsWith($subPath)) {
                    $matchesScope = $true
                    break
                }
            }
            if (-not $matchesScope) {
                [Console]::Error.WriteLine("  Skipping $subPath (not in pathScope)")
                continue
            }
        }

        [Console]::Error.WriteLine("  Crawling subtree: $subPath")
        try {
            $subJson = az devops wiki page show `
                --org "https://dev.azure.com/$Org" `
                --project $Project `
                --wiki $Wiki `
                --path $subPath `
                --recursion-level full `
                --output json 2>$null
            $subPage = Unwrap-Page ($subJson | ConvertFrom-Json)
            $allSubPages += $subPage
        } catch {
            [Console]::Error.WriteLine("  Failed to crawl $subPath : $_")
        }
    }

    # Reconstruct a fake root with all sub-pages
    $fakeRoot = @{
        path = "/"
        subPages = $allSubPages
    }
    return [PSCustomObject]$fakeRoot
}

# Crawl
if ($SegmentedCrawl) {
    $root = Crawl-Segmented
} else {
    $root = Crawl-Full
    if (-not $root) {
        [Console]::Error.WriteLine("Full crawl failed, trying segmented...")
        $root = Crawl-Segmented
    }
}

if (-not $root) {
    Write-Error "Failed to crawl wiki $Org/$Project/$Wiki"
    exit 1
}

# Extract leaves
$allLeaves = @(Get-Leaves -Page $root)
[Console]::Error.WriteLine("Total leaves before filtering: $($allLeaves.Count)")

# Apply pathScope filter
if ($scopes.Count -gt 0) {
    $filtered = @()
    foreach ($key in $allLeaves) {
        $parts = $key -split ":", 2
        if ($parts.Count -lt 2) { continue }
        $wikiPath = $parts[1]
        foreach ($scope in $scopes) {
            if ($wikiPath.StartsWith($scope)) {
                $filtered += $key
                break
            }
        }
    }
    $allLeaves = $filtered
    [Console]::Error.WriteLine("After pathScope filter: $($allLeaves.Count)")
}

# Apply excludeScope filter
if ($excludes.Count -gt 0) {
    $beforeExclude = $allLeaves.Count
    $filtered = @()
    foreach ($key in $allLeaves) {
        $parts = $key -split ":", 2
        if ($parts.Count -lt 2) { continue }
        $wikiPath = $parts[1]
        $excluded = $false
        foreach ($ex in $excludes) {
            if ($wikiPath.StartsWith($ex)) {
                $excluded = $true
                break
            }
        }
        if (-not $excluded) {
            $filtered += $key
        }
    }
    $allLeaves = $filtered
    [Console]::Error.WriteLine("After excludeScope filter: $($allLeaves.Count) (removed $($beforeExclude - $allLeaves.Count))")
}

# Validate keys (must contain ":")
$validLeaves = @()
foreach ($key in $allLeaves) {
    if ($key -match ":") {
        $validLeaves += $key
    } else {
        [Console]::Error.WriteLine("WARNING: Invalid key (no prefix): $key")
    }
}

[Console]::Error.WriteLine("Final leaf count: $($validLeaves.Count)")

# Output as JSON
$validLeaves | ConvertTo-Json -Depth 1
