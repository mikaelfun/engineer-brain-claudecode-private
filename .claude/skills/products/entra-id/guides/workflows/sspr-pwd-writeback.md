# Entra ID SSPR & Password Writeback — 排查工作流

**来源草稿**: ado-wiki-b-password-writeback-support-overview.md, ado-wiki-b-sspr-cloud-users.md, ado-wiki-b-sspr-hybrid-users.md, ado-wiki-b-sspr-security-questions-retirement.md, ado-wiki-c-password-writeback-support-overview.md, ado-wiki-c-troubleshooting-password-writeback.md, ado-wiki-d-password-writeback-sspr-cloud-sync.md, ado-wiki-f-password-writeback-not-working.md, ado-wiki-f-sspr-mfa-combined-registration.md, ado-wiki-f-sspr-reporting.md... (+3 more)
**场景数**: 11
**生成日期**: 2026-04-07

---

## Scenario 1: Compliance note
> 来源: ado-wiki-b-password-writeback-support-overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Supported end-user operations
- 2. Supported administrator operations
- 1. Unsupported end-user operations
- 2. Unsupported administrator operations
- 1. An Azure AD tenant with at least an Azure AD Premium P1 or trial license enabled.
- 1. An account with global administrator privileges.
- 1. Azure AD configured for self-service password reset.
- 1. An on-premises AD DS environment configured with Azure AD Connect cloud sync version 1.1.587 or later.
- 1. Enabling password writeback in Azure AD Connect cloud sync requires executing signed PowerShell scripts.
- 1. Reset password

---

## Scenario 2: SSPR - Cloud Users Troubleshooting Guide
> 来源: ado-wiki-b-sspr-cloud-users.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. User has SSPR enabled
- 2. User has required auth methods defined per admin policy
- 3. For admin roles: strong two-gate policy enforced

---

## Scenario 3: SSPR - Hybrid Users (Password Writeback) Troubleshooting Guide
> 来源: ado-wiki-b-sspr-hybrid-users.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Approach**
   - 1. Get error message from Password Reset Portal + Fiddler/HAR
   - 2. Check if user is Synced or Cloud-only (verify in ASC)
   - 3. Check Application Event Log in ASC (Source: ADSync, PasswordResetService)

---

## Scenario 4: Troubleshooting Password Writeback - Complete TSG
> 来源: ado-wiki-c-troubleshooting-password-writeback.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 5: Password Writeback and SSPR with Cloud Sync
> 来源: ado-wiki-d-password-writeback-sspr-cloud-sync.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step-by-Step Troubleshooting**
   - 1. Ask customer to do SSPR from https://passwordreset.microsoftonline.com
   - 2. Collect correlation ID from the bottom of the page
   - 3. Query SSPR Kusto tables with correlation ID

### 关键 KQL 查询
```kql
IfxTraceEvent
| where env_time >= ago(1h)
| where correlationId == "xxxxxx"
| project env_time, env_seqNum, traceEnumCode, message
```
`[来源: ado-wiki-d-password-writeback-sspr-cloud-sync.md]`

```kql
IfxTraceEvent
| where env_time >= ago(5d)
| where contextId == "<TenantID>"
| where * contains "<ObjectID>"
| project env_time, env_seqNum, traceEnumCode, correlationId, message, exceptionText, loggingLevel, operationName
| order by env_time
```
`[来源: ado-wiki-d-password-writeback-sspr-cloud-sync.md]`

---

## Scenario 6: Password Writeback Not Working
> 来源: ado-wiki-f-password-writeback-not-working.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - *1.** Get a non-admin test user (test@contoso.com) in Entra ID and ask them to perform SSPR using aka.ms/sspr.
   - *2.** Open CMD on the primary DC and run (attach the file in DTM):

---

## Scenario 7: Compliance note
> 来源: ado-wiki-f-sspr-mfa-combined-registration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.	From Azure Support Center -> Tenant Explorer , open Kusto Web UX for the tenant
- 2.	Add the Kusto Cluster idsharedscus.southcentralus
- 3.	Once cluster is added, expand the databases and select the IAMUXPROD database
- 4.	Copy and Paste a query such as the one below to find logs for combined registration portal events:
- 1.  Click **Logs**
- 2.  The initial search searches all fields with a Filter condition of the SessionID obtained from the formatted ETL trace or the user's userPrincipalName.
- 1.  **Endpoint**: Diagnostic PROD   , for Azure Gov use CA Fairfax
- 2.  **Namespace**: AadIamuxProd , for Azure Gov use AadIamuxARProd
- 3.  **Events to search**: DgrepEventEtwTable
- 4.  **Time range**: mm/dd/yyyy hh:mm \<UTC checked\> +/- 3 Minutes

---

## Scenario 8: Feature Overview
> 来源: ado-wiki-f-sspr-reporting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.  Sign into the Azure portal as a Security Reader, a Security Administrator, or a Reports Reader.
- 2.  Browse to **Usage & insights** \> **Authentication methods activity**.�

---

## Scenario 9: Troubleshooting
> 来源: ado-wiki-f-sspr-service-side-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Using ASC you can find SSPR failures using ASC Tenant Explorer's Audit Logs query and a filter such as:
- 2. Once the failure is find, expand details and locate the correlation ID and Timestamp
- 3. If the failure reason isn't obvious from ASC Audit Logs, you can query SSPR service logs using ASC Kusto Web UX log steps below. Change the Tracking ID to be the ASC correlation ID and the Timestam
- 4. To obtain the Tracking ID from customer you can either
- 1. Request customer provide https://aka.ms/hartrace and reference the headers of the https://passwordreset.microsoftonline.com portal frames.
- 2. Ask cutomer to click the "Support Code" dialog in bottom right of password reset portal prior to reproducing the error, and copy this code and provide to you.  It is equivalent to the SSPR Tracking
- 1. Use ASC -> AADConnect Synchronization -> Sync Application Events
- 2. Set Time Range and Severity Level to Warning or Error, then click Load
- 3. In the result, filter and check any Password Writeback errors.
- 1. Use ASC -> Tenant Explorer -> Password Management-Self-service password reset -> Combined Registration to check the tenant Self-service password reset Combined Registration policy scope.

---

## Scenario 10: Password Writeback Access Rights and Permissions
> 来源: mslearn-password-writeback-access-rights-permissions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Open Synchronization Service Manager → Connectors tab → select AD connector → Properties
- 2. Select "Connect to Active Directory Forest" → copy the **User name** (MSOL_ account)

---

## Scenario 11: Password Writeback General Troubleshooting Steps
> 来源: mslearn-password-writeback-general-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

---
