---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FAzure%20Disk%20Encryption%20%28ADE%29%2FHow%20to%20Migrate%20from%20ADE%20to%20Encryption%20at%20Host_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Encryption
- cw.How-To
- cw.Reviewed-01-2026
---


[[_TOC_]]

##Summary
This How-to contains instructions on how to migrate from ADE to Encryption at Host.

##Background
Microsoft has anounced the retirement of ADE feature by September 15th, 2028.
Customers are instructed to move away from ADE and suggested to encrypt with Encryption at Host.
This document is a guide of how to perform the change.

## Workflow

:::mermaid
graph TD
    start[Confirm VM is using Azure Disk Encryption]-->A
    A[Check with customer if the VM is Domain joined?]-->w[Is it domain joined?]
    w-- No --> B[Is it Linux for Windows VM?]
    B--Windows -->F[Proceed with Windows steps to disable encryption]
    F-->G
    B--Linux -->z[Is it encrypted OS only, or OS + Data Disks or Only Data disks?]
    z--Data disks only-->I[Proceed with Linux data disks only steps]-->G
    z--OS only or OS + Data Disks-->J[Customer will have to recreate the VM]
    w -- Yes --> C[Go for Premigration domain steps] --> B
    G[Create a new managed disk from decrypted disk] --> H
    H[Create a VM with Encryption at Host] --> Z
    Z[Verify and cleanup]
    

click GAEnd "https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495025";
click K "https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495023";

classDef clickable fill:#ffffff,color:#0f2080;
:::

## Considerations

Before starting the migration process, be aware of these important limitations and considerations that affect your migration strategy:

- No in-place migration: You cannot directly convert ADE-encrypted disks to encryption at host. Migration requires creating new disks and VMs.

- Linux OS disk limitation: Disabling ADE on Linux OS disks is not supported. For Linux VMs with ADE-encrypted OS disks, you must create a new VM with a new OS disk.

- Windows ADE encryption patterns: On Windows VMs, Azure Disk Encryption can only encrypt the OS disk alone OR all disks (OS + data disks). It's not possible to encrypt only data disks on Windows VMs.

- UDE flag persistence: Disks encrypted with Azure Disk Encryption have a Unified Data Encryption (UDE) flag that persists even after decryption. Both snapshots and disk copies using the Copy option retain this UDE flag. The migration requires creating new managed disks using the Upload method and copying the VHD blob data, which creates a new disk object without any metadata from the source disk.

- Downtime required: The migration process requires VM downtime for disk operations and VM recreation.

- Domain-joined VMs: If your VMs are part of an Active Directory domain, more steps are required:
    - The original VM must be removed from the domain before deletion
    - After creating the new VM, it must be rejoined to the domain
    - For Linux VMs, domain joining can be accomplished using Azure AD extensions

## Prerequisites

Before starting the migration:

- Backup your data: Create backups of all critical data before beginning the migration process.
- Test the process: If possible, test the migration process on a nonproduction VM first.
- Prepare encryption resources: Ensure your VM size supports encryption at host. Most current VM sizes support this feature. For more information about VM size requirements, see Enable end-to-end encryption using encryption at host.
- Document configuration: Record your current VM configuration, including network settings, extensions, and attached resources.


##Steps

Supported migration consists in the following steps:
1. Check if VM is Domain Joined (depending on the scenario you can move to Step 2)
2. Remove ADE (only applicable when Windows VM with ADE or Linux with only data disks encrypted. If OS is encrypted, either OS only or OS + Data disks, customer will have to recreate their environment)
3. Creating a copy of the managed Disks
4. Creating a VM from the recently created disks with Encryption at Host
5. Verifying configuration is fine
6. Verify encryption and cleanup

### 1. Check if VM is Domain Joined
If your VMs are members of an Active Directory domain, additional steps are required during the migration process.
If your VM is NOT domain joined, please proceed with Removing ADE section.

####Premigration domain steps
1. Document domain membership: Record the current domain, organizational unit (OU), and any special group memberships
2. Note computer account: The computer account in Active Directory needs to be managed
3. Backup domain-specific configurations: Save any domain-specific settings, group policies, or certificates

####Domain removal process
1. Remove from domain: Before deleting the original VM, remove it from the domain using one of these methods:

- Use Remove-Computer PowerShell cmdlet on Windows
- Use the System Properties dialog to change to workgroup
- Manually delete the computer account from Active Directory Users and Computers

2. Clean up Active Directory: Remove any orphaned computer accounts or DNS entries

#### Post-migration domain rejoining
1. Join new VM to domain: After creating the new VM with encryption at host:

- For Windows: Use Add-Computer PowerShell cmdlet or System Properties
- For Linux: Use Azure AD domain join extension or manual configuration

2. Restore domain settings: Reapply any domain-specific configurations, group policies, or certificates

3. Verify domain functionality: Test domain authentication, group policy application, and network resource access

#### Linux Domain joining

For Linux VMs, you can use the Azure AD Domain Services VM extension:
 ```
    az vm extension set --resource-group "MyResourceGroup" --vm-name "MyLinuxVM-New" --name "AADSSHLoginForLinux" --publisher "Microsoft.Azure.ActiveDirectory"
 ```


### 2. Removing ADE 
Depending on the OS type, the migration will be possible or not. Please see instructions according to the OS type below.

####Linux

<details open>
<summary>Click here to expand or collapse this section</summary>

1. Make sure that ONLY data disks are encrypted. You can run the following command

   ``` 
    az vm encryption show --name "MySecureVM" --resource-group "MyVirtualMachineResourceGroup"
   ``` 

Note: If OS disk is encrypted (either OS only or OS + Data disks encrypted), please ask customer that they will have to recreate their machine and migration is not possible.

2. If only data disks are encrypted, please proceed with disabling ADE with the following command:
    ``` 
    az vm encryption disable --name "MySecureVM" --resource-group "MyVirtualMachineResourceGroup" --volume-type "data"
    ``` 
3. Once disabled, proceed with removing the extension with the following command:
    ``` 
    az vm extension delete -g "MyVirtualMachineResourceGroup" --vm-name "MySecureVM" -n "AzureDiskEncryptionForLinux"
    ``` 
4. run
    ```
    sudo cryptsetup status /dev/mapper/<device-name>
    ```
to verify that encrypted devices are no longer active.

5. Confirm with 
    ```
    lsblk
    ```
that they are no encrypted mappings remaining.

Wait for complete decryption before continuing with disk migration to ensure data integrity.

</details>

####Windows

<details Click here to expand Windows steps>

<summary>Click here to expand or collapse this section</summary>

1. Confirm VM is encrypted with ADE. You can run the following command

    ``` 
    az vm encryption show --name "MySecureVM" --resource-group "MyVirtualMachineResourceGroup"
    
    ``` 

2. Proceed with disabling ADE with the following command:

    ``` 
    Disable-AzVMDiskEncryption -ResourceGroupName "MyVirtualMachineResourceGroup" -VMName "MySecureVM" -VolumeType "All"
    ``` 

You can RDP into the VM or use Serial Console to monitor the decryption progress, before proceeding with next step, make sure that Decryption reaches 0%

``` 
    manage-bde -status

``` 

![decryption output](/.attachments/SME-Topics/Azure-Encryption/mbs1.png)
    

3. Once disabled, proceed with removing the extension with the following command:
    ``` 
    Remove-AzVMDiskEncryptionExtension -ResourceGroupName "MyVirtualMachineResourceGroup" -VMName "MySecureVM"
    ``` 


</details>


### 3. Creating a new managed disk from the decrypted disks

Once the data  disks are decrypted, you will need to create Managed disks that do not carry the Encryption Metadata from ADE. 
If you're creating a copy of the OS disk, make sure to stop/deallocate your VM before proceeding.
If Data disks, make sure to dettach before running the script.

```
    #This is the CLI Version of the script
    # Set variables
    sourceDiskName="MySourceDisk"
    sourceRG="MyResourceGroup"
    targetDiskName="MyTargetDisk"
    targetRG="MyResourceGroup"
    targetLocation="eastus"
    # For OS disks, specify either "Windows" or "Linux"
    # For data disks, omit the targetOS variable and --os-type parameter
    targetOS="Windows"

    # Get source disk size in bytes
    sourceDiskSizeBytes=$(az disk show -g $sourceRG -n $sourceDiskName --query '[diskSizeBytes]' -o tsv)

    # Create a new empty target disk with upload capability
    az disk create -g $targetRG -n $targetDiskName -l $targetLocation --os-type $targetOS --for-upload --upload-size-bytes $(($sourceDiskSizeBytes+512)) --sku standard_lrs

    # Generate SAS URIs for both disks
    targetSASURI=$(az disk grant-access -n $targetDiskName -g $targetRG --access-level Write --duration-in-seconds 86400 --query [accessSas] -o tsv)

    sourceSASURI=$(az disk grant-access -n $sourceDiskName -g $sourceRG --access-level Read --duration-in-seconds 86400 --query [accessSas] -o tsv)

    # Copy the disk data using AzCopy
    azcopy copy $sourceSASURI $targetSASURI --blob-type PageBlob

    # Revoke SAS access when complete
    az disk revoke-access -n $sourceDiskName -g $sourceRG

    az disk revoke-access -n $targetDiskName -g $targetRG


    ###############################################################################################

    # This is the Powershell version of the script

    # Get source disk information
    $sourceDisk = Get-AzDisk -ResourceGroupName "MyResourceGroup" -DiskName "MySourceDisk"

    # Create a new empty target disk
    # For Windows OS disks
    $diskConfig = New-AzDiskConfig -Location $sourceDisk.Location -CreateOption Upload -UploadSizeInBytes $($sourceDisk.DiskSizeBytes+512) -OsType Windows -HyperVGeneration "V2"

    # For Linux OS disks (if not ADE-encrypted)
    # $diskConfig = New-AzDiskConfig -Location $sourceDisk.Location -CreateOption Upload #   -UploadSizeInBytes $($sourceDisk.DiskSizeBytes+512) -OsType Linux #   -HyperVGeneration "V2"

    # For data disks (no OS type needed)
    # $diskConfig = New-AzDiskConfig -Location $sourceDisk.Location -CreateOption Upload #   -UploadSizeInBytes $($sourceDisk.DiskSizeBytes+512)

    $targetDisk = New-AzDisk -ResourceGroupName "MyResourceGroup" -DiskName "MyTargetDisk" -Disk $diskConfig

    # Generate SAS URIs and copy the data
    # Get SAS URIs for both disks
    $sourceSAS = Grant-AzDiskAccess -ResourceGroupName "MyResourceGroup" -DiskName $sourceDisk.Name -Access Read -DurationInSecond 7200
    $targetSAS = Grant-AzDiskAccess -ResourceGroupName "MyResourceGroup" -DiskName $targetDisk.Name -Access Write -DurationInSecond 7200

    # Copy the disk data using AzCopy
    azcopy copy $sourceSAS.AccessSAS $targetSAS.AccessSAS --blob-type PageBlob

    # Revoke SAS access when complete
    Revoke-AzDiskAccess -ResourceGroupName "MyResourceGroup" -DiskName $sourceDisk.Name
    Revoke-AzDiskAccess -ResourceGroupName "MyResourceGroup" -DiskName $targetDisk.Name

```

![copyofmanagedidk](/.attachments/SME-Topics/Azure-Encryption/azcopy.png)

### 4. Creating a VM with Encryption at Host using the newly created disks

The next steps include Creating a VM.
You can choose from several encryption options, depending on your security requirements. This article provides steps for creating a new VM with encryption at host, which is the most common migration path. 

   ```
    # For Windows OS disks
    az vm create 
    --resource-group "MyResourceGroup" 
    --name "MyVM-New" 
    --os-type "Windows" 
    --attach-os-disk "MyTargetDisk" 
    --encryption-at-host true

    #For Linux OS disks
    az vm create 
    --resource-group "MyResourceGroup" 
    --name "MyVM-New" 
    --os-type "Linux" 
    --attach-os-disk "MyTargetDisk" 
    --encryption-at-host true

   ```

For adding data disks you can use the following commands:

   ```
    # Attach the newly created data disk
    az vm disk attach 
    --resource-group "MyResourceGroup" 
    --vm-name "MyVM-New" 
    --name "MyTargetDisk"
   ```

### 5. Verifying everything is fine

#####Linux
Verify and configure the disks properly for your operating system, this should be done by customer.
- Update /etc/fstab with the new disk UUIDs
- Mount the data disks to the correct mount points

  ```
    # Get UUIDs of all disks
    sudo blkid

    # Mount all disks defined in fstab
    sudo mount -a

  ```


#####Windows
Verify and configure the disks properly for your operating system, this should be done by customer.
- Verify disk letters are assigned correctly
- Check that applications can access the disks correctly
- Update any applications or scripts that reference specific disk IDs

```
    # List all disks and their partitions
    Get-Disk | Get-Partition | Format-Table -AutoSize

    # Check drive letters
    Get-PSDrive -PSProvider FileSystem

```

### 6. Verification and cleanup
Once customers are comfortable with the migration and their new VM is ready, 
Verify that encryption at host is properly configured on both Windows and Linux VMs.
Once VM is tested, working as expected and data is accessible and intact, proceed with deletion

   ```
    # Check encryption at host status
    az vm show --resource-group "MyResourceGroup" --name "MyVM-New" --query "securityProfile.encryptionAtHost"

   ```

   ```
    # Delete the original VM
    az vm delete --resource-group "MyResourceGroup" --name "MyVM-Original" --yes

    # Delete the original disk
    az disk delete --resource-group "MyResourceGroup" --name "MySourceDisk" --yes

   ```

## References
- [Migrate from Azure Disk Encryption to encryption at host](https://learn.microsoft.com/en-us/azure/virtual-machines/disk-encryption-migrate?tabs=azurepowershell%2CCLI2%2Cazurepowershell3%2CCLI4%2CCLI5%2CCLI-cleanup#create-a-new-vm-with-encryption)

## **Escalate to ADE Teams Channel**

::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::
