---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Using Windows Credential Manager to Securely Store Client Secrets"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FUsing%20Windows%20Credential%20Manager%20to%20Securely%20Store%20Client%20Secrets"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Using Windows Credential Manager to Securely Store Client Secrets

## Overview
Store client secrets in Windows Credential Manager instead of hardcoding. Retrieve the secret, get an access token via Client Credentials flow, and connect to Microsoft Graph.

## Step 1: Store Secret in Credential Manager
1. Open Credential Manager from Control Panel
2. Select Windows Credentials > Add a generic credential
   - Internet or network address: `MyGraphClientSecret`
   - Username: placeholder (e.g., `PlaceholderUsername`)
   - Password: your actual client secret

## Step 2: Retrieve and Use in PowerShell
```powershell
Install-Module -Name CredentialManager -Scope CurrentUser
Import-Module -Name CredentialManager

$tenantId = "<your_tenantId>"
$clientId = "<your_clientId>"
$credentialName = "MyGraphClientSecret"

$credential = Get-StoredCredential -Target $credentialName
$secureClientSecret = $credential.Password
$clientSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureClientSecret))

try {
    $tokenResponse = Invoke-RestMethod -Uri "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token" `
        -Method Post -ContentType "application/x-www-form-urlencoded" `
        -Body @{
            grant_type = "client_credentials"
            client_id = $clientId
            client_secret = $clientSecret
            scope = "https://graph.microsoft.com/.default"
        }
    $secureAccessToken = ConvertTo-SecureString $tokenResponse.access_token -AsPlainText -Force
    Connect-MgGraph -AccessToken $secureAccessToken
} finally {
    $clientSecret = $null
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR(
        [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureClientSecret))
}

Get-MgUser  # Test the connection
```

## Reference
- [Client credentials grant flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow)
