---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Window Devices/Microsoft Entra Hybrid Join/Entra Hybrid Join using Entra Kerberos"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Window%20Devices/Microsoft%20Entra%20Hybrid%20Join/Entra%20Hybrid%20Join%20using%20Entra%20Kerberos"
importDate: "2026-04-05"
type: troubleshooting-guide
---

> **Compliance note**: This wiki contains test/lab data only.

Microsoft Entra Kerberos enables Hybrid Join **without AD FS or Microsoft Entra Connect sync**. Supported use cases: NP-VDI in managed environments, Cloud Sync customers, Azure Virtual Desktop / Windows 365 hybrid, disconnected forests.

[[_TOC_]]

## Prerequisites

| Requirement | Details |
|---|---|
| Role | Domain Admins + Enterprise Admins (on-prem); Hybrid Identity Administrator (Entra ID) |
| DC | At least one DC running **Windows Server 2025 build 26100.6905+** per domain |
| Client | **Windows 11 build 26100.6584+** |
| SCP | Configured via Entra Connect or PowerShell |
| Kerberos Trusted Domain Object | Create via incoming trust-based flow |
| ADRS Service Principal | Add `adrs/enterpriseregistration.windows.net` SPN + `KerberosPolicy:ExchangeForJwt` tag |
| KDC Proxy GPO | Optional — only if KDC proxy GPO is deployed |

## Setup Steps

### 1. Create Entra Kerberos Trusted Domain Object

Follow: [How to set up Windows Authentication for Microsoft Entra ID with the incoming trust-based flow](https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/winauth-azuread-setup-incoming-trust-based-flow#create-and-configure-the-microsoft-entra-kerberos-trusted-domain-object)

### 2. Configure KDC Proxy GPO (if applicable)

Policy: **Administrative Templates\System\Kerberos\Specify KDC proxy servers for Kerberos clients**

| Value name | Value |
|---|---|
| KERBEROS.MICROSOFTONLINE.COM | `https login.microsoftonline.com:443:<tenantId>/kerberos /` |

Note: There is a space after `https` and before the closing `/`.

### 3. Configure ADRS Service Principal

```powershell
Connect-Entra -Environment 'Global' -Scopes "Application.ReadWrite.All"

$drsSP = Get-EntraServicePrincipal -Filter "AppId eq '01cb2876-7ebd-4aa4-9cc9-d28bd4d359a9'"

# Add Kerberos SPN if missing
$spns = [System.Collections.Generic.List[string]]::new($drsSP.ServicePrincipalNames)
if ($drsSP.ServicePrincipalNames -notcontains "adrs/enterpriseregistration.windows.net") {
    $spns.Add("adrs/enterpriseregistration.windows.net")
}

# Add Kerberos policy tag if missing
$tags = [System.Collections.Generic.List[string]]::new($drsSP.Tags)
if ($drsSP.Tags -notcontains "KerberosPolicy:ExchangeForJwt") {
    $tags.Add("KerberosPolicy:ExchangeForJwt")
}

Set-EntraServicePrincipal -ObjectId $drsSP.Id -ServicePrincipalNames $spns -Tags $tags
```

### 4. Deploy Windows Server 2025 DC

Install at least one DC per AD domain. Run `EnableKerbHaadj.exe` on each DC running Windows Server 2025, then restart.

### 5. Configure Client

Deploy Windows 11 build 26100.6584+, domain join, restart.

## Kerberos Error Code Reference

| Error Code | Description | Root Cause | Resolution |
|---|---|---|---|
| `0x801c0095` DSREG_TOKEN_MISSING_ON_PREM_ID | Token missing on-premises ID | Kerberos ticket from on-premises KDC doesn't contain info required by Entra ID | Run `EnableKerbHaadj.exe` on all WS2025 DCs, restart |
| `0x80090311` SEC_E_NO_AUTHENTICATING_AUTHORITY | No authority could be contacted | No functional WS2025 DC reachable | Install WS2025 DC, run `EnableKerbHaadj.exe`, ensure KDC running, run `dcdiag.exe` |
| `0x80090303` SEC_E_TARGET_UNKNOWN | Target unknown or unreachable | — | — |
| `0x8009030c` SEC_E_LOGON_DENIED / KDC_ERR_NULL_KEY(0x9) | "No KerberosKeyInformation Keys found" | `KerberosPolicy:ExchangeForJwt` tag missing from ADRS service principal | Add tag to service principal (see Setup Step 3) |

## Collecting Kerberos Logs

```powershell
# 1. Download and unzip https://aka.ms/authscripts

# 2. On WS2025 DC (stop others): stop KDC on extras
net stop kdc

# 3. On WS2025 DC with KDC running:
start-auth.ps1

# 4. On client:
start-auth.ps1

# 5. Trigger join on client:
# (elevated cmd) dsregcmd /join

# 6. Stop traces:
stop-auth.ps1   # on client
stop-auth.ps1   # on DC

# 7. Restart stopped DCs:
net start kdc
```

## ICM Escalations

Route to: **Owning Service**: ADRS | **Owning Team**: ADRS

## References

- [Microsoft Entra hybrid join using Microsoft Entra Kerberos (preview)](https://learn.microsoft.com/en-us/entra/identity/devices/how-to-hybrid-join-using-microsoft-entra-kerberos)
- Deep Dive Recording: https://aka.ms/AAzgf02
