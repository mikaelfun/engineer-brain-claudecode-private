---
title: "Repair Boot Configuration Data (BCD) on Azure Windows VM"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/virtual-machines-windows-repair-boot-configuration-data"
product: vm
type: guide
21vApplicable: true
date: "2026-04-18"
---

# Repair Boot Configuration Data (BCD) on Azure Windows VM

BCD 损坏导致 Windows VM 无法启动时的修复流程。

## 前置条件

- 能够创建 Repair VM 并附加 OS disk
- 了解 Gen1 vs Gen2 VM 的 BCD 路径区别

## 修复流程

### 1. 准备 Repair VM

1. 删除故障 VM（保留 OS disk，取消勾选 "Delete with VM"）
2. 将 OS disk 作为 data disk 附加到 Repair VM
3. RDP 连接到 Repair VM

### 2. 确认磁盘和分区

- 打开 Computer Management → Disk Management
- 确认附加的 OS disk 已 Online
- 识别 Boot 分区和 Windows 分区：
  - **Windows 分区**：包含 `Windows` 文件夹，通常较大
  - **Boot 分区**：包含隐藏的 `boot` 文件夹，通常 300-500 MB

### 3. 获取 Windows Boot Loader 标识符

**Gen1 VM:**
```cmd
bcdedit /store <boot-partition>:ootcd /enum /v
```

**Gen2 VM:**
```cmd
bcdedit /store <EFI-partition>:EFI\Microsoftootcd /enum /v
```

记录 Windows Boot Loader 的 identifier（GUID 格式）。

> 如果 boot 文件夹中没有 bcd 文件，需先从备份恢复该文件。

### 4. 修复 BCD

**Gen1 VM:**
```cmd
bcdedit /store <boot-partition>:ootcd /set {<identifier>} OSDEVICE partition=<windows-partition>:
```

也可尝试：
```cmd
bcdedit /store <boot-partition>:ootcd /set {<identifier>} OSDEVICE BOOT
```

**Gen2 VM** 路径使用 EFI System Partition。

### 5. 重建 VM

分离修复后的 OS disk，从该 disk 创建新 VM。

## Gen1 vs Gen2 区别

| 项目 | Gen1 | Gen2 |
|------|------|------|
| BCD 路径 | `<boot>:ootcd` | `<EFI>:EFI\Microsoftootcd` |
| 活动分区 | 需要设为 Active | UEFI，无需 Active |
| Boot loader | winload.exe | winload.efi |

## 相关文章

- [Troubleshoot Windows VM OS boot failure](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/os-bucket-boot-failure)
- [Windows boot error INACCESSIBLE_BOOT_DEVICE](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-boot-failure)
