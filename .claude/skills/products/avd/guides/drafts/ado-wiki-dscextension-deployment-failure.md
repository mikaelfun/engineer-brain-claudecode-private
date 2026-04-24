---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/🔄Workflows/Deployment Failures/Deployment fails with "dscextension" error"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2F%F0%9F%94%84Workflows%2FDeployment%20Failures%2FDeployment%20fails%20with%20%22dscextension%22%20error"
importDate: "2026-04-24"
type: guide-draft
---

# AVD Deployment: DSC Extension Failure Troubleshooting

## Overview
When AVD deployment fails with a DSC (Desired State Configuration) extension error, it typically indicates configuration issues preventing proper communication between the VM and the AVD service. At this stage the VM is already deployed and domain-joined; the failure occurs during agent installation and host pool registration.

## Common Root Causes
- Network connectivity issues preventing the VM from reaching required AVD endpoints
- WinRM configuration issues (service not starting, blocked by GPO or firewall)
- Proxy or NSG rules blocking required traffic
- DSC module download failures

## Diagnostic Steps

### Option 1: ASC (Azure Support Center)
1. Open ASC and enter the case number
2. Go to Resource Explorer > Resource Provider View > Microsoft.Compute
3. Select the VM where DSC Extension failed
4. Select Extensions > Expand Microsoft.PowerShell.DSC to see the failure reason

### Option 2: Collect Logs
Run MSRD-Collect on the affected session host and review:
- C:\Packages\Plugins\Microsoft.Powershell.DSC<version>\Status
- C:\Windows\Temp\ScriptLog.log
- Microsoft-Windows-DSC/Operational event log
- Microsoft-Windows-PowerShell/Operational event log
- Microsoft-Windows-WinRM/Operational event log

MSRD-Collect also runs MSRD-Diag checks for WinRM configuration:
- WinRMRemoteWMIUsers__ group presence
- IPv4Filter and IPv6Filter values
- Firewall rules for ports 5985 and 5986
- winrm get winrm/config output
- winrm e winrm/config/listener output

## Troubleshooting Flow

### Check Public Documentation First
Review if the error matches a known issue on the AVD troubleshooting docs:
- VM has reported a failure when processing extension
- DeploymentFailed - PowerShell DSC Configuration FirstSessionHost completed with Errors
- DeploymentFailed - Error downloading
- VMExtensionProvisioningError

### Verify Network Connectivity
1. Verify the Azure vNet can connect to required AVD endpoints
2. Check for proxy: Run "netsh winhttp show proxy" on the session host
3. Check NSG rules: Azure Portal > VM > Networking > Review Inbound/Outbound rules
4. If NSG or proxy is blocking traffic, engage Azure Networking team

### Check GPO for WinRM Issues
Verify no Group Policy is preventing WinRM service from starting or connecting to remote endpoints.
