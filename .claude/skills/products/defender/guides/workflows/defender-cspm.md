# Defender CSPM / DCSPM 云安全态势管理 — 排查工作流

**来源草稿**: ado-wiki-a-attack-paths-product-knowledge.md, ado-wiki-a-blast-radius-tsg.md, ado-wiki-a-cloud-security-explorer-product-knowledge.md, ado-wiki-a-cloud-vulnerabilities-exposure-management-tsg.md, ado-wiki-a-internet-exposure-trusted-ips-deployment.md, ado-wiki-c-tsg-attack-path-not-visible.md
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: [Product Knowledge] - Attack Paths
> 来源: ado-wiki-a-attack-paths-product-knowledge.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 2: TSG for Microsoft Security Graph and Blast Radius
> 来源: ado-wiki-a-blast-radius-tsg.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 3: Cloud Vulnerabilities in Exposure Management
> 来源: ado-wiki-a-cloud-vulnerabilities-exposure-management-tsg.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 4: Internet Exposure Analysis with Trusted IPs — Deployment Guide
> 来源: ado-wiki-a-internet-exposure-trusted-ips-deployment.md | 适用: Mooncake ✅

### 排查步骤
1. **Current release only supports Azure VM/VMSS** (AWS and GCP support planned)
2. **Cleanup/offboarding**: Removing the policy does **NOT** remove already-defined IP groups — must use the provided script for full cleanup
3. Go to MDC GitHub - Define Trusted IPs Policy
4. Click "Deploy to Azure" button
5. Log in to Azure Portal
6. Select management group and region
7. Review and create
8. Go to Policy → Assignments → "Assign policy"
9. Select **"Deploy Microsoft Defender for Cloud Trusted IPs"**
10. Choose the scope for Trusted IPs
11. Under **Parameters**: specify IP ranges in CIDR notation or single IPs
12. Specify the location for IP group deployment
13. Go to Remediation tab
14. Assign system-assigned or user-assigned managed identity with **Contributor** permission
15. Go to Review + create → Create
16. Navigate to **Create remediation task** → Initiate deployment of IP groups per subscription → Remediate

### Portal 导航路径
- [MDC GitHub - Define Trusted IPs Policy](https://github
- Policy → Assignments → "Assign policy"
- Remediation tab
- Review + create → Create
- **Create remediation task** → Initiate deployment of IP groups per subscription → Remediate

---

## Scenario 5: TSG: Customer Expects to See Attack Path but Doesn't See It (DCSPM Agentless Containers)
> 来源: ado-wiki-c-tsg-attack-path-not-visible.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- CRI for `Defenders - CRIs`
- CRI for `Defenders - CRIs`
- CRI for `Defenders - CRIs`
- CRI for `Cloud/Protectors - Shilo's Team`

### Kusto 诊断查询
**查询 1:**
```kusto
let SubscriptionId = "<SubId>";
cluster('mdcentitystoreprodus.centralus.kusto.windows.net').database('MDCGlobalData').GetCurrentEnvironments()
| where TimeStamp > ago(3h)
| where EnvironmentName == "Azure"
| where Level == "Subscription"
| where HierarchyId == SubscriptionId
| where Type == "Snapshot" or isempty(Type)
| top 1 by TimeStamp
| mv-expand Plans
| where Plans has "Extensions"
| extend PlanName = tostring(Plans["Bundle"])
| extend AgentlessDiscoveryForKubernetes = Plans["Extensions"]["AgentlessDiscoveryForKubernetes"]["IsEnabled"]
| extend ContainerRegistriesVulnerabilityAssessments = Plans["Extensions"]["ContainerRegistriesVulnerabilityAssessments"]["IsEnabled"]
| project AgentlessDiscoveryForKubernetes, ContainerRegistriesVulnerabilityAssessments
```

**查询 2:**
```kusto
let hierarchyId = "<hierarchyId>";
cluster('mdcentitystoreprodus.centralus.kusto.windows.net').database('MDCGlobalData').GetCurrentEnvironments()
| where TimeStamp > ago(3h)
| where EnvironmentName in~ ("AWS", "GCP")
| where HierarchyId == hierarchyId
| where Type == "Snapshot" or isempty(Type)
| top 1 by TimeStamp
| mv-expand Plans
| extend PlanName = tostring(Plans["offeringType"])
| where PlanName in ("DefenderForContainers", "DefenderCspm")
| extend additionalData=Plans["additionalData"]
| where additionalData contains "image"
| where isnotempty(additionalData["AgentlessDiscoveryForK8s"]) and isnotempty(additionalData["EnableContainerVulnerabilityAssessment"])
| extend AgentlessDiscoveryForKubernetes = tobool(parse_json(tostring(additionalData["AgentlessDiscoveryForK8s"]))["enabled"])
| extend ContainerRegistriesVulnerabilityAssessments = tobool(parse_json(tostring(additionalData["ContainerImageAssessment"]))["enabled"])
| project AgentlessDiscoveryForKubernetes, ContainerRegistriesVulnerabilityAssessments
```

**查询 3:**
```kusto
let _azureResourceId = "<Cluster's Azure resource id>";
union
(
    cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetEdges()
    | where Provider =~ "ContainerProvider"
    | where IngestionScopeKey =~ replace_string(_azureResourceId, "/", "$")
    | take 1
),
(
    cluster('https://weuornatpkustoprod.westeurope.kusto.windows.net').database('CloudMap').GetEdges()
    | where Provider =~ "ContainerProvider"
    | where IngestionScopeKey =~ replace_string(_azureResourceId, "/", "$")
    | take 1
)
| count
| project ["Cluster has Components in Map"] = Count > 0
```

**查询 4:**
```kusto
let azureResourceId = "<azure resource id>";
union cluster('mdcentitystoreprodus.centralus.kusto.windows.net').database("DiscoveryAzure").Resources,
    cluster("mdcentitystoreprodeu.westeurope.kusto.windows.net").database("DiscoveryAzure").Resources,
    cluster('mdcentitystoreprodus.centralus.kusto.windows.net').database('DiscoveryAws').EKS_Cluster,
    cluster("mdcentitystoreprodeu.westeurope.kusto.windows.net").database('DiscoveryAws').EKS_Cluster,
    cluster('mdcentitystoreprodus.centralus.kusto.windows.net').database('DiscoveryGcp').Container_Cluster,
    cluster("mdcentitystoreprodeu.westeurope.kusto.windows.net").database('DiscoveryGcp').Container_Cluster
| where ingestion_time() > ago(6h)
| extend AzureResourceId = tostring(RecordIdentifierInfo["RecordAzureUniqueIdentifier"])
| where AzureResourceId == azureResourceId
| summarize Discovery_AksHaveData=count();
```

**查询 5:**
```kusto
let azureResourceId = "<azureResourceId>";
union cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').Discovery_Aks,
    cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').Discovery_Aks,
    cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').Aks_Eligible_Clusters,
    cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').Aks_Eligible_Clusters
| where AzureResourceId == azureResourceId
| count
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---
