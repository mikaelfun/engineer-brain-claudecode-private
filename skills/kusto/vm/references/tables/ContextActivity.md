---
name: ContextActivity
database: crp_allmc
cluster: https://azcrpmc.kusto.chinacloudapi.cn
description: CRP 上下文活动日志，记录操作的详细执行过程
status: active
---

# ContextActivity

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcrpmc.kusto.chinacloudapi.cn |
| 数据库 | crp_allmc |
| 状态 | ✅ 可用 |

## 用途

记录 CRP 操作的详细执行日志，包含每个步骤的消息、追踪码、时间戳等。是深入排查 CRP 问题的核心表。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| TIMESTAMP | datetime | 时间戳 |
| activityId | string | 活动 ID (对应 ApiQosEvent.operationId) |
| subscriptionId | string | 订阅 ID |
| message | string | 详细消息内容 |
| traceCode | string | 追踪码 |
| traceLevel | int | 追踪级别 (Info/Warning/Error) |
| callerName | string | 调用者名称 |
| sourceFile | string | 源文件 |
| lineNumber | int | 行号 |
| logicalTimeStamp | string | 逻辑时间戳 |
| goalStateResourceId | string | Goal State 资源 ID |
| Node | string | 节点信息 |

## 常用筛选字段

- `activityId` - 按活动 ID 筛选 (必需)
- `subscriptionId` - 按订阅筛选
- `traceLevel` - 按追踪级别筛选
- `message` - 按消息内容筛选

## 典型应用场景

1. **详细执行日志** - 查看操作的每个步骤
2. **错误定位** - 筛选 error/failed 消息定位问题
3. **Extension 问题** - 筛选 extension 相关消息
4. **Boot Diagnostics** - 筛选 BootDiagnostics 消息

## 示例查询

### 基础查询

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP > ago(4h)
| where activityId == "{operationId}"
| project PreciseTimeStamp, message, traceCode
| order by PreciseTimeStamp asc
```

### 查询失败消息

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP > ago(3d)
| where activityId == "{operationId}"
| where message contains "failed" or message contains "error"
| project PreciseTimeStamp, message, traceCode, traceLevel
| order by PreciseTimeStamp asc
```

### 联合查询 ContextActivity 和 VmssVMGoalSeekingActivity

```kql
union cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity, 
      cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssVMGoalSeekingActivity
| where TIMESTAMP > ago(1d)
| where subscriptionId has '{sub}'
| where activityId contains "{operationId}"
| where traceLevel < 3
| project TIMESTAMP, traceLevel, message, callerName
| order by TIMESTAMP asc
```

### 查询 Extension 相关日志

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP > ago(3d)
| where activityId == "{operationId}"
| where message contains "extension" or message contains "Extension"
| project PreciseTimeStamp, message, traceCode
| order by PreciseTimeStamp asc
```

### 查询 Boot Diagnostics 日志

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP > ago(3d)
| where subscriptionId == "{sub}"
| where activityId == "{operationId}"
| where message contains "BootDiagnostics" or message contains "boot diagnostics"
| project PreciseTimeStamp, message, traceCode
| order by PreciseTimeStamp asc
```

## 关联表

- [ApiQosEvent.md](./ApiQosEvent.md) - 获取 operationId
- [VmssVMGoalSeekingActivity.md](./VmssVMGoalSeekingActivity.md) - VMSS 实例日志

## 注意事项

- 必须使用 `activityId` 筛选，该值来自 ApiQosEvent 的 `operationId`
- 数据保留时间有限，建议及时查询
- 对于 VMSS 操作，可联合 VmssVMGoalSeekingActivity 获取更完整信息
