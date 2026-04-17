---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/Inbound provisioning (HR)/Microsoft Entra Inbound User Provisioning"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FInbound%20provisioning%20(HR)%2FMicrosoft%20Entra%20Inbound%20User%20Provisioning"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Microsoft Entra API-Driven Inbound User Provisioning

## Feature Overview
Allows customers to use Graph Provisioning API endpoint to provision users from ANY source of record into Azure AD or on-prem AD. Supports CSV files, SQL databases, any HR app (UltiPro, ADP, Oracle HCM, etc.).

**Supported by**: Sync-Provisioning team (azidcomm-prov@microsoft.com)
**Scripting help**: Requires AAD Dev support

## Key Concepts
- Uses SCIM as data transfer mechanism (NOT a standardized SCIM endpoint)
- Supports async bulk processing (50+ records per request)
- SCIM schema extensions for any attribute
- API clients don't need to know Create/Update/Delete semantics
- 40-minute sync cycle (not configurable)

## Scenarios
1. **CSV file imports**: PowerShell/Logic Apps read CSV → POST to API endpoint
2. **ISV direct integration**: HR apps send data directly
3. **Partner integrations**: Middleware transforms HR data to SCIM bulk request

## End-to-End Flow
1. Create generic inbound provisioning app from Enterprise App gallery
2. Configure SCIM schema extensions for custom attributes
3. API client reads HR data from source
4. POST SCIM bulk request to endpoint
5. Provisioning service applies attribute mappings, scoping rules
6. User provisioned in AD or Azure AD
7. Query provisioning logs for status

## Authentication
- User via Graph Explorer (interactive login, needs App Admin role)
- User via PowerShell MS Graph APIs
- Service Principal via OAuth client_credentials flow (client secret or certificate)
- All require Application Administrator role minimum

## Important FAQs
- **Max 50 records per bulk request** (under evaluation)
- **Supports on-premises AD as target**: Yes
- **Soft-delete**: Not supported, only enable/disable account
- **Delta sync**: Send only changed users (no need for full dataset each time)
- **HTTP actions**: Only POST supported (no GET/PUT/PATCH)
- **Multiple apps**: Can create separate apps for different identity types/sources

## Writeback Options
1. SCIM connectivity to HR endpoint (if HR supports SCIM)
2. Azure AD ECMA connector (PowerShell/SQL/Web Services)
3. Lifecycle Workflows custom extension task with Logic Apps

## Troubleshooting

### Invalid data format (HTTP 400)
Ensure Content-Type header = "application/scim+json"

### No provisioning logs appearing
Provisioning logs update on 40-minute cycles. Verify job is in Start state.

### Unauthorized error
1. Access token may be expired - get new token
2. User may lack Application Admin role

### Job enters quarantine immediately
Caused by not setting notification email before starting job. Fix: Edit Provisioning > Settings > check email notification box > provide email > save > Restart provisioning.

### User creation failed - Invalid UPN (AzureActiveDirectoryInvalidUserPrincipalName)
Update UPN mapping to use RandomString function:
`Join("", Replace([userName], , "(?<Suffix>@(.)*)", "Suffix", "", , ), RandomString(3, 3, 0, 0, 0, ), "@", DefaultDomain())`

### User creation failed - Invalid domain
Same fix as Invalid UPN - use RandomString + DefaultDomain() in UPN mapping.

## Accidental Deletion Prevention
Enable as described: https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/accidental-deletions

## ICM Escalation
1. Post on Inbound Provisioning Teams channel first
2. No response: email aadhrprovfeedback@microsoft.com
3. ICM template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=efD3V1
