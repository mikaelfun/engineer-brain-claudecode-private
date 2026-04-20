# Entra ID Conditional Access — 排查工作流

**来源草稿**: ado-wiki-b-mcp-server-conditional-access.md, ado-wiki-c-conditional-access-tsg.md
**Kusto 引用**: conditional-access-decode.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Summary
> 来源: ado-wiki-b-mcp-server-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. In [Microsoft Entra ID](https://entra.microsoft.com/#home) create a **Conditional Access policy**
- 2. **Assignments:**
- 3. **Conditions:** Configure MFA, device compliance, or location restrictions.
- 4. **Access controls:** Choose **Grant** and enforce your controls.
- 5. Enable the policy.
- 1. **No consent:** Do not grant any MCP scopes.
- 2. **Revoke consent:** Remove delegated permissions.
- 3. **Require assignment:** On the **Microsoft MCP Server for Enterprise** enterprise app, select **Properties** > set **User assignment required** = **Yes** to allow only specific callers, but do not 
- 4. **Block via CA:** Create a CA policy that targets **Microsoft MCP Server for Enterprise** with the **Block** Grant control.

---

## Scenario 2: Azure AD Conditional Access TSG
> 来源: ado-wiki-c-conditional-access-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Tools**
   - ASC: Conditional Access node, Sign-ins, Auth Diagnostics
   - Kusto: PerRequestTableIfx, DiagnosticTracesIfx
   - Key fields: MultiCAEvaluationLog, ConditionalAccessVerboseData, CaAdhoc (SLEv2)

---

## 附录: Kusto 查询参考

### conditional-access-decode
> 条件访问策略评估解码

```kql
let SessionControls = datatable(SessionControlId:string, SessionControl:string) [
    "0", "NotSet",
    "1", "AppEnforcedRestrictions",
    "2", "CloudAppSecurity",
    "3", "SignInFrequency",
    "4", "PersistentBrowserSessionMode",
    "5", "Binding",
    "6", "AccessTokenLifetime"
];
let SupportedControls = datatable(SupportedControlId:string, ControlName:string) [
    "0", "NotSet",
    "1", "Block",
    "2", "Mfa",
    "3", "RequireCompliantDevice",
    "4", "RequireDomainJoinedDevice",
    "5", "RequireApprovedApp",
    "6", "RequireCompliantApp",
    "7", "FederatedMfa",
    "8", "FederatedCertAuth",
    "9", "MfaRegistration",
    "10", "MfaAndChangePassword"
];
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where CorrelationId == "{correlationId}"
| where env_time >= datetime({startTime}) and env_time <= datetime({endTime})
| where MultiCAEvaluationLog != "" and MultiCAEvaluationLog != "0|"
| project env_time, TenantId, UserPrincipalObjectID, RequestId, CorrelationId,
    ExternalClaimsProviderAppId, CALog=split(MultiCAEvaluationLog, "|")
| mv-expand CALog
| where CALog contains "=4,"  // only applied policies
| project env_time, TenantId, UserPrincipalObjectID, RequestId, CorrelationId,
    ExternalClaimsProviderAppId, CALog,
    PolicyId=tostring(split(CALog, "=", 0)[0]),
    Controls=tostring(split(CALog, ",", 3)[0]),
    ExternalControls=tostring(split(CALog, ",", 4)[0]),
    SessionControls=tostring(split(CALog, ",", 5)[0]),
    AreControlsAlreadySatisfied = tostring(split(CALog, ",", 7)[0])
| mv-expand SupportedControlId = split(Controls, ":")
| mv-expand ExternalControlId = split(ExternalControls, ":")
| mv-expand SessionControlId = split(SessionControls, ":")
| project env_time, TenantId, UserPrincipalObjectID, RequestId, CorrelationId,
    PolicyId, SupportedControlId=tostring(SupportedControlId),
    ExternalControl=iff(isnotempty(ExternalControlId), ExternalClaimsProviderAppId,""),
    SessionControlId=tostring(SessionControlId), AreControlsAlreadySatisfied
| lookup SessionControls on SessionControlId
| lookup SupportedControls on SupportedControlId
| project env_time, TenantId, PolicyId, ControlName, SessionControl,
    ExternalControl, AreControlsAlreadySatisfied, RequestId, CorrelationId
| order by RequestId
```

---

---

## Incremental Scenarios (2026-04-18)

## Scenario 3: When Conditional Access Policy is created to force MFA on Exchange Online (EXO) and/or SharePoint Online (SPO) cloud app...
> Source: contentidea-kb (entra-id-3645) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: When Conditional Access Policy is created to force MFA on Exchange Online (EXO) and/or SharePoint Online (SPO) cloud application, and the users open the browser and try to create Word/Excel/PowerPoint...
2. **Root cause**: When user tries to create Word/Excel/PowerPoint document from https://portal.office.com portal, the selected application tries to access Exchange Online (EXO) and/or SharePoint Online (SPO) using non-...
3. **Solution**: Since this is non-interactive login, MFA will not trigger, and the MFA popup will not show to the end user. Hence, creating Word/Excel/PowerPoint documents from office portal will fail.  Therefore, we...

---
