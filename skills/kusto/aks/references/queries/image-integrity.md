---
name: image-integrity
description: AKS Image Integrity 功能查询 - 检查镜像完整性配置操作
tables:
  - FrontEndQoSEvents
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
  - name: startDate
    required: false
    description: 开始时间
  - name: endDate
    required: false
    description: 结束时间
---

# Image Integrity 功能查询

## 查询语句

### 查询 Image Integrity 启用操作

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndQoSEvents
//| where PreciseTimeStamp > ago(7d)
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName contains "{resourceGroup}"
| where resourceName contains "{cluster}"
| where userAgent has "azure-resource-manager"
| where operationName == "PutManagedClusterHandler.PUT"
| where propertiesBag has "\"enableImageIntegrity\":\"true\""
| project PreciseTimeStamp, apiVersion, operationID, correlationID, resultCode, errorDetails, propertiesBag
```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照
