# Export Log Analytics Data via Alert + Automation Runbook

> Source: OneNote - Mooncake POD Support Notebook / MONITOR / Log Analytics / Sample log query
> Quality: draft | Needs review before promotion

## Overview
Pattern for exporting Log Analytics query results as formatted HTML email reports using log alert rules + Azure Automation runbooks.

## Architecture
1. **Log Analytics** - KQL query defines the data to export
2. **Alert Rule** (log search type) - Triggers on schedule, passes query results to action group
3. **Action Group** - Calls Automation runbook webhook
4. **Automation Runbook** (PowerShell) - Parses webhook payload, formats HTML table, sends email via SMTP

## Key Configuration Notes

### Metric Measurement Mode
- KQL query **must** include `AggregatedValue` column: `summarize AggregatedValue=<func>(field) by bin(TimeGenerated, period)`
- The alert **Period** setting controls the actual query time range, NOT the `ago()` in the KQL query

### Webhook Payload Parsing
The runbook receives `WebhookData` parameter containing the alert payload with `searchResult.tables.rows` array.

## PowerShell Runbook Template
```powershell
param(
    [Parameter(Mandatory = $false)]
    [string] $WebhookData
)

$str = $WebhookData
$data = "{" + $str.TrimStart("@{WebhookName=<name>; RequestBody=").TrimEnd("; RequestHeader=}") + "}}"
$rows = ($data | ConvertFrom-Json).data.searchresult.tables.rows

# Define column mapping
$table = @{Expression = {$_[0]}; Label = "Column1"},
         @{Expression = {$_[1]}; Label = "Column2"}

# HTML styling
$head = @"
<style>
table { border-collapse:collapse; width:100% }
td { font-size:10pt; border:1px #000088 solid; padding:5px }
th { font-size:10pt; background-color:#000088; color:#FFFFFF }
</style>
"@

$htmlBody = $rows | Select-Object $table | ConvertTo-HTML -Head $head
$htmlBodyString = $htmlBody | Out-String

Send-MailMessage -To <to> -Subject <subject> -BodyAsHtml -Body $htmlBodyString `
    -UseSsl -Port <port> -From <from> -SmtpServer <smtp> -Credential <cred>
```

## 21v Applicability
Works in Mooncake. Ensure Automation Account and SMTP relay are accessible in China cloud. Use `portal.azure.cn` URLs for alert links.
