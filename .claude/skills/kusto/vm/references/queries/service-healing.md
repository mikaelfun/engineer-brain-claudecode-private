---
name: service-healing
description: Service Healing 查询 - 排查 VM 意外重启和服务自愈事件
tables:
  - ServiceHealingTriggerEtwTable
  - TMMgmtTenantEventsEtwTable
  - AzSMTenantStatemachineEvents
  - VMA
parameters:
  - name: tenantName
    required: true
    description: 租户名称 (从 LogContainerSnapshot 获取)
  - name: nodeId
    required: false
    description: 节点 ID
  - name: vmname
    required: false
    description: VM 名称
  - name: starttime
    required: true
    description: 开始时间
  - name: endtime
    required: true
    description: 结束时间
---

# Service Healing 查询

## 用途

排查 VM 意外重启问题，确认是否为 Service Healing 触发，获取触发原因和 RCA 分析结果。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {tenantName} | 是 | 租户名称 | myvm-tenant |
| {nodeId} | 否 | 节点 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {vmname} | 否 | VM 名称 | myvm |
| {starttime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 工作流程

1. 首先获取 containerId/nodeId/tenantName (container-snapshot.md)
2. 查询 ServiceHealingTriggerEtwTable 确认 Service Healing
3. 查询 TMMgmtTenantEventsEtwTable 获取事件详情
4. 查询 VMA 获取 RCA 分析结果

## 查询语句

### 步骤 1: 获取 tenantName (参考 container-snapshot.md)

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where TIMESTAMP > ago(7d)
| where subscriptionId == "{subscription}"
| where roleInstanceName has "{vmname}"
| project tenantName, containerId, nodeId, roleInstanceName
| take 1
```

### 步骤 2: 查询 Service Healing 触发事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').ServiceHealingTriggerEtwTable
| where TenantName == "{tenantName}"
| where PreciseTimeStamp > datetime({starttime}) and PreciseTimeStamp < datetime({endtime})
| project PreciseTimeStamp, TenantName, TriggerType, FaultReason, RoleInstanceName, SourceNodeId, FaultCode
```

### 步骤 3: 查询租户事件详情

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtTenantEventsEtwTable
| where TIMESTAMP >= datetime({starttime}) and TIMESTAMP <= datetime({endtime})
| where Message !contains "[AuditEvent]"
| where Message contains "{vmname}"
| where TenantName == "{tenantName}"
| project PreciseTimeStamp, Message
```

### 步骤 4: 查询 AzSM 状态机事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').AzSMTenantStatemachineEvents
| where PreciseTimeStamp > datetime({starttime}) and PreciseTimeStamp < datetime({endtime})
| where tenantName contains "{tenantName}"
| where message contains "Servicehealing" or message contains "Service healing"
| project PreciseTimeStamp, message, tenantName
```

### 步骤 5: 查询 VMA RCA 结果

```kql
cluster('vmainsight.kusto.windows.net').database('vmadb').VMA
| where Subscription == '{subscription}'
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime})
| where RoleInstanceName has "{vmname}"
| where RCAEngineCategory != 'CustomerInitiated'
| project PreciseTimeStamp, TenantName, NodeId, ContainerId, RoleInstanceName, RCA, RCALevel1, 
         RCALevel2, RCALevel3, RCAEngineCategory, Detail
| order by PreciseTimeStamp asc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| TriggerType | Service Healing 触发类型 |
| FaultReason | 故障原因 |
| FaultCode | 故障代码 |
| RCALevel1/2/3 | RCA 分级分类 |
| RCAEngineCategory | RCA 类别 (CustomerInitiated/Planned/Unplanned) |

## 变体查询

### 按节点查询所有 Service Healing 事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').ServiceHealingTriggerEtwTable 
| where SourceNodeId == "{nodeId}" 
| where PreciseTimeStamp >= datetime({starttime}) 
| where PreciseTimeStamp < datetime({endtime})
| project PreciseTimeStamp, TenantName, TriggerType, FaultReason, SourceNodeId, FaultCode
```

### 检查意外重启

```kql
let start = ago(3d);
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').DCMLMResourceEventEtwTable
| where PreciseTimeStamp between ((start - 3d) .. (start + 3d))
| where Tenant == "{tenantName}"
| where Description has "Unexpected Reboot Detected"
| project PreciseTimeStamp, Tenant, ResourceId, State, Description
```

## 关联查询

- [container-snapshot.md](./container-snapshot.md) - 获取 tenantName
- [node-events.md](./node-events.md) - 节点事件
- [vma-analysis.md](./vma-analysis.md) - VMA 可用性分析
- [hardware-failure.md](./hardware-failure.md) - 硬件故障查询
