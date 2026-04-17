---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/Entra Customer Lockbox/Microsoft Entra Customer Lockbox for Tenant Add Scenarios in Azure Support Center (ASC)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FCustomer%20LockBox%2FEntra%20Customer%20Lockbox%2FMicrosoft%20Entra%20Customer%20Lockbox%20for%20Tenant%20Add%20Scenarios%20in%20Azure%20Support%20Center%20%28ASC%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Entra Customer Lockbox for Tenant Add Scenarios in ASC

> **Private Preview**: Access is controlled via group membership during the private preview period.

## Overview

This feature allows engineers to access data for remote tenants not directly linked to a support case via Entra Customer Lockbox.

**Prerequisites**:
- Case contact must have a common Admin account in both tenants (SRT and RT)
- The admin roles must be assigned BEFORE the Lockbox request is made
- Customer must allow access to tenant data when creating the case

**Valid Admin Roles**: Global Administrator and other built-in admin roles as documented.

## Terminology

- **SRT** (Support Request Tenant): The tenant where the case was opened
- **RT** (Remote Tenant / resourceTenant): The tenant where the issue occurs, not linked to the case

## Requesting Access Flow

1. Login to ASC (https://azuresupportcenter.azure.com/)
2. Access the support case for the SRT tenant
3. Ensure ASC connects to the SRT tenant (verify in Tenant Explorer)
4. Click "Add Tenant" and enter the RT Tenant ID or Domain Name
5. A request for approval is sent to the case contact
6. Case contact receives an email with a link to the Microsoft Entra Portal approval page
7. From "Microsoft Support Access (Preview)" page, the request can be approved or rejected

> **Note**: The approval page is on the SRT tenant, not the RT tenant.

## Accessing Without Email

If customer cannot get the email, use this manually formatted URL:
```
https://entra.microsoft.com/{SRT_TENANT_ID}/#view/Microsoft_AAD_DXP/PendingSupportAccessRequest.ReactView/supportAccessRequestId/{ACCESS_REQUEST_ID}
```

### Getting the ACCESS_REQUEST_ID
1. Login to https://ms.portal.azure.com/#view/Microsoft_AAD_DXP/SupportRequestsList.ReactView
2. Open F12 debugger, click the Support Request ID
3. In Network tab, find the response for the support request
4. In Response tab, find `SupportAccessRequest` -> note the `id` field

## After Approval

1. Engineer needs to retry "Add Tenant" in ASC
2. Pin the tenant when prompted
3. RT Tenant will appear in Tenant Explorer

## Revoking Access

Access approval is stored on the **RT Tenant**. To revoke:
```
https://entra.microsoft.com/{RT_Tenant_ID}/#view/Microsoft_AAD_DXP/SupportAccessMenuBlade/~/ApprovedAccess
```

## Known Errors

| Error | Root Cause | Solution |
|-------|-----------|----------|
| The tenant is not in the same region as the support case | EUDB restriction - cross EU/non-EU not supported | Customer must create separate case from resource tenant |
| Forbidden | Case not open or not assigned to current engineer | Verify case is open and assigned |
| Not authorized to approve access | Case creator has no external identity with admin role in RT | Create guest account with admin role in RT |
| Insufficient case information | Cannot get case creator info | Escalate via ICM |
| Diagnostic data not approved | Customer did not consent to diagnostics | Ask customer to consent in "Advanced diagnostic information" |

## Escalation

Use standard ASC ICM submission process. Gather: Tenant ID, timestamps, screenshots of Lockbox blade (Pending Requests/History), ASC Tenant Explorer screenshots. Transfer to Azure LockBox \ Triage.
