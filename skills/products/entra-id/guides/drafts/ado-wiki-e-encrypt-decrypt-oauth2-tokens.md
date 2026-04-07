---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/How to Encrypt and Decrypt OAuth2 Access Tokens"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FHow%20to%20Encrypt%20and%20Decrypt%20OAuth2%20Access%20Tokens"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD Dev
- cw.AAD-Authentication
- cw.AAD-Workflow
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
:::template /.templates/Shared/MBIInfo.md
:::

:::template /.templates/AAD-Developer/under-construction.md
:::

# How to Encrypt and Decrypt Entra ID OAuth2 access tokens

[[_TOC_]]

## Overview

You can configure Entra ID to encrypt tokens and configure your API to decrypt tokens. This must be configured on the application in which you are recieving the access token for. Generally this will be the API. For example, if you are requesting an access token for **api://92449a74-256e-4d83-9f49-cdc5e47637b4/read**, then you will configure this on the application registration for **api://92449a74-256e-4d83-9f49-cdc5e47637b4**

> **Disclaimer**: Instructions in this article may vary depending on how the certificate is generated and the environment where you are exexuting these steps. Instructions are written based on running PowerShell 7 on Windows 11.

### What is JWE

JSON Web Encryption (JWE) is a standard for the secure transmission of data through encryption. In contrast to JSON Web Tokens (JWT), which are primarily concerned with integrity and authenticity, JWE ensures confidentiality by encrypting the user data in such a way that only authorized recipients can read it.

JWE is defined in the [RFC 7516 specification](https://datatracker.ietf.org/doc/html/rfc7516) and is part of the broader JOSE (JavaScript Object Signing and Encryption) Framework.

JWE contains 5 parts (otherwise meaning there will be 4 ' . ' on the token instead of 2 that you normally see on a JWT)...

**JWE header**
* Contains metadata about the encryption algorithm used
* Specifies how the encryption key is managed

**Encrypted key**
* Stores the encrypted version of the Content Encryption Key (CEK)
* The key is encrypted with the algorithm specified in the header ("alg")
* Only the intended recipient with the correct private key can decrypt this section

**Initialization vector (IV)**
* A random value used to increase encryption security
* Prevents attackers from recognizing patterns in encrypted data
* Essential for block ciphers such as AES-GCM and AES-CBC

**Ciphertext**
* The actual encrypted payload (data)
* Ensures that the content remains unreadable even if the token is intercepted

**Authentication tag**
* Verifies that the encrypted data has not been tampered with
* Ensures the integrity and authenticity of the encrypted message

Example JWE looks something like this...
```
eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkExMjhDQkMtSFMyNTYiLCJ4NXQiOiJoU1RFREdBekdSbzY2MW9oM3lWTmppWWFmMmMiLCJ4bXNfaGRfdXRpIjoiQ3lsTlkyRm4wVWFJWGQwOGdwRk1BQSIsInhtc19oZF9pYXQiOiIxNzQ2MjA0NTA1IiwiemlwIjoiREVGIn0.jKLcvGGdDW99iSUlLShZIvpbpSV7MKff6d1Cw_m2KNtHoYw_fjzztmHNhRKxReW-AL_PpypC9hgRGC3gqiFLVFDTGn_wRGsKgkmve_2_FecXTPIE89wvRcRoQwl4pXJlvp2HcOo2slJuaOMV_bGcXXX.Vgs_S8jWXG6KUrXXX.D8BYF2pT9RCLyvjFKmBD6_FUK5A2gxUhAcCjJUdQjU9eJ4zmOxfO5WFNIKJHvCkJWIugIkwrAyEZpiQ9y3Oi1fr9r78BrnvvCzRcAmeetc2w5Zpu1Yoc2ZulC6X9gHiXTRilwbSTUGI4fxEQU9AGD_Siom2onJ4Lq3WW5BpvsN64VzwxtL4UJYI7o_JJW6NMwjWcQjpBwLXRYCqc1ujoJoKxpU3tk1dTS6JN8hnoRlnWM0rz-R2RlrFKAr7U8h77W9fP0qgKv51cvs4tkNbIzrGqRgGKmKbDeQl2c9dJ_f-C8ZWFVUxUmzwAJfmjU6e1SW4W9tXwJ9e_G6YkiYJ4LZO0fv38XXX.aKkfjYv5jt-oMrLxCPdZxA
```

> You will not be able to decrypt or decode this without the Private key. Therefore tools like https://jwt.ms cannot be used.


## Encrypt OAuth2 access tokens

### Step 1: Create the certificate that will be used to Encrypt the token

Certificate must be created with the **KeySpec** option of **Signature** and certificate must be **exportable**.

```
$cert = New-SelfSignedCertificate -Subject "CN=TestJWE" -CertStoreLocation "Cert:\CurrentUser\My" -KeyExportPolicy Exportable -KeySpec Signature
```

### Optional: I already have a certificate

  **Get Certificate from file...**
  ```powershell
  # Define the path to the certificate file
  $certPath = "C:\path\to\your\certificate.cer"

  # Load the certificate from the file
  $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certPath)
  ```

  **Get Certificate from certificate store...**
  ```powershell
  $cert = Get-ChildItem -Path Cert:\CurrentUser\My\$CertificateThumbprint
  ```

  >Use path **'Cert:\LocalMachine\My'** when wanting to get from LocalMachine instead of CurrentUser.

### Step 2: Upload certificate to Entra ID

**Using Microsoft Graph PowerShell**
```powershell
$keyValue = [System.Convert]::ToBase64String($cert.GetRawCertData())

$KeyCredential = @{
    Type = "AsymmetricX509Cert"
    Usage = "Encrypt"
    Key = [System.Text.Encoding]::ASCII.GetBytes($keyValue)
    displayName = "added using MS Graph "+(Get-Date)
}

$app = Get-MgApplication -Filter "appId eq '$ApplicationId'"

$KeyCredentials = $app.KeyCredentials
$KeyCredentials += $KeyCredential

Update-MgApplication -ApplicationId $app.id -KeyCredentials $KeyCredentials 
```

**Using Azure or Entra Portal**

Once you uploaded the certificate using the portal, you will need to update the **keyCredential** usage from **'Verify'** to **'Encrypt'** and generate a new **GUID** for the **KeyId**

### Step 3: Find the certificate keyId in Entra...
```powershell
$CertificateThumbprint = $cert.Thumbprint
$CertificateThumbprint

$app = Get-MgApplication -Filter "appId eq '$ApplicationId'"

$keyId = ($app.keyCredentials) | where { [System.Convert]::ToBase64String($_.customKeyIdentifier) -eq $CertificateThumbprint }).keyId
$keyId
```

### Step 4: Configure the Entra ID application to use the certificate to encrypt tokens. 

You can use Microsoft Graph API or Microsoft Graph PowerShell to configure the token encryption.

**Using Microsoft Graph API**
```http
PATCH https://graph.microsoft.com/v1.0/applications/your-application-object-id
{
  "tokenEncryptionKeyId":"key-id"
}
```

**Using Microsoft Graph PowerShell**
```powershell
Update-MgApplication -ApplicationId $app.Id -TokenEncryptionKeyId $keyId
```

**Verify or review the keyCredential (i.e. certificate) based on the currently configured tokenEncryptionKeyId**

```powershell
$appId = 'your-app-id'
$app = (Get-MgApplication -Filter "appId eq '$appId'" -Property id,appid,displayName,tokenEncryptionKeyId,keyCredentials)
$app.keyCredentials | where keyId -eq $app.tokenEncryptionKeyId | fl
```
If **CustomKeyIdentifier** returns to look something like **{243, 157, 184, 11�}** you can convert it to the certificate thumbprint...

```powershell
[BitConverter]::ToString(($app.keyCredentials | where keyId -eq $app.tokenEncryptionKeyId).CustomKeyIdentifier)
```

### Finally

Acquire your token

<hr/>

## Decrypt OAuth2 access tokens (JWE)

### Scenario: Using PowerShell

First you need to install required nuget packages
```powershell
Invoke-WebRequest -Uri "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe" -OutFile "$env:USERPROFILE\Downloads\nuget.exe"
& "$env:USERPROFILE\Downloads\nuget.exe" install Microsoft.IdentityModel.Tokens -Version 6.15.0 -OutputDirectory "$env:USERPROFILE\Downloads\.nuget"
& "$env:USERPROFILE\Downloads\nuget.exe" install Microsoft.IdentityModel.Logging -Version 6.15.0 -OutputDirectory "$env:USERPROFILE\Downloads\.nuget"
& "$env:USERPROFILE\Downloads\nuget.exe" install Microsoft.IdentityModel.JsonWebTokens -Version 6.15.0 -OutputDirectory "$env:USERPROFILE\Downloads\.nuget"
```
Then run the following... (Don't forget up set your certificate path and certificate password)
```powershell
$certPath = "c:/path/to/your/cert.pfx"
$p= "your_certificate_password"

# Loading additional required assemblies not pulled in from MS Graph PowerShell module
Add-Type -Path "$env:USERPROFILE\Downloads\.nuget\Microsoft.IdentityModel.Tokens.6.15.0\lib\net45\Microsoft.IdentityModel.Tokens.dll"
Add-Type -Path "$env:USERPROFILE\Downloads\.nuget\Microsoft.IdentityModel.Logging.6.15.0\lib\net45\Microsoft.IdentityModel.Logging.dll"
Add-Type -Path "$env:USERPROFILE\Downloads\.nuget\Microsoft.IdentityModel.JsonWebTokens.6.15.0\lib\net45\Microsoft.IdentityModel.JsonWebTokens.dll"

# options if you want to see additional PII details in error messages
[Microsoft.IdentityModel.Logging.IdentityModelEventSource]::ShowPII = $true
[Microsoft.IdentityModel.Logging.IdentityModelEventSource]::LogCompleteSecurityArtifact = $true

# Import certificate
$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certPath, $p, [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable)
$pk = $cert.PrivateKey
$rsaParameters = $pk.ExportParameters($true)

# Initialize RSACryptoServiceProvider
$rsa = New-Object System.Security.Cryptography.RSACryptoServiceProvider
$rsa.ImportParameters($rsaParameters)

# Create the decryption key
$tokenDecryptionKey = New-Object Microsoft.IdentityModel.Tokens.RsaSecurityKey($rsa)

# Configure Token validation parameters in order to decrypt and decode the token
$tokenHandler = New-Object Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler
$validationParameters = New-Object Microsoft.IdentityModel.Tokens.TokenValidationParameters
$validationParameters.TokenDecryptionKey = $tokenDecryptionKey

# This is your encrypted JWE token
$token = "your_encrypted_token"

# Decrypt the token
$decryptedToken = $tokenHandler.DecryptToken($token, $validationParameters)

Write-Output "Decrypted Token: $decryptedToken"
```

### Scenario: Using Microsoft Identity Web

Configure **appsettings.json** something like this...

```json
{
  "AzureAd": {
    // ...
    "TokenDecryptionCertificates": [
      {
        "SourceType": "Base64Encoded",
        "Base64EncodedValue": "MII...",
        "CertificatePassword": "..."
      }
    ]
  },
```

Or instead of using **appsettings.json** you can programmatically...
```dotnet
// Path to your certificate file
string certPath = "c:/temp/enc_cert.pfx";
string certPwd = "your_certificate_pwd";

// Load the certificate
var x509certificate2 = new X509Certificate2(certPath, certPwd);

services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddMicrosoftIdentityWebApi(
    configureJwtBearerOptions =>
    {
        Configuration.Bind("AzureAd", configureJwtBearerOptions);
    }, microsoftIdentityOptions =>
    {
        Configuration.Bind("AzureAd", microsoftIdentityOptions);
        microsoftIdentityOptions.TokenDecryptionCertificates = new CertificateDescription[] {
          CertificateDescription.FromCertificate(x509certificate2)
        };
    });
```


For more options and information see...
* [Using certificates with Microsoft.Identity.Web: Decryption certificates](https://github.com/AzureAD/microsoft-identity-web/wiki/Certificates#decryption-certificates)
* [CertificateDescription Class](https://learn.microsoft.com/en-us/dotnet/api/microsoft.identity.web.certificatedescription?view=msal-model-dotnet-latest)

### Scenario: Using Microsoft.IdentityModel

This is just an example, however, should get you started...

```dotnet
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography.X509Certificates;
using Microsoft.IdentityModel.Tokens;

class Program
{
    static void Main(string[] args)
    {
        // Path to your certificate file
        string certPath = "path/to/your/certificate.pfx";
        string certPwd = "your_certificate_pwd";

        // Load the certificate
        var certificate = new X509Certificate2(certPath, certPwd, X509KeyStorageFlags.Exportable);

        // Extract the private key
        var privateKey = certificate.GetRSAPrivateKey().ExportParameters(true);

        // Create the decryption key
        var tokenDecryptionKey = new RsaSecurityKey(privateKey);

        // Validate and decrypt the token
        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            TokenDecryptionKey = tokenDecryptionKey,
            //...
        };

        string token = "your_encrypted_jwt";
        SecurityToken validatedToken;
        var principal = tokenHandler.ValidateToken(token, validationParameters, out validatedToken);

        Console.WriteLine("Decrypted Token: " + validatedToken);
    }
}
```

### Scenario: When using Asp.net...

```dotnet
using System.Security.Cryptography.X509Certificates;
using Microsoft.IdentityModel.Tokens;

// Path to your certificate file
string certPath = "path/to/your/certificate.pfx";
string certPwd = "your_certificate_pwd";

// Load the certificate
var certificate = new X509Certificate2(certPath, certPwd, X509KeyStorageFlags.Exportable);

// Extract the private key
var privateKey = certificate.GetRSAPrivateKey().ExportParameters(true);

// Create the decryption key
var tokenDecryptionKey = new RsaSecurityKey(privateKey);

app.UseJwtBearerAuthentication(
  new JwtBearerAuthenticationOptions
  {
      // ...
      TokenValidationParameters = new TokenValidationParameters
      {
          // other property configurations
          TokenDecryptionKey = tokenDecryptionKey
      }
      // ...
  }) ;
```

### Scenario: When using Asp.net Core...

```dotnet
using System.Security.Cryptography.X509Certificates;
using Microsoft.IdentityModel.Tokens;

string certPath = "path/to/your/certificate.pfx";
string certPwd = "your_certificate_pwd";

 // Load the certificate
 var certificate = new X509Certificate2(certPath, certPwd, X509KeyStorageFlags.Exportable);

 // Extract the private key
 var privateKey = certificate.GetRSAPrivateKey().ExportParameters(true);

 // Create the decryption key
 var tokenDecryptionKey = new RsaSecurityKey(privateKey);

 services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
 {
     // other property configurations
     options.TokenValidationParameters = new TokenValidationParameters
     {
         // other property configurations
         TokenDecryptionKey = tokenDecryptionKey
     };
 });
```

## Case Handling

| Scenario | Support Team | Support Path
| --- | --- | ---
| Help or issues with creating certificates | Entra ID App Experience | Azure\Microsoft Entra App Integration and Development\App Registrations\Certificates, Secrets and Federated Credentials
| Help or issues with uploading certificates to Entra ID | Entra ID App Experience | Azure\Microsoft Entra App Integration and Development\App Registrations\Certificates, Secrets and Federated Credentials
| Help or issues with encrypting tokens | Entra ID App Experience | Azure\Microsoft Entra App Integration and Development\App Registrations\Certificates, Secrets and Federated Credentials
| Help with application development to decrypt tokens | Entra ID Developer | Azure\Microsoft Entra App Integration and Development\Developing or Registering apps with Microsoft identity platform\Using Microsoft.IdentityModel (asp.net and asp.net core)
| Any issues with the certificate itself | Entra ID App Experience | Azure\Microsoft Entra App Integration and Development\App Registrations\Certificates, Secrets and Federated Credentials

## More information

**Export certificate to PFX**
```powershell
$password = ConvertTo-SecureString "P0rsche911" -AsPlainText -Force
Export-PfxCertificate -Password $password -Cert $cert -FilePath "c:/path/to/cert.pfx"
```

**Get raw base64 string of PFX certificate**
```
# Using PowerShell 7
$pfx_cert = get-content 'cert.pfx' -AsByteStream -Raw

# Using Windows PowerShell
# $pfx_cert = get-content 'c:\certificate.pfx' -Encoding Byte

# Convert raw byte data to base64
$base64 = [System.Convert]::ToBase64String($pfx_cert)
```

**Get the thumbprint from the encrypted token**
Once you have encrypted token. You can still decode the header portion. The token will have 5 parts instead of the normal 3 parts. Take the first part and use a Base64 decoder on the string up to the first ' . '

Header will look something like this...
```json
{"alg":"RSA-OAEP","enc":"A128CBC-HS256","x5t":"hSTEDGAzGRo661oh3yVNjiYaf2c","zip":"DEF"}
```

Take the **x5t** and you can convert it into the thumbprint...
```powershell
$Base64String = "hSTEDGAzGRo661oh3yVNjiYaf2c"

while($Base64String.Length % 4 -ne 0)
{
    $Base64String += "="
}

$Bytes =[Convert]::FromBase64String($Base64String.Replace("-","+").Replace("_","/"))
$Thumbprint = [BitConverter]::ToString($Bytes);
$Thumbprint 
```



