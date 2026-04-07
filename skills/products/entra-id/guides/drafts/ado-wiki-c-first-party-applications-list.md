---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/First_Party_Applications/How to/Microsoft 1st Party Applications List"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FFirst_Party_Applications%2FHow%20to%2FMicrosoft%201st%20Party%20Applications%20List"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Microsoft 1st Party Applications - Lookup Reference

## What is a First Party Application

Microsoft first-party applications are developed and maintained by Microsoft, often included by default in Azure services. They are installed in tenants for Microsoft services (portals, APIs, etc.).

Customers often report 1P apps appearing in tenants without explicit admin action — this is normal (added via subscription/license). Disabling or removing 1P apps may impact related services.

## How to Identify a 1P Application

### Method 1: ASC
Browse to **Applications → First-Party Applications** (requires Microsoft corpnet/SAW)

### Method 2: AAD-FirstPartyApps
Use [https://aka.ms/entra/appreg](https://aka.ms/entra/appreg) → search by AppId → check `owners.txt`

### Method 3: Token Encryption Dashboard
[https://aka.ms/token/encryption/dash](https://aka.ms/token/encryption/dash)

### Method 4: Public Doc
[Verify first-party Microsoft applications in sign-in reports](https://learn.microsoft.com/en-us/troubleshoot/azure/active-directory/verify-first-party-apps-sign-in)

### Method 5: GitHub Project
[Microsoft First Party App Names](https://github.com/merill/microsoft-info)

### Method 6: Microsoft 365 SaaS Apps
[Microsoft 365 SaaS Apps Security and Compliance](https://learn.microsoft.com/en-us/microsoft-365-app-certification/saas/saas-apps)

### Method 7: SFI Tenants Dashboard
[SFI Tenants](https://dataexplorer.azure.com/dashboards/354da2e1-eba6-4a9f-9c43-d5ae31d8bd15#db6b17f8-d69b-4ce6-8944-7acc69213ec8)

### Method 8: Tenant Info API
`GET tenantRelationships/findTenantInformationByTenantId(tenantId='{id}')`

## Key Microsoft Tenants

| Tenant Name | Tenant ID | Notes |
|-------------|-----------|-------|
| Microsoft Services | 47df5bb7-e6bc-4256-afb0-dd8c8e3c1ce8 | |
| Microsoft Services | f8cdef31-a31e-4b4a-93e4-5f571e91255a | |
| Microsoft | 72f988bf-86f1-41af-91ab-2d7cd011db47 | |
| MS Azure Cloud | 33e01921-4d64-4f8c-a055-5bdaffd5e33d | |
| Microsoft Accounts | 9188040d-6c67-4c5b-b112-36a304b66dad | Live/MSA/Microsoft Store tenant - apps with this as owner should be treated as 3P |
| Azure AD Government: Arlington | 094406f5-47e1-4def-9e69-74c4fab3cae1 | GCC High / DOD |

## Important Notes

- Avoid contacting PM owners directly; use IcM Report Incident option
- Use primary contacts only; let PM add necessary contacts
- CSS FTEs access: [CoreIdentity](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/wacts14817-huwx) for WA CTS-14817 group
- Non-FTE: request access for "TM-CSSAzureSuppliers" group
- Full applications list available at the ADO Wiki source (654KB reference table with 1000+ app IDs)
