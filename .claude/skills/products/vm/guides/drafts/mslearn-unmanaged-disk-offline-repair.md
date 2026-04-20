---
title: Attach Unmanaged Disk to VM for Offline Repair
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/unmanaged-disk-offline-repair
product: vm
21vApplicable: true
date: 2026-04-18
---

# 非托管磁盘离线修复指南

## 概述
当 VM 使用非托管磁盘且无法启动时，需要通过离线修复方式处理。

## 判断磁盘类型

### Portal
- Overview 页面有 banner 提示 "VM is not using managed disks"
- 磁盘名称后缀 "(unmanaged)"

### PowerShell
```powershell
(Get-AzVM -ResourceGroupName MyRG -Name MyVM).StorageProfile.OsDisk
# ManagedDisk 字段为空 → 非托管盘
```

### Azure CLI
```bash
az vm show -n MyVM -g MyRG --query "storageProfile.osDisk.managedDisk"
# 无输出 → 非托管盘
```

## 修复流程

1. **停止源 VM**
2. **复制 VHD**：Azure Storage Explorer → vhds container → Copy → 粘贴到新 blob container
3. **创建修复 VM**（非托管盘模式）：取消勾选 "Use managed disks"
4. **挂载磁盘副本**：Disks → Add data disk → Existing blob → 选择副本
5. **修复**：在修复 VM 中操作挂载的磁盘
6. **替换源 VM 磁盘**：通过 PowerShell 更新 OsDisk VHD URI

## 加密磁盘处理
如果磁盘使用 ADE 加密，需先 unlock 再修复。
