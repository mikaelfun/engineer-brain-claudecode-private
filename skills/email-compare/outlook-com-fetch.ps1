param(
    [Parameter(Mandatory=$true)]
    [string]$CaseNumber,

    [Parameter(Mandatory=$true)]
    [string]$OutputPath,

    [switch]$SearchAllFolders
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$startTime = Get-Date

Write-Host "🔵 Connecting to Outlook COM..."
try {
    $outlook = New-Object -ComObject Outlook.Application
    $namespace = $outlook.GetNamespace("MAPI")
    Write-Host "✅ Connected to Outlook (Profile: $($namespace.CurrentProfileName))"
} catch {
    Write-Host "❌ ERR: Failed to connect to Outlook COM: $($_.Exception.Message)"
    exit 1
}

# ── Search function ──────────────────────────────────────────────────────────

function Search-OutlookFolder {
    param(
        [object]$Folder,
        [string]$SearchTerm,
        [System.Collections.Generic.List[object]]$Results
    )

    Write-Host "  📂 Searching: $($Folder.Name) ($($Folder.Items.Count) items)..."

    try {
        $filter = "@SQL=""urn:schemas:httpmail:subject"" LIKE '%$SearchTerm%' OR ""urn:schemas:httpmail:textdescription"" LIKE '%$SearchTerm%'"
        $items = $Folder.Items.Restrict($filter)

        foreach ($item in $items) {
            if ($item.Class -ne 43) { continue }  # 43 = olMail

            $attachmentNames = @()
            for ($i = 1; $i -le $item.Attachments.Count; $i++) {
                $att = $item.Attachments.Item($i)
                if ($att.FileName -match '\.(png|jpg|jpeg|gif|bmp)$' -and $item.HTMLBody -match "cid:") {
                    continue
                }
                $attachmentNames += $att.FileName
            }

            $emailObj = [PSCustomObject]@{
                subject         = $item.Subject
                from            = $item.SenderEmailAddress
                fromName        = $item.SenderName
                to              = $item.To
                cc              = $item.CC
                bcc             = $item.BCC
                sentDate        = $item.SentOn.ToString("yyyy-MM-ddTHH:mm:ssZ")
                receivedDate    = $item.ReceivedTime.ToString("yyyy-MM-ddTHH:mm:ssZ")
                bodyLength      = $item.Body.Length
                htmlBodyLength  = $item.HTMLBody.Length
                bodyPreview     = $item.Body.Substring(0, [Math]::Min(500, $item.Body.Length))
                bodyFull        = $item.Body
                attachmentCount = $attachmentNames.Count
                attachmentNames = $attachmentNames
                size            = $item.Size
                folder          = $Folder.FolderPath
            }
            $Results.Add($emailObj)
        }
    } catch {
        Write-Host "  ⚠️ Error searching $($Folder.Name): $($_.Exception.Message)"
    }
}

# ── Main search logic ────────────────────────────────────────────────────────

$results = [System.Collections.Generic.List[object]]::new()

if ($SearchAllFolders) {
    Write-Host "🔵 Searching ALL folders recursively..."

    function Search-Recursive {
        param([object]$ParentFolder, [string]$Term, [System.Collections.Generic.List[object]]$Res)
        Search-OutlookFolder -Folder $ParentFolder -SearchTerm $Term -Results $Res
        foreach ($sub in $ParentFolder.Folders) {
            Search-Recursive -ParentFolder $sub -Term $Term -Res $Res
        }
    }

    foreach ($store in $namespace.Stores) {
        Write-Host "📦 Store: $($store.DisplayName)"
        try {
            $root = $store.GetRootFolder()
            Search-Recursive -ParentFolder $root -Term $CaseNumber -Res $results
        } catch {
            Write-Host "  ⚠️ Cannot access store $($store.DisplayName): $($_.Exception.Message)"
        }
    }
} else {
    Write-Host "🔵 Searching Inbox + Sent Items..."
    $inbox = $namespace.GetDefaultFolder(6)
    $sentItems = $namespace.GetDefaultFolder(5)

    Search-OutlookFolder -Folder $inbox -SearchTerm $CaseNumber -Results $results
    Search-OutlookFolder -Folder $sentItems -SearchTerm $CaseNumber -Results $results
}

$endTime = Get-Date
$durationMs = [int]($endTime - $startTime).TotalMilliseconds

# ── Output ───────────────────────────────────────────────────────────────────

$sortedResults = $results | Sort-Object { [datetime]$_.sentDate }

$output = @{
    caseNumber      = $CaseNumber
    timestamp       = (Get-Date).ToString("yyyy-MM-ddTHH:mm:sszzz")
    duration_ms     = $durationMs
    searchMethod    = if ($SearchAllFolders) { "MAPI Recursive All Folders" } else { "MAPI Inbox+SentItems" }
    foldersSearched = ($results | Select-Object -ExpandProperty folder -Unique)
    emailCount      = $sortedResults.Count
    totalBodyBytes  = ($sortedResults | Measure-Object -Property bodyLength -Sum).Sum
    emails          = @($sortedResults | ForEach-Object {
        @{
            subject         = $_.subject
            from            = $_.from
            fromName        = $_.fromName
            to              = $_.to
            cc              = $_.cc
            bcc             = $_.bcc
            sentDate        = $_.sentDate
            receivedDate    = $_.receivedDate
            bodyLength      = $_.bodyLength
            htmlBodyLength  = $_.htmlBodyLength
            bodyPreview     = $_.bodyPreview
            bodyFull        = $_.bodyFull
            attachmentCount = $_.attachmentCount
            attachmentNames = $_.attachmentNames
            size            = $_.size
            folder          = $_.folder
        }
    })
}

$outputDir = Split-Path -Parent $OutputPath
if ($outputDir -and -not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$json = $output | ConvertTo-Json -Depth 5 -Compress:$false
[System.IO.File]::WriteAllText($OutputPath, $json, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "=== Outlook COM Results ==="
Write-Host "Case:       $CaseNumber"
Write-Host "Duration:   ${durationMs}ms"
Write-Host "Emails:     $($sortedResults.Count)"
Write-Host "Body Bytes: $($output.totalBodyBytes)"
Write-Host "Folders:    $($output.foldersSearched -join ', ')"
Write-Host "Output:     $OutputPath"
Write-Host "✅ Done"
