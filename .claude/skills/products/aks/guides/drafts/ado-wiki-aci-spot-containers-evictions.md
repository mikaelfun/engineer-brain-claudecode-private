---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] ACI Spot Containers Waiting State Due To Evictions"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20Spot%20Containers%20Waiting%20State%20Due%20To%20Evictions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# TSG ACI Spot Containers Waiting State Due To Evictions

## Error Message

Spot Container is in 'Waiting' state after reaching 'Running' state. This typically happens when the undelying Spot VM is evicted and all containers within the Container Group are waiting for a new node to be assigned.

Spot VM node evictions can happen any time due to capacity adjustments.
To know if an evcition has happened we query CRP(Compute Resource Provider) and look for eviction events FabricCallback.OnVMScaleSetVMsEvicted.POST and then map these evictions in Service fabric and check for when the move was initiated to another VM in same or different cluster.

## Eviction Scenarios

All these scenarios are captured by the following query:

## Spot ContainerGroup Evictions Query

Plug-in these user inputs to the following query:

* startTime: Start time for query search
* endTime: End time for query search
* cg_location: container group location
* resource_group: resource group name
* container_group: container group name
* cg_subscription_id: Container group subscription Id

```sql
// User Input
let startTime=datetime(2023-04-16 10:00:00);
let endTime=datetime(2023-04-17 15:00:00);
let cg_location="{region}";
let resource_group="{rg_name}";
let container_group="{cg_Name}";
let cg_subscription_id="sub_id";
/// User Input End
let poolId="acispot"; // pool id remains same as we are looking at Spot
let VMEvictions=
cluster('azcrp.kusto.windows.net').database('crp_allprod').ApiQosEvent_nonGet
| where PreciseTimeStamp  between (startTime .. endTime)
| where operationName == "FabricCallback.OnVMScaleSetVMsEvicted.POST"
| where region =~ cg_location
| where resourceGroupName startswith "sbz"
| extend devNodeName=parse_json(requestEntity).roleInstanceNames
| mv-expand devNodeName
| extend EvictionTime = PreciseTimeStamp-((e2EDurationInMilliseconds / 1000) * 1sec)
| project EvictionTime, subscriptionId, operationName, devNodeName=tostring(devNodeName), clusterId=tolower(substring(resourceGroupName,indexof(resourceGroupName,"-")+1,36));
let AppDeployments=
cluster('Accprod').database('accprod').SubscriptionDeployments 
| where PreciseTimeStamp  between (startTime .. endTime)
| where priority == "Spot"
| where subscriptionId == cg_subscription_id
| where resourceGroup == resource_group
| where containerGroup == container_group
| where location =~ cg_location
| project Application=clusterDeploymentName, subscriptionId, resourceGroup, containerGroup, location;
let AppJumpEvents = 
materialize(AppDeployments | join kind = innerunique
(union 
cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent) on $left.location==$right.Tenant
| where Role startswith strcat("/pools/", poolId)
| where EventId == "17612" //StateTransition Event
| extend data=parse_json(Message)
| where data.Phase=="1" //MoveSecondary
| where data.Action=="6" //NoActionNeeded
| where data.MoveCost=="3" //High
| where data.Service startswith strcat("fabric:/", Application)
| where TIMESTAMP between (startTime  .. endTime)
| extend NodeId=tostring(data.TargetNode)
| project StartTime=PreciseTimeStamp,
    clusterId=substring(Role, strlen(Role) - indexof(reverse(Role), reverse("/")) - strlen("/")+1),
    Role,
    NodeId,
    Application,
    AtlasRegion,
    OperationCategory=data.category,
    resourceGroup, containerGroup, location);
let AppClusterRoles=AppJumpEvents | project Role;
let AppClusterRegion=AppJumpEvents | distinct AtlasRegion;
let NodeInfo=materialize
(union 
cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent   
| where AtlasRegion in (AppClusterRegion) 
| where Role in (AppClusterRoles)
| extend data=parse_json(Message)
| extend NodeId=substring(data.id,0,indexof(data.id,":"))
| where data.EventType == "ApplicationHostManager"
| where RoleInstance startswith "_Dev_"
| where TIMESTAMP between (startTime .. endTime)
| distinct NodeId, RoleInstance, Role);
let CGStartTimes=
NodeInfo |
join kind = innerunique (AppJumpEvents) on NodeId, $left.Role==$right.Role
| project StartTime, 
AtlasRegion, 
devNodeName=RoleInstance,
clusterId,
NodeId,
Application,
OperationCategory;
VMEvictions
| join kind=rightouter CGStartTimes on devNodeName, $left.clusterId==$right.clusterId
| partition hint.strategy = native by Application(
    sort by StartTime asc
    | extend nextStartTime=next(StartTime,1)
    | extend jumpDuration = nextStartTime-EvictionTime
    | summarize JumpCount=dcount(devNodeName1)-1, JumpDurations=strcat_array(make_list(jumpDuration),","), VMWorkerNodes=strcat_array(make_list(devNodeName1), ","), StartTimeStamps=strcat_array(make_list(StartTime), ","), EvictionTimeStamps=strcat_array(make_list(EvictionTime), ",") by Application, AtlasClusterId=clusterId1, AtlasRegion
    | where JumpCount > 0
)
| project  ContainerGroupSubscriptionId=cg_subscription_id,
            ResourceGroup = resource_group,
            ContainerGroupName = container_group, 
            ApplicationId = Application,
            JumpCount,
            JumpDurations,
            VMWorkerNodes,
            EvictionTimeStamps,
            StartTimeStamps,
            AtlasClusterId,
            Location = cg_location,
            AtlasRegion,
            poolId
```

## Analyzing Spot eviction query results

### Query Result Fields

| Field | Description |
|--|--|
| ContainerGroupSubscriptionId | Subscription Id used to deploy the Container Group |
| ResourceGroup | Resource Group in which ContainerGroup resides |
| ContainerGroupName | Name of the ContainerGroup |
| ApplicationId | Customer's ContainerGroup application id |
| JumpCount | How many times the CG exited due to eviction |
| JumpDurations | How much time it took for each jump due to eviction |
| VMWorkerNodes | Actual Node Ids where ContainerGroup was present |
| EvictionTimestamp | When the actual eviction of the VM Worker Node occured |
| StartTimeStamps | Initial StartTime for ContainerGroup application on the node and then all others after the jump on other node |
| AtlasClusterId | Actual clusterId in backend where the ContainerGroup is present |
| Location | Location where the ContainerGroup is deployed |
| AtlasRegion | Region where the cluster and ContainerGroup group is present |
| PoolId | Backend Cluster's pool Id |
