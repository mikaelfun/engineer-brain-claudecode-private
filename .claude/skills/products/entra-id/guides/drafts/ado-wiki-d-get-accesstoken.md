---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Get AccessToken"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FGet%20AccessToken"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Get Access Tokens using PowerShell

> **Important:** We do not officially support or create custom scripts for customers. Scripts are for personal testing, training purposes, and as examples to illustrate a concept.

[[_TOC_]]

## Using Azure PowerShell

First authenticate with your app:

### With a Client ID and Secret

```powershell
$ClientId = "YOUR_APP_ID"
$ClientSecret = "YOUR_CLIENT_SECRET"
$creds = [System.Management.Automation.PSCredential]::new($ClientId,(ConvertTo-SecureString $ClientSecret -AsPlainText -Force))

Connect-AzAccount -Tenant $TenantId -Credential $creds -ServicePrincipal | Out-Null
```

### With a Client ID and Certificate

```powershell
$TenantId = "YOUR_TENANT_ID"
$ClientId = "YOUR_APP_ID"
$CertificatePath = "C:\temp\certs\test-app-appauth.pfx"
$CertPassword = ConvertTo-SecureString -String "password" -AsPlainText -Force

Connect-AzAccount -CertificatePath $CertificatePath -ApplicationId $ClientId -Tenant $TenantId -CertificatePassword $CertPassword
```

### Acquire the token

Once authenticated, grab a MS Graph access token:

```powershell
$AccessToken = (Get-AzAccessToken -ResourceUrl https://graph.microsoft.com).Token
```

Then pass to MS Graph PowerShell module:

```powershell
Connect-MgGraph -AccessToken $AccessToken
```

## Get token using Resource Owner Password Credential (ROPC) flow

Self-sufficient PowerShell function with token caching and expiry check:

```powershell
$Global:User = ""
$Global:Password = ""
$Global:TenantId = ""
$Global:ClientId = ""

Function Get-AccessToken {
    param(
        $resource = "https://graph.microsoft.com"
    )
    if($Global:AadToken) {
        if((Get-Date) -lt $Global:AadToken.Expires) {
            return $Global:AadToken
        }
    }

    # Construct URI
    $uri = "https://login.microsoftonline.com/$($Global:TenantId)/oauth2/v2.0/token"

    # Construct Body
    $body = @{
        client_id = $Global:ClientId
        username = $Global:User
        password = $Global:Password
        scope = '$resource/.default'
        grant_type = 'password'
    }

    # Get OAuth 2.0 Token
    $tokenRequest = Invoke-WebRequest -Method Post -Uri $uri -ContentType 'application/x-www-form-urlencoded' -Body $body -UseBasicParsing

    # Access Token
    $tokenJsonResponse = ($tokenRequest.Content | ConvertFrom-Json)

    $ReturnObject = @{
        AccessToken = $tokenJsonResponse.access_token
        Expires = (Get-Date).AddSeconds($tokenJsonResponse.expires_in)
    }

    $Global:AadToken = $ReturnObject

    return $ReturnObject.AccessToken
}
```

**Example:** `Connect-MgGraph -AccessToken Get-AccessToken`

## Get token using Client Credential (ClientId and secret) flow

```powershell
Function Get-AccessToken($force=$false) {
    if($Global:AadToken -and !$force) {
        if((Get-Date) -lt $Global:AadToken.Expires) {
            return $Global:AadToken
        }
    }

    $clientSecret = ""
    $clientId = ""
    $tenantId = ""

    # Construct URI
    $uri = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token"

    # Construct Body
    $body = @{
        client_id = $clientId
        client_secret = $clientSecret
        scope = 'https://graph.microsoft.com/.default'
        grant_type = 'client_credentials'
    }

    # Get OAuth 2.0 Token
    $tokenRequest = Invoke-WebRequest -Method Post -Uri $uri -ContentType 'application/x-www-form-urlencoded' -Body $body -UseBasicParsing

    # Access Token
    $tokenJsonResponse = ($tokenRequest.Content | ConvertFrom-Json)

    $ReturnObject = @{
        AccessToken = $tokenJsonResponse.access_token
        Expires = (Get-Date).AddSeconds($tokenJsonResponse.expires_in)
    }

    $Global:AadToken = $ReturnObject

    return $ReturnObject.AccessToken
}
```

## Get token using Client Credential (Certificate/Client Assertion) flow

```powershell
# CONFIG
$Tenant = "contoso.onmicrosoft.com"
$ClientId = "YourAppId"
$CertificatePath = "C:\path\to\certificate.pfx"
$CertificatePassword = "password"

# START SCRIPT
$certificate = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new($CertificatePath, $CertificatePassword)

$ThumbprintBase64 = [Convert]::ToBase64String($certificate.GetCertHash()).Split('=')[0].Replace('+', '-').Replace('/', '_')

$nbf = [int][double]::parse((Get-Date -Date $(Get-Date).ToUniversalTime() -UFormat %s))
$exp = [int][double]::parse((Get-Date -Date $((Get-Date).addseconds($ValidforSeconds).ToUniversalTime()) -UFormat %s))
$jti = New-Guid
$aud = "https://login.microsoftonline.com/$Tenant/oauth2/token"
$sub = $ClientId
$iss = $ClientId

[hashtable]$header = @{
    alg = "RS256";
    typ = "JWT";
    x5t = $ThumbprintBase64;
    kid = $ThumbprintBase64
}
[hashtable]$payload = @{
    aud = $aud;
    iss = $iss;
    sub = $sub;
    jti = $jti;
    nbf = $nbf;
    exp = $exp;
    tid = $Tenant;
}

$headerjson = $header | ConvertTo-Json -Compress
$payloadjson = $payload | ConvertTo-Json -Compress
$headerjsonbase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($headerjson)).Split('=')[0].Replace('+', '-').Replace('/', '_')
$payloadjsonbase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($payloadjson)).Split('=')[0].Replace('+', '-').Replace('/', '_')
$ToBeSigned = [System.Text.Encoding]::UTF8.GetBytes($headerjsonbase64 + "." + $payloadjsonbase64)
$rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($certificate)

if ($null -eq $rsa) {
    throw "There's no private key in the supplied certificate - cannot sign"
} else {
    try {
        $Signature = [Convert]::ToBase64String($rsa.SignData([byte[]]$ToBeSigned,[Security.Cryptography.HashAlgorithmName]::SHA256,[Security.Cryptography.RSASignaturePadding]::Pkcs1)).Split('=')[0].Replace('+', '-').Replace('/', '_')
    }
    catch {
        throw "Signing with SHA256 and Pkcs1 padding failed using private key $rsa >> " + $_
    }
}

$assertion = "$headerjsonbase64.$payloadjsonbase64.$Signature"
Write-Host "CLIENT_ASSERTION"
$assertion

# Construct URI
$uri = "https://login.microsoftonline.com/$tenant/oauth2/v2.0/token"

# Construct Body
$body = @{
    client_id = $clientId
    scope = 'https://graph.microsoft.com/.default'
    grant_type = 'client_credentials'
    client_assertion_type = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
    client_assertion = $assertion
}

# Get OAuth 2.0 Token
$tokenRequest = Invoke-WebRequest -Method Post -Uri $uri -ContentType 'application/x-www-form-urlencoded' -Body $body -UseBasicParsing

Write-Host
Write-Host "ACCESS RESPONSE"
$tokenRequest
```
