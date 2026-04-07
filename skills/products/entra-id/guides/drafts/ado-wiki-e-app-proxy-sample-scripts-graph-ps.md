---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Sample Scripts with Microsoft Graph PS cmdlets"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Sample%20Scripts%20with%20Microsoft%20Graph%20PS%20cmdlets"
importDate: "2026-04-07"
type: troubleshooting-guide
---

Collection of PowerShell sample scripts for managing Microsoft Entra Application Proxy applications using Microsoft Graph PS cmdlets.

## Get all Microsoft Entra Application Proxy apps (basic info)

```powershell
Import-Module Microsoft.Graph.Beta.Applications
Connect-MgGraph -Scope Directory.ReadWrite.All

$allApps = Get-MgBetaServicePrincipal -Top 100000 | Where-Object {$_.Tags -Contains "WindowsAzureActiveDirectoryOnPremApp"}

$numberofAadapApps = 0

foreach ($item in $allApps) {
    $aadapAppId = Get-MgBetaApplication | Where-Object {$_.AppId -eq $item.AppId}
    $aadapApp = Get-MgBetaApplication -ApplicationId $aadapAppId.Id -ErrorAction SilentlyContinue `
        -select OnPremisesPublishing | Select OnPremisesPublishing -expand OnPremisesPublishing `
        | Format-List -Property InternalUrl, ExternalUrl, AlternateUrl

    if ($aadapApp -ne $null) {
        Write-Host $item.DisplayName "(AppId: " $item.AppId ", ObjId:" $item.Id ")"
        $numberofAadapApps++
    }
}

Write-Host "Number of Microsoft Entra application proxy applications: " $numberofAadapApps
Disconnect-MgGraph
```

## Get all Microsoft Entra Application Proxy apps (extended info)

Supports filtering by SSO mode: `All`, `none`, `OnPremisesKerberos`, `aadHeaderBased`, `pingHeaderBased`, `oAuthToken`.

```powershell
$ssoMode = "All"

Import-Module Microsoft.Graph.Beta.Applications
Connect-MgGraph -Scope Directory.ReadWrite.All

$aadapServPrinc = Get-MgBetaServicePrincipal -Top 100000 | Where-Object {$_.Tags -Contains "WindowsAzureActiveDirectoryOnPremApp"}
$allApps = Get-MgBetaApplication -Top 100000

$aadapApp = $null
foreach ($item in $aadapServPrinc) {
    foreach ($item2 in $allApps) {
        if ($item.AppId -eq $item2.AppId) { [array]$aadapApp += $item2 }
    }
}

foreach ($item in $aadapApp) {
    $aadapAppConf = Get-MgBetaApplication -ApplicationId $item.Id -ErrorAction SilentlyContinue `
        -select OnPremisesPublishing | Select OnPremisesPublishing -expand OnPremisesPublishing
    $aadapAppConf1 = Get-MgBetaApplication -ApplicationId $item.Id -ErrorAction SilentlyContinue `
        -select OnPremisesPublishing | Select OnPremisesPublishing -expand OnPremisesPublishing `
        | Select singleSignOnSettings -expand SingleSignOnSettings
    $aadapAppConf4 = Get-MgBetaApplication -ApplicationId $item.Id -ErrorAction SilentlyContinue `
        -select OnPremisesPublishing | Select OnPremisesPublishing -expand OnPremisesPublishing `
        | Select singleSignOnSettings -expand SingleSignOnSettings | Select KerberosSignOnSettings -expand KerberosSignOnSettings

    if ($aadapAppConf -ne $null) {
        if ($ssoMode -eq "All" -Or $aadapAppConf1.SingleSignOnSettings.SingleSignOnMode -eq $ssoMode) {
            Write-Host $Item.DisplayName "(AppId: " $item.AppId " / ObjectId: " $item.Id ")"
            Write-Host "External Url: " $aadapAppConf.ExternalUrl
            Write-Host "Internal Url: " $aadapAppConf.InternalUrl
            Write-Host "Pre authentication type: " $aadapAppConf.ExternalAuthenticationType
            Write-Host "SSO mode: " $aadapAppConf1.SingleSignOnSettings.SingleSignOnMode
            if ($aadapAppConf1.SingleSignOnMode -eq "OnPremisesKerberos") {
                Write-Host "SPN: " $aadapAppConf4.KerberosServicePrincipalName
                Write-Host "Username Mapping: " $aadapAppConf4.KerberosSignOnMappingAttributeType
            }
            Write-Host "Backend Timeout: " $aadapAppConf.ApplicationServerTimeout
            Write-Host "Translate URLs in Headers: " $aadapAppConf.IsTranslateHostHeaderEnabled
            Write-Host "Translate URLs in Body: " $aadapAppConf.IsTranslateLinksInBodyEnabled
            Write-Host "HTTP-Only Cookie: " $aadapAppConf.IsHttpOnlyCookieEnabled
            Write-Host "Secure Cookie: " $aadapAppConf.IsSecureCookieEnabled
            Write-Host "Persistent Cookie: " $aadapAppConf.IsPersistentCookieEnabled
            Write-Host "Backend Cert Validation: " $aadapAppConf.IsBackendCertificateValidationEnabled
        }
    }
}

Disconnect-MgGraph
```

**Note:** This is a large collection. The original wiki page contains many additional scripts including:
- Get apps by connector group
- Get apps with wildcard URL
- Get apps with custom domain
- Get connector group details
- Assign/move apps between connector groups
- Get apps with specific SSO configurations
- And more management scripts

See the full wiki page for complete script collection.
