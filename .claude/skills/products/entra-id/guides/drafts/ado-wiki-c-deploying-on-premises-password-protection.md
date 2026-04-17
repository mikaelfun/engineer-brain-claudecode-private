---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Password Protection for On-Premise/Deploying On-Premises Azure AD Password Protection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Password%20Protection%20for%20On-Premise%2FDeploying%20On-Premises%20Azure%20AD%20Password%20Protection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Deploying On-Premises Azure AD Password Protection

## Overview

Deployment consists of two main steps:
1. Configure the Password Policy Proxy Service
2. Install the DC Agent software on each DC

The proxy should be installed first for quickest results (though not strictly required).

**Note**: For troubleshooting, see the main [Azure AD Password Protection for On-Premise](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183975) page.

## Install and Configure the Password Policy Proxy Service

### 1. Choose Host Server(s)
- Must be domain-joined to any domain in the forest
- Network connectivity to at least one DC in each domain
- Supported (but not recommended) on a domain controller
- Max 2 proxy servers per forest (public preview limitation)
- Different forests need separate proxy servers

### 2. Install Proxy Service
```cmd
msiexec.exe /i AzureADPasswordProtectionProxy.msi /quiet /qn
```
No reboot required. Default location: `C:\Program Files\Azure AD Password Protection Proxy`.

For debug install logs:
```cmd
msiexec /i AzureADPasswordProtectionProxy.msi /qn /lxv install.log /norestart
```

### 3. Import PowerShell Module
```powershell
Import-Module AzureADPasswordProtection
```
If module not found, navigate to install directory:
```
C:\Program Files\Azure AD Password Protection Proxy\Modules\AzureADPasswordProtection
```

Available cmdlets:
- `Get-AzureADPasswordProtectionSummaryReport`
- `Get-AzureADPasswordProtectionDCAgent`
- `Get-AzureADPasswordProtectionProxyConfiguration`
- `Register-AzureADPasswordProtectionForest`
- `Register-AzureADPasswordProtectionProxy`
- `Set-AzureADPasswordProtectionProxyConfiguration`

### 4. Register Proxy with Azure AD
Requires **Tenant Admin** and **AD Domain Admin** credentials in forest root domain.

```powershell
$tenantAdminCreds = Get-Credential GA@contosoaad.onmicrosoft.com
$forestAdminCreds = Get-Credential username@corp.contoso.info
Register-AzureADPasswordProtectionProxy -AzureCredential $tenantAdminCreds -ForestCredential $forestAdminCreds
```

This creates:
- First-party service principal `AADPasswordProtectionProxy` in tenant (AppId: `dda27c27-f274-469f-8005-cce10f270009`)
- Certificate in Microsoft Key Vault added as credential on the service principal
- Service connection endpoint in Active Directory under the proxy computer object

**Note**: Re-run on each new proxy server to create its service connection endpoint.

### 5. Verify Registration
```powershell
Get-MgServicePrincipalByAppId -AppId dda27c27-f274-469f-8005-cce10f270009
```

Check key credentials:
```powershell
(Get-MgServicePrincipalByAppId -AppId dda27c27-f274-469f-8005-cce10f270009 -select keyCredentials).KeyCredentials | fl
```

## Key Notes for Support

- No certificates are stored on the DC Agent server
- ForestCredential must be in NetBIOS\username or user@domain.com format
- If PSModulePath issue occurs, may need to open a new PowerShell window or log off/on
