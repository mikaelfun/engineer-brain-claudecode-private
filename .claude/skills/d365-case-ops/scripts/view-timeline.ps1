<#
.SYNOPSIS
    查看当前 Case 的 Timeline 历史记录。
.DESCRIPTION
    切换到 Summary 标签页，获取 Timeline 快照，解析并返回结构化的 Timeline 条目列表。
    输出每条记录的类型、时间、来源、摘要。
.PARAMETER Count
    返回的最大条目数，默认 10。
.EXAMPLE
    pwsh scripts/view-timeline.ps1
    pwsh scripts/view-timeline.ps1 -Count 5
#>
param(
    [int]$Count = 10
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

Write-Host "🔵 Reading Timeline (max $Count entries)..."

# ── API Mode ──
$incidentId = Get-CurrentCaseId
if ($incidentId) {
    # Fetch emails, notes, phone calls in parallel via combined FetchXml queries
    $emailFetch = "<fetch count=`"$Count`"><entity name=`"email`"><attribute name=`"subject`"/><attribute name=`"from`"/><attribute name=`"statuscode`"/><attribute name=`"createdon`"/><attribute name=`"directioncode`"/><attribute name=`"description`"/><order attribute=`"createdon`" descending=`"true`"/><filter><condition attribute=`"regardingobjectid`" operator=`"eq`" value=`"$incidentId`"/></filter></entity></fetch>"
    $noteFetch = "<fetch count=`"$Count`"><entity name=`"annotation`"><attribute name=`"subject`"/><attribute name=`"notetext`"/><attribute name=`"createdon`"/><link-entity name=`"systemuser`" from=`"systemuserid`" to=`"createdby`" alias=`"creator`" link-type=`"outer`"><attribute name=`"fullname`"/></link-entity><filter><condition attribute=`"objectid`" operator=`"eq`" value=`"$incidentId`"/></filter><order attribute=`"createdon`" descending=`"true`"/></entity></fetch>"
    $phoneFetch = "<fetch count=`"$Count`"><entity name=`"phonecall`"><attribute name=`"subject`"/><attribute name=`"directioncode`"/><attribute name=`"createdon`"/><attribute name=`"description`"/><order attribute=`"createdon`" descending=`"true`"/><filter><condition attribute=`"regardingobjectid`" operator=`"eq`" value=`"$incidentId`"/></filter></entity></fetch>"

    $emails = Invoke-D365Api -Endpoint "/api/data/v9.0/emails" -FetchXml $emailFetch
    $notes = Invoke-D365Api -Endpoint "/api/data/v9.0/annotations" -FetchXml $noteFetch
    $phones = Invoke-D365Api -Endpoint "/api/data/v9.0/phonecalls" -FetchXml $phoneFetch

    if ($emails -or $notes -or $phones) {
        $allEntries = @()

        if ($emails -and $emails.value) {
            foreach ($e in $emails.value) {
                $type = if ($e.'statuscode@OData.Community.Display.V1.FormattedValue' -eq 'Draft') { 'Draft Email' } elseif ($e.directioncode) { 'Sent Email' } else { 'Received Email' }
                $allEntries += [PSCustomObject]@{
                    type = $type
                    time = if ($e.createdon) { ([datetime]$e.createdon).ToString('M/d/yyyy h:mm tt') } else { '' }
                    sortTime = $e.createdon
                    from = ($e.'from@OData.Community.Display.V1.FormattedValue' -split ';')[0]
                    content = ($e.subject + ' ' + ($e.description -replace '<[^>]+>', '' | Select-Object -First 1)).Substring(0, [Math]::Min(150, ($e.subject + ' ').Length))
                }
            }
        }
        if ($notes -and $notes.value) {
            foreach ($n in $notes.value) {
                $allEntries += [PSCustomObject]@{
                    type = 'Note'
                    time = if ($n.createdon) { ([datetime]$n.createdon).ToString('M/d/yyyy h:mm tt') } else { '' }
                    sortTime = $n.createdon
                    from = $n.'creator.fullname'
                    content = ("$($n.subject) $($n.notetext)").Substring(0, [Math]::Min(150, ("$($n.subject) $($n.notetext)").Length))
                }
            }
        }
        if ($phones -and $phones.value) {
            foreach ($p in $phones.value) {
                $dir = if ($p.directioncode) { 'Outgoing' } else { 'Incoming' }
                $allEntries += [PSCustomObject]@{
                    type = "Phone Call"
                    time = if ($p.createdon) { ([datetime]$p.createdon).ToString('M/d/yyyy h:mm tt') } else { '' }
                    sortTime = $p.createdon
                    from = "$dir - $($p.subject)"
                    content = $p.description
                }
            }
        }

        $allEntries = $allEntries | Sort-Object sortTime -Descending | Select-Object -First $Count

        Write-Host ""
        Write-Host "📋 Timeline ($($allEntries.Count) entries):"
        Write-Host "─────────────────────────────────────"
        foreach ($entry in $allEntries) {
            $icon = switch ($entry.type) {
                'Sent Email' { '📤' }; 'Received Email' { '📥' }; 'Draft Email' { '📝' }
                'Phone Call' { '📞' }; 'Note' { '🗒️' }; default { '❓' }
            }
            Write-Host "$icon [$($entry.type)] $($entry.time)  |  $($entry.from)"
            if ($entry.content) {
                $maxLen = [Math]::Min(120, $entry.content.Length)
                Write-Host "   $($entry.content.Substring(0, $maxLen))"
            }
            Write-Host ""
        }
        return
    }
}

# ── UI Fallback ──
Write-Host "   (API unavailable, falling back to UI...)"
Ensure-CaseFormContext -Tab Timeline

# Step 1b: Click "Load more" to get older entries (repeat up to 3 times)
Write-Host "   Loading all entries..."
for ($i = 0; $i -lt 10; $i++) {
    $loadResult = playwright-cli run-code "async page => { const btn = page.getByRole('button', { name: 'Load more' }); if (await btn.count() > 0 && await btn.isVisible()) { await btn.click(); return 'loaded'; } return 'no_more'; }" 2>&1 | Out-String
    if ($loadResult -match '"no_more"') { break }
    Start-Sleep -Seconds 3
}

# Step 2: Extract timeline entries via run-code
$js = @"
async page => {
  // Wait for timeline to load
  await page.waitForTimeout(2000);
  
  // Get all listitem elements (timeline entries)
  const items = await page.getByRole('listitem').all();
  const results = [];
  let count = 0;
  
  for (const item of items) {
    if (count >= $Count) break;
    const fullText = await item.textContent().catch(() => '');
    if (!fullText || fullText.length < 30) continue;
    
    // Determine type
    let type = '';
    if (fullText.includes('Sent Email')) type = 'Sent Email';
    else if (fullText.includes('Received Email')) type = 'Received Email';
    else if (fullText.includes('Draft Email')) type = 'Draft Email';
    else if (fullText.includes('Phone Call')) type = 'Phone Call';
    else if (fullText.includes('Note') && fullText.includes('Created on')) type = 'Note';
    else continue;
    
    // Extract time
    const timeMatch = fullText.match(/Created on[:\s]*([0-9\/]+\s+[0-9:]+\s*[APM]*)/i);
    const time = timeMatch ? timeMatch[1].trim() : '';
    
    // Extract from via aria-label (e.g. "Email from xxx@xxx.com")
    const label = await item.getAttribute('aria-label').catch(() => '') || '';
    let from = '';
    const labelEmail = label.match(/from\s+([\w.+-]+@[\w.-]+)/i);
    if (labelEmail) from = labelEmail[1];
    else {
      const authorMatch = fullText.match(/Created By\s+([\w\s.-]+?)(?:\s{2}|Virtual|Progress|\[|$)/);
      if (authorMatch) from = authorMatch[1].trim();
    }
    
    // Extract content: get the meaningful text from the entry
    let content = '';
    // Strategy: remove known metadata prefixes, get remaining text
    let cleaned = fullText
      .replace(/^.*?(?:Sent Email|Received Email|Draft Email|Note)/,'')  // remove type prefix
      .replace(/Created on[:\s]*[0-9\/]+\s+[0-9:]+\s*[APM]*/gi, '')    // remove timestamp
      .replace(/(?:Sent Email|Received Email|Draft Email|Note)/g, '')    // remove repeated type
      .replace(/from:\s*[\w.+-]+@[\w.-]+/gi, '')                        // remove from:
      .replace(/Created By\s+[\w\s.-]+/g, '')                           // remove Created By
      .replace(/Closed|Open|Draft/g, '')                                 // remove status
      .replace(/Reply All|More commands|Open Record|Pin/g, '')           // remove buttons
      .replace(/View more/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    content = cleaned.substring(0, 150);
    
    results.push({ type, time, from, content });
    count++;
  }
  
  return JSON.stringify(results);
}
"@

$output = playwright-cli run-code $js 2>&1 | Out-String

# Parse and display
try {
    # Extract JSON from playwright-cli output: ### Result "<json>"
    if ($output -match '### Result\s+"(\[.*?\])"') {
        $jsonStr = $Matches[1] -replace '\\n', "`n" -replace '\\"', '"'
        if ($jsonStr -eq '[]') {
            Write-Host "⚠️ No timeline entries found. Ensure you are on a Case with Timeline visible."
            return
        }
        $entries = $jsonStr | ConvertFrom-Json
        Write-Host ""
        Write-Host "📋 Timeline ($($entries.Count) entries):"
        Write-Host "─────────────────────────────────────"
        foreach ($entry in $entries) {
            $icon = switch ($entry.type) {
                'Sent Email' { '📤' }
                'Received Email' { '📥' }
                'Draft Email' { '📝' }
                'Phone Call' { '📞' }
                'Note' { '🗒️' }
                default { '❓' }
            }
            Write-Host "$icon [$($entry.type)] $($entry.time)  |  $($entry.from)"
            if ($entry.content) {
                $maxLen = [Math]::Min(120, $entry.content.Length)
                Write-Host "   $($entry.content.Substring(0, $maxLen))"
            }
            Write-Host ""
        }
    } else {
        Write-Host "⚠️ Could not parse timeline output."
        # Show just the first line of output for debugging
        $firstLine = ($output -split "`n")[0]
        Write-Host "   First line: $firstLine"
    }
} catch {
    Write-Host "⚠️ Error parsing: $_"
}
