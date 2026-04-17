---
name: OverlaymgrEvents
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: CCP Overlay 管理器事件，记录控制平面组件事件
status: active
---

# OverlaymgrEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 CCP (Cloud Control Plane) 组件的事件，包括 Pod 事件、组件状态变化等。用于诊断控制平面问题。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| id | string | CCP 命名空间 |
| namespace | string | CCP 命名空间（别名） |
| operationID | string | 操作 ID |
| level | string | 日志级别 |
| msg | string | 消息内容 |
| eventObjectName | string | 事件对象名称 |
| eventReason | string | 事件原因 |
| eventMessage | string | 事件消息 |
| eventKind | string | 事件类型 |
| logPreciseTime | string | 日志精确时间 |

## 常用筛选字段

- `id` / `namespace` - 按 CCP 命名空间筛选
- `operationID` - 按操作 ID 筛选
- `eventReason` - 按事件原因筛选
- `level` - 按日志级别筛选

## 典型应用场景

1. **收集 CCP Pod 事件** - 查看控制平面 Pod 状态
2. **诊断控制平面问题** - 分析事件时间线
3. **追踪组件错误** - 查看警告和错误事件

## 示例查询

### 按 OperationID 查询
```kql
OverlaymgrEvents
| where TIMESTAMP >= ago(1d)
| where operationID contains "{operationId}"
| project PreciseTimeStamp, level, msg
```

### 查询集群事件时间线
```kql
let clusterVersion = "{ccpNamespace}";
let queryFrom = datetime({startTime});
let queryTo = datetime({endTime});
OverlaymgrEvents
| where PreciseTimeStamp >= queryFrom and (isnull(queryTo) or PreciseTimeStamp < queryTo)
| where id == clusterVersion
| where isnotempty(eventObjectName) and isnotempty(eventReason)
| extend StartTime = todatetime(logPreciseTime)
| project StartTime, eventObjectName, eventReason, eventMessage
| order by StartTime asc
```

### 查询警告和错误事件
```kql
let queryCluster = "{ccpNamespace}";
let queryFrom = datetime("{startTime}");
let queryTo = datetime("{endTime}");
let general = OverlaymgrEvents
| where PreciseTimeStamp between (queryFrom .. queryTo)
| where id == queryCluster
| where isempty(eventObjectName) and isempty(eventReason) and level != 'info'
| extend StartTime = todatetime(logPreciseTime)
| extend Pod = '', Reason = 'General Warnings', Message = msg, Kind = ''
| project StartTime, Pod, Kind, Reason, Message, level;
OverlaymgrEvents
| where PreciseTimeStamp between (queryFrom .. queryTo)
| where id == queryCluster
| where eventReason !in ('Pulling', 'Pulled', 'Created', "na")
| where isnotempty(eventObjectName) and isnotempty(eventReason)
| extend StartTime = todatetime(logPreciseTime)
| extend Pod = eventObjectName, Reason = eventReason, Message = eventMessage, Kind = eventKind
| project StartTime, Pod, Kind, Reason, Message, Level = level
| union (general)
| order by StartTime desc
```

### 收集 CCP Pod 日志事件
```kql
let eventsToIgnore = dynamic(["SuccessfulCreate", "Scheduled", "Pulled", "Pulling", "Created"]);
let maxMessageLength = 52;
OverlaymgrEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where namespace == "{ccpNamespace}"
| where isnotempty(eventObjectName) and isnotempty(eventReason) and eventReason !in (eventsToIgnore)
| extend StartTime = todatetime(logPreciseTime)
| extend Content = strcat(eventReason, " - ", eventObjectName, "<br/>", substring(eventMessage, 0, maxMessageLength))
| project StartTime, Content, Tooltip = eventMessage
| distinct StartTime, Content, Tooltip
| order by StartTime asc
| where Tooltip != "na"
```

## 关联表

- [ControlPlaneEvents.md](./ControlPlaneEvents.md) - 控制平面日志

## 注意事项

- `id` 和 `namespace` 字段都可用于按 CCP 命名空间筛选
- 过滤常见的正常事件（如 Pulling, Pulled, Created）可减少噪音
- `logPreciseTime` 是字符串格式，需要 `todatetime()` 转换
