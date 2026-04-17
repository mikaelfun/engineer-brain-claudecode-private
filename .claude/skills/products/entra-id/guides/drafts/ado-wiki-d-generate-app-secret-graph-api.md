---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Generate App Secret with Graph API"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FGenerate%20App%20Secret%20with%20Graph%20API"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Generate App Secret with Graph API

> **Important:** We do not officially support or create custom scripts for customers. Scripts are for personal testing, training purposes, and as examples to illustrate a concept.

[[_TOC_]]

## Overview

This PowerShell script demonstrates how to use Microsoft Graph to create a new password credential (client secret) for an existing application registration. It uses the `Invoke-MgGraphRequest` cmdlet to call the `/addPassword` endpoint on the application object. The generated secret is displayed in the output and should be securely stored.

The script is intended for internal testing or educational purposes and should not be executed in a production environment without prior validation.

```powershell
# Connect to Microsoft Graph
try {
    Connect-MgGraph -Scopes "Application.ReadWrite.All"
    Write-Host "Connected to Microsoft Graph successfully." -ForegroundColor Green
} catch {
    Write-Error "Failed to connect to Microsoft Graph: $_"
    return
}

# Define the Application ID
$appId = "your-application-id"  # Replace with your Application ID

# Define the new password credential details
$body = @{
    passwordCredential = @{
        displayName = "PSCreatedSecret"  # Display name for the password credential
        endDateTime = (Get-Date).AddYears(1).ToString("o")  # Expiration date (1 year from now)
    }
}

# Make the API call to create a new password credential
try {
    $response = Invoke-MgGraphRequest -Method POST -Uri "https://graph.microsoft.com/v1.0/applications/$appId/addPassword" -Body ($body | ConvertTo-Json -Depth 3)

    if ($response.secretText) {
        Write-Host "New password credential created successfully." -ForegroundColor Green
        Write-Host "Secret Value: $($response.secretText)" -ForegroundColor Yellow
    } else {
        Write-Warning "API call succeeded but no secret value was returned."
    }
} catch {
    Write-Error "Failed to create password credential: $_"
}
```
