---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/Scan did not discover assets"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FScan%20did%20not%20discover%20assets"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Assets Not Discovered

If there is an AVA, please update the AVA with the details requested in the wiki.

## Possible Causes

### 1) No assets in the scoped data source based on scan rule sets
- Gather Data Source Scan Information:
  - Check Scoping configuration
  - Check Scan Rule Set applied
  - Check data source path to confirm there is data or files that match scoping and rule set

### 2) Check for Errors
- Use Nanite Library for Scanning log and Data Scan Errors (if using SHIR or Oracle, use those Nanite Libraries)
- If no logs in DataAgentEvent Logs and there is an error in ScanningLogs, check ADF side for errors

### 3) Get sample data
- Review data to make sure it is a supported file/data type
- Test data to reproduce the issue
