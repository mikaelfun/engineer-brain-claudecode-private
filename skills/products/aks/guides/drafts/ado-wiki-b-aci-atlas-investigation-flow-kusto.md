---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] ACI ATLAS Investigation Flow Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20ACI%20ATLAS%20Investigation%20Flow%20Kusto"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ACI ATLAS Deep Investigation Flow using Kusto

Author: dayconlopes

## Summary

Sequential guide to investigate all types of events on ACI from top RP layer to Service Fabric. Follow the sequence from step 10 to 100 to get findings in ACI infrastructure at multiple levels.

Complement the investigation with Azure Service Insights (ASI). Make sure the ACI option has been added to your own menu profile before use.

## Investigation Flow (Steps 10–100)

### Step 10 — Get cluster deployment name

```kql
cluster('accprod').database('accprod').SubscriptionDeployments
| where TIMESTAMP between (datetime(2023-10-29T08:00:00.000Z)..datetime(2023-10-29T23:00:00.000Z))
| where subscriptionId == "<subscriptionId>"
| where containerGroup contains "<containerGroupCaasName>"
| project TIMESTAMP, containerGroup, clusterDeploymentName
```

### Step 20 — Get Service Fabric SingleInstance name

```kql
union cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where TaskName == "Hosting"
| where Message has "<clusterDeploymentName>"
| parse EventMessage with stuff "Entity={ Id=" SingleInstanceName ",ApplicationName=fabric:/" appName ",InstanceId=" instanceid
| where appName =~ "<clusterDeploymentName>"
| where SingleInstanceName !has "servicePkg"
| distinct SingleInstanceName
```

### Step 30 — Atlas Control Plane RP Events

Replace `{atlasRegion}` with format `WARP-Prod-<region>` (e.g., "WARP-PROD-BN" = East US 2).
List of all ACI regions: https://eng.ms/docs/products/service-fabric-asgard/warp-cluster-metadata/public-azure-cluster-metadata

```kql
cluster('atlaslogscp.eastus').database('telemetry').SeaBreezeRPEvent
| where Tenant =~ "{atlasRegion}"
| where TIMESTAMP between (datetime(...)..datetime(...))
| where Message has "{clusterDeploymentName}"
| where EventMessage !contains "ifx"
| where Level < 4
| extend dM=parse_json(Message)
| extend activity = dM.activityId, appName = parse_json(tostring(dM.context)).applicationName
| project TIMESTAMP, Tenant, appName, EventMessage, Level, Message
| order by TIMESTAMP asc
```

### Step 40 — Atlas Data Plane Service Fabric Events (Execution cluster)

```kql
union cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where AtlasRegion =~ "{atlasRegion}"
| where TaskName == "Hosting"
| where EventMessage has "{clusterDeploymentName}"
| project PreciseTimeStamp, Pid, Level, TaskName, RoleInstance, EventMessage, Tenant, Role, Message
| sort by PreciseTimeStamp asc
```

### Step 50 — CaaS deployment full lifecycle

```kql
let caasname= '{clusterDeploymentName}';
let poolname = "{poolname}"; // /pools/ACIBYOVNET/clusters/{clusterId}
let sininstance = "{SingleInstanceName}"; // SingleInstance_#####_App####
union cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where AtlasRegion =~ "{atlasRegion}"
| where Role has poolname
| extend jMessage = parse_json(Message)
| extend exitcode = extract('ExitCode=([^,]+),', 1, EventMessage)
| where Message has_any(caasname, sininstance)
| where TaskName notcontains 'Gateway'
| where TaskName has_any('Hosting','RA','FM','CM','PLB')
| where Message notcontains 'atlas-sidecar'
| project PreciseTimeStamp, TaskName, Type = jMessage.type, exitcode, EventMessage, RoleInstance, Message, Role, Level
| sort by PreciseTimeStamp asc
```

### Step 60 — Container Exit reason

```kql
let ATLASREGION = "{atlasRegion}";
let ROLE="{clusterId}-p-0";
let APP_SUFFIX="{clusterDeploymentName}";
cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where AtlasRegion contains ATLASREGION
| where TaskName contains "Hosting"
| where EventMessage !contains "sidecar"
| where Role contains ROLE
| where EventMessage contains APP_SUFFIX
| where EventMessage contains "ApplicationContainerInstanceExited"
| project PreciseTimeStamp, TaskName, RoleInstance, Pid, EventMessage, Tenant, Role
| sort by PreciseTimeStamp asc
| take 3000
```

### Step 70 — Find container exit code (7147/7148 = platform kill; ExitCode<>0 = app error)

```kql
let caasname= '{clusterDeploymentName}';
let poolname = '{poolname}';
let sininstance = '{SingleInstanceName}';
let region = "{atlasRegion}";
union cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where AtlasRegion has region
| where Role has poolname
| extend jMessage = parse_json(Message)
| extend exitcode = extract('ExitCode=([^,]+),', 1, EventMessage)
| where Message has_any(caasname, sininstance)
| where TaskName has_any('Hosting')
| where RoleInstance has '_Dev_'
| where Message has_any('terminated with exit','exitcode')
| where Message !has '-atlas-sidecar-'
| project PreciseTimeStamp, RoleInstance, exitcode, EventMessage, TaskName, Message, Role, Level
| sort by PreciseTimeStamp asc
```

### Step 80 — SF responses to Seabreeze (HTTP response codes)

```kql
cluster('atlaslogscp.eastus').database('telemetry').ServiceResponseEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where uri contains "{uri_identifier}"
| project PreciseTimeStamp, httpMethod, uri, responseCode, exception, activityId
```

### Step 90 — SF Node Down Events

```kql
union cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogseurope.northeurope').database('telemetry').SbzExecSFEvent,
      cluster('atlaslogsasiapacific.southeastasia').database('telemetry').SbzExecSFEvent
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where AtlasRegion =~ "{atlasRegion}"
| where Role has "{clusterId}"
| where EventMessage startswith "EventName: NodeDown" or EventMessage startswith "EventName: NodeUp"
| project TIMESTAMP, RoleInstance, TaskName, EventMessage, Message
```

### Step 100 — DNC logs (SF networking-related issues)

```kql
cluster('aznwsdn').database("ACN").Messages
| where Tenant has "DNC"
| where PreciseTimeStamp between (datetime(...)..datetime(...))
| where CustomDimensions has_any("{clusterId}")
| where Raw has_any "{networkId}"
| project Timestamp, Level, Raw, CustomDimensions, CustomDimensionsJson, ClientIp, Tenant
```

## Other Resources

- ICM: [541562239](https://portal.microsofticm.com/imp/v5/incidents/details/541562239/summary)
- https://learn.microsoft.com/en-us/azure/container-instances/container-instances-troubleshooting
- https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-instances/management/container-group-restart-killing-event-interruption

## Owner and Contributors

**Owner:** Daycon Lopes <dayconlopes@microsoft.com>
