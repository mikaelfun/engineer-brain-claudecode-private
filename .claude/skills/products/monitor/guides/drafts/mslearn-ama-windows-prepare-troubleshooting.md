---
source: mslearn
sourceRef: "azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-prepare-troubleshooting"
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-prepare-troubleshooting"
importDate: "2026-04-21"
type: guide-draft
---

# Preparation for Troubleshooting AMA Installation Issues on Windows VMs

## Prerequisites Check

1. **Verify OS support**: Azure portal > VM > Overview > check Operating system against supported list
2. **Determine issue type** (installation vs configuration):
   - Check if AzureMonitorWindowsAgent extension status is NOT "Provisioning Succeeded"
   - RDP to VM > Task Manager > verify these processes are running:
     - AMAExtHealthMonitor
     - MonAgentHost
     - MonAgentLauncher
     - MonAgentManager
   - If extension status is not succeeded or processes missing -> installation issue
3. **Verify DCR association**: Azure Monitor > Data Collection Rules > confirm at least one DCR is associated with the VM
4. **Understand installation options**: VM extension, DCR creation, VM insights, Container insights, Client installer, Azure Policy
