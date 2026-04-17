---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Disk/Hardware & Unlock/Using USBTreeView tool to troubleshoot undetected disks or disks that cannot be unlocked"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%20Disk%2FHardware%20%26%20Unlock%2FUsing%20USBTreeView%20tool%20to%20troubleshoot%20undetected%20disks%20or%20disks%20that%20cannot%20be%20unlocked"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Disks undetected or cannot be unlocked on Azure Data Box Disk

### Overview
When a customer receives an Azure Data Box Disk and the disk is either undetected by their host machine or detected but cannot be unlocked, despite following the documentation, they may need to troubleshoot the issue using the USBTreeView tool.

### Cause
This issue could be due to a problem with the disk itself or the customer not following the instructions correctly.

## Common issues and solutions

### Undetected disks
For disks that are undetected by the host machine, the disk is likely to be corrupt. Test for this by trying the following before creating an IcM and requesting new disks:

1. Connect the disk(s) to a different USB port on the host machine.
2. Connect the disk(s) to a different host machine.
3. Connect the disk(s) using a different USB cable.

### Disks that cannot be unlocked
For disks that cannot be unlocked, perform the following troubleshooting steps:

1. Connect the disk(s) to a different USB port (ensure the USB port is a USB 3.0 port).
2. Connect the disk(s) to a different host machine.
3. Connect the disk(s) using a different USB cable.
4. Check if the disk(s) are showing as "RAW" or "Unallocated" in Disk Management (collect a screenshot).
5. Check the USB ports in Device Manager (collect a screenshot).

### Using USBTreeView Tool

The USBTreeView tool is recommended to collect a report from a customer's host machine on port configuration and supported protocols.

#### Step-by-step instructions

1. **Download the USBTreeView tool**
   - Follow the [documentation here to download](https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/usbview#where-to-get-usbview); it comes in the Windows SDK and can be found in `C:\Program Files (x86)\Windows Kits\10\Debuggers\x64` after downloading the debugging tools for Windows.

2. **Extract and launch the tool**
   - When launched, the tool will show a USB tree similar to that shown in Device Manager.

3. **Select the USB port** the Azure Data Box Disk(s) is connected to and check its information.

4. **Collect a screenshot.**
   - The tree information can also be saved as a whole in a `.txt` file by clicking on `File` → `Save Text Report`.

#### Example of a text report

```plaintext
=========================== USB Port17 ===========================
Connection Status : 0x01 (Device is connected)
Port Chain : 1-17
Properties : 0x03
IsUserConnectable : yes
PortIsDebugCapable : yes
PortHasMultiCompanions : no
PortConnectorIsTypeC : no
ConnectionIndex : 0x11 (Port 17)
CompanionIndex : 0
CompanionHubSymLnk : USB#ROOT_HUB30#4&d2fc86a&0&0#{f18a0e88-c30c-11d0-8815-00a0c906bed8}
CompanionPortNumber : 0x01 (Port 1)
-> CompanionPortChain : 1-1
========================== Summary =========================
Vendor ID : 0x0781 (Western Digital, Sandisk)
Product ID : 0x5591
USB version : 3.0
Port maximum Speed : SuperSpeed
Device maximum Speed : SuperSpeed
Device Connection Speed : SuperSpeed
Self Powered : no
Demanded Current : 896 mA
Used Endpoints : 3
======================== USB Device ========================
+++++++++++++++++ Device Information ++++++++++++++++++
Device Description : USB Mass Storage Device
...
```

Key fields to check:
- **USB version / Port maximum Speed**: Should be 3.0/SuperSpeed for Data Box Disk
- **Demanded Current**: High current draw may indicate power issues
- **Connection Status**: Must show "Device is connected"

If the USBTreeView report shows issues (wrong USB version, not connected), try a direct USB 3.0 port or different host. If disk is RAW/Unallocated in Disk Management, create an IcM and request replacement disks.
