---
name: CPRemediatorLogs
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: AKS 控制平面补救器日志，记录控制平面自动修复操作
status: active
related_tables:
  - RemediatorEvent
---

# CPRemediatorLogs

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 AKS 控制平面补救器的详细日志，包括 Deprecated APIs 检测、配置更新等。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| namespace | string | CCP 命名空间 |
| msg | string | 消息内容 |

## 典型应用场景

1. **查询 Deprecated APIs** - 检测集群使用的已弃用 API
2. **追踪 ConfigMap 更新** - 查看配置更新操作
3. **分析控制平面修复** - 了解自动修复详情

## 示例查询

### 查询 Deprecated APIs
```kql
CPRemediatorLogs
| project msg, PreciseTimeStamp, namespace
| where namespace == "{ccpNamespace}"
| where msg contains "Update configMap from alert" and msg contains "requestedDeprecatedApis" 
      and msg contains "1.27"
| order by PreciseTimeStamp desc
| take 1
```

### 查询控制平面补救日志
```kql
CPRemediatorLogs
| where PreciseTimeStamp > ago(1d)
| where namespace == "{ccpNamespace}"
| project PreciseTimeStamp, msg
| sort by PreciseTimeStamp desc
```

## 关联表

- [RemediatorEvent.md](./RemediatorEvent.md) - 补救器事件

## 注意事项

- 此表主要用于 Deprecated APIs 检测
- 结合 `RemediatorEvent` 可获取更完整的补救信息
