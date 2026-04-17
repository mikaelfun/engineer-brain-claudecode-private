---
name: pod-subnet-sharing
description: AKS Pod Subnet 共享查询 - 排查 Pod Subnet 被多个集群共享导致 IP 耗尽
tables:
  - AgentPoolSnapshot
parameters:
  - name: podSubnetUri
    required: false
    description: Pod Subnet URI
  - name: startDate
    required: false
    description: 开始时间
  - name: endDate
    required: false
    description: 结束时间
---

# Pod Subnet 共享查询

## 查询语句

### 查找共享 Pod Subnet 的集群

用于排查因 Pod Subnet 被多个集群共享导致子网 IP 耗尽的问题。

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AgentPoolSnapshot
| where PreciseTimeStamp >= ago(2d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where podSubnetId != ""
| summarize dcount(id) by podSubnetId
| where dcount_id > 1
```

### 查看特定 Subnet 被哪些集群使用

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AgentPoolSnapshot
| where PreciseTimeStamp >= ago(2d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where podSubnetId contains "{podSubnetUri}"
| summarize dcount(id) by resource_id, name
```

## 典型应用场景

1. **IP 耗尽排查** - 确认是否有多个集群共享同一 Pod Subnet
2. **网络规划** - 了解 Subnet 的集群分配情况

## 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照
