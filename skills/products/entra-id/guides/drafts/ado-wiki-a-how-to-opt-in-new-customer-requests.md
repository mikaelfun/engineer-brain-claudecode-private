---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/Specific Issues/How to opt in new customer requests"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FCustomer%20LockBox%2FSpecific%20Issues%2FHow%20to%20opt%20in%20new%20customer%20requests"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to opt in new customer requests for Customer Lockbox

External customers have an option to opt in to Lockbox by submitting an Office form as suggested in blogs. We need to check weekly if there are new requests and onboard those customers.

## Weekly check process

1. Open the Microsoft Forms response page and go to "Responses"
2. Select "Open in Excel"
3. Sort by the column "completion time" in ascending order
4. Use the last entry addressed (see below) to determine if there are new entries

## For each new entry

1. **Validate environment**: Determine which environment the tenant ID belongs to (Production or Fairfax)
   - Use the tenant metadata endpoint to check: if the query returns a non-error JSON, the tenant is valid in that environment
   - See: [How to get tenant metadata](https://dev.azure.com/ASIM-Security/Information%20Protection/_wiki/wikis/Azure%20Customer%20Lockbox/1611/How-to-get-tenant-metadata)

2. **Add to configs** (based on environment):
   - **Public Production**: Add tenant to Lockbox EUS, CUS and SCUS clusters by appending to configs:
     - `PartnerApiWhitelistedTenantIds`
     - `ScopedClaimsOptInTenants`
   - **Non-Public Prod**: Add to corresponding parameter file

3. **Update automation** (Public Production only):
   - Update the automation task to add the new tenant ID
   - **Important**: Do this AFTER the param changes have been deployed

4. **Update the Jarvis workflow**:
   - Open the workflow at https://jarvis-west.dc.ad.msft.net/
   - Expand step "Initialize variable for tenant IDs"
   - Add the new tenant ID to the end of the list
   - Save the workflow and Test

5. **Update tracking**: Record the last tenant addressed from the form

## Last entry addressed (as of wiki)

- Tenant ID: `a42fbc51-8457-45a0-a241-79c86bbf4528`
- Submission date: 7/31/20 16:00:03
