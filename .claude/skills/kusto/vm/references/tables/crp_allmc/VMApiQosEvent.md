---
name: VMApiQosEvent
database: crp_allmc
cluster: https://azcrpmc.kusto.chinacloudapi.cn
description: VM API QoS 事件表，包含 VM 模型数据和详细操作信息
status: active
---

# VMApiQosEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcrpmc.kusto.chinacloudapi.cn |
| 数据库 | crp_allmc |
| 状态 | ✅ 可用 |

## 用途

记录 VM API 操作的 QoS 事件，包含 Fabric 层信息（fabricCluster, fabricTenantName）。比 ApiQosEvent 包含更多 VM 特定信息。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| operationId | string | 操作 ID |
| correlationId | string | 关联 ID |
| operationName | string | 操作名称 |
| subscriptionId | string | 订阅 ID |
| resourceGroupName | string | 资源组名称 |
| resourceName | string | VM 名称 |
| fabricCluster | string | Fabric 集群名称 |
| fabricTenantName | string | Fabric 租户名称 |
| durationInMilliseconds | long | 操作持续时间 |
| resultCode | string | 结果代码 |

## 示例查询

### 查询 VM 操作详情

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VMApiQosEvent 
| where TIMESTAMP > ago(5d)
| where subscriptionId has '{subscription}'
| where resourceName contains "{vmname}"
| project PreciseTimeStamp, operationId, operationName, resourceGroupName, resourceName, 
         fabricCluster, fabricTenantName, correlationId, durationInMilliseconds
| order by PreciseTimeStamp asc 
```

### 查询 Screenshot/Console 日志操作

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VMApiQosEvent 
| where TIMESTAMP > ago(5d)
| where subscriptionId has '{subscription}'
| where resourceName contains "{vmname}"
| where operationName contains "RetrieveVMConsoleScreenshot" 
         or operationName contains "RetrieveVMConsoleSerialLogs"
| project PreciseTimeStamp, operationId, operationName, resourceName, resultCode, errorDetails
| order by PreciseTimeStamp desc
```

### 按 operationId 查询

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VMApiQosEvent 
| where TIMESTAMP > ago(5d)
| where operationId has "{operationId}"
| project PreciseTimeStamp, operationId, operationName, resourceGroupName, resourceName, 
         fabricCluster, fabricTenantName, correlationId, durationInMilliseconds
| order by PreciseTimeStamp asc 
```

## 关联表

- [ApiQosEvent.md](./ApiQosEvent.md) - API QoS 事件 (更通用)
- [ContextActivity.md](./ContextActivity.md) - 详细执行日志
