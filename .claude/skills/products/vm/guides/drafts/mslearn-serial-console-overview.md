---
title: Azure Serial Console Overview
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/serial-console-overview
product: vm
21vApplicable: true
---

# Azure Serial Console Overview

Azure Serial Console provides text-based console access to VMs and VMSS instances via ttyS0/COM1 serial port, independent of network state.

## Prerequisites

- Boot diagnostics must be enabled for the VM
- A user account with password authentication must exist within the VM
- Azure account must have Virtual Machine Contributor role for both the VM and boot diagnostics storage account
- Classic deployments are not supported (ARM only)
- Not supported when storage account has "Allow storage account key access" disabled

> By end of 2025, Serial Console will no longer utilize boot diagnostics storage accounts for connection.

## Access Methods

1. **Azure Portal (VM)**: VM > Help > Serial console
2. **Azure Portal (VMSS)**: VMSS > Instances > select instance > Help > Serial console
3. **Azure CLI**: az serial-console connect (serial-console extension auto-installs)

## TLS 1.2

Serial Console uses TLS 1.2 end-to-end. Must configure TLS 1.2 separately for boot diagnostics storage account.

## Advanced Uses

- Send SysRq commands (Linux)
- Send NMI (non-maskable interrupt)
- Gracefully reboot or forcefully power-cycle VM

## 21V (Mooncake) Support

Serial Console is available in China East 2, China East 3, China North 2, China North 3.
