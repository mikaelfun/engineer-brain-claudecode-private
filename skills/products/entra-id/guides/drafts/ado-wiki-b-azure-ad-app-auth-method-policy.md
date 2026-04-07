---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Azure AD App Authentication Method Policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FAzure%20AD%20App%20Authentication%20Method%20Policy"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD App Authentication Method Policy

## AADSTS650059 - Single Tenant App Enforcement (April 2025)

ESTS blocks apps configured as single tenant from being used outside their home tenant.

**Scenario:**
1. App created as multi-tenant in Tenant A
2. User in Tenant B accesses it, creating SP in Tenant B
3. App changed to single-tenant in Tenant A
4. User in Tenant B gets AADSTS650059

**Error:** "The application (appId:{appId}) is not configured for use in tenant (tenantId: {tenantId}). The value AzureADMyOrg set for application property SignInAudience is limiting its use in the tenant."

**Troubleshooting:** Check signInAudience property on service principal (read-only). If customer owns app → change signInAudience to AzureADMultipleOrgs. If not → contact app owner.

**Enforcement date:** July 14, 2025 (211 apps temporarily whitelisted)

## Feature Overview

Application authentication method policies allow IT admins to enforce best practices:
- Block password secrets
- Set password secret lifetime thresholds
- Enforce based on app/SP creation date

**Two types:**
1. Tenant default policies (all apps/SPs)
2. Custom policies (per app/SP, override tenant policy)

**Requirements:**
- GET: Global Reader
- Tenant default UPDATE: Security Administrator
- Custom policy UPDATE: Application Administrator or Cloud Application Administrator

**Sovereign Cloud:** Available 30 days after Public Preview in Public cloud

## Known Issues

### Issue 1: Block create of secrets > maxLifetime fails
If app/SP created before `restrictForAppsCreatedAfterDateTime`, policy doesn't apply. If maxLifetime > 730 days, no options < 24 months will be blocked.

## Identifier URI Protection (May 2025 Breaking Change)

**Enforcement date:** May 19, 2025

Blocks non-default identifier URIs to prevent impersonation attacks. Two restriction types:
- `uriAdditionWithoutUniqueTenantIdentifier`: Requires URI to contain appId, tenantId, or verified domain
- `nonDefaultUriAddition`: Blocks all non-default URIs unless app is SAML, receives v2 tokens, or uses default URI

**Error:** "Failed to add identifier URI. All newly added URIs must contain a tenant verified domain, tenant ID, or appId, as per tenant policy."

**How to unblock:**
1. Use default URI: `api://{appId}` or `api://{tenantId}/{appId}`
2. Switch requestedAccessTokenVersion to 2 (WARNING: cannot revert to v1)
3. Use SAML protocol for SSO
4. Grant per-app exemption via appManagementPolicies API
5. Grant caller exemption via custom security attribute
6. Disable protection entirely (not recommended)

**Management scripts:** https://github.com/microsoft/entra-app-identifier-uri-protection

### Affected customers
- Millions of tenants auto-enrolled (no demonstrated impact)
- 156 tenants excluded (received targeted emails)
- Rollout for excluded tenants: Week of July 30, 2025

## Sign-In Audience Restriction

**New restriction type:** `allowedAudience`

Blocks creation/promotion of multi-tenant apps based on signInAudience value.

**Error:** "SignInAudience value 'AzureADMultipleOrgs' not allowed as per assigned policy '{policyId}'. Set the application to use single-tenant audience of 'AzureADMyOrg' or other allowed values."

**Configuration:**
| signInAudience | Restriction property |
|---|---|
| AzureADMyOrg | Cannot be blocked (minimum) |
| AzureADMultipleOrgs | azureAdMultipleOrg |
| PersonalMicrosoftAccount | personalMicrosoftAccount |

## API Reference

**Tenant default policy:** `https://graph.microsoft.com/beta/policies/defaultAppManagementPolicy`
**Custom policies:** `https://graph.microsoft.com/beta/policies/appManagementPolicies`

### Enable Identifier URI Protection (PowerShell)
```powershell
Connect-MgGraph -Scope "Policy.ReadWrite.ApplicationConfiguration"
$params = @{
    isEnabled = $true
    applicationRestrictions = @{
        identifierUris = @{
            nonDefaultUriAddition = @{
                state = "enabled"
                excludeAppsReceivingV2Tokens = $true
                excludeSaml = $true
            }
        }
        passwordCredentials = @()
        keyCredentials = @()
    }
}
Update-MgBetaPolicyDefaultAppManagementPolicy -BodyParameter $params
```

### ICM Escalation
- Owning service: IAM Services / Enterprise App Management (portal config)
- Owning service: ESTS / Incident Triage (token issuance)
