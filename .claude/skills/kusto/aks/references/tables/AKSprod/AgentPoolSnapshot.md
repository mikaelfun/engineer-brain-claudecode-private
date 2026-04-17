---
name: AgentPoolSnapshot
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: AKS 节点池快照，记录节点池配置和状态
status: active
related_tables:
  - ManagedClusterSnapshot
---

# AgentPoolSnapshot

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 AKS 节点池的快照数据，包含节点池配置、状态和网络设置。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 快照时间 |
| id | string | 节点池资源 ID |
| resource_id | string | 集群资源 ID |
| name | string | 节点池名称 |
| podSubnetId | string | Pod 子网 ID |
| vnetSubnetId | string | VNet 子网 ID |
| vmSize | string | VM 大小 |
| count | int | 节点数量 |
| minCount | int | 最小节点数 |
| maxCount | int | 最大节点数 |
| enableAutoScaling | bool | 是否启用自动缩放 |
| mode | string | 节点池模式 (System/User) |
| orchestratorVersion | string | K8s 版本 |
| provisioningState | string | 预配状态 |
| powerState | string | 电源状态 |
| nodeLabels | dynamic | 节点标签 |
| nodeTaints | dynamic | 节点 Taints |

## 典型应用场景

1. **检查节点池配置** - 查看 VM 大小、节点数量等
2. **检测 Pod Subnet 共享** - 检查是否多个集群共享同一子网
3. **查询节点池历史** - 追踪配置变更
4. **诊断自动缩放问题** - 检查 minCount/maxCount 设置

## 示例查询

### 查询节点池配置
```kql
AgentPoolSnapshot
| where PreciseTimeStamp > ago(1d)
| where resource_id contains "{subscription}" and resource_id contains "{cluster}"
| project PreciseTimeStamp, name, vmSize, count, minCount, maxCount, enableAutoScaling, 
         orchestratorVersion, provisioningState, mode
| sort by PreciseTimeStamp desc
| take 10
```

### 检测 Pod Subnet 共享
```kql
AgentPoolSnapshot
| where PreciseTimeStamp > ago(1d)
| where podSubnetId != ""
| summarize clusters = make_set(resource_id) by podSubnetId
| where array_length(clusters) > 1
| project podSubnetId, clusters
```

### 查询节点池历史配置
```kql
AgentPoolSnapshot
| where PreciseTimeStamp > ago(7d)
| where resource_id contains "{cluster}"
| where name == "{agentPoolName}"
| project PreciseTimeStamp, count, vmSize, orchestratorVersion, provisioningState
| order by PreciseTimeStamp asc
```

## 关联表

- [ManagedClusterSnapshot.md](./ManagedClusterSnapshot.md) - 集群快照

## 注意事项

- `resource_id` 包含集群的完整资源 ID
- `id` 包含节点池的完整资源 ID
- 可用于检测网络配置问题（如子网共享）
