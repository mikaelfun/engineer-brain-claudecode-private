# Entra ID Multi-Factor Authentication — 排查工作流

**来源草稿**: ado-wiki-a-asc-mfa-logs-result-codes.md, ado-wiki-b-azure-portal-mfa-enforcement.md, ado-wiki-b-mfa-authentication-management.md, ado-wiki-c-azure-mfa-source-of-mfa.md, ado-wiki-c-bulk-update-mfa-phone-auth-method.md, ado-wiki-c-change-per-user-mfa-settings-msgraph.md, ado-wiki-c-external-mfa-policy.md, ado-wiki-c-get-mfa-auth-method-all-group-users.md, ado-wiki-c-mfa-server-migration-utility.md, ado-wiki-d-m365-admin-center-mandatory-mfa.md... (+10 more)
**Kusto 引用**: mfa-detail.md
**场景数**: 11
**生成日期**: 2026-04-07

---

## Scenario 1: Result Codes
> 来源: ado-wiki-a-asc-mfa-logs-result-codes.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 2: Azure Portal MFA Enforcement
> 来源: ado-wiki-b-azure-portal-mfa-enforcement.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Log in as Global Administrator
- 2. [Elevate access](https://aka.ms/enableelevatedaccess)
- 3. Go to https://aka.ms/managemfaforazure and click **Postpone enforcement**
- 4. Confirm postponement
- 5. Remove elevated access
- 1. Log in as GA using MFA (required to confirm MFA works)
- 2. Elevate access
- 3. Go to https://aka.ms/managemfaforazure, click **Enable enforcement**
- 4. Can click **Postpone enforcement** to remove opt-in
- 1. PowerShell export: https://aka.ms/AzMFA

---

## Scenario 3: Sources of MFA
> 来源: ado-wiki-c-azure-mfa-source-of-mfa.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 4: M365 Admin Center Mandatory MFA
> 来源: ado-wiki-d-m365-admin-center-mandatory-mfa.md | 适用: Mooncake ✅

### 排查步骤
- 1. Verify grace period was requested
- 2. ASC check: "MFA is explicitly enforced by the client application 'Microsoft Office 365 Portal'" + SourcesOfMfaRequirement = "Request"
- 3. If confirmed → IcM via ASC template: **[ID] [M365] [MAC] - Manage Users, Groups, and Domains**. Include Correlation ID, Timestamp, portal URL, HAR file.

---

## Scenario 5: Azure MFA Prompt / No Prompt Troubleshooting Guide
> 来源: ado-wiki-e-mfa-prompt-no-prompt-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Scope Verification - Is it Azure MFA?**
2. **Step 2: Identify Source of MFA Requirement**
   - Always verify the customer's setup - trust but verify.
3. **Step 3: Is MFA Requirement Already Met?**
   - Check if MFA claim already exists in the token
   - If met and user expects MFA prompt -> explain why requirement was already satisfied
   - Review MFA token lifetime if needed
4. **Step 4: MFA Verification Method Issue?**
   - If error indicates verification method failure -> change topic to the specific verification method failure
   - Use MFA Auth Method TSG/wiki
   - May need to check with customer about user-experienced behavior
5. **Step 5: Per-User MFA State**
   - Check user state and registered methods:
   - **Disabled** -> No MFA enforcement via per-user MFA
   - **Enabled** -> MFA required only after user registers methods
6. **Step 6: Conditional Access Policy Analysis**
   - Identify which policy/policies required MFA
   - Check if MFA was required because another condition was not met
   - MFA is the last challenge tried - if other challenges required, those may have failed
7. **Step 7: Request-Level Analysis**
   - Look at Azure Support Center for request and app details
   - Check Logminer for MFA requirement location in the request
8. **Step 8: Risk-Based Policy**
   - Check user risk level and sign-in risk level
   - If ErrorCode = ProofUpBlocked -> MFA required but CA risk-based policy or high sign-in risk blocked proof-up
   - **Resolution**: Clear risk-based events and/or temporarily clear risk-based settings to allow registration, then user can perform MFA

---

## Scenario 6: Azure MFA 常见问题排查索引
> 来源: mslearn-azure-mfa-troubleshooting-index.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **验证码未收到**: 检查手机号码是否正确 → 检查用户是否被 Block sign in → 尝试其他验证方式
- 2. **手机丢失**: 需要另一个全局管理员重置 MFA 设置（Manage user settings → Require re-register）
- 3. **通用排查**: 确认 MFA 策略配置（per-user MFA vs Conditional Access）、检查 Entra ID sign-in logs

---

## Scenario 7: MFA Architecture and Authentication Flow Guide
> 来源: onenote-mfa-architecture-auth-flow.md | 适用: Mooncake ✅

### 排查步骤
- 1. User completes first-factor authentication (password)
- 2. ESTS evaluates CA policies + per-user MFA settings from MSODS
- 3. If MFA required → ESTS determines default MFA method
- 4. ESTS calls SAS via ADGW to initiate challenge
- 5. SAS performs throttling checks
- 6. Method-specific flow:
- 7. SAS reports MFA success → ESTS issues token with MFA claim
- 1. ESTS determines MFA required, method = OATH TOTP
- 2. ESTS → SAS: initiate TOTP challenge
- 3. SAS checks throttling service

### 关键 KQL 查询
```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time >= datetime(START) and env_time < datetime(END)
| where HomeTenantUserObjectId == '{userObjectId}'
| where TenantId == '{tenantId}'
| project env_time, CorrelationId, Result, ErrorCode, MfaStatus, AuthenticationType, SourcesOfMfaRequirement
| order by env_time asc
```
`[来源: onenote-mfa-architecture-auth-flow.md]`

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxUlsEvents
| where env_time >= datetime(START) and env_time < datetime(END)
| where * has '{userObjectId}'
| project env_time, correlationId, message, contextId
```
`[来源: onenote-mfa-architecture-auth-flow.md]`

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').AllSASCommonEvents
| where env_time >= datetime(START) and env_time < datetime(END)
| where userObjectId == '{userObjectId}'
| project env_time, SourceCall, Msg, AuthenticationMethod, contextId, correlationId
```
`[来源: onenote-mfa-architecture-auth-flow.md]`

---

## Scenario 8: MFA Authentication Flow Troubleshooting Guide (TSG1)
> 来源: onenote-mfa-auth-flow-tsg1.md | 适用: Mooncake ✅

### 排查步骤
- 1. Get CorrelationId from user's sign-in error page (Error 500121 = MFA failure)
- 2. Check ESTS PerRequestTableIfx for ErrorCode and MfaStatus
- 3. Check SAS AllSASCommonEvents for method-specific signals
- 4. If SMS/Voice/Push → check CAPP AllCappLogEvents
- 5. For throttling issues → see TSG3

---

## Scenario 9: MFA Registration Troubleshooting Guide (TSG2)
> 来源: onenote-mfa-registration-tsg2.md | 适用: Mooncake ✅

### 关键 KQL 查询
```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxAuditLoggingCommon
| where env_time between(datetime(START)..datetime(END))
| where * has '{userObjectId}'
| project env_time, operationName, resultType, targetObjectId, actorObjectId, contextId, actorIdentityType
| order by env_time asc
```
`[来源: onenote-mfa-registration-tsg2.md]`

```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time between(datetime(START)..datetime(END))
| where HomeTenantUserObjectId == '{userObjectId}'
| where TenantId == '{tenantId}'
| project env_time, CorrelationId, Result, ErrorCode, MfaStatus, ApplicationParentAppId, ResourceId
| order by env_time asc
```
`[来源: onenote-mfa-registration-tsg2.md]`

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').AllSASCommonEvents
| where env_time between(datetime(START)..datetime(END))
| where * contains '{tenantId}'
| where userObjectId == '{userObjectId}'
| project env_time, SourceCall, Msg, AuthenticationMethod
```
`[来源: onenote-mfa-registration-tsg2.md]`

---

## Scenario 10: MFA Throttling Troubleshooting Guide (TSG3)
> 来源: onenote-mfa-throttling-tsg.md | 适用: Mooncake ✅

### 排查步骤
1. **Step 1: Check AAD Gateway**
   - cluster('idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn').database('AADGatewayProd').AllRequestSummaryEvents
2. **Step 2: Check SAS Throttling**
   - cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').AllSASCommonEvents
3. **Step 3: Determine Scope**
   - Count distinct users, apps, tenants affected:
   - Many users + many apps → Per-Tenant
   - Same AppId across tenants → Per-App
4. **Step 4: Check RepMap (Telephony)**
   - Search SAS Msg for "BlockAll", "OptIn", "RepMap":
   - If found → Country-level telephony fraud block
   - Solution: Switch to Authenticator app (TOTP/Push)

### 关键 KQL 查询
```kql
cluster('idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn').database('AADGatewayProd').AllRequestSummaryEvents
| where env_time between (startTime .. endTime)
| where TargetService contains "mysignins"
| where EffectiveStatusCode startswith "429"
| summarize count() by bin(env_time, 1h)
```
`[来源: onenote-mfa-throttling-tsg.md]`

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').AllSASCommonEvents
| where env_time between (startTime .. endTime)
| where Msg has "throttl" or Msg has "TooManyRequests"
| where userObjectId == '{userObjectId}'
| project env_time, SourceCall, Msg
```
`[来源: onenote-mfa-throttling-tsg.md]`

---

## Scenario 11: NPS Extension for Azure MFA — Architecture and Troubleshooting
> 来源: onenote-nps-mfa-extension-architecture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. VPN client sends RADIUS request to VPN server
- 2. VPN server sends RADIUS request to NPS server
- 3. NPS performs primary authentication against AD DS
- 4. Primary auth success → passes to NPS Extension
- 5. NPS Extension converts RADIUS→REST, authenticates to tenant via:
- 6. Azure MFA identifies default auth method → sends challenge to user
- 7. Azure MFA returns result with trust assertion token
- 8. NPS Extension converts REST response → RADIUS response → VPN server
- 9. VPN server forwards response to client → VPN connected
- 1. Enable NPS audit logging:

---

## 附录: Kusto 查询参考

### mfa-detail
> MFA 详细日志查询

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').SASCommonEvent
| where env_time between(datetime({startTime})..datetime({endTime}))
| where TrackingID has '{trackingId}'
// | where contextId has '{tenantId}'
// | where userObjectId has '{userId}'
| project env_time, loggingLevel, contextId, userObjectId, TrackingID, SourceCall, 
    Msg, ExceptionText, ScaleUnit, ApplicationId, OriginalRequestId, 
    SasInternalCorrelationId, SasSessionId, AuthenticationMethod
| limit 1000
```

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').SASRequestEvent
| where env_time between(datetime({startTime})..datetime({endTime}))
| where TenantId == "{tenantId}"
| where UserObjectId == "{userId}"
| project UserObjectId, SasSessionId, env_time, ResultCode, IsSuccessfulAuthentication, AuthenticationMethod
```

```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').AllSASCommonEvents
| where env_time >= ago(10d)
| where TrackingID == "{trackingId}"  // TrackingID is ESTS correlation ID
| where Msg contains "BlockAllEnterpriseVoiceTrafficInCountryExceptAllowedTenants" 
    or Msg contains "BlockAllEnterpriseSmsTrafficInCountryExceptAllowedTenants"
| project env_time, loggingLevel, contextId, userObjectId, TrackingID, SourceCall, Msg, 
    ExceptionText, ScaleUnit, ApplicationId, OriginalRequestId, SasInternalCorrelationId, 
    SasSessionId, AuthenticationMethod
```

---