---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Check whether overlake is enabled on the backend host of the AKS nodes"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FCheck%20whether%20overlake%20is%20enabled%20on%20the%20backend%20host%20of%20the%20AKS%20nodes"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Check whether overlake is enabled on the backend host of the AKS nodes

> IMPORTANT NOTE: The information in this wiki is **STRICTLY** Microsoft Confidential. Do not share this information with customers under any circumstance. Any questions, please discuss with a TA.

## Summary

This article aims to provide a method to check whether overlake is enabled on the backend host of the AKS nodes and check the historic agent pool/VMSS of the AKS cluster.

## Details

### What is Overlake?

Overlake expands the reach of Azure into Mission Critical and Cost Sensitive Workloads through the addition of dedicated hardware that increases performance, reduces jitter and improves latency resulting in more deterministic customer workloads.

- [Architecture Document](https://eng.ms/docs/cloud-ai-platform/azure-core/core-compute-and-host/general-purpose-host-arunki/host-networking/datapath-documentation/overlake/overview)

### Kusto Query

Check the status of the current AKS nodes.

- If SocNodeId has a string of characters, it means overlake is enabled on the backend host.
- If SocNodeId is "00000000-0000-0000-0000-000000000000", it means overlake isn't enabled.

```kql
let qCCP = "<CCP_ID>";
let qNodePool = "";
let qInstance = "";
let AKSCCPlogsKusto = "https://aksccplogshk.eastasia.kusto.windows.net";
set best_effort=true;
let InjectBase10_Temp = (T:(*)) {
    let hextra_length = 6;
    let charList = "0123456789abcdefghijklmnopqrstuvwxyz";
    T
    | extend base36 = tolower(column_ifexists('base36', ''))
    | extend profile = column_ifexists('availabilityProfile', '')
    | extend hexatridecimal = iff(profile =~ 'AvailabilitySet', 'n/a', substring(base36, strlen(base36) - hextra_length, strlen(base36)))
    | extend parts = split(base36, '-')
    | extend ss_name = case(
        base36 contains "vmss", tostring(substring(base36, 0, indexof(base36, 'vmss') + 4)),
        profile =~ 'AvailabilitySet', strcat(parts[0], "-", parts[1], "-", parts[2]),
        substring(base36, 0, strlen(base36) - hextra_length)
    )
    | extend reversed = reverse(hexatridecimal)
    | extend power_0 = toint(indexof(charList, substring(reversed, 0, 1))) * pow(36, 0)
    | extend power_1 = toint(indexof(charList, substring(reversed, 1, 1))) * pow(36, 1)
    | extend power_2 = toint(indexof(charList, substring(reversed, 2, 1))) * pow(36, 2)
    | extend power_3 = toint(indexof(charList, substring(reversed, 3, 1))) * pow(36, 3)
    | extend power_4 = toint(indexof(charList, substring(reversed, 4, 1))) * pow(36, 4)
    | extend power_5 = toint(indexof(charList, substring(reversed, 5, 1))) * pow(36, 5)
    | extend sum_of_powers = toint(power_0 + power_1 + power_2 + power_3 + power_4 + power_5)
    | extend base10 = case(
        profile =~ 'AvailabilitySet', base36,
        profile =~ 'VirtualMachines', base36,
        isnotempty(hexatridecimal), strcat('_', ss_name, '_', sum_of_powers),
        ''
    )
    | project-away reversed, power_0, power_1, power_2, power_3, power_4, power_5, sum_of_powers, parts, profile
};
let nodePools = materialize(
    cluster(AKSprodURI()).database('AKSprod').AgentPoolSnapshot
    | where PreciseTimeStamp > ago(1h)
    | where cluster_id =~ qCCP and (isempty(qNodePool) or name == qNodePool)
    | summarize 
        take_any(managedClusterResourceGroup, subscription, orchestratorVersion, osSku, vmSize, distro, configurationVersion, agentPoolVersionProfile, osType, availabilityProfile, mode) 
        by pool = name, cluster_id
    | extend nodeImageReference = tostring(agentPoolVersionProfile.nodeImageReference.id)
    | extend isWindows = osType =~ "windows"
);
let managedRG = toscalar(nodePools | take 1 | project managedClusterResourceGroup);
let subscription = toscalar(nodePools | take 1 | project subscription);
let noNodePools = datatable( pool:string ) ['']
| extend cluster_id=qCCP, managedClusterResourceGroup=managedRG, subscription=subscription, isWindows=false;
let allNodePools = union nodePools, noNodePools;
let infrainfo = materialize(
    cluster('AzureCM').database('AzureCM').LogContainerSnapshot
    | where subscriptionId contains subscription
    | where PreciseTimeStamp >= ago(2h)
    | where CloudName == 'Public' and Tenant !has 'TMBox'
    | distinct roleInstanceName, subscriptionId, creationTime, virtualMachineUniqueId, Tenant, containerId, nodeId, containerType 
    | join kind=inner(
    cluster('azuredcm').database('AzureDCMDb').ResourceSnapshotHistoryV1
    | distinct nodeId = ResourceId, SocNodeId = PairId, CpuArchitecture
    ) on nodeId
);
cluster('akshuba.centralus').database('AKSccplogs').KubeAudit
| where PreciseTimeStamp > ago(1h)
| where cluster_id =~ qCCP and objectRef.resource == 'nodes'
| where verb in ('patch', 'update') and level !in ('Metadata')
| extend node = tostring(objectRef.name)
| summarize hint.num_partitions = 24 hint.strategy=shuffle hint.shufflekey=node
    take_any(cluster_id, objectRef, requestObject, responseStatus),
    take_anyif(responseObject, responseObject != 'na')
    by node
| where requestObject.kind !in ('Binding', 'DeleteOptions')
| extend metadata = responseObject.metadata
| extend created = todatetime(metadata.creationTimestamp)
| extend metaSKU = tostring(metadata.labels['node.kubernetes.io/instance-type'])
| mv-apply address = coalesce(responseObject.status.addresses, dynamic([{"type": "InternalIP","address":""}])) on 
(
    where address.type == "InternalIP" | project internal_ip = tostring(address.address)
)
| extend base36 = node
| extend internal_ip = coalesce(internal_ip, "No Data")
| extend created = coalesce(created, datetime(null))
| extend poolFromName = case (
    base36 startswith "aks-", tostring(split(base36, '-')[1]),
    base36 startswith "aks", substring(base36, 3, strlen(base36) - 9),
    ""
)
| extend pool = coalesce(
    tostring(metadata.labels['kubernetes.azure.com/agentpool']), 
    tostring(metadata.labels['agentpool']),
    tostring(metadata.labels['karpenter.sh/nodepool']),
    poolFromName
)
| extend isUnmanagedNode = (pool == "" or isnotempty(metadata.labels['karpenter.sh/nodepool']))
| extend containerdRuntimeVersion = tostring(responseObject.status.nodeInfo.containerRuntimeVersion)
| extend kubeletVersion = tostring(responseObject.status.nodeInfo.kubeletVersion)
| extend isStretch = case(
    isempty(responseObject.metadata.labels), 'Unknown',
    iff(responseObject has "kubernetes.azure.com/stretch", "True", "False")
)
| where isempty(qNodePool) or pool == qNodePool
| join kind=leftouter allNodePools on cluster_id, pool
| invoke InjectBase10_Temp()
| extend base10 = column_ifexists("base10", '')
| where isempty(qInstance) or base10 == qInstance
| project cluster_id, base36, roleInstanceName=base10, hexatridecimal, pool, vmSize, orchestratorVersion
| join kind=leftouter infrainfo on roleInstanceName
| extend overlakeStatus = iif(SocNodeId == "00000000-0000-0000-0000-000000000000", "FALSE", "TRUE")
| project pool, vmSize, base36, roleInstanceName, orchestratorVersion, overlakeStatus, SocNodeId, creationTime, nodeId, virtualMachineUniqueId
| sort by base36
```

### Previous breakdown steps with Kusto, dridash and ASC

```kql
cluster('AzureCM').database('AzureCM').LogContainerSnapshot
| where subscriptionId == "<subscriptionId>"
| where roleInstanceName contains "<vmssName>"
| where PreciseTimeStamp >= ago(9h)
| project  roleInstanceName, containerType, Tenant, nodeId, containerId
| distinct roleInstanceName, containerType, Tenant, nodeId, containerId
| join kind=inner(
    cluster('azuredcm').database('AzureDCMDb').ResourceSnapshotHistoryV1
    | project nodeId = ResourceId, SocNodeId = PairId, CpuArchitecture
) on nodeId
| project roleInstanceName, containerType, Tenant, nodeId, containerId, SocNodeId, CpuArchitecture
| distinct roleInstanceName, containerType, Tenant, nodeId, containerId, SocNodeId, CpuArchitecture
```

**dridash in Azure Data Explorer**

Search the NodeId in [aka.ms/dridash](https://dataexplorer.azure.com/dashboards/bea4ccac-baf1-45f3-b160-533232cbfdaa).

- "True/10" - Enabled
- "False" - Not Enabled

**Note:** If you fail to get result from Azurehn database, you need to join to AznwKustoReader group. Navigate to IDWeb and select the one with the Description, "Azure Network Kusto Data Reader".
<https://idweb.microsoft.com/IdentityManagement/aspx/common/GlobalSearchResult.aspx?searchtype=e0c132db-08d8-4258-8bce-561687a8a51e&content=%20AznwKustoReader>

**You can get the NodeId from ASC.**

## Check the historic agent pool/VMSS of the AKS cluster

```kql
let startTime = ago(1d);
let subID = "<Subscription_Id>";
let cluster = "<Cluster_Name>";
cluster('akshuba.centralus').database('AKSprod').ManagedClusterSnapshot 
| where TIMESTAMP > startTime
| where subscription == subID
| where clusterName in (cluster)
| distinct managedClusterResourceGroup,clusterName
| lookup kind=leftouter (
cluster('azcrp.kusto.windows.net').database('crp_allprod').VmssVMApiQosEvent
    | where subscriptionId == subID
    | distinct vMScaleSetName,resourceGroupName,subscriptionId
    ) on $left.managedClusterResourceGroup==$right.resourceGroupName
| lookup kind=leftouter (
cluster('azcrpbifollower.kusto.windows.net').database('bi_allprod').VMScaleSet
    | where SubscriptionId contains subID
    | summarize min(PreciseTimeStamp), max(PreciseTimeStamp) by vmssName=tolower(VMScaleSetName), VMScaleSetTimeCreated
    | project vmssName, VMScaleSetTimeCreated, StartTimeStamp=min_PreciseTimeStamp, EndTimeStamp=max_PreciseTimeStamp
    ) on $left.vMScaleSetName==$right.vmssName
| lookup kind=leftouter (
cluster('azurecm.kusto.windows.net').database('AzureCM').LogContainerSnapshot
    | where subscriptionId == subID
    | extend vmssName=tostring(split(roleInstanceName,'_')[1])
    | distinct vmssName, containerType
    ) on $left.vMScaleSetName==$right.vmssName
| sort by VMScaleSetTimeCreated desc
```

## Reference

- <https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/677371/Project-Overlake>
- <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/928150/Overlake(SoC)-Node-Investigation_Restarts>
- <https://eng.ms/docs/cloud-ai-platform/ahsi-organization/ahsi/redsa-team/cloud-hardware-infrastructure-engineering-chie/csice-wiki/livesite-ops/overlake-playbook>

## Owner and Contributors

**Owner:** Tom Zhu <zhuwei@microsoft.com>
