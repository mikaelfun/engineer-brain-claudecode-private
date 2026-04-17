# Windows LAPS Automatic Account Management via Intune

> Source: Case 2508180040000578 — [LAPS] deploy managed user account

## Overview

客户希望通过 Intune 策略创建本地管理员账户。

## Windows 11 24H2+ 方案：Automatic Account Management Mode

从 Windows 11 24H2 开始，Windows LAPS 支持自动账户管理模式（Automatic Account Management Mode），可以自动创建和管理本地管理员账户。

### 配置项

- 是否使用内置 Administrator 账户或自定义新账户
- 账户名称
- 是否启用/禁用账户
- 是否随机化账户名称

### 参考文档

- [Manage Windows LAPS with Microsoft Intune](https://learn.microsoft.com/en-us/intune/intune-service/protect/windows-laps-overview)
- [Windows LAPS account management modes](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-concepts-account-management-modes#automatic-account-management-mode)

## 旧版 OS 替代方案

对于 Windows 11 24H2 之前的设备：

1. **Accounts CSP** — 通过 Intune 配置策略部署
2. **Custom Policy-driven Management Scripts** — 通过 Intune 脚本部署
3. **Base OS Image** — 在系统镜像中预置账户

## Hybrid (GPO) 场景

对于 Hybrid 环境，客户通常使用 VBS/PowerShell 脚本预先创建自定义用户账户并授予本地管理员组成员身份。
