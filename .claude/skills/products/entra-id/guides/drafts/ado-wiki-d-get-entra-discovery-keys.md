---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Get EntraDiscoveryKeys.ps1"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FGet%20EntraDiscoveryKeys.ps1"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Get Entra Discovery Keys (Signing Key Certificates)

Utility script to retrieve and display Entra ID token signing key certificates from the discovery endpoint.

## Script

```powershell
function Get-EntraDiscoveryKeys() {
    Param(
        $TenantId = "common",
        $Instance = "https://login.microsoftonline.com",
        $AppId = ""
    )

    $_appid = $null;
    if($AppId) {
        $_appid = $AppId
    }
    try {
        if ($_appid -and $TenantId -ne "common") {
            $keysUrl = "$Instance/$TenantId/discovery/keys?appid=$_appid";
            $keysJson = ConvertFrom-Json (Invoke-WebRequest $keysUrl -Verbose).Content
            Write-Host $keysUrl
        }
        if (!$keysJson) {
            $keysUrl = "$Instance/$TenantId/discovery/keys";
            $keysJson = ConvertFrom-Json (Invoke-WebRequest $keysUrl -Verbose).Content
        }
    }
    catch {throw $_}

    $certs = @()
    foreach ($key in $keysJson.keys) {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($key.x5c)
        $cert = new-object System.Security.Cryptography.X509Certificates.X509Certificate2 -ArgumentList @(,$bytes)
        $certs += new-object PSObject -Property @{ 'Kid'=$key.kid; 'Thumbprint'=$cert.Thumbprint; 'NotAfter'=$cert.NotAfter; 'NotBefore'=$cert.NotBefore; 'Cert'=$cert }
    }
    $certs
}
```

## Example Usage

```powershell
$TenantId = "common"
Get-EntraDiscoveryKeys -TenantId $TenantId
```

## Notes

- When `AppId` is specified along with a non-common `TenantId`, the script queries the app-specific discovery keys endpoint first
- Falls back to the generic discovery keys endpoint if app-specific query fails or AppId is not provided
- Returns objects with Kid, Thumbprint, NotAfter, NotBefore, and full Cert properties
- Useful for troubleshooting token validation issues where the signing key may have rotated
