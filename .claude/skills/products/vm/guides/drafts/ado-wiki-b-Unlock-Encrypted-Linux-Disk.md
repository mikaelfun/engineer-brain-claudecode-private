---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Azure Disk Encryption (ADE)/Unlock Encrypted Linux Disk_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Encryption
- cw.How-To
- cw.Reviewed-01-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

There are two scenarios where you will apply this article:

- Whenever you want to collect logs from the disk: None of our tools will work to pull logs due to the encryption, so this collection needs to be manual.
- Whenever you have a broken machine and need to perform changes on the file system of the OS drive.
- This TSG will help you unlock a VM encrypted using BEK and KEK (works for both "with AAD" and "without AAD").

**Note: This process DOES NOT decrypt the disk**

**Unlock vs. Decrypt**

Unlocking the disk IS NOT the same as decrypting. Unlocking the disk means that you gain access to it, and you can only see the files. Decrypting the disk means you removed the encryption entirely.

### References

- [Unlocking an encrypted Linux disk for offline repair](https://docs.microsoft.com/en-us/troubleshoot/azure/virtual-machines/unlock-encrypted-linux-disk-offline-repair)
- [Azure Disk Encryption for Windows and Linux IaaS VMs](https://docs.microsoft.com/en-us/azure/security/fundamentals/azure-disk-encryption-vms-vmss)

This method relies on `az vm repair` commands to automatically create a repair VM, attach the OS disk of the failed Linux VM to that repair VM, and then unlock the disk if it's encrypted. This method requires using a public IP address for the repair VM, and it unlocks the encrypted disk regardless of whether the ADE key is unwrapped or wrapped by using a key encryption key (KEK).

To repair the VM using this automated method, follow the steps in [Repair a Linux VM by using the Azure Virtual Machine repair commands](https://docs.microsoft.com/en-us/troubleshoot/azure/virtual-machines/repair-linux-vm-using-azure-virtual-machine-repair-commands).

If your infrastructure and company policy don't allow you to assign a public IP address, or if the `az vm repair` command doesn't unlock the disk, go to the next method.

## Automatic Troubleshoot

**Note: This solution only applies to single pass encrypted VMs. If this is a Dual Pass VM, please proceed with [Dual Pass Troubleshoot](https://supportability.visualstudio.com/AzureLinuxNinjas/_wiki/wikis/AzureLinuxNinjas/313620/Troubleshooting-Encrypted-VM?anchor=troubleshooting-ade-dual-pass).**

This method relies on [az vm repair](https://docs.microsoft.com/en-us/cli/azure/vm/repair?view=azure-cli-latest&preserve-view=true) commands to automatically create a repair VM, attach the OS disk of the failed Linux VM to that repair VM, and then unlock the disk if it's encrypted. This method requires using a public IP address for the repair VM, and it unlocks the encrypted disk regardless of whether the ADE key is unwrapped or wrapped by using a key encryption key (KEK).

To repair the VM using this automated method, follow the steps in [Repair a Linux VM by using the Azure Virtual Machine repair commands](https://docs.microsoft.com/en-us/troubleshoot/azure/virtual-machines/repair-linux-vm-using-azure-virtual-machine-repair-commands).

## Semi-Automatic Troubleshoot

Unlock the encrypted disk by the key file in the BEK volume.

To unlock and mount the encrypted disk manually, follow these steps:
1. [Create a new repair VM, and attach the encrypted disk to this VM during VM creation.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/543386/Unlock-Encrypted-Linux-Disk_Encryption?anchor=create-a-repair-vm)

    **Note:** You must attach the encrypted disk when you create the repair VM. This is because the system detects that the attached disk is encrypted. Therefore, it fetches the ADE key from your Azure key vault, and then creates a new volume named "BEK VOLUME" to store the key file.

2. [Log in to the repair VM, then unmount any mounted partitions on the encrypted disk.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/543386/Unlock-Encrypted-Linux-Disk_Encryption?anchor=unmount-any-mounted-partitions-on-the-encrypted-disk)

3. [Identify the ADE key file in the BEK volume.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/543386/Unlock-Encrypted-Linux-Disk_Encryption?anchor=identify-the-ade-key-file)

4. [Identify the header file in the boot partition of the encrypted OS disk.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/543386/Unlock-Encrypted-Linux-Disk_Encryption?anchor=identify-the-header-file)

5. [Unlock the encrypted disk using the ADE key file and the header file.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/543386/Unlock-Encrypted-Linux-Disk_Encryption?anchor=use-the-ade-key-file-and-the-header-file-to-unlock-the-disk)

6. Mount the partition: [LVM](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/543386/Unlock-Encrypted-Linux-Disk_Encryption?anchor=mount-the-unlocked-partition-and-enter-the-chroot-environment-(lvm-only)), [RAW or non-LVM.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/543386/Unlock-Encrypted-Linux-Disk_Encryption?anchor=mount-the-unlocked-disk%2C-and-enter-the-chroot-environment-(raw/non-lvm))

### Create a repair VM

1. Take a snapshot of the encrypted OS disk.

2. [Create a disk from the snapshot.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/810005/Lv.-200-Specialist-Create-Snapshot-and-Swap-OS_Disk-Mgmt?anchor=getting-started) For the new disk, choose the same location and availability zone as that of the problem VM that you want to repair.

3. Create a VM based on the following guidelines:
    - In the Azure Marketplace, choose the same image for the repair VM that was used for the failed VM. (The OS version should be the same.)
    - Choose a size that allocates at least 8 GB of memory to the VM.
    - Assign this new VM to the same resource group, region, and availability settings that you used for the new disk that you created in step 2.

4. On the Disks page of the Create a Virtual Machine wizard, attach the new disk (that you just created from the snapshot) as a data disk.

    **Important:**
    ```
    Because the encryption settings are detected only during the VM creation, make sure that you attach the disk when you create the VM. 
    This enables a volume that contains the ADE key file to be added to the VM automatically.
    ```

### Unmount any mounted partitions on the encrypted disk

1. After the repair VM is created, SSH to your repair VM, log in using the appropriate credentials, and then elevate the account to root:
    ```bash
    sudo -s
    ```
2. List the attached devices using the `lsblk` command. In the output, you should see multiple attached disks. These disks include the active OS disk and the encrypted disk. They can appear in any order.
    ```bash
    lsblk
    ```
3. Identify the encrypted disk using the following information:
    - The disk will have multiple partitions.
    - The disk will not list the root directory ("/") as a mountpoint for any of its partitions.
    - The disk will match the size that you noted when you created it from the snapshot.

    In the following example, the output indicates that "sdd" is the encrypted disk. This is the only disk that has multiple partitions and does not list "/" as a mountpoint.
    ```bash
    NAME                MAJ:MIN RM  SIZE RO TYPE  MOUNTPOINT
    sdb                   8:16   0   64G  0 disk
    sdb1                8:17   0  500M  0 part
    sdb2                8:18   0  500M  0 part
    sdb3                8:19   0    2M  0 part
    sdb4                8:20   0   63G  0 part
      rootvg-tmplv    253:1    0    2G  0 lvm   /tmp
      rootvg-usrlv    253:2    0   10G  0 lvm   /usr
      rootvg-optlv    253:3    0    2G  0 lvm   /opt
      rootvg-homelv   253:4    0    1G  0 lvm   /home
      rootvg-varlv    253:5    0    8G  0 lvm   /var
      rootvg-rootlv   253:6    0    2G  0 lvm   /
    sdb                   8:32   0   48M  0 disk
    sdb1                8:33   0   46M  0 part  /mnt
    sdc                   8:32   0   48M  0 disk
    sdc1                8:33   0   46M  0 part 
    sdd                   8:48   0   30G  0 disk
    sdd1                8:17   0  500M  0 part  /boot/efi 
    sdd2                8:18   0  500M  0 part  /boot 
    sdd3                8:19   0    2M  0 part
    sdd4                8:20   0   63G  0 part
    sr0                  11:0    1 1024M  0 rom
    ```
4. Unmount any partitions on the encrypted data disk that have been mounted in the file system. For example, in the previous example, you would have to unmount both "/boot/efi" and "/boot".
    ```bash
    umount /boot/efi
    umount /boot
    ```

### Identify the ADE key file

You must have both the key file and the header file to unlock the encrypted disk. The key file is stored in the BEK volume, and the header file is in the boot partition of the encrypted OS disk.

1. Determine which partition is the BEK volume:
    ```bash
    lsblk -fs | grep -i bek 
    ```
    The following example output indicates that sdc1 is the BEK volume:
    ```bash
    sdc1  vfat   BEK VOLUME      04A2-FE67 
    ```
    If no BEK volume exists, re-create the repair VM by having the encrypted disk attached. If the BEK volume still does not attach automatically, try [Method 3]() to retrieve the BEK volume.

2. Create a directory named "azure_bek_disk" under the "/mnt" folder:
    ```bash
    mkdir /mnt/azure_bek_disk
    ```

3. Mount the BEK volume in the "/mnt/azure_bek_disk" directory. For example, if sdc1 is the BEK volume, enter the following command:
    ```bash
    mount /dev/sdc1 /mnt/azure_bek_disk
    ```

4. List the available devices again:
    ```bash
    lsblk -o NAME,SIZE,LABEL,PARTLABEL,MOUNTPOINT  
    ```
    **Note:** You'll see that the partition you determined to be the BEK volume is now mounted in "/mnt/azure_bek_disk."

5. View the contents in the "/mnt/azure_bek_disk/" directory:
    ```bash
    ls -l /mnt/azure_bek_disk
    ```
    You should see the following files in the output (the ADE key file is "LinuxPassPhraseFileName"):
    ```bash
    -rwxr-xr-x 1 root root 148 Aug  4 01:04 CRITICAL_DATA_WARNING_README.txt 
    -r-xr-xr-x 1 root root 172 Aug  4 01:04 LinuxPassPhraseFileName
    ```

### Identify the header file

The boot partition of the encrypted disk contains the header file. You'll use this file, together with the "LinuxPassPhraseFileName" key file, to unlock the encrypted disk.

1. Use the following command to show selected attributes of the available disks and partitions:

    ```bash
    lsblk -o NAME,SIZE,LABEL,PARTLABEL,MOUNTPOINT
    ```

2. On the encrypted disk, identify the OS partition (root partition). This is the largest partition on the encrypted disk. In the previous example output, the OS partition is "sdd4." This partition must be specified when you run the unlock command.

3. In the root directory ("/") of the file structure, create a directory to which to mount the root partition of the encrypted disk. You'll use this directory later, after the disk is unlocked. To distinguish it from the active OS partition of the repair VM, give it the name "investigateroot".

    ```bash
    mkdir /{investigateboot,investigateroot}
    ```

4. On the encrypted disk, identify the boot partition, which contains the header file. On the encrypted disk, the boot partition is the second largest partition that shows no value in the LABEL or PARTLABEL column. In the previous example output, the boot partition of the encrypted disk is "sdd2."

5. Mount the boot partition that you identified in step 4 into the /investigateboot/ directory. In the following example, the boot partition of the encrypted disk is sdd2. However, the location on your system might differ.

    ```bash
    mount /dev/sdd2 /investigateboot/
    ```
    If mounting the partition fails and returns a "wrong fs type, bad option, bad superblock" error message, try again by using the mount -o nouuid command, as in the following example:

    ```bash
    mount -o nouuid /dev/sdd2 /investigateboot/
    ```

6. List the files that are in the /investigateboot/ directory. The "luks" subdirectory contains the header file that you must have to unlock the disk.

    ```bash
    ls -l /investigateboot
    ```

7. List the files that are in the /investigateboot/luks/ directory. The header file is named "osluksheader."

    ```bash
    ls -l /investigateboot/luks
    ```

### Use the ADE key file and the header file to unlock the disk

1. Use the cryptsetup luksOpen command to unlock the root partition on the encrypted disk. For example, if the path to the root partition that contains the encrypted OS is /dev/sdd4, and you want to assign the name "osencrypt" to the unlocked partition, run the following command:

    ```bash
    cryptsetup luksOpen --key-file /mnt/azure_bek_disk/LinuxPassPhraseFileName --header /investigateboot/luks/osluksheader /dev/sdd4 osencrypt
    ```

2. Now that you have unlocked the disk, unmount the encrypted disk's boot partition from the /investigateboot/ directory:

    ```bash
    umount /investigateboot/
    ```

    **Note:** You'll have to mount this partition to another directory later.

    The next step is to mount the partition that you have just unlocked. The method that you use to mount the partition depends on the device mapper framework (LVM or non-LVM) that's used by the disk.

3. List the device information together with the file system type:

    ```bash
    lsblk -o NAME,FSTYPE
    ```

    You'll see the unlocked partition and the name that you assigned to it (in our example, that name is "osencrypt"):
      - For the LVM partition such as "LVM_member", see [Mount the LVM partition](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/543386/Unlock-Encrypted-Linux-Disk_Encryption?anchor=mount-the-unlocked-partition-and-enter-the-chroot-environment-(lvm-only))
      - For the non-LVM partition, see [Mount Raw or non-LVM partition.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/543386/Unlock-Encrypted-Linux-Disk_Encryption?anchor=mount-the-unlocked-disk%2C-and-enter-the-chroot-environment-(raw/non-lvm))

### Mount the unlocked partition and enter the chroot environment (LVM only)

If the disks use the LVM device mapper framework, you have to take extra steps to mount the disk and enter the chroot environment. To use the chroot tool together with the encrypted disk, the unlocked partition ("osencrypt") and its logical volumes must be recognized as the volume group that's named rootvg. However, by default, the repair VMs OS partition and its logical volumes are already assigned to a volume group that has the name rootvg. We must resolve this conflict before we can continue.

1. Use the pvs command to display the properties of the LVM physical volumes. You might see warning messages, as in the following example, that indicate that the unlocked partition ("/dev/mapper/osencrypt") and another device are using duplicate universally unique identifiers (UUIDs). Alternatively, you might see two partitions assigned to rootvg.

    **Note:**
    ```
    You want only the unlocked partition ("osencrypt") to be assigned to the rootvg volume group so that you can access its logical volumes through the chroot utility. 
    To fix this problem, you'll temporarily import the partition into a different volume group, and activate that volume group. Next, you'll rename the current rootvg volume group. 
    Only after you enter the chroot environment will you rename the encrypted disks volume group as "rootvg."
    ```

### Assigning the unlocked partition

1. Import the newly unlocked partition into a new volume group. In this example, we are temporarily naming the new volume group "rescuemevg". Import the newly unlocked partition into a new volume group. In this example, we are temporarily naming the new volume group "rescuemevg".

2. Activate the new volume group:

    ```bash
    vgimportclone -n rescuemevg /dev/mapper/osencrypt
    vgchange -a y rescuemevg
    ```

3. Rename the old rootvg volume group. In this example, we will use the name "oldvg."

    ```bash
    vgrename rootvg oldvg
    ```

4. Run lsblk -o NAME,SIZE,LABEL,PARTLABEL,MOUNTPOINT to review the available devices. You should now see both volume groups listed by the names that you assigned to them.

    ```bash
    lsblk -o NAME,SIZE,LABEL,PARTLABEL,MOUNTPOINT
    ```

5. Mount the rescuemevg/rootlv logical volume to the /investigateroot/ directory without using the duplicate UUIDs:

    ```bash
    mount -o nouuid /dev/rescuemevg/rootlv /investigateroot/
    ```
    Now, the root partition of the failed VM is unlocked and mounted, and you should be able to access the root partition to troubleshoot the issues. For more information, see Repair the VM offline.
    However, if you want to use the chroot utility for troubleshooting, continue by using the following steps.

6. Mount the encrypted disks boot partition to the directory /investigateroot/boot/ without using the duplicate UUIDs. (Remember that the encrypted disks boot partition is the second largest that's assigned no partition label.) In our current example, the encrypted disks boot partition is sdd2.

    ```bash
    mount -o nouuid /dev/sdd2 /investigateroot/boot
    ```

7. Mount the encrypted disks EFI system partition to the /investigateroot/boot/efi directory. You can identify this partition by its label. In our current example, the EFI system partition is sdd1.

    ```bash
    mount /dev/sdd1 /investigateroot/boot/efi
    ```

8. Mount the remaining unmounted logical volumes in the encrypted disks volume group to subdirectories of "/investigateroot/":

    ```bash
    mount -o nouuid /dev/mapper/rescuemevg-varlv /investigateroot/var
    mount -o nouuid /dev/mapper/rescuemevg-homelv /investigateroot/home
    mount -o nouuid /dev/mapper/rescuemevg-usrlv /investigateroot/usr
    mount -o nouuid /dev/mapper/rescuemevg-tmplv /investigateroot/tmp
    mount -o nouuid /dev/mapper/rescuemevg-optlv /investigateroot/opt
    ```

9. Change the active directory to the mounted root partition on the encrypted disk:

    ```bash
    cd /investigateroot
    ```

10. Enter the following commands to prepare the chroot environment:

    ```bash
    mount -t proc proc proc
    mount -t sysfs sys sys/
    mount -o bind /dev dev/
    mount -o bind /dev/pts dev/pts/
    mount -o bind /run run/
    ```

11. Enter the chroot environment:

    ```bash
    chroot /investigateroot/
    ```

12. Rename the rescuemevg volume group to "rootvg" to avoid conflicts or possible issues with grub and initramfs. Keep the same naming convention when you regenerate initramfs. Because of the vg name changes, work on the rescue VM. It will no longer be useful if you restart it. The rescue VM should be considered to be a temporary VM.

    ```bash
    vgrename rescuemevg rootvg
    ```

13. Troubleshoot issues in the chroot environment. For example, you can read logs or run a script. For more information, see [Perform fixes in the chroot environment.](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/chroot-environment-linux)

14. [Exit chroot and swap the OS disk.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/810005/Lv.-200-Specialist-Create-Snapshot-and-Swap-OS_Disk-Mgmt?anchor=getting-started)

### Mount the unlocked disk and enter the chroot environment (RAW/non-LVM)

1. In the root directory ("/") of the file structure, create a directory to mount the root partition of the encrypted disk. You'll use this directory later, after the disk is unlocked. To distinguish it from the active OS partition of the repair VM, name it "investigateroot".

    ```bash
    mkdir /{investigateboot,investigateroot}
    ```

2. Mount the newly unlocked partition ("osencrypt") to the /investigateroot/ directory:

    ```bash
    mount /dev/mapper/osencrypt /investigateroot/
    ```
    If mounting the partition fails and returns a "wrong fs type, bad option, bad superblock" error message, try again by using the mount -o nouuid command:

    ```bash
    mount -o nouuid /dev/mapper/osencrypt /investigateroot/
    ```

3. Display the contents of the /investigateroot/ directory to verify that the mounted partition is now unlocked:

    ```bash
    ls /investigateroot/
    ```

4. Now that the root partition of the failed VM is unlocked and mounted, you can access the root partition to troubleshoot the issues. For more information, see Repair the VM offline. However, if you want to use the chroot utility for troubleshooting, go to the next step.

5. Use the command lsblk -o NAME,SIZE,LABEL,PARTLABEL,MOUNTPOINT to review the available devices. Identify the boot partition on the encrypted disk as the second largest partition that's assigned no label.

    ```bash
    lsblk -o NAME,SIZE,LABEL,PARTLABEL,MOUNTPOINT
    ```

6. Mount the boot partition on the encrypted disk to the "/investigateroot/boot/" directory, as in the following example:

    ```bash
    mount /dev/sdd2 /investigateroot/boot/
    ```

7. Change the active directory to the mounted root partition on the encrypted disk:

    ```bash
    cd /investigateroot
    ```

8. Enter the following commands to prepare the chroot environment:

    ```bash
    mount -t proc proc proc
    mount -t sysfs sys sys/
    mount -o bind /dev dev/
    mount -o bind /dev/pts dev/pts/
    mount -o bind /run run/
    ```

9. Enter the chroot environment:

    ```bash
    chroot /investigateroot/
    ```

10. Troubleshoot issues in the chroot environment. You can read logs or run a script. For more information, see [Perform fixes in the chroot environment.](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/chroot-environment-linux)

11. [Exit chroot and swap the OS disk.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/810005/Lv.-200-Specialist-Create-Snapshot-and-Swap-OS_Disk-Mgmt?anchor=getting-started)

## Manual Troubleshoot

### Re-encrypt the disk to retrieve the key file and unlock the encrypted disk

1. Create the repair VM and attach a copy of the locked disk to a repair VM:

    - For a managed disk, see [Troubleshoot a Linux VM by attaching the managed OS disk to a repair VM.](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-recovery-disks-portal-linux)
    - For an unmanaged disk, use the Storage Explorer to create a copy of the affected VM's OS disk. For more information, see [Attach an unmanaged disk to a VM for offline repair.](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/unmanaged-disk-offline-repair)

2. After you attach the encrypted disk as the data disk to the repair VM, use the Key Vault and Key Encrypted Key (KEK) used for the original VM to re-encrypt this data disk. This process will automatically generate and mount a BEK volume using a BEK key file in the repair VM. You must not use the EncryptFormatAll option because the ADE extension could encrypt the boot sector on the data disk.

    - If the original VM is encrypted by wrapped BEK, run the following command:

      ```bash
      az vm encryption enable -g "resource group" --name "VMName" --disk-encryption-keyvault "keyvault" --key-encryption-key "kek" --volume-type "data"
      ```

    - If the original VM is encrypted by BEK, run the following command:

      ```bash
      az vm encryption enable -g "resource group" --name "VMName" --disk-encryption-keyvault "keyvault" --volume-type "data"
      ```

    - To determine the values for disk-encryption-keyvault and key-encryption-key, run the following command:

      ```bash
      az vm encryption show --name "OriginalVmName" --resource-group "ResourceGroupName"
      ```

3. Run the following command to check whether a new disk is attached:

    ```bash
    lsblk -f
    ```
    If a new disk is attached, go to [Identify the ADE key file in the BEK volume](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/543386/Unlock-Encrypted-Linux-Disk_Encryption?anchor=identify-the-ade-key-file), and then continue following the provided steps to unlock the disk.

## LabBox

https://aka.ms/LabBox

- For the purpose of training or following along with this TSG, you can use the following link to deploy a VM with this scenario built-in. This lab is not to be shared with customers.

[![Click to Deploy]( /.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Encryption/adeAdvancedday01.json)

::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::
