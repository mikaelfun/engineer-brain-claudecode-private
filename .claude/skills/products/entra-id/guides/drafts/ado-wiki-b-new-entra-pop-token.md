---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/New EntraPopToken.ps1"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FNew%20EntraPopToken.ps1"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# New-EntraPoPToken - Proof of Possession Token Generation

## Overview
To use Microsoft Graph `addKey` and `removeKey` methods for key credential management, a Proof of Possession (PoP) of an existing key credential is required.

Applicable APIs:
- `POST /v1.0/serviceprincipals/{id}/addKey` / `removeKey`
- `POST /v1.0/applications/{id}/addKey` / `removeKey`

PowerShell: `Add-MgServicePrincipalKey`, `Remove-MgServicePrincipalKey`, `Add-MgApplicationKey`, `Remove-MgApplicationKey`

> **Note**: addKey/removeKey APIs only support App-only tokens. Delegated permissions are not supported.

## Prerequisites
```powershell
Invoke-WebRequest -Uri "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe" -OutFile "$env:USERPROFILE\Downloads\nuget.exe"
& "$env:USERPROFILE\Downloads\nuget.exe" install Microsoft.IdentityModel.Tokens -Version 6.15.0 -OutputDirectory "$env:USERPROFILE\Downloads\.nuget"
& "$env:USERPROFILE\Downloads\nuget.exe" install Microsoft.IdentityModel.jsonwebtokens -Version 6.15.0 -OutputDirectory "$env:USERPROFILE\Downloads\.nuget"
& "$env:USERPROFILE\Downloads\nuget.exe" install Microsoft.IdentityModel.logging -Version 6.15.0 -OutputDirectory "$env:USERPROFILE\Downloads\.nuget"
```

## New-EntraPoPToken Function
```powershell
function New-EntraPoPToken {
    param (
        [Parameter(Mandatory=$true)][string]$ObjectId,
        [Parameter(Mandatory=$true)][string]$PfxPath,
        [AllowNull()][string]$PfxPassword
    )
    Add-Type -Path "$env:USERPROFILE\.nuget\packages\microsoft.identitymodel.tokens\6.15.0\lib\netstandard2.0\Microsoft.IdentityModel.Tokens.dll"
    Add-Type -Path "$env:USERPROFILE\.nuget\packages\microsoft.identitymodel.jsonwebtokens\6.15.0\lib\netstandard2.0\Microsoft.IdentityModel.JsonWebTokens.dll"
    Add-Type -Path "$env:USERPROFILE\.nuget\packages\microsoft.identitymodel.logging\6.15.0\lib\netstandard2.0\Microsoft.IdentityModel.logging.dll"
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($pfxPath, $pfxPassword)
    $claims = [System.Collections.Generic.Dictionary[string,object]]::new()
    $claims.Add("aud", "00000002-0000-0000-c000-000000000000")
    $claims.Add("iss", $ObjectId)
    $now = [System.DateTime]::UtcNow
    $tokenDescriptor = New-Object Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
    $tokenDescriptor.Claims = $claims
    $tokenDescriptor.NotBefore = $now
    $tokenDescriptor.Expires = $now.AddMinutes(10)
    $tokenDescriptor.SigningCredentials = [Microsoft.IdentityModel.Tokens.X509SigningCredentials]::new($cert)
    $tokenHandler = New-Object Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler
    return $tokenHandler.CreateToken($tokenDescriptor)
}
```

## Usage - Add Certificate to Application
```powershell
$appId = "your_app_id"
$tenantId = "your_tenant_id"
$pfxPath = "Path/To/certificate.pfx"
$pfxPassword = "your_cert_password"
$certPath = "Path/To/certificate.cer"

$authCert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 -ArgumentList @($pfxPath,$pfxPassword)
Connect-MgGraph -Certificate $authCert -ClientId $appId -Tenant $tenantId
$app = Get-MgApplicationByAppId -AppId $appId
$popToken = New-EntraPoPToken -ObjectId $app.Id -PfxPath $pfxPath -PfxPassword $pfxPassword

$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 -ArgumentList @($certPath)
$certBase64 = [Convert]::ToBase64String($cert.RawData)
$params = @{
    keyCredential = @{ type = "AsymmetricX509Cert"; usage = "Verify"; key = [System.Text.Encoding]::ASCII.GetBytes($certBase64) }
    passwordCredential = $null
    proof = $popToken
}
Add-MgApplicationKey -ApplicationId $app.id -BodyParameter $params
```

## Reference
- [Generate proof-of-possession (PoP) tokens](https://learn.microsoft.com/en-us/graph/application-rollkey-prooftoken)
