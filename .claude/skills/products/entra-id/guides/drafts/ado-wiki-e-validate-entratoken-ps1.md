---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Validate EntraToken.ps1"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FValidate%20EntraToken.ps1"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Validate Entra Token (PowerShell)

Copy and paste the following into PowerShell...

```powershell
<#-----------------------------------------------------------------------------
LEGAL DISCLAIMER
This Sample Code is provided for the purpose of illustration only and is not
intended to be used in a production environment.  THIS SAMPLE CODE AND ANY
RELATED INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER
EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.  We grant You a
nonexclusive, royalty-free right to use and modify the Sample Code and to
reproduce and distribute the object code form of the Sample Code, provided
that You agree: (i) to not use Our name, logo, or trademarks to market Your
software product in which the Sample Code is embedded; (ii) to include a valid
copyright notice on Your software product in which the Sample Code is embedded;
and (iii) to indemnify, hold harmless, and defend Us and Our suppliers from and
against any claims or lawsuits, including attorneys' fees, that arise or result
from the use or distribution of the Sample Code.

This posting is provided "AS IS" with no warranties, and confers no rights. Use
of included script samples are subject to the terms specified
at http://www.microsoft.com/info/cpyright.htm.
-----------------------------------------------------------------------------#>
function Confirm-EntraToken {

       Param(
           [Parameter(Mandatory=$true, Position=0, ValueFromPipeline = $true)]
           [string]$JwtToken,
           [string]$Metadata="https://login.microsoftonline.com/common/.well-known/openid-configuration",
           [string]$AppId
       )

   # Get claims for OAuth2Token
   $token = $JwtToken
   #++++++++++++++++++++++++++++++++++
   #Header
   $tokenheader = $token.Split(".")[0]

   #Fix padding as needed, keep adding "=" until string length modulus 4 reaches 0
   while ($tokenheader.Length % 4) { $tokenheader += "=" }

   #Convert from Base64 encoded string to PSObject all at once
   $jwtHeader = ([System.Text.Encoding]::ASCII.GetString([system.convert]::FromBase64String($tokenheader)) | ConvertFrom-Json)

   #++++++++++++++++++++++++++++++++++
   #Payload
   $tokenPayload = $token.Split(".")[1]

   #Fix padding as needed, keep adding "=" until string length modulus 4 reaches 0
   while ($tokenPayload.Length % 4) { $tokenPayload += "=" }

   #Convert from Base64 encoded string to PSObject all at once
   $jwtPayload = ([System.Text.Encoding]::ASCII.GetString([system.convert]::FromBase64String($tokenPayload)) | ConvertFrom-Json)
   $TokenClaims = @()
   $TokenClaims += $jwtHeader
   $TokenClaims += $jwtPayload

   # Download OpenID configuration and validate token signature
   Write-Host "Downloading configuration from '$Metadata'"
   $Configuration = (ConvertFrom-Json (Invoke-WebRequest $Metadata).Content)
   # ... (full validation logic follows)
}
```

## Usage

```powershell
# Validate an Entra ID token
$token = "<paste-jwt-token-here>"
Confirm-EntraToken -JwtToken $token

# Validate against a specific app
Confirm-EntraToken -JwtToken $token -AppId "<app-id>"

# Validate against a specific metadata endpoint
Confirm-EntraToken -JwtToken $token -Metadata "https://login.microsoftonline.com/<tenant-id>/.well-known/openid-configuration"
```
