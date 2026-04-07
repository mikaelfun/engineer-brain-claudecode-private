---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/PL/Kusto"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FSandbox%2FIn-Development%20Content%2FOutdated%3F%20-%20Needs%20review%20if%20still%20useful%2FPL%2FKusto"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Sandbox/In-Development content — may be outdated. Review before using."
---

# AVD Private Link — Kusto Diagnostic Queries

> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

## Josh Queries

### Feed Failure — Public Access Not Allowed

```kusto
//feed failure - public access not allowed
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDInfraTrace 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDInfraTrace 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("RDSProdAU.australiaeast.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").RDInfraTrace
| where ActivityId == "<ActivityId>"
| where Category contains "webfeed" and Msg contains "access"
| project TIMESTAMP, Role, Level, Category, Msg
```

### Connection Failure — Public Access Not Allowed

```kusto
//connection failure - public access not allowed
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDInfraTrace 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDInfraTrace 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("RDSProdAU.australiaeast.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").RDInfraTrace
| where ActivityId == "<ActivityId>"
| where Role == "RDGatewayRole" and Msg contains "connection request"
| project TIMESTAMP, Role, Level, Category, Msg
```

### Connection — Get AVD Private Endpoint Settings

```kusto
//connection - get avd private endpoint settings
// PrivateLinkID values: Null/1=Enabled, 2=Disabled, 3=EnabledForSessionHostsOnly, 4=EnabledForClientsOnly
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDOperation
| union cluster("RDSProdAU.australiaeast.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").RDOperation
| where ActivityId == "<ActivityId>"
| where Props contains "PrivateLinkID"
| project TIMESTAMP, RequestId, Name, Role, ResType, Props
```

**PrivateLinkID Reference:**
- `Null` = Default value (Enabled)
- `1` = Enabled
- `2` = Disabled
- `3` = EnabledForSessionHostsOnly
- `4` = EnabledForClientsOnly

### Connection — Get Private Endpoint Connection Info

```kusto
//connection - get private endpoint connection info
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").PrivateEndpointConnection
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").PrivateEndpointConnection
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").PrivateEndpointConnection
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").PrivateEndpointConnection
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").PrivateEndpointConnection
| union cluster("RDSProdAU.australiaeast.kusto.windows.net").database("WVD").PrivateEndpointConnection
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").PrivateEndpointConnection
| where PrivateEndpointId contains "<azure sub>"
| project env_time, ReportDate, env_cloud_name, Version, Id, GroupId, EndpointPoolId, ApplicationFeedId, ConnectionName, ConnectionProxyName, PrivateEndpointId, ServiceProxyId, ProvisioningState, ConnectionStatus
```

### Connection — Get Private Endpoint Details (DNS Records)

```kusto
//connection - get private endpoint details
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").PrivateEndpointConnectionDetail 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").PrivateEndpointConnectionDetail
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").PrivateEndpointConnectionDetail
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").PrivateEndpointConnectionDetail
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").PrivateEndpointConnectionDetail
| union cluster("RDSProdAU.australiaeast.kusto.windows.net").database("WVD").PrivateEndpointConnectionDetail
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").PrivateEndpointConnectionDetail
| where InternalFqdn contains "<prefix of dns record>"
| project env_time, ReportDate, env_cloud_name, LinkIdentifier, Id, ConnectionId, MemberName, CustomerVisibleFqdns, InternalFqdn, RedirectMapId, RedirectMapRegion
```

## PG Queries

### Get All PrivateEndpointConnections for Host Pool (via ActivityId)

```kusto
// get a list of all privateEndpointConnections for the hostpool this activityId went to
let activityId = "<ActivityId>";
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").DiagActivity
| union cluster("RDSProdAU.australiaeast.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").DiagActivity
| where ActivityId =~ activityId
| join kind=inner cluster("rdsppeus.westus2.kusto.windows.net").database("WVD").PrivateEndpointConnection on $left.SessionHostPoolId == $right.EndpointPoolId
| summarize arg_max(env_time, *) by ActivityId
| project ActivityId, PrivateEndpointId
```

### Feed — Private Link Specific Operations (Service Errors)

```kusto
// Feed -> private link specific operations feed calls to look for service errors
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDOperation
| union cluster("RDSProdAU.australiaeast.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").RDOperation
| where ActivityId == "<FeedActivityId>" and Name in ("PrivateLinkEarlyAccessCheck", "IsAccessFromNetworkAllowedForWorkspaceAsync")
```

### Connection — Private Link Specific Operations (Service Errors)

```kusto
// Connection -> private link specific operations connections calls to look for service errors
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDOperation
| union cluster("RDSProdAU.australiaeast.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").RDOperation
| where ActivityId == "<ConnectionActivityId>" and Name in (
    "PrivateLinkEarlyAccessCheck",
    "PrivateLinkEarlyAccessCheckService:IsAccessAllowedFromPrivateEndpoint",
    "PrivateLinkEarlyAccessCheckService:IsAccessAllowedFromEndpointAsync",
    "PvtLinkDir:GetResourceByIdAsync"
)
```
