---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Managed Identities (MSI)/TSG - Using App Services Kudu Console to test Managed Identity"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Managed%20Identities%20(MSI)%2FTSG%20-%20Using%20App%20Services%20Kudu%20Console%20to%20test%20Managed%20Identity"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Testing Managed Identity on Azure Web App via Kudu Console

## Summary

Steps to test basic Managed Identity token acquisition on Azure Web App (App Services) using the Kudu PowerShell console.

## Steps

1. Browse to the Azure Web App in Azure Portal
2. Check **Identity** tab to verify System Assigned or User Assigned identity is assigned. Note the principal object ID.
3. Go to **Development Tools > Advanced Tools** and click **Go** to open Kudu Console
4. Choose **Debug console > PowerShell**

### Test System Assigned Identity

```powershell
$resourceURI = "https://vault.azure.net"
$tokenAuthURI = $env:IDENTITY_ENDPOINT + "?resource=$resourceURI&api-version=2019-08-01"
$tokenResponse = Invoke-RestMethod -Method Get -Headers @{"X-IDENTITY-HEADER"="$env:IDENTITY_HEADER"} -Uri $tokenAuthURI
$accessToken = $tokenResponse.access_token
$accessToken
```

### Test User Assigned Identity

```powershell
$resourceURI = "https://vault.azure.net"
$clientid = "{user-assigned-MSI-client-id}"
$tokenAuthURI = $env:IDENTITY_ENDPOINT + "?resource=$resourceURI&client_id=$clientid&api-version=2019-08-01"
$tokenResponse = Invoke-RestMethod -Method Get -Headers @{"X-IDENTITY-HEADER"="$env:IDENTITY_HEADER"} -Uri $tokenAuthURI
$accessToken = $tokenResponse.access_token
$accessToken
```

## Common Resource URIs

| Azure Service | Resource URI |
|---|---|
| Azure Key Vault | `https://vault.azure.net` |
| Azure SQL Database | `https://database.windows.net` |
| Microsoft Graph | `https://graph.microsoft.com` |

## Verification

- If successful, a Base64-encoded JWT token will be displayed
- Copy and paste to https://jwt.ms to verify token contents (audience, issuer, claims)
- The `clientid` parameter for User Assigned identity must match the client ID from Step 2
