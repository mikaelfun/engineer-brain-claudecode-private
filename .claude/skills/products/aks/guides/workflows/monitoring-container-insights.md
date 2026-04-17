# AKS Container Insights 与 Log Analytics — 排查工作流

**来源草稿**: onenote-container-insights-log-collection.md
**Kusto 引用**: blackbox-monitoring.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: onenote-container-insights-log-collection.md | 适用: 适用范围未明确

### 排查步骤

##### English Version

1. Open a terminal connected to the AKS cluster
2. Download and run the log collection script:
   ```bash
   wget https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/scripts/troubleshoot/LogCollection/AgentLogCollection.sh && bash ./AgentLogCollection.sh
   ```

##### Chinese Version (客户沟通用)

1. 使用 Linux 机器或 Windows bash 环境，连接到集群
2. 确认拥有 kube-system 命名空间的权限：
   - [Connect to cluster using kubectl](https://learn.microsoft.com/en-us/azure/aks/tutorial-kubernetes-deploy-cluster?tabs=azure-cli#connect-to-cluster-using-kubectl)
   - 如果没有 kubectl：`az aks install-cli`
3. 下载并执行脚本：
   ```bash
   wget https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/scripts/troubleshoot/LogCollection/AgentLogCollection.sh
   bash ./AgentLogCollection.sh
   ```
4. 命令完成后日志保存在当前目录

---

## 附录: Kusto 诊断查询

### 来源: blackbox-monitoring.md

# 黑盒监控查询

## 查询语句

### 查找 FQDN、CCP Namespace 和 Underlay Name

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| sort by PreciseTimeStamp desc
| where subscription == "{subscription}" and customerResourceGroup == "{resourceGroup}" and clusterName == "{cluster}"
| project apiServerServiceAccountIssuerFQDN, customerResourceGroup, name, UnderlayName, namespace
| take 1
```

### 集群 Provisioning 状态汇总（90天趋势）

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

### 集群不健康事件详情

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

## 结果字段说明

| 字段 | 说明 |
|------|------|
| apiServerServiceAccountIssuerFQDN | API Server FQDN |
| UnderlayName | 底层名称（CCP Namespace） |
| namespace | 命名空间 |
| provisioningState | 预配状态 |
| powerState | 电源状态 |
| clusterNodeCount | 节点数量 |

## 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照
- [operation-tracking.md](./operation-tracking.md) - 操作追踪

---
