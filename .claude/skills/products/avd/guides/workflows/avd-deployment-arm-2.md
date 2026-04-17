# AVD ARM 部署 (Part 2) — 排查工作流

**来源草稿**: ado-wiki-b-template-deployment-failed-multiple-errors.md, ado-wiki-b-template-validation-error.md, ado-wiki-b-troubleshoot-arm-deployment-asc-kusto.md
**Kusto 引用**: deployment-info.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Option 1 - ASC
> 来源: ado-wiki-b-template-deployment-failed-multiple-errors.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Open ASC -> enter case number -> go to Resource Explorer
2. Select the customer's Subscription -> Operations -> RDFE Operations
3. Identify failure using correlation ID (from Summary Error/Raw Error), deployment ID, or resource group name
4. Expand error and review to determine why the validation failed

## Scenario 2: Option 2 - Customer Error Details
> 来源: ado-wiki-b-template-deployment-failed-multiple-errors.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Ask the customer to click the error message in Azure Portal
2. Review the Summary and Raw Error - typically this will tell you why failed
   - Note: Some resources may have already been created (host pool, workspace, availability set, application group). If starting over, delete these first for a clean installation.

## Scenario 3: Option 3 - Activity Log
> 来源: ado-wiki-b-template-deployment-failed-multiple-errors.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Ask customer to login to Azure Portal and go to Activity Log
2. Look for "Validate Deployment" failures (select the operation with the red icon)
3. On the right side select "JSON" and scroll to "statusMessage" for more information about the actual issue

## Scenario 4: Steps
> 来源: ado-wiki-b-troubleshoot-arm-deployment-asc-kusto.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Open ASC -> Resource Explorer -> click Sub -> Operations -> select date range when deployment failed -> Run
2. Under ARM Operations -> Filter on Status Failed
3. Find failure -> click Kusto Link for Job Traces
   - Note: To access job traces go to MyAccess and request access to:
   - Azure Diagnostic Partner - 19401
   - ARM Logs
4. Find failure - Copy Activity ID
5. Search RDInfra using Activity ID (see Basic Queries wiki page for RDInfraTrace query)

---

## 关联 Kusto 查询参考

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDTenant
| where TenantGroupId == "{TenantGroupId}"
| where env_time >= ago(1d)
| project env_time, Name, Id, CreationDate, TenantGroupId, AzureADId
| summarize arg_max(env_time, *) by Id
```
`[来源: deployment-info.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where TenantId == "{TenantId}"
| where env_time >= ago(2d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, PoolType, SHCount, LoadBalancerType, MaxSessions, Location
```
`[来源: deployment-info.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').AppGroup
| where HostPoolId == "{HostPoolId}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, UsersCount, PubAppsCount, Type, Location
```
`[来源: deployment-info.md]`

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
| summarize arg_max(env_time, *) by Id
| project AppGroupName = Name, AppGroupId = Id, HostPoolId, Type, UsersCount;
hostPools
| join kind=leftouter appGroups on HostPoolId
| project HostPoolName, HostPoolId, SHCount, PoolType, AppGroupName, Type, UsersCount
```
`[来源: deployment-info.md]`

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
`[来源: deployment-info.md]`
