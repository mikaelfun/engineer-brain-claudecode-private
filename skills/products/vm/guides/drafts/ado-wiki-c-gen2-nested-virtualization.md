---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Gen2 Nested Virtualization_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Gen2%20Nested%20Virtualization_RDP%20SSH"
importDate: "2026-04-06"
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

# Azure_Virtual Machine_HowTo_Gen2VM_Nested_Virtualization

## Summary
This article steps through enabling nested Hyper-V on an Azure VM for a Generation 2 VM.
Before following this article, refer to the guide to identify the VM is a Gen2 VM: [How to identify Gen2 VM](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495552)

## Create a capable nesting Azure VM
- OS:<br/>
Use a Windows server 2016 and above.
- VM Size:<br/>
Generation 2 VM only supports premium disk, we should select a VM size which supports premium storage and nested virtualization.
For example, `Ds4_v3` contains `s` that supports premium disk, `v3` supports nested virtualization.
For a complete list of virtual machine sizes that support nesting, refer to [Azure Compute Unit](https://docs.microsoft.com/en-us/azure/virtual-machines/acu)

## Enable the Hyper-V feature on the Azure VM
Run the following PowerShell script as an administrator:

```powershell
Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart
```

## Create a guest virtual machine
1. Create a new VM in Hyper-V manager, specify `Generation 2`<br/>
![Specify Gen2](/.attachments/SME-Topics/Cant-RDP-SSH/Azure_Virtual_Machine_HowTo_Gen2_VM_Nested_Virtualization_sc1.jpg)
2. Gen1 use IDE controller, Gen2 user SCSI controller, so attach the hard disk under SCSI controller<br/>
![SCSI controller](/.attachments/SME-Topics/Cant-RDP-SSH/Azure_Virtual_Machine_HowTo_Gen2_VM_Nested_Virtualization_sc2.jpg)

## Assign drive letter to the system partition

The option "Change Drive Letter and Paths..." for EFI system partition is grayed out, we cannot assign drive letter in Disk Management.

![Disk Management](/.attachments/SME-Topics/Cant-RDP-SSH/Azure_Virtual_Machine_HowTo_Gen2_VM_Nested_Virtualization_sc3.jpg)

Run `DISKPART` to assign drive letter manually to EFI system partition:

```dos
CMD> diskpart
DISKPART> list disk              // list the disk
DISKPART> select disk 2          // select the troubleshooting disk
DISKPART> list partition         // list partition
DISKPART> select partition 3     // select the system partition
DISKPART> assign                 // assign drive letter
DISKPART> list volume            // list volumes to see the drive letter of system partition
```

![DISKPART](/.attachments/SME-Topics/Cant-RDP-SSH/Azure_Virtual_Machine_HowTo_Gen2_VM_Nested_Virtualization_sc4.jpg)

## List BCD store data
Run the following command to list the BCD store data, the BCD path is different from Gen1 VM.
We can add an argument `/v` to display identifiers in full.

```dos
> bcdedit /store <drive letter of EFI system partition>:EFI\Microsoft\boot\bcd /enum /v
```

## Setup internet connectivity for the guest virtual machine
Please refer to article: [Setup internet connectivity for the guest virtual machine](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/nested-virtualization#set-up-internet-connectivity-for-the-guest-virtual-machine)


::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
