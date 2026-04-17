# ADFS SSL Certificate Renewal/Replacement Procedure

## Scope
Steps to replace SSL certificate on ADFS farm and WAP (Web Application Proxy) servers.

## Prerequisites
- New SSL certificate in .pfx format with private key
- Admin access to all ADFS and WAP servers
- Certificate requirements: https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/design/ad-fs-requirements#BKMK_1

## Steps

### 1. Install Certificate
Install the .pfx certificate on **all** ADFS and WAP servers.

### 2. Update ADFS SSL Certificate
```powershell
# Run on every ADFS server (WS2012 R2)
# For WS2016+, only need to run once on Primary ADFS server
Set-AdfsSslCertificate -Thumbprint <new-thumbprint>
```

### 3. Set Service Communication Certificate
On ADFS primary server Management Console:
- Click **"Set Service Communications Certificate..."**
- Choose the new certificate
- Recommended: use same certificate for SSL and service communication

> The service communication certificate is used for WCF message security scenarios.
> Reference: https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/design/service-communications-certificates

### 4. Update WAP SSL Certificate
```powershell
# Run on every WAP server
Set-WebApplicationProxySslCertificate -Thumbprint <new-thumbprint>
```

## Alternative: AAD Connect UI
AAD Connect has a feature to update SSL certificate for all ADFS/WAP servers at once from the UI:
https://learn.microsoft.com/en-us/azure/active-directory/connect/active-directory-aadconnectfed-ssl-update

## Notes
- ADFS 4.0 (WS2016) supports alternate hostname binding for certificate authentication:
  https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/operations/ad-fs-support-for-alternate-hostname-binding-for-certificate-authentication
- Full SSL management guide: https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/operations/manage-ssl-certificates-ad-fs-wap

---
*Source: OneNote - Mooncake POD Support Notebook/ADFS Case Study*
*Status: draft*
