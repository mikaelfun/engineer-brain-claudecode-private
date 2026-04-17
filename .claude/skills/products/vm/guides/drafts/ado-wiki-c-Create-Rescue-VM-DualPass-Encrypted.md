---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Azure Disk Encryption (ADE)/Create Rescue VM from DualPass Encrypted VMs with automated process of unlocking disks_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Encryption/How%20Tos/Azure%20Disk%20Encryption%20%28ADE%29/Create%20Rescue%20VM%20from%20DualPass%20Encrypted%20VMs%20with%20automated%20process%20of%20unlocking%20disks_Encryption"
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
<br /><p style="color:red">The script was designed to create a rescue environment only for VMs encrypted with Dual Pass (older version - with AAD) BEK and KEK.</p>

<br />

# Why this automated process was created

- There are times when you need to troubleshoot a VM in scenarios like OS not booting, connectivity issues, or others.
- There are other tools that can help you in this process for connectivity scenarios like Run Command, Serial Console, Remote PowerShell, PsExec, but often these tools cannot be used for different reasons.
- In a no-boot scenario, you are limited in troubleshooting, and the most common path is to create a rescue environment (create a rescue VM, attach a copy of the broken OS disk as a data disk to this VM, and maybe install the Hyper-V role and create a VM inside Hyper-V).

- For non-encrypted VMs, you can easily create a rescue environment either manually or using Az VM repair.
<br /> What about when that VM is encrypted?
<br />
- When that VM is encrypted with Single Pass (newest version - without AAD), to create a rescue environment you can use either the manual process or Az VM repair, which supports creating a rescue environment for single pass encrypted VMs.
- When that VM is encrypted with Dual Pass (older version - with AAD), the only method of creating a rescue environment is to do it manually since Az VM repair doesn't support dual pass encrypted VMs.

The answer to why this process was created is to automate the process of creating a rescue VM and, if necessary, install Hyper-V and configure a VM inside Hyper-V for broken VMs that are encrypted with Dual Pass (older version - with AAD).

<br />

# Advantages 

- This is an automated process for creating all necessary resources for starting the troubleshooting process for VMs encrypted with Dual Pass (older version - with AAD).
- This PowerShell script was designed to be used from Azure Cloud Shell, to eliminate the need for PowerShell prerequisites needed in the manual process, which caused delays or additional issues due to the diversity of environments in terms of PowerShell version, OS version, user permissions, internet connectivity, etc.
- The duration for this process using this script is between 4 minutes and 15 minutes (depending on the option selected), which is far less than the manual process, which can take hours or even days depending on the complexity of scenarios, environment variables, customer limitations, and level of expertise.
- Reduced risk of human errors in gathering and using encryption settings.
- Available backups in case of the worst scenarios.
- No internet access is required for the Rescue VM, which is useful for users with restricted environments.
- The use of the script has no limitations that were found regarding the operating system versions (Windows or Linux) **supported in Azure**.
- Possibility and compatibility to choose the most common and newest operating system version, Windows or Linux, to create the rescue environment.
- Insignificant number of initial input data needed to run this script.
- Available execution and troubleshooting logs that can be used to investigate and improve the runtime of this script.
- Additional checks during this process to reduce or prevent the risk of a script failure due to the variety of environments.
- Additional explanatory details offered during the process, which helps the user to learn theoretical aspects along the way.
- Error handling for the most common errors in terms of auto-resolving or guidance for the manual process of resolving the issue.
- Offers the possibility of using the script multiple times if the troubleshooting scenario requires this.

<br />

# Scenarios where it can be used (but not limited to them)

VM's operating system is not booting properly.
VM has connectivity issues and other available tools cannot be used for this process, like:
- User cannot connect using RDP/SSH.
- Network card issues (VM isolated).
- Public IP issues.

<br />

# Supported features/scenarios

- VM encrypted with Dual Pass (older version - with AAD) BEK and KEK.
- VMs with Managed and Unmanaged disks.
- VMs with Windows/Linux existing supported operating systems.
- Add up to 5 name/value pairs as tags for the rescue VM.
- Existing resource groups.
- Existing Storage containers (for unmanaged disks).
- Existing Vnet/Subnet.
- Attach existing NSG to NIC of the Rescue VM.
- Restricted environments, since no internet access is required for the Rescue VM to be created, configured, and for the data disk to be unlocked. All the necessary resources are downloaded or created directly in the Azure drive and then pushed to the rescue VM using Invoke-AzVMRunCommand.

<br /> 

# Limitations

- The script was designed to be used **only** on VMs encrypted with Dual Pass (older version - with AAD).
- The script was designed to be used **only** in [**Azure Cloud Shell**](http://shell.azure.com/).

<br />

# Prerequisites

- User needs to have access to get/create snapshots, disks, resource groups, and additional resources necessary for creating a VM like NICs, public IPs, VNETs, NSGs, and to create a new VM.
- User needs to have access to Azure Cloud Shell.
- User needs to have access to their Azure Active Directory (for assigning proper permissions to AAD Application to have access (like list and create) to the keys and secrets from Key Vault). Even though this script doesn't really need this kind of access, it will be needed in the recreate process of this VM once the issue is fixed since swapping disks is not supported for Dual Pass (older version - with AAD) encrypted disks.

<br />

# What it does

It creates a rescue environment to be able to troubleshoot the actual issue of the impacted VM.

**Detailed steps:**
- Creates a copy of the OS disk of the impacted VM.
- Removes encryption settings from the disk created to be able to attach it to the rescue VM.
- Outputs encryption settings as a reference.
- Creates a rescue VM with the option of choosing the operating system version depending on if it is Windows or Linux.
- Copies encryption settings to the rescue VM to that Azure platform to attach the 'BEK Volume' which contains the unlock key.
- Attaches the copy of the OS disk of the impacted VM as a data disk to the Rescue VM.
- Creates a script that will be stored in the cloud drive that will be sent using Invoke-AzVMRunCommand to the rescue VM and will unlock the disk.
- If used, the -enablenested parameter creates a script that will be stored in the cloud drive that will be sent using Invoke-AzVMRunCommand to the rescue VM and will install the Hyper-V role and reboot the VM.
- If used, the -enablenested parameter creates another script that will be stored in the cloud drive that will be sent using Invoke-AzVMRunCommand to the rescue VM and will configure/create a VM inside Hyper-V from the data disk attached, after putting the data disk and BEK Volume offline.
- Creates an "Unlock Disk" PowerShell script on the desktop for different troubleshooting scenarios.
- Deletes all the additional scripts used by the main script from the cloud drive.

<br />

### Additional checks and actions: 

| **Checks**                                                                                                    | **Actions**                                                                                                     |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| If VM exists                                                                                                  | If No -> Stop Script                                                                                            |
| What is the Key Vault Permission model                                                                        | No Action                                                                                                       |
| If user has the role 'Key Vault Administrator' for Azure role-based access control Key Vault Permission model | If no -> assign 'Key Vault Administrator' role to user                                                          |
| No check available                                                                                            | Adds an Access Policy to give permissions on the keys and secret to user                                        |
| If role assignment or access policy creation fails due to user permissions issue                              | Set permission based on entered ObjectId if user has the 'ObjectId' of their AAD user                           |
| If VM is encrypted with Dual Pass                                                                             | If No -> stop script                                                                                            |
| If VM is encrypted with BEK or KEK                                                                             | No Action                                                                                                       |
| If Resource group exists                                                                                      | If Yes -> Use existing resource group <br /> If No -> Create resource group                                     |

### Diagram
Please check the diagram with the detailed steps.
<br />*(click on the image to open the diagram in a new tab in full size)*
<br />
<br /> [![Create DualPass VM from Disk - Diagram](/.attachments/SME-Topics/Azure-Encryption/Create-RescueVM-from-DualPass-Encrypted-VMs-with-automated-process-of-unlocking-disks_Diagram.jpg =175x175)](https://supportability.visualstudio.com/3c8a2634-09bc-48d9-b703-6a6720e61bf9/_apis/git/repositories/f521398e-534c-4115-bc04-7c4e33ff28a8/items?path=/.attachments/SME-Topics/Azure-Encryption/Create-RescueVM-from-DualPass-Encrypted-VMs-with-automated-process-of-unlocking-disks_Diagram.jpg&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=main&resolveLfs=true&%24format=octetStream&api-version=5.0)

<br />

# Restore VM

- As mentioned, this script creates a rescue environment to troubleshoot the actual issue of the impacted VM.
- Once the issue is resolved, to bring the fixed VM online from the rescue environment back in Azure, another script was created. This script will recreate the original VM from the fixed disks by deleting the original VM, recreating it, and then encrypting it again with dual pass.
- The script to recreate the original VM from the fixed disks can be found in the [restore process repository](https://github.com/gabriel-petre/ADE/blob/main/Recreate_DualPass_VM_from_disk/Recreate_DualPass_VM_from_disk_1.0.ps1).
- A Wiki for the restore script can be found here: [Recreate DualPass Encrypted VM from fixed encrypted disk_Encryption](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/623835).

<br />

# Additional scripts used by the main script:

| Additional Scripts added/created in Azure Cloud Shell drive and sent to Rescue VM | Operating System | Description |
| --------------------------------------------------------------------------------- | ---------------- | ----------- |
| $HOME/Unlock-Disk                                                                 | Windows          | - Unlocks the encrypted data disks on the rescue <br /> - Sets ExecutionPolicy to unrestricted <br /> - Disables Server Manager from startup <br /> - Creates on the rescue VM script "C:\Users\Public\Desktop\Unlock disk.ps1" <br /> - Creates on the rescue VM script "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp\Unlock disk.ps1" <br /> - Creates in the Rescue VM script "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp\unlock_disk.bat" <br /> - Creates in the Rescue VM log file "c:\Unlock Disk\Unlock-Script-log.txt" <br /> **Script will be deleted once the main script finishes** |
| $HOME/Install-Hyper-V-Role                                                        | Windows          | Installs Hyper-V and DHCP Windows Features <br /> **Script will be deleted once the main script finishes** |
| $HOME/EnableNested                                                                | Windows          | - Creates in the Rescue VM log file "c:\Unlock Disk\EnableNested-log.txt" <br /> - Puts encrypted disk and BEK volume offline <br /> - Removes DVD drive <br /> - Creates a virtual switch <br /> - Creates a DHCP scope that will be used to automatically assign IP to the nested VMs <br /> - Creates NAT to allow internet access <br /> - Connects the virtual network of VM in Hyper-V to virtual switch <br /> - Creates script "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp\Start_Hyper-V_Manager.bat" to open Hyper-V Manager when logs in <br /> **Script will be deleted once the main script finishes** |
| $HOME/linux-mount-encrypted-disk.sh                                               | Linux            | - Creates in the Rescue VM log file "/var/log/vmrepair/vmrepair.log" <br /> - Installs required packages (cryptsetup, lvm2) <br /> - Mounts BEK Volume <br /> - Creates directories (mount points) {investigateboot, investigateroot} <br /> - Renames local VG (LVM) to "rescuevg" <br /> - Mounts partitions <br /> - Mounts Boot <br /> - Unlocks Root <br /> - Verifies root unlock <br /> **Script will be deleted once the main script finishes** |

<br />

# Useful scripts in Rescue VM

| Useful scripts in Rescue VM | Operating System | Description |
| --------------------------- | ---------------- | ----------- |
| C:\Unlock Disk\Unlock disk.ps1 | Windows | Unlocks encrypted disk |
| C:\Users\Public\Desktop\Unlock disk.ps1 | Windows | Checks if the BEK volume is offline and sets it online <br /> Checks if encrypted disk is offline and sets it online <br /> Unlocks encrypted data disk |
| C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp\unlock_disk.bat | Windows | Runs script 'C:\Unlock Disk\Unlock disk.ps1' when user logs in |

<br />

# Troubleshooting logs:

| Logs in the Azure Cloud Shell drive | Tool | Description |
| ----------------------------------- | ---- | ----------- |
| $HOME/CreateRescueVMScript_Execution_log.txt | PowerShell script | Main execution log |

<br />

# Logs in the Rescue VM

| Logs in the Rescue VM | Operating System | Description |
| --------------------- | ---------------- | ----------- |
| c:\Unlock Disk\Unlock-Disk-log.txt | Windows | Execution log for script $HOME/Unlock-Disk |
| c:\Unlock Disk\EnableNested-log.txt | Windows | Execution log for script $HOME/EnableNested |
| c:\Unlock Disk\Install-Hyper-V-Role-log.txt | Windows | Execution log for script $HOME/Install-Hyper-V-Role |
| /var/log/vmrepair/vmrepair.log | Linux | Execution log for script $HOME/linux-mount-encrypted-disk.sh |

<br />

# Useful troubleshooting details

- The name of the copy of the OS disk that will be created and attached to the Rescue VM follows this pattern: 'fixed_$i_OriginalOsDiskName' where '$i' is incremental if a disk with the same name already exists. Note that the disk name will be truncated if the number of characters is greater than "50".
- For Windows Rescue VMs, once a user RDPs to that VM, the Hyper-V manager will be started automatically.
- If the rescue VM is rebooted, the data disk should be automatically unlocked after 1-2 minutes.
- If for some reason the disk doesn't unlock automatically or you need to unlock manually the disks during troubleshooting, the user can unlock the encrypted data disk using the 'Unlock disk.ps1' script from the desktop.
- VM created inside Hyper-V is configured to allow outbound connectivity to the internet.
- VM created inside Hyper-V is configured to be accessible from the Rescue VM (via RDP, ping, etc.).
- For Linux VM, this is how the output of "lsblk" looks like on the rescue VMs if the broken VM doesn't have LVM and if it does:

<pre>
               With LVM:                                                                                          Without LVM:

NAME                MAJ:MIN RM  SIZE RO TYPE  MOUNTPOINT                                                       NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda                   8:0    0   64G  0 disk                                                                   sda       8:0    0   30G  0 disk 
sda1                8:1    0  500M  0 part  /boot                                                            sda1    8:1    0 29.9G  0 part /
sda2                8:2    0   63G  0 part                                                                   sda14   8:14   0    4M  0 part 
 rescuevg-tmplv  253:0    0    2G  0 lvm   /tmp                                                             sda15   8:15   0  106M  0 part /boot/efi
 rescuevg-usrlv  253:1    0   10G  0 lvm   /usr                                                             sdb       8:16   0  128G  0 disk 
 rescuevg-homelv 253:2    0    1G  0 lvm   /home                                                            sdb1    8:17   0 29.7G  0 part 
 rescuevg-varlv  253:3    0    8G  0 lvm   /var                                                             sdb2    8:18   0  256M  0 part /investigateboot
 rescuevg-rootlv 253:4    0    2G  0 lvm   /                                                                sdb14   8:30   0    4M  0 part 
sda14               8:14   0    4M  0 part                                                                   sdb15   8:31   0  106M  0 part /tmp/dev/sdb15
sda15               8:15   0  495M  0 part  /boot/efi                                                        sdc       8:32   0   16G  0 disk 
sdb                   8:16   0   16G  0 disk                                                                   sdc1    8:33   0   16G  0 part /mnt
sdb1                8:17   0   16G  0 part  /mnt                                                             sdd       8:48   0   48M  0 disk 
sdc                   8:32   0  128G  0 disk                                                                   sdd1    8:49   0   46M  0 part /mnt/azure_bek_disk
sdc1                8:33   0  500M  0 part  /tmp/dev/sdc1                                                    sr0      11:0    1 1024M  0 rom 
sdc2                8:34   0  500M  0 part  /investigateroot/boot
sdc3                8:35   0    2M  0 part  
sdc4                8:36   0   63G  0 part  
  osencrypt       253:5    0   63G  0 crypt 
  rootvg-tmplv  253:6    0    2G  0 lvm   /investigateroot/tmp
  rootvg-usrlv  253:7    0   10G  0 lvm   /investigateroot/usr
  rootvg-optlv  253:8    0    2G  0 lvm   /investigateroot/opt
  rootvg-homelv  253:9    0    1G  0 lvm   /investigateroot/home
  rootvg-varlv  253:10   0    8G  0 lvm   /investigateroot/var
  rootvg-rootlv 253:11   0    2G  0 lvm   /investigateroot
sdd                   8:48   0   48M  0 disk  
sdd1                8:49   0   46M  0 part  /mnt/azure_bek_disk
sr0                  11:0    1 1024M  0 rom                                                             
</pre>

<br />

# How to use the script

**Important:**<p style="color:red">**Please use a new page of Azure Cloud Shell before running the script, since Azure Cloud Shell has a timeout period of 20 minutes of inactivity.
<br />If Azure Cloud Shell times out while the script is running, the script will stop at the time of the timeout.
<br />If the script is stopped before it finishes, the environment might end up in an 'unknown state'.** </p >
<br />**If for some reason Azure Cloud Shell still times out, manually delete all the resources created until that point, and run the script again.**

## 1. Download/Upload script to Azure Cloud Shell $HOME directory

### **Option 1** - Download the script from the GitHub repository to the Azure Cloud Shell drive:

- Open the [**Script repository**](https://github.com/gabriel-petre/ADE/tree/main/Create_Rescue_VM_from_DualPass_Encrypted_Vm)
- Check what is the latest available version of the script
- Modify the command below to download the latest version of the script into the $HOME directory of your Azure Cloud Shell session.
```PowerShell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gabriel-petre/ADE/main/Create_Rescue_VM_from_DualPass_Encrypted_Vm/Create_Rescue_VM_from_DualPass_Encrypted_Vm_1.0.ps1" -OutFile $home/Create_Rescue_VM_from_DualPass_Encrypted_Vm_1.0.ps1 
```
- Open [**Azure Cloud Shell**](http://shell.azure.com/)
- Paste the command and press enter to download the script into the $HOME directory of your Azure Cloud Shell session.

### **Option 2** - Upload the script from your local machine to the Azure Cloud Shell drive:

- Download the latest version of the script "Create_Rescue_VM_from_DualPass_Encrypted_Vm" from the [**repository**](https://github.com/gabriel-petre/ADE/tree/main/Create_Rescue_VM_from_DualPass_Encrypted_Vm) 
- Open [**Azure Cloud Shell**](http://shell.azure.com/)
- Click on the Upload/Download/Manage file share icon, click on upload and select the script you previously downloaded from your local machine

<br />

## 2. Run the script

- Open <a href="http://shell.azure.com/" target="_blank">Azure Cloud Shell</a> 
- From the top left corner section, select 'PowerShell'
- See below examples on how to run the script:

<pre>
Create_Rescue_VM_from_DualPass_Encrypted_Vm_1.0.ps1 
  [-SubscriptionID] 
  [-VmName] 
  [-VMRgName]
  [-RescueVmName]
  [-RescueVmRg]
  [-CopyDiskName]
  [-RescueVmUserName]
  [-RescueVmPassword]
  [-associatepublicip]
  [-enablenested]         <span style="color:green">#For Windows VMs only </span>
  [-NewVnetAndSubnet]
  [-VnetName]
  [-SubnetName]
  [-VnetRG]
  [-NicNsgName]
  [-NicNsgRG]
  [-NsgRdpSshAllowRules]
  [-TagName1]
  [-TagValue1]
  [-TagName2]
  [-TagValue2]
  [-TagName3]
  [-TagValue3]
  [-TagName4]
  [-TagValue4]
  [-TagName5]
  [-TagValue5]
</pre>

**Example 1 of how to run the script (Managed and Unmanaged disks):**
```PowerShell
./Create_Rescue_VM_from_DualPass_Encrypted_Vm_1.0.ps1 -SubscriptionID "<Subscription ID>" -VmName "<Impacted VM Name>" -VMRgName "<Impacted VM resource group Name>" -RescueVmName "<Rescue VM Name>" -RescueVmRg "<Impacted VM resource group Name>" -CopyDiskName "<Name for the copy of the OS disk>" -RescueVmUserName "<User Name>" -RescueVmPassword "<Password>" -NewVnetAndSubnet
```
*Note: The command above will create a new Vnet/Subnet and place the Rescue VM inside, without a public IP, attach as a data disk a copy of the OS disk of the impacted VM and unlock that data disk.*
 
 **Example 2 of how to run the script (Managed and Unmanaged disks):**
 ```PowerShell
./Create_Rescue_VM_from_DualPass_Encrypted_Vm_1.0.ps1 -SubscriptionID "<Subscription ID>" -VmName "<Impacted VM Name>" -VMRgName "<Impacted VM resource group Name>" -RescueVmName "<Rescue VM Name>" -RescueVmRg "<Impacted VM resource group Name>" -CopyDiskName "<Name for the copy of the OS disk>" -RescueVmUserName "<User Name>" -RescueVmPassword "<Password>" -NewVnetAndSubnet -NsgRdpSshAllowRules -associatepublicip -enablenested
 ```
*Note: The command above will create a new Vnet/Subnet and place the Rescue VM inside, create/assign a public IP, create an NSG and assign it to NIC which will allow RDP or SSH, install Hyper-V role, set the data disk and BEK volume offline and configure/create a VM inside Hyper-V from the data disks attached, which is a copy of the OS disk of the impacted VM. Once the Hyper-V VM is started, the OS will be able to unlock the data disk since the BEK volume is also attached to that VM.*

 **Example 3 of how to run the script (Managed and Unmanaged disks):**
 ```PowerShell
./Create_Rescue_VM_from_DualPass_Encrypted_Vm_1.0.ps1 -SubscriptionID "<Subscription ID>" -VmName "<Impacted VM Name>" -VMRgName "<Impacted VM resource group Name>" -RescueVmName "<Rescue VM Name>" -RescueVmRg "<Impacted VM resource group Name>" -CopyDiskName "<Name for the copy of the OS disk>" -RescueVmUserName "<User Name>" -RescueVmPassword "<Password>" -NewVnetAndSubnet -associatepublicip -enablenested -TagName1 "<TagName1>" -TagValue1 "<TagValue1>" -TagName2 "<TagName2>" -TagValue2 "<TagValue2>" -TagName3 "<TagName3>" -TagValue3 "<TagValue3>" -TagName4 "<TagName4>" -TagValue4 "<TagValue4>" -TagName5 "<TagName5>" -TagValue5 "<TagValue5>"
 ```
*Note: The command above will create a new Vnet/Subnet and place the Rescue VM inside, create/assign a public IP and add 5 name/value pairs as TAGs, install Hyper-V role, set the data disk and BEK volume offline and configure/create a VM inside Hyper-V from the data disks attached, which is a copy of the OS disk of the impacted VM. Once the Hyper-V VM is started, the OS will be able to unlock the data disk since the BEK volume is also attached to that VM.*

 **Example 4 of how to run the script (Managed and Unmanaged disks):**
 ```PowerShell
./Create_Rescue_VM_from_DualPass_Encrypted_Vm_1.0.ps1 -SubscriptionID "<Subscription ID>" -VmName "<Impacted VM Name>" -VMRgName "<Impacted VM resource group Name>" -RescueVmName "<Rescue VM Name>" -RescueVmRg "<Impacted VM resource group Name>" -CopyDiskName "<Name for the copy of the OS disk>" -RescueVmUserName "<User Name>" -RescueVmPassword "<Password>" -VnetName "<Existing Vnet Name>" -SubnetName "<Existing Subnet Name>" -VnetRG "<Existing VNET Resource group>" -NicNsgName "<Existing NSG to attach to NIC>" -NicNsgRG "<Resource group of the existing NSG to attach to NIC>" -associatepublicip -enablenested
 ```
*Note: The command above will create the Rescue VM inside the existing VNET and subnet, attach the existing NSG to the Rescue VM's NIC, create/assign a public IP, install Hyper-V role, set the data disk and BEK volume offline and configure/create a VM inside Hyper-V from the data disks attached, which is a copy of the OS disk of the impacted VM. Once the Hyper-V VM is started, the OS will be able to unlock the data disk since the BEK volume is also attached to that VM.*

 **Example 5 of how to run the script (Managed and Unmanaged disks):**
 ```PowerShell
./Create_Rescue_VM_from_DualPass_Encrypted_Vm_1.0.ps1 -SubscriptionID "<Subscription ID>" -VmName "<Impacted VM Name>" -VMRgName "<Impacted VM resource group Name>" -RescueVmName "<Rescue VM Name>" -RescueVmRg "<Impacted VM resource group Name>" -CopyDiskName "<Name for the copy of the OS disk>" -RescueVmUserName "<User Name>" -RescueVmPassword "<Password>" -VnetName "<Existing Vnet Name>" -SubnetName "<Existing Subnet Name>" -VnetRG "<Existing VNET Resource group>" -associatepublicip -enablenested
 ```
*Note: The command above will create the Rescue VM inside the existing VNET and subnet, create/assign a public IP, install Hyper-V role, set the data disk and BEK volume offline and configure/create a VM inside Hyper-V from the data disks attached, which is a copy of the OS disk of the impacted VM. Once the Hyper-V VM is started, the OS will be able to unlock the data disk since the BEK volume is also attached to that VM.*

<br />
| **Mandatory parameters** | Description |
| ------------------------ | ----------- |
| -SubscriptionID          | Subscription ID where VM resides |
| -VmName                  | The name of the Virtual machine that is experiencing issues |
| -VMRgName                | The resource group name of the Virtual machine that is experiencing issues |
| -RescueVmName            | The name of the Rescue Virtual machine that will be created |
| -RescueVmRg              | The resource group name of the Rescue Virtual machine that will be created |
| -CopyDiskName            | The name for the copy of the OS disk that will be created, attached to the Rescue VM as a data disk, and unlocked |
| -RescueVmUserName        | The username used for accessing the Rescue Virtual machine that will be created |
| -RescueVmPassword        | The password for the username used for accessing the Rescue Virtual machine that will be created |
| -NewVnetAndSubnet        | This switch will create a new VNET/Subnet and place the Rescue VM inside it. Can be used in combination with the switch '-NsgRdpSshAllowRules'. If this is not specified, it will ask you to provide the details for optional parameters for an existing VNET/Subnet |

<br />

| **Optional parameters** | Description |
| ----------------------- | ----------- |
| -associatepublicip      | Add a public IP to the Rescue Virtual machine that will be created |
| -enablenested           | Install Hyper-V role, set the data disk and BEK volume offline, and configure/create a VM inside Hyper-V from the data disks attached, which is a copy of the OS disk of the impacted VM. Once the Hyper-V VM is started, the OS will be able to unlock the data disk since the BEK volume is also attached to that VM. **To be used only for Windows impacted VMs** |
| -VnetName               | Name of an existing VNET where the rescue VM will be placed |
| -SubnetName             | Name of an existing Subnet in the existing VNET where the rescue VM will be placed |
| -VnetRG                 | Name of the resource group of the existing VNET where the rescue VM will be placed |
| -NicNsgName             | Name of an existing NSG that will be attached to the NIC of the Rescue VM |
| -NicNsgRG               | Name of the resource group of an existing NSG that will be attached to the NIC of the Rescue VM |
| -NsgRdpSshAllowRules    | This switch can be used only in combination with the '-NewVnetAndSubnet' switch and will create a new NSG and add allow inbound rules for RDP or SSH with source 'Internet' and destination 'Any' |
| -TagName1               | First tag Name to be added to the Rescue VM |
| -TagValue1              | First tag Value to be added to the Rescue VM |
| -TagName2               | Second tag Name to be added to the Rescue VM |
| -TagValue2              | Second tag Value to be added to the Rescue VM |
| -TagName3               | Third tag Name to be added to the Rescue VM |
| -TagValue3              | Third tag Value to be added to the Rescue VM |
| -TagName4               | Fourth tag Name to be added to the Rescue VM |
| -TagValue4              | Fourth tag Value to be added to the Rescue VM |
| -TagName5               | Fifth tag Name to be added to the Rescue VM |
| -TagValue5              | Fifth tag Value to be added to the Rescue VM |

<br />

# Video walkthrough

## Windows

### Create a Windows Rescue VM without Hyper-V installed (-enablenested switch was not specified)
::: video
<iframe width="560" height="315" src="https://microsoft.sharepoint.com/teams/VMHub/_layouts/15/embed.aspx?UniqueId=a7b6c198-3b85-48b7-bf53-7a4d7894a16a&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" allowfullscreen style="border:none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; height: 100%; max-width: 100%;"></iframe>
:::

### Create a Windows Rescue VM with Hyper-V installed (-enablenested switch was specified)
::: video
<iframe width="560" height="315" src="https://microsoft.sharepoint.com/teams/VMHub/_layouts/15/embed.aspx?UniqueId=554eee68-f292-4f8d-828d-6a21d4970102&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" allowfullscreen style="border:none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; height: 100%; max-width: 100%;"></iframe>
:::

## Linux

### Create a Linux Rescue VM
::: video
<iframe width="560" height="315" src="https://microsoft.sharepoint.com/teams/VMHub/_layouts/15/embed.aspx?UniqueId=9622fcf3-593a-435e-865d-f9b71e7a3bc6&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" allowfullscreen style="border:none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; height: 100%; max-width: 100%;"></iframe>
:::

### Create a Linux Rescue VM with unmanaged disks (the process is the same for Windows VMs with unmanaged disks)
::: video
<iframe width="560" height="315" src="https://microsoft.sharepoint.com/teams/VMHub/_layouts/15/embed.aspx?UniqueId=d797b4e8-2d69-421d-8bbf-cb868f31873f&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" allowfullscreen style="border:none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; height: 100%; max-width: 100%;"></iframe>
:::

## LabBox

For the purpose of training or following along with this TSG, you can use the following link to deploy a dual-pass ADE encrypted VM with this scenario built-in. This lab is not to be shared with customers.

[![Click to Deploy]( /.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Encryption/adeDPtoSP.json)

<br /><br />
::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::

