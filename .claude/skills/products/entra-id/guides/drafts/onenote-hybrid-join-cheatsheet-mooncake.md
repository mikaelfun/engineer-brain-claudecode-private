# Hybrid Azure AD Join Configuration Cheat Sheet for Mooncake

> Source: OneNote — Mooncake POD Support Notebook
> Quick-check reference for Hybrid AAD Join configuration in Azure China (21Vianet)

## References

- https://docs.azure.cn/zh-cn/active-directory/devices/hybrid-azuread-join-manual
- https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/deployment/configure-a-federation-server-with-device-registration-service

---

## Checklist

### 1. Intranet DNS

| Scenario | Configuration |
|----------|--------------|
| With ADFS | CNAME `enterpriseregistration` → ADFS service name |
| Without ADFS | CNAME `enterpriseregistration` → `enterpriseregistration.chinacloudapi.cn` |
| ADFS A record | Must be **A record** (not CNAME) for ADFS service name → ADFS IP. CNAME causes WIA failure. |

### 2. Internet DNS

- CNAME `enterpriseregistration` → `enterpriseregistration.partner.microsoftonline.cn`
- A record → ADFS IP address

### 3. Client Version

- **Not supported**: Windows Server 2016, Windows 10 2016 LTSB — these do not support Mooncake join.

### 4. Client Network Access (Whitelist)

```
https://enterpriseregistration.windows.net
https://enterpriseregistration.partner.microsoftonline.cn
https://login.partner.microsoftonline.cn
https://device.login.partner.microsoftonline.cn
```

Test with: [Connectivity testing script for Mooncake](https://github.com/sscchh2001/AzureADDRS/blob/main/Test-HybridDevicesInternetConnectivity.ps1)

### 5. Client Intranet Sites

- ADFS URL must be in user's **Local Intranet** zone
- For down-level clients, also add: `https://device.login.partner.microsoftonline.cn`

### 6. Client Browsers

| Browser | Configuration |
|---------|--------------|
| **Edge** | `edge://settings/profiles` → Profile Preferences → Allow single sign-on for work or school sites (default OFF on Win10 1809 LTSB) |
| **Chrome** | Install "Windows 10 Accounts" extension |

### 7. AD DS — Service Connection Point (SCP)

Verify SCP:
```powershell
$scp = New-Object System.DirectoryServices.DirectoryEntry
$scp.Path = "LDAP://CN=62a0ff2e-97b9-4513-943f-0d221bd30080,CN=Device Registration Configuration,CN=Services,CN=Configuration,DC=fabrikam,DC=com"
$scp.Keywords
# Expected:
# azureADName: <Custom Domain>
# azureADId: <AAD tenant ID>
```

Alternative: Client-side registry override:
```
HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\CDJ\AAD
  TenantId = <tenant-id>
  TenantName = <tenant-name>
```

Configure SCP options:
- **Option 1**: Use AAD Connect Hybrid Join wizard
- **Option 2**: PowerShell script (see source doc)
- **Option 3**: ADSI Edit → Configuration → Services → Device Registration Configuration

### 8. AAD Connect

- Enable **Device writeback**
- Include **user object OU** in sync scope
- Include **device object OU** in sync scope

### 9. AD FS (Federated Domain Only)

#### WS-Trust Endpoints (must be enabled)

```
/adfs/services/trust/2005/windowstransport  (server only)
/adfs/services/trust/13/windowstransport    (server only)
/adfs/services/trust/2005/usernamemixed
/adfs/services/trust/13/usernamemixed
/adfs/services/trust/2005/certificatemixed
/adfs/services/trust/13/certificatemixed
```

#### Relying Party Configuration

- Configure **claim rules** via `Update-MsolFederatedDomain` (caution: removes custom RP identifiers) or PowerShell helper script
- Add RP identifier: `https://login.partner.microsoftonline.cn`
- Enable ADFS Device Registration Service (optional): `Initialize-ADDeviceRegistration` + `Enable-AdfsDeviceRegistration`

#### Down-level Client Requirements

- ADFS certificate SAN must include `DNS=enterpriseregistration.contoso.com` + ADFS service name
- Configure WIAORMULTIAUTHN claim
- Install [Microsoft Workplace Join for non-Windows 10](https://www.microsoft.com/download/details.aspx?id=53554)
