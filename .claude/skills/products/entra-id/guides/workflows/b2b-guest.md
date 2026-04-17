# Entra ID B2B Guest Access — 排查工作流

**来源草稿**: ado-wiki-a-b2b-invitations-blocked-tsg.md, ado-wiki-c-auto-remove-stale-pending-guest-users.md, ado-wiki-c-b2b-searching-service-logs.md, ado-wiki-d-avd-b2b-identities.md, ado-wiki-d-b2b-aadsts-error-codes.md, ado-wiki-d-b2b-xtap.md, ado-wiki-e-b2b-collaboration-sponsors.md, ado-wiki-e-ca-fine-grained-guest-policies.md, ado-wiki-e-ca-guests-and-roles.md, ado-wiki-g-inactive-guest-report.md... (+4 more)
**场景数**: 11
**生成日期**: 2026-04-07

---

## Scenario 1: B2B TSG: Invitations are blocked for this directory due to suspicious activity
> 来源: ado-wiki-a-b2b-invitations-blocked-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Root Cause**
   - Microsoft performs anomaly detection to prevent fraudulent bulk invites and will block invitations to protect customers. Customers should keep an active paid subscription to prevent false positive blo

---

## Scenario 2: B2B collaboration TSG: Searching B2B Service Logs
> 来源: ado-wiki-c-b2b-searching-service-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. The customer will need to at minimum provide you a timestamp of the failure, or the raw audit log from their Entra ID Audit Logs showing you the timestamp and correlation ID of the failure. Request
   - 2. If the customer cannot provide the above details, you can search for the failure using Azure Support Center -> Tenant Explorer -> Audit Logs. Use one of the below filters depending on the failure s
   - *Invitation Failure**

### 关键 KQL 查询
```kql
let id = "5813c187-xxxx-xxxx-xxxx-a2d0adfcd230"; //Replace with correlation ID from ASC Audit Log
   let delta = 8h;
   let timestamp = datetime(2022-10-24T12:40); // Replace with timestamp from ASC Audit Log
   union withsource=TableName B2B*
   | where env_time >= timestamp-delta and env_time <= timestamp+delta
   | where correlationId == id or internalCorrelationId == id or message has id
   | where loggingLevel != "Verbose"  // Remove this filter to see Verbose logs if root cause is not obvious
   | project TableName, env_time, httpMethod, exception, message, method, contextId, controller, url
```
`[来源: ado-wiki-c-b2b-searching-service-logs.md]`

```kql
let delta = 1h;
let timestamp = datetime(2022-10-24T12:40); // Replace with timestamp from ASC Audit Log
union withsource=TableName B2B*
| where env_time >= timestamp-delta and env_time <= timestamp+delta
| where loggingLevel != "Verbose"
| project TableName, env_time, httpMethod, exception, message, method, contextId, controller, url
```
`[来源: ado-wiki-c-b2b-searching-service-logs.md]`

---

## Scenario 3: Compliance note
> 来源: ado-wiki-d-avd-b2b-identities.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. User clicks **Subscribe** or **Subscribe with URL**
- 2. Request a token in their home cloud/tenant (URL) or Azure Public by default
- 3. User selects their account or adds a new one
- 4. Retrieve the resources in their home tenant if available
- 5. Query all other tenants the user is part of. Return list of tenants.
- 6. Client makes one home tenant authenticated call to the AVD service passing their list of tenants to see if they have AVD resources in those other tenants. The service makes a check access call with
- 7. For each tenant with resources, attempt to retrieve the resources silently by getting a tenanted token. Scale concern
- 8. When users client the Subscribe option after 7b, request in token in the appropriate tenant to retrieve the resources.
- 1. Get the tenant ID of the resource tenant where the AVD computers are running.
- 2. Open a browser and navigate to: https://windows365.microsoft.com/ent?tenant={resource_tenantid}.

---

## Scenario 4: Error Code List
> 来源: ado-wiki-d-b2b-aadsts-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. [Authentication flow for external Microsoft Entra users](https://learn.microsoft.com/en-us/entra/external-id/authentication-conditional-access#authentication-flow-for-external-microsoft-entra-users
- 2. [Authentication flow for non-Azure AD external users](https://learn.microsoft.com/en-us/entra/external-id/authentication-conditional-access#authentication-flow-for-non-azure-ad-external-users)
- 3. [Invitation redemption flow](https://learn.microsoft.com/en-us/entra/external-id/redemption-experience#invitation-redemption-flow)
- 1. An external user `user@contoso.com` is directed to the Entra authorization endpoint for a resource tenant Example: `https://login.microsoftonline.com/resourcetenant.onmicrosoft.com/oauth2/v2.0/auth
- 2. If the user is already signed into their own identity provider, SSO may occur.  If the user is not already signed in, the Entra login UX is displayed and username is entered.
- 3. Entra GetCredentialType API `https://login.microsoftonline.com/common/GetCredentialType?mkt=en-US` with the username entered and looks up if the entered username has any valid Entra or Microsoft Pe
- 4. Once a valid home user is found, and user authenticates against their identity provider the response is sent to the login endpoint of the resource tenant `https://login.microsoftonline.com/resource
- 5. At this point eSTS will have the home user's identity provider and sub\PUID claims and will query resource tenant for the following
- 6. If customer is trying to perform guest invite redemption using JIT\direct link\tenanted endpoint https://learn.microsoft.com/en-us/entra/external-id/redemption-experience#redemption-process-through
- 10. To further diagnose any "User account X from identity provider Y does not exist in tenant Z" errors, obtain a Fiddler or HAR trace of a repro or ask for the error's correlation ID , request ID, an

### 相关错误码: AADSTS16003, AADSTS50020, AADSTS500211, AADSTS50034, AADSTS50177

---

## Scenario 5: Compliance note
> 来源: ado-wiki-d-b2b-xtap.md | 适用: Mooncake ✅

### 排查步骤
- 1. As an IT admin of Contoso, I want to block access for my users to tenant Fabrikam.
- 2. As an IT admin of Contoso, I want to allow access for my users only to tenants Foo and Bar.
- 3. As an IT admin of Contoso, I want to allow access to Tenants Foo and Bar to only specific users/groups within Contoso (e.g. Grp 1 can only access Foo and Grp 2 can only access Bar).
- 1. As an IT admin of Contoso, I want to block access to my resources to users from tenant Fabrikam.
- 2. As an IT admin of Contoso, I want to allow access to my resources to users only from tenants Foo and Bar.
- 3. As an IT admin of Contoso, I want to allow access to my resources (protected by MFA) from Tenants Foo and Bar while accepting Foos MFA and avoiding re-MFA in Contoso.
- 4. As an IT admin of Contoso, I want to allow access to my resources (protected by CompliantDevice/HybridAADJDevice) from Tenant Bar while accepting Tenant Bars device assertions (claims).
- 5. As an IT admin of Contoso, I want to accept MFA and device claims from specific users/groups within Tenant Baz before allowing them access to my resources.
- 1) XTAP that refers CloudServiceProvider on the inbound trusts:
- 2) XTenantRel = B2B:

### 相关错误码: AADSTS50076, AADSTS500212, AADSTS500213, AADSTS5000211, AADSTS500021

---

## Scenario 6: B2B Collaboration Sponsors
> 来源: ado-wiki-e-b2b-collaboration-sponsors.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - Using Graph Explorer in ASC we can determine the list of sponsors:
   - GET https://graph.microsoft.com/beta/users/b3ec96ea-####-####-####-############/sponsors/

---

## Scenario 7: Azure AD Conditional Access - Fine Grained Policies for Guests and External Users
> 来源: ado-wiki-e-ca-fine-grained-guest-policies.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Tips**
   - Verify the user type classification matches expectations (check sign-in logs for userType)
   - External organization filtering uses the domain of the user's home tenant
   - Policy conflicts may occur if multiple policies target overlapping user types

---

## Scenario 8: Training
> 来源: ado-wiki-e-ca-guests-and-roles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - When troubleshooting Conditional Access Policy failing to apply for users that are members of Directory Roles.
   - 1.  Determine if the customer has an Azure AD Premium P2, or Office E5 Subscription.
   - 1.  If they use Privileged Identity Management (PIM), verify the user was not listed as an '**Eligible**' role member at the time the login was attempted. Only '**Active**' role members will pass Cond

---

## Scenario 9: Identity Governance Inactive Guest Report
> 来源: ado-wiki-g-inactive-guest-report.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - **Inactive count shows 0**: All guests were added more recently than the inactivity threshold. Adjust the threshold.
   - **Guest count mismatch**: Verify with Azure AD that the guest count matches. Both views use the same APIs.

---

## Scenario 10: Cross-Cloud B2B PoC Setup Steps
> 来源: onenote-ccb2b-poc-steps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**

---

## Scenario 11: Cross-Cloud B2B vs Dual-Federation vs Multi-Tenant Sync
> 来源: onenote-ccb2b-vs-dual-federation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Need Dynamics 365 cross-cloud?** → Dual-Fed or Multi-Tenant Sync (CC B2B not supported)
- 2. **Need Azure CLI/PowerShell cross-cloud?** → Dual-Fed or Multi-Tenant Sync (CC B2B limited)
- 3. **Only need O365 + Teams collaboration?** → CC B2B (simplest, no PG approval needed)
- 4. **Have 1500+ seats + Unified support?** → Consider Dual-Fed for full scope
- 5. **Cannot use same domain on both clouds?** → Multi-Tenant Sync or CC B2B

---
