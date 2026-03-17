---
name: cost-analysis
description: AKS Cost Analysis Agent 问题诊断查询
tables:
  - CostAnalysis
parameters:
  - name: clusterUri
    required: true
    description: 集群 URI
  - name: startDate
    required: false
    description: 开始时间
  - name: endDate
    required: false
    description: 结束时间
---

# Cost Analysis Agent 诊断

## 查询语句

### 查询 Cost Analysis Agent 错误

用于诊断 Cost Analysis agent 相关问题。

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").CostAnalysis
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
//| where PreciseTimeStamp > ago(24h)
| extend data=parse_json(log)
| where data.cluster_id == "{clusterUri}"
| where data.level == "error"
| take 10000
```

### 查询 Cost Analysis 全部日志

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").CostAnalysis
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| extend data=parse_json(log)
| where data.cluster_id == "{clusterUri}"
| project PreciseTimeStamp, level=tostring(data.level), msg=tostring(data.msg)
| sort by PreciseTimeStamp desc
| take 1000
```

## 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照
- [extension-manager.md](./extension-manager.md) - Extension Manager
