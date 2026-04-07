---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Known Issues/AMPLS/Network Isolation Enforcement Change Awareness"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FKnown%20Issues%2FAMPLS%2FNetwork%20Isolation%20Enforcement%20Change%20Awareness"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Network Isolation Enforcement Change Awareness

## Background
Windows AMA Heartbeats and Perf data was ingested even when public network ingestion was disabled. Only affected Windows AMA (Linux AMA and legacy agents properly blocked). Fix rolled out April 3, 2023.

## Impact Assessment Decision Tree

### Step 1: Is it related?
Only Windows AMA data stopped. Other agents also stopped -> NOT related.

### Step 2: Check last heartbeat
```kql
Heartbeat
| where OSType == "Windows"
| summarize arg_max(TimeGenerated, *) by Computer, ComputerIP, Category
| project TimeGenerated, Computer, ComputerIP, Category
```
- IPv4 public IP -> RELATED
- IPv6 address -> NOT related

### Step 3: Confirm public ingestion disabled
Check Network Isolation blade in Portal or ASC.

### Conclusion: All three true = RELATED
1. Missing data from Windows AMA only
2. Last heartbeat from public IPv4
3. Public ingestion disabled

### Next Steps
Collect workspace info then refer to:
- AMPLS General: wiki/750397
- AMPLS Troubleshooting: wiki/750398
- AMPLS Support Boundaries: wiki/750326
