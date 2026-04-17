---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Windows Azure Diagnostics (WAD)/Troubleshooting Guides/Troubleshooting log missing on diagnostics extension of cloud service"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FWindows%20Azure%20Diagnostics%20(WAD)%2FTroubleshooting%20Guides%2FTroubleshooting%20log%20missing%20on%20diagnostics%20extension%20of%20cloud%20service"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting Log Missing on WAD for Cloud Service

## Overview
Diagnostic extension workflow for cloud service is same as Azure VM. However, WAD cannot be removed/enabled through portal like VM extensions - must use PowerShell or Visual Studio.

- Cloud Services (classic) deprecated, retired Aug 31 2024 - use extended support model
- Enable WAD: PowerShell or Visual Studio
- Support boundary: WAD configuration issues on Cloud Service → engage Azure Cloud Service team

## Troubleshooting Steps

1. **Collect logs**: Login to web/worker role, collect WAD and guest agent logs
2. **Verify WAD enabled**: Check via ASC if WAD is provisioning succeeded
   - Guest agent logs: `C:\Logs\AppAgentRuntime.log`, `C:\Logs\WaAppAgent.log`
   - If WAD not enabled/provisioning failed → engage Cloud Service team
3. **Check diagnostic settings**: Compare with supported diagnostic schema
   - `(Get-AzureServiceAvailableExtension -ExtensionName 'PaaSDiagnostics' -ProviderNamespace 'Microsoft.Azure.Diagnostics').PublicConfigurationSchema`
4. **Verify storage credentials**: Ensure `UseDevelopmentStorage=true` updated for storage account
   - Check "Update development storage connection strings when publishing to Microsoft Azure"
   - For Application Insights: verify instrumentation key correct
   - Trace listener: ensure `<trace autoflush="true">`
5. **Verify processes running**: DiagnosticsPlugin.exe, MonAgentHost.exe, MonAgentCore.exe, MonAgentManager.exe
   - DiagnosticsPlugin not running → check `DiagnosticsPluginLauncher.log` and `DiagnosticsPlugin.log` under `C:\Logs\Plugins\Microsoft.Azure.Diagnostics.PaaSDiagnostics\<version>\`
   - Check exit codes against reference
   - MonAgent not running → check `MonAgentHost.<seq>.log` under `C:\Resources\Directory\<DeploymentID>.<RoleName>.DiagnosticStore\WAD0107\Configuration\`
6. **Verify storage connectivity**:
   - `Test-NetConnection <storage>.blob.core.windows.net -Port 443`
   - `Test-NetConnection <storage>.table.core.windows.net -Port 443`
7. **Analyze MaConfig.xml**: Verify log sources included (performance counters, Application Insights extension)
8. **Analyze MaEventTable.csv**: Check all log sources parsed and compiled successfully
9. **Verify .tsf files**: Check under `C:\Resources\Directory\<number>.WebRole1.DiagnosticStore\WAD0107\Tables`
   - PerformanceCountersTable.tsf, WindowsEventLogsTable.tsf, DiagnosticInfrastructureLogsTable.tsf
10. **Analyze MaQosEvent.csv**: Check data processing details (MaTableRequest, MaRunTaskTransmit - Success True/False)
