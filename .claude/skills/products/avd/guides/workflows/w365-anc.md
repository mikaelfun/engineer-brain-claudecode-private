# AVD W365 ANC 网络连接 — 排查工作流

**来源草稿**: ado-wiki-anc-device-filter-troubleshooting.md, ado-wiki-anc-domain-credential-management.md, ado-wiki-anc-ip-availability-intune-setup.md, ado-wiki-anc-limit-increase.md, ado-wiki-change-anc-limitation.md
**Kusto 引用**: health-check.md, url-access-check.md
**场景数**: 14
**生成日期**: 2026-04-07

---

## Scenario 1: ANC Device Filter Troubleshooting
> 来源: ado-wiki-anc-device-filter-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Note:** The release is hardcoded in the Intune Portal, reason why the Troubleshooting is limited to the visuals or outputs. In case the action plans below are exhausted, follow the ICM process to fix the behavior in the backend by PG.

## Scenario 2: Customer experience:
> 来源: ado-wiki-anc-device-filter-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - The "Cloud PCs" column in the Azure Connection list shows "--".
   - Displays an error message:
   - "Failed to load data for Azure network connections. Please refresh or retry."

## Scenario 3: Possible causes:
> 来源: ado-wiki-anc-device-filter-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - API call failure.
   - Pagination data retrieval error.
   - Network connectivity issues.

## Scenario 4: Overview
> 来源: ado-wiki-anc-domain-credential-management.md | 适用: \u901a\u7528 \u2705

### 排查步骤
When a Hybrid Azure Active Directory-Joined (HAADJ) ANC is created, the on-prem domain credential information attached to the ANC. W365 has provided a secure way to ensure customer credential safety in this scenario. This document describes how the domain credential is protected and managed by W365 during the whole ANC lifecycle.

## Scenario 5: What CSS should verify
> 来源: ado-wiki-anc-ip-availability-intune-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Customer has an existing ANC.
   - ANC is in a healthy state.
   - IPs Available column is visible by default in Intune.
   - Value updates automatically (hourly).

## Scenario 6: What "good" looks like
> 来源: ado-wiki-anc-ip-availability-intune-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - IPs Available column is visible without configuration.
   - IP count is a non-zero value.
   - Provisioning succeeds when sufficient IPs exist.

## Scenario 7: Manual refresh behavior
> 来源: ado-wiki-anc-ip-availability-intune-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - To refresh immediately, admins must run ANC health checks (PM confirmation).

## Scenario 8: Pre-Increase Consideration
> 来源: ado-wiki-anc-limit-increase.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Current limit: **50 ANCs** for all customers
   - Customer needs solid justification for more than 50
   - Must have used majority of current limit
   - Approval is on a case-by-case basis

## Scenario 9: CSS Steps
> 来源: ado-wiki-anc-limit-increase.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Have customer complete the "Azure Network Connection (ANC) Increase Limit" template
   - Template must be fully completed or it will be sent back
2. Raise an ICM with the Template attached
3. SaaF team will review and submit to approval team
**Important**: Do not commit to customer that increase is approved until you receive approval on ICM or from SaaF.

## Scenario 10: SaaF Steps
> 来源: ado-wiki-anc-limit-increase.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Tag PM Sandeep Patnaik (sandeep.patnaik@microsoft.com) in ICM for approval
   - Recap the ask based on template with additional info
   - Change limit through "Change ANC limit" wiki page

## Scenario 11: JIT Access Preparation
> 来源: ado-wiki-change-anc-limitation.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Open M365 Identity & Access Management (https://m365pulse.microsoft.com/idm/identity/access/Overview), join **CMDCPCSupport** Eligibility
2. Open Torus Client, run command to JIT Elevate:
```
   Request-AzureAdGroupRoleElevation -GroupName <JIT GROUP> -Reason "your reason"
```

## Scenario 12: DataAccessLevels
> 来源: ado-wiki-change-anc-limitation.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The `<JIT GROUP>` depends on the access required:
   - ReadOnly: **CMDCPCSupport-JIT-CustomerServiceViewer**
   - ReadWrite: **CMDCPCSupport-JIT-PE-PlatformServiceOperator**

## Scenario 13: Steps
> 来源: ado-wiki-change-anc-limitation.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **[SAW Enforced]** Navigate to Geneva Action portal (Actions | Jarvis) in SAW machine
2. Select Environment (Public = PE), click "GO to Geneva Action"
3. Filter 'CloudPC', find extension and operations

## Scenario 14: Create or update OnPremConnectionLimitation
> 来源: ado-wiki-change-anc-limitation.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Sets or modifies OPNC limitation for a tenant.
**IMPORTANT**: The TenantId field does not check for trailing spaces — ensure none are present.
Parameters:
   - **Endpoint**: Scale unit of the tenant. Find via Kusto:
```kql
  CloudPCEvent
  | project env_cloud_environment, env_cloud_name, ApplicationName, ContextId
  | where ApplicationName in ("conn", "connFunction")
  | where ContextId == "<TenantId>"
  | distinct env_cloud_name
```
`[来源: ado-wiki-change-anc-limitation.md]`
   - **Tenant ID**: Target tenant
   - **Partner ID**: Use appropriate GUID:
   - CPC: `b1a897df-01c4-41ad-ae06-8278bdc18e7d`
   - Fidalgo: `e3171dd9-9a5f-e5be-b36c-cc7c4f3f3bcf`
   - FirstPartyTest: `1b9b1c85-bc84-4b5e-ab7e-8a60d260775e`
   - PowerAutomate: `ff708b28-89df-4f82-9b1e-b403b36a9896`
   - Citrix: `198d71c0-80bb-4843-8cc4-811377a49a92`
   - **Integer Value**: OPNC limit (e.g., 50 = up to 50 OPNCs)

---

## 关联 Kusto 查询参考

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where HostInstance has "{SessionHostName}"
| where TIMESTAMP >= ago(1d)
| where Name == "SxSStackListenerCheck" 
    or Name == "DomainReachableHealthCheck" 
    or Name == "DomainTrustCheckHealthCheck" 
    or Name == "DomainJoinedCheck" 
    or Name == "FSLogixHealthCheck" 
    or Name == "MonitoringAgentCheck" 
    or Name == "SessionHostCanAccessUrlsCheck" 
    or Name == "RDAgentCanReachRDGatewayURL" 
    or Name == "RdInfraAgentConnectToRdBroker" 
    or Name == "WebRTCRedirectorHealthCheck"
| project TIMESTAMP, Name, ResType, ResSignature, ResDesc
| order by TIMESTAMP desc
```
`[来源: health-check.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where AADTenantId == "{AADTenantId}"
| where TIMESTAMP >= ago(1d)
| where Name endswith "Check"
| where ResType != "Success"
| project TIMESTAMP, HostPool, HostInstance, Name, ResType, ResSignature, ResDesc
| order by TIMESTAMP desc
```
`[来源: health-check.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where PreciseTimeStamp > ago(1d)
| where Role == 'RDAgent'
| where Name endswith "Check"
| where AADTenantId != ""
| summarize arg_max(PreciseTimeStamp, ResType) by Env, Ring, HostPool, HostInstance, Name, AADTenantId
| order by Env, Ring, HostPool, HostInstance
```
`[来源: health-check.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where TIMESTAMP >= ago(7d)
| where Name endswith "Check"
| where ResType != "Success"
| summarize FailureCount = count() by bin(TIMESTAMP, 1h), Name
| order by TIMESTAMP desc
```
`[来源: health-check.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').ShoeboxAgentHealth
| where PreciseTimeStamp > ago(1d)
| where resourceId contains "{SessionHostName}"
| extend x = parse_json(properties)
| extend HostName = tostring(x.SessionHostName)
| where HostName contains "{SessionHostName}"
| extend HealthCheckResult = tostring(x.SessionHostHealthCheckResult)
| extend UrlsAccessibleCheck = parse_json(HealthCheckResult)
| where UrlsAccessibleCheck.ErrorCode != "0"
| project PreciseTimeStamp, HostName, HealthCheckResult
| order by PreciseTimeStamp desc
```
`[来源: url-access-check.md]`
