---
title: Azure VM Mellanox 网络驱动验证工具
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-vm-mellanox-network-driver-validation-tool
product: vm
date: 2026-04-18
21vApplicable: true
---

# Mellanox 网络驱动验证工具

## 概述

Windows PowerShell 诊断脚本，用于检测过时的 NVIDIA Mellanox mlx5 驱动是否导致 Azure VM 出现 BSOD（DRIVER_IRQL_NOT_LESS_OR_EQUAL 0x000000D1）。

仅检测，不修改系统。

## 检测内容

- 是否存在 Mellanox/NVIDIA ConnectX 网络适配器
- 已安装的 mlx5 驱动版本和日期
- 过去 30 天内 Windows Event Log 中的 0xD1 stop error 事件
- 适配器链路状态（Up / Error）
- 驱动超过 12 个月标记为过时

## 运行方式

### Azure Run Command（推荐）

1. Azure Portal → VM → Operations → Run Command → RunPowerShellScript
2. 粘贴 [Windows_Mellanox_Driver_Validation.ps1](https://github.com/Azure/azure-support-scripts/tree/master/RunCommand/Windows/Windows_Mellanox_Driver_Validation) 内容
3. 点击 Run

### 手动下载运行

```powershell
Set-ExecutionPolicy Bypass -Force
.\Windows_Mellanox_Driver_Validation.ps1
```

## 推荐工作流

1. 运行验证脚本 → 检查适配器、驱动版本、故障事件
2. 如驱动被标记过时或发现 0xD1 事件 → 按排查文档更新驱动
3. 参考 [Troubleshooting: Mellanox mlx5 Driver Crash on Azure Windows VMs](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-windows-vm-mellanox-network-driver-crash) 更新驱动
4. 更新后重新运行脚本验证
