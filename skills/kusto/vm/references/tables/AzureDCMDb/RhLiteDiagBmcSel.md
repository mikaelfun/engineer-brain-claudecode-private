---
name: RhLiteDiagBmcSel
database: AzureDCMDb
cluster: https://azuredcmmc.kusto.chinacloudapi.cn
description: BMC SEL 诊断数据（LiteDiag 格式），记录 BMC 系统事件日志
status: active
---

# RhLiteDiagBmcSel

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azuredcmmc.kusto.chinacloudapi.cn |
| 数据库 | AzureDcmDb |
| 表名 | RhLiteDiagBmcSelKustoDirect |
| 状态 | ✅ 可用 |

## 用途

以 LiteDiag 格式存储的 BMC SEL 数据，与 RhwChassisSelItemEtwTable 互补。包含诊断 ID 用于追踪诊断会话。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | |
| ClusterName | string | 集群名称 | |
| BladeId | string | 刀片/节点 ID | |
| Severity | string | 严重级别 | |
| Sensor | string | 传感器名称 | |
| EventType | string | 事件类型 | |
| Details | string | 事件详情 | |
| TimeStamp | datetime | SEL 事件时间 | |
| DiagResultId | string | 诊断结果 ID | |
| ResourceId | string | 资源 ID | |

## 常用筛选字段

- `BladeId` / `ResourceId` - 按节点筛选
- `ClusterName` - 按集群筛选
- `Severity` - 按严重级别筛选

## 示例查询

```kql
RhLiteDiagBmcSelKustoDirect
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where BladeId == "{nodeId}" or ResourceId has "{nodeId}"
| project TimeStamp, Severity, Sensor, EventType, Details
| order by TimeStamp desc
```

## 关联表

- [RhwChassisSelItemEtwTable.md](./RhwChassisSelItemEtwTable.md) - 机箱 SEL 事件
- [dcmInventoryComponentSystemDirect.md](./dcmInventoryComponentSystemDirect.md) - 系统硬件清单
