---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Querying for passwordless credentials via Graph"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FQuerying%20for%20passwordless%20credentials%20via%20Graph"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Querying Passwordless Credentials via Graph

## WHfB Credentials

**Basic query:**
```
GET https://graph.microsoft.com/v1.0/users/{upn}/authentication/windowsHelloForBusinessMethods
```

Returns: id, displayName (device name), createdDateTime, keyStrength (normal/weak=ROCA vulnerable)

**With device info:**
```
GET https://graph.microsoft.com/v1.0/users/{upn}/authentication/windowsHelloForBusinessMethods?$expand=device
```

Key indicators:
- `displayName: null` = user is not registered owner OR device removed
- `device.id: "00000000-0000-0000-0000-000000000000"` = device deleted from Azure AD (orphaned credential, safe to remove)

**PowerShell:**
```powershell
Get-MgUserAuthenticationWindowHelloForBusinessMethod -UserId {upn} -Expand device
```

## MS Authenticator Credentials

**Basic query:**
```
GET https://graph.microsoft.com/v1.0/users/{upn}/authentication/microsoftAuthenticatorMethods
```

**With device info:**
```
GET https://graph.microsoft.com/v1.0/users/{upn}/authentication/microsoftAuthenticatorMethods?$expand=device
```

Key indicators:
- `device: null` = device removed (orphaned credential)

**PowerShell:**
```powershell
Get-MgUserAuthenticationMicrosoftAuthenticatorMethod -UserId {upn} -Expand device
```

## FIDO2 Credentials

```
GET https://graph.microsoft.com/v1.0/users/{upn}/authentication/fido2Methods
```

Returns: id, displayName, aaGuid, model, attestationCertificates, attestationLevel. No device association stored.

**PowerShell:**
```powershell
Get-MgUserAuthenticationFido2Method -UserId {upn}
```
