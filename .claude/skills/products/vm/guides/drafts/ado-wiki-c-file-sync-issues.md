---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/File Sync Issues_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FFile%20Sync%20Issues_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting File Sync Issues

## Scenarios

| Scenario | TSG |
|----------|-----|
| Sync errors reported in portal | Sync Not Completed TSG |
| Sync completed but specific files not syncing (PerItemErrorCount > 0) | PerItemError TSG |
| Unsupported characters | Failures due to Unsupported Characters |

## Sync Not Completed - Errors Reported in Portal

1. Check current sync status via ASC
   - If Healthy -> error was transient, current sync completes successfully
   - Else -> check for errors
2. If error is not known -> look up sync errors using Geneva Logs
3. If error is known -> check common known errors in public docs
   - Error in doc -> follow Remediation steps
   - Error not in doc but message makes sense -> explain to customer
   - Else -> escalate

## Sync Completed but Files Not Syncing (PerItemErrorCount > 0)

- Run **FileSyncErrorsReport.ps1** (in agent install dir) to list failing files
- Common causes: invalid characters, files in use
- Check ASC: Sync Upload/Download Per-Item Error Count columns
- Look up error in public doc, if not found -> look up via Geneva Logs

## Sync Failures Due to Unsupported Characters

- Agent v17+ (Dec 2023): expanded character support on par with NTFS
- Customer may see ERROR_INVALID_NAME per item error during upload
- Use ScanUnsupportedChars script to rename items
