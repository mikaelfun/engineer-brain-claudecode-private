---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Create Self Signed Cert"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FCreate%20Self%20Signed%20Cert"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Create Self-Signed Certificate for Entra ID App Authentication

## Step 1: Create the Certificate

```powershell
$AppId = "YOUR_APP_ID_HERE"
$TenantId = "YOUR_DOMAIN_HERE"
$pwd = "YOUR_CERT_PASSWORD_HERE"

$notAfter = (Get-Date).AddMonths(24)
$date = Get-Date ((Get-Date).ToUniversalTime()) -Format o
$certName = "$AppId-$date"

$cert = New-SelfSignedCertificate -DnsName $certName `
    -CertStoreLocation "cert:\LocalMachine\My" `
    -KeyExportPolicy Exportable `
    -Provider "Microsoft Enhanced RSA and AES Cryptographic Provider" `
    -NotAfter $notAfter

$thumb = $cert.Thumbprint
$pwd = ConvertTo-SecureString -String $pwd -Force -AsPlainText

# Export .cer (public key only)
Export-Certificate -Cert $cert -FilePath "$certName.cer" | Out-Null

# Export .pfx (with private key)
Export-PfxCertificate -Cert "cert:\LocalMachine\My\$thumb" -FilePath "$certName.pfx" -Password $pwd
```

## Step 2: Upload Certificate to Entra ID Application

```powershell
Connect-MgGraph -Scopes Application.ReadWrite.All

$keyValue = [System.Convert]::ToBase64String($cert.GetRawCertData())

$KeyCredential = @{
    Type = "AsymmetricX509Cert"
    Usage = "Verify"
    Key = [System.Text.Encoding]::ASCII.GetBytes($keyValue)
    displayName = "added using MS Graph " + (Get-Date)
}

$app = Get-MgApplication -Filter "appId eq '$AppId'"
$KeyCredentials = $app.KeyCredentials
$KeyCredentials += $KeyCredential

Update-MgApplication -ApplicationId $app.Id -KeyCredentials $KeyCredentials
```

## Step 3: Connect Using Certificate

```powershell
Connect-MgGraph -Certificate $cert -TenantId $TenantId -ClientId $AppId
```
