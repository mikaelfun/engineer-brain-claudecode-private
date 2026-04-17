---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/Scan fails with an error/AWS S3 Scan ended with failure"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FScan%20fails%20with%20an%20error%2FAWS%20S3%20Scan%20ended%20with%20failure"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AWS S3 Scan Failure Diagnostic

## Steps

1. Open an ICM using the [template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Kul1M2)

2. Collect the Scan Run ID from the Purview UI:
   - Navigate to the scan history
   - Copy the Run ID from scan diagnostics

3. Get Multi-cloud PipelineId and ActivityId via Kusto:

```kql
// Execute: https://babylon.eastus2.kusto.windows.net/MultiCloud
MultiCloudIRLog
| where Message contains "<RunIdFromUI>" and Message contains "PipelineId"
| extend parsedMessage = parse_json(Message)
| extend PipelineId = parsedMessage["PipelineId"]
| project ActivityId, PipelineId
```

4. Include all collected data in the IcM ticket for escalation.
