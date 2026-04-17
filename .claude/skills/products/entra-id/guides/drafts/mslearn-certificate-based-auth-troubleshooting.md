# Troubleshoot Microsoft Entra Certificate-Based Authentication (CBA)

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/certificate-based-authenticate-issue)

## Overview

CBA allows SSO using X.509 certificates on iOS/Android devices. Supported only in Federated environments with Modern Auth (ADAL), except EAS for Exchange Online (Managed Accounts).

## Prerequisites

- User certificate must have routable email in Subject Alternative Name (UPN or RFC822 format)
- Entra ID maps RFC822 → Proxy Address attribute
- ADFS 2012R2+ with Web Application Proxy (third-party WAP not supported unless MS-ADFSPIP compliant)
- TCP port 49443 open between client → ADFS/WAP

## Diagnostic Steps

### 1. Verify CBA works on Azure Portal

1. Clear browser cache
2. Browse to portal.office.com → enter email → redirected to ADFS
3. Select "Sign in using an X.509 certificate" → approve cert prompt
4. If no cert prompt: verify user cert + root CA installed on device; verify TCP 49443 open on ADFS/WAP; verify cert chain installed on all ADFS/WAP servers

### 2. Verify Entra ID CBA Configuration

```powershell
Install-Module AzureAD
# Create TrustedCertificateAuthority with correct CRL URLs
$cert = Get-Content -Encoding byte "[CER_PATH]"
$new_ca = New-Object -TypeName Microsoft.Open.AzureAD.Model.CertificateAuthorityInformation
$new_ca.AuthorityType = 0  # 0=RootAuthority, 1=IntermediateAuthority
$new_ca.TrustedCertificate = $cert
$new_ca.crlDistributionPoint = "<CRL URL>"
New-AzureADTrustedCertificateAuthority -CertificateAuthorityInformation $new_ca
```

**Key points:**
- CRL URLs in .CER file are NOT used — must manually set `crlDistributionPoint` and `DeltaCrlDistributionPoint`
- Root CA → `AuthorityType = 0 (RootAuthority)`
- Intermediate CA → `AuthorityType = 1 (IntermediateAuthority)`
- Large CRLs (>15s download) → use Azure Storage to avoid caching delays

### 3. Check PromptLoginBehavior

```powershell
Connect-MsolService
Get-MSOLDomainFederationSettings -DomainName contoso.com
# If PromptLoginBehavior is True → users prompted for username/password
Set-MSOLDomainFederationSettings -domainname <domain> -PromptLoginBehavior Disabled
```

> Note: Some modern apps send `prompt=login` → Entra translates to `wauth=usernamepassworduri` in ADFS request → forces password auth. Must disable.

### 4. Verify ADFS/WAP Certificate Chain

```cmd
certutil -verifystore root
certutil -verifystore CA
```

- Root .CER → Trusted Root Certificate Authority\Certificates
- Intermediate .CER → Intermediate Root Certificate Authority\Certificates

### 5. Verify CRL Accessibility (from SYSTEM context)

```cmd
psexec -s -i -d cmd.exe
certutil.exe -verify -urlfetch SubCA.cer > SubCA_verify.txt
certutil.exe -verify -urlfetch usercert.cer > usercert_verify.txt
```

Check `Certificate CDP` section — all endpoints must resolve. ADFS gMSA / WAP Network Service account needs firewall/proxy access.

### 6. Verify ADFS Claims Rules

Required pass-through claims for both AD Claims Provider Trust AND O365 Relying Party Trust:

- `http://schemas.microsoft.com/ws/2008/06/identity/claims/serialnumber`
- `http://schemas.microsoft.com/2012/12/certificatecontext/field/issuer`

### 7. Verify Certificate Auth Method Enabled

```powershell
Get-AdfsAuthenticationProvider
# Check: AdminName = "Certificate Authentication"
# AllowedForPrimaryExtranet = True (required)
# AllowedForPrimaryIntranet = True (optional, for intranet users)
```

### 8. Verify CertificateTransport Endpoint

Test: `https://sts.contoso.com:49443/adfs/services/trust/2005/certificatetransport`
- Should spin indefinitely (waiting for answer) = endpoint accessible

## Common Failure Points

| Issue | Check |
|-------|-------|
| No cert prompt | Device certs + root CA installed? TCP 49443 open? |
| Password prompt instead of cert | PromptLoginBehavior = Disabled? |
| CRL validation fails | CRL URLs accessible from SYSTEM context? gMSA has proxy access? |
| Claims not passed | serialnumber + issuer claims in both CP Trust and RP Trust? |
| Auth fails intermittently | Large CRL causing >15s download delays? Move to Azure Storage |
