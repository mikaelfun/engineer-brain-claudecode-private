---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Azure AD Directory Deletion/Requesting Access to CMAT & CST Portals for AAD CSS SEs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FAzure%20AD%20Directory%20Deletion%2FRequesting%20Access%20to%20CMAT%20%26%20CST%20Portals%20for%20AAD%20CSS%20SEs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Requesting Access to CMAT & CST Portals for AAD CSS Support Engineers

Internal SOP for Azure Identity CSS Support Engineers (FTE or Delivery Partner) to get read-only access to CMAT and CST commerce portals for reviewing tenant deletion blockers.

## Prerequisites

- MID account (`alias@microsoftsupport.com`)
- Titan Virtual Desktop / Centurion Azure Virtual Desktop access
- Contact https://aka.ms/visops for MID account provisioning or password reset

**Note**: Starting 2026-02-16, Centurion Azure Virtual Desktop replaces Titan Cloud PC for MID accounts.

## CMAT Access for Support Engineers

1. Verify MID account and VDI access
2. Visit https://euaaccessportal.microsoft.com/request/access/CMAT
3. Fill in:
   - **Business Group**: `CMAT_Azure_Identity_CSS`
   - **Role**: `CMAT_ReadOnly`
   - **Request Mode**: `Self`
   - **Account Type**: `MID`
   - **Alias**: `alias@microsoftsupport.com`
   - **Business Justification**: `CSS Azure Identity support engineer need access for tenant deletion requests`
   - **Request Type**: `Add`

## CST Access

Follow similar process via https://euaaccessportal.microsoft.com for CST portal access.

## References

- [MID Account Guidance](https://microsoft.sharepoint.com/teams/SCIMCentral/SitePages/Updated-MID-Account-Guidance.aspx)
- [Titan/Centurion VDI](https://microsoft.sharepoint.com/sites/Identity_Authentication/SitePages/Support/Win365-for-Support.aspx)
- [CORP to MID migration](https://supportability.visualstudio.com/CMAT_CST%20Corp%20to%20MID%20Migration/_wiki/wikis/CMAT_CST-Corp-to-MID-Migration.wiki/1437232/Overview)
