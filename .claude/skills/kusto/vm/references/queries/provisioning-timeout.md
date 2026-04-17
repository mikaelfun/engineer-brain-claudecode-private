---
name: provisioning-timeout
description: OS Provisioning 超时查询 - 排查 OSProvisioningTimedOut 和网络编程问题
tables:
  - ApiQosEvent
  - ContextActivity
  - NetworkManagerClientEvents
  - DCMNMAgentProgrammingDurationEtwTable
  - WireserverHttpRequestLogEtwTable
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: vmname
    required: true
    description: VM 名称
  - name: tenantName
    required: false
    description: 租户名称
  - name: containerId
    required: false
    description: 容器 ID
  - name: starttime
    required: true
    description: 开始时间
  - name: endtime
    required: true
    description: 结束时间
---

# OS Provisioning 超时查询

## 用途

排查 OSProvisioningTimedOut 错误，检查网络编程延迟和 Wireserver 请求状态。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {vmname} | 是 | VM 名称 | myvm |
| {tenantName} | 否 | 租户名称 | myvm-tenant |
| {containerId} | 否 | 容器 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {starttime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 工作流程

1. 确认 OSProvisioningTimedOut 错误 (CRP ApiQosEvent)
2. 获取 containerId/nodeId/tenantName (LogContainerSnapshot)
3. 检查网络编程延迟 (DCMNMAgentProgrammingDurationEtwTable)
4. 检查网络配置事件 (NetworkManagerClientEvents)
5. 检查 Wireserver 请求状态 (WireserverHttpRequestLogEtwTable)

## 查询语句

### 步骤 1: 确认 OSProvisioningTimedOut 错误

```kql
let uri="/subscriptions/{subscription}/resourceGroups/{resourceGroup}/providers/Microsoft.Compute/virtualMachines/{vmname}";
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent  
| where TIMESTAMP > ago(3d)
| where subscriptionId == split(uri,"/")[2] and resourceName contains split(uri,"/")[8]
| where resultCode contains "OSProvisioningTimedOut"
| order by PreciseTimeStamp asc
| extend startTime=PreciseTimeStamp-e2EDurationInMilliseconds*1ms
| extend OperationDuration=e2EDurationInMilliseconds*1ms
| project startTime, PreciseTimeStamp, OperationDuration, resourceGroupName, resourceName, 
         operationName, resultCode, httpStatusCode, operationId, correlationId, region, 
         requestEntity, errorDetails
```

### 步骤 2: 获取容器信息 (参考 container-snapshot.md)

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where TIMESTAMP > ago(7d)
| where subscriptionId == "{subscription}"
| where roleInstanceName has "{vmname}"
| project tenantName, containerId, nodeId, roleInstanceName
| take 1
```

### 步骤 3: 检查网络编程延迟

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').DCMNMAgentProgrammingDurationEtwTable 
| where TIMESTAMP > ago(1d)
| where Tenant == "{tenantName}"
| where * contains "{containerId}"
| project PreciseTimeStamp, message, interfaceId, programmingDelayInSeconds
```

### 步骤 4: 检查网络管理客户端事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').NetworkManagerClientEvents 
| where TIMESTAMP >= ago(1d)
| where Tenant == "{tenantName}"
| where Message contains "{containerId}"
| project PreciseTimeStamp, TaskName, Message, ProviderName, SourceNamespace
```

### 步骤 5: 检查 Wireserver 请求状态

```kql
cluster('Rdosmc.kusto.chinacloudapi.cn').database('rdos').WireserverHttpRequestLogEtwTable
| where PreciseTimeStamp between(datetime({starttime}) .. datetime({endtime}))
| where NodeId == "{nodeId}"
| where ContainerId =~ "{containerId}"
| extend level = case(
    ResponseStatusCode >= 500, "Critical", 
    ResponseStatusCode >= 400, "Error", 
    ResponseStatusCode >= 300, "Warning", 
    "Info")
| project PreciseTimeStamp, ContainerId, ClientId, ClientRequestId, RequestUrl, RequestType, 
         ResponseStatusCode, RequestStartTime, RequestProcessingTimeInMS, level
| order by PreciseTimeStamp asc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| programmingDelayInSeconds | 网络编程延迟 (秒) |
| ResponseStatusCode | Wireserver 响应状态码 |
| RequestProcessingTimeInMS | 请求处理时间 (毫秒) |

## 常见原因

| 原因 | 说明 |
|------|------|
| 网络编程延迟 | programmingDelayInSeconds 过长 |
| Wireserver 超时 | ResponseStatusCode 5xx 错误 |
| DHCP 获取失败 | 网络配置问题 |
| Guest Agent 问题 | Guest Agent 未能及时响应 |

## 关联查询

- [container-snapshot.md](./container-snapshot.md) - 获取容器信息
- [extension-events.md](./extension-events.md) - 扩展事件
- [vm-operations.md](./vm-operations.md) - VM 操作查询
