# Security Assessment Tools & ASC Export Reference

## Third-Party Security Scanners
Customers may use their own security assessment tools besides Azure Security Center:
- GitGuardian, CloudSploit, Snyk, Assembla, Sentry, LogicHub, Perforce (Helix4Git), Nightfall, Sookasa
- Public cloud security software directory: https://www.capterra.com.sg/directory/31344/cloud-security/software

## SIEM Comparison: Splunk vs Sentinel
- Splunk overview: https://www.splunk.com/en_us/siem-security-information-and-event-management.html
- Splunk Azure data ingestion: https://www.splunk.com/en_us/blog/cloud/getting-microsoft-azure-data-into-splunk.html
- Side-by-side Sentinel + Splunk: https://techcommunity.microsoft.com/t5/azure-sentinel/azure-sentinel-side-by-side-with-splunk/ba-p/1211266

## ASC Assessment Export Script (PowerShell)
Export ASC assessment reports via Azure Resource Graph query:

```powershell
# Prerequisites
# install-module -name Azure
# install-module -name Az.ResourceGraph

$subscriptionID = "<subscription-id>"
$outputfilepath = "C:\output"

Add-AzAccount -Environment AzureChinaCloud
Set-AzContext -SubscriptionID $subscriptionID

$query = "
securityresources
| where type == 'microsoft.security/assessments'
| extend displayName = properties.displayName,
         resourceId = properties.resourceDetails.Id,
         severity = properties.metadata.severity,
         code = properties.status.code,
         remediation = properties.metadata.remediationDescription
| where code == 'Unhealthy'
| order by severity
| project displayName, resourceId, severity, code, remediation
"

$outputfile = $outputfilepath + '\asc_report_' + (Get-Date -format "yyyyMMddhhmm") + '.csv'
$results = Search-AzGraph -Query $query
$results | Export-Csv -Path $outputfile -NoTypeInformation
```

## Source
OneNote: Mooncake POD Support Notebook / Security Assessment Tool
