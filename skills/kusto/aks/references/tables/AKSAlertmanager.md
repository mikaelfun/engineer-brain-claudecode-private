---
name: AKSAlertmanager
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: AKS 告警管理器，记录集群健康告警和 Konnectivity 探针状态
status: active
---

# AKSAlertmanager

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 AKS 集群的告警信息，包括 Resource Health 告警、节点不可达告警、Konnectivity 探针状态等。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| resource_id | string | 集群资源 ID |
| cluster_id | string | CCP 命名空间 |
| namespace | string | CCP 命名空间（别名） |
| alertname | string | 告警名称 |
| status | string | 告警状态 |
| severity | string | 严重程度 (critical/warning) |
| description | string | 描述 |
| summary | string | 摘要 |
| area | string | 告警区域 (controlplane/node/monitoring 等) |
| node | string | 相关节点 |
| startsAt | datetime | 告警开始时间 |
| endsAt | datetime | 告警结束时间 |
| log | string | 日志信息 |
| pod | string | 相关 Pod |
| RPTenant | string | RP 租户 |

## 常见告警类型

| 告警名称 | 说明 |
|----------|------|
| AgentNodesUnreachable | 节点不可达 |
| KonnectivityProbeFailure | Konnectivity 探针失败 |
| APIServerDown | API Server 不可用 |
| ControlPlaneComponentUnhealthy | 控制平面组件不健康 |

## 告警区域 (area)

| 区域 | 说明 |
|------|------|
| controlplane | 控制平面相关告警 |
| node | 节点相关告警 |
| monitoring | 监控相关告警 |
| partneraddon | Partner Addon 告警 |
| systemaddon | 系统 Addon 告警 |

## 典型应用场景

1. **排查 Portal Resource Health 告警** - 查看告警详情
2. **监控节点不可达** - AgentNodesUnreachable 告警
3. **检查 Konnectivity 探针** - 控制平面到节点的连接状态
4. **告警趋势分析** - 按时间统计告警

## 示例查询

### 查询 Konnectivity 探针告警
```kql
AKSAlertmanager
| where namespace == "{ccpNamespace}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where alertname == "AgentNodesUnreachable"
| summarize dcount(resource_id) by bin(PreciseTimeStamp, 15min), RPTenant
| render areachart
```

### 查询集群所有告警
```kql
AKSAlertmanager
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where cluster_id == "{ccpNamespace}" and severity in ('critical', 'warning')
| project PreciseTimeStamp, startsAt, endsAt, status, alertname, area, severity, node
| summarize cnt = count(), nodes = make_set_if(node, isnotempty(node)) 
         by bin(PreciseTimeStamp, 5m), alertname, startsAt, endsAt, status, area, severity
| where cnt > 0
```

### 按区域汇总告警
```kql
let qFrom = datetime('{startDate}');
let qTo = datetime('{endDate}');
let qCCP = '{ccpNamespace}';
AKSAlertmanager
| where PreciseTimeStamp between (qFrom .. qTo)
| where cluster_id == qCCP and severity in ('critical', 'warning')
| summarize 
    warnings = countif(severity == 'warning'), 
    criticals = countif(severity == 'critical')
    by area
```

## 关联表

- [ControlPlaneEvents.md](./ControlPlaneEvents.md) - 控制平面日志

## 注意事项

- `cluster_id` 和 `namespace` 都可用于按 CCP 命名空间筛选
- 告警可能有开始时间 (startsAt) 和结束时间 (endsAt)
- 与控制平面日志结合分析可获取更完整的诊断信息
