---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Microsoft Entra Domain Name Management/Troubleshooting domain verification configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FMicrosoft%20Entra%20Domain%20Name%20Management%2FTroubleshooting%20domain%20verification%20configuration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Domain Verification Configuration

## Verifying Tenant or Domain Existence

### OpenID Connect Metadata Endpoint

Use: `https://login.microsoftonline.com/{REPLACE}/.well-known/openid-configuration`

Replace with Tenant ID, onmicrosoft.com domain, or custom domain.

**What it tells you:**
- Tenant exists (URL resolves without error)
- Tenant ID associated with the domain
- `tenant_region_scope`: NA = Public North America, EU = Europe, USG/USGov = Government

> GCC tenants show `tenant_region_scope: NA` (not USGov). See [FAQ](https://learn.microsoft.com/en-us/azure/azure-government/documentation-government-plan-identity#frequently-asked-questions).

## Domain Already Verified - Viral vs Managed

When customer cannot verify domain because "already verified on another tenant":

### Step 1: Check User Realm API

```
https://login.microsoftonline.com/common/userrealm/domain.com?api-version=2.1
```

### Step 2: Check IsViral

- **IsViral = true** -> Viral (unmanaged) tenant
  - Customer can perform [Admin Takeover](https://learn.microsoft.com/en-us/azure/active-directory/enterprise-users/domains-admin-takeover)

- **No IsViral attribute** -> Managed tenant
  - Customer must contact Global Admin of that tenant to remove domain
  - If customer has DNS privileges but cannot reach GA, escalate to [O365 Data Protection team](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/370619/Office-365-Data-Protection-Escalations)

## Confirming Federated vs Managed Domain

Use User Realm API (same endpoint above):

- `NameSpaceType: "Managed"` -> Managed domain
- `NameSpaceType: "Federated"` -> Federated domain (also shows AuthURL, federation_protocol)

## Verifying Microsoft Personal Account (MSA) Existence

```
https://login.microsoftonline.com/common/userrealm?user=user@domain.com&api-version=2.1&checkForMicrosoftAccount=true
```

- `MicrosoftAccount: 0` -> Personal account found
- `MicrosoftAccount: 1` -> No personal account found
