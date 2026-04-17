---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/Archived Content/Deprecated Content/DEPRECATED_Kusto Queries for NON-FTEs"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/Archived%20Content/Deprecated%20Content/DEPRECATED_Kusto%20Queries%20for%20NON-FTEs"
importDate: "2026-04-05"
type: troubleshooting-guide
status: deprecated
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8b502565&URL=https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/648826&Instance=648826&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8b502565&URL=https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/648826&Instance=648826&Feedback=2)

___
<div id='cssfeedback-end'></div>

<table style="margin-left:.34in">
  <tr style="background:#ffeeff;color:black">
    <td>
      <p>&#10071; <b>Important</b></p>
<p>The Scrubbed database for non-FTEs is no longer available, so the below listed queries will not work anymore. Non-FTEs will need to either use the queries from within ASC (preferred method) or to reach out to an FTE if running Kusto queries is needed.</p>
    </td>    
  </tr>
</table>


[[_TOC_]]

## Introduction

Databases for non-FTE are different,  but not just these, tables also change, that's the reason why it was usually confusing. The purpose is that now all non-FTEs can run any query just by copying and pasting it, making this process more efficient for us and our customers in a matter of time. 

Just like for any query, some parts must be edited depending on what you want to see. Usually, this will be specified in the query.

## TIMESTAMP

Into these queries, we can find two types of TIMESTAMP, one with the function  "ago" and another with the function "datetime".

### Ago 
It will specify how many days ago you would like the query to run Ago(#d)

### Datetime 
it will specify a specific time range, it is used in format datetime(YYYY-MM-DD)


# Must common use Kusto Queries

## Health Checks
### Health Checks using Session Host Name
 

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDOperationScrub
| where HostInstance contains "computer FQDN"
| where Name == "SxSStackListenerHealthCheck" or Name == "DomainReachableHealthCheck" or Name == "DomainTrustCheckHealthCheck" 
or Name == "DomainJoinedCheck" or Name == "FSLogixHealthCheck" or Name == "MonitoringAgentCheck" or Name == "SessionHostCanAccessUrlsCheck" 
or Name == "RDAgentCanReachRDGatewayURL" or Name == "RdInfraAgentConnectToRdBroker" or Name == "WebRTCRedirectorHealthCheck" or Name contains "RDAgentCanReachRDGatewayURL"
or Name contains "RdInfraAgentConnectToRdBroker"
| where TIMESTAMP  >= ago(1d)
| project TIMESTAMP, AADTenantId, ActivityId, Ring, HostPool, HostInstance, Name, ResType, ResSignature, ResDesc
```

 
### Health Check using Session Host Name and only show failures



```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDOperationScrub
| where HostInstance contains "computer FQDN"
| where Name == "SxSStackListenerHealthCheck" or Name == "DomainReachableHealthCheck" or Name == "DomainTrustCheckHealthCheck" or 
Name == "DomainJoinedCheck" or Name == "FSLogixHealthCheck" or Name == "MonitoringAgentCheck" or Name == "SessionHostCanAccessUrlsCheck" 
or Name == "RDAgentCanReachRDGatewayURL" or Name == "RdInfraAgentConnectToRdBroker" or Name == "WebRTCRedirectorHealthCheck" or 
Name contains "RDAgentCanReachRDGatewayURL" or Name contains "RdInfraAgentConnectToRdBroker"
| where ResType != "Success"
| where TIMESTAMP  >= ago(1d)
| project TIMESTAMP, AADTenantId, ActivityId, Ring, HostPool, HostInstance, Name, ResType, ResSignature, ResDesc
```



 
### WVD Session Host Trace using Activity ID

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDPCoreTSEventLogScrub
| where ActivityId == "ActivityID"
| project TIMESTAMP, ActivityId, Level, ProviderName, EventMessage, Message
```

 
 
### WVD Session Host Trace using Activity ID and only show errors and warnings

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDPCoreTSEventLogScrub
| where ActivityId == "ActivityID"
| where Level == 1 or Level == 2 or Level == 3
| project TIMESTAMP, ActivityId, Level, ProviderName, EventMessage, Message
```

 
 
### RDInfraTrace using Activity ID

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDInfraTraceScrub
| where ActivityId == "ActivityId"
| project PreciseTimeStamp, ActivityId, Level, Category, Role, HostInstance, HostPool, Msg
```

 
### RDInfraTrace using Activity ID showing just errors and warnings

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDInfraTraceScrub
| where ActivityId == "ActivityId"
| where Level == 1 or Level == 2 or Level == 3
| project PreciseTimeStamp, ActivityId, Level, Category, Role, HostInstance, HostPool, Msg
```

 
## Missing Heartbeats

### DiagActivity Query

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").DiagActivityScrub
| where Id == "ActivityId"
| join DiagErrorScrub on $left.Id == $right.ActivityId
| project TIMESTAMP, UserName, Id, ClientOS, ClientType, Type, Outcome, ActRing, DiagTenantName, SessionHostPoolName,
SessionHostName, AgentVersion, AgentSxsStackVersion, SessionHostIPAddress,  ErrorSource, ReportedBy, ErrorOperation, 
ErrorCode, ErrorInternal, ErrorCodeSymbolic, ErrorMessage
```

##  Agent can't talk with the Broker
### RDOperation - Agent can't talk with the Broker

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDOperationScrub
| where HostInstance == "VM NAME"
| where Name contains "broker"
| where PreciseTimeStamp >= ago(1d)
| where ResType != "Success"
| project PreciseTimeStamp, ActivityId, HostInstance, Role, Name, ResType, ResSignature, ResDesc
```

 
### RDInfraTrace - Agent can't talk with the Broker

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDInfraTraceScrub
| where HostInstance == "VM NAME"
| where PreciseTimeStamp >= ago(1d)
| where Role == "RDAgent" and Msg contains "System.Net.Websockets"
| project PreciseTimeStamp, ActivityId, Level, Category, Role, HostInstance, Msg
```

## WVD VM Info

### Get VM Info using Activity ID 

```
//Date time needs to be specific, if you want to use days ago instead use  "ago(d)
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDAgentMetadataScrub
| where ActivityId == "ActivityId"
| where TIMESTAMP  >= datetime(start time)
| project TIMESTAMP, ActivityId, SubscriptionId, Env, Ring, Geo, Region, Location, OsType, Sku, VmSize, RDTenant, HostPool, HostInstance
```

 
### Get VM Info using HostPool Name

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDAgentMetadataScrub
| where HostInstance has "session host name"
| where TIMESTAMP  >= datetime(start time)
| project TIMESTAMP, ActivityId, SubscriptionId, Env, Ring, Geo, Region, Location, OsType, Sku, VmSize, RDTenant, HostPool, HostInstance
```

 
### Get VM Info using Session Host Name

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDAgentMetadataScrub
| where HostInstance has "session host name"
| where TIMESTAMP  >= datetime(start time)
| project TIMESTAMP, ActivityId, SubscriptionId, Env, Ring, Geo, Region, Location, OsType, Sku, VmSize, RDTenant, HostPool, HostInstance
```
 
## Get RTT of Connection

### Get RTT of connection using Activity ID      

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDAvgNetworkRttScrub
| where ActivityId == "ActivityId"
| project TIMESTAMP, EstRoundTripTimeInMs, GatewayRegion, HostInstance, Region
```

 
### Get RTT of all connections using AAD Tenant ID over 24 hours pending

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").DiagActivityScrub
| join kind=leftouter DiagErrorScrub on $left.Id == $right.ActivityId
| where AadTenantId == "Tenant ID" and EndDate > ago(3d) and Type == "Connection"
| join (RDAvgNetworkRttScrub |where IntervalStartTime > ago(3d)) on $left.Id == $right.ActivityId
| summarize percentiles(min_of(1000,EstRoundTripTimeInMs), 10, 25, 50) by bin(IntervalStartTime, 5m), SessionHostPoolName
| render timechart
```

 
 
### Get RTT of all connections of hostpool over 24 hours 

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").DiagActivityScrub
| join kind=leftouter DiagErrorScrub on $left.Id == $right.ActivityId
| where SessionHostPoolName == "HostPool Name" and EndDate > ago(1d) and Type == "Connection"
| join (RDAvgNetworkRttScrub |where IntervalStartTime > ago(1d)) on $left.Id == $right.ActivityId
| summarize percentiles(min_of(1000,EstRoundTripTimeInMs), 10, 25, 50) by bin(IntervalStartTime, 5m), SessionHostPoolName
| render timechart
```

 
### Get RTT of all connections of hostpool that went through specific gateway over 24 hours    

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").DiagActivityScrub
| where SessionHostPoolName == "HostPool Name" and EndDate > ago(1d) and Type == "Connection"
| join (RDAvgNetworkRttScrub |where IntervalStartTime > ago(1d)) on $left.Id == $right.ActivityId
| where GatewayRegion == "Gateway Region"
| summarize percentiles(min_of(1000,EstRoundTripTimeInMs), 10, 25, 50) by bin(IntervalStartTime, 5m), SessionHostPoolName
| render timechart
```


## Invalid Registration Token


```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDOperationScrub
| where HostInstance contains "part or full computer name - for example WVD-0, azureguides, or WVD-0.azureguides.com" 
| where TIMESTAMP >= ago(1d)
| where ResSignature has "INVALID_REGISTRATION_TOKEN"
| project TIMESTAMP, ActivityId, HostInstance, Role, Name, ResType, ResSignature, ResDesc
```

 

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDInfraTraceScrub
| where HostInstance contains "part or full computer name - for example WVD-0, azureguides, or WVD-0.azureguides.com" 
| where TIMESTAMP >= ago(1d)
| where Msg has "INVALID_REGISTRATION_TOKEN"
| project PreciseTimeStamp, ActivityId, Level, Category, Role, HostInstance, Msg
```

## Agent Information and crashes

### Agent Version

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").DiagActivityScrub
| where SessionHostName has "vm name"
| where env_time >= ago(5d)
| project env_time, Id, ActRing, SessionHostName, AgentVersion, AgentSxsStackVersion
```

 
### Agent Upgrade

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDInfraTraceScrub
| where HostInstance == "wvd vm"
| where TIMESTAMP  >= datetime(start time frame) and TIMESTAMP <= datetime(end time frame)
| where Category == "RDAgent.AgentUpdaterService.AgentBackgroundUpdater" or Category == "Microsoft.RDInfra.AgentUpdateTelemetry.Impl.AgentUpdateTelemetryImpl" or 
Category == "Microsoft.RDInfra.RDAgent.Service.AgentDownloadHdlrImpl" or Category == "Microsoft.RDInfra.RDAgent.Service.RDAgentUpdateHandler" or Category == 
"Microsoft.RDInfra.RDAgent.Service.AgentUpdateStateImpl" or Category == "Microsoft.RDInfra.RDAgent.Service.AgentInstallImpl"
| project TIMESTAMP, ActivityId, Role, Category, HostInstance, Msg
```


###  Agent crashes by Session Host Name

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDPCoreTSEventLogScrub
| where HostInstance contains "session host name"
| where TIMESTAMP > ago(1d)
| where ProviderName == "LSM"
| where Message startswith "szOutput=\"ERR::RCM process exit "
| project TIMESTAMP, ActivityId, Level, ProviderName, HostInstance, HostPool, Message, EventMessage
```



 
### Agent crashes by Host Pool

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDPCoreTSEventLogScrub
| where HostPool contains "host pool name"
| where TIMESTAMP > ago(1d)
| where ProviderName == "LSM"
| where Message startswith "szOutput=\"ERR::RCM process exit "
| project TIMESTAMP, ActivityId, Level, ProviderName, HostInstance, HostPool, Message, EventMessage
```
# Other AVD Queries 

### WVD Orchestration Trace

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDInfraTraceScrub
| where ActivityId == "ActivityId"
| where Category == "Microsoft.RDInfra.RDBroker.Services.OrchestrationService" or Category == "Microsoft.RDInfra.RDBroker.Authorization.RDmiAuthorizationService" 
or Category == "Microsoft.RDInfra.RDBroker.BrokerSessionManager.RDSBrokerConnectionManager" or Category == 
"Microsoft.RDInfra.RDBroker.BrokerSessionManager.SessionManager" or Category == "Microsoft.RDInfra.RDAgent.Service.Services.AgentOrchestrationService" or 
Category == "Microsoft.RDInfra.Shared.Common.RestErrorFilter.RestErrorExceptionFilter" or Category == 
"Microsoft.RDInfra.AgentBrokerCommunication.Server.SessionHostAgentManager" or Category == 
"Microsoft.RDInfra.RDBroker.BrokerSessionManager.RDSBrokerConnectionManager" or Category == 
"Microsoft.RDInfra.RDGateway.Services.ConnectionsService.ConnectionsService_v2"
| project TIMESTAMP, Role, Category, Level, Msg
```

 
### Last 10 Packets (x10 incoming/outgoing (gateway stack and client) = 40

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDInfraTraceScrub
| where ActivityId == "ActivityId"
| where Msg contains "Last 10"
| project TIMESTAMP, ActivityId, Role, Msg
```

 
### **Get Client IP, WVD Gateway + WVD Broker, and RDSH IP**

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDInfraTraceScrub
| where ActivityId == "ActivityId"
| where Category == "Microsoft.RDInfra.Diagnostics.AspExtensions.RequestHeadersLoggingMiddleware" or Category == 
"Microsoft.RDInfra.RDBroker.Services.OrchestrationService"
| where Msg contains "Host" or Msg contains "CLIENT-IP" or Msg contains "Sending orchestration request to the host"
| project TIMESTAMP, ActivityId, Role, Msg
```

 
## WVD Tenant Information 

### Get WVD Tenant(s)/Workspace(s)

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDTenantScrub
| where AzureADId == "Tenant Id"
| where env_time >= ago(1d)
| project Name, Id, TenantGroupId, AzureADId, CreationDat
```

 
### Get HostPools

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").HostPoolScrub
| where TenantId == "Id from above query"
| where env_time >= ago(1d)
| project Name, TenantId, Id, PoolType, SHCount
```

 
### Get Application Groups

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").AppGroupScrub
| where HostPoolId == "Id from above query"
| where env_time >= ago(1d)
| project Name, Id, UsersCount, PubAppsCount, Type
```

 
## Drain Mode Operations

Get Session Host Update Event Activity ID by Subscription

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").DiagActivityScrub
| where ArmPathSubscriptionId == "Azure Sub"
| where Type == "Management" and Method == "Update" and Route == "ArmSessionHost::UpdateSessionHost"
| where TIMESTAMP >= ago(1d)
| project TIMESTAMP, UserName, Id, Type, Outcome, Method, Route, ObjectsFetched, ObjectsCreated, ObjectsUpdated, ObjectsDeleted, Object
```

 
Get Session Host Update Event Activity ID by Subscription

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").DiagActivityScrub
| where ArmPathSubscriptionId == "Azure Sub"
| where Type == "Management" and Method == "Update" and Route == "ArmSessionHost::UpdateSessionHost"
| where TIMESTAMP >= datetime(start time) and TIMESTAMP <= datetime(end time)
| project TIMESTAMP, UserName, Id, Type, Outcome, Method, Route, ObjectsFetched, ObjectsCreated, ObjectsUpdated, ObjectsDeleted, Object
```

 
Get Update Session Host Activity ID by Subscription

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").DiagActivityScrub
| where ArmPathSubscriptionId == "<azure sub>"
| where Type == "Management" and Method == "Update" and Route == "ArmSessionHost::UpdateSessionHost"
| where TIMESTAMP >= ago(1d)
| project TIMESTAMP, UserName, Id, Type, Outcome, Method, Route, ObjectsFetched, ObjectsCreated, ObjectsUpdated, ObjectsDeleted, Object
```


 
## Throttling

### Check if Tenant is getting throttled by WVD Service

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDOperationScrub
| where AADTenantId == "aad id"
| where PreciseTimeStamp >= ago(1d)
| where IsThrottled == true
| project PreciseTimeStamp, AADTenantId, ActivityId, Name, UserName, IsThrottled, ResSignature, ResDesc
```

 
### Check if Tenant is getting throttled by Azure - Requires permissions to ARM PROD Kusto Database [https://armprod.kusto.windows.net]

```
HttpIncomingRequests  Not Availble
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDOperationScrub
| where subscriptionId == "azure subscription id"
| where TIMESTAMP > ago(1d)
| where httpStatusCode == 429
```


 
 
## Name Already Registered
 

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDInfraTraceScrub
| where HostInstance contains "part or full computer name - for example WVD-0, azureguides, or WVD-0.azureguides.com" 
| where TIMESTAMP >= ago(1d)
| where Msg has "NAME_ALREADY_REGISTERED"
| project TIMESTAMP, ActivityId, Level, Category, Role, HostInstance, Msg
```

 

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDOperationScrub
| where HostInstance contains "part or full computer name - for example WVD-0, azureguides, or WVD-0.azureguides.com" 
| where TIMESTAMP >= ago(1d)
| where ResSignature has "NAME_ALREADY_REGISTERED"
| project TIMESTAMP, ActivityId, HostInstance, Role, Name, ResType, ResSignature, ResDesc
```


 
## Errors 

### Check for SID Mismatch 

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDInfraTraceScrub
| where ActivityId == "ActivityId" and Role !has "diag" and Msg has "SID" 
| project PreciseTimeStamp, Role, Category, HostInstance, Msg | order by PreciseTimeStamp asc
```

 
### VM failed to start

```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").RDOperationScrub
| where Name == "ComputeAPIVMOperation"
| project ActivityId, Name
    | join cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").DiagActivityScrub on $left.ActivityId == $right.Id
        | project UserName, Outcome, Id, StartDate, AadTenantId, Name, ActivityId
    | join cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").DiagErrorScrub on $left.Id == $right.ActivityId
        | where ErrorCodeSymbolic == "ConnectionFailedPersonalDesktopFailedToBeStarted"
        | project ErrorCodeSymbolic, ErrorMessage, AadTenantId, StartDate, ActivityId
```

### Error by Activity ID



```
cluster("rdsprodus2.westus2.kusto.windows.net").database("WVD").DiagActivityScrub

| where Id == "751e6194-db2c-436e-af40-42f4dac70000"

| join DiagErrorScrub on $left.Id == $right.ActivityId

| project TIMESTAMP, UserName, Id, ClientOS, ClientType, Type, Outcome, ActRing, DiagTenantName, SessionHostPoolName, SessionHostName, AgentVersion,

AgentSxsStackVersion, SessionHostIPAddress,  ErrorSource, ReportedBy, ErrorOperation, ErrorCode, ErrorInternal, ErrorCodeSymbolic, ErrorMessage
```
