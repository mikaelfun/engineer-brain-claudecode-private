# Azure Monitor Agent (AMA) Windows Installation Troubleshooting

> Sources:
> - https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-prepare-troubleshooting
> - https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-detailed-troubleshooting-steps
> - https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-advanced-troubleshooting-steps

## Pre-checks
1. **OS supported** — check [AMA supported OS list](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-supported-operating-systems#windows-operating-systems)
2. **Issue type** — Installation (extension not succeeded / processes not running) vs Configuration
3. **DCR associated** — at least one Data Collection Rule must be associated with the VM
4. **AMA processes** — `AMAExtHealthMonitor`, `MonAgentHost`, `MonAgentLauncher`, `MonAgentManager`

## 7-Step Troubleshooting Workflow

### Step 1: VM Running
Azure Portal → VM → check Status = Running

### Step 2: Managed Identity
VM → Security → Identity → SystemAssigned or UserAssigned must exist
- Missing → enable system-assigned identity (requires Virtual Machine Contributor role)

### Step 3: Extension Exists
VM → Extensions + applications → look for `Microsoft.Azure.Monitor.AzureMonitorWindowsAgent`
- Missing → Add extension manually
- Status not "Provisioning Succeeded" → continue troubleshooting

### Step 4: VM Guest Agent Running
```powershell
Get-Service WindowsAzureGuestAgent
```

### Step 5: Extension Binaries Downloaded
- Check Boot Diagnostics → Serial log for AMA extension logs
- If missing, restart Guest Agent:
```cmd
net stop WindowsAzureGuestAgent
net start WindowsAzureGuestAgent
```

### Step 6: Extension Installed & Enabled
Check logs at:
- `C:\WindowsAzure\Logs\WaAppAgent.log` — look for AMA plugin setup/install/enable entries
- `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\CommandExecution*.log`
- `C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\*\Status\*.status`

Key log patterns:
```
Setting up plugin environment ... Code: 0
Installed plugin ... Code: 0
Setting the install state ... to Enabled
```

### Step 7: AMA Processes Running
Task Manager → check all 4 processes: `AMAExtHealthMonitor`, `MonAgentHost`, `MonAgentLauncher`, `MonAgentManager`

## Advanced Troubleshooting

### Test IMDS Connectivity
```cmd
curl -H Metadata:true --noproxy "*" "http://169.254.169.254/metadata/instance?api-version=2021-01-01"
```

### Test Handler Connectivity
```cmd
curl -H Metadata:true --noproxy "*" "http://169.254.169.254/metadata/instance/compute/resourceId?api-version=2021-01-01"
```

### Network Trace
Use Wireshark/Fiddler to check connectivity to `global.handler.control.monitor.azure.com`
