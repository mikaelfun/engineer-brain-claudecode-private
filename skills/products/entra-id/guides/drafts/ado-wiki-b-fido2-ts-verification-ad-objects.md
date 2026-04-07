---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/FIDO2/FIDO2: TS - Verification of AD objects"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FFIDO2%2FFIDO2%3A%20TS%20-%20Verification%20of%20AD%20objects"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# FIDO2 TS - Verification of AD Objects

## SSO to on-premises resources and AD Kerberos objects linked to FIDO2

All three AD objects must be present and match values in Azure AD:

### 1. CN=AzureADKerberos,OU=Domain Controllers,DC=domain,DC=com
- Check msDS-KrbTgtLink (link to krbtgt)
- Check msDS-NeverRevealGroup (protected members)
- Default security policy doesn't grant Azure AD permission to sign high privilege accounts
- To unblock: modify msDS-NeverRevealGroup on the AzureADKerberos object

```powershell
$prp = Get-ADComputer -Identity AzureADKerberos -property msDS-NeverRevealGroup
$prp."msDS-NeverRevealGroup" >C:\temp\prp.txt
```

### 2. CN=900274c4-b7d2-43c8-90ee-00a9f650e335
- Look at keywords and confirm SID matching CN=AzureADKerberos and CN=krbtgt_AzureAD objects

### 3. CN=krbtgt_AzureAD,CN=Users

## Verify Objects Are Synced

Install Azure AD Kerberos PowerShell module or go to AAD Connect server:
```powershell
Get-AzureADKerberosServer
```

**Critical verification**: KeyVersion (on-premises) must match CloudKeyVersion (cloud).

| Property | Description |
|----------|-------------|
| Id | Unique Id of AD DS DC object |
| DomainDnsName | DNS domain name |
| ComputerAccount | AzureADKerberos computer account object |
| UserAccount | Disabled user account (CN=krbtgt_AzureAD,CN=Users) holding TGT encryption key |
| KeyVersion | Must match CloudKeyVersion |
| KeyUpdatedOn | Date/time key was updated |
| CloudId | Must match Id |
| CloudDomainDnsName | Must match DomainDnsName |
| CloudKeyVersion | Must match KeyVersion |
| CloudKeyUpdatedOn | Must match KeyUpdatedOn |

## Sign-in on Windows using Security Key

Hybrid AADJ devices must run Windows 10 version 2004 or newer.

### GPO (Windows 10 1909+)
```
HKLM\Software\Policies\Microsoft\FIDO
  EnableFIDODeviceLogon REG_DWORD (0=Disabled, Non-Zero=Enabled)
```

### GPO (Windows 10 1903 and older)
```
HKLM\Software\Microsoft\Policies\PassportForWork\SecurityKey
  UseSecurityKeyForSignin REG_DWORD (0=Disabled, Non-Zero=Enabled)
```

### Intune
```
HKLM\SOFTWARE\Microsoft\Policies\PassportForWork\SecurityKey
  UseSecurityKeyForSignIn REG_DWORD 0x1
```

Note: If Intune policy (UseSecurityKeyForSignIn) is set to enabled, it takes precedence over GPO.
