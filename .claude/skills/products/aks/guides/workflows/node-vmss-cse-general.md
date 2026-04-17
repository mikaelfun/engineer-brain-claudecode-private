# AKS VMSS CSE 与节点启动 — general — 排查工作流

**来源草稿**: 无
**Kusto 引用**: node-fabric-info.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Kusto 诊断: 节点 Fabric 层信息查询
> 来源: node-fabric-info.md | 适用: Mooncake ✅

### 排查步骤

#### 节点 Fabric 层信息查询

#### 查询语句

##### 通过 LogContainerSnapshot 获取节点底层信息

获取 AKS 节点的 NodeID、ContainerID、Fabric Host（Tenant）等信息，用于进一步 Fabric 层排查。

> ⚠️ Mooncake 集群: `azurecm.chinanorth2.kusto.chinacloudapi.cn`

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where PreciseTimeStamp >= ago(2d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where roleInstanceName contains "{vmssInstanceName}"
| project PreciseTimeStamp, Fabric_Host=Tenant, Node_ID=nodeId, Container_ID=containerId
| top 1 by PreciseTimeStamp desc
```

##### 通过 GuestAgentExtensionEvents 获取节点扩展日志

可获取已删除节点或 Spot 实例的日志。

> ⚠️ Mooncake 集群: `azcore.chinanorth3.kusto.chinacloudapi.cn`

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').GuestAgentExtensionEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
//| where PreciseTimeStamp > ago(1d)
| where ContainerId == "{containerId}"
| project PreciseTimeStamp, Level, RoleInstanceName, ContainerId, Name, TaskName, Operation, OperationSuccess, Message
```

#### 典型应用场景

1. **获取节点 Fabric 信息** - 从 VMSS 实例名获取 ContainerID/NodeID 用于 Fabric 层查询
2. **已删除节点日志** - Spot 实例被回收后仍可通过 ContainerID 查询扩展日志
3. **跨层关联** - 将 AKS 层问题与 Fabric/CRP 层日志关联

#### 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照
- [operation-tracking.md](./operation-tracking.md) - 操作追踪

---
