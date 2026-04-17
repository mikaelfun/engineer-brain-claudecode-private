---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Microsoft Entra Domain Name Management"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FMicrosoft%20Entra%20Domain%20Name%20Management"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Microsoft Entra Domain Name Management - Scoping & Workflow

## Scope

Common domain name management problems:
- Add/Verify Domain
- Delete Domain
- Directory Delete (tagged off .onmicrosoft.com domain)
- Viral takeover (where custom domain has been verified)

## Scoping and Data Collection

1. **Azure Support Center** (https://azuresupportcenter.msftcloudes.com) - Search domain in ASC Tenant Explorer > Domain's blade to check Verified/Unverified status

2. **DNS Verification** - Check customer has created TXT or MX records:
   ```powershell
   Resolve-DnsName -Name domain.com -Type TXT
   Resolve-DnsName -Name domain.com -Type MX
   ```

3. **Check if domain exists in another directory**:
   - **OIDC Metadata Discovery**: `https://login.microsoftonline.com/{domain}/.well-known/openid-configuration`
     - Returns tenant ID if domain is verified; AADSTS90002 if not found
     - `tenant_region_scope`: NA=Public North America, EU=Public Europe, USG/USGov=Government
   - **User Realm endpoint**: `https://login.microsoftonline.com/common/userrealm/{domain}?api-version=2.1`
     - Check `IsViral: True` for viral/unmanaged tenants
     - Customer must use [Admin Takeover](https://docs.microsoft.com/en-us/azure/active-directory/enterprise-users/domains-admin-takeover)

4. **Understand customer intent** - Are they trying to:
   - Add and verify a new domain?
   - Transfer domain from another tenant?
   - Delete a domain that is no longer needed?

## Domain Verification DNS Records

- TXT record: `MS=msXXXXXXXX`
- MX record: `msXXXXXXXX.msv1.invalid.outlook.com`

## Key Tools

- Azure Support Center (ASC) Tenant Explorer
- DS Explorer
- Identity Consistency (ICC) tool
- OIDC metadata endpoint
- User Realm API endpoint
- Kusto: MSODS GlobalIfxUlsEvents()

## Related Sub-pages

- Troubleshooting Tenant and Domain (comprehensive TSG)
- Troubleshooting domain verification configuration
- Verifying a custom subdomain as managed domain
- Add MOERA and Promote to Initial domain
