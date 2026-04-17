---
source: ado-wiki
sourceRef: Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Query or Change Registry_RDP SSH
sourceUrl: https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FQuery%20or%20Change%20Registry_RDP%20SSH
importDate: 2026-04-06
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

Sometimes you need to check or change configurations on a VM. If the VM has connectivity, you may want to try any of the following methods.

## LabBox
 https://aka.ms/LabBox
- For the purpose of training or following along with this TSG, you can use the following link to deploy a VM with this scenario built-in. You will need to enable JIT for the VM. This lab is not to be shared with customers.

   [![Click to Deploy](/.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Connectivity/changeRDPPortNumber.json)

## Instructions

If you have connectivity to the VM, you have multiple ways to do this:
- If the VM is healthy and the guest agent is running, using Run Command and RDPSettings is an easy way to verify the RDP settings of a VM.

- ![Run Command to Query Port number](/.attachments/SME-Topics/Cant-RDP-SSH/Query-or-Change-Registry_RDP-SSH_Run_Command_for_port_number.png)

 ### Different ways of access to the VM

  - [Access thru Remote Services Console](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495098)
  - [Access thru PSSession](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495102)
  - [Access thru PsExec](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495101)
  - [Access thru Remote Registry](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495097)
  - [Access thru CSE Powershell](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495146)

### Different ways to change services setups

  - [Check or set a Windows service through registry](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495111)

### Using CSE and Powershell to query and setup values on the registry

1.  How to query the port number for RDP using CSE:

    ```PowerShell
    (Get-ItemProperty -Path 'REGISTRY::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -Name "PortNumber").PortNumber
    ```

2.  Now to get the result of this custom script, we need to use Powershell to check the output of the script using such a command:

    ```PowerShell
    PS C:\> (Get-AzureRmVMExtension -ResourceGroupName $RG -VMName $VMName -Name CustomScriptExtension -Status).SubStatuses.Message
    51321
    ```

3.  And then used CSE to change the Port number via registry

    ```PowerShell
    Set-ItemProperty -Path 'REGISTRY::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -Name "PortNumber" -Value 3389
    ```

4.  And then i again used custom script extension to change the Port number via registry

    ```PowerShell
    Set-ItemProperty -Path 'REGISTRY::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -Name "PortNumber" -Value 3389
    ```

There was no need to delete the VM, mount the VHD to another VM, change the registry, and then create a VM. This will save you a lot of time.
We should use custom script extension when possible to reduce troubleshooting time and solve issues quickly.


::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
