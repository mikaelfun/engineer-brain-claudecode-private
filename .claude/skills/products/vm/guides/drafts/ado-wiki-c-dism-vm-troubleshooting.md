---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Use DISM for VM Troubleshooting_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FUse%20DISM%20for%20VM%20Troubleshooting_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
- cw.Reviewed-10-2023
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

Sometimes you need to query, add or remove either a feature/role, a KB, a driver or an application from a Windows image. This article will explain how to accomplish this thru console so we can avoid downloading the disk in on premises for the customer to remove/add this with full access to the VM.

## Prerequisite

N/A

## OFFLINE Mode

<div>
*DISM's Offline mode is used when the machine you intend to repair is inaccessible through standatd means such as RDP, Serial Console, or Remote Powershell.  Typically you will be running these commands on a recovery machine and targetting the attached Data Disk you intend to repair.*

DISM command should always be run from a <u>***recovery VM that has the same OS level or newer that the one that needs to be fix***</u>. Using a DISM command from an older OS version may fail to repair newer OS version disks systems.

</div>

### DISM Imaging

1.  Pending reboots
    <br/>` dism.exe /image:<OS Disk letter>:\ /cleanup-image /revertpendingactions  `
    **Example:** ` dism.exe /image:e:\ /cleanup-image /revertpendingactions  `
2.  Health status of an image
    1.  To see if the image was flagged as corrupted by a failed process and whether the corruption can be repaired.
        <br/>`Dism /image:<OS Disk letter>:\ /cleanup-image /checkhealth`
        **Example** `Dism /image:e:\ /cleanup-image /checkhealth`
    2.  To scan the image for component store corruption
        <br/>`Dism /image:<OS Disk letter>:\ /cleanup-image /scanhealth`
        **Example:** `Dism /image:e:\ /cleanup-image /scanhealth`
    3.  To scan the image for component store corruption and then perform repair operations automatically
        1.  Restoring health with using for repository the troubleshooting VM from where the DISM is running
            <br/>`Dism /image:<OS Disk letter>:\ /cleanup-image /restorehealth`
            **Example:** `Dism /image:e:\ /cleanup-image /restorehealth`
        2.  Restoring health specifying the source
            <br/>`Dism /image:<OS Disk letter>:\ /cleanup-image /restorehealth /source:<image to use for repository>`
            **Example** `Dism /image:e:\ /cleanup-image /restorehealth /source:wim:e:\recovery\windowsRE\winre.wim:1`

Alternatively, we can use the following az vm repair script as well to run `dism.exe /image:$osDrive /cleanup-image /revertpendingactions` & `dism /Image:$osDrive /Cleanup-Image /RestoreHealth /Source:c:\windows\winsxs` automatically (NOTE: the Azure Cloud Shell will time out after some time and these commands can take time to complete, thus would only recommend running this in a local az cli shell instance):

```bash
<# https://github.com/Azure/repair-script-library/blob/main/src/windows/win-sfc-sf-corruption.ps1 #>

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

# Step 4: Run DISM, SFC, and regback restoration (if configured: https://learn.microsoft.com/en-us/troubleshoot/windows-client/deployment/system-registry-no-backed-up-regback-folder).
# This can take some time to complete.
az vm repair run -g $rg -n $vm --run-id 'win-sfc-sf-corruption' --verbose --run-on-repair

# Step 5: Swap the disks and delete the repair resources
az vm repair restore -g $rg -n $vm --verbose
```


### DISM Servicing

Whenever the VM does not have connectivity you need to work in OFFLINE mode meaning, attaching t he OS disk of the target machine as a data disk on another VM. Below will summarize how to use DISM for several purposes. On the below examples, the parameter **/image:\<OS Disk letter\>** should have the letter assigned on the troubleshooting VM where the OS disk from the faulty VM is attached (as a data disk). If there's any data disk, usually this is F:. so therefore, this parameter will show **/image:f:\\**

1.  Windows feature management
      - Query the complete list of features and their status enable/disable
        <br/>` dism /image:<OS Disk letter>:\ /get-features  `
      - Enable a feature
        <br/>` Dism /Image:<OS Disk letter>:\ /Enable-Feature /FeatureName:<<Feature to add>> /All  `
        **Example:** ` Dism /Image:E:\ /Enable-Feature /FeatureName:Licensing /All  `
      - Disable a feature
        <br/>` Dism /Image:<OS Disk letter>:\ /Disable-Feature /FeatureName:<<Feature to remove>>  `
        **Example:** ` Dism /Image:E:\ /Disable-Feature /FeatureName:Remote Desktop-Services /All  `
2.  KBs management
      - Query
        <br/>` dism /image:<OS Disk letter>:\ /get-packages  `
      - Install
        <br/>` dism /image:<OS Disk letter>:\ /add-package /packagepath:c\temp\<<KB .msu or .cab>>  `
      - Remove
        <br/>` dism /Image:<OS Disk letter>:\ /Remove-Package /PackageName:<<Package Name>>  `
        **Example:** `dism /Image:E:\ /Remove-Package /PackageName:Package_for_KB3199986~31bf3856ad364e35~amd64~~10.0.1.0`

      - Alternatively, we can use the following az vm repair script as well to run `dism.exe /image:$osDrive /get-packages` & `dism /Image:$osDrive /Remove-Package /PackageName:<<Package Name>>` automatically:

        ```bash
        <# https://github.com/Azure/repair-script-library/blob/main/src/windows/win-get-patches.ps1 #>
        <# https://github.com/Azure/repair-script-library/blob/main/src/windows/win-remove-patch.ps1 #>

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

        # Step 4: Get installed patches
        az vm repair run -g $rg -n $vm --run-id 'win-get-patches' --verbose --run-on-repair

        # Step 5: Then remove one of the returned patches (change accordingly)
        az vm repair run -g $rg -n $vm --run-id 'win-remove-patch' --parameters packageName='Package_for_KB1234567~31bf3856ad364e35~amd64~~17763.2090.1.3' --verbose --run-on-repair

        # Step 6: Swap the disks and delete the repair resources
        az vm repair restore -g $rg -n $vm --verbose
        ```
        
3.  Drivers management
      - Add
          - Signed driver: ` Dism /Image:<OS Disk letter>:\ /Add-Driver /Driver:C:\drivers\<<Driver INF file>>  `
            **Example:** ` Dism /Image:E:\ /Add-Driver /Driver:C:\drivers\mydriver.inf  `
          - Unsigned driver (not recommended): ` Dism /Image:<OS Disk letter>:\ /Add-Driver /Driver:C:\drivers\<<Driver INF file>> /ForceUnsigned  `
            **Example:** ` Dism /Image:E:\ /Add-Driver /Driver:C:\drivers\mydriver.inf /ForceUnsigned  `
      - Query 3rd party. The system will rename and show these drivers as **OEMxx.inf**
        <br/>` dism /image:<OS Disk letter>:\ /get-drivers  `
      - Remove 3rd party
        <br/>` Dism /Image:<OS Disk letter>:\ /Remove-Driver /Driver:OEM1.inf /Driver:OEM2.inf  `
4.  Apps
      - Query all the applications which were installed with an MSI file
        <br/>` dism /image:<OS Disk letter>:\ /get-apps  `
        <br/>` Dism /image:<OS Disk letter>:\ /Get-AppInfo  `
      - Alternatively, we can use the following az vm repair script as well to uninstall certain applications automatically on startup using the registry and local policy (NOTE: this will not return every application installed on the VM, only the ones that can be silently uninstalled, thus the uninstallation can be started from Offline):

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

        # Step 4: Get installed apps
        az vm repair run -g $rg -n $vm --run-id 'win-get-apps' --verbose --run-on-repair

        # Step 5: Then remove a returned app on startup by its Quiet Uninstall String (change accordingly)
        az vm repair run -g $rg -n $vm --run-id 'win-remove-app' --parameters uninstallString='{BEF2B9D6-4D36-3799-ADC8-F61F1926092C}' --verbose --run-on-repair
        az vm repair run -g $rg -n $vm --run-id 'win-remove-app' --parameters uninstallString='"C:\Program Files\Microsoft VS Code\unins000.exe" /SILENT' --verbose --run-on-repair
        # You can either start the server in Hyper-V or as an Azure VM. The uninstall will occur when the guest OS has started before logging in

        # Step 6: Swap the disks and delete the repair resources
        az vm repair restore -g $rg -n $vm --verbose
        ```

## ONLINE Mode

*NOTE: DISM's Online mode is used when you can access the machine in question directly, such as with RDP, Serial Console, or Remote Powershell.  These steps are typically used when the VM is up and running, but we are still seeing some issues with logging in, remote desktop, or local OS issues that may be related to the Windows System files.*
### DISM Imaging

1.  Pending reboots
    <br/>` dism.exe /online /cleanup-image /revertpendingactions  `
    **Example:** ` dism.exe /online /cleanup-image /revertpendingactions  `
2.  Health status of an image
    1.  To see if the image was flagged as corrupted by a failed process and whether the corruption can be repaired.
        <br/>`Dism /online /cleanup-image /checkhealth`
        **Example** `Dism /online /cleanup-image /checkhealth`
    2.  To scan the image for component store corruption
        <br/>`Dism /online /cleanup-image /scanhealth`
        **Example:** `Dism /online /cleanup-image /scanhealth`
    3.  To scan the image for component store corruption and then perform repair operations automatically
        1.  Restoring health with using for repository the troubleshooting VM from where the DISM is running
            <br/>`Dism /online /cleanup-image /restorehealth`
            **Example:** `Dism /online /cleanup-image /restorehealth`
        2.  Restoring health specifying the source
            <br/>`Dism /online /cleanup-image /restorehealth /source:<image to use for repository>`
            **Example** `Dism /online /cleanup-image /restorehealth /source:wim:e:\recovery\windowsRE\winre.wim:1`

### DISM Servicing

1.  Connect to the VM using Powershell following the article [Access the VM using Powershell](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495102)
2.  Depends on what you want to do, the following actions could be performed:
    1.  Windows feature management
          - Query the complete list of features and their status enable/disable
            <br/>` dism /ONLINE /get-features  `
          - Enable a feature
            <br/>` Dism /ONLINE /Enable-Feature /FeatureName:<<Feature to add>> /All  `
            **Example:** ` Dism /ONLINE /Enable-Feature /FeatureName:Licensing /All  `
          - Disable a feature
            <br/>` Dism /ONLINE /Disable-Feature /FeatureName:<<Feature to remove>>  `
            **Example:** ` Dism /ONLINE /Disable-Feature /FeatureName:Remote Desktop-Services /All  `
    2.  KBs management
          - Query
            <br/>` dism /ONLINE /get-packages  `
          - Install
            <br/>` dism /ONLINE /add-package /packagepath:c\temp\<<KB .msu or .cab>>  `
          - Remove
            <br/>` dism /ONLINE /Remove-Package /PackageName:<<Package Name>>  `
            **Example:** `dism /ONLINE /Remove-Package /PackageName:Microsoft.Windows.Calc.Demo~6595b6144ccf1df~x86~en~1.0.0.0`
    3.  Drivers management
          - Add
              - Signed driver: ` Dism /ONLINE /Add-Driver /Driver:C:\drivers\<<Driver INF file>>  `
                **Example:** ` Dism /ONLINE /Add-Driver /Driver:C:\drivers\mydriver.inf  `
              - Unsigned driver (not recommended): ` Dism /ONLINE /Add-Driver /Driver:C:\drivers\<<Driver INF file>> /ForceUnsigned  `
                **Example:** ` Dism /ONLINE /Add-Driver /Driver:C:\drivers\mydriver.inf /ForceUnsigned  `
          - Query 3rd party. The system will rename and show these drivers as **OEMxx.inf**
            <br/>` dism /ONLINE /get-drivers  `
          - Remove 3rd party
            <br/>` Dism /ONLINE /Remove-Driver /Driver:OEM1.inf /Driver:OEM2.inf  `
    4.  There are two way to work the Apps that were installed using an MSI file
        1.  Get the list of the installed software from the VM and its GUID
            <br/>` get-wmiobject Win32_Product | Format-Table IdentifyingNumber, Name, LocalPackage  `
        2.  Look for the software that you want to remove and take note of its GUID<br>
            ![6a4e1c41-2aec-4a62-bb02-023312549e8b1300px-HowTo-UninstallSF1.png](/.attachments/SME-Topics/Cant-RDP-SSH/6a4e1c41-2aec-4a62-bb02-023312549e8b1300px-HowTo-UninstallSF1.png)
        3.  Now run the uninstaller MSIEXEC over that GUID
            <br/>` msiexec /x {<<GUID>>} REMOVE=ALL REBOOT=R /q  `
            **Example:**
            <br/>`  msiexec /x {CE15D1B6-19B6-4D4D-8F43-CF5D2C3356FF} REMOVE=ALL REBOOT=R /q  `
        4.  Remove all the components that you need and then restart the VM
        5.  After the reboot, double check if the software was removed
            <br/>` get-wmiobject Win32_Product | Format-Table IdentifyingNumber, Name, LocalPackage  `

## Reference

  - [DISM How-to Topics (Deployment Image Servicing and Management)](https://msdn.microsoft.com/en-us/windows/hardware/commercialize/manufacture/desktop/dism-how-to-topics--deployment-image-servicing-and-management)
  - [Service a Windows Image Using DISM](https://msdn.microsoft.com/en-us/windows/hardware/commercialize/manufacture/desktop/service-a-windows-image-using-dism)
  - [DISM Reference (Deployment Image Servicing and Management)](https://msdn.microsoft.com/en-us/windows/hardware/commercialize/manufacture/desktop/dism-reference--deployment-image-servicing-and-management)
  - [Device Drivers](https://msdn.microsoft.com/en-us/windows/hardware/commercialize/manufacture/desktop/device-drivers-and-deployment-overview)
  - [Command-Line Options](https://msdn.microsoft.com/en-us/library/windows/desktop/aa367988\(v=vs.85\).aspx)


::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
