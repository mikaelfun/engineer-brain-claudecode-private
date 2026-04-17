# AVD AVD ARM 部署 (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 9 | **Drafts fused**: 3 | **Kusto queries fused**: 1
**Source drafts**: ado-wiki-b-template-deployment-failed-multiple-errors.md, ado-wiki-b-template-validation-error.md, ado-wiki-b-troubleshoot-arm-deployment-asc-kusto.md
**Kusto references**: deployment-info.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, OneNote, KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| "No workspace is associated with this email address" error w... | DNS TXT record _msradc not configured for the user's email d... | In O365 Admin Center > Settings > Domains > DNS records, add... |
| RTT and bandwidth information missing from CloudPC Performan... | Geneva Agent scheduled task is not running - either disabled... | On affected CloudPC check: 1) Geneva Agent is installed. 2) ... |
| Customer cannot download or install Windows App because comp... | Organization policy blocks Microsoft Store access, preventin... | Download Windows App directly from Microsoft Learn: https://... |
| DSC extension fails to download Configuration.zip - cataloga... | Firewall/NSG/static route blocking download | Remove blocking network rules or download zip manually |
| WVD Deployment failed with DSC extension error. User is not ... | SPN was missing role assignment. | Create service principal role assignment per docs. |
| WVD ARM deployment fails: The template deployment vmCreation... | Azure subscription quota limit exceeded for a region or VM f... | Check detailed error by clicking error banner in Portal. Req... |
| Ephemeral OS disk deployment fails in certain regions due to... | Incomplete rollout of supported SKUs or backend bugs cause r... | Monitor Azure announcements for SKU availability updates; de... |
| Azure Monitor configuration workbook for AVD fails with 'Dep... | The Azure Monitor configuration workbook for AVD may pass in... | Instead of using the configuration workbook, manually config... |

### Phase 2: Detailed Investigation

#### The template deployment failed with multiple errors
> Source: [ado-wiki-b-template-deployment-failed-multiple-errors.md](guides/drafts/ado-wiki-b-template-deployment-failed-multiple-errors.md)

1. Open ASC -> enter case number -> go to Resource Explorer

#### Deployment fails with "template validation" error
> Source: [ado-wiki-b-template-validation-error.md](guides/drafts/ado-wiki-b-template-validation-error.md)

1. Open ASC -> enter case number -> go to Resource Explorer

#### Troubleshoot ARM Deployment Failure using ASC and Kusto
> Source: [ado-wiki-b-troubleshoot-arm-deployment-asc-kusto.md](guides/drafts/ado-wiki-b-troubleshoot-arm-deployment-asc-kusto.md)

1. Open ASC -> Resource Explorer -> click Sub -> Operations -> select date range when deployment failed -> Run

### Phase 3: Kusto Diagnostics

#### deployment-info
> `[Tool: Kusto skill - deployment-info.md]`

主机池 ID

### Key KQL Queries

**Query 1:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDTenant
| where TenantGroupId == "{TenantGroupId}"
| where env_time >= ago(1d)
| project env_time, Name, Id, CreationDate, TenantGroupId, AzureADId
| summarize arg_max(env_time, *) by Id
```

**Query 2:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where TenantId == "{TenantId}"
| where env_time >= ago(2d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, PoolType, SHCount, LoadBalancerType, MaxSessions, Location
```

**Query 3:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').AppGroup
| where HostPoolId == "{HostPoolId}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, UsersCount, PubAppsCount, Type, Location
```

**Query 4:**
```kql
let aadTenantId = "{AADTenantId}";
let hostPools = cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where AADTenantId == aadTenantId
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project HostPoolName = Name, HostPoolId = Id, SHCount, PoolType;
let appGroups = cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').AppGroup
| where AADTenantId == aadTenantId
| where env_time >= ago(1d)
| summarize arg_max(env_time, *
```

**Query 5:**
```kql
let subscriptionId = "{SubscriptionId}";
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where SubscriptionId == subscriptionId
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| summarize 
    HostPoolCount = count(),
    TotalSessionHosts = sum(SHCount),
    PooledCount = countif(PoolType == "Pooled"),
    PersonalCount = countif(PoolType == "Personal")
```

### Conflict Notes

- **avd-contentidea-kb-007** vs **avd-mslearn-043** (21v_conflict): Both valid. Annotate with 21V applicability conditions

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | "No workspace is associated with this email address" error when subscribing with... | DNS TXT record _msradc not configured for the user's email domain. The record is... | In O365 Admin Center > Settings > Domains > DNS records, add TXT record: Name=_m... | 🔵 7.5 | ADO Wiki |
| 2 | RTT and bandwidth information missing from CloudPC Performance / Connection Qual... | Geneva Agent scheduled task is not running - either disabled, stopped, or blocke... | On affected CloudPC check: 1) Geneva Agent is installed. 2) Check EventViewer > ... | 🔵 7.5 | ADO Wiki |
| 3 | Customer cannot download or install Windows App because company blocks Microsoft... | Organization policy blocks Microsoft Store access, preventing standard Windows A... | Download Windows App directly from Microsoft Learn: https://learn.microsoft.com/... | 🔵 7.5 | ADO Wiki |
| 4 | DSC extension fails to download Configuration.zip - catalogartifact.azureedge.ne... | Firewall/NSG/static route blocking download | Remove blocking network rules or download zip manually | 🔵 7.0 | MS Learn |
| 5 | WVD Deployment failed with DSC extension error. User is not authorized to query ... | SPN was missing role assignment. | Create service principal role assignment per docs. | 🔵 6.5 | KB |
| 6 | WVD ARM deployment fails: The template deployment vmCreation-linkedTemplate is n... | Azure subscription quota limit exceeded for a region or VM family. | Check detailed error by clicking error banner in Portal. Request quota increase ... | 🔵 6.5 | KB |
| 7 | Ephemeral OS disk deployment fails in certain regions due to SKU rollout gaps | Incomplete rollout of supported SKUs or backend bugs cause regional deployment i... | Monitor Azure announcements for SKU availability updates; deploy to another regi... | 🔵 6.0 | MS Learn |
| 8 | Azure Monitor configuration workbook for AVD fails with 'Deployment template val... | The Azure Monitor configuration workbook for AVD may pass incorrect parameter ty... | Instead of using the configuration workbook, manually configure performance coun... | 🔵 6.0 | OneNote |
| 9 | Deployment fails Unauthorized - scale operation not allowed for subscription in ... | Subscription type (MSDN/Free/Education) lacks VM features in region | Change subscription type or deploy to different region | 🟡 4.5 | MS Learn |
