---
name: alertmanager
description: AKS 告警管理器查询
tables:
  - AKSAlertmanager
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
---

# AKS 告警管理器查询

## 用途

查询 AKS 集群的健康告警，包括节点不可达、Konnectivity 探针失败、控制平面组件问题等。

---

## 查询 1: 查询 Konnectivity 探针告警

### 用途
监控节点不可达告警（AgentNodesUnreachable）。

### 查询语句

```kql
let _ccpNamespace = "{ccpNamespace}";
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AKSAlertmanager
| where namespace == _ccpNamespace
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where alertname == "AgentNodesUnreachable"
| summarize dcount(resource_id) by bin(PreciseTimeStamp, 15min), RPTenant
| render areachart
```

---

## 查询 2: 查询所有告警

### 用途
查看集群的所有告警。

### 查询语句

```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qCCP = '{ccpNamespace}';
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AKSAlertmanager
| where PreciseTimeStamp between (qFrom .. qTo)
| where cluster_id == qCCP and severity in ('critical', 'warning')
| project PreciseTimeStamp, startsAt, endsAt, status, alertname, area, severity, node
| summarize cnt = count(), nodes = make_set_if(node, isnotempty(node)) 
         by bin(PreciseTimeStamp, 5m), alertname, startsAt, endsAt, status, area, severity
| where cnt > 0
```

---

## 查询 3: 按区域汇总告警

### 用途
按告警区域统计告警数量。

### 查询语句

```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qCCP = '{ccpNamespace}';
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AKSAlertmanager
| where PreciseTimeStamp between (qFrom .. qTo)
| where cluster_id == qCCP and severity in ('critical', 'warning')
| summarize 
    warnings = countif(severity == 'warning'), 
    criticals = countif(severity == 'critical')
    by area
| order by criticals desc, warnings desc
```

---

## 查询 4: 告警时间线

### 用途
生成告警时间线视图。

### 查询语句

```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qCCP = '{ccpNamespace}';
let qArea = '';
let alerts = cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AKSAlertmanager
| where PreciseTimeStamp between (qFrom .. qTo)
| where cluster_id == qCCP and severity in ('critical', 'warning')
| where isempty(qArea) or (isnotempty(qArea) and area == qArea)
| project PreciseTimeStamp, startsAt, endsAt, status, alertname, area, severity, node
| summarize cnt = count(), nodes = make_set_if(node, isnotempty(node)) 
         by bin(PreciseTimeStamp, 5m), alertname, startsAt, endsAt, status, area, severity
| where cnt > 0;
let areas = datatable (PreciseTimeStamp:datetime, alertname:string, area:string, severity:string, description:string) [
    datetime(null), '', 'controlplane', '', '',
    datetime(null), '', 'monitoring', '', '',
    datetime(null), '', 'node', '', '',
    datetime(null), '', 'partneraddon', '', '',
    datetime(null), '', 'systemaddon', '', '',
];
let defaultTimeline = areas 
| extend PreciseTimeStamp = qFrom
| where isempty(qArea) or (isnotempty(qArea) and area == qArea)
| make-series count() default=0 on PreciseTimeStamp in range(qFrom, qTo, 5m) by alertname, area, severity, description
| project-away count_
| mv-expand PreciseTimeStamp to typeof(datetime);
defaultTimeline
| join kind=leftouter (alerts) on PreciseTimeStamp, $left.area == $right.area
| extend area = coalesce(area, area1)
| extend alertname = coalesce(alertname, alertname1)
| extend severity = coalesce(severity, severity1)
| project-away *1, description
| summarize 
    all = make_set_if(alertname, isnotempty(alertname)),
    warnings = make_set_if(alertname, severity == 'warning'), 
    criticals = make_set_if(alertname, severity == 'critical'), 
    nodes = make_set(nodes),
    take_any(startsAt, endsAt) 
    by PreciseTimeStamp, area
| project PreciseTimeStamp, area, all, warnings, criticals, nodes
```

---

## 查询 5: 特定告警详情

### 用途
查看特定类型告警的详细信息。

### 查询语句

```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qCCP = '{ccpNamespace}';
let qAlertName = '{alertName}';
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AKSAlertmanager
| where PreciseTimeStamp between (qFrom .. qTo)
| where cluster_id == qCCP
| where alertname == qAlertName
| project PreciseTimeStamp, alertname, status, severity, node, description, summary
| sort by PreciseTimeStamp desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| alertname | 告警名称 |
| severity | 严重程度 (critical/warning) |
| area | 告警区域 |
| status | 告警状态 |
| startsAt | 告警开始时间 |
| endsAt | 告警结束时间 |
| node | 相关节点 |

## 常见告警类型

| 告警 | 说明 |
|------|------|
| AgentNodesUnreachable | 节点不可达 |
| KonnectivityProbeFailure | Konnectivity 探针失败 |
| APIServerDown | API Server 不可用 |
| ControlPlaneComponentUnhealthy | 控制平面组件不健康 |

## 告警区域

| 区域 | 说明 |
|------|------|
| controlplane | 控制平面 |
| node | 节点 |
| monitoring | 监控 |
| partneraddon | Partner Addon |
| systemaddon | 系统 Addon |

## 关联查询

- [controlplane-logs.md](./controlplane-logs.md) - 控制平面日志
- [kube-events.md](./kube-events.md) - Kubernetes 事件
