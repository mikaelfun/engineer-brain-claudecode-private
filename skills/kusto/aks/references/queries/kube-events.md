---
name: kube-events
description: Kubernetes 事件查询
tables:
  - AKSKubeEvents
parameters:
  - name: ccpNamespace
    required: true
    description: CCP 命名空间
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
  - name: nodeName
    required: false
    description: 节点名称
---

# Kubernetes 事件查询

## 用途

查询 Kubernetes 集群事件，包括节点状态变化、Pod 调度、组件事件等。类似于 `kubectl get events`。

---

## 查询 1: 查询节点事件

### 用途
获取特定节点的所有事件。

### 查询语句

```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qNode = '{nodeName}';
let qCCP = '{ccpNamespace}';
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').AKSKubeEvents
| where PreciseTimeStamp between (qFrom .. qTo)
| where cluster_id == qCCP
| where name =~ qNode or reportingInstance has qNode or message has qNode
| extend level = type
| project PreciseTimeStamp, logPreciseTime, reason, reportingController, reportingInstance, 
         namespace, name, message, level
| top 2000 by PreciseTimeStamp asc
```

---

## 查询 2: 查询 NodeNotReady 事件

### 用途
查找节点不可用的事件。

### 查询语句

```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qCCP = '{ccpNamespace}';
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').AKSKubeEvents
| where PreciseTimeStamp between (qFrom .. qTo) and cluster_id == qCCP
| where reason in ('NodeNotReady', 'NodeReady')
| where message !has "Timeout when running plugin"
| extend node = coalesce(reportingInstance, name)
| project StartTime = PreciseTimeStamp, reason, node
| where reason == "NodeNotReady" 
| order by node asc, StartTime asc
```

---

## 查询 3: 节点和 Pod 活动信息

### 用途
获取节点相关的所有活动，包括 Pod 事件。

### 查询语句

```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qCCP = '{ccpNamespace}';
let qNode = '{nodeName}';
let qNodeOnly = False;
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').AKSKubeEvents
| where PreciseTimeStamp between (qFrom .. qTo)
| where cluster_id == qCCP
| where name =~ qNode or reportingInstance has qNode
| where message !has "Timeout when running plugin" and message !has "IMDS query failed"
| extend level = type, what = ['kind']
| where not(qNodeOnly) or (qNodeOnly and what == 'Node')
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

---

## 查询 4: Warning 事件统计

### 用途
统计集群中的 Warning 事件。

### 查询语句

```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qCCP = '{ccpNamespace}';
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').AKSKubeEvents
| where PreciseTimeStamp between (qFrom .. qTo)
| where cluster_id == qCCP
| where type == "Warning"
| summarize count() by reason
| sort by count_ desc
| take 20
```

---

## 查询 5: 特定 Pod 事件

### 用途
查询特定 Pod 的事件。

### 查询语句

```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qCCP = '{ccpNamespace}';
let qPod = '{podName}';
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSccplogs').AKSKubeEvents
| where PreciseTimeStamp between (qFrom .. qTo)
| where cluster_id == qCCP
| where name contains qPod or message has qPod
| project PreciseTimeStamp, reason, name, namespace, message, type
| sort by PreciseTimeStamp desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| reason | 事件原因 |
| type | 事件类型 (Normal/Warning) |
| message | 事件消息 |
| reportingController | 报告控制器 |
| reportingInstance | 报告实例 |

## 常见事件原因

| 原因 | 说明 |
|------|------|
| NodeReady | 节点就绪 |
| NodeNotReady | 节点未就绪 |
| KubeletIsDown | Kubelet 宕机 |
| Scheduled | Pod 已调度 |
| FailedScheduling | 调度失败 |
| Pulling/Pulled | 拉取镜像 |
| Created/Started | 容器创建/启动 |
| Killing | 终止容器 |

## 关联查询

- [controlplane-logs.md](./controlplane-logs.md) - 控制平面日志
- [pod-restart-analysis.md](./pod-restart-analysis.md) - Pod 重启分析
