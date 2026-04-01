# OneNote to Markdown Exporter via COM API (bypasses sensitivity labels)
# Usage:
#   Export entire notebook:   .\export-onenote.ps1 -NotebookName "Kun Fang OneNote" -OutputBase "C:\...\markdown"
#   Export a section:         .\export-onenote.ps1 -NotebookName "Kun Fang OneNote" -SectionPath "Readiness/Rest Plan" -OutputBase "..."
#   Export a single page:     .\export-onenote.ps1 -NotebookName "Kun Fang OneNote" -PageName "RPT" -OutputBase "..."
#   Combine filters:          .\export-onenote.ps1 -NotebookName "Kun Fang OneNote" -SectionPath "Cases" -PageName "BASF" -OutputBase "..."
#   Export from OneNote link: .\export-onenote.ps1 -Link "onenote:https://...#section-id={...}&page-id={...}" -OutputBase "..."
#                             .\export-onenote.ps1 -Link "https://.../_layouts/Doc.aspx?...&wd=target(...)" -OutputBase "..."

param(
    [string]$NotebookName = "",          # Empty = infer from Link or error
    [string]$OutputBase = "",            # Base output directory (notebook name auto-appended)
    [string]$SectionPath = "",           # Filter by section path (e.g. "Readiness/Rest Plan/ADFS"), supports partial match
    [string]$PageName = "",              # Filter by page name (exact or regex match)
    [string]$Link = "",                  # OneNote link (SharePoint URL or onenote: protocol), auto-detects section/page
    [switch]$Force = $false              # Force full re-export, ignoring incremental checks
)

$ErrorActionPreference = "Continue"

# --- Helpers ---
function Convert-OneNoteXmlToMarkdown {
    param([xml]$PageXml, [string]$PageName, [string]$ImgDir, [string]$ImgRelPath)

    $ns = New-Object System.Xml.XmlNamespaceManager($PageXml.NameTable)
    $ns.AddNamespace("one", "http://schemas.microsoft.com/office/onenote/2013/onenote")

    $lines = @()
    $script:imgCounter = 0

    # Title
    $titleNode = $PageXml.SelectSingleNode("//one:Title/one:OE/one:T", $ns)
    if ($titleNode) {
        $titleText = Strip-Html $titleNode.InnerText
        $lines += "# $titleText"
        $lines += ""
    }

    # FIX 1: Collect ALL elements (Outlines + floating Images) in document order
    # Floating images are direct children of one:Page, not inside any Outline
    $pageNode = $PageXml.DocumentElement
    $topLevelChildren = $pageNode.SelectNodes("one:Outline | one:Image", $ns)

    foreach ($child in $topLevelChildren) {
        if ($child.LocalName -eq "Outline") {
            $result = Process-OEChildren $child $ns 0 $ImgDir $ImgRelPath
            $lines += $result
            $lines += ""
        }
        elseif ($child.LocalName -eq "Image") {
            # Floating image directly on the page canvas
            $imgResult = Save-OneNoteImage $child $ns $ImgDir $ImgRelPath
            if ($imgResult) {
                $lines += $imgResult
                $lines += ""
            }
        }
    }

    return ($lines -join "`n")
}

function Process-OEChildren {
    param($node, $ns, [int]$depth, [string]$ImgDir, [string]$ImgRelPath)

    $lines = @()
    $children = $node.SelectNodes("one:OEChildren/one:OE | one:OE", $ns)

    foreach ($oe in $children) {
        $line = ""

        # Check for list formatting
        $listNode = $oe.SelectSingleNode("one:List/one:Bullet", $ns)
        $numberNode = $oe.SelectSingleNode("one:List/one:Number", $ns)
        $indent = "  " * $depth

        # Check for table
        $table = $oe.SelectSingleNode("one:Table", $ns)
        if ($table) {
            $lines += Process-Table $table $ns $ImgDir $ImgRelPath
            continue
        }

        # Check for image - extract and save
        $image = $oe.SelectSingleNode("one:Image", $ns)
        if ($image) {
            $imgResult = Save-OneNoteImage $image $ns $ImgDir $ImgRelPath
            if ($imgResult) {
                $lines += "${indent}$imgResult"
            }
        }

        # Get text content
        $textNodes = $oe.SelectNodes("one:T", $ns)
        if ($textNodes.Count -gt 0) {
            $rawText = ($textNodes | ForEach-Object { $_.InnerText }) -join ""
            $text = Convert-InlineHtml $rawText

            if ($listNode) {
                $line = "${indent}- $text"
            } elseif ($numberNode) {
                $line = "${indent}1. $text"
            } else {
                $line = "${indent}$text"
            }

            if ($line.Trim()) {
                $lines += $line
            }
        }

        # Recurse into children
        $subChildren = $oe.SelectSingleNode("one:OEChildren", $ns)
        if ($subChildren) {
            $subResult = Process-OEChildren $oe $ns ($depth + 1) $ImgDir $ImgRelPath
            $lines += $subResult
        }
    }

    return $lines
}

function Save-OneNoteImage {
    param($imageNode, $ns, [string]$ImgDir, [string]$ImgRelPath)

    $dataNode = $imageNode.SelectSingleNode("one:Data", $ns)
    if (-not $dataNode -or -not $dataNode.InnerText.Trim()) {
        return $null
    }

    # Determine format
    $format = $imageNode.GetAttribute("format")
    if (-not $format) { $format = "png" }
    $ext = switch ($format.ToLower()) {
        "png"  { "png" }
        "jpg"  { "jpg" }
        "jpeg" { "jpg" }
        "gif"  { "gif" }
        "bmp"  { "bmp" }
        "emf"  { "png" }
        "wmf"  { "png" }
        default { "png" }
    }

    $script:imgCounter++
    $imgFileName = "$($script:imgPrefix)-$($script:imgCounter).$ext"

    # Ensure image directory exists
    if (-not (Test-Path -LiteralPath $ImgDir)) {
        New-Item -ItemType Directory -Path $ImgDir -Force | Out-Null
    }

    try {
        $base64 = $dataNode.InnerText.Trim()
        $bytes = [Convert]::FromBase64String($base64)
        $imgPath = Join-Path $ImgDir $imgFileName
        [System.IO.File]::WriteAllBytes($imgPath, $bytes)
        $script:totalImages++

        # Return markdown image reference (use forward slashes for md compatibility)
        $relPath = "$ImgRelPath/$imgFileName" -replace '\\', '/'
        return "![image]($relPath)"
    }
    catch {
        return "<!-- image export failed: $($_.Exception.Message) -->"
    }
}

function Process-Table {
    param($table, $ns, [string]$ImgDir, [string]$ImgRelPath)

    $rows = $table.SelectNodes("one:Row", $ns)

    # First pass: collect all cell contents to decide format
    $allRowData = @()
    $maxCellLen = 0
    foreach ($row in $rows) {
        $cells = $row.SelectNodes("one:Cell", $ns)
        $rowData = @()
        foreach ($cell in $cells) {
            $cellContent = Process-CellContent $cell $ns $ImgDir $ImgRelPath
            if ($cellContent.Length -gt $maxCellLen) { $maxCellLen = $cellContent.Length }
            $rowData += $cellContent
        }
        $allRowData += ,@($rowData)
    }

    # Use HTML table if any cell is long (>80 chars) or contains newlines
    $useHtml = $false
    foreach ($rowData in $allRowData) {
        foreach ($c in $rowData) {
            if ($c.Length -gt 80 -or $c -match "`n") { $useHtml = $true; break }
        }
        if ($useHtml) { break }
    }

    if ($useHtml) {
        return Format-HtmlTable $allRowData
    } else {
        return Format-MdTable $allRowData
    }
}

function Process-CellContent {
    param($cell, $ns, [string]$ImgDir, [string]$ImgRelPath)

    $parts = @()

    # In OneNote XML, cell structure is: Cell > OEChildren > OE > T
    # Select all leaf OE elements (those that contain T or Image directly)
    $oeNodes = $cell.SelectNodes(".//one:OE", $ns)
    foreach ($oe in $oeNodes) {
        # Image in this OE
        $img = $oe.SelectSingleNode("one:Image", $ns)
        if ($img) {
            $imgRef = Save-OneNoteImage $img $ns $ImgDir $ImgRelPath
            if ($imgRef) { $parts += $imgRef }
        }

        # Text in this OE
        $textNodes = $oe.SelectNodes("one:T", $ns)
        if ($textNodes.Count -gt 0) {
            $rawText = ($textNodes | ForEach-Object { $_.InnerText }) -join ""
            $text = Convert-InlineHtml $rawText
            if ($text.Trim()) { $parts += $text.Trim() }
        }
    }

    if ($parts.Count -eq 0) { return "" }
    return ($parts -join "`n")
}

function Format-HtmlTable {
    param($allRowData)

    $lines = @()
    $lines += ""
    $lines += "<table>"

    $isFirst = $true
    foreach ($rowData in $allRowData) {
        $lines += "<tr>"
        $tag = if ($isFirst) { "th" } else { "td" }
        foreach ($cell in $rowData) {
            # Convert markdown links to HTML links, preserve images
            $htmlCell = $cell -replace "`n", "<br>"
            $lines += "  <$tag>$htmlCell</$tag>"
        }
        $lines += "</tr>"
        $isFirst = $false
    }

    $lines += "</table>"
    $lines += ""
    return $lines
}

function Format-MdTable {
    param($allRowData)

    $mdRows = @()
    $isFirst = $true

    foreach ($rowData in $allRowData) {
        $escapedCells = @()
        foreach ($c in $rowData) {
            $escapedCells += ($c -replace "\|", "\|")
        }
        $mdRows += "| " + ($escapedCells -join " | ") + " |"

        if ($isFirst) {
            $separator = "| " + (($escapedCells | ForEach-Object { "---" }) -join " | ") + " |"
            $mdRows += $separator
            $isFirst = $false
        }
    }

    return $mdRows
}

function Strip-Html {
    param([string]$text)
    # Remove HTML tags but keep content
    $text = $text -replace '<br\s*/?>', "`n"
    $text = $text -replace '<[^>]+>', ''
    $text = [System.Web.HttpUtility]::HtmlDecode($text)
    return $text.Trim()
}

function Convert-InlineHtml {
    param([string]$text)

    # Bold
    $text = $text -replace "<span[^>]*font-weight:\s*bold[^>]*>([^<]*)</span>", '**$1**'
    # Italic
    $text = $text -replace "<span[^>]*font-style:\s*italic[^>]*>([^<]*)</span>", '*$1*'
    # Underline (keep as-is in md, no standard syntax)

    # Links: convert OneNote internal links to Wikilinks, keep external as markdown links
    # (?s) = Singleline mode so . matches newlines (OneNote XML has linebreaks inside tags)
    # (.*?) instead of ([^<]*) to handle nested <span> inside <a> tags
    $text = [regex]::Replace($text, '(?s)<a\s+href="([^"]*)"[^>]*>(.*?)</a>', {
        param($m)
        $url = $m.Groups[1].Value
        # Strip nested HTML tags (e.g. <span lang=en-US>RPT</span> -> RPT)
        $linkText = $m.Groups[2].Value -replace '<[^>]+>', ''
        $linkText = $linkText.Trim()

        if ($url -match 'onenote:' -or $url -match '\.one#') {
            # OneNote internal link -> extract page name from URL or use link text
            $pageName = $linkText
            # Try extract page name from URL fragment (after # and URL-decode)
            if ($url -match '#([^&]+)') {
                $fragment = [System.Web.HttpUtility]::UrlDecode($matches[1])
                # Remove section prefix like "Section Name/"
                if ($fragment -match '/([^/]+)$') { $fragment = $matches[1] }
                # Remove &end params
                $fragment = $fragment -replace '&.*$', ''
                if ($fragment.Trim()) { $pageName = $fragment.Trim() }
            }
            # Clean up page name
            $pageName = $pageName -replace '\s+', ' '
            $pageName = $pageName.Trim()
            if ($pageName) { return "[[$pageName]]" }
            else { return $linkText }
        }
        elseif ($url -match 'safelinks\.protection\.outlook\.com') {
            # Outlook safelinks -> extract original URL
            if ($url -match '[?&]url=([^&]+)') {
                $originalUrl = [System.Web.HttpUtility]::UrlDecode($matches[1])
                return "[$linkText]($originalUrl)"
            }
            return "[$linkText]($url)"
        }
        else {
            # Normal external link
            return "[$linkText]($url)"
        }
    })

    # Strip remaining HTML
    $text = $text -replace '<br\s*/?>', "`n"
    $text = $text -replace '<[^>]+>', ''
    $text = [System.Web.HttpUtility]::HtmlDecode($text)

    return $text
}

function Sanitize-FileName {
    param([string]$name, [int]$maxLen = 50)
    $name = $name -replace '[\\/:*?"<>|]', '_'
    if ($name.Length -gt $maxLen) { $name = $name.Substring(0, $maxLen) }
    return $name.Trim()
}

function Sanitize-ImgPrefix {
    param([string]$name)
    # For image file names: also replace spaces to avoid markdown path issues
    $name = $name -replace '[\\/:*?"<>|\s]', '_'
    if ($name.Length -gt 40) { $name = $name.Substring(0, 40) }
    return $name.Trim('_')
}

function Get-FrontmatterModified {
    param([string]$filePath)
    # Read the first 10 lines to extract "modified:" value from YAML frontmatter
    # Use -LiteralPath everywhere: page names often contain [] which PowerShell treats as wildcards
    if (-not (Test-Path -LiteralPath $filePath)) { return $null }
    try {
        $lines = @(Get-Content -LiteralPath $filePath -TotalCount 10 -ErrorAction Stop)
        $inFrontmatter = $false
        foreach ($line in $lines) {
            if ($line -eq '---' -and -not $inFrontmatter) {
                $inFrontmatter = $true
                continue
            }
            if ($line -eq '---' -and $inFrontmatter) {
                break
            }
            if ($inFrontmatter -and $line -match '^\s*modified:\s*(.+)$') {
                return $matches[1].Trim()
            }
        }
    } catch {}
    return $null
}

function Get-FrontmatterContentHash {
    param([string]$filePath)
    # Read the first 10 lines to extract "content_hash:" value from YAML frontmatter
    if (-not (Test-Path -LiteralPath $filePath)) { return $null }
    try {
        $lines = @(Get-Content -LiteralPath $filePath -TotalCount 10 -ErrorAction Stop)
        $inFrontmatter = $false
        foreach ($line in $lines) {
            if ($line -eq '---' -and -not $inFrontmatter) {
                $inFrontmatter = $true
                continue
            }
            if ($line -eq '---' -and $inFrontmatter) {
                break
            }
            if ($inFrontmatter -and $line -match '^\s*content_hash:\s*(.+)$') {
                return $matches[1].Trim()
            }
        }
    } catch {}
    return $null
}

function Get-ContentHash {
    param([string]$content)
    # Compute MD5 hash of content string
    $md5 = [System.Security.Cryptography.MD5]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
    $hashBytes = $md5.ComputeHash($bytes)
    $md5.Dispose()
    return ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""
}

function List-AvailableNotebooks {
    param($xdoc, $ns)
    Write-Host ""
    Write-Host "Available notebooks and their sections:" -ForegroundColor Yellow
    $notebooks = $xdoc.SelectNodes("//one:Notebook", $ns)
    foreach ($nb in $notebooks) {
        $nbName = $nb.GetAttribute("name")
        Write-Host "  Notebook: $nbName" -ForegroundColor Cyan
        $sections = $nb.SelectNodes(".//one:Section", $ns)
        foreach ($sec in $sections) {
            $secName = $sec.GetAttribute("name")
            # Build section path by walking up
            $pathParts = @($secName)
            $p = $sec.ParentNode
            while ($p -and $p.LocalName -ne "Notebook") {
                if ($p.LocalName -eq "SectionGroup" -and $p.GetAttribute("name") -ne "OneNote_RecycleBin") {
                    $pathParts = @($p.GetAttribute("name")) + $pathParts
                }
                $p = $p.ParentNode
            }
            $secPath = $pathParts -join "/"
            Write-Host "    - $secPath" -ForegroundColor Gray
        }
    }
}

# --- Load System.Web for HtmlDecode ---
Add-Type -AssemblyName System.Web

# --- Validate parameters ---
if (-not $OutputBase) {
    Write-Host "ERROR: -OutputBase is required. Specify the base output directory." -ForegroundColor Red
    Write-Host "Usage: .\export-onenote.ps1 -OutputBase 'C:\path\to\output' [-NotebookName '...'] [-Link '...']"
    exit 1
}

# --- Main ---
Write-Host "=== OneNote Markdown Exporter (COM API) ===" -ForegroundColor Cyan

# Connect to OneNote
$OneNote = New-Object -ComObject OneNote.Application

# Get hierarchy
[string]$hierarchyXml = ""
# hsPages = 4 (use numeric value because pwsh doesn't auto-load OneNote Interop types)
# HierarchyScope: 0=hsSelf, 1=hsChildren, 2=hsNotebooks, 3=hsSections, 4=hsPages
$OneNote.GetHierarchy("", 4, [ref]$hierarchyXml)

$xdoc = [xml]$hierarchyXml
$ns = New-Object System.Xml.XmlNamespaceManager($xdoc.NameTable)
$ns.AddNamespace("one", "http://schemas.microsoft.com/office/onenote/2013/onenote")

# --- Parse -Link parameter ---
if ($Link) {
    Add-Type -AssemblyName System.Web
    # Use UnescapeDataString for path (preserves '+' as literal)
    # Use UrlDecode for query/fragment ('+' means space)
    $decoded = [Uri]::UnescapeDataString($Link)

    Write-Host "Parsing link..." -ForegroundColor Yellow

    # Extract section name from .one filename (e.g. "VM+SCIM.one" or "Rest Plan.one")
    # Note: '+' in URL path is literal (not space), only decode %XX sequences
    $linkSectionName = ""
    if ($decoded -match '([^/\\|?&{}()=]+)\.one') {
        $linkSectionName = $matches[1].Trim()
        Write-Host "  Section name: $linkSectionName" -ForegroundColor Gray
    }

    # --- Extract notebook name from URL path ---
    # onenote: protocol with base-path: extract notebook name from path before .one
    # e.g. base-path=https://.../Kun Fang OneNote/Readiness/Rest Plan.one
    $linkNotebookName = ""
    if ($decoded -match 'base-path=https?://[^/]+/[^/]+/[^/]+/[^/]+/(.+)/[^/]+\.one') {
        # Path structure: host/sites/SiteName/Shared Documents/NotebookName/.../Section.one
        # We need to find the notebook name which is the first path segment after the document library
        $pathAfterLib = $matches[1]
        # The notebook name is the first segment
        if ($pathAfterLib -match '^([^/]+)') {
            $linkNotebookName = $matches[1]
            Write-Host "  Notebook name (from onenote: path): $linkNotebookName" -ForegroundColor Gray
        }
    }
    # SharePoint URL: try to extract from path
    elseif ($decoded -match 'sharepoint\.com/.+/([^/]+)/[^/]+\.one') {
        $linkNotebookName = $matches[1]
        Write-Host "  Notebook name (from SharePoint path): $linkNotebookName" -ForegroundColor Gray
    }

    # Extract page name from onenote: fragment
    # Fragment format: #PageName&section-id={...}&page-id={...}&end
    # Note: page name may contain '&' (e.g. "Kusto Endpoint & Permissions")
    # so we match up to "&section-id=" or "&page-id=" instead of first '&'
    $linkPageName = ""
    if ($decoded -match '#(.+?)&(?:section-id|page-id)=') {
        $linkPageName = $matches[1].Trim()
        Write-Host "  Page name (from fragment): $linkPageName" -ForegroundColor Gray
    }

    # SharePoint URL: extract page name from wd=target() if it contains page ref
    # Format: wd=target(Section.one|SectionGuid/PageName|PageGuid/)
    if (-not $linkPageName -and $decoded -match 'target\([^|]+\|[^/]+/([^|]+)\|') {
        $linkPageName = $matches[1].Trim()
        Write-Host "  Page name (from target): $linkPageName" -ForegroundColor Gray
    }

    # --- Resolve section name against hierarchy to find notebook ---
    $resolvedNotebook = $null
    if ($linkSectionName) {
        $allSections = $xdoc.SelectNodes("//one:Section", $ns)
        foreach ($s in $allSections) {
            if ($s.GetAttribute("name") -eq $linkSectionName) {
                # Walk up to find notebook
                $parent = $s.ParentNode
                while ($parent -and $parent.LocalName -ne "Notebook") { $parent = $parent.ParentNode }
                if ($parent) { $resolvedNotebook = $parent }

                Write-Host "  Resolved section: $linkSectionName" -ForegroundColor Green
                $SectionPath = $linkSectionName
                break
            }
        }
    }

    if ($resolvedNotebook) {
        $NotebookName = $resolvedNotebook.GetAttribute("name")
        Write-Host "  Resolved notebook (from hierarchy): $NotebookName" -ForegroundColor Green
    }
    elseif ($linkNotebookName -and -not $NotebookName) {
        # Fallback: use notebook name extracted from URL path
        $NotebookName = $linkNotebookName
        Write-Host "  Using notebook name from URL path: $NotebookName" -ForegroundColor Yellow
    }

    if ($linkPageName) {
        # URL fragment loses '&' in page names (treated as param separator)
        # e.g. "Kusto Endpoint & Permissions" → "Kusto Endpoint  Permissions" (double space)
        # Build a fuzzy regex: collapse multiple spaces into \s+.* to match '&' or extra spaces
        $fuzzyName = ($linkPageName -replace '\s{2,}', '\s.*') -replace '\s', '\s'
        $PageName = "^" + $fuzzyName + "$"
        Write-Host "  Will filter by page name: $linkPageName (regex: $PageName)" -ForegroundColor Green
    }

    Write-Host ""
}

# --- Validate NotebookName ---
if (-not $NotebookName) {
    Write-Host "ERROR: Could not determine notebook name." -ForegroundColor Red
    Write-Host "Please specify -NotebookName or provide a -Link that contains notebook info." -ForegroundColor Red
    List-AvailableNotebooks $xdoc $ns
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($OneNote) | Out-Null
    exit 1
}

# Find target notebook
$notebook = $xdoc.SelectNodes("//one:Notebook", $ns) | Where-Object { $_.GetAttribute("name") -eq $NotebookName }

if (-not $notebook) {
    Write-Host "ERROR: Notebook '$NotebookName' not found!" -ForegroundColor Red
    List-AvailableNotebooks $xdoc $ns
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($OneNote) | Out-Null
    exit 1
}

# --- Compute output directory: OutputBase/NotebookName ---
$OutputDir = Join-Path $OutputBase (Sanitize-FileName $NotebookName 100)

Write-Host "Target notebook: $NotebookName" -ForegroundColor Green
Write-Host "Output: $OutputDir"
Write-Host ""

# Collect all pages with their path
$script:allPages = [System.Collections.ArrayList]::new()

function Collect-Pages {
    param($parentNode, $ns, [string]$path)

    # Process sections
    $sections = $parentNode.SelectNodes("one:Section", $ns)
    foreach ($section in $sections) {
        $sectionName = Sanitize-FileName $section.GetAttribute("name")
        $sectionPath = if ($path) { "$path\$sectionName" } else { $sectionName }

        $pages = $section.SelectNodes("one:Page", $ns)
        foreach ($page in $pages) {
            $levelStr = $page.GetAttribute("pageLevel")
            $level = if ($levelStr) { [int]$levelStr } else { 1 }
            $null = $script:allPages.Add([PSCustomObject]@{
                Id           = $page.GetAttribute("ID")
                Name         = $page.GetAttribute("name")
                Path         = $sectionPath
                Level        = $level
                ModifiedTime = $page.GetAttribute("lastModifiedTime")
            })
        }
    }

    # Process section groups
    $groups = $parentNode.SelectNodes("one:SectionGroup", $ns)
    foreach ($group in $groups) {
        $groupName = $group.GetAttribute("name")
        # Skip recycle bin
        if ($groupName -eq "OneNote_RecycleBin") { continue }
        $groupName = Sanitize-FileName $groupName
        $groupPath = if ($path) { "$path\$groupName" } else { $groupName }
        Collect-Pages $group $ns $groupPath
    }
}

Collect-Pages $notebook $ns ""

# Save unfiltered list BEFORE applying filters (for sub-page ancestor lookup)
$allPagesUnfiltered = $script:allPages
$allPages = $script:allPages

# Apply filters
if ($SectionPath) {
    $filterPath = $SectionPath -replace '/', '\'
    # Use .Contains() instead of -like to avoid [] being treated as wildcard char classes
    $allPages = @($allPages | Where-Object { $_.Path.IndexOf($filterPath, [StringComparison]::OrdinalIgnoreCase) -ge 0 })
    Write-Host "Filter by section: $SectionPath -> $($allPages.Count) pages" -ForegroundColor Yellow
}
if ($PageName) {
    $matchedPages = @($allPages | Where-Object { $_.Name -match $PageName })
    # Forward scan: include sub-pages (higher pageLevel) following each matched page
    $expandedPages = [System.Collections.Generic.List[object]]::new()
    foreach ($matched in $matchedPages) {
        $expandedPages.Add($matched)
        # Find this page's index in the unfiltered list
        $idx = -1
        for ($i = 0; $i -lt $allPagesUnfiltered.Count; $i++) {
            if ($allPagesUnfiltered[$i].Id -eq $matched.Id) {
                $idx = $i
                break
            }
        }
        if ($idx -ge 0) {
            # Scan forward: collect consecutive pages with Level > matched.Level in same section
            for ($j = $idx + 1; $j -lt $allPagesUnfiltered.Count; $j++) {
                $candidate = $allPagesUnfiltered[$j]
                if ($candidate.Path -ne $matched.Path) { break }  # different section
                if ($candidate.Level -le $matched.Level) { break }  # same or higher level = sibling/parent
                # This is a sub-page — include it (avoid duplicates)
                if (-not ($expandedPages | Where-Object { $_.Id -eq $candidate.Id })) {
                    $expandedPages.Add($candidate)
                }
            }
        }
    }
    $allPages = @($expandedPages)
    $subCount = $allPages.Count - $matchedPages.Count
    Write-Host "Filter by page: $PageName -> $($matchedPages.Count) matched + $subCount sub-pages = $($allPages.Count) total" -ForegroundColor Yellow
}

if ($allPages.Count -eq 0) {
    Write-Host "No pages matched the filter criteria!" -ForegroundColor Red
    Write-Host "Available sections:"
    $allPagesUnfiltered | ForEach-Object { $_.Path } | Sort-Object -Unique | ForEach-Object { Write-Host "  - $_" }
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($OneNote) | Out-Null
    exit 1
}

$totalPages = $allPages.Count
$exportMode = if ($Force) { "full (forced)" } else { "incremental" }
Write-Host "Total pages to export: $totalPages (mode: $exportMode)"
Write-Host ""

# Create output directory (only wipe on -Force full notebook export)
if ($Force -and -not $SectionPath -and -not $PageName) {
    if (Test-Path $OutputDir) { Remove-Item $OutputDir -Recurse -Force }
}
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$successCount = 0
$skipCount = 0
$errorCount = 0
$errorPages = @()
$script:totalImages = 0
$usedPaths = @{}  # Track output file paths to detect duplicate page names

# Export each page
for ($i = 0; $i -lt $allPages.Count; $i++) {
    $page = $allPages[$i]
    $progress = $i + 1
    $pct = [math]::Round(($progress / $totalPages) * 100)

    Write-Host "[$progress/$totalPages] ($pct%) $($page.Path)\$($page.Name)" -NoNewline

    try {
        # --- Compute output path FIRST (needed for incremental check) ---
        $pageSafeName = Sanitize-FileName $page.Name
        $outDir = Join-Path $OutputDir $page.Path

        # Handle page hierarchy (level > 1 = sub-page)
        if ($page.Level -gt 1) {
            $fullIdx = -1
            for ($k = 0; $k -lt $allPagesUnfiltered.Count; $k++) {
                if ($allPagesUnfiltered[$k].Id -eq $page.Id) {
                    $fullIdx = $k
                    break
                }
            }
            if ($fullIdx -gt 0) {
                $ancestors = @()
                $currentLevel = $page.Level
                for ($j = $fullIdx - 1; $j -ge 0; $j--) {
                    $candidate = $allPagesUnfiltered[$j]
                    if ($candidate.Path -ne $page.Path) { continue }
                    if ($candidate.Level -lt $currentLevel) {
                        $ancestors = @(Sanitize-FileName $candidate.Name) + $ancestors
                        $currentLevel = $candidate.Level
                        if ($currentLevel -le 1) { break }
                    }
                }
                foreach ($anc in $ancestors) {
                    $outDir = Join-Path $outDir $anc
                }
            }
        }

        $outFile = Join-Path $outDir "$pageSafeName.md"

        # --- Deduplicate: append suffix for pages with same output path ---
        $outFileLower = $outFile.ToLower()
        if ($usedPaths.ContainsKey($outFileLower)) {
            $usedPaths[$outFileLower]++
            $suffix = $usedPaths[$outFileLower]
            $outFile = Join-Path $outDir "$pageSafeName ($suffix).md"
        } else {
            $usedPaths[$outFileLower] = 1
        }

        # --- Incremental check: skip if page unchanged (unless -Force) ---
        if (-not $Force) {
            $localModified = Get-FrontmatterModified $outFile
            if ($localModified -and $page.ModifiedTime -and $localModified -eq $page.ModifiedTime) {
                Write-Host " SKIP (unchanged)" -ForegroundColor DarkGray
                $skipCount++
                continue
            }
        }

        # --- Fetch page content (expensive: includes image binary data) ---
        [string]$pageXml = ""
        # piAll = 3: include binary data (images/attachments)
        $OneNote.GetPageContent($page.Id, [ref]$pageXml, 3)

        $pageDoc = [xml]$pageXml

        # Get page timestamps
        # Use hierarchy lastModifiedTime for "modified" (same source as incremental check)
        # This ensures consistency: what we write == what we compare against on next run
        $created = $pageDoc.DocumentElement.GetAttribute("dateTime")
        $modified = $page.ModifiedTime

        # Convert to markdown (with image extraction)
        $imgDir = Join-Path $outDir "assets"
        $imgRelPath = "./assets"
        # Use page-specific prefix to avoid filename collisions in shared assets dirs
        # Include dedup suffix if page name was duplicated
        $imgPrefixBase = Sanitize-ImgPrefix $page.Name
        if ($usedPaths[$outFileLower] -gt 1) {
            $script:imgPrefix = "$imgPrefixBase`_$($usedPaths[$outFileLower])"
        } else {
            $script:imgPrefix = $imgPrefixBase
        }

        $markdown = Convert-OneNoteXmlToMarkdown $pageDoc $page.Name $imgDir $imgRelPath

        # --- Content hash check: avoid false incremental when timestamp drifts ---
        $newContentHash = Get-ContentHash $markdown
        if (-not $Force -and (Test-Path -LiteralPath $outFile)) {
            $localContentHash = Get-FrontmatterContentHash $outFile
            if ($localContentHash -and $localContentHash -eq $newContentHash) {
                # Content identical — only update frontmatter timestamps, skip full rewrite
                try {
                    $existingContent = [System.IO.File]::ReadAllText($outFile, [System.Text.Encoding]::UTF8)
                    # Replace modified: line in frontmatter
                    $updatedContent = $existingContent -replace '(?m)^modified:\s*.+$', "modified: $modified"
                    [System.IO.File]::WriteAllText($outFile, $updatedContent, [System.Text.Encoding]::UTF8)
                    Write-Host " UPDATE (timestamp only)" -ForegroundColor DarkCyan
                    $skipCount++
                    continue
                } catch {
                    # Fall through to full rewrite on error
                }
            }
        }

        # Add frontmatter (with content_hash)
        $frontmatter = @"
---
title: "$($page.Name)"
created: $created
modified: $modified
content_hash: $newContentHash
source: OneNote
---

"@
        $fullContent = $frontmatter + $markdown

        if (-not (Test-Path -LiteralPath $outDir)) {
            New-Item -ItemType Directory -Path $outDir -Force | Out-Null
        }

        [System.IO.File]::WriteAllText($outFile, $fullContent, [System.Text.Encoding]::UTF8)

        Write-Host " OK" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host " FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
        $errorPages += "$($page.Path)\$($page.Name): $($_.Exception.Message)"
    }
}

# Summary
Write-Host ""
Write-Host "=== Export Complete ===" -ForegroundColor Cyan
Write-Host "Notebook: $NotebookName" -ForegroundColor Green
Write-Host "Success: $successCount / $totalPages (exported)" -ForegroundColor Green
if ($skipCount -gt 0) {
    Write-Host "Skipped: $skipCount (unchanged)" -ForegroundColor DarkGray
}
Write-Host "Images:  $($script:totalImages) exported" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "Errors:  $errorCount" -ForegroundColor Red
    $errorPages | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}
Write-Host "Output:  $OutputDir"

# Cleanup
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($OneNote) | Out-Null
