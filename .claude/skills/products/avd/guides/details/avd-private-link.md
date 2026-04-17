# AVD AVD Private Link - Comprehensive Troubleshooting Guide

**Entries**: 6 | **Drafts fused**: 5 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-b-private-link-asc-feature-tracking.md, ado-wiki-b-private-link-collect-info-guide.md, ado-wiki-b-private-link-feed-connection-scenarios.md, ado-wiki-b-private-link-kusto-queries.md, ado-wiki-private-link-configuration.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD MSRDC 客户端 Feed 或 Web 客户端 Feed 在 Private Link 环境下无法加载 | Private Endpoint 配置了错误的 sub-resource type，或链接到了错误的资源（如链接到 ho... | MSRDC Feed：PE 必须链接到 workspace，sub-resource type 为 'workspace... |
| AVD 会话主机连接在 Private Link 环境下失败，用户无法通过私有网络连接到 Session Host | Private Endpoint 未链接到 hostpool 或 sub-resource type 配置错误；或未为订... | MSRDC Connection：PE 必须链接到 hostpool，sub-resource type 为 'host... |
| AVD connection refused with error: 'Connection was refused b... | The host pool network access policy is set to private endpoi... | 1) In ASC go to Host Pool > Connection tab, find the connect... |
| Workspace feed/subscription fails with error: 'The resource ... | The workspace network access policy is configured to disallo... | 1) In ASC go to Workspace > Workspaces Feed tab and find the... |
| Customer cannot configure or use AVD Private Link; Private L... | Customer's Azure subscription has not been enrolled in the A... | 1) In ASC select customer subscription > Azure Activity Logs... |
| Custom image template fails with PrivateLinkService Network ... | Private service policy enabled on subnet used by Azure Image... | Disable private service policy on the subnet |

### Phase 2: Detailed Investigation

#### Private Link ASC Feature Tracking
> Source: [ado-wiki-b-private-link-asc-feature-tracking.md](guides/drafts/ado-wiki-b-private-link-asc-feature-tracking.md)

> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

#### AVD Private Link — Collecting Private Endpoint Info from Customer
> Source: [ado-wiki-b-private-link-collect-info-guide.md](guides/drafts/ado-wiki-b-private-link-collect-info-guide.md)

> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

#### AVD Private Link — Feed & Connection Scenarios Matrix
> Source: [ado-wiki-b-private-link-feed-connection-scenarios.md](guides/drafts/ado-wiki-b-private-link-feed-connection-scenarios.md)

> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

#### AVD Private Link — Kusto Diagnostic Queries
> Source: [ado-wiki-b-private-link-kusto-queries.md](guides/drafts/ado-wiki-b-private-link-kusto-queries.md)

> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

*Contains 8 KQL query template(s)*

#### Understanding Private Link Configuration in AVD
> Source: [ado-wiki-private-link-configuration.md](guides/drafts/ado-wiki-private-link-configuration.md)

> Note: This page is deprecated. For current guidance, see [Azure Virtual Desktop documentation | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/).

### Key KQL Queries

**Query 1:**
```kql
//feed failure - public access not allowed
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDInfraTrace 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDInfraTrace 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("RDSProdAU.australia
```

**Query 2:**
```kql
//connection failure - public access not allowed
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDInfraTrace 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDInfraTrace 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDInfraTrace
| union cluster("RDSProdAU.aus
```

**Query 3:**
```kql
//connection - get avd private endpoint settings
// PrivateLinkID values: Null/1=Enabled, 2=Disabled, 3=EnabledForSessionHostsOnly, 4=EnabledForClientsOnly
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDOperation 
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDOperation
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDOperation
| union cluster("
```

**Query 4:**
```kql
//connection - get private endpoint connection info
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").PrivateEndpointConnection
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").PrivateEndpointConnection
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").PrivateEndpointConnection
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").PrivateEndpointConnection
| union cluster("rdsprodca.canadacentral.kusto.windows.net").databa
```

**Query 5:**
```kql
//connection - get private endpoint details
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").PrivateEndpointConnectionDetail 
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").PrivateEndpointConnectionDetail
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").PrivateEndpointConnectionDetail
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").PrivateEndpointConnectionDetail
| union cluster("rdsprodca.canadacentral.kusto.win
```

**Query 6:**
```kql
// get a list of all privateEndpointConnections for the hostpool this activityId went to
let activityId = "<ActivityId>";
cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").DiagActivity
| union cluster("rdsprodca.canadacentral.kusto.wi
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | AVD MSRDC 客户端 Feed 或 Web 客户端 Feed 在 Private Link 环境下无法加载 | Private Endpoint 配置了错误的 sub-resource type，或链接到了错误的资源（如链接到 hostpool 而非 workspace） | MSRDC Feed：PE 必须链接到 workspace，sub-resource type 为 'workspace'，取消勾选 'Allow end us... | 🔵 7.0 | ADO Wiki |
| 2 | AVD 会话主机连接在 Private Link 环境下失败，用户无法通过私有网络连接到 Session Host | Private Endpoint 未链接到 hostpool 或 sub-resource type 配置错误；或未为订阅创建全局 PE sub-resourc... | MSRDC Connection：PE 必须链接到 hostpool，sub-resource type 为 'hostpool'，取消勾选 'Allow en... | 🔵 7.0 | ADO Wiki |
| 3 | AVD connection refused with error: 'Connection was refused because you tried to ... | The host pool network access policy is set to private endpoint only (public acce... | 1) In ASC go to Host Pool > Connection tab, find the connection. 2) Copy activit... | 🔵 7.0 | ADO Wiki |
| 4 | Workspace feed/subscription fails with error: 'The resource in <workspace name> ... | The workspace network access policy is configured to disallow connections from p... | 1) In ASC go to Workspace > Workspaces Feed tab and find the failed feed operati... | 🔵 7.0 | ADO Wiki |
| 5 | Customer cannot configure or use AVD Private Link; Private Link option not avail... | Customer's Azure subscription has not been enrolled in the AVD Private Link Publ... | 1) In ASC select customer subscription > Azure Activity Logs. 2) Set appropriate... | 🔵 7.0 | ADO Wiki |
| 6 | Custom image template fails with PrivateLinkService Network Policy not disabled ... | Private service policy enabled on subnet used by Azure Image Builder | Disable private service policy on the subnet | 🔵 6.0 | MS Learn |
