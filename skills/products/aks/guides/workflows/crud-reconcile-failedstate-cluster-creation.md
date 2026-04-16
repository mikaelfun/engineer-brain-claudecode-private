# AKS CRUD 操作与 Failed State 恢复 — cluster-creation — 排查工作流

**来源草稿**: mslearn-aks-cluster-creation-troubleshooting.md, onenote-aks-reconcile-cluster.md
**Kusto 引用**: cluster-snapshot.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: AKS Cluster Creation Troubleshooting Guide
> 来源: mslearn-aks-cluster-creation-troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Cluster Creation Troubleshooting Guide

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-aks-cluster-creation-issues)

#### Diagnostic Flow

##### 1. Azure CLI Output
- Error code and message shown directly in `az aks create` output
- Example: `ControlPlaneAddOnsNotReady` — system pods not running

##### 2. Azure Portal — Activity Log
- Filter by Operation name: "Create or Update Managed Cluster"
- Check suboperations for failures (policy actions, resource creation)
- JSON tab provides most detailed error info

##### 3. Cluster Insights (if cluster visible in portal)
- Kubernetes services → select cluster → Diagnose and solve problems → Cluster insights

##### 4. MC_ Resource Group
- Check VMSS status in MC_ resource group
- Failed status → select to view error details (Status, Level, Code, Message)
- Common: `VMExtensionProvisioningError` with exit status codes

##### 5. kubectl Commands (if cluster accessible)
```bash
az aks get-credentials --resource-group <RG> --name <cluster>
kubectl get nodes
kubectl get pods -n kube-system
kubectl describe pod <pod-name> -n kube-system
```

#### Common Error Patterns
- `ControlPlaneAddOnsNotReady` — system pods (coredns, konnectivity, metrics-server) not running
- `VMExtensionProvisioningError` exit status=50 — outbound connectivity failure
- Policy action failures — Azure Policy blocking resource creation
- No nodes available to schedule pods

---

## Scenario 2: TSG: Reconcile AKS Cluster
> 来源: onenote-aks-reconcile-cluster.md | 适用: Mooncake ✅

### 排查步骤

#### TSG: Reconcile AKS Cluster

#### When to Use

AKS cluster stuck in **Failed** state after a transient failure. Reconcile makes the current state reach the goal state without recreating resources already in goal state.

#### Important Notes

- Reconcile is **safe**: resources already in goal state won't be re-created
- Can still request RCA from PG after reconciling
- No side effects on working resources (settings, workloads preserved)

#### 4 Methods to Reconcile

##### Method 1: az aks upgrade (same version) — Customer self-service

```bash
az aks upgrade \
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --kubernetes-version <CURRENT_VERSION>
```

Reference: https://docs.azure.cn/zh-cn/aks/upgrade-cluster

##### Method 2: REST API PUT — Customer self-service

Send a PUT request via Postman or similar tool to the AKS resource endpoint.

##### Method 3: az resource update — Customer self-service

```bash
az resource update --ids $RSURI
```

##### Method 4: Escort + Reconcile — Internal (Engineer assisted)

Use Jarvis Actions to perform reconcile operation via escort access.

#### Decision Guide

| Scenario | Recommended Method |
|----------|-------------------|
| Customer can do it themselves | Method 1 (simplest) or Method 3 |
| Need quick mitigation | Method 1 |
| Transient issue, need RCA | Any method + request RCA from PG |
| Customer cannot self-service | Method 4 (internal) |

---
*Source: MCVKB 18.5 | aks-onenote-056*

---

## 附录: Kusto 诊断查询

### 来源: cluster-snapshot.md

# 集群快照查询

## 用途

获取 AKS 集群的基础信息、CCP Namespace、FQDN、Underlay Name 等关键信息。

## 查询 1: 获取集群基础信息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {subscription} | 是 | 订阅 ID |
| {resourceGroup} | 是 | 资源组名称 |
| {cluster} | 是 | 集群名称 |

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| where customerResourceGroup == "{resourceGroup}"
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project namespace, apiServerServiceAccountIssuerFQDN, UnderlayName, provisioningState, powerState, clusterNodeCount
| take 1
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| namespace | CCP 命名空间（用于控制平面日志查询） |
| apiServerServiceAccountIssuerFQDN | API Server FQDN |
| UnderlayName | Underlay 名称 |
| provisioningState | 预配状态 |
| powerState | 电源状态 |
| clusterNodeCount | 节点数量 |

---

## 查询 2: 查询集群状态历史

### 查询语句

```kql
let _fqdn = cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| where customerResourceGroup == "{resourceGroup}"
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project apiServerServiceAccountIssuerFQDN
| take 1;
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(90d)
| where apiServerServiceAccountIssuerFQDN in (_fqdn)
| project apiServerServiceAccountIssuerFQDN, PreciseTimeStamp, name, provisioningState, powerState, clusterNodeCount, UnderlayName
| order by PreciseTimeStamp asc
```

---

## 查询 3: 检查集群异常状态

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where TIMESTAMP > ago(3d)
| where clusterName contains "{cluster}" and subscription == "{subscription}"
| where ['state'] contains "degraded" or ['state'] == 'Unhealthy'
| project PreciseTimeStamp, provisionInfo, provisioningState, powerState, clusterNodeCount,
         autoUpgradeProfile, clusterName, resourceState
| sort by PreciseTimeStamp desc
```

---

## 查询 4: 检查 Extension Addon Profiles (如 Flux)

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {ccpNamespace} | 是 | CCP 命名空间 |

### 查询语句

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
ManagedClusterSnapshot
| where PreciseTimeStamp between(queryFrom..queryTo)
| where ['cluster_id'] == queryCcpNamespace
| summarize arg_max(PreciseTimeStamp, clusterName, extensionAddonProfiles) by cluster_id
| extend extensionAddonProfiles = parse_json(extensionAddonProfiles)
| mv-apply extensionAddonProfiles on (
    project extAddonName = tostring(extensionAddonProfiles.name),
            ProvisionStatus = tostring(extensionAddonProfiles.provisioningState)
)
| extend flux_enabled = tobool(iff(extAddonName=='flux', True, False))
| project extAddonName, flux_enabled, ProvisionStatus
```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 追踪操作详情
- [controlplane-logs.md](./controlplane-logs.md) - 控制平面日志

---
