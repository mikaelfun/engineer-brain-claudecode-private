---
name: CMService
database: intune
cluster: https://intunecn.chinanorth2.kusto.chinacloudapi.cn
description: Comanagement 服务表，记录 Comanagement 设备状态
status: active
related_tables:
  - DeviceManagementProvider
  - DeviceLifecycle
---

# CMService

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://intunecn.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | intune |
| 状态 | ✅ 可用 |

## 用途

记录 Comanagement (共同管理) 服务的日志，用于排查 Configuration Manager 和 Intune 共同管理场景的问题。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间 | 2026-01-14T00:00:00Z |
| ActivityId | string | 活动 ID（设备 ID）| xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

## 典型应用场景

1. **Comanagement 状态诊断** - 查询设备的共同管理状态
2. **工作负载切换追踪** - 追踪工作负载从 SCCM 切换到 Intune 的过程
3. **共管设备问题排查** - 分析共管设备的特定问题

## 示例查询

### 查询设备 Comanagement 事件
```kql
CMService
| where env_time > ago(7d)
| where ActivityId has '{deviceId}'
| order by env_time desc
```

## 关联表

- [DeviceManagementProvider.md](./DeviceManagementProvider.md) - 策略应用状态
- [DeviceLifecycle.md](./DeviceLifecycle.md) - 设备生命周期（type=12 为 Comanaged）

## 注意事项

- Comanagement 场景需要同时查看 SCCM 和 Intune 端日志
- 与 `DeviceLifecycle` 表的 `type=12` (On Premise Comanaged) 关联
- 此表记录较少，可能需要结合其他表进行分析
