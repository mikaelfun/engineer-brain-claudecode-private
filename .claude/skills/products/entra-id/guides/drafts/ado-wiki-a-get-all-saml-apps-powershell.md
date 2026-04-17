---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Applications Experience - Get all SAML apps from tenant with PowerShell"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD.wiki?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FApplications%20Experience%20-%20Get%20all%20SAML%20apps%20from%20tenant%20with%20PowerShell"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Get All SAML Apps from Tenant with PowerShell

## Prerequisites
- User must be Application Admin or Global Admin
- Install Microsoft Graph PowerShell Module: https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation

## Script: Enumerate SAML-enabled Service Principals

```powershell
Connect-MgGraph -Scopes Application.ReadWrite.All

$Logs = @()
$pbCounter = 0
$fileName = "<FILENAME>.csv"
$path_ = "<PATH_TO_FILE>\$fileName"

Write-Host "Collecting info..."
$allApps = Get-MgServicePrincipal -All

foreach ($app in $allApps) {
    [bool]$existsNoSSO = [string]::IsNullOrEmpty($app.PreferredSingleSignOnMode)
    
    if (!$existsNoSSO) {
        $Log = New-Object PSObject -Property @{
            "AppId"                    = $app.AppId
            "ObjectId"                 = $app.ID
            "DisplayName"              = $app.DisplayName
            "PreferredSingleSignOnMode" = $app.PreferredSingleSignOnMode
        }
        $Logs += $Log
    }

    $Logs | Export-CSV -Path $path_ -NoTypeInformation -Encoding UTF8
    $pbCounter++
    Write-Progress -Activity 'Processing Apps' -CurrentOperation $app.DisplayName -PercentComplete (($pbCounter / $allApps.count) * 100)
}
Write-Host "Finished!"
```

## Important Limitations

This script is based on `PreferredSingleSignOnMode`:
1. SPs with `PreferredSingleSignOnMode` set to a value → SAML SSO enabled → **appear in results**
2. SPs with `PreferredSingleSignOnMode` = **null** → may or may not be SAML → **do NOT appear**:
   - May be OAuth apps
   - May have been created before the API update that implemented `PreferredSingleSignOnMode`
   - May have SSO explicitly disabled

> **PG Confirmation:** No feature exists (or can be created as a workaround) to get a complete list of all SAML apps. This is planned but without ETA. More recent tenants should not have this issue.

## Alternative Identification Method

For apps where SSO is now disabled but was previously SAML, check the `samlSingleSignOnSettings` attribute:

```
GET /servicePrincipals/{id}?$select=samlSingleSignOnSettings
```

If `samlSingleSignOnSettings` contains parameters like `relayState`, the app likely used to be SAML SSO-enabled.

## Find SAML Apps and Update notificationEmailAddresses

```powershell
Connect-MgGraph -Scopes Application.ReadWrite.All

$emailAddress = "alias@contoso.com"

Get-MgServicePrincipal -All -Filter "preferredSingleSignOnMode eq 'saml'" | % {
  if (!$_.NotificationEmailAddresses.contains($emailAddress)) {
    Update-MgServicePrincipal -ServicePrincipalId $_.id `
      -NotificationEmailAddresses ($_.NotificationEmailAddresses += $emailAddress)
  }
}
```
