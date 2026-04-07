# AMA Deployment and Troubleshooting on Arc-enabled Servers

## Overview
Azure Monitor Agent (AMA) can be deployed on Arc-enabled servers to collect telemetry data (events, performance counters) and forward to Log Analytics workspace.

## Prerequisites
- Arc-enabled server with Connected Machine agent installed
- **Data Collection Rule (DCR)** must be created and associated with the server
  - Without DCR, AMA installs but collects NO data

## Deployment Methods
1. **Azure Portal** - Direct installation from Arc server blade
2. **PowerShell** - `New-AzConnectedMachineExtension`
3. **Azure Policy** - Auto-deploy via policy assignment

## OS Extension Availability
Check supported OS versions: [VM extension management with Azure Arc-enabled servers](https://learn.microsoft.com/en-us/azure/azure-arc/servers/manage-vm-extensions#operating-system-extension-availability)

## Data Collection Setup
1. Create DCR: [Collect events and performance counters](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/data-collection-rule-azure-monitor-agent?tabs=portal#create-a-data-collection-rule)
2. Associate DCR with Arc-enabled server
3. Verify DCR association via ASC portal

## Troubleshooting

### AMA Troubleshooter (Windows)
Use for data collection issues on Arc server:
[AMA Troubleshooter for Windows](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/troubleshooter-ama-windows?tabs=WindowsPowerShell)

### Live Troubleshooting (Windows Arc)
Basic diagnostic steps:
[Troubleshoot AMA on Windows Arc-enabled server](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-troubleshoot-windows-arc)

## Known Issues (Mooncake)
- AMA install may fail in certain regions (e.g., ChinaNorth3) - see arm-onenote-022
- DCR must be created in same region as Arc server

## Source
OneNote: Mooncake POD Support Notebook > Azure Arc > Arc Enabled Servers > VM Extensions > AzureMonitorAgent(AMA)
