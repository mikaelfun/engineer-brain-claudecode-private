---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Windows Azure Diagnostics (WAD)/Troubleshooting Guides/Troubleshooting in Windows Diagnostic Extension of Azure VM or VMSS"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FWindows%20Azure%20Diagnostics%20(WAD)%2FTroubleshooting%20Guides%2FTroubleshooting%20in%20Windows%20Diagnostic%20Extension%20of%20Azure%20VM%20or%20VMSS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting Windows Diagnostic Extension (WAD) on Azure VM or VMSS

## Prerequisites
- Learn all topics of WAD brownbags (session recording + PowerPoint)

## Data Flow
PG escalation paths:
- Agent related: Azure Diagnostics/WAD
- UI related: Azure Portal IaaS Experiences/Triage

## Log Collection for ICM
- Azure logs: `C:\WindowsAzure\Logs`, `C:\WindowsAzure\Logs\AggregateStatus`, `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Diagnostics.IaaSDiagnostics\<version>`, `...\WAD0107`
- WAD status files: `C:\Packages\Plugins\Microsoft.Azure.Diagnostics.IaaSDiagnostics\<version>\Status`
- WAD config: `C:\Packages\Plugins\Microsoft.Azure.Diagnostics.IaaSDiagnostics\<version>\RuntimeSettings`
- VM config: `C:\WindowsAzure\Config`
- MA Config: `...\WAD0107\Configuration\maconfig.xml`
- MaEventTable.csv: Use `table2csv.exe maeventtable.tsf` (elevated cmd) from `...\monitor\x64\table2csv.exe`
- MaQosEvent.csv: Use `table2csv.exe MaQosEvent.tsf`

## Scenario 1: Installation Failure
1. Get diagnostic extension settings: `Get-AzVMDiagnosticsExtension`
2. Check public/private settings for sinks configuration (storage account, event hub)
   - Ensure system managed identity is enabled for sinks
   - Verify storage account key/endpoint, event hub access key/URL correct with sufficient permissions
3. Check diagnostic settings match supported schema
4. If version-specific issue, downgrade: `az vm extension set --version 1.17 --no-auto-upgrade true`
5. For Application Insights sinks, check limitations
6. Verify processes running: DiagnosticsPlugin.exe, MonAgentHost.exe, MonAgentCore.exe, MonAgentManager.exe
   - Not running → check exit code reference
   - Investigate MonAgent logs under `...\WAD0107\Configuration\MonAgentHost.*`
   - Last resort: uninstall, backup+remove plugin dirs, reinstall

## Scenario 2: Data Missing in Destinations
1. Go through TSG doc for related scenarios
2. Verify storage account/event hub reachable:
   - `Test-NetConnection <storage>.blob.core.windows.net -Port 443`
   - `Test-NetConnection <storage>.table.core.windows.net -Port 443`
3. Collect logs
4. Analyze:
   - MaConfig.xml: verify log sources included
   - Verify .tsf files: PerformanceCountersTable.tsf, WindowsEventLogsTable.tsf, DiagnosticInfrastructureLogsTable.tsf
   - MaEventTable.csv: check all log sources parsed and compiled
   - MaQosEvent.csv: check data processing (Success=True/False, delays)
5. Query WAD metrics in ASC (uncheck "Apply platform namespace" for guest metrics)

## Root Cause Classification
Close support incidents under correct Support Area Path with respective Diagnostic agent root cause classification.
