---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Microsoft Entra Hybrid Join/Entra Hybrid Join using Entra Kerberos"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FMicrosoft%20Entra%20Hybrid%20Join%2FEntra%20Hybrid%20Join%20using%20Entra%20Kerberos"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Entra Hybrid Join using Entra Kerberos

You can use Microsoft Entra Kerberos to perform Microsoft Entra hybrid join for a device without requiring Active Directory Federation Services (AD FS) or Microsoft Entra Connect sync. You get the Microsoft Entra hybrid join behavior instantly without the AD FS setup.

## Use cases

- Deploy non-persistent Virtual Desktop Infrastructure (VDI) with Microsoft Entra hybrid join in a managed environment.
- Deploy Microsoft Entra hybrid join for customers who have or want to use Microsoft Entra Cloud Sync.
- Improve provisioning experience for Azure Virtual Desktop and Windows 365 hybrid deployment.
- Deploy Microsoft Entra hybrid join for a disconnected forest setup where Microsoft Entra Connect Sync can't be used.

## Prerequisites

- **Role requirements**:
  - Domain Admins and Enterprise Admins group in AD DS on-premises
  - Hybrid Identity Administrator in Microsoft Entra ID
- **KDC proxy server GPO** (only if deployed): Domain Admin or delegated GPO permissions
- **Microsoft Entra Device Registration Service Principal**: Application Administrator role
- **Domain controller**: Windows Server 2025 build 26100.6905 or later
- **Client computer**: Windows 11 build 26100.6584 or later, must have unimpeded network connectivity with the WS2025 DC during join
- **Service Connection Point (SCP)**: Configure via Microsoft Entra Connect or PowerShell

## Setup Steps

### 1. Create and configure Microsoft Entra Kerberos Trusted Domain Object

Follow: [How to set up Windows Authentication for Microsoft Entra ID with the incoming trust-based flow](https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/winauth-azuread-setup-incoming-trust-based-flow)

### 2. Configure KDC proxy server GPO (if applicable)

KDC proxy servers setting mapping:

| Value name | Value |
|:--|:--|
| KERBEROS.MICROSOFTONLINE.COM | `https login.microsoftonline.com:443:your_tenant_id/kerberos /` |

### 3. Configure Microsoft Entra Device Registration Service Principal

```powershell
Connect-Entra -Environment 'Global' -Scopes "Application.ReadWrite.All"
$drsSP = Get-EntraServicePrincipal -Filter "AppId eq '01cb2876-7ebd-4aa4-9cc9-d28bd4d359a9'"

# Add Kerberos SPN if missing
$spns = [System.Collections.Generic.List[string]]::new($drsSP.ServicePrincipalNames)
$kerbSpn = "adrs/enterpriseregistration.windows.net"
if ($drsSP.ServicePrincipalNames -notcontains $kerbSpn) {
    $spns.Add($kerbSpn)
}

# Add Kerberos policy tag if missing
$tags = [System.Collections.Generic.List[string]]::new($drsSP.Tags)
$kerberosTag = "KerberosPolicy:ExchangeForJwt"
if ($drsSP.Tags -notcontains $kerberosTag) {
    $tags.Add($kerberosTag)
}

Set-EntraServicePrincipal -ObjectId $drsSP.Id -ServicePrincipalNames $spns -Tags $tags
```

### 4. Deploy a domain controller running Windows Server 2025

Install at least one DC running WS2025 build 26100.6905+ in every domain that needs Entra Kerberos hybrid join.

### 5. Configure client computer

Deploy Windows 11 build 26100.6584+, join to AD domain, restart.

## Kerberos Errors

| Error code | Description | Reason | Resolution |
|:--|:--|:--|:--|
| DSREG_TOKEN_MISSING_ON_PREM_ID (0x801c0095) | Token doesn't contain on-premises ID | Kerberos ticket from on-prem authority missing required info | Run EnableKerbHaadj.exe on every WS2025 DC and restart |
| SEC_E_NO_AUTHENTICATING_AUTHORITY (0x80090311) | No authority contacted for auth | No functional WS2025 DC reachable | Install WS2025 DC, run EnableKerbHaadj.exe, restart, ensure KDC running, run dcdiag.exe |
| SEC_E_TARGET_UNKNOWN (0x80090303) / KDC_ERR_S_PRINCIPAL_UNKNOWN (0x7) | Target unknown or unreachable | - | - |
| SEC_E_LOGON_DENIED (0x8009030c) / KDC_ERR_NULL_KEY (0x9) | Logon failed: No KerberosKeyInformation Keys found | Kerberos key for DRS service principal not found | Add tag KerberosPolicy:ExchangeForJwt to service principal |

## Troubleshooting - Collecting Kerberos Logs

1. Download and unzip logging scripts from https://aka.ms/authscripts
2. If multiple WS2025 DCs, stop KDC on all except one: `net stop kdc`
3. On remaining WS2025 DC: run `start-auth.ps1`
4. On client: run `start-auth.ps1`
5. On client (cmd admin): run `dsregcmd /join`
6. On client: run `stop-auth.ps1`
7. On DC: run `stop-auth.ps1`
8. Restart KDC on other DCs: `net start kdc`

## ICM Escalation

**Owning Service**: ADRS | **Owning Team**: ADRS

## References

- [Microsoft Entra hybrid join using Microsoft Entra Kerberos (preview)](https://learn.microsoft.com/en-us/entra/identity/devices/how-to-hybrid-join-using-microsoft-entra-kerberos)
- [Troubleshoot hybrid joined devices](https://learn.microsoft.com/en-us/entra/identity/devices/troubleshoot-hybrid-join-windows-current)
- [Enable Kerberos event logging](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/enable-kerberos-event-logging)
- Deep Dive Recording: https://aka.ms/AAzgf02
