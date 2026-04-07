# File Integrity Monitoring (FIM) - Change Tracking Diagnostics

## Overview
FIM uses Change Tracking (via Azure Automation) to monitor file changes on VMs. Enabled through Defender for Servers in MDC.

## Key Tables (Log Analytics Workspace)

### ConfigurationData
- Contains inventory snapshot, refreshed ~every 20 hours + on change detection
- Single point-in-time view of tracked files
```kql
ConfigurationData
| where Computer contains "MACHINENAME"
```

### ConfigurationChange
- Records actual changes (diff between two ConfigurationData snapshots)
```kql
ConfigurationChange
| where Computer contains "MACHINENAME"
```

## Troubleshooting
- If no ConfigurationData results for a machine, FIM is not tracking it correctly
- Check OMS agent connectivity and workspace assignment
- FIM requires Defender for Servers Plan 2

## Reference
- ADO Wiki: https://dev.azure.com/Supportability/AzureAutomation/_wiki/wikis/Azure-Automation.wiki/179564/

## Source
OneNote: Mooncake POD / Microsoft Defender for Servers / FIM
