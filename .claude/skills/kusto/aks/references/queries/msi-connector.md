---
name: msi-connector
description: AKS MSI Connector 活动查询 - 追踪 Managed Identity 连接器操作
tables:
  - MSIConnectorActivity
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: region
    required: false
    description: 区域
  - name: startDate
    required: false
    description: 开始时间
  - name: endDate
    required: false
    description: 结束时间
---

# MSI Connector 活动查询

## 查询语句

### 查询 MSI Connector 活动

```kql
union cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").MSIConnectorActivity
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
//| where PreciseTimeStamp > ago(1d)
| where subscriptionID == "{subscription}"
| where region == "{region}"
```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照
