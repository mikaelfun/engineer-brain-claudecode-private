---
title: Use Remote Tools to Troubleshoot Azure VM Issues
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/remote-tools-troubleshoot-azure-vm-issues
product: vm
21vApplicable: true
date: 2026-04-18
---

# 使用远程工具排查 Azure VM 问题

## 概述
当无法通过 RDP 连接 VM 时，可使用以下远程工具进行排查。

## 工具清单

### 1. Serial Console
Azure VM Serial Console，直接在 Azure Portal 中操作。

### 2. Remote CMD (PsExec)
```cmd
psexec \<computer> -u user -s cmd
```
- 需要在同一 VNET 中的机器执行
- 需要开放 TCP 135 和 445 端口

### 3. Run Command
通过 Azure Portal 执行 PowerShell 脚本，无需直接网络连接。

### 4. Custom Script Extension (CSE)
- VM 需有网络连接
- VM Agent 需正常运行
- 首次安装后 CSE 不会自动更新脚本（需卸载重装）

### 5. Remote PowerShell
- 需开放 TCP 5986 (HTTPS)
- ARM VM 需在 NSG 中开放 5986
- 设置 TrustedHosts + 启用 RemotePS + 建立 PSSession

### 6. Remote Registry
- 需开放 TCP 135 或 445
- 通过 regedit → File → Connect Network Registry

### 7. Remote Services Console
- 需开放 TCP 135 或 445
- 通过 Services.msc → Connect to another computer
