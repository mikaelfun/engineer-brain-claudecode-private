---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Azure Disk Encryption (ADE)/Recreate DualPass Encrypted VM from fixed encrypted disk_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Encryption
- cw.How-To
- cw.Reviewed-01-2025
---

:::template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::

[[_TOC_]]

# What is this automated process

This automated process is a PowerShell script.

<br />

# Why this automated process was created

<br />

- After the issue was fixed on the copy of the OS disk of a broken VM, which was attached to the rescue environment created with the script [**Create_Rescue_VM_from_DualPass_Encrypted_Vm**](https://github.com/gabriel-petre/ADE/blob/main/Create_Rescue_VM_from_DualPass_Encrypted_Vm/Create_Rescue_VM_from_DualPass_Encrypted_Vm_1.0.ps1) ([wiki page](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/623834)), the next logical action is to swap the broken OS disk with the fixed copy of the OS disk.
- But the "swap disk" feature is not supported/working on dual pass encrypted VMs.
- Since there is no other option than to do the process of replacing the OS disk manually, this process (script) was created to automate the manual process.

<br />

# Advantages

- This is an automated process of restoring the functionality of a broken VM after it was fixed for VMs which are encrypted with Dual Pass (older version - with AAD) BEK and KEK.
- This PowerShell script was designed to be used from Azure Cloud Shell, to eliminate the need for PowerShell prerequisites needed in the manual process, which caused delays or additional issues due to the diversity of environments in terms of PowerShell version, OS version, user permissions, internet connectivity, etc.
- The duration for this process using this script is between 4 minutes and 15 minutes (depending on the option selected), which is far less than the manual process which can take hours or even days depending on the complexity of scenarios, environment variables, customer limitations, and level of expertise.
- Reduced risk of human errors in gathering and using encryption settings.
- Available backups in case of the worst scenarios.
- The use of the script has no limitations that were found regarding the operating system versions (Windows or Linux) **supported in Azure**.
- Offers the possibility to automatically create additional resources or assign necessary permissions needed in this scenario.
- Insignificant number of initial input data needed to run this script.
- Available execution/troubleshooting logs that can be used to investigate/improve the runtime of this script.
- Additional checks during this process to reduce or prevent the risk of a script failure due to the variety of environments.
- Additional explanatory details offered during the process, which helps the user to learn theoretical aspects along the way.
- Error handling for the most common errors in terms of auto-resolving or guidance for the manual process of resolving the issue.
- Offers the possibility to delete unnecessary resources that were created during the process.
- Offers the possibility of using the script multiple times if the troubleshooting scenario requires this, by using the saved VM configuration and backups created in this process.

<br />

# Scenarios where it can be used (but not limited to them)

- After the issue was fixed on the copy of the OS disk of a broken VM, which was attached to the rescue environment created with the script [**Create_Rescue_VM_from_DualPass_Encrypted_Vm**](https://github.com/gabriel-petre/ADE/blob/main/Create_Rescue_VM_from_DualPass_Encrypted_Vm/Create_Rescue_VM_from_DualPass_Encrypted_Vm_1.0.ps1), use this script to recreate the broken VM from a previously exported configuration using the fixed copy OS disk.
- If in specific troubleshooting scenarios there is the need to delete/create again (recreate) an encrypted dual pass VM from the same OS disk.

<br />

# Supported features/scenarios

- VM encrypted with Dual Pass (older version - with AAD) BEK and KEK.
- An already deleted VM can be created from an existing configuration JSON file as long as the other resources are still available (disk, NIC, VNET, NSG, etc.).
- VMs with Managed and Unmanaged disks.
- VMs with Windows/Linux existing operating systems.
- This script can be used to delete/recreate an existing encrypted VM with Dual Pass (older version - with AAD) BEK and KEK from the same OS disk.
- VMs with multiple data disks.
- VMs with multiple NICs.
- VMs in an availability set.
- VMs in an availability zone.
- VMs in a proximity placement group.
- VMs in an availability set and in a proximity placement group.
- VMs with a plan associated.
- VMs with multiple TAGs.
- VMs that have enabled the option "to delete the OS disk when VM is deleted".
- VMs that have a 'boot diagnostics' storage account (managed or custom).

<br />

# Limitations

**Note:**
<br /> Due to the large variety of options/features a VM can have, supporting all of them is a challenge. At this point, please find below a limited list of some of the common unsupported options/features.
<br /> **Unsupported options/features mean that they will not be enabled/added automatically. These actions should be performed manually after the VM is recreated.**

- The script was designed to be used **only** on VMs which are encrypted with Dual Pass (older version - with AAD).
- The script was designed to be used **only** in [**Azure Cloud Shell**](http://shell.azure.com/).
- Linux VMs that have SSH keys as an authentication method and not passwords are not supported.
- VMs that have enabled the option "to delete the data disks or NICs when VM is deleted" are not supported.
- VMs with other extensions than the ADE extension.
- VMs configured to use Azure Recovery Services (like backup or replication).
- VMs with Automatic Updates configured.
- VMs with Diagnostic settings configured (Azure Monitor).
- When data disks are attached, the host cache is set to 'None'. But at the end of the script, the user is asked if they want to display host cache settings for data disks stored in the JSON file to set manually the cache as it was.

<br />

# Prerequisites

- User needs to have access to get/create snapshots, disks, resource groups, additional resources necessary for creating a VM like NICs, public IPs, VNETs, NSGs, and to create a new VM.
- User needs to have access to Azure Cloud Shell.
- User needs to have access to their Azure Active Directory (for assigning proper permissions to AAD Application to have access to the keys and secrets from Key Vault).

# What it does

Deletes the original broken VM which is encrypted with Dual Pass (older version - with AAD) and recreates this VM from a previously exported configuration using the OS disk that was fixed in the rescue environment created with the script [**Create_Rescue_VM_from_DualPass_Encrypted_Vm**](https://github.com/gabriel-petre/ADE/blob/main/Create_Rescue_VM_from_DualPass_Encrypted_Vm/Create_Rescue_VM_from_DualPass_Encrypted_Vm_1.0.ps1) or from the same OS disk.

**Detailed steps:**

- Tests if the specified VM and disk exist.
- Exports a JSON configuration file or uses an existing one.
- Checks VM Agent state.
- For managed disks, creates a snapshot of the OS disk with a name pattern like 'snap_$i_$OSDiskName' where '$i' is incremental if a snapshot with the same name already exists. Note that the snapshot name will be truncated if the number of characters is greater than "50".
- For managed disks, creates a disk from the snapshot for backup purposes with a name pattern like 'copy_$i_$OSDiskName' where '$i' is incremental if a disk with the same name already exists. Note that the disk name will be truncated if the number of characters is greater than "50". The disk will be stored in the resource group of the specified disk.
- For managed disks, deletes the snapshot.
- For unmanaged disks, creates a copy of the OS disk (blob) in the same storage account and container where the OS disk is stored.
- Checks if the specified disk is attached to a VM or not, offering the possibility to detach the disk if it is attached to the rescue VM or continue if the specified disk is the current OS disk of the VM that needs to be recreated.
- Checks if the VM is encrypted with Dual Pass. If not, the script will end.
- Gets encryption settings from the JSON file.
- For managing encryption keys in the key vault, the user is offered to select an option from below to get the details of an Azure AD application and a secret that will be used in the process of authentication in Azure AD:
  - To specify the secret value of a secret that was already created in the AAD App that was found and will be used further in the encryption process.
  - To specify the ID of an existing AAD Application and existing secret value from the same AAD Application that will be used in the encryption process.
  - To create a new secret in the AAD App user specifies and will be used in the encryption process.
  - If the options above are not feasible, the user can create a new AAD Application and secret that will be used in the encryption process.
- Based on the selected option, the script will proceed taking the proper actions to have in the end, an AAD application ID and a secret that will be used in the process of authentication in Azure AD.
- For managing encryption keys and secrets in the key vault, the Azure AD application needs to have permission on the Key Vault, so the user is offered to select an option from below to deal with permissions:
  - Permissions will be set automatically as long as your user has access to do this operation.
  - The user needs to manually give permissions for the AAD Application on keys and secrets from Key Vault and run the script again.
  - The user needs to confirm that permissions are already set.
- Based on the selected option, the script will proceed taking the proper actions for the AAD Application to have proper permissions to keys and secrets from Key Vault or stop for the user to manually assign those permissions.
- Checks if encryption settings gathered can successfully encrypt the VM.
- Checks if the option to delete OS disk, data disks, and NICs are set to be deleted when the VM is deleted.
- Detaches data disks.
- Deletes VM.
- Adds encryption settings gathered to the VM Configuration.
- Recreates VM from VM configuration created based on the settings found in the JSON file and listed in the Supported features/scenarios section.
- Checks VM Agent state.
- Displays encryption settings gathered.
- For Linux VMs:
  - Creates a backup of the folder '/var/lib/azure_disk_encryption_config/' into the path '/var/lib/azure_disk_encryption_backup_config/'.
  - Removes the file '/var/lib/azure_disk_encryption_config/azure_crypt_params.ini' to resolve the issue described [**here**](https://supportability.visualstudio.com/AzureLinuxNinjas/_wiki/wikis/AzureLinuxNinjas/214316/Remove-encryption-settings-from-a-VM-where-encryption-pro).
- Installs ADE extension with encryption settings gathered.
- For Linux VMs: Creates an empty 'azure_crypt_params.ini' file into the path '/var/lib/azure_disk_encryption_config/azure_crypt_params.ini' to avoid future issues described [**here**](https://portal.microsofticm.com/imp/v3/incidents/details/241430093/home).
- Asks the user if they want to delete the backup disk that was created at the beginning of the script.
- Asks the user if they want to display host cache settings for data disks stored in the JSON file, since when data disks are attached the host cache is set to 'None'.

<br />

### Additional checks and actions:

| **Checks** | **Actions** |
|------------|-------------|
| Before VM deletion, check VM Agent state | If No -> Show warning message that it is highly recommended that the VM agent is in a 'Ready State', since for the encryption process (add ADE extension) to be successful (which happens after this VM will be deleted and recreated) the VM agent needs to be in a 'Ready' state after VM will be recreated. If VM agent is NOT in a 'Ready' state after VM is recreated, the script will stop and the encryption process (add ADE extension) needs to be manually resumed or run again once the VM is in a 'Ready' state. <br /> If Yes -> Continue |
| Checks if the specified disk is attached to a VM | If No -> Continue <br /> If Yes -> Ask user to detach the disk |
| If VM is encrypted with Dual Pass | If No -> Stop script <br /> If Yes -> Continue |
| When creating a new AAD Application, check if another AAD App exists with the same name | If No -> Create a new AAD Application <br /> If Yes -> Request again to enter a different name |
| Check if user has the role 'Key Vault Administrator' for Azure role-based access control Key Vault Permission model | If No -> Assign 'Key Vault Administrator' role to user |
| Check if encryption settings gathered can successfully encrypt VM | If No -> Ask user to resolve the errors and run the script again <br /> If Yes -> Continue |
| Check if the OS disk is set to be deleted when VM is deleted | If No -> Continue <br /> If Yes -> Disable this option |
| Check if the NICs are set to be deleted when VM is deleted | If No -> Continue <br /> If Yes -> Stop script |
| Check if the Data disks are set to be deleted when VM is deleted | Script is not checking this, but it is detaching data disks before deleting VM to avoid deleting the data disks when VM is deleted |
| After VM is recreated, check VM Agent state | Wait 5 minutes for the VM agent to become ready or the script will stop after 5 minutes since encryption will not be able to start without the VM agent in a ready state |
| Check if VM is encrypted with BEK or KEK | Encrypt VM based on the results |
| Ask user if they want to delete the backup disk that was created at the beginning | If No -> Stop script <br /> If Yes -> Delete Disk -> Stop script |

### Diagram

Please check the diagram with the detailed steps:  
*(click on the image to open the diagram in a new tab in full size)*

[![Recreate DualPass VM from Disk - Diagram](/.attachments/SME-Topics/Azure-Encryption/Recreate_DualPass_VM_from_disk_diagram.jpg =200x475)](https://supportability.visualstudio.com/3c8a2634-09bc-48d9-b703-6a6720e61bf9/_apis/git/repositories/f521398e-534c-4115-bc04-7c4e33ff28a8/items?path=/.attachments/SME-Topics/Azure-Encryption/Recreate_DualPass_VM_from_disk_diagram.jpg&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=main&resolveLfs=true&%24format=octetStream&api-version=5.0)

### Troubleshooting logs:

| Logs in the Azure Cloud Shell drive | Tool | Description |
|-------------------------------------|------|-------------|
| $HOME/RecreateScript_Execution_log.txt | PowerShell script | Main execution log |

### Important files:

| Config file in the Azure Cloud Shell drive | Tool | Description |
|--------------------------------------------|------|-------------|
| $HOME/VM_$VmName_Settings_$TimeNow.json | PowerShell script | Contains VM configuration which is exported in this JSON file from which VM will be recreated <br /> $TimeNow -> stores the time in that moment and that time is added at the end of the name of the JSON file every time the VM configuration is exported in another JSON file |

### Useful troubleshooting details

- The hostname was not changed and it will be the same. If the hostname is important, like VM was domain joined, manually rejoin VM to domain.


# How to use the script

**Important:**  
**Please use a new page of Azure Cloud Shell before running the script, since Azure Cloud Shell has a timeout period of 20 minutes of inactivity.  
If Azure Cloud Shell times out while the script is running, the script will stop at the time of the timeout.  
If the script is stopped before it finishes, the environment might end up in an 'unknown state'.**  
**If for some reason Azure Cloud Shell still times out, manually delete all the resources created until that point, and run the script again.**

## 1. Download/Upload script to Azure Cloud Shell $HOME directory

### **Option 1** - Download the script from GitHub repository to the Azure Cloud Shell drive:

- Open [**Script repository**](https://github.com/gabriel-petre/ADE/tree/main/Recreate_DualPass_VM_from_disk)
- Check what is the latest available version of the script
- Modify the command below to download the latest version of the script into the $HOME directory of your Azure Cloud Shell session.
```PowerShell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gabriel-petre/ADE/main/Recreate_DualPass_VM_from_disk/Recreate_DualPass_VM_from_disk_1.0.ps1" -OutFile $home/Recreate_DualPass_VM_from_disk_1.0.ps1
```
- Open [**Azure Cloud Shell**](http://shell.azure.com/)
- Paste the command and press enter to download the script into the $HOME directory of your Azure Cloud Shell session.

### **Option 2** - Upload the script from your local machine to the Azure Cloud Shell drive:

- Download the latest version of the script "Recreate_DualPass_VM_from_disk" from the [**repository**](https://github.com/gabriel-petre/ADE/tree/main/Recreate_DualPass_VM_from_disk)
- Open [**Azure Cloud Shell**](http://shell.azure.com/)
- Click on the Upload/Download/Manage file share icon, click on upload and select the script you previously downloaded from your local machine

<br />

## 2. Run the script

- Open [**Azure Cloud Shell**](http://shell.azure.com/)
- From the top left corner section, select 'PowerShell'
- See below examples on how to run the script:

```PowerShell
Recreate_DualPass_VM_from_disk_1.0.ps1 
  [-SubscriptionID] 
  [-VmName] 
  [-VMRgName]
  [-OSDiskName]
  [-OSDiskRg]                         # For VMs with Managed disks only
  [-NewOSDiskStorageAccountName]      # For VMs with Unmanaged disks only
  [-NewOSDiskContainer]               # For VMs with Unmanaged disks only
```

**Example of how to run the script for VMs with managed disks:**
```PowerShell
./Recreate_DualPass_VM_from_disk_1.0.ps1 -SubscriptionID "<Subscription ID>" -VmName "<Impacted VM Name>" -VMRgName "<Impacted VM resource group Name>" -OSDiskName "<Name of the disk that will be the OS disk>" -OSDiskRg "<Resource Group Name of the disk that will be the OS disk>"
```
*Note: The command above will delete the VM, recreate the VM from the exported config JSON file, and encrypt it again using the Dual Pass method.*

**Example of how to run the script for VMs with unmanaged disks:**
```PowerShell
./Recreate_DualPass_VM_from_disk_1.0.ps1 -SubscriptionID "<Subscription ID>" -VmName "<Impacted VM Name>" -VMRgName "<Impacted VM resource group Name>" -OSDiskName "<Name of the disk that will be the OS disk>" -NewOSDiskStorageAccountName "<Name of the storage account>" -NewOSDiskContainer "<Name of the container from the storage account>"
```
*Note: The command above will delete the VM, recreate the VM from the exported config JSON file, and encrypt it again using the Dual Pass method.*

| **Mandatory parameters** | **Description** |
|--------------------------|-----------------|
| -SubscriptionID | Subscription ID where the VM resides |
| -VmName | The name of the Virtual Machine that is experiencing issues and you want to delete, then recreate and then encrypt again with Dual Pass |
| -VMRgName | The resource group name of the same Virtual Machine |
| -OSDiskName | The name of the disk that will be the OS disk |
| -OSDiskRg | The name of the resource group of the disk that will be the OS disk <br /> **For VMs with Managed disks only** |
| -NewOSDiskStorageAccountName | The name of the storage account where the fixed disk resides and that will be the OS disk <br /> **For VMs with Unmanaged disks only** |
| -NewOSDiskContainer | The name of the container from the storage account where the fixed disk resides and that will be the OS disk <br /> **For VMs with Unmanaged disks only** |

<br />

# Video Walkthrough

## Windows

**Recreate a Windows VM**

::: video
<iframe width="560" height="315" src="https://microsoft.sharepoint.com/teams/VMHub/_layouts/15/embed.aspx?UniqueId=def06c9d-1c68-4462-a749-4f39861e7508&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" allowfullscreen style="border:none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; height: 100%; max-width: 100%;"></iframe>
:::

## Linux

**Recreate a Linux VM**

::: video
<iframe width="560" height="315" src="https://microsoft.sharepoint.com/teams/VMHub/_layouts/15/embed.aspx?UniqueId=542f1674-c270-462b-a639-a7e0c9fb2978&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" allowfullscreen style="border:none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; height: 100%; max-width: 100%;"></iframe>
:::

**Recreate a Linux VM with Unmanaged Disks (the process is the same for Windows VMs with unmanaged disks)**

::: video
<iframe width="560" height="315" src="https://microsoft.sharepoint.com/teams/VMHub/_layouts/15/embed.aspx?UniqueId=9e091152-5447-4bf7-a80a-e85efe6625d8&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" allowfullscreen style="border:none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; height: 100%; max-width: 100%;"></iframe>
:::

## LabBox

For the purpose of training or following along with this TSG, you can use the following link to deploy a dual-pass ADE encrypted VM with this scenario built-in. This lab is not to be shared with customers.

[![Click to Deploy]( /.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Encryption/adeDPtoSP.json)

<br /><br />
::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::
