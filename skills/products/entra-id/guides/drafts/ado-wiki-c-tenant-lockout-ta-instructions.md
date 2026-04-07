---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Tenant Lockout TA Instructions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FTenant%20Lockout%20TA%20Instructions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Tenant Lockout - TA Instructions

## Known Issues - Check First

### Sovereign Clouds (GCC High and DOD)
- Data Protection team handles sovereign clouds differently
- Support Engineer should NOT transfer the case or collab task to DPT
- Submit ADO item via template: https://dev.azure.com/CSSDataProtection/DataProtection%20Escalation/
- For weekend Sev A with all users blocked: select Severity 1 Critical

### Internal/MS Tenants
- **AADSTS5000224**: Check if tenant is part of de-auth initiative
- MS enforced MFA for Partners: Validate blocking policy "Multifactor authentication for Microsoft partners and vendors"
- Do NOT run ACIS/LOCKOUT without approval from Nikhil Reddy Boreddy / Dilesh Dhokia

### Authentication Strengths
- Admin blocked by requiring passwordless via MS Authenticator (Phishing Resistant MFA) cannot enable Passwordless auth in Authenticator app
- Tenant lockout bypass required

## Out of Scope

| Scenario | Notes |
|----------|-------|
| Risk Level Evaluation | May fail bypass; transfer to "Identity Protection Service/Triage" |
| Account disabled | Engage DPT to correct |
| Issue with Primary Credentials | Need valid username/password; engage DPT |
| Admin flagged as minor | GDPR minor blocks Azure Portal; elevate another account or MSODS service-side edit |

## Basic Validation Checks

1. What caused the policy failure? Hard block vs. unfulfillable grant control?
2. Does the blocking policy have exclusions (group/user)?
3. Is admin blocked due to evaluated RISK? Check past sign-in IP/locations
4. Does admin have a different auth method that would pass?
5. Was policy misconfigured or referenced object deleted (Named Location, Custom Control)?
6. Is admin being required to register for MFA with wrong method?
7. Can policy be satisfied from a different device (Hybrid device)?

## Mitigation Steps (Geneva Action)

### Prerequisites
- SAW joined to AME domain
- AME account in AME\AAD-TA group
- JIT access

### Steps
1. Verify DPT has confirmed tenant ownership
2. Verify lockout cannot be corrected by MFA re-registration
3. Navigate to https://aka.ms/jarvis-dsts on SAW
4. Actions > Public > **ESTS Conditional Access > Lockout Cache Operation Group > Add CA policy exclusion (does Kusto based validation)**
5. Get Access with:
   - Work-item Source: IcM
   - Scope: ESTSConditionalAccess
   - Access Level: CustomerServiceAdministrator
6. After JIT approved, run action:
   - Endpoint: ESTSConditionalAccessExtension
   - Target environment: PROD
   - TenantId, ObjectID, CorrelationId, Login Time UTC, SR/IcM #
7. Allow up to 15 minutes; customer modifies/disables policy; resolve incident

### Geneva Action Errors

| Error | Mitigation |
|-------|-----------|
| No Azure Portal login found | Data provided likely not accurate; review incident |
| Latest login was successful | Admin may not be locked out; verify with Kusto queries |
| Blocked because of per-user MFA | Cannot bypass per-user MFA; contact DPT |
| Not blocked by CA/IPC/SD | If CA is actually blocking, escalate to ESTS>Conditional Access |
| Login not familiar (RAM) | Confirm DPT validated identity; escalate to ESTS>CA if needed |
| Unhandled exception | Retry; if persists, email idprodev@microsoft.com |
| Failed in following caches | Retry; if persists, email address in error message |

## Escalation Targets

| Scenario | Target Team |
|----------|-------------|
| CA Policy Blocking | Conditional Access/Triage |
| Security Defaults + Risk | Identity Protection Service/Security Defaults |
| Blocked due to Risk | Identity Protection Service/Pipelines |
| CBA Blocking | Try "Other ways to sign-in" first; then CBA TSG |

## ICM Severity Guide

| Severity | Criteria |
|----------|---------|
| Sev 2 | S500/Premier Sev A + all admins/users blocked + M2 approval |
| Sev 3 | Only admins locked out; end-users can access. Or DEV tenant blocking deployment |
| Sev 4 | Non-production, non-blocking |
