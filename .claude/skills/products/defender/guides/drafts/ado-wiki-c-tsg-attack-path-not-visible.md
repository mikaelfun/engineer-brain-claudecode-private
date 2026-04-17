---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/DCSPM for K8s agentless/Customer expects to see attack path but doesn't see it"
sourceUrl: "https://dev.azure.com/ASIM-Security/08a9716f-c06d-418d-9916-e38023d36752/_wiki/wikis/805e0e78-f6b1-4ad5-ad26-6cb3aad9f60e?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2FDCSPM%20for%20K8s%20agentless%2FCustomer%20expects%20to%20see%20attack%20path%20but%20doesn%27t%20see%20it"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG: Customer Expects to See Attack Path but Doesn't See It (DCSPM Agentless Containers)

## Overview

Helps CSS engineers investigate missing attack paths in Defender DCSPM for Containers (AKS/EKS/GKE).

## Step 0 — Pricing Validation

Both **AgentlessDiscoveryForKubernetes** AND **ContainerRegistriesVulnerabilityAssessments** must be enabled.

**Azure subscriptions:**
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

**AWS/GCP accounts:**
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

## Step 1 — Verify Cluster Exists in CloudMap

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

If cluster found in CloudMap → proceed to [Map Exporter failure TSG](ado-wiki-c-tsg-map-exporter-failure.md) for deeper investigation.

## Step 2 — Finding the Problematic Service (Decision Tree)

### Check Discovery

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

No results → **Discovery** is problematic → Open CRI for `Defenders - CRIs`.

### Check Synchronizer

```kusto
let azureResourceId = "<azureResourceId>";
union cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').Discovery_Aks,
    cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').Discovery_Aks,
    cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').Aks_Eligible_Clusters,
    cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').Aks_Eligible_Clusters
| where AzureResourceId == azureResourceId
| count
```

No results + 24h passed since last Discovery timestamp → **Synchronizer** is problematic → Open CRI for `Defenders - CRIs`.

### Check AKS Permission Binder (AKS only)

```kusto
let azureResourceId = "<azure resource id>";
union cluster("romeeus.eastus").database('ProdRawEvents').Aks_Eligible_Clusters,
    cluster("romeuksouth.uksouth").database('ProdRawEvents').Aks_Eligible_Clusters
| where ingestion_time() > ago(6h)
| where AzureResourceId == azureResourceId
| summarize Aks_Elligable_HaveData=count() by AzureResourceId
```

No results → **AksPermissionBinder** is problematic → See [Permission Binder failure TSG].

### Check Agentless Manager

```kusto
let azureResourceId = "<azureResourceId>";
union cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').K8S_Agentless_Tasks,
    cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').K8S_Agentless_Tasks
| extend AzureResourceId = ClusterInfo["AzureResourceId"]
| where AzureResourceId == azureResourceId
| count
```

No results → **Agentless Manager** is problematic → Open CRI for `Defenders - CRIs`.

### Check K8s Proxy vs Map Exporter

```kusto
let azureResourceId = "<azure resource id>";
union cluster("romeeus.eastus").database('ProdRawEvents').K8S_Agentless_Pods,
    cluster("romeuksouth.uksouth").database('ProdRawEvents').K8S_Agentless_Pods
| where ingestion_time() > ago(6h)
| where AzureResourceId == azureResourceId
| summarize K8s_agentless_HaveData=count() by AzureResourceId
```

- No results → **K8s Proxy** is problematic → See [K8s Proxy failure TSG]
- Has results → **Map Exporter** is problematic → See [Map Exporter failure TSG](ado-wiki-c-tsg-map-exporter-failure.md)

### EKS Only — Check Authentication Binding

```kusto
let AcountId = "<aws account id>";
let ClusterName = "<relevant eks cluster name>";
cluster('https://mdcprd.centralus.kusto.windows.net').database("Detection").Span
| where TIMESTAMP > ago(7d)
| where name == "EksKubernetesClientFactory.Factory"
| extend customData = todynamic(customData)
| extend accountId = tostring(customData["hierarchyId"])
| extend clusterName = tostring(customData["clusterName"])
| where accountId == AcountId and clusterName == ClusterName
| top 1 by TIMESTAMP
| project TIMESTAMP, OperationResult, clusterName, accountId
```

- `Success` → binding OK
- `Failure`/`ClientError` → Open CRI for `Cloud/Protectors - Shilo's Team`
