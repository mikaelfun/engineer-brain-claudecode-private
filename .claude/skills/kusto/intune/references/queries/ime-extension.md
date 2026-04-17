---
name: ime-extension
description: IME (Intune Management Extension) Win32 App Agent 安装查询
tables:
  - DeviceManagementProvider
parameters:
  - name: deviceId
    required: true
    description: Intune 设备 ID
  - name: accountId
    required: true
    description: Intune 账户 ID
  - name: startTime
    required: true
    description: 开始时间
  - name: endTime
    required: true
    description: 结束时间
---

# IME Extension 安装查询

## 用途

查询 Windows 设备上 Intune Management Extension (IME / IntuneWindowsAgent.msi) 的安装状态和事件。IME 是 Win32 应用、PowerShell 脚本和合规脚本在 Windows 设备上的执行引擎。

---

## 查询 1: IME Agent 安装事件

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |
| {accountId} | 是 | Intune 账户 ID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let deviceid = '{deviceId}';
let accountid = '{accountId}';

DeviceManagementProvider
| where env_time between (starttime .. endtime)
| where accountId == accountid
| where ActivityId contains deviceid
| where message has "IntuneWindowsAgent.msi"
| project env_time, DeviceId = ActivityId, message, cV
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| DeviceId | 设备 ID（来自 ActivityId）|
| message | 安装详情消息（包含版本、状态）|
| cV | Correlation Vector，用于跨服务追踪 |

---

## 查询 2: IME Agent 安装状态摘要

### 查询语句

```kql
DeviceManagementProvider
| where env_time >= ago(30d)
| where * contains '{deviceId}'
| where * contains 'IntuneWindowsAgent'
| project env_time, name, applicablilityState, reportComplianceState  
| summarize max(env_time) by name, applicablilityState, reportComplianceState 
```

---

## 常见问题

### IME 安装失败排查流程

1. 使用查询 1 检查是否有 IME 安装记录
2. 如果无记录，设备可能未签到或未被分配 Win32 App 策略
3. 检查 message 字段中的错误信息
4. 确认设备是否满足 IME 的最低系统要求

### 关键知识

- IME 文件名为 `IntuneWindowsAgent.msi`
- IME 仅适用于 Windows 10/11 设备
- IME 安装是 Win32 App 部署的前置条件

## 关联查询

- [app-install.md](./app-install.md) - 应用安装状态
- [device-checkin.md](./device-checkin.md) - 设备 Check-in
