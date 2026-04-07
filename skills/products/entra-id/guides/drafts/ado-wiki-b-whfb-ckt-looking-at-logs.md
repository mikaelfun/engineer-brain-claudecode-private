---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Cloud Kerberos Trust/Looking at the logs"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Cloud%20Kerberos%20Trust%2FLooking%20at%20the%20logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# WHfB Cloud Kerberos Trust - Checking If Feature Is Enabled

## Is the Feature Enabled?

### Group Policy Object (GPO)
Open `NgcPolicyGp-key.txt` and verify:
```
HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\PassportForWork
  UseCloudTrustForOnPremAuth    REG_DWORD    0x1
  Enabled    REG_DWORD    0x1
```

**GPO Path:** `Computer Configuration/Administrative Templates/Windows Components/Windows Hello for Business/Use Cloud Kerberos Trust for on-premises authentication`

### Mobile Device Management (MDM)
Open `NgcPolicyIntune-key.txt` and verify:
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Policies\PassportForWork\tenantID\Device\Policies
  UseCloudTrustForOnPremAuth    REG_DWORD    0x1
  UsePassportForWork    REG_DWORD    0x1
```

**MDM Path:** `PassportForWork/TenantId/Policies/UseCloudTrustForOnPremAuth`

## Check dsregcmd Output

Open `Dsregcmddebug.txt` in the user's context (not from authentication logs).

Reference: [Interpreting dsregcmd /status](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/585900/WHFB-Cloud-Trust-Scoping-Tracing-Troubleshooting?anchor=interpreting-%3A-dsregcmd-/status)

## Check Klist cloud_debug Output

Open `Klist-Cloud-Debug.txt`.

Reference: [Interpreting klist cloud_debug](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/585900/WHFB-Cloud-Trust-Scoping-Tracing-Troubleshooting?anchor=interpreting-%3A-klist-cloud_debug)

For more details about dsregcmd and klist outputs related to cloud Kerberos components:
[Azure AD Kerberos Authentication](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/538264/Azure-AD-Kerberos-Authentication)
