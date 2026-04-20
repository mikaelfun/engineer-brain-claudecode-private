---
title: Windows Log Analytics Agent Installation Troubleshooting Guide
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/windows-agents/resolve-windows-agent-installation-issues
product: monitor
date: 2026-04-18
---

# Windows Log Analytics Agent Installation Troubleshooting

> Note: MMA (Log Analytics agent) was retired November 2024. Migrate to Azure Monitor Agent.

## Symptom
After installing Windows Agent, no data or partial data in workspace.

## Diagnostic Flow

### Step 1: Check Log Analytics Extension Status
1. Azure portal > VM > Extensions + applications
2. Look for **MicrosoftMonitoringAgent** (type: Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent)
3. Status should be **Provisioning succeeded**
   - If **Unavailable**: file support ticket for VM Guest Agent
   - If **Provisioning failed**: proceed to Step 2

### Step 2: Verify Heartbeat
```kql
Heartbeat | where Computer contains "ComputerName"
```

### Step 3: Check Extension Processes on VM (RDP)
```powershell
Get-WmiObject Win32_Process -Filter "name = 'MMAExtensionHeartbeatService.exe'" | Format-List ProcessName, Path
Get-WmiObject Win32_Process -Filter "name = 'HealthService.exe'" | Format-List ProcessName, Path
Get-WmiObject Win32_Process -Filter "name = 'MonitoringHost.exe'" | Format-List ProcessName, Path
```

### Step 4: Check Extension Directories
- Installation: `C:\Packages\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\<version>`
- Logs: `C:\WindowsAzure\Logs\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\<version>`
- Check `MMAExtensionInstall[N].log` for installation errors

### Step 5: Manual Service Start
```powershell
Net start HealthService
Net start MMAExtensionHeartbeatService
```

### Step 6: Check Event Viewer
- Windows Logs > Application
- Applications and Services Logs > Operations Manager

### Step 7: Run Troubleshooter
Use [Agent Troubleshooting Tool](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/agent-windows-troubleshoot#log-analytics-troubleshooting-tool)
