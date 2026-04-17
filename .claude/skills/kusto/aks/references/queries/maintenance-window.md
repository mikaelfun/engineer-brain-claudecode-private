---
name: maintenance-window
description: AKS 维护窗口和计划内维护查询 - 查询维护窗口配置和 Planned Maintenance 事件
tables:
  - FrontEndContextActivity
  - AsyncContextActivity
  - MaintenanceConfigEvent
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: resourceGroup
    required: false
    description: 资源组名称
  - name: cluster
    required: false
    description: 集群名称
  - name: clusterUri
    required: false
    description: AKS 集群 URI
  - name: operationId
    required: false
    description: 操作 ID
  - name: startDate
    required: false
    description: 开始时间
  - name: endDate
    required: false
    description: 结束时间
---

# 维护窗口和计划内维护查询

## 查询语句

### 查询维护窗口配置操作

查找维护窗口（Maintenance Window）的配置请求体。

```kql
union cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndContextActivity, 
      cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AsyncContextActivity
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
//| where PreciseTimeStamp > ago(1d)
| where subscriptionID == "{subscription}"
//| where resourceGroupName contains "{resourceGroup}"
//| where resourceName contains "{cluster}"
| extend Message = parse_json(msg)
//| where operationID contains "{operationId}"
| where Message contains "maintenance configuration request body"
| project PreciseTimeStamp, level, msg, namespace, correlationID, operationID, fileName, lineNumber
| take 10
```

### 查询 AKS Planned Maintenance 事件

检查 MaintenanceConfigEvent 表中维护配置服务的日志和错误消息。

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").MaintenanceConfigEvent
| where PreciseTimeStamp >= ago(2d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where msg contains "ARN" and msg contains "has been handled" and msg contains "{clusterUri}"
| project TIMESTAMP, msg
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| msg | 消息内容（含 maintenance configuration request body） |
| namespace | CCP Namespace |
| correlationID | 关联 ID |
| operationID | 操作 ID |

## 关联查询

- [auto-upgrade.md](./auto-upgrade.md) - 自动升级事件
- [operation-tracking.md](./operation-tracking.md) - 操作追踪
