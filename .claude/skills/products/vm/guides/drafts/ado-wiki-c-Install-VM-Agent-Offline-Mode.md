---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Install VM Agent Offline Mode_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Install%20VM%20Agent%20Offline%20Mode_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
---

[[_TOC_]]

## Summary

From time to time you will need to work in a machine which doesn't have the VM Agent install or the same is broken and either the OS is down and/or is unable to authenticate and to troubleshoot without the agent could be difficult. The procedure below will show you how to work with a VHD from another machine and install the VM Agent on it.

This is useful in scenarios like:

1.  Password reset scenarios
2.  Any scenario where you need to push a script on the VM and this one is not processing this out either due to a broken agent or the agent is not installed at all

### Brownbag Video

  - [HowTo Install the VM Agent in OFFLINE mode](https://microsoft.sharepoint.com/:v:/t/VMHub/ERLLBgZxkMBEm0WlAIXBxk0BXHKdDr4Oj_TzMVFjC5Ug5g?e=2Wd75I)

## Customer Enablement

  - [Install the VM agent in offline mode in an Azure Windows VM](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/install-vm-agent-offline)

## Instructions using "az repair" extension with a script

1.  Launch CLI in Azure Cloud Shell and run the commands below, being **"sourceRG"** the **resource group name** of VM in question and **"sourceVM"** the **VM name** in question.
2.  Commands to install **OR** update the extension:
    ```
        # Install extension:
        az extension add -n vm-repair

        # Update extension:
        az extension update -n vm-repair
    ```
3.  Command to create a repair/rescue VM and attach OS disk as data disk:
    ```
        az vm repair create -g sourceRG -n sourceVM
    ```
4.  Command to run **win-GA-fix** script on repair/rescue VM.
    ```
        az vm repair run -g sourceRG -n sourceVM --run-on-repair --run-id win-GA-fix
    ```
5.  Command to swap OS disk of VM in question with the modified/fixed disk.
    ```
        az vm repair restore -g sourceRG -n sourceVM
    ```

**NOTE**: If rescue VM was created manually without the "az repair" extension, you can attempt to run the script manually by copying it from github and pasting it in the "run command" option of the rescue VM **ONLY** if the OS disk of VM in question is properly attached as data disk **AND** online.

**win-GA-fix**: https://raw.githubusercontent.com/Azure/repair-script-library/master/src/windows/GA_offlinefixer_damunozl.ps1

## Instructions to do it manually

**Step 1**

Once the OS disk is attached on a troubleshooting VM, mount the SYSTEM hives.

7.  If you have a current version of the agent that is not working, then perform a backup of the current configuration

    1.  Rename the folder **\windowsazure** to **\windowsazure.old**

    2.  Export the following registries
        ```
            HKLM\BROKENSYSTEM\ControlSet001\Services\WindowsAzureGuestAgent
            HKLM\BROKENSYSTEM\ControlSet001\Services\RdAgent
        ```

8.  Now using the existing files from your healthy troubleshooting VM we are going to use it as a repository for the binaries and setup:

    1.  From the troubleshooting VM export the following keys in .reg format:
        ```
            HKLM\SYSTEM\ControlSet001\Services\WindowsAzureGuestAgent
            HKLM\SYSTEM\ControlSet001\Services\RdAgent
        ```

    2.  Now edit the ***two .reg files*** from the healthy machine and rename **SYSTEM** by **BROKENSYSTEM** and save the files

    3.  Now merge this new files into your registry by double clicking those three .reg files

    4.  Now that registry entries are in place. We just need to copy the binaries:

        1.  On the VM that you are installing the Azure Agent, create the folder `\WindowsAzure`
        2.  Now from your rescue VM copy the files `c:\WindowsAzure\GuestAgent_2.7.41491.993_2020-09-11_230341` to the attached this under the new folder `\WindowsAzure`

        **Note:** Install whichever version you have on the rescue VM (prefer the latest).

**Step 2**

Unmount SYSTEM hives, detach the disk and recreate the VM.

10. Detach the disk and recreate the VM

11. Now if you access the VM you will see the RDAgent running and the logs getting created.

12. If this is an RDFE machine, you must also use Azure PowerShell to update the ProvisionGuestAgent property:
    ```
        $vm = Get-AzureVM -ServiceName <cloud service name> -Name <VM name>
        $vm.VM.ProvisionGuestAgent = $true
        Update-AzureVM -Name <VM name> -VM $vm.VM -ServiceName <cloud service name>
    ```
