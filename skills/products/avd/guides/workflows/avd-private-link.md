# AVD Private Link — 排查工作流

**来源草稿**: ado-wiki-b-private-link-asc-feature-tracking.md, ado-wiki-b-private-link-collect-info-guide.md, ado-wiki-b-private-link-feed-connection-scenarios.md, ado-wiki-b-private-link-kusto-queries.md, ado-wiki-private-link-configuration.md
**Kusto 引用**: (无)
**场景数**: 27
**生成日期**: 2026-04-07

---

## Scenario 1: Private Link ASC Feature Tracking
> 来源: ado-wiki-b-private-link-asc-feature-tracking.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

## Scenario 2: Feed
> 来源: ado-wiki-b-private-link-asc-feature-tracking.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Column `IsClientPrivateLink` added to **Workspace Feed** tab in ASC

## Scenario 3: Connection
> 来源: ado-wiki-b-private-link-asc-feature-tracking.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Columns `IsClientPrivateLink` and `IsSessionHostPrivateLink` added to **Connection Errors** tab in ASC

## Scenario 4: AVD Private Link — Collecting Private Endpoint Info from Customer
> 来源: ado-wiki-b-private-link-collect-info-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.
Use this guide to gather the required private endpoint configuration details from the customer before diving into deeper troubleshooting.

## Scenario 5: Step 1 — Ask Customer for Private Endpoint Names
> 来源: ado-wiki-b-private-link-collect-info-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Ask customer to provide:
   - Global private endpoint name
   - Feed global endpoint name
   - Connection private endpoint name

## Scenario 6: Get Global Private Endpoint Name
> 来源: ado-wiki-b-private-link-collect-info-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Customer goes to: **Workspace > Networking tab**
2. Select **Private Endpoint connection**
3. The private endpoint name is under **Private endpoint** column

## Scenario 7: Get Feed Private Endpoint Name
> 来源: ado-wiki-b-private-link-collect-info-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Customer goes to: **Workspace > Networking tab**
2. Select **Private Endpoint connection**
3. The private endpoint name is under **Private endpoint** column

## Scenario 8: Get Connection Private Endpoint Name
> 来源: ado-wiki-b-private-link-collect-info-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Customer goes to: **Host Pool > Networking tab**
2. Select **Private Endpoint connection**
3. The private endpoint name is under **Private endpoint** column
**Document the names:**
```
Global Private Endpoint Name: <name>
Feed Private Endpoint Name: <name>
Connection Endpoint Name: <name>
```

## Scenario 9: Step 2 — Look Up in ASC
> 来源: ado-wiki-b-private-link-collect-info-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. In ASC go to **Microsoft.Network > select privateEndpoints**
2. Select the **Global Private Endpoint**

## Scenario 10: For Each Private Endpoint, Document:
> 来源: ado-wiki-b-private-link-collect-info-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```
[Global Private Endpoint]
Workspace Name: <name>
Is Workspace Empty? Yes/No

Firewall and virtual networks:
  Allow end users access from public network: True/False

Private Endpoint Connections:
  Name: <name>
  Connection State: <state>
  Private Endpoint: <name>
  Description: <text>

DNS Names: <list>
```
Repeat for Feed and Connection private endpoints.

## Scenario 11: AVD Private Link — Feed & Connection Scenarios Matrix
> 来源: ado-wiki-b-private-link-feed-connection-scenarios.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.
Use `IsClientPrivateLink` and `IsSessionHostPrivateLink` columns from ASC Connection Errors tab / Workspace Feed tab to determine the active scenario.

## Scenario 12: Feed Matrix
> 来源: ado-wiki-b-private-link-feed-connection-scenarios.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| IsClientPrivateLink | Feed will use private link |
|--|--|
| True | YES |
| False | NO |

## Scenario 13: Feed Scenarios
> 来源: ado-wiki-b-private-link-feed-connection-scenarios.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Scenario 1: IsClientPrivateLink = True**
   - The client computer can talk to AVD service using private endpoint
   - If feed fails to download → create ICM
**Scenario 2: IsClientPrivateLink = False**
   - The client computer cannot talk to AVD service using private endpoint
   - Investigate DNS resolution and private endpoint connectivity on the client

## Scenario 14: Connection Matrix
> 来源: ado-wiki-b-private-link-feed-connection-scenarios.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| IsClientPrivateLink | IsSessionHostPrivateLink | Connection will use private link |
|--|--|--|
| True | True | YES |
| True | False | NO |
| False | True | NO |
| False | False | NO |

## Scenario 15: Connection Scenarios
> 来源: ado-wiki-b-private-link-feed-connection-scenarios.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Scenario 1: Both IsClientPrivateLink AND IsSessionHostPrivateLink = True — but connection not using private link**
   - If both flags are True but connection isn't using private link → **reboot VM once and retry**
   - If after reboot both flags still True but connection still not using private link → **create ICM**
**Scenario 2: IsClientPrivateLink: True | IsSessionHostPrivateLink: False**
   - Client can talk to AVD via private endpoint, but session host cannot
   - On **session host**: verify DNS records resolve correctly
   - If DNS incorrect → send collab to `Azure\Azure Private Link\Private Endpoints\Issues with connectivity and DNS configuration`
**Scenario 3: IsClientPrivateLink: False | IsSessionHostPrivateLink: True**
   - Session host can talk to AVD via private endpoint, but client computer cannot
   - On **client computer**: verify DNS records resolve correctly
   - If DNS incorrect → send collab to `Azure\Azure Private Link\Private Endpoints\Issues with connectivity and DNS configuration`
**Scenario 4: IsClientPrivateLink: False | IsSessionHostPrivateLink: False**
   - Neither client nor session host can talk to AVD via private endpoint
   - **Verify host pool** has been configured with a private endpoint
   - If no private endpoint configured and customer needs help setting up → send collab to `Azure\Azure Private Link\Private Endpoints\Configure, Set up, or Manage`

## Scenario 16: AVD Private Link — Kusto Diagnostic Queries
> 来源: ado-wiki-b-private-link-kusto-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

## Scenario 17: Feed Failure — Public Access Not Allowed
> 来源: ado-wiki-b-private-link-kusto-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
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
`[来源: ado-wiki-b-private-link-kusto-queries.md]`

## Scenario 18: Connection Failure — Public Access Not Allowed
> 来源: ado-wiki-b-private-link-kusto-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
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
`[来源: ado-wiki-b-private-link-kusto-queries.md]`

## Scenario 19: Connection — Get AVD Private Endpoint Settings
> 来源: ado-wiki-b-private-link-kusto-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
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
`[来源: ado-wiki-b-private-link-kusto-queries.md]`
**PrivateLinkID Reference:**
   - `Null` = Default value (Enabled)
   - `1` = Enabled
   - `2` = Disabled
   - `3` = EnabledForSessionHostsOnly
   - `4` = EnabledForClientsOnly

## Scenario 20: Connection — Get Private Endpoint Connection Info
> 来源: ado-wiki-b-private-link-kusto-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
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
`[来源: ado-wiki-b-private-link-kusto-queries.md]`

## Scenario 21: Connection — Get Private Endpoint Details (DNS Records)
> 来源: ado-wiki-b-private-link-kusto-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
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
`[来源: ado-wiki-b-private-link-kusto-queries.md]`

## Scenario 22: Get All PrivateEndpointConnections for Host Pool (via ActivityId)
> 来源: ado-wiki-b-private-link-kusto-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
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
`[来源: ado-wiki-b-private-link-kusto-queries.md]`

## Scenario 23: Feed — Private Link Specific Operations (Service Errors)
> 来源: ado-wiki-b-private-link-kusto-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
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
`[来源: ado-wiki-b-private-link-kusto-queries.md]`

## Scenario 24: Connection — Private Link Specific Operations (Service Errors)
> 来源: ado-wiki-b-private-link-kusto-queries.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
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
`[来源: ado-wiki-b-private-link-kusto-queries.md]`

## Scenario 25: Understanding Private Link Configuration in AVD
> 来源: ado-wiki-private-link-configuration.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Note: This page is deprecated. For current guidance, see [Azure Virtual Desktop documentation | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/).
To achieve connection using Private Link in AVD, you must understand which resource the private endpoint should be linked to, the target sub-resource type, and whether the AVD service will only allow connections using Private Link.

## Scenario 26: Private Endpoint Configuration Matrix
> 来源: ado-wiki-private-link-configuration.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Scenario | PE Linked To | Target Sub-Resource Type | Public Network Setting |
|----------|-------------|-------------------------|----------------------|
| MSRDC Feed | Workspace | workspace | Uncheck "Allow end user access from public network" |
| Web Client Feed | Workspace | **global** | Uncheck "Allow end user access from public network" |
| MSRDC Connection | Host Pool | hostpool | Uncheck both "Allow end user access from public network" AND "Allow session hosts access from public network" |

## Scenario 27: Key Notes
> 来源: ado-wiki-private-link-configuration.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Mandatory PE**: You must create 1 PE for a sub-resource of a hostpool. This PE must be created once per subscription so that all global URLs within AVD can be accessed privately.
   - **Host pools** control both client and session host connections.
   - **Workspaces** control feeds.
   - A single VNet can connect to multiple host pools/workspaces.
   - A single host pool/workspace can connect to multiple VNets.
   - **Non-deterministic routing**: Having multiple routes to the same resource (e.g., public & private at the same time) yields non-deterministic results.
   - **Independent control**: Public VMs (host pool setting) and public clients (workspace setting) are controlled separately. You can have private-only VMs while still allowing public clients.
   - **PE location**: The location of the PE is the location of the VNet (where the VM resides). The host pool will link out to a different geo if the two regions are different.
