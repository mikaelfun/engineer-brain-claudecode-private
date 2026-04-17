<#
.SYNOPSIS
    读取当前 Case 的详情字段。
.DESCRIPTION
    优先通过 OData API 获取完整 Case 数据（含 GUID、元数据等）。
    API 失败时 fallback 到 UI 解析。
.EXAMPLE
    pwsh scripts/view-details.ps1
#>
param()

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

Write-Host "🔵 Reading Case details..."

# ── API Mode ──
$incidentId = Get-CurrentCaseId
if ($incidentId) {
    $result = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents($incidentId)"
    if ($result -and $result.ticketnumber) {
        # Also try restricted attributes
        $restricted = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents($incidentId)/msdfm_CaseRestrictedAttributesId?`$select=msdfm_customerstatement,msdfm_symptom,msdfm_overview"

        Write-Host ""
        Write-Host "📋 Case Details:"
        Write-Host "─────────────────────────────────────"

        $fieldMap = [ordered]@{
            'Case Number' = $result.ticketnumber
            'Title' = $result.title
            'Severity' = $result.'severitycode@OData.Community.Display.V1.FormattedValue'
            'Status' = $result.'statuscode@OData.Community.Display.V1.FormattedValue'
            'Assigned To' = $result.'_msdfm_assignedtoid_value@OData.Community.Display.V1.FormattedValue'
            'Support Area Path' = $result.'_msdfm_supportareapathid_value@OData.Community.Display.V1.FormattedValue'
            'Category' = $result.'_msdfm_categoryid_value@OData.Community.Display.V1.FormattedValue'
            'Internal Title' = $result.msdfm_internaltitle
            'Age (Days)' = $result.msdfm_agedays
            'FCR' = $result.'msdfm_fcr@OData.Community.Display.V1.FormattedValue'
            'CSAT Risk Level' = $result.'msdfm_csatrisklevel@OData.Community.Display.V1.FormattedValue'
            'CSAT Risk Reason' = $result.msdfm_csatriskreason
            'Contact Email' = $result.'_primarycontactid_value@OData.Community.Display.V1.FormattedValue'
            'Contact Method' = $result.'msdfm_preferredcontactmethod@OData.Community.Display.V1.FormattedValue'
        }

        foreach ($kv in $fieldMap.GetEnumerator()) {
            $val = "$($kv.Value)".Trim()
            if ($val -and $val -ne '') {
                Write-Host "  $($kv.Key): $val"
            }
        }

        if ($restricted -and $restricted.msdfm_customerstatement) {
            Write-Host "  Customer Statement: $($restricted.msdfm_customerstatement.Substring(0, [Math]::Min(200, $restricted.msdfm_customerstatement.Length)))..."
        }
        Write-Host ""
        return
    }
}

# ── UI Fallback ──
Write-Host "   (API unavailable, falling back to UI...)"
Ensure-CaseFormContext -Tab Details

$js = @"
async page => {
  const fields = {};
  
  // Case title from H1
  const h1 = page.getByRole('heading', { level: 1 }).first();
  const titleRaw = (await h1.textContent().catch(() => '')).trim();
  fields.title = titleRaw.replace(/- Saved$/, '').replace(/- Unsaved$/, '').trim();
  
  // Header area: Case number, Service name, Severity, Status reason, Assigned To
  const headerArea = page.locator('text=/Case number/').first().locator('../..');
  const headerText = (await headerArea.textContent().catch(() => '')).trim();
  
  // Parse header fields by label positions
  const caseNumMatch = headerText.match(/^(\d{10,})/);
  fields.caseNumber = caseNumMatch ? caseNumMatch[1] : '';
  
  // Severity: single letter after "Case number / Service name"
  const sevMatch = headerText.match(/Service name\s*([A-C])\s*Severity/i);
  fields.severity = sevMatch ? sevMatch[1] : '';
  
  // Status reason: text between "Severity" and "Status reason"
  const statusMatch = headerText.match(/Severity\s*(.+?)\s*Status reason/i);
  fields.status = statusMatch ? statusMatch[1].trim() : '';
  
  // Assigned To
  const links = await page.getByRole('link').all();
  for (const link of links) {
    const href = await link.getAttribute('href').catch(() => '') || '';
    if (href.includes('systemuser')) {
      fields.assignedTo = (await link.textContent().catch(() => '')).trim();
      break;
    }
  }
  
  // SAP
  const sapBox = page.getByRole('textbox', { name: 'Look for Support Area Path' });
  if (await sapBox.count() > 0) {
    fields.sap = (await sapBox.inputValue().catch(() => '')).trim();
  }
  
  // Other Summary fields
  const readField = async (name) => {
    const el = page.getByRole('textbox', { name: name });
    if (await el.count() > 0) return (await el.inputValue().catch(() => '')).trim();
    return '';
  };
  
  fields.internalTitle = await readField('Internal title');
  fields.ageDays = await readField('Age (Days)');
  fields.fcr = await readField('FCR');
  fields.csatRiskLevel = await readField('CSAT risk level');
  fields.csatRiskReason = await readField('CSAT risk reason');
  fields.contactEmail = await readField('Email');
  fields.contactMethod = await readField('Preferred method of contact');
  
  // Category combobox
  const catCombo = page.getByRole('combobox', { name: 'Category, Lookup' });
  if (await catCombo.count() > 0) {
    fields.category = (await catCombo.textContent().catch(() => '')).trim();
    if (fields.category === '---') fields.category = '';
  }
  
  // Build output lines
  const lines = [];
  lines.push('CASE:' + (fields.caseNumber || ''));
  lines.push('TITLE:' + (fields.title || ''));
  lines.push('SEVERITY:' + (fields.severity || ''));
  lines.push('STATUS:' + (fields.status || ''));
  lines.push('ASSIGNED:' + (fields.assignedTo || ''));
  lines.push('SAP:' + (fields.sap || ''));
  lines.push('CATEGORY:' + (fields.category || ''));
  lines.push('INTERNAL_TITLE:' + (fields.internalTitle || ''));
  lines.push('AGE_DAYS:' + (fields.ageDays || ''));
  lines.push('FCR:' + (fields.fcr || ''));
  lines.push('CSAT_RISK:' + (fields.csatRiskLevel || ''));
  lines.push('CSAT_REASON:' + (fields.csatRiskReason || ''));
  lines.push('CONTACT_EMAIL:' + (fields.contactEmail || ''));
  lines.push('CONTACT_METHOD:' + (fields.contactMethod || ''));
  
  return lines.join('\\n');
}
"@

$output = playwright-cli run-code $js 2>&1 | Out-String

if ($output -match '### Result\s+"([\s\S]+?)"\s*###') {
    $resultText = $Matches[1] -replace '\\n', "`n" -replace '\\"', '"'
    
    Write-Host ""
    Write-Host "📋 Case Details:"
    Write-Host "─────────────────────────────────────"
    
    $fieldMap = @{
        'CASE' = 'Case Number'
        'TITLE' = 'Title'
        'SEVERITY' = 'Severity'
        'STATUS' = 'Status'
        'ASSIGNED' = 'Assigned To'
        'SAP' = 'Support Area Path'
        'CATEGORY' = 'Category'
        'INTERNAL_TITLE' = 'Internal Title'
        'AGE_DAYS' = 'Age (Days)'
        'FCR' = 'FCR'
        'CSAT_RISK' = 'CSAT Risk Level'
        'CSAT_REASON' = 'CSAT Risk Reason'
        'CONTACT_EMAIL' = 'Contact Email'
        'CONTACT_METHOD' = 'Contact Method'
    }
    
    foreach ($line in $resultText -split "`n") {
        if ($line -match '^(\w+):(.*)') {
            $key = $Matches[1]
            $val = $Matches[2].Trim()
            $label = if ($fieldMap.ContainsKey($key)) { $fieldMap[$key] } else { $key }
            if ($val) {
                Write-Host "  $($label): $val"
            }
        }
    }
    Write-Host ""
} else {
    Write-Host "⚠️ Could not read case details."
    exit 1
}
