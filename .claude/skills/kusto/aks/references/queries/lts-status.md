---
name: lts-status
description: AKS Long Time Support (LTS) 状态检查查询
tables:
  - ManagedClusterSnapshot
parameters:
  - name: ccpNamespace
    required: true
    description: CCP Namespace（集群内部 ID）
---

# LTS 状态检查

## 查询语句

### 检查集群 LTS 状态

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where cluster_id == "{ccpNamespace}"
| extend _supportPlan = orchestratorProfile.supportPlan
| extend _LTS = iff(_supportPlan == 2, "yes", "no")
| project PreciseTimeStamp, _LTS
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| _LTS | 是否启用 LTS（yes/no），supportPlan=2 表示启用 |

## 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照
- [blackbox-monitoring.md](./blackbox-monitoring.md) - 黑盒监控（获取 CCP Namespace）
