---
name: KubeControllerManager
database: AKSccplogs
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: Kube Controller Manager 日志，记录控制器管理器操作和错误
status: active
related_tables:
  - CloudControllerManager
---

# KubeControllerManager

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSccplogs |
| 状态 | ✅ 可用 |

## 用途

记录 Kubernetes Controller Manager 的详细日志，用于诊断控制器相关问题，如节点控制器、Pod GC 等。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| cluster_id | string | CCP 命名空间 |
| log | string | 日志内容 |
| pod | string | Pod 名称 |

## 典型应用场景

1. **诊断节点控制器问题** - 节点状态同步、Taint 管理
2. **分析 Pod 清理** - Pod GC 操作
3. **排查 ReplicaSet 问题** - 副本同步错误
4. **监控 Endpoint 更新** - Service Endpoint 同步

## 示例查询

### 查询控制器管理器错误
```kql
let queryNamespace = '{ccpNamespace}';
let queryFrom = datetime('{startDate}');
let queryTo = datetime('{endDate}');
let queryNode = '{nodeName}';
union 
    KubeControllerManager,
    CloudControllerManager
| where PreciseTimeStamp between (queryFrom .. queryTo) 
| where cluster_id == queryNamespace 
| where isempty(queryNode) or log has queryNode
| where pod !contains "-master-"
| extend level = case(log startswith 'E', 'error', log startswith 'W', 'warning', '')
| extend log_message = tostring(split(log, ']')[1])
| summarize min_date = min(PreciseTimeStamp), max_date = max(PreciseTimeStamp), hits = count() 
         by log_message, pod, level
| project min_date, max_date, hits, pod, message = log_message, level
| top 2500 by min_date desc
```

### 查询特定节点相关日志
```kql
KubeControllerManager
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where cluster_id == "{ccpNamespace}"
| where log has "{nodeName}"
| project PreciseTimeStamp, log, pod
| sort by PreciseTimeStamp desc
```

### 统计错误日志
```kql
KubeControllerManager
| where PreciseTimeStamp > ago(1d)
| where cluster_id == "{ccpNamespace}"
| where log startswith 'E'
| extend log_message = tostring(split(log, ']')[1])
| summarize count() by log_message
| top 20 by count_
```

## 日志级别判断

日志行首字符表示级别：
- `E` - Error
- `W` - Warning
- `I` - Info

## 关联表

- [CloudControllerManager.md](./CloudControllerManager.md) - 云控制器管理器日志
- [ControlPlaneEvents.md](./ControlPlaneEvents.md) - 控制平面事件

## 注意事项

- 日志格式为原始文本，需要解析
- 过滤 `-master-` Pod 可排除主节点相关噪音
- 与 CloudControllerManager 联合查询可获取完整控制器日志
