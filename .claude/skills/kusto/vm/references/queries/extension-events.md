---
name: extension-events
description: 扩展事件查询 - 查询 VM 扩展安装和执行状态
tables:
  - LogHealthAnnotationEvent
  - VMAutoExtensionUpgradeEvent
  - ContextActivity
  - GuestAgentExtensionEvents
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: vmname
    required: true
    description: VM 名称
  - name: operationId
    required: false
    description: 操作 ID
  - name: starttime
    required: false
    default: ago(3d)
    description: 开始时间
  - name: endtime
    required: false
    default: now()
    description: 结束时间
---

# 扩展事件查询

## 用途

查询 VM 扩展的安装、升级和执行状态。用于排查扩展安装失败、超时等问题。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {vmname} | 是 | VM 名称 | myvm |
| {operationId} | 否 | 操作 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {starttime} | 否 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 否 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询扩展安装状态

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').LogHealthAnnotationEvent
| where PreciseTimeStamp > ago(3d)
| where subscriptionId == "{subscription}"
| where vmName has "{vmname}"
| project PreciseTimeStamp, vmName, extensionName, extensionVersion, extensionStatus, 
         extensionStatusMessage, operationId
| order by PreciseTimeStamp desc
```

### 查询扩展自动升级事件

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VMAutoExtensionUpgradeEvent
| where PreciseTimeStamp > ago(7d)
| where subscriptionId == "{subscription}"
| where vmName has "{vmname}"
| project PreciseTimeStamp, vmName, extensionName, oldVersion, newVersion, upgradeStatus, 
         upgradeStatusMessage
| order by PreciseTimeStamp desc
```

### 查询扩展操作详细日志

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP > ago(4h)
| where activityId == "{operationId}"
| where message contains "extension" or message contains "Extension"
| project PreciseTimeStamp, message, traceCode
| order by PreciseTimeStamp asc
```

### 查询扩展安装失败

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').LogHealthAnnotationEvent
| where PreciseTimeStamp > ago(7d)
| where subscriptionId == "{subscription}"
| where extensionStatus != "succeeded" and extensionStatus != ""
| project PreciseTimeStamp, vmName, extensionName, extensionVersion, extensionStatus, 
         extensionStatusMessage
| order by PreciseTimeStamp desc
```

### 查询 VMSS 扩展状态

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssQoSEvent
| where PreciseTimeStamp > ago(3d)
| where subscriptionId == "{subscription}"
| where vmssName contains "{vmssname}"
| where extensionNamesCsv != ""
| project PreciseTimeStamp, vmssName, operationName, extensionNamesCsv, predominantErrorCode, 
         predominantErrorDetail
| order by PreciseTimeStamp desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| extensionName | 扩展名称 |
| extensionVersion | 扩展版本 |
| extensionStatus | 扩展状态 (succeeded/failed/transitioning) |
| extensionStatusMessage | 状态消息 |
| upgradeStatus | 升级状态 |

## 常见扩展问题

| 错误 | 说明 | 可能原因 |
|------|------|----------|
| VMExtensionProvisioningTimeout | 扩展预配超时 | 网络问题、扩展脚本执行时间过长 |
| VMExtensionHandlerNonTransientError | 扩展处理程序错误 | 扩展内部错误 |
| VMExtensionProvisioningError | 扩展预配错误 | 权限问题、依赖缺失 |

## 变体查询

### 查询特定扩展的历史

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').LogHealthAnnotationEvent
| where PreciseTimeStamp > ago(30d)
| where subscriptionId == "{subscription}"
| where vmName has "{vmname}"
| where extensionName == "{extensionName}"
| project PreciseTimeStamp, extensionVersion, extensionStatus, extensionStatusMessage
| order by PreciseTimeStamp desc
```

## 关联查询

- [vm-operations.md](./vm-operations.md) - VM 操作查询
- [context-activity.md](./context-activity.md) - 详细执行日志

---

## 补充查询

### 查询 Guest Agent 扩展事件 (Fabric 层)

从 Fabric 层查询 Guest Agent 和扩展的详细信息，包括 OS 版本、GA 版本等：

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscriptionId = "{subscription}"; 
let VMName = "{vmname}"; 
let ContId = "{containerId}";
let Container =
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where PreciseTimeStamp between (starttime .. endtime)
| where ((isnotempty(subscriptionId) and subscriptionId =~ subscriptionId and isnotempty(VMName) and roleInstanceName contains VMName))
    or (isnotempty(containerId) and containerId == ContId)
| summarize arg_max(TIMESTAMP, *) by virtualMachineUniqueId
| project virtualMachineUniqueId;
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').GuestAgentExtensionEvents
| where VMId in (Container)
| summarize arg_max(PreciseTimeStamp, *) by Name
| project PreciseTimeStamp, VMId, OSVersion, GAVersion, Name, Operation, OperationSuccess, Version, Processors, RAM
| order by Name asc
```

### 按 VM ID 直接查询 Guest Agent 事件

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').GuestAgentExtensionEvents
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where VMId == "{vmid}"
| project PreciseTimeStamp, VMId, OSVersion, GAVersion, Name, Operation, OperationSuccess, Version, Processors, RAM
| order by PreciseTimeStamp desc
```

### 查询所有扩展的最新状态

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').GuestAgentExtensionEvents
| where PreciseTimeStamp > ago(7d)
| where VMId == "{vmid}"
| summarize arg_max(PreciseTimeStamp, *) by Name
| project PreciseTimeStamp, Name, Version, Operation, OperationSuccess, OSVersion, GAVersion
| order by Name asc
```

### GuestAgentExtensionEvents 字段说明

| 字段 | 说明 |
|------|------|
| VMId | VM 唯一 ID |
| OSVersion | Guest OS 版本 |
| GAVersion | Guest Agent 版本 |
| Name | 扩展名称 |
| Operation | 操作类型 (Enable/Install/Update 等) |
| OperationSuccess | 操作是否成功 |
| Version | 扩展版本 |
| Processors | CPU 数量 |
| RAM | 内存大小 |

### 常见扩展名称

| 扩展名称 | 用途 |
|----------|------|
| Microsoft.Azure.Extensions.CustomScript | Linux 自定义脚本 |
| Microsoft.Compute.CustomScriptExtension | Windows 自定义脚本 |
| Microsoft.Azure.Diagnostics.IaaSDiagnostics | Windows 诊断 |
| Microsoft.Azure.Diagnostics.LinuxDiagnostic | Linux 诊断 |
| Microsoft.Azure.Monitor.AzureMonitorWindowsAgent | Windows 监控代理 |
| Microsoft.Azure.Monitor.AzureMonitorLinuxAgent | Linux 监控代理 |
| Microsoft.Azure.Security.Monitoring | 安全监控 |
