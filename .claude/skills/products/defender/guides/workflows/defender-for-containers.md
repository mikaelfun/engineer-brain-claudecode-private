# Defender Defender for Containers — 排查工作流

**来源草稿**: ado-wiki-a-defender-sensor-antimalware-detection-prevention.md, ado-wiki-b-defender-pods-crashing-oom.md, ado-wiki-c-containers-va-one-queue.md, ado-wiki-d-arc-enabled-kubernetes-product-knowledge.md, ado-wiki-d-containers-plan-security-findings.md, ado-wiki-e-enabling-containers-at-scale.md, onenote-aks-workload-protection.md
**场景数**: 7
**生成日期**: 2026-04-07

---

## Scenario 1: Defender Sensor - Antimalware Detection and Prevention
> 来源: ado-wiki-a-defender-sensor-antimalware-detection-prevention.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. The k8s cluster azure resource id
2. Output of:

### 脚本命令
```powershell
helm install microsoft-defender-for-containers \
  ${HELM_REPO} \
  ${INSTALL_VERSION} \
  --namespace mdc \
  --create-namespace \
  --set microsoft-defender-for-containers-sensor.collectors.antimalwareCollector.enable='true'
```

```powershell
az k8s-extension create \
  --name microsoft.azuredefender.kubernetes \
  --cluster-type connectedClusters \
  --cluster-name $ARC_CLUSTER_NAME \
  --resource-group $ARC_RESOURCE_GROUP \
  --extension-type microsoft.azuredefender.kubernetes \
  --release-train Preview \
  --configuration-settings collectors.antimalwareCollector.enable='true'
```

```powershell
helm get values microsoft-defender-for-containers-sensor -n mdc
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 2: Microsoft Defender Pods Experiencing Multiple Restarts or Out of Memory (OOM)
> 来源: ado-wiki-b-defender-pods-crashing-oom.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- an Incident Case Management ticket

### Kusto 诊断查询
**查询 1:**
```kusto
let resourceId = "<RESOURCE-ID>"; // format: /subscriptions/{SubscriptionId}/resourceGroups/{ResourceGroup}/providers/Microsoft.ContainerService/managedClusters/XXX
let lookbackTime = 2h;
union
    cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').K8S_Pods,
    cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').K8S_Pods
| where ingestion_time() > ago(lookbackTime)
| where AzureResourceId =~ resourceId
| extend PodName=tostring(PodMetadata.name)
| where PodName startswith "microsoft-defender"
| mv-expand SingleStatus=Status.containerStatuses
| extend RestartCount = toint(SingleStatus.RestartCount)
| extend ContainerName=tostring(SingleStatus.name)
| extend NodeName = tostring(Spec.nodeName)
| where RestartCount > 0
| summarize count() by AzureResourceId, RestartCount, PodName, ContainerName, NodeName
| order by RestartCount desc
```

### 脚本命令
```powershell
kubectl describe pod microsoft-defender-ds-xxxxx -n kube-system
```

```powershell
kubectl logs microsoft-defender-ds-xxxxx -n kube-system
```

```powershell
kubectl describe pod microsoft-defender-ds-xxxxx -n mdc
```

---

## Scenario 3: Containers VA powered by MDVM - One Queue
> 来源: ado-wiki-c-containers-va-one-queue.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Removal of sub resource ID (now full resource ID of running container)
2. Removal of aggregated `kubernetesContext` field, replaced with flat `kubernetesDetails`:

### Kusto 诊断查询
**查询 1:**
```kusto
securityresources
| where type =~ "microsoft.security/assessments/subassessments"
| extend assessmentKey=extract(@"(?i)providers/Microsoft.Security/assessments/([^/]*)", 1, id)
| where assessmentKey == "33422d8f-ab1e-42be-bc9a-38685bb567b9"
```

**查询 2:**
```kusto
securityresources
| where type =~ "microsoft.security/assessments/subassessments"
| extend assessmentKey=extract(@"(?i)providers/Microsoft.Security/assessments/([^/]*)", 1, id)
| where assessmentKey == "e9acaf48-d2cf-45a3-a6e7-3caa2ef769e0" and id == "{id}"
| project todynamic(properties.additionalData.kubernetesDetails)
```

---

## Scenario 4: Microsoft Defender for Arc Enabled Kubernetes
> 来源: ado-wiki-d-arc-enabled-kubernetes-product-knowledge.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
database("ProdRawEvents").K8S_KubeAudit 
| where ingestion_time() > ago(1h)
| where AzureResourceId contains "{subscriptionId}"
| summarize count() by AzureResourceId
```

---

## Scenario 5: Containers Plan - Security findings (Preview)
> 来源: ado-wiki-d-containers-plan-security-findings.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 6: Enabling Containers plan and auto-provisioning at scale
> 来源: ado-wiki-e-enabling-containers-at-scale.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Enable the containers bundle (using the RP request)
2. Register To AzureDefender feature flag
3. Assign 4 DeployIfNotExists (DINE) policies
4. Create 4 remediation tasks (according to the DeployIfNotExists (DINE) policies)
5. Enabling the Containers plan:
6. Containers auto provisioning:

### Portal 导航路径
- Azure Policy > Assignments > Select policy > Assign on management group scope > Create remediation task

### 脚本命令
```powershell
az feature register --namespace Microsoft.ContainerService --name AKS-AzureDefender --subscription <subscription>
```

---

## Scenario 7: AKS Workload Protection with Defender for Containers
> 来源: onenote-aks-workload-protection.md | 适用: Mooncake ✅

### 脚本命令
```powershell
az aks enable-addons --addons azure-policy --name MyAKSCluster --resource-group MyResourceGroup
```

---
