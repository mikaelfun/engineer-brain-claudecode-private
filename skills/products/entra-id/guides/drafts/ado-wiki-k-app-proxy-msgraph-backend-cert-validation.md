---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy - MSGRAPH sample to change the value of isBackendCertificateValidationEnabled"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20-%20MSGRAPH%20sample%20to%20change%20the%20value%20of%20isBackendCertificateValidationEnabled"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Change isBackendCertificateValidationEnabled via MS Graph

This is a step-by-step guidance on how to change the value of `isBackendCertificateValidationEnabled` for an Application Proxy app using Microsoft Graph API.

> **Note**: This can also be configured directly in the Entra portal.

## Prerequisites

- Object ID of the application (from App Registrations)
- Global Administrator or Application Administrator role
- Access to [Microsoft Graph Explorer](https://developer.microsoft.com/graph/graph-explorer)

## Steps

### 1. Get the Object ID

Navigate to App Registrations on the Entra Portal and grab the Object ID of the application.

### 2. Open Graph Explorer

Navigate to https://developer.microsoft.com/graph/graph-explorer and sign in with your admin account.

### 3. Grant Consent (if required)

Consent the following permissions if prompted (works for Global Admin).

### 4. Query OnPremisesPublishing attributes

```
GET beta https://graph.microsoft.com/beta/applications/{OBJECT_ID}/onPremisesPublishing
```

Response will include:
```json
{
    "externalUrl": "EXTERNAL_URL",
    "internalUrl": "INTERNAL_URL",
    "isBackendCertificateValidationEnabled": true,
    ...
}
```

### 5. Patch the setting

```
PATCH beta https://graph.microsoft.com/beta/applications/{OBJECT_ID}/

Content-Type: application/json

{
    "onPremisesPublishing": {
        "isBackendCertificateValidationEnabled": false
    }
}
```

Expected result: `No Content - 204`

### 6. Verify

Run the GET query from step 4 again to confirm the change.
