---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Uninstall App from Offline VM_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FUninstall%20App%20from%20Offline%20VM_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
- cw.Reviewed-01-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]

## Summary

This article describes ways to uninstall software from an Azure machine that is either non-booting or lacks connectivity. This method helps avoid downloading the disk to on-premises.

## Prerequisite

N/A

## Procedure

### Manual

<div>

The procedure below only works with applications installed using <span style="background-color:yellow; color:black;">***MSI installers***</span>. For other types of installers, you will need to download the disk to on-premises.

</div>

1. Delete the machine, keeping the attached disks.
2. Attach the OS disk to a troubleshooting machine.
3. Identify the letter assigned to this OS disk, then open an elevated CMD window and run the command below. Write down the identifier number of the application, which is the GUID of the application.
    
    ```cmd
    dism /image:<OS Disk letter>:\ /get-apps
    ```

4. Browse to `\windows\system32\grouppolicy` and rename any file named `gpt.ini` to `gpt.ini.bak`.
5. Create a new `gpt.ini` file and place it in `\windows\system32\grouppolicy` with the following content:
    
    ```ini
    [General]
    gPCFunctionalityVersion=2
    gPCMachineExtensionNames=[{<GUID of the application>}]
    Version=1
    ```

    > Note: Replace `<GUID of the application>` with the identifier number of the application obtained in step 3. If there are multiple GUIDs to be uninstalled, you can list them separated by commas in the `gPCMachineExtensionNames` field.

    ### Example for multiple GUIDs

    If you have multiple GUIDs to uninstall, modify the `gpt.ini` as follows:

    ```ini
    [General]
    gPCFunctionalityVersion=2
    gPCMachineExtensionNames=[{GUID1},{GUID2},{GUID3}]
    Version=1
    ```

    > Note: Replace `GUID1`, `GUID2`, and `GUID3` with the actual identifier numbers of the applications obtained in step 3.

6. Create a file named `scripts.ini` and place it in `\Windows\System32\GroupPolicy\Machine\Scripts` with the following content:
    
    ```ini
    [Startup]
    0CmdLine=C:\Windows\System32\UninstallMSIAzureVM.cmd
    0Parameters=
    ```

7. Create the script `UninstallMSIAzureVM.cmd` and place it in `\windows\system32` with the following content:
    
    ```cmd
    msiexec /x {<GUID of the application>} REMOVE=ALL REBOOT=R /q
    ```

    > Note: Replace `<GUID of the application>` with the identifier number of the application obtained in step 3.

8. Detach the OS disk from the troubleshooting VM and recreate the VM.
9. After the first restart, the script will have removed the application. Then, you will need to attach the disk back to a troubleshooting machine and remove all the injected scripts:
    - Delete `\windows\system32\grouppolicy\gpt.ini`
    - Restore `\windows\system32\grouppolicy\gpt.ini.bak`
    - Delete `\Windows\System32\GroupPolicy\Machine\Scripts\script.ini`
    - Delete `\windows\system32\UninstallMSIAzureVM.cmd`
10. Detach the OS disk and recreate the VM.

### Automatic

Alternatively, you can use the following Azure VM repair script to automatically grab installed items and, if they can be silently uninstalled, configure the uninstallation using local policies:

```bash
<# https://github.com/Azure/repair-script-library/blob/main/src/windows/win-get-apps.ps1 #>
<# https://github.com/Azure/repair-script-library/blob/main/src/windows/win-remove-app.ps1 #>

# Step 1: Set the correct subscription by running the following if needed:
az account set --subscription "SUBID"

# Step 2: Install the repair extension:
az extension add -n vm-repair
# Already installed? Apply any available updates:
az extension update -n vm-repair

# Step 3: Configure a new repair VM using the name and RG of your broken VM. Replace "rg" and "vm" accordingly
rg='sourceRG'
vm='sourceVM'
az vm repair create --verbose -g $rg -n $vm
# Follow the prompts. Give it an admin username and password. Use a Public IP address to quickly access when complete. Encrypted disk? Request it unlock your disk temporarily.

# Step 4: Get installed apps that can be uninstalled from a rescue VM using the Quiet Uninstall String
az vm repair run -g $rg -n $vm --run-id 'win-get-apps' --verbose --run-on-repair

# Step 5: Target app(s) based on QUS output, example:
az vm repair run -g 'sourceRG' -n 'sourceVM' --run-id 'win-remove-app' --parameters uninstallString='{CE15D1B6-19B6-4D4D-8F43-CF5D2C3356FF}' --verbose --run-on-repair
az vm repair run -g 'sourceRG' -n 'sourceVM' --run-id 'win-remove-app' --parameters uninstallString='"C:\Program Files\McAfee\unins000.exe" /SILENT' --verbose --run-on-repair
# If there isn't an app Quiet Uninstall String returned from the above step, then this method will not work to uninstall the application

# Step 6: Start the VM while nested and login to execute the uninstall policy. Confirm the application(s) have been removed.

# Step 7: Swap the disks and delete the repair resources
az vm repair restore -g $rg -n $vm --verbose
```

## Reference

- [Leverage DISM on Azure VM troubleshooting](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495147)
- [DISM How-to Topics (Deployment Image Servicing and Management)](https://msdn.microsoft.com/en-us/windows/hardware/commercialize/manufacture/desktop/dism-how-to-topics--deployment-image-servicing-and-management)
- [Service a Windows Image Using DISM](https://msdn.microsoft.com/en-us/windows/hardware/commercialize/manufacture/desktop/service-a-windows-image-using-dism)
- [DISM Reference (Deployment Image Servicing and Management)](https://msdn.microsoft.com/en-us/windows/hardware/commercialize/manufacture/desktop/dism-reference--deployment-image-servicing-and-management)

::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
