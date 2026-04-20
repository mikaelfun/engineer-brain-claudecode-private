---
title: Azure VM Boot Diagnostics Guide
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/boot-diagnostics
product: vm
21vApplicable: true
---

# Azure VM Boot Diagnostics Guide

Boot diagnostics helps troubleshoot non-bootable VMs by providing console output and screenshot support.

## Features

- **Linux VMs**: View console log output from Portal
- **Windows & Linux VMs**: View VM screenshot from hypervisor
- Screenshots and output may take up to 10 minutes to appear in storage account

## Common Boot Errors (Windows)

| Error Code | KB Article |
|-----------|-----------|
| 0xC000000E | KB4010129 |
| 0xC000000F | KB4010130 |
| 0xC0000011 | KB4010134 |
| 0xC0000034 | KB4010140 |
| 0xC0000098 | KB4010137 |
| 0xC00000BA | KB4010136 |
| 0xC000014C | KB4010141 |
| 0xC0000221 | KB4010132 |
| 0xC0000225 | KB4010138 |
| 0xC0000359 | KB4010135 |
| 0xC0000605 | KB4010131 |
| An operating system was not found | KB4010142 |
| INACCESSIBLE_BOOT_DEVICE | KB4010143 |

## Enable Boot Diagnostics

### Portal
VM creation > Management tab > Monitoring > Boot diagnostics ON (default: managed storage account)

### ARM Template
Set apiVersion >= 2015-06-15, add diagnosticsProfile.bootDiagnostics with enabled=true and storageUri.

### CLI
az vm boot-diagnostics enable

## Notes
- Premium storage accounts and Zone Redundant Storage not supported (StorageAccountTypeNotSupported error)
- Existing VMs: Help > Boot diagnostics > Settings tab

## Fix Stale Screenshot

If screenshot shows old timestamp:
- **Windows**:  (elevated CMD)
- **Linux**: 
- VMs from specialized VHDs need this manually; generalized images set it via provisioning agent
