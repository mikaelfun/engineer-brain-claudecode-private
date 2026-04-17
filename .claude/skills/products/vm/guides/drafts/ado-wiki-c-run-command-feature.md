---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Use Run Command Feature for VM Troubleshooting_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FUse%20Run%20Command%20Feature%20for%20VM%20Troubleshooting_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
- cw.Reviewed-09-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

How to leverage the feature *Run Command* Feature whenever you are troubleshooting an Azure Virtual Machine

### Reference

  - [Run PowerShell scripts in your Windows VM with Run Command](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/run-command)

## Limitations

1.  This extension will work only if the VM has connectivity as this feature uses the same pipeline as [Custom Script Extension](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495146)
2.  As any other extension, this extension will work if only the Azure Agent is installed and is working as expected
3.  Only the very first time the extension is used, will inject the script to execute. If you use this feature later on, the extension will identified it was already used and will not upload the new script to execute. To avoid this, you will need to ensure the extension is not installed on the VM prior to its use
4.  The minimum time to run a script is about 20 seconds
5.  The maximum time a script can run is 90 minutes, after which it will time out

## Instructions

1.  On the portal select the Virtual Machine and under *Operations* you will have the option *Run Command* which when selected will give you a list of the scripts that have on the repository plus a *wildcard* option for you to upload any powershell script you'd like:<br>
![a9fe0192-bcb4-2476-8d54-2b2eda979b9c1300px-RunCommandFeature.png](/.attachments/SME-Topics/Cant-RDP-SSH/a9fe0192-bcb4-2476-8d54-2b2eda979b9c1300px-RunCommandFeature.png)
2.  After the script was run and completed, it will give you the outcome on screen:<br>
![2fec0a70-a2e5-e08f-9252-d8d5fdc035931500px-RunCommandFeature-2.png](/.attachments/SME-Topics/Cant-RDP-SSH/2fec0a70-a2e5-e08f-9252-d8d5fdc035931500px-RunCommandFeature-2.png)

##List of current Run Command scripts

| **Name**                  | **Description**                     | 
|---------------------------|-------------------------------------|
| RunPowerShellScript       | Runs a PowerShell script            |
| DisableNLA                | Disable Network Level Authentication|
| DisableWindowsUpdate      | Disable Windows Update Automatic Updates|
| EnableAdminAccount        | Checks if the local administrator account is disabled, and if so enables it|
| EnableEMS                 | EnableS EMS - Emergency Management Services     |
| EnableRemotePS            | Configures the machine to enable remote PowerShell|
| IPConfig                  | Shows detailed information for the IP address, subnet mask, and default gateway for each adapter bound to TCP/IP|
| RDPSettings	            | Checks registry settings and domain policy settings. Suggests policy actions if the machine is part of a domain or modifies the settings to default values|
| SetRDPPort                | Sets the default or user-specified port number for Remote Desktop connections. Enables firewall rules for inbound access to the port|
| IMDSCertCheck             | Checks from within the virtual machine for known configuration issues that may be causing IMDS to not function properly| 
| WindowsActivationValidation|  Checks from within the virtual machine for known Windows Activation issues or concerns that may cause action to fail|

::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
