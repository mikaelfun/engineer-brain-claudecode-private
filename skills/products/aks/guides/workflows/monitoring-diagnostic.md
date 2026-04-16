# AKS 诊断与日志收集 — 排查工作流

**来源草稿**: 无
**Kusto 引用**: blackbox-monitoring.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Kusto 诊断: 黑盒监控查询
> 来源: blackbox-monitoring.md | 适用: Mooncake ✅

### 排查步骤

#### 黑盒监控查询

#### 查询语句

##### 查找 FQDN、CCP Namespace 和 Underlay Name

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| sort by PreciseTimeStamp desc
| where subscription == "{subscription}" and customerResourceGroup == "{resourceGroup}" and clusterName == "{cluster}"
| project apiServerServiceAccountIssuerFQDN, customerResourceGroup, name, UnderlayName, namespace
| take 1
```

##### 集群 Provisioning 状态汇总（90天趋势）

```kql
let _fqdn = cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| sort by PreciseTimeStamp desc
| where subscription == "{subscription}" and customerResourceGroup == "{resourceGroup}" and clusterName == "{cluster}"
| project apiServerServiceAccountIssuerFQDN
| take 1;
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").ManagedClusterSnapshot
| where PreciseTimeStamp > ago(90d)
| where apiServerServiceAccountIssuerFQDN in (_fqdn)
| project apiServerServiceAccountIssuerFQDN, PreciseTimeStamp, name, provisioningState, powerState, pod, clusterNodeCount, customerResourceGroup, managedClusterResourceGroup, clusterName, UnderlayName
| order by PreciseTimeStamp asc
| summarize count() by provisioningState
| sort by provisioningState
```

##### 集群不健康事件详情

```kql
let _fqdn = cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").ManagedClusterSnapshot
| sort by PreciseTimeStamp desc
| where subscription == "{subscription}" and customerResourceGroup == "{resourceGroup}" and clusterName == "{cluster}"
| project apiServerServiceAccountIssuerFQDN
| take 1;
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").ManagedClusterSnapshot
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where apiServerServiceAccountIssuerFQDN in (_fqdn)
| where provisioningState != "Succeeded"
| summarize count() by bin(PreciseTimeStamp, 5min), provisioningState
| render timeline
```

#### 结果字段说明

| 字段 | 说明 |
|------|------|
| apiServerServiceAccountIssuerFQDN | API Server FQDN |
| UnderlayName | 底层名称（CCP Namespace） |
| namespace | 命名空间 |
| provisioningState | 预配状态 |
| powerState | 电源状态 |
| clusterNodeCount | 节点数量 |

#### 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照
- [operation-tracking.md](./operation-tracking.md) - 操作追踪

---
