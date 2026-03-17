---
name: vpp-token
description: Intune VPP 令牌查询
tables:
  - VppFeatureTelemetry
parameters:
  - name: accountId
    required: true
    description: Intune 账户 ID
---

# VPP 令牌查询

## 用途

查询 Apple VPP (Volume Purchase Program) 令牌同步状态和错误。

---

## 查询 1: VPP 令牌同步状态查询

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {accountId} | 是 | Intune 账户 ID |

### 查询语句

```kql
VppFeatureTelemetry
| where accountId == '{accountId}'
| where env_time >= ago(7d)
| where TaskName == "VppApplicationSyncEvent"
| project env_time, env_cloud_name, TaskName, ActivityId, accountId, tokenId, 
    applications, userId, ex, clientContextIntune, clientContextExternalVppService, 
    I_Srv, tokenState
| order by env_time desc
```

---

## 查询 2: VPP 同步错误查询

### 查询语句

```kql
VppFeatureTelemetry
| where accountId == '{accountId}'
| where env_time >= ago(7d)
| where isnotempty(ex)
| project env_time, tokenId, tokenState, ex, TaskName
| order by env_time desc
```

## 关联查询

- [app-install.md](./app-install.md) - 应用安装
- [apple-device.md](./apple-device.md) - Apple 设备
