---
name: ExtensionManagerConfigAgentTraces
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: Extension Manager 配置代理跟踪日志
status: active
---

# ExtensionManagerConfigAgentTraces

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 Extension Manager 配置代理的跟踪日志，用于诊断 AKS 扩展 (Extensions) 相关问题，如 Flux、Azure Policy 等扩展的配置和运行问题。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| namespace | string | CCP Namespace |
| Message | string | 消息内容 |
| LogLevel | string | 日志级别 (Information/Warning/Error) |
| LogType | string | 日志类型 |
| container | string | 容器名称 |
| pod | string | Pod 名称 |
| ArmId | string | ARM 资源 ID |
| AgentName | string | 代理名称 |
| AgentVersion | string | 代理版本 |
| CorrelationId | string | 关联 ID |
| log | string | 原始日志内容 |

## 常用筛选字段

- `namespace` - 按 CCP Namespace 筛选
- `LogLevel` - 按日志级别筛选
- `container` - 按容器名称筛选
- `Message` 或 `log` - 按日志内容筛选

## 典型应用场景

1. **诊断扩展安装失败** - 查找扩展配置代理错误
2. **Flux 扩展问题** - 分析 GitOps 配置问题
3. **Azure Policy 扩展** - 诊断策略应用问题

## 示例查询

### 查询扩展错误日志
```kql
ExtensionManagerConfigAgentTraces
| where PreciseTimeStamp between(datetime({starttime}) .. datetime({endtime}))
| where namespace == "{ccpNamespace}"
| where container != "msi-adapter"
| where LogLevel != "Information"
| extend msg = iff(Message != "na", Message, log)
| extend msg = replace_regex(msg, "^\\d{4}/\\d{2}/\\d{2} \\d{2}:\\d{2}:\\d{2} ", "")
| project PreciseTimeStamp, msg, LogLevel, container, pod
| summarize count=count() by binTime=bin(PreciseTimeStamp, 30m), msg, LogLevel, container, pod
| project binTime, LogLevel, count, msg, container, pod
| order by binTime desc, count desc 
```

### 查询特定容器的日志
```kql
ExtensionManagerConfigAgentTraces
| where PreciseTimeStamp > ago(1d)
| where namespace == "{ccpNamespace}"
| where container == "flux-controller"
| where LogLevel in ("Warning", "Error")
| project PreciseTimeStamp, LogLevel, Message, log
| order by PreciseTimeStamp desc
```

## 关联表

- [ManagedClusterSnapshot.md](./ManagedClusterSnapshot.md) - 检查 extensionAddonProfiles
- [OverlaymgrEvents.md](./OverlaymgrEvents.md) - Overlay 管理器事件

## 注意事项

- 需要先从 ManagedClusterSnapshot 获取 CCP Namespace
- `Message` 和 `log` 字段可能包含不同格式的日志内容
- 过滤掉 `msi-adapter` 容器可以减少噪音
