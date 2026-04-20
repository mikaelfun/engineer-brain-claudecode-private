---
title: Azure VM Windows Update 错误检测工具 (IPU Tool)
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-vm-ipu-tool
product: vm
date: 2026-04-18
21vApplicable: true
---

# Windows Update 错误检测工具

## 概述

PowerShell 脚本，扫描 Component-Based Servicing (CBS) 日志，检测已知的 Windows servicing 错误代码，判断是否需要 in-place upgrade (IPU) 或修复。

## 功能

- 扫描 CBS 日志和 `C:\Windows\Logs\CBS\` 下的 .zip 归档日志
- 可配置日期范围过滤（默认最近 30 天）
- 按严重程度分类：Critical / High / Medium / Low
- 显示错误发生次数汇总
- 检测到错误时提供修复文档链接

## 运行方式

### 1. Azure Run Command（推荐）

1. Azure Portal → VM → Operations → Run Command → RunPowerShellScript
2. 粘贴脚本内容
3. 点击 Run

### 2. 下载后在 VM 内运行

从 GitHub 下载脚本后手动运行。

### 3. 预打包的 Run Command 脚本

参考 [Run scripts in your Windows VM by using action Run Commands](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/run-command)

## 推荐工作流

1. 运行 `windows-vm-ipu-tool` 验证激活状态并检测常见问题
2. 根据建议修复或参考官方文档进行高级排查

## 相关资源

- [Azure VM Windows Update Error Detection script (GitHub)](https://github.com/Azure/azure-support-scripts/blob/master/RunCommand/Windows/Windows_Update_IPU_Validation)
- [Windows Update errors requiring in-place upgrades](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-update-errors-requiring-in-place-upgrade)
- [In-place upgrade (server)](https://learn.microsoft.com/en-us/azure/virtual-machines/windows-in-place-upgrade)
- [In-place upgrade (client)](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/in-place-system-upgrade)
