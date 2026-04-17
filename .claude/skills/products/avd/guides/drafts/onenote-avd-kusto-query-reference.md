# AVD Kusto Query Reference (OneNote)

## Cluster Endpoints

| Environment | Endpoint | Access |
|------------|----------|--------|
| Public Azure | rdsprod.eastus2.kusto.windows.net | MyAccess: WVDCssFT |
| Public Azure (US) | rdsprodus.eastus2.kusto.windows.net | MyAccess: WVDCssFT |
| Public Azure (EU) | rdsprodeu.westeurope.kusto.windows.net | MyAccess: WVDCssFT |
| Mooncake | rdskmc.chinaeast2.kusto.chinacloudapi.cn | IDWeb: redmond\AVDMooncakeCSSSG |

Database: `WVD`

---

## Search for Failures (DiagActivity + DiagError)

```kql
let GetDataFrom = (clusterName:string)
{
cluster(clusterName).database('WVD').
DiagActivity
| where UserName contains "@contoso.com"
| join (cluster(clusterName).database('WVD').DiagError) on $left.Id == $right.ActivityId
| where env_time >= ago(14d)
| project env_time, UserName, Id, ClientType, Type, Outcome, ErrorSource, ReportedBy, ErrorOperation, ErrorCode, ErrorInternal, ErrorCodeSymbolic, ErrorMessage, SessionHostSessionId, SessionHostName, SessionHostPoolName, ClientIPAddress
| sort by env_time desc
};
GetDataFrom('rdskmc.chinaeast2.kusto.chinacloudapi.cn')
```

## Agent to Broker Heartbeat (RDInfraTrace)

Check if agent sends heartbeats to broker correctly (every 30 seconds):

```kql
let GetDataFrom = (clusterName:string)
{
cluster(clusterName).database('WVD').
RDInfraTrace
| where HostInstance == "{sessionHost}"
| where PreciseTimeStamp >= {starttime}
| where Category contains "Heartbeat" or Msg contains "Heartbeat"
| where Category != "Microsoft.RDInfra.Diagnostics.DataSink.RestPipelineSink"
| project PreciseTimeStamp, ActivityId, Level, Category, Role, HostInstance, Msg
| take 1000
};
GetDataFrom('rdskmc.chinaeast2.kusto.chinacloudapi.cn')
```

## GW Broker Trace (RDInfraTrace + RDClientTrace)

Identify Gateway and Connection Broker instances used in a connection:

```kql
// From RDInfraTrace
let GetDataFrom = (clusterName:string)
{
cluster(clusterName).database('WVD').
RDInfraTrace
| where ActivityId == {activityId}
| where Category == "Microsoft.RDInfra.Diagnostics.AspExtensions.RequestHeadersLoggingMiddleware"
| where Msg has "Host"
| project PreciseTimeStamp, ActivityId, Level, Category, Role, Msg
};
GetDataFrom('rdskmc.chinaeast2.kusto.chinacloudapi.cn')

// From RDClientTrace
let GetDataFrom = (clusterName:string)
{
cluster(clusterName).database('WVD').
RDClientTrace
| where ActivityId == {activityId}
| where Msg has "rdgateway"
| project TIMESTAMP, ClientOS, ClientType, ClientInstance, ClientIP, Level, TaskName, ChannelName, EventId, Msg
};
GetDataFrom('rdskmc.chinaeast2.kusto.chinacloudapi.cn')
```

## Get WVD Deployment Info (RDTenant / HostPool / AppGroup)

> Note: RDTenant, HostPool, AppGroup tables may not have data in Mooncake. Use ASC instead.

```kql
// Get Resource Group ID
cluster(clusterName).database('WVD').RDTenant
| where TenantGroupId == "<subscription id>"
| where env_time >= ago(2d)
| project env_time, Name, Id, CreationDate, TenantGroupId, AzureADId

// Get HostPools
cluster(clusterName).database('WVD').HostPool
| where TenantId == "<resource group id>"
| where env_time >= ago(2d)
| project Name, Id, PoolType, SHCount

// Get Application Groups
cluster(clusterName).database('WVD').AppGroup
| where HostPoolId == "<host pool id>"
| where env_time >= ago(1d)
| project Name, Id, UsersCount, PubAppsCount, Type, env_time
```

## Get WVD VM Info (RDAgentMetadata)

```kql
// By Activity ID
cluster(clusterName).database('WVD').RDAgentMetadata
| where ActivityId == "{activityId}"
| where TIMESTAMP >= datetime(2021-01-01 00:00)
| project TIMESTAMP, ActivityId, SubscriptionId, Env, Ring, Geo, Region, Location, OsType, Sku, VmSize, RDTenant, HostPool, HostInstance

// By Subscription ID
// ... | where SubscriptionId == "{subscriptionId}"

// By Host Pool Name
// ... | where HostInstance has "{hostpoolName}" | where SubscriptionId == "{subscriptionId}"

// By Session Host FQDN
// ... | where HostInstance has "{sessionHostFqdn}"
```

## Health Checks (RDOperation)

Health checks performed by WVD Agent:
- SxSStackListenerCheck
- DomainReachableHealthCheck
- DomainTrustCheckHealthCheck
- DomainJoinedCheck
- FSLogixHealthCheck
- MonitoringAgentCheck
- SessionHostCanAccessUrlsCheck
- RDAgentCanReachRDGatewayURL
- RdInfraAgentConnectToRdBroker
- WebRTCRedirectorHealthCheck

```kql
// Health Check Failures by Subscription
cluster(clusterName).database('WVD').RDOperation
| where AADTenantId == {subscriptionId}
| where TIMESTAMP >= ago(1d)
| where Name in ("SxSStackListenerCheck","DomainReachableHealthCheck","DomainTrustCheckHealthCheck","DomainJoinedCheck","FSLogixHealthCheck","MonitoringAgentCheck","SessionHostCanAccessUrlsCheck","RDAgentCanReachRDGatewayURL","RdInfraAgentConnectToRdBroker","WebRTCRedirectorHealthCheck")
| where ResType != "Success"
| project TIMESTAMP, AADTenantId, ActivityId, Ring, HostPool, HostInstance, Name, ResType, ResSignature, ResDesc

// By Session Host FQDN
// ... | where HostInstance has {sessionHost}

// By Activity ID
// ... | where ActivityId == {activityId}
```

## RD Client Trace (RDClientTrace)

```kql
cluster(clusterName).database('WVD').RDClientTrace
| where ActivityId == {activityId}
| project TIMESTAMP, ClientOS, ClientType, ClientInstance, ClientIP, Level, TaskName, ChannelName, EventId, Msg
```

## RD Infra Trace (RDInfraTrace)

Gateway, Diag, RDWeb, Broker service traces:

```kql
// By Activity ID
cluster(clusterName).database('WVD').RDInfraTrace
| where ActivityId == {activityId}
| project PreciseTimeStamp, ActivityId, Level, Category, Role, HostInstance, HostPool, Msg

// Errors/Warnings only: add | where Level == 1 or Level == 2 or Level == 3

// By Host Pool
// ... | where HostPool has {hostpool} | where PreciseTimeStamp >= {starttime} and PreciseTimeStamp <= {endtime}

// By Session Host FQDN
// ... | where HostInstance has "{sessionHostFqdn}" | where PreciseTimeStamp >= {starttime} and PreciseTimeStamp <= {endtime}
```

## RDSH Trace (RDPCoreTSEventLog)

```kql
// By Activity ID
cluster(clusterName).database('WVD').RDPCoreTSEventLog
| where ActivityId == {activityId}
| project TIMESTAMP, ActivityId, Level, ProviderName, EventMessage, Message

// Errors/Warnings only: add | where Level == 1 or Level == 2 or Level == 3
```
