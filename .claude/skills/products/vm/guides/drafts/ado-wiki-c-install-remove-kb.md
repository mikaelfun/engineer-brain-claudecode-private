---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Install or Remove KB_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FInstall%20or%20Remove%20KB_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Install or Remove KB on Azure VM (Offline via DISM)

How to use DISM command to query for the existence of a KB on a Windows installation as well as to install/remove a hotfix on a Windows image VM in offline mode.

## To Install a KB

1. Attach the OS disk on a troubleshooting VM
2. Download the KB to install
3. Extract the KB till you get a .cab or .msu file to a location like c:\temp
   ```
   Expand F:* c:\temp\<KB .msu or .cab> c:\temp
   ```
4. Open up an elevated CMD and install the KB
   ```
   dism /image:<OS Disk letter>:\ /add-package /packagepath:c\temp\<KB .msu or .cab>
   ```
5. Once the command finishes, validate the KB was installed successfully by getting the patch level
   ```
   dism /image:<OS Disk letter>:\ /get-packages > c:\temp\Patch_level.txt
   ```

## To Remove a KB

### Manual method

1. Attach the OS disk on a troubleshooting VM
2. Open up an elevated CMD
   ```
   dism /image:<OS Disk letter>:\ /Remove-Package /PackageName:<<Package Name>>
   ```
   Example:
   ```
   dism /Image:E:\ /Remove-Package /PackageName:Package_for_KB3199986~31bf3856ad364e35~amd64~~10.0.1.0
   ```
3. Once the command finishes, validate the KB was removed successfully by getting the patch level
   ```
   dism /image:<OS Disk letter>:\ /get-packages > c:\temp\Patch_level.txt
   ```

### Using AZ VM Repair scripts

```bash
# Step 1: Set the correct subscription
az account set --subscription "SUBID"

# Step 2: Install the repair extension
az extension add -n vm-repair
# Already installed? Apply any available updates:
az extension update -n vm-repair

# Step 3: Create repair VM
rg='sourceRG'
vm='sourceVM'
az vm repair create --verbose -g $rg -n $vm

# Step 4: Get installed patches
az vm repair run -g $rg -n $vm --run-id 'win-get-patches' --verbose --run-on-repair

# Step 5: Remove a specific patch
az vm repair run -g $rg -n $vm --run-id 'win-remove-patch' --parameters packageName='Package_for_KB1234567~31bf3856ad364e35~amd64~~17763.2090.1.3' --verbose --run-on-repair

# Step 6: Swap the disks and delete the repair resources
az vm repair restore -g $rg -n $vm --verbose
```

**Repair scripts on GitHub:**
- Get patches: https://github.com/Azure/repair-script-library/blob/main/src/windows/win-get-patches.ps1
- Remove patch: https://github.com/Azure/repair-script-library/blob/main/src/windows/win-remove-patch.ps1
