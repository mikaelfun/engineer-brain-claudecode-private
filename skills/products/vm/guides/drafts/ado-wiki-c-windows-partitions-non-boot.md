---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Windows Partitions in Non-Boot Scenarios_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FWindows%20Partitions%20in%20Non-Boot%20Scenarios_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.How-To

- cw.RDP-SSH

---



:::template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md

:::



[[_TOC_]]



# Overview

This article will provide background information on System Reserved partitions, Boot loader partitions, etc for Windows machines. This should help provide context in the mitigation of non-boot scenarios and for questions you or your cx may have.



## Details



 * Open the below panes for more information on that subject.

 * Internal Documentation refers to informational pages and examples of related problems that **cannot** be shared with the cx. Examples include ICMs, internal TSGs, private emails, etc.

 * External Documentation refers to informational pages and examples of related problems that **can** be shared with the cx. Examples include publicly accessible Microsoft guides, Microsoft blog posts, and other pages where the domain in the URL is www.microsoft.com or owned by Microsoft (e.g. certain GitHub pages are maintained by Microsoft like https://github.com/Azure and https://github.com/Microsoft).

 * Third Party Documentation refers to well-written informational pages and examples of related problems from outside of the Microsoft domain. They are included here mostly to aid in understanding, not to be shared or referenced to cxs. Please only share if absolutely pertinent for the cx's sake as we discourage sharing external documentation. If shared, include a disclaimer that we are not responsible for the site, just sharing for informational purposes. The site is written by a third party that is **not** Microsoft and thus the contents of the page may change after being shared.



## System Reserved Partition



If the disk has any System Reserved partitions, this partition will hold the Boot Configuration Database (BCD) store, Windows Boot Loader, Windows Boot Manager, and other OS boot files. On servers that include it, the firmware is important in helping the OS boot successfully. They will usually not have a drive letter to dissuade mistakes from happening with the firmware (e.g. accidental deletions). If this partition is manipulated by external factors (e.g. third party software, antivirus, etc), it could be accidentally corrupted and require repair. 



So if you need to access this partition, you may have to add the drive letter to the attached disk's partition using Disk Management on the Rescue VM. 



![Disk Management](/.attachments/SME-Topics/Cant-RDP-SSH/Windows-Partitions-in-NonBoot-Scenarios_Disk-Management.png)



After confirming our disk is properly attached from the Azure Portal and the guest OS, we can identify our attached disk via the following:



  1. Process of elimination: Disk 0 is the primary disk of the Rescue VM.

  2. Process of elimination: Disk 1 is temp storage for the Rescue VM based on the name and the presence of the file D:\DATALOSS_WARNING_README.txt on Azure temp disks.

  3. In an actual scenario: if we go into the Windows partition of the attached disk in Windows Explorer (`F:\`, sometimes `G:\`) and make sure it?s online in Disk Management, we might see some familiar folders that are only present on our source VM (e.g., user folders, application folders, etc).



**Important note**: These files are hidden by default for a reason. You should only view/modify these settings if you have a backup, which we do have in this scenario since we are operating on a cloned disk attached to our Repair VM. Even then, proceed to show caution in modifying any of these options as an accidental misconfiguration or deletion means you may have to grab another copy of the source disk, **which will set you back timewise.**



Ways to identify the System Reserved partition:

 * can vary in size (~100-500mb) but is usually less than 1GB.

 * There are no recognizable Windows files on this partition visible by default (e.g. \Windows\ operating system folder, user profiles, applications, etc). These files are on the Windows partition instead. 

 * When attaching an external disk to a Rescue VM, this volume will appear empty in Windows Explorer because everything is hidden. 

 

 To view the hidden contents of this folder with CMD (admin, as permission may be denied otherwise), and confirm it is the correct partition (for this example, `E:\`):

 

 ```BAT

 dir E: /a:h /b /s

 ```



Example results:

```

C:>\windows\system32> dir e: /a:h /b /s

E:\$RECYCLE.BIN

E:\Boot

E:\bootmgr

E:\BOOTNXT

E:\System Volume Information

E:\$RECYCLE.BIN\S-1-5-21-1008643341-537216311-4051147846-560

E:\$RECYCLE.BIN\S-1-5-21-1008643341-537216311-4051147846-S500\desktop.ini

E:\Boot\BCD.LOG

E:\Boot\BCD.LOG1

E:\Boot\BCD.LOG2

E:\Boot\BOOTSTAT.DAT

```



![Unhide System Reserved files in CMD](/.attachments/SME-Topics/Cant-RDP-SSH/Windows-Partitions-in-NonBoot-Scenarios_cmd-unhide.png)



Alternatively, to unhide in Windows Explorer:



1. Open the System Reserved partition in Windows Explorer using the assigned drive letter (for this example, E:\).



    ![Disk Management](/.attachments/SME-Topics/Cant-RDP-SSH/Windows-Partitions-in-NonBoot-Scenarios_Disk-Management.png)

  

2. Click **File** -> **Change folder and search options**:



    ![Change folder and search options](/.attachments/SME-Topics/Cant-RDP-SSH/Windows-Partitions-in-NonBoot-Scenarios_folder-options.png)



3. Click the **View** tab and complete the following:



    1. Select the radio button for the option **Hidden files and folders** -> **Show hidden files, folders, and drives**.

    2. Uncheck **Hide protected operating system files (Recommended)**. You will need to select Yes on the warning to proceed. You can then view the files confirming that this is the correct Boot Manager partition.



        ![Show hidden](/.attachments/SME-Topics/Cant-RDP-SSH/Windows-Partitions-in-NonBoot-Scenarios_uncheck-folder-options.png)



        ![Explorer view showing hidden](/.attachments/SME-Topics/Cant-RDP-SSH/Windows-Partitions-in-NonBoot-Scenarios_explorer.png)



### Internal Documentation

 * It may be necessary to recreate the System Reserved Partition for certain scenarios, such as [resizing the OS Drive](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495772).



### External Documentation

 * Example: [Error 0x80070057 when you format a hard disk drive to install Windows 7](https://support.microsoft.com/en-us/topic/error-0x80070057-when-you-format-a-hard-disk-drive-to-install-windows-7-dc602fc7-2731-e06e-8c4f-f7c126d874ec)

 * Example: [?We couldn?t update system reserved partition? error installing Windows 10](https://support.microsoft.com/en-us/topic/-we-couldn-t-update-system-reserved-partition-error-installing-windows-10-46865f3f-37bb-4c51-c69f-07271b6672ac)

 * Example: [System Partition goes offline after installing some third-party disk or Storage Management Software

](https://docs.microsoft.com/en-us/troubleshoot/windows-server/deployment/system-partition-offline-install-3rd-party-disk)

 * Example: [Error message when you restart Windows Server after a full OS recovery: Windows failed to start. Status: 0xc000000e](https://docs.microsoft.com/en-us/troubleshoot/windows-server/performance/windows-fail-to-start-status-0xc000000e#more-information)



### Third Party Documentation

* [How-To Geek: What Is the System Reserved Partition and Can You Delete It?](https://www.howtogeek.com/192772/what-is-the-system-reserved-partition-and-can-you-delete-it/)





## Booting Windows



Windows boot options are stored in the Boot Configuration Data (BCD) store on BIOS-based and EFI-based computers. Boot Configuration Data (BCD) files provide a store that is used to describe boot applications and boot application settings. BCD provides a common, firmware-independent boot option interface. It is more secure than previous boot option storage configurations, and lets Administrators assign rights for managing boot options. BCD is available at run time and during all phases of system setup. You can manage BCD remotely and manage BCD when the system boots from media other than the media on which the BCD store resides. This feature is can be used for debugging and troubleshooting, especially when a BCD store must be restored while running Startup Repair, from USB-based storage media, or even remotely. The BCD store, with its object-and-element architecture, uses GUIDs and names such as "Default" to identify boot-related applications.



To display the BCD store values for the current OS, run the following in CMD (admin):



```BAT

REM Lists entries in a BCD store

bcdedit /enum

```



Example (`bcdedit` with no parameters is equivalent to `bcdedit /enum` or `bcdedit /enum active`):



```

C:\Users\rymccall> bcdedit



Windows Boot Manager

--------------------

identifier              {bootmgr}

device                  partition=\Device\HarddiskVolume3

description             Windows Boot Manager

locale                  en-US

inherit                 {globalsettings}

bootshutdowndisabled    Yes

default                 {current}

resumeobject            {b35d4dca-5b1e-11e9-a814-000d3a05463f}

displayorder            {current}

toolsdisplayorder       {memdiag}

timeout                 30



Windows Boot Loader

-------------------

identifier              {current}

device                  partition=C:

path                    \windows\system32\winload.exe

description             Windows Server 2016

locale                  en-US

inherit                 {bootloadersettings}

recoveryenabled         No

allowedinmemorysettings 0x15000075

osdevice                partition=C:

systemroot              \windows

resumeobject            {b35d4dca-5b1e-11e9-a814-000d3a05463f}

nx                      OptOut

bootstatuspolicy        IgnoreAllFailures

hypervisorlaunchtype    Auto

ems                     Yes

```



The default parameter under Windows Boot Manager indicates we are using the Windows Boot Loader with the identifier `{current}`. If you need to display the BCD from an attached disk, you would identify the store with an additional parameter, `/store`:



```BAT

REM For Gen1 servers

bcdedit /store <Boot partition>:\boot\bcd /enum



REM For Gen2 servers

bcdedit /store <Volume Letter of EFI System Partition>:EFI\Microsoft\boot\bcd /enum

```



For instance, here are the BCD settings after attaching an OS disk and assigning `E:\` to the reserved partition (`F:\` is the attached disk's Windows partition):



```

C:\Users\rymccall> bcdedit /store E:\boot\bcd /enum



Windows Boot Manager

--------------------

identifier              {bootmgr}

device                  partition=E:

description             Windows Boot Manager

locale                  en-US

inherit                 {globalsettings}

bootshutdowndisabled    Yes

default                 {default}

resumeobject            {8d3ceb7c-7957-11ec-bfac-000d3a4362c2}

displayorder            {default}

toolsdisplayorder       {memdiag}

timeout                 30



Windows Boot Loader

-------------------

identifier              {default}

device                  partition=F:

path                    \Windows\system32\winload.exe

description             Windows Server

locale                  en-US

inherit                 {bootloadersettings}

recoveryenabled         No

allowedinmemorysettings 0x15000075

osdevice                partition=F:

systemroot              \Windows

resumeobject            {8d3ceb7c-7957-11ec-bfac-000d3a4362c2}

nx                      OptOut

bootstatuspolicy        IgnoreAllFailures

ems                     Yes

```



The values `{current}` and `{default}` are examples of well-known identifiers (aliases). If you want to see the actual identifiers, you can run bcdedit with the verbose flag `/v`:



```

C:\Users\rymccall> bcdedit /store E:\boot\bcd /enum /v



Windows Boot Manager

--------------------

identifier              {9dea862c-5cdd-4e70-acc1-f32b344d4795}

device                  partition=E:

description             Windows Boot Manager

locale                  en-US

inherit                 {7ea2e1ac-2e61-4728-aaa3-896d9d0a9f0e}

bootshutdowndisabled    Yes

default                 {8d3ceb7d-7957-11ec-bfac-000d3a4362c2}

resumeobject            {8d3ceb7c-7957-11ec-bfac-000d3a4362c2}

displayorder            {8d3ceb7d-7957-11ec-bfac-000d3a4362c2}

toolsdisplayorder       {b2721d73-1db4-4c62-bf78-c548a880142d}

timeout                 30



Windows Boot Loader

-------------------

identifier              {8d3ceb7d-7957-11ec-bfac-000d3a4362c2}

device                  partition=F:

path                    \Windows\system32\winload.exe

description             Windows Server

locale                  en-US

inherit                 {6efb52bf-1766-41db-a6b3-0ee5eff72bd7}

recoveryenabled         No

allowedinmemorysettings 0x15000075

osdevice                partition=F:

systemroot              \Windows

resumeobject            {8d3ceb7c-7957-11ec-bfac-000d3a4362c2}

nx                      OptOut

bootstatuspolicy        IgnoreAllFailures

ems                     Yes

```



The Windows Boot Manager, which resides in the root directory, starts the system and interacts with the user. It displays the boot menu, loads the selected system-specific boot loader, and passes the boot parameters to the boot loader.



### Internal Documentation

 * [Rewrite the BCD store to repair boot issues](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494739)



### External Documentation

 * [Overview of Boot Options in Windows](https://docs.microsoft.com/en-us/windows-hardware/drivers/devtest/boot-options-in-windows)

 * [Boot Options Identifiers](https://docs.microsoft.com/en-us/windows-hardware/drivers/devtest/boot-options-identifiers)

 * [Previous Boot Options](https://docs.microsoft.com/en-us/windows-hardware/drivers/devtest/boot-options-in-previous-versions-of-windows)

 * [BCD System Store Settings for UEFI](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/bcd-system-store-settings-for-uefi)

 * [Advanced troubleshooting with information on booting phases](https://docs.microsoft.com/en-us/windows/client-management/advanced-troubleshooting-boot-problems)



## Partitions (Volumes)



A partition is a separated section of the hard drive. You can use the Device Management tool or the Diskpart tool to review partitions. Partitions are referred to as volumes when the disks are dynamic, but usually the terms are interchangeable. 



### Internal Documentation

 * Example: [Activating disabled partition](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494679)

 * Example: [Run diskpart to assign drive letter manually to EFI system partition](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495122)

 * Example: [Use Diskpart to assign a drive letter on a Gen2 VM](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494672)



### External Documentation

 * [Hard drives and partitions](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/hard-drives-and-partitions?view=windows-11#system-and-utility-partitions)

 * [Create and format a hard disk partition](https://support.microsoft.com/en-us/windows/create-and-format-a-hard-disk-partition-bbb8e185-1bda-ecd1-3465-c9728f7d7d2e)

 * [How to mirror the system and boot partition](https://docs.microsoft.com/en-us/troubleshoot/windows-server/backup-and-storage/mirror-system-boot-partition-raid1#mirror-the-boot-and-system-volume)





## Tools



### Diskpart

Diskpart is a command line tool that helps manage disks and partitions.



#### External Documentation

  * [Diskpart commands](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/diskpart)



### Disk Management

Disk Management is a system utility in Windows w/ GUI that helps manage disks and partitions.



#### External Documentation

  * [Overview](https://docs.microsoft.com/en-us/windows-server/storage/disk-management/overview-of-disk-management)

  * [Help in Disk Management](https://support.microsoft.com/en-us/windows/help-in-disk-management-ad88ba19-f0d3-0809-7889-830f63e94405)

  * Example: [Troubleshooting Disk Management](https://docs.microsoft.com/en-us/windows-server/storage/disk-management/troubleshooting-disk-management#how-to-open-disk-management)



### BCDEdit

BCDEdit is a command-line tool for managing BCD stores. 



#### External Documentation

 * [BCDEdit](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/bcdedit)

 * [BCDEdit Options Reference](https://docs.microsoft.com/en-us/windows-hardware/drivers/devtest/bcd-boot-options-reference)

 * [Editing Boot Options](https://docs.microsoft.com/en-us/windows-hardware/drivers/devtest/editing-boot-options)



### BCDboot

BCDboot helps to repair the boot environment located on the system partition.    



#### External Documentation

 * [BCDboot command reference](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/bcdboot)

 * [BCDBoot Command-Line Options](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/bcdboot-command-line-options-techref-di?view=windows-10#how-it-works)





## Partition Schemes & Generation



### MBR/BIOS (Gen1)

Since the introduction of the personal computer, the data storage area on a hard disk has been divided into smaller areas called sectors. These sectors are grouped into partitions creating separate volumes, or 'drives' on a disk. The partitions were organized using a scheme called the Master Boot Record (MBR). The MBR is a table of disk locations, or addresses, along with a certain length, of each of the partitions present on the disk. The MBR itself occupies a small amount of the disk and is read during the boot phase to determine where to locate the operating system to boot into. The MBR information is also used by the operating system as a map of the volumes present on the disk.



#### External Documentation

 * [Disk Concepts and Troubleshooting](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-2000-server/cc977219(v=technet.10))

 * [Basic and Dynamic Disks](https://docs.microsoft.com/en-us/windows/win32/fileio/basic-and-dynamic-disks?redirectedfrom=MSDN#partition-styles)

 * [Windows does not support the GUID partition table (GPT) file system on BIOS-based computers.](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/configure-biosmbr-based-hard-drive-partitions?view=windows-10#partition-requirements)

 * [The maximum size allowed for the OS VHD with a generation 1 VM is 2,048 GiB (2 TiB)](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/prepare-for-upload-vhd-image)



### GPT (Gen2)

Eventually, data density for disks became too large for the MBR scheme to account for all the available data locations. Also, the layout, or format, of the MBR was designed for early computers and not flexible enough to accommodate newer disk configurations. A new partitioning method was needed so the GUID Partition Table (GPT) partitioning scheme was created.



#### Internal Documentation

* [Ways to identify Gen2 Azure VMs](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495635)

* [Additional steps required to boot a Gen2 disk in Nested Virtualization](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495122)

* Example: [No UEFI Compatible File System Found_RDP SSH](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495261)



#### External Documentation

  * [Announcement on Gen2 VMs from 2019](https://azure.microsoft.com/en-us/updates/azure-generation-2-virtual-machines-vms-are-now-generally-available/)

  * [FAQ](https://docs.microsoft.com/en-us/previous-versions/windows/hardware/design/dn640535(v=vs.85))

  * [UEFI](https://docs.microsoft.com/en-us/windows-hardware/drivers/bringup/boot-and-uefi#understanding-the-windows-boot-manager)

  * [Benefits](https://docs.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-uefi#uefi-benefits)

  * [When you deploy Windows to a UEFI-based device, you must format the hard drive that includes the Windows partition by using a GUID partition table (GPT) file system. Additional drives may use either the GPT or the master boot record (MBR) file format.](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/configure-uefigpt-based-hard-drive-partitions?view=windows-11)

  * [Gen2 Hyper-V servers](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/dn282285(v=ws.11))

  * [Gen1 vs Gen2 Hyper-V servers](https://docs.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/should-i-create-a-generation-1-or-2-virtual-machine-in-hyper-v)

  * [Generation 2 Azure VMs use the new UEFI-based boot architecture rather than the BIOS-based architecture used by generation 1 VMs. Compared to generation 1 VMs, generation 2 VMs might have improved boot and installation times.](https://docs.microsoft.com/en-us/azure/virtual-machines/generation-2)     

  * [UEFI supports disks that are more than 2TB](https://docs.microsoft.com/en-us/troubleshoot/windows-server/backup-and-storage/support-for-hard-disks-exceeding-2-tb)





# Questions or Feedback



::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md

:::
