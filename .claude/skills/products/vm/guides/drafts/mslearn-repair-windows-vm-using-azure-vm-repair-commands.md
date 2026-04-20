---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/repair-windows-vm-using-azure-virtual-machine-repair-commands"
importDate: "2026-04-20"
type: guide-draft
---

# Repair a Windows VM Using Azure VM Repair Commands

## Overview
Use  commands to automatically attach a broken OS disk to another Windows VM for offline repair.

## Prerequisites
- Azure CLI with vm-repair extension
- Outbound connectivity (port 443)
- Managed disks only
- ADE: only single-pass encryption (with or without KEK) supported

## Important Limitations
- Only one script may run at a time; max 90 minutes runtime
- Do NOT modify tags created on repair VM (needed for restore)

## Repair Process

### Install extension


### Create repair VM

This stops the VM, snapshots OS disk, creates repair VM, attaches disk, and unlocks ADE-encrypted disks.

### Run repair scripts

Common run-ids: win-sfc-sf-corruption, win-chkdsk, win-enable-serial-console

### Restore repaired disk


## Available Commands
- The command requires the extension vm-repair. Do you want to install it now? The command will continue to run after the extension is installed. (Y/n):  - List available repair scripts
- The command requires the extension vm-repair. Do you want to install it now? The command will continue to run after the extension is installed. (Y/n):  - Create repair VM
- The command requires the extension vm-repair. Do you want to install it now? The command will continue to run after the extension is installed. (Y/n):  - Run a repair script
- The command requires the extension vm-repair. Do you want to install it now? The command will continue to run after the extension is installed. (Y/n):  - Swap OS disk back
