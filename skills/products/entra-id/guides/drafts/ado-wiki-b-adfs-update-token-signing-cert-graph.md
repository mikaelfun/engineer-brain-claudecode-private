---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Troubleshooting/ADFS - Using Microsoft Graph to update Token Signing Certificate for Microsoft Office 365 Identity Platform Worldwide Relying Party Trust"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20Troubleshooting%2FADFS%20-%20Using%20Microsoft%20Graph%20to%20update%20Token%20Signing%20Certificate"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Update ADFS Token Signing Certificate in Entra ID via Microsoft Graph

Replaces deprecated MSOL cmdlets (Get-MsolFederationProperty, Set-MsolDomainAuthentication).

## Method 1: Run on ADFS Server (Direct)

```powershell
# Prerequisites
Install-Module Microsoft.Graph
Import-Module Microsoft.Graph

# 1. Connect to Graph
Connect-MgGraph -scopes Domain.ReadWrite.All, Directory.ReadWrite.All

# 2. Read primary Token Signing cert
$tsp = [System.Convert]::ToBase64String((((Get-AdfsCertificate -CertificateType Token-Signing | where-object -Property isPrimary -eq $true).Certificate).RawData))

# 3. Read secondary Token Signing cert (if exists)
$tss = [System.Convert]::ToBase64String((((Get-AdfsCertificate -CertificateType Token-Signing | where-object -Property isPrimary -eq $false).Certificate).RawData))

# 4. Get Federation Domain Object
$tdo = Get-MgDomainFederationConfiguration -DomainID <domainname>

# 5. Update certificates (omit -NextSigningCertificate if no secondary)
Update-MgDomainFederationConfiguration -DomainId <domainname> -InternalDomainFederationId $tdo.Id -SigningCertificate $tsp -NextSigningCertificate $tss

# 6. Verify update
$tdo = Get-MgDomainFederationConfiguration -DomainID <domainname>
$tdo | format-list
```

## Method 2: Run from Any Client (via Federation Metadata)

For ADFS servers without internet connectivity:

```powershell
Connect-MgGraph -Scopes "Directory.Read.All, Directory.ReadWrite.All, Domain.ReadWrite.All, Directory.AccessAsUser.All"

$fedsrv = read-host "Enter Federation Service hostname"
$fedrealm = Read-Host "Enter Entra federated Domain"

[xml]$fedmeta = (Invoke-WebRequest -UseBasicParsing -Uri "https://$($fedsrv)/federationmetadata/2007-06/federationmetadata.xml").Content

# Extract signing certs from metadata and update via Graph
$tdo = Get-MgDomainFederationConfiguration -DomainID $fedrealm
# ... (see full script in ADO wiki)
```

## Method 3: Query and Compare ADFS vs Entra Configuration

Replaces deprecated `Get-MsolFederationProperty`:

```powershell
# Uses ADFS FederationMetadata + MetadataExchange endpoints via HTTP
# No admin rights on ADFS servers needed
# Works from internal and external networks
Connect-MgGraph -scopes Domain.ReadWrite.All, Directory.ReadWrite.All -NoWelcome
# For USGov: Connect-MgGraph -environment USgov ...
```

## Deleting Old Azure MFA Certificates on Entra

```powershell
Connect-MgGraph -Scopes "Application.ReadWrite.All","Directory.ReadWrite.All"
(Get-MgServicePrincipal -Filter "AppId eq '981f26a1-7f43-403b-a875-f8b09b8cd720'").KeyCredentials | select DisplayName, StartDateTime, EndDateTime, KeyId | fl
# Use KeyId to remove specific cert
```

> Note: If Get-MgDomainFederationConfiguration errors, run `Update-Module -Force` then restart PowerShell.
