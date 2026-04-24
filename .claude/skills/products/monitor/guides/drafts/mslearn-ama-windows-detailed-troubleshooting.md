---
source: mslearn
sourceRef: "azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-detailed-troubleshooting-steps"
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-detailed-troubleshooting-steps"
importDate: "2026-04-21"
type: guide-draft
---

# Detailed Troubleshooting for AMA Installation Issues on Windows VMs

## Step 1: Start the VM if not running
- Azure portal > VM > Overview > check Status is Running

## Step 2: Verify managed identity
- Azure portal > VM > Security > Identity
- Check SystemAssigned or UserAssigned identity exists
- If neither: enable system-assigned (requires Virtual Machine Contributor role) or assign user-assigned identity (requires VM Contributor + Managed Identity Operator)

## Step 3: Verify AMA extension exists
- VM > Settings > Extensions + applications
- Look for type: Microsoft.Azure.Monitor.AzureMonitorWindowsAgent
- If missing: Add > search AzureMonitorWindowsAgent > install
- If status not "Provisioning Succeeded": reinstall

## Step 4: Verify VM Guest Agent is running
- Check via portal: Extensions + applications > GuestHealthWindowsAgent status
- Or PowerShell: Get-Service WindowsAzureGuestAgent

## Step 5: Verify extension binaries downloaded
- Boot Diagnostics > Serial log > look for AzureMonitorWindowsAgent logs
- If binaries missing: restart Guest Agent via 'net stop/start WindowsAzureGuestAgent'

## Step 6: Verify Guest Agent installed and enabled AMA
- RDP to VM > C:\WindowsAzure\Logs\WaAppAgent.log
- Look for plugin environment setup, installation, and result log entries for Microsoft.Azure.Monitor.AzureMonitorWindowsAgent
