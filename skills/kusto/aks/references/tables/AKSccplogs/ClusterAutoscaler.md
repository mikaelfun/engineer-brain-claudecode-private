---
name: ClusterAutoscaler
database: AKSccplogs
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: 集群自动缩放器日志，记录节点池扩缩容决策和操作
status: active
---

# ClusterAutoscaler

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSccplogs |
| 状态 | ✅ 可用 |

## 用途

记录 Kubernetes Cluster Autoscaler 的日志，包含节点池扩缩容决策、操作执行和错误信息。用于诊断自动缩放相关问题。

## 字段列表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| Cloud | string | 云环境 |
| Environment | string | 环境 |
| Host | string | 主机 |
| RPSector | string | RP 扇区 |
| RPTenant | string | RP 租户 |
| Service | string | 服务 |
| Underlay | string | Underlay 标识 |
| UnderlayClass | string | Underlay 类型 |
| UnderlayName | string | Underlay 名称 |
| UnderlaySubscriptionID | string | Underlay 订阅 ID |
| UnderlaySubscriptionIndex | string | Underlay 订阅索引 |
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| SourceNamespace | string | 来源命名空间 |
| SourceMoniker | string | 来源标识 |
| SourceVersion | string | 来源版本 |
| log | string | 日志内容 |
| logPreciseTime | datetime | 日志精确时间 |
| pod | string | Pod 名称 |
| namespace | string | 命名空间（CCP Namespace） |
| containerID | string | 容器 ID |
| container | string | 容器名称 |
| hostMachine | string | 主机名 |
| pod_name | string | Pod 名称 |
| time | datetime | 时间 |
| cluster_id | string | 集群 ID（CCP Namespace） |
| resource_id | string | 资源 ID |

## 常用筛选字段

- `namespace` 或 `cluster_id` - 按 CCP Namespace 筛选
- `PreciseTimeStamp` - 按时间筛选
- `log` - 按日志内容筛选（包含关键词）

## 典型应用场景

1. **诊断扩容失败** - 查找 ScaleUp 失败原因
2. **分析缩容决策** - 理解为何节点被缩容
3. **监控 Autoscaler 健康状态** - 检查 Autoscaler 是否正常工作
4. **查找 Pending Pod** - 分析无法调度的 Pod

## 示例查询

### 查询扩缩容日志
```kql
ClusterAutoscaler
| where PreciseTimeStamp > ago(1d)
| where namespace == "{ccpNamespace}"
| where log contains "scale" or log contains "ScaleUp" or log contains "ScaleDown"
| project PreciseTimeStamp, log
| order by PreciseTimeStamp desc
```

### 查询扩容失败
```kql
ClusterAutoscaler
| where PreciseTimeStamp > ago(1d)
| where namespace == "{ccpNamespace}"
| where log contains "failed" or log contains "error" or log contains "Error"
| project PreciseTimeStamp, log
| order by PreciseTimeStamp desc
```

### 查询 Pending Pod 相关日志
```kql
ClusterAutoscaler
| where PreciseTimeStamp > ago(1d)
| where namespace == "{ccpNamespace}"
| where log contains "unschedulable" or log contains "Pending"
| project PreciseTimeStamp, log
| order by PreciseTimeStamp desc
```

## 关联表

- [AKSKubeEvents.md](./AKSKubeEvents.md) - Kubernetes 事件
- [ControlPlaneEvents.md](./ControlPlaneEvents.md) - 控制平面日志

## 注意事项

- 此表在 AKSccplogs 数据库，需要先从 ManagedClusterSnapshot 获取 CCP Namespace
- `log` 字段包含原始日志内容，需要使用 `contains` 或正则表达式过滤
- 扩缩容操作可能跨越较长时间，查询时建议增大时间范围
