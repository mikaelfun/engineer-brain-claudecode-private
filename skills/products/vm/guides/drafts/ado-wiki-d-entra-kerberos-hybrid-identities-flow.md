---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Azure Files Identity/AAD_Kerb_Auth/Microsoft Entra Kerberos authentication for hybrid identities troubleshooting flow_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FAzure%20Files%20Identity%2FAAD_Kerb_Auth%2FMicrosoft%20Entra%20Kerberos%20authentication%20for%20hybrid%20identities%20troubleshooting%20flow_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Entra Kerberos Authentication for Hybrid Identities - Troubleshooting Flow

This article provides comprehensive insights and workflows for engineers on identifying supported scenarios with Azure Files using Microsoft Entra ID Kerberos (formerly Azure AD) for authenticating hybrid user identities. These identities originate from on-premises AD DS and are synchronized to Microsoft Entra ID. Cloud-only identities are not currently supported.

## Troubleshooting Steps

### 1. Confirm supported OS version and prerequisites
- Windows 11 Enterprise/Pro (single or multi-session)
- Windows 10 Enterprise/Pro (single or multi-session), version 2004 or later with latest cumulative updates (especially KB5007253)
- Windows Server 2022 with latest cumulative updates (especially KB5007254)
- See [Prerequisites](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-auth-hybrid-identities-enable?tabs=azure-powershell#prerequisites)

### 2. Verify Storage account configured for Microsoft Entra Kerberos
Check via Azure Portal, ASC, or Xportal.

### 3. Confirm VM is Microsoft Entra joined or hybrid joined
- Run `dsregcmd /status`
- Confirm **AzureAdJoined** is **YES** and **EnterpriseJoined** is **NO**
- For hybrid: both **AzureAdJoined** and **DomainJoined** are **YES**
- Under **SSO State**: **AzureAdPrt** = YES, **CloudTGT** = YES

### 4. Confirm hybrid identity
- Users and groups must be managed in AD and synced to Entra ID via Microsoft Entra Connect
- Verify **On-premises sync enabled** = Yes in Entra portal
- Groups must be Security type with Source = Windows server AD (M365/Universal groups not supported)

### 5. Verify Kerberos ticket retrieval capability
- Configure via **Intune, Group Policy, or reg add**
- **Intune-managed devices**: always deploy via Intune policy (overrides local registry)
- Check with `klist cloud_debug` - look for "Cloud Kerberos enabled by policy"

Registry paths:
- Intune: `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters`
- GPO/reg add: `HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters`
- **Intune takes precedence** over GPO/reg add

### 6. Confirm Kerberos TGT available
1. Login with user account, open cmd
2. Run `klist purge` then `klist get krbtgt`
3. Run `klist` - confirm TGT for `krbtgt/KERBEROS.MICROSOFTONLINE.COM`
4. Run `klist get cifs/<StorageAccountName>.file.core.windows.net`
5. If no TGT and error (e.g., 0x8009030e), see [KB article](https://learn.microsoft.com/en-us/troubleshoot/windows-server/windows-security/active-directory-authentication-fails-klist-error-0x8009030e)
6. If prerequisites correct but no ticket, escalate to Entra ID team
   - **SAP**: Azure/Microsoft Entra Sign-in and MFA/AD domain-joined Seamless SSO with PTA or PHS

### 7. Confirm Azure File Share access
- Mount: `net use Z: \\StorageAccountName.file.core.windows.net\FileShareName`

### 8-9. Specific errors (MFA-related)
- Mount error 86 or 1327 on AAD Kerberos due to MFA conditional access policy
- Use Fiddler to identify these errors

### 10. Access Denied
- Check Storage Account Firewall (Network public access) settings
- Check for missing RBAC role or NTFS/Windows Share ACL

### 11. Advanced Troubleshooting
Always include UTC timestamps.

**Fiddler** (preferred for Entra Kerberos scenarios):
- Start capture, reproduce issue, save sessions
- Captures HTTP/HTTPS traffic

**Wireshark**:
1. Download and open Wireshark
2. Run `klist purge`
3. Start capture
4. Reproduce issue (e.g., `net use`)
5. Stop and save capture

**netsh**:
```cmd
netsh trace start capture=yes maxsize=4096 tracefile=c:%computername%-NetTrace.etl
[Reproduce the issue]
netsh trace stop
```

## Escalation
Before initiating AVA with storage SMEs, gather as much relevant information as possible.
- [STG - Files - All Topics AVA](https://teams.microsoft.com/l/channel/19:65e0d0ce00f3468f83f6b66fa49639c5@thread.tacv2/STG%20-%20Files%20%E2%80%93%20All%20topics%20(AVA))
