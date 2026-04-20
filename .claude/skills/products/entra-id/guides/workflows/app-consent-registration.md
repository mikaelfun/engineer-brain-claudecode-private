# Entra ID App Registration & Consent — 排查工作流

**来源草稿**: ado-wiki-a-app-consent-policies-lab.md, ado-wiki-a-azure-ad-admin-consent-workflow.md, ado-wiki-a-grant-user-consent-on-behalf-powershell.md, ado-wiki-a-microsoft-managed-consent-policy-change.md, ado-wiki-a-revoke-admin-user-consent-entra-powershell.md, ado-wiki-a-understanding-prompt-consent-oauth-request.md, ado-wiki-a-user-consent-settings-admin-consent-workflow.md, ado-wiki-a-user-consent-settings-low-risk-permissions.md, ado-wiki-a-user-low-risk-permission-consent.md, ado-wiki-azure-ad-admin-consent-workflow.md... (+8 more)
**场景数**: 11
**生成日期**: 2026-04-07

---

## Scenario 1: Azure AD Admin Consent Workflow
> 来源: ado-wiki-a-azure-ad-admin-consent-workflow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps**
   - 1. Find the Audit event matching the [admin consent workflow audit events](#audit-logs)
   - 2. Locate the CorrelationId under the Activity section
   - 3. Determine which service owns the error:

### 相关错误码: AADSTS90097, AADSTS65004

---

## Scenario 2: Granting User Consent on Behalf of Another User Using PowerShell
> 来源: ado-wiki-a-grant-user-consent-on-behalf-powershell.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Copy the PowerShell script from [Microsoft Learn — Grant consent on behalf of a single user](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/grant-consent-single-user?pivots=msgrap
   - 2. Modify variables:
   - `$clientAppId` → your application's client ID

---

## Scenario 3: User Consent Settings — Let Microsoft Manage Your Consent Settings
> 来源: ado-wiki-a-microsoft-managed-consent-policy-change.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Set user consent to **Low impact** in Entra admin portal
- 2. Set user consent to **Off** in Entra admin portal
- 3. Create a custom consent policy to fully revert changes

### 相关错误码: AADSTS90094, AADSTS90095

---

## Scenario 4: User Consent Settings — Low Risk Permissions
> 来源: ado-wiki-a-user-consent-settings-low-risk-permissions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Set User Consent to "Low impact" mode**
   - Entra Admin Center → **Entra ID** → **Enterprise Applications** → **Consent and Permissions** → **User consent settings**
   - Select: **"Allow user consent for apps from verified publishers, for selected permissions"**
   - (A hyperlink "Select permissions to classify as low impact" appears → navigate to **Permissions classifications** tab)
2. **Step 2: Add Low-Risk Permission Classifications**
   - Permissions classifications → **+ Add permissions** → Microsoft Graph → **Delegated permissions**
   - Search for and add:
   - `Tasks.Read`

---

## Scenario 5: Azure AD User Low Risk Permission Consent in Apps
> 来源: ado-wiki-a-user-low-risk-permission-consent.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

---

## Scenario 6: Azure AD Admin Consent Workflow
> 来源: ado-wiki-azure-ad-admin-consent-workflow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

### 相关错误码: AADSTS90097, AADSTS65004

---

## Scenario 7: Compliance note
> 来源: ado-wiki-b-entra-id-app-registrations.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 8: Troubleshooting Consent in Azure AD
> 来源: ado-wiki-b-troubleshooting-consent-in-azure-ad.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps**

### 相关错误码: AADSTS65001, AADSTS650056, AADSTS90094, AADSTS90008, AADSTS900941

---

## Scenario 9: Risk Based Step-up Consent
> 来源: ado-wiki-c-risk-based-step-up-consent.md | 适用: Mooncake ✅ / Global ✅

### 关键 KQL 查询
```kql
AuditLogs
| where ResultDescription contains "Risky application detected"
    or ResultDescription contains "Microsoft.Online.Security.UserConsentBlockedForRiskyAppsException"
| project TargetedUsers = InitiatedBy, TimeGenerated, TargetResources
```
`[来源: ado-wiki-c-risk-based-step-up-consent.md]`

```kql
let _start = datetime(2020-04-20 12:15:00);
let _end = datetime(2020-04-20 12:20:00);
GlobalIfxUlsEvents
| where env_time between (_start .. _end)
| where env_cloud_role == "restdirectoryservice"
| where internalCorrelationId == "<correlationId>"
| where tagId == "03jo"
| project env_time, internalCorrelationId, correlationId, contextId, tagId, message
```
`[来源: ado-wiki-c-risk-based-step-up-consent.md]`

```kql
GlobalIfxRestBusinessCommon
| where env_time between (_start .. _end)
| where env_cloud_role == "restdirectoryservice"
| where internalCorrelationId == "<correlationId>"
| project env_time, internalCorrelationId, correlationId, operationName, contextId, applicationId, httpStatusCode, exceptionType
```
`[来源: ado-wiki-c-risk-based-step-up-consent.md]`

### 相关错误码: AADSTS90094, AADSTS90095

---

## Scenario 10: Troubleshoot Consent Issues in Microsoft Entra ID
> 来源: mslearn-consent-issues-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Get the sign-in request**
   - Capture the OAuth2 authorize URL from browser address bar or Fiddler. Key params: `client_id`, `scope`, `resource`, `prompt`.
2. **Step 2: Check if user consent is allowed**
   - Portal > Entra ID > Enterprise apps > Consent and permissions
   - "Do not allow user consent" → admin must consent
   - "Allow user consent for apps" → continue to Step 3
3. **Step 3: Verify application exists in tenant**
   - Enterprise applications > search by App-ID
   - Not found → perform admin consent (this creates the SP)
4. **Step 4: Check user assignment required**
   - Enterprise app > Properties > "Assignment required"
   - If Yes → admin must consent
5. **Step 5: Compare requested vs granted permissions**
   - Enterprise app > Permissions
   - Compare with `scope` in sign-in request
   - Missing scopes → admin consent needed
6. **Step 6: Verify resource exists in tenant**
   - Test: `https://{instance}/{tenant}/oauth2/authorize?response_type=code&client_id={appId}&resource={resourceUri}`
   - AADSTS650052 → resource not subscribed
   - AADSTS650057 → resource not in app registration
7. **Step 7: Check prompt parameter**
   - `prompt=consent` or `prompt=admin_consent` forces consent screen
   - Remove prompt param after initial consent
8. **Resolution: Admin Consent**

### 相关错误码: AADSTS65001, AADSTS650056, AADSTS90094, AADSTS90008, AADSTS900941

---

## Scenario 11: Consent Troubleshooting Guide (Entra ID)
> 来源: mslearn-consent-troubleshooting-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Capture the sign-in request**
   - Get the OAuth2 authorize URL from browser address bar or HTTP capture tool
   - Key parameters: `client_id`, `scope`, `resource`, `prompt`, `tenant-id`
2. **Step 2: Check user consent settings**
   - Entra ID > Enterprise applications > Consent and permissions
   - If "Do not allow user consent" → admin must perform consent
3. **Step 3: Verify application exists in tenant**
   - Enterprise applications > Application Type = All > search by App-ID
   - If not found → perform admin consent to create service principal
4. **Step 4: Check user assignment requirement**
   - Enterprise app > Properties > Assignment required
   - If Yes → admin must consent; user assignment rules apply
5. **Step 5: Compare permissions requested vs granted**
   - Enterprise app > Permissions vs `scope` in sign-in request
   - Missing scopes need consent (delegated vs application type matters)
   - OpenID scopes (openid, email, profile, offline_access) may not appear
6. **Step 6: Verify resource exists in tenant**
   - Test: `https://{aad-instance}/{tenant}/oauth2/authorize?response_type=code&client_id={appId}&resource={resourceUri}`
   - AADSTS650052 → resource not subscribed
   - AADSTS650057 → resource not in app registration API permissions
7. **Step 7: Check prompt parameter**
   - `prompt=consent` or `prompt=admin_consent` forces consent screen every time
   - Remove after initial consent is granted
8. **Diagnostic: Audit Logs**
   - Entra ID > Audit logs > Category: ApplicationManagement > Status: Failure > Activity: Consent to application
   - Check STATUS REASON for details (e.g., UserConsentBlockedForRiskyAppsException)

### 相关错误码: AADSTS65001, AADSTS650056, AADSTS90094, AADSTS90008, AADSTS900941

---


---

## Incremental Scenarios (2026-04-18)

## Scenario 12: Users/Customers claim that they cannot see their Line-Of-Business applications on Azure AD's Conditional Access Applicat...
> Source: contentidea-kb (entra-id-3654) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: Users/Customers claim that they cannot see their Line-Of-Business applications on Azure AD's Conditional Access Application picker, when creating new Conditional Access policies.
2. **Root cause**: This can happen when the user has created the application as a native app, or does not have a Web App platform configured under its Platform Configurations in Authentication sections of the applicatio...
3. **Solution**: The resolution on this is to apply Conditional Access to the available APIs that the application is invoking/accessing, or to the service that the API falls under.

---

## Scenario 13: Taking Examples : App name : <Application Name> with App ID : 2fddb45a-3701-403d-8063-69c4f8531838Attribute value ( Role...
> Source: contentidea-kb (entra-id-3662) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: Taking Examples : App name : <Application Name> with App ID : 2fddb45a-3701-403d-8063-69c4f8531838Attribute value ( Role ) : Service-based_Development_OperationsAttribute name in analysis : displayNam...
2. **Root cause**: Usually when this happens, the cause is that the role that currently exists in the application with that name is not the same role that previously had it. Each role has a unique identifier -  &quot;id...
3. **Solution**: 1) First, take a look in ASC using the AppId in the right tenant, to see if this role ( you can search with the id  ) is present as part of the serviceprincipal's roles, or the application's roles def...

---
