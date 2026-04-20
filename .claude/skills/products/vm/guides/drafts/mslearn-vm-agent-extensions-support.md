---
title: Azure VM Agent Extensions Support Matrix
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/support-agent-extensions
product: vm
tags: [VM-agent, extensions, support-policy, troubleshooting]
21vApplicable: true
---

# Azure VM Agent Extensions Support Matrix

## 支持策略

- Microsoft 仅支持**第一方扩展**（Microsoft 直接开发和发布）
- 第三方扩展（Chef, Puppet, Symantec, Trend Micro 等）由厂商直接支持

## VM Agent 服务组件

VM Agent 包含三个必须运行的服务：
1. **RDAgent**
2. **Windows Azure Guest Agent**
3. **Microsoft Azure Telemetry Service**（Guest Agent 2.7.41491.971+ 已合并到 Guest Agent 服务）

## 扩展故障排查

1. 确认三个 Agent 服务都在运行
2. 检查扩展安装/启动日志：
3. 搜索 "error" 关键词定位失败的扩展
4. 日志中可看到 Enable/Install/Start/Disable 操作的结果

## 常见扩展列表

| 扩展 | 支持方 |
|------|--------|
| DSC (Desired State Configuration) | Microsoft |
| BGInfo | Microsoft |
| VMAccessAgent | Microsoft |
| Chef Client | Chef Software |
| Puppet Enterprise Agent | PuppetLabs |
| Symantec Endpoint Protection | Symantec |
| Trend Micro Deep Security | Trend Micro |
