---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Known Issues/Scan Failures and Performance Issues in OpenAI Integration"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FKnown%20Issues%2FScan%20Failures%20and%20Performance%20Issues%20in%20OpenAI%20Integration"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scan Failures and Performance Issues in OpenAI Integration

## Expected Issues
- Scan is failing
- AI Hub: Prompts from ChatGPT Enterprise is not shown in DPSM for AI's Activity explorer
- ChatGPT scans are taking too long to finish and not ingesting any data

## Initial Prerequisite Check
Enquire customer if they have assigned `Purview.ProcessConversationMessages.All` permission to the purview account MSI as mentioned in the pre-requisites.

## Debugging Steps

### Step 1: Check scan region and common errors
```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "<scanResultId>"
| where * contains "the scan region"
| project ['time'], Message, ExceptionType, ExceptionMessage, StackTrace, TenantId
| order by ['time'] desc
```

### Step 2: Query the specific regional cluster for detailed errors
```kql
cluster('https://purviewadxne.northeurope.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == "<scanResultId>"
| where Level == "2"
| where Message !contains "Scan is completed but failed of sending the notificatio"
    and Message !contains "refreshTokenExpiringTimeSpan"
    and Message !contains "oken refreshing throws exception"
    and Message !contains "Server failed to authenticate the request"
    and Message !contains "updating progress report failed with payload"
    and Message !contains "errorCode InvalidOperation, errorMessage:"
    and Message !contains "Failed processing navigation element for"
| order by ['time'] desc
| project Level, Message
| take 10000
```

### Step 3: If region not found, union all clusters
Use union of all regional clusters (babylon, purviewadxeus2euap, purviewadxwcus, purviewadxeus, purviewadxweu, purviewadxsea, purviewadxbrs, purviewadxeus2, purviewadxcc, purviewadxscus, purviewadxcid, purviewadxuks, purviewadxae, purviewadxne, purviewadxwus2, purviewadxfc, purviewadxkc, purviewadxcus, purviewadxuaen, purviewadxjpe, purviewadxwus, purviewadxstzn, purviewadxsan, purviewadxdewc, purviewadxwus3) with the same filters to locate the errors.
