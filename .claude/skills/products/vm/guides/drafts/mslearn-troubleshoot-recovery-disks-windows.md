---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-recovery-disks-windows"
importDate: "2026-04-20"
type: guide-draft
---

# Troubleshoot a Windows VM by Attaching OS Disk to Recovery VM (PowerShell)

## Overview
Use Azure PowerShell to attach the OS disk of a failed Windows VM to a recovery VM for offline troubleshooting.

## When to Use
- Windows VM encounters a boot or disk error
- Failed application update prevents VM from booting
- Need offline access to OS disk for repair

## Prerequisites
- Azure PowerShell installed and connected (Connect-AzAccount)
- VMs must use Managed Disks

## Recovery Process

### 1. Stop the affected VM


### 2. Create a snapshot from the OS disk


### 3. Create a disk from the snapshot and attach as data disk to recovery VM

### 4. Connect to recovery VM and repair the attached OS disk

### 5. Detach disk and swap OS disk back to original VM

### Automated Alternative
Use  commands to automate the entire process.

## Boot Diagnostics

