---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/Azure Customer LockBox/TSG Obtaining pending consent request details for Azure Lockbox"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FCustomer%20LockBox%2FAzure%20Customer%20LockBox%2FTSG%20Obtaining%20pending%20consent%20request%20details%20for%20Azure%20Lockbox"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG: Obtaining Pending Consent Request Details for Azure Lockbox

When a customer has Azure Lockbox enabled and a support engineer submits a lockbox consent request via ASC "Request Consent" button, the customer should see the pending request in Azure Portal's Customer Lockbox for Microsoft Azure blade.

## Scenario: Customer Claims They Never Received the Request

If the customer claims they never received the request, or it is not visible to them, you can obtain the pending request details by reviewing the API response of the Refresh button in ASC.

### Steps to Get Request Details

1. Open the case in Azure Support Center
2. Browse to the blade in ASC where the **Pending customer approval** message is displayed
3. Using your browser's Developer Tools (F12 -> Developer Tools) open the Network blade to start a HAR trace
4. Press the **Refresh** button on the pending customer approval ASC message
5. Inspect your HAR trace from Developer Tools -> Network tab
6. Find the frame with a GET request to **GetLockboxConsentRequestStatus?** and select it to inspect its **Response** tab
7. Here you should find the raw value in JSON format of the pending lockbox request

### Key Fields in the Response

- **CreatedAtUTC** - The time when a support engineer submitted the current pending consent request
- **RequestExpiryUTC** - The time when the current pending consent request will expire (4 days) before which no additional consent requests can be submitted
- **ResourceType** - The type of consent request:
  - `1` = Subscription level request
  - `2` = Tenant level request
- **ResourceId** - The GUID representing the resource (subscription GUID for type 1, Entra Tenant ID for type 2)

### Who Can See Pending Requests (Role Requirements)

Based on ResourceType and per Azure Lockbox Workflow Step 7:

- **ResourceType = Tenant (2)**: Only **active** Entra Global Administrators at the CreatedAtUTC time will see the pending consent request
- **ResourceType = Subscription (1)**: Only **active** subscription Owner role, or Azure Customer Lockbox Approver role members at the CreatedAtUTC time can see these consent requests

> **IMPORTANT**: Roles must be assigned BEFORE the request was created. Inheriting Owner role from a management group, or having the role at resource group scope, is NOT sufficient - must be assigned directly at subscription scope.

### Verifying Customer Has Correct Roles

**For Subscription-Scoped Requests:**
1. Go to the subscription -> Access Control (IAM) -> Check Access blade
2. Type the principal's UPN who cannot see the pending request
3. Verify that **Owner** or **Azure Customer Lockbox Approver** roles are listed under *Current role assignments* at subscription scope

**For Tenant-Scoped Requests:**
1. Go to Entra Portal -> Roles and Administrators -> All roles
2. Verify the user sees **Global Administrator** as an active role

### If Customer Still Cannot See Requests

Ask for:
- HAR trace (https://aka.ms/hartrace)
- Problem Steps Recorder (https://aka.ms/problemstepsrecorder) of them browsing to Azure Portal -> Customer Lockbox for Microsoft Azure blade -> Pending Requests

Submit ICM to ICM Path **Azure LockBox** \ **Triage** with the pending request ID found in ASC.
