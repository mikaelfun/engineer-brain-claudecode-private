---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Generate SAML Request"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FGenerate%20SAML%20Request"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Generate a SAML Request using PowerShell

> **Important:** We do not officially support or create custom scripts for customers. Scripts are for personal testing, training purposes, and as examples to illustrate a concept.

[[_TOC_]]

## To generate a SAML Sign-in request using PowerShell

```powershell
# Application Config
$appId = "your_app_id_here"
$tenant = "common"

# Generate a unique request ID
$samlId = "_" + [System.Guid]::NewGuid().ToString("N")

# Generate current UTC time in ISO 8601 format
$date = Get-Date ((Get-Date).ToUniversalTime()) -Format o

# Build the SAML AuthnRequest XML
$samlRequest = @"
<samlp:AuthnRequest
  xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
  ID="$($samlId)"
  Version="2.0" IssueInstant="$($date)"
  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  ForceAuthn="true">
  <Issuer xmlns="urn:oasis:names:tc:SAML:2.0:assertion">$($appId)</Issuer>
</samlp:AuthnRequest>
"@

# Determine if PowerShell 5.x or 7+ is being used
if ($PSVersionTable.PSVersion.Major -gt 5) {
    $core = $true
} else {
    $core = $false
}

# Convert XML into bytes
$bytes = [System.Text.Encoding]::UTF8.GetBytes($samlRequest)

# Deflate (compress) using .NET DeflateStream
$ms = New-Object System.IO.MemoryStream
$ds = New-Object System.IO.Compression.DeflateStream($ms, [System.IO.Compression.CompressionMode]::Compress)
$ds.Write($bytes, 0, $bytes.Length)
$ds.Close()

# Base64 encode the compressed data
$encoded = [Convert]::ToBase64String($ms.ToArray())

if ($core) {
    $encodedUrl = [System.Web.HttpUtility]::UrlEncode($encoded)
} else {
    $encodedUrl = [System.Net.WebUtility]::UrlEncode($encoded)
}

# Generate the URL and popup browser to sign-in
$url = "https://login.microsoftonline.com/$tenant/saml2?SamlRequest=$encodedUrl"
Write-Output $url
Start-Process "msedge.exe" $url
```

Additional AuthnRequest parameters: https://learn.microsoft.com/en-us/entra/identity-platform/single-sign-on-saml-protocol#authnrequest

Recommended: Configure your SAML application with a default redirect URI to an app that can decode the SAMLResponse such as `https://claimsxray-chweissetrial.msappproxy.net/ClaimsXray/TokenResponse`

## To generate a SAML Sign-out request using PowerShell

```powershell
# Application Config
$appId = "your_app_id_here"
$tenant = "common"

# Generate a unique request ID
$samlId = "_" + [System.Guid]::NewGuid().ToString("N")

# Generate current UTC time in ISO 8601 format
$date = Get-Date ((Get-Date).ToUniversalTime()) -Format o

$samlRequest = @"
<samlp:LogoutRequest
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    ID="$($samlId)"
    Version="2.0"
    IssueInstant="$($date)">
      <Issuer xmlns="urn:oasis:names:tc:SAML:2.0:assertion">$($appId)</Issuer>
      <NameID xmlns="urn:oasis:names:tc:SAML:2.0:assertion">user@example.com</NameID>
</samlp:LogoutRequest>
"@

# Determine if PowerShell 5.x or 7+ is being used
if ($PSVersionTable.PSVersion.Major -gt 5) {
    $core = $true
} else {
    $core = $false
}

# Convert XML into bytes
$bytes = [System.Text.Encoding]::UTF8.GetBytes($samlRequest)

# Deflate (compress) using .NET DeflateStream
$ms = New-Object System.IO.MemoryStream
$ds = New-Object System.IO.Compression.DeflateStream($ms, [System.IO.Compression.CompressionMode]::Compress)
$ds.Write($bytes, 0, $bytes.Length)
$ds.Close()

# Base64 encode the compressed data
$encoded = [Convert]::ToBase64String($ms.ToArray())

if ($core) {
    $encodedUrl = [System.Web.HttpUtility]::UrlEncode($encoded)
} else {
    $encodedUrl = [System.Net.WebUtility]::UrlEncode($encoded)
}

# Generate the URL and popup browser to sign-in
$url = "https://login.microsoftonline.com/$tenant/saml2?SamlRequest=$encodedUrl"
Write-Output $url
Start-Process "msedge.exe" $url
```
