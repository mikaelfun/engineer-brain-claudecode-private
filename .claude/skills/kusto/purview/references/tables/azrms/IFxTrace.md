---
name: IFxTrace
database: azrms
cluster: https://azrmsmc.kusto.chinacloudapi.cn
description: RMS 跟踪日志，记录详细的调试信息
status: active
---

# IFxTrace

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azrmsmc.kusto.chinacloudapi.cn |
| 数据库 | azrms |
| 状态 | ✅ 可用 |

## 用途

记录 Azure RMS 的详细跟踪日志，用于深度调试和问题诊断。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间 |
| traceData | string | 跟踪数据（详细日志内容） |
| correlationId | string | 关联 ID |
| processId | long | 进程 ID |
| threadId | long | 线程 ID |
| region | string | 区域 |
| level | long | 日志级别 |
| eventId | long | 事件 ID |
| traceId | string | 跟踪 ID |
| spanId | string | Span ID |
| parentSpanId | string | 父 Span ID |
| hostEnvironment | string | 主机环境 |

## 常用筛选字段

- `correlationId` - 按请求关联 ID 筛选
- `level` - 按日志级别筛选
- `traceData` - 搜索特定内容

## 示例查询

### 按 correlationId 查询跟踪日志
```kql
cluster('azrmsmc.kusto.chinacloudapi.cn').database('azrms').IFxTrace
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where correlationId =~ "{correlationId}"
| project env_time, level, traceData, region
| order by env_time asc
```

## 关联表

- [IFxRequestLogEvent.md](./IFxRequestLogEvent.md) - MIP 请求日志

## 注意事项

- 通常与 IFxRequestLogEvent 配合使用，先从 IFxRequestLogEvent 获取 correlationId，再查询详细跟踪
