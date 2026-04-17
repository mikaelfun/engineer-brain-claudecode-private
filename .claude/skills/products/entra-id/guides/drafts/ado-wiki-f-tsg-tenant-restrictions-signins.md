---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Tenant Restrictions/TSG - Troubleshoot Tenant Restrictions Sign-ins"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Tenant%20Restrictions%2FTSG%20-%20Troubleshoot%20Tenant%20Restrictions%20Sign-ins"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TSG - Troubleshoot Tenant Restrictions Sign-ins

## Overview

Customers open tickets when they see unexpected sign-in entries:
- Users from unknown external domains
- UserId = "00000000-0000-0000-0000-000000000000"
- UserName = xyz.onmicrosoft.com (another tenant)
- "PII removed - Tenant Restrictions" as display name

## Scenario 1: Successful sign-in from allowed tenant, failure from non-allowed

**Example**: Successful sign-in from microsoft.com, failure from contoso.onmicrosoft.com.

**Investigation**:
1. ASC > Sign-ins > search by CorrelationId and timestamp
2. Click "Troubleshoot this sign-in" > Expert View
3. Check `SpecialFlow` = `TenantRestrictions`
4. Check `RestrictedTenantProxySetter` = policy-setting tenant ID
5. Diagnostics Logs tab > TRv1 policy = permitted tenant list

**Root cause**: microsoft.com is in permitted list; contoso.onmicrosoft.com is not. Error: `NotAllowedTenantRestrictedTenant`.

## Scenario 2: "PII removed - Tenant Restrictions" in sign-in logs

Sign-in logs published to the tenant whose network enforces TR. PII masked because user is from external tenant.

**Verification**: Same steps as Scenario 1 - check SpecialFlow and RestrictedTenantProxySetter.

## Scenario 3: Passthrough authentication

If sign-in has `XTenantRel = passthrough (64)`:
- Sign-in log published to user home tenant only, NOT resource tenant
- Resource tenant CA policies not available
- Passthrough token only contains user ID, no authorization scopes
- If tenant enables TR or CA policies affecting all users, passthrough tokens no longer issued

## Scenario 4: Sign-in from external tenant to applications not in local tenant

**Expected behavior**: TR policy on network tracks every tenant signed into. When Restrict-Access-Context header is set, Entra ID forwards heavily masked external sign-in logs to the policy-setting tenant.

**Customer communication**: This is network-level configuration, not Entra ID control. The Restrict-Access-Context header triggers log forwarding with PII masking.

## Key Data Points for Investigation
- `SpecialFlow` in PerRequestLogs = `TenantRestrictions`
- `RestrictedTenantProxySetter` = tenant that set the restriction
- `TRv1 policy` in Diagnostics Logs = permitted tenant list
- Error code: `NotAllowedTenantRestrictedTenant` for blocked sign-ins
