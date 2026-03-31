---
name: AKSKubeEvents
database: AKSccplogs
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: Kubernetes 集群事件，记录节点、Pod 等对象的事件
status: active
---

# AKSKubeEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSccplogs |
| 状态 | ✅ 可用 |

## 用途

记录 Kubernetes 集群事件，包括节点状态变化、Pod 调度、组件事件等。类似于 `kubectl get events` 的输出。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| logPreciseTime | string | 日志精确时间 |
| cluster_id | string | CCP 命名空间 |
| namespace | string | 事件所属命名空间 |
| eventNamespace | string | 事件命名空间 |
| name | string | 对象名称 |
| kind | string | 对象类型 (Node/Pod/Deployment 等) |
| type | string | 事件类型 (Normal/Warning) |
| reason | string | 事件原因 |
| message | string | 事件消息 |
| reportingController | string | 报告控制器 |
| reportingInstance | string | 报告实例 |

## 常见事件原因 (reason)

| 原因 | 说明 |
|------|------|
| NodeReady | 节点就绪 |
| NodeNotReady | 节点未就绪 |
| KubeletIsDown | Kubelet 宕机 |
| ContainerRuntimeIsDown | 容器运行时宕机 |
| Scheduled | Pod 已调度 |
| FailedScheduling | 调度失败 |
| Pulling | 拉取镜像中 |
| Pulled | 镜像已拉取 |
| Created | 容器已创建 |
| Started | 容器已启动 |

## 典型应用场景

1. **查询节点事件** - 追踪节点状态变化
2. **分析 Pod 调度** - 查看调度和启动过程
3. **诊断 NotReady 节点** - 分析节点不健康原因
4. **监控组件事件** - 查看 kube-system 组件状态

## 示例查询

### 查询节点事件
```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qNode = '{nodeName}';
let qCCP = '{ccpNamespace}';
AKSKubeEvents
| where PreciseTimeStamp between (qFrom .. qTo)
| where cluster_id == qCCP
| where name =~ qNode or reportingInstance has qNode or message has qNode
| extend level = type
| project PreciseTimeStamp, logPreciseTime, reason, reportingController, reportingInstance, 
         namespace, name, message, level
| top 2000 by PreciseTimeStamp asc
```

### 查询 NodeNotReady 事件
```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qCCP = '{ccpNamespace}';
AKSKubeEvents
| where PreciseTimeStamp between (qFrom .. qTo) and cluster_id == qCCP
| where reason in ('NodeNotReady', 'NodeReady')
| where message !has "Timeout when running plugin"
| extend node = coalesce(reportingInstance, name)
| project StartTime = PreciseTimeStamp, reason, node
| where reason == "NodeNotReady" 
| order by node asc, StartTime asc
```

### 查询节点和 Pod 活动
```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qCCP = '{ccpNamespace}';
let qNode = '{nodeName}';
AKSKubeEvents
| where PreciseTimeStamp between (qFrom .. qTo)
| where cluster_id == qCCP
| where name =~ qNode or reportingInstance has qNode
| where message !has "Timeout when running plugin" and message !has "IMDS query failed"
| extend level = type, what = ['kind']
| project PreciseTimeStamp, logPreciseTime, reason, reportingController, reportingInstance, 
         namespace, name, message, level, what, eventNamespace
| order by PreciseTimeStamp asc
| extend Health = case (
    level == 'Error' or message has_any ('NodeNotReady'), 'error',
    reason has_any ('KubeletIsDown', 'ContainerRuntimeIsDown'), 'error',
    level == 'Warning' or message contains "is now: Unknown", 'degraded',
    level == 'Normal', 'healthy', 
    'healthy'
)
| project PreciseTimeStamp, reason, name, message, level, Health, what
| top 5000 by PreciseTimeStamp asc
```

## 关联表

- [ControlPlaneEvents.md](./ControlPlaneEvents.md) - 控制平面日志
- [KubeAudit.md](./KubeAudit.md) - Kubernetes 审计日志

## 注意事项

- `cluster_id` 用于按 CCP 命名空间筛选
- `type` 字段值为 "Normal" 或 "Warning"
- 过滤常见噪音消息可提高查询效率
