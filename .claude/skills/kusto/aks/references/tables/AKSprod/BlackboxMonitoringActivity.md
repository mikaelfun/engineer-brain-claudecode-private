---
name: BlackboxMonitoringActivity
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: AKS 黑盒监控活动，记录集群健康状态、节点就绪性、自动缩放器事件和资源约束
status: deprecated
---

# BlackboxMonitoringActivity

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ⚠️ 已弃用 (仍可查询历史数据) |

## 用途

记录 AKS 集群的黑盒监控活动，包括节点健康状态检查、集群自动缩放器事件、资源约束检测（如 Pod 不可调度）等。此表已弃用，部分功能已迁移到 `ClusterAutoscalerQosEvents` 等表。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| TIMESTAMP | datetime | 时间戳 |
| subscriptionID | string | 订阅 ID |
| resourceGroupName | string | 资源组名称 |
| resourceName | string | 集群名称 |
| fqdn | string | 集群 FQDN (如 xxxx.hcp.eastus2.azmk8s.io) |
| state | string | 监控状态 (如 Overloaded, Healthy 等) |
| reason | string | 原因 (如 clusterautoscaler, nodenotready 等) |
| msg | string | 详细消息 |

## 常用筛选字段

- `subscriptionID` - 按订阅筛选
- `resourceGroupName` - 按资源组筛选
- `resourceName` - 按集群名称筛选
- `fqdn` - 按集群 FQDN 筛选
- `state` - 按监控状态筛选
- `reason` - 按原因筛选
- `PreciseTimeStamp` - 按时间筛选

## 典型应用场景

1. **检查 AKS Remediator 日志** - 查看 Remediator 尝试修复问题的记录
2. **排查集群自动缩放器问题** - 查看 autoscaler 事件和决策
3. **检测资源约束** - Pod 不可调度 (Insufficient cpu/memory)
4. **监控节点就绪状态** - 查看节点 NotReady 相关事件

## 示例查询

### 查询 Remediator 活动
```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').BlackboxMonitoringActivity
| where PreciseTimeStamp >= datetime({startDate})
| where fqdn == "{fqdn}"
| where state != "Healthy"
| project PreciseTimeStamp, resourceName, state, reason, msg
| order by PreciseTimeStamp desc
| take 100
```

### 查询资源约束 (Overloaded)
```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').BlackboxMonitoringActivity
| where state == "Overloaded"
| where subscriptionID == "{subscription}"
| where resourceGroupName == "{resourceGroup}"
| project TIMESTAMP, resourceName, resourceGroupName, state, reason, msg
| order by TIMESTAMP desc
```

### 查询集群自动缩放器事件
```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').BlackboxMonitoringActivity
| where PreciseTimeStamp > ago(5d)
| where fqdn == "{fqdn}"
| where reason startswith("clusterautoscaler")
| project PreciseTimeStamp, reason, msg
| limit 1000
```

## 关联表

- [AKSAlertmanager.md](./AKSAlertmanager.md) - 告警信息（推荐替代）
- [ClusterAutoscaler.md](./ClusterAutoscaler.md) - 集群自动缩放器日志（AKSccplogs，推荐替代 autoscaler 相关查询）
- [RemediatorEvent.md](./RemediatorEvent.md) - 补救器事件（推荐替代 Remediator 相关查询）

## 注意事项

- ⚠️ **此表已弃用**，将来可能被移除，仍可查询历史数据
- 集群自动缩放器问题建议优先使用 `ClusterAutoscalerQosEvents` 或 `ClusterAutoscaler` 表
- Remediator 相关问题建议优先使用 `RemediatorEvent` 表
- 节点健康告警建议优先使用 `AKSAlertmanager` 表
