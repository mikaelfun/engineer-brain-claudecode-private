---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/windows-agents/resolve-windows-agent-installation-issues"
importDate: "2026-04-23"
type: guide-draft
---

# Resolve Windows Log Analytics Agent Installation Issues

## Symptoms
After installing Windows Agent, no data or partial data in workspace.

## Diagnostic Flow

### Step 1: Check Log Analytics Extension Status
Azure Portal > VM > Extensions + applications. Look for MicrosoftMonitoringAgent. Status should be Provisioning succeeded.

### Step 2: Verify Heartbeat
Log Analytics workspace > Logs > Heartbeat | where Computer contains ComputerName

### Step 3: Check Extension/Agent Processes on VM
Verify MMAExtensionHeartbeatService.exe, HealthService.exe, MonitoringHost.exe are running.

### Step 4: Check Extension Directories
- Installation: C:\Packages\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\<version>
- Logs: C:\WindowsAzure\Logs\Plugins\...\<version>
- Review MMAExtensionInstall*.log for success/failure

### Step 5: Start Services if Not Running
- Net start HealthService (starts HealthService + MonitoringHost)
- Net start MMAExtensionHeartbeatService

### Step 6: Check Event Logs
- Windows Logs > Application
- Applications and Services Logs > Operations Manager
