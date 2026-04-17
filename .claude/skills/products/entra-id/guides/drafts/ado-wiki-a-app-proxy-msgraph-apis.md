---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy MSGraph APIs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20MSGraph%20APIs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - MSGraph APIs Reference

## Feature Overview

The Application Proxy management API set is available in the Microsoft Graph BETA endpoint. Full coverage for all management actions available in Azure AD portal and PowerShell.

Key automation scenarios:
- Configure App Proxy properties for an app
- Configure SSO for legacy authentication modes
- Manage connectors in connector groups
- Manage connector groups and apps assigned to connector groups

## Case Handling
Supported by MSaaS AAD - Developer queue.

## API Reference

### Required Permissions
- `Directory.ReadWrite.All` (user permission)

### Key APIs

| Resource type | Method |
|--|--|
| applicationTemplate | Instantiate applicationTemplate |
| applications / onPremisesPublishing | Update application, Add app to connectorGroup |
| connector | Get connectors |
| connectorGroup | Create connectorGroup, Add connector to connectorGroup |
| servicePrincipals | Update servicePrincipal, Create appRoleAssignments |

### Step 1: Create Custom Application

Template ID for custom application: `8adf8e6e-67b2-4cf2-a259-e3dc5476c621`

```http
POST https://graph.microsoft.com/beta/applicationTemplates/8adf8e6e-67b2-4cf2-a259-e3dc5476c621/instantiate
Content-type: application/json
{"displayName": "Contoso IWA App"}
```

### Step 2: Configure Application Proxy Properties

```http
PATCH https://graph.microsoft.com/beta/applications/{appObjectId}
Content-type: application/json
{
    "onPremisesPublishing": {
        "externalAuthenticationType": "aadPreAuthentication",
        "internalUrl": "https://contosoiwaapp.com",
        "externalUrl": "https://contosoiwaapp-contoso.msappproxy.net"
    }
}
```

Also update redirectUri, identifierUri, and homepageUrl to the external URL:

```http
PATCH https://graph.microsoft.com/beta/applications/{appObjectId}
{
   "identifierUris": ["https://contosoiwaapp-contoso.msappproxy.net"],
   "web": {
      "redirectUris": ["https://contosoiwaapp-contoso.msappproxy.net"],
      "homePageUrl": "https://contosoiwaapp-contoso.msappproxy.net"
   }
}
```

### Step 3: Assign Connector Group

1. **Get connectors:** `GET https://graph.microsoft.com/beta/onPremisesPublishingProfiles/applicationProxy/connectors`
2. **Create connectorGroup:** `POST https://graph.microsoft.com/beta/onPremisesPublishingProfiles/applicationProxy/connectorGroups`
3. **Assign connector to group:** `POST https://graph.microsoft.com/beta/onPremisesPublishingProfiles/applicationProxy/connectors/{connectorId}/memberOf/$ref`
4. **Assign app to group:** `PUT https://graph.microsoft.com/beta/applications/{appObjectId}/connectorGroup/$ref`

### Step 4: Configure SSO (IWA example)

```http
PATCH https://graph.microsoft.com/beta/applications/{appObjectId}
{
   "onPremisesPublishing": {
      "singleSignOnSettings": {
         "kerberosSignOnSettings": {
            "kerberosServicePrincipalName": "HTTP/iwademo.contoso.com",
            "kerberosSignOnMappingAttributeType": "userPrincipalName"
         },
         "singleSignOnMode": "onPremisesKerberos"
      }
   }
}
```

### Step 5: Assign Users

1. Get appRoles: `GET https://graph.microsoft.com/beta/servicePrincipals/{spObjectId}/appRoles`
2. Create assignment: `POST https://graph.microsoft.com/beta/servicePrincipals/{spObjectId}/appRoleAssignments`

## Troubleshooting

- Logs for graph calls: http://aka.ms/graphlogs
- ICM escalation: Service "AAD Application Proxy", Team "On Call Team"
