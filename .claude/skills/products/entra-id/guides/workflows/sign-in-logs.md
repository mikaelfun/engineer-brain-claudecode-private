# Entra ID Sign-in Logs & AADSTS Errors — 排查工作流

**来源草稿**: ado-wiki-c-websignin-log-analysis.md, ado-wiki-d-ca-sign-in-logs.md
**Kusto 引用**: diagnostic-traces.md, signin-logs.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Log analysis
> 来源: ado-wiki-c-websignin-log-analysis.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 2: Summary
> 来源: ado-wiki-d-ca-sign-in-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Tips**
   - 1. **User Name Filter must contain DisplayName** — UPN will not work in the filter
   - 2. **EAS block shows misleading status** — Success in session doesn't mean access was granted; Exchange enforces the block
   - 3. **Export date is always UTC** — regardless of local/UTC toggle in portal

---

## 附录: Kusto 查询参考

### diagnostic-traces
> ESTS 诊断跟踪查询

```kql
union cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').DiagnosticTracesIfx,
      cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').UserErrorsIfx
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * contains "{correlationId}"
| extend Messages = strcat(Message, Exception, ',RequestId:', RequestId)
| extend env_name = substring(env_name, 25)
| project env_time, env_name, CorrelationId, Result, Messages
| order by env_time asc
```

```kql
union cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx,
      cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').DiagnosticTracesIfx
| where env_time > ago(15d)
| where CorrelationId == "{correlationId}"
// | where TenantId == "{tenantId}"
// | where UserPrincipalObjectID == "{userId}"
| project env_time, Message, CorrelationId, RequestId, ClientTypeForConditionalAccess, 
    TenantId, Result, ApplicationId, ResourceId, ErrorCode, MdmAppId, 
    IsDeviceCompliantAndManaged, DeviceTrustType, MfaStatus, ClientIp, DeviceId, 
    ApplicationDisplayName, ConditionalAccessAppIdentifier1, ConditionalAccessAppId1Decision, 
    ConditionalAccessAppIdentifier2, ConditionalAccessAppId2Decision, 
    ConditionalAccessVerboseData, MultiCAEvaluationLog, MultiConditionalAccessStatus, 
    SourcesOfMfaRequirement, ClientInfo, Client
| limit 1000
```

### signin-logs
> ESTS 登录日志查询

```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time between (datetime({startTime})..datetime({endTime}))
| where CorrelationId =~ "{correlationId}" or TenantId =~ "{tenantId}"
| project env_time, CorrelationId, ErrorCode, ApplicationDisplayName, Result, 
         MaskedResponse, HttpStatusCode, UserPrincipalObjectID, DeviceId
| order by env_time desc
```

```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time > ago(30d)
| where UserPrincipalObjectID == "{userId}"
| where DeviceId == "{deviceId}"
// | where ApplicationDisplayName contains "Windows Sign In"
// | where CorrelationId == "{correlationId}"
| project Tenant, env_time, CorrelationId, RequestId, ClientTypeForConditionalAccess, 
    Result, OTData, ITData, ApplicationId, ResourceId, ErrorCode, MdmAppId, 
    IsDeviceCompliantAndManaged, DeviceTrustType, MfaStatus, ClientIp, DeviceId, 
    ApplicationDisplayName, ConditionalAccessAppIdentifier1, ConditionalAccessAppId1Decision, 
    ConditionalAccessAppIdentifier2, ConditionalAccessAppId2Decision, 
    ConditionalAccessVerboseData, MultiCAEvaluationLog, MultiConditionalAccessStatus, 
    SourcesOfMfaRequirement, ClientInfo, Client
| sort by env_time asc
```

```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where TenantId == "{tenantId}"
| where UserPrincipalObjectID == "{userId}"
| where DeviceId == "{deviceId}"
| where env_time > datetime({startTime}) and env_time < datetime({endTime})
| project env_time, CorrelationId, RequestId, DeviceId, IsInteractive, ClientApplication, 
    ClientIp, ApplicationDisplayName, ResourceId, ResourceDisplayName, Result, 
    ErrorCode, ErrorNo, ITData, OTData
```

---

---

## Incremental Scenarios (2026-04-18)

## Scenario 3: When customers review their sign in Logs, they notice that the User IDs show up as User: 00000000-0000-0000-0000-0000000...
> Source: contentidea-kb (entra-id-3653) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: When customers review their sign in Logs, they notice that the User IDs show up as User: 00000000-0000-0000-0000-000000000000Username: domainName.comUser ID: 00000000-0000-0000-0000-000000000000Altern...
2. **Root cause**: This happens due to setup of Tenant restrictions.Tenant restrictions on a network, is basically setup using a proxy device that inserts headers into traffic to Azure AD endpoints. The two headers that...
3. **Solution**: The customer will have to take this Tenant Restrictions' sign in logs into considerations when they run scripts to analyze the logs.

---

## Scenario 4: Enable the debug logs by following this article https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1839...
> Source: contentidea-kb (entra-id-3660) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: Enable the debug logs by following this article https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183983/Azure-AD-Sign-in-for-Azure-Linux-VMs?anchor=auth.log-(debug-level)in the log ...
2. **Root cause**: This issue is caused because the metadata sends the location name as IndiaCentral and Plugin is searching for CentralIndia.
3. **Solution**: This issue is fixed in the Plugin release 1.0.011360001 to install this plugin please follow the below steps,Install the extension with the below command,az vm extension set \--publisher Microsoft.Azu...

---
