# Entra ID Audit Logs — 排查工作流

**来源草稿**: ado-wiki-a-audit-signon-last-signon-reports.md, ado-wiki-a-automate-signin-audit-export-blob.md, ado-wiki-b-local-gpo-corruption-auditing.md, ado-wiki-bitlocker-recovery-keys-audit.md, ado-wiki-c-laps-auditing.md, ado-wiki-d-missing-customer-facing-audit-events.md, ado-wiki-e-audit-msds-keycredentiallink-change.md, mslearn-unknown-actors-audit-reports.md
**Kusto 引用**: audit-logs.md
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: ado-wiki-a-audit-signon-last-signon-reports
> 来源: ado-wiki-a-audit-signon-last-signon-reports.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 2: Troubleshooting local group policy corruption
> 来源: ado-wiki-b-local-gpo-corruption-auditing.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1 : Enable security auditing**
   - Configure File System security auditing
   - You then need to configure auditing on the file itself

---

## Scenario 3: Audit BitLocker Recovery Keys in Azure AD
> 来源: ado-wiki-bitlocker-recovery-keys-audit.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Root Cause Tree: Sign-in and MFA > Device Registration > Device Administration > Bitlocker Key Recovery**

---

## Scenario 4: How to troubleshoot missing customer-facing audit events
> 来源: ado-wiki-d-missing-customer-facing-audit-events.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting with DGrep**
   - Access `AsmIfxAuditApp` table via DGrep. The data in this event is much closer to what the customer sees than `IfxAuditEvent`, making it useful for troubleshooting "customer is not seeing audit logs" 
   - While `AsmIfxAuditApp` doesn't have a direct `CorrelationId` field, the `EventPayload` field contains the SyncFabric correlation identifier, which can be used to narrow searches.

### 关键 KQL 查询
```kql
cluster("idsharedwus").database("AADSFprod").GlobalIfxAuditEvent
| where verbosityLevel != "InternalOnly"
| take 1
```
`[来源: ado-wiki-d-missing-customer-facing-audit-events.md]`

---

## Scenario 5: Unknown Actors in Microsoft Entra Audit Reports
> 来源: mslearn-unknown-actors-audit-reports.md | 适用: Mooncake ✅ / Global ✅

---

## 附录: Kusto 查询参考

### audit-logs
> MSODS 目录审计日志查询

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxAuditLoggingCommon
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * has '{objectId}'  // AAD Object id/tenant id/device id
// | where operationName has '{operationName}'
// | where actorContextId has '{tenantId}'
// | where * has '{upn}'
| take 1000
| project env_time, env_seqNum, operationName, operationType, resultType,
    targetObjectId, actorObjectId, resourceId, resourceType, contextId,
    targetObjectName, internalOperationType, internalCorrelationId,
    env_appId, actorIdentityType
| order by env_time asc
```

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxAuditLoggingCommon
| where internalCorrelationId == "{correlationId}"
| project env_time, operationName, resultType, targetObjectId, actorObjectId
```

---