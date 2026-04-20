---
title: Azure VM Windows OS Upgrade Assessment Tool
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-vm-osupgradeassessment-tool
product: vm
date: 2026-04-18
type: reference-tool
---

# Azure VM Windows OS Upgrade Assessment Tool

PowerShell 脚本工具，用于评估 Windows VM（桌面或服务器）是否可以进行 in-place OS upgrade。

## 评估项目

- **OS 版本检测**：识别 Windows 10/11 或 Server 版本
- **Server 升级路径检查**：匹配当前版本到支持的升级目标
- **硬件验证**：磁盘空间 >= 64GB，内存 >= 4GB
- **Azure VM 安全功能验证**：Trusted Launch、Secure Boot、vTPM
- **Azure Virtual Desktop 检测**：标记不支持的 pooled host pool 配置
- **升级建议**：输出支持的升级路径或相关指南

## 运行方式

1. **从 GitHub 下载后在 VM 内运行**：
   - https://github.com/Azure/azure-support-scripts/blob/master/RunCommand/Windows/Windows_OSUpgrade_Assessment_Validation

2. **通过 Azure Portal Run Command 执行**：
   - 参考 [Run scripts in your Windows VM by using action run commands](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/run-command)

## 推荐工作流

1. 运行 Windows_OSUpgrade_Assessment_Validation 验证 OS 是否可升级
2. 按建议修复或参考官方文档

## 相关工具

- [Azure VM Windows Update Error Detection Tool](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-vm-ipu-tool)
- [Azure VM Windows Update Reset Tool](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-vm-wureset-tool)
