---
name: ManagedClusterSnapshot
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: AKS 托管集群快照，包含集群配置、状态和元数据
status: active
---

# ManagedClusterSnapshot

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录 AKS 托管集群的快照数据，包含集群配置、状态和元数据。是获取 CCP Namespace、FQDN、Underlay Name 的主要来源。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 快照时间 |
| subscription | string | 订阅 ID |
| customerResourceGroup | string | 用户资源组 |
| clusterName | string | 集群名称 |
| cluster_id / namespace | string | CCP 命名空间（关键字段） |
| apiServerServiceAccountIssuerFQDN | string | API Server FQDN |
| UnderlayName | string | Underlay 名称 |
| provisioningState | string | 预配状态 |
| powerState | string | 电源状态 |
| clusterNodeCount | int | 集群节点数 |
| pod | string | Pod 名称 |
| managedClusterResourceGroup | string | 托管资源组（MC_xxx） |
| region | string | 区域 |
| orchestratorProfile | dynamic | 编排器配置 |
| extensionAddonProfiles | dynamic | 扩展 Addon 配置 |

## 常用筛选字段

- `subscription` - 按订阅筛选
- `customerResourceGroup` - 按资源组筛选
- `clusterName` - 按集群名称筛选

## 典型应用场景

1. **获取 CCP Namespace** - 用于后续控制平面日志查询
2. **查找 FQDN 和 Underlay Name** - 用于关联其他系统
3. **检查集群状态** - provisioningState, powerState
4. **检查 LTS 状态** - orchestratorProfile.supportPlan

## 示例查询

### 获取集群基础信息
```kql
ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}" 
| where customerResourceGroup == "{resourceGroup}" 
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project namespace, apiServerServiceAccountIssuerFQDN, UnderlayName, provisioningState
| take 1
```

### 检查集群状态历史
```kql
ManagedClusterSnapshot
| where PreciseTimeStamp > ago(7d)
| where subscription == "{subscription}" and clusterName == "{cluster}"
| project PreciseTimeStamp, provisioningState, powerState, clusterNodeCount
| order by PreciseTimeStamp asc
```

### 检查 Extension Addon Profiles
```kql
ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where cluster_id == "{ccpNamespace}"
| summarize arg_max(PreciseTimeStamp, clusterName, extensionAddonProfiles) by cluster_id
| extend extensionAddonProfiles = parse_json(extensionAddonProfiles)
| mv-apply extensionAddonProfiles on ( 
    project extAddonName = tostring(extensionAddonProfiles.name), 
            ProvisionStatus = tostring(extensionAddonProfiles.provisioningState)
)
```

## 关联表

- [FrontEndQoSEvents.md](./FrontEndQoSEvents.md) - 操作 QoS 事件
- [AgentPoolSnapshot.md](./AgentPoolSnapshot.md) - 节点池快照

## 注意事项

- `namespace` 和 `cluster_id` 字段都代表 CCP Namespace，查询时注意使用正确的字段名
- 获取 CCP Namespace 后可用于查询 AKSccplogs 数据库的控制平面日志
