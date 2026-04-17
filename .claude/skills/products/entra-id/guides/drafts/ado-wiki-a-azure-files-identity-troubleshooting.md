---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Azure Active Directory Topics/Azure Files in DS/Azure Files: Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAzure%20Active%20Directory%20Topics%2FAzure%20Files%20in%20DS%2FAzure%20Files%3A%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:**
This section is to help you get started with troubleshooting Azure File Shares and what you should look for when analysing the data.

# Checking Object & Permissions

## On-Premises AD DS Authentication as identity source

- Active Directory Authentication must first be enabled and configured for the storage account in the Azure Portal.
- Permissions for authenticated users and groups should be set to **Enabled** with the expected Role.
- Check into Entra Id portal that the account or group has been added in the Access Control (IAM), this can be on on-premises or Entra ID User/Group.
- Network access in case the customer restricts to specific private endpoints (Azure Networking team might be engaged).
- To allow access to the share using the storage key to grant ACLs or to test.
- Keys created during on-premises configuration of the storage account.
- Corresponding Storage account on ADDS:
  ```Powershell
  get-aduser -Identity _samaccountame_of_storage_account_ -Properties * | fl Name,samaccountname,KerberosEncryptionType,msDS-SupportedEncryptionTypes,ServicePrincipalNames,UserPrincipalName
  ```
  Expected output:
  - KerberosEncryptionType: {AES256}
  - msDS-SupportedEncryptionTypes: 16
  - ServicePrincipalNames: {cifs/storageaccountname.file.core.windows.net}
  - UserPrincipalName: cifs/storageaccountname.file.core.windows.net@domain.com

- Pay attention to the supportedencryptiontypes. If set after account creation, follow MS docs to enable AES 256 and update password for AD DS storage account identity.
- Query published SPN: `setspn -Q cifs/your-storage-account-name-here.file.core.windows.net`

## Microsoft Entra Kerberos for hybrid identities as identity source

### Objects in Entra ID
- Check domain name and domain guid configuration
- Verify permissions for all authenticated users and groups
- Check allow storage account key access setting

### Registered SPNs in EntraID
Find in Azure App registration blade > storage account > manifest:
```
"identifierUris":[
  "HOST/azfishkerb2.file.core.windows.net",
  "CIFS/storageaccountname.file.core.windows.net"
]
```

### Objects stored in ADDS while using Microsoft Entra Kerberos for hybrid identities
- If there are legacy clients, check the trust exists (cloud trust between AD DS and Microsoft Entra ID).

### Objects stored in ADDS If the user uses passwordless feature
- AzureADKerberos: "fake" RODC account with PRP
- Check if keys are aligned between on-premises and Entra ID using `Get-AzureADKerberosServer`
- krbtgt_AzureAD (sAMAccountName) will be displayed in KDC.etl
- Service-Connection-Point into CN=AzureAD,CN=System,DC=domain,DC=com

### Other verifications
- Does it work with Storage File data SMB Share contributor or Elevated Contributor?
- Does it work when using the storage account key for authentication?

## Expected Configuration for Entra ID joined & Hybrid joined Clients

Required registry settings:
```
HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos
  domain_realm_Enabled REG_DWORD 0x1

HKLM\...\Kerberos\domain_realm
  Onprem_domain_name.com REG_SZ storageaccount1.file.core.windows.net; storageaccount2.file.core.windows.net
  KERBEROS.MICROSOFTONLINE.COM REG_SZ storageaccountEntraID.file.core.windows.net
```

For Microsoft Entra Kerberos authentication:
```
HKLM\...\Kerberos\Parameters
  CloudKerberosTicketRetrievalEnabled REG_DWORD 0x1
```

# User Configuration

## PRT & Partial TGT

### Klist
Use `klist Cloud_Debug` to check:
- Cloud Kerberos enabled by policy: **1**
- AS_REP callback used: **1**
- Cloud Primary (Hybrid logon) TGT Available: **1**

Commands:
- `klist get krbtgt/kerberos.microsoftonline.com` - should return ticket from on-prem realm
- `klist get cifs/<azfiles.host.name.com>` - should return ticket from kerberos.microsoftonline.com realm

### DSREGCMD
`Dsregcmd /status /debug` should show:
- OnPremTgt: **Yes**
- CloudTgt: **Yes**
- KerbTopLevelNames: .windows.net, .windows.net:1433, .azure.net, etc.

| dsregcmd /status | klist cloud_debug | Code/ESTS logging | Usage |
|:--:|:--:|:--:|:--:|
| OnPremTgT | Cloud Primary (Hybrid logon) TGT available | Mcticket | FIDO logon and WHfB Cloud Trust |
| CloudTGT | Cloud Referral TGT present in cache | Cloud TGT / cloudtgt | Service ticket for legacy Kerberos apps integrated with AAD |

# ETL Analysis

## WebAuth ETL
Key indicator: **AD TGT: 1 Cloud TGT: 1**

## Kerberos ETL
Key indicators of partial TGT usage: `AsRepCallback` / `McFerral` / `McTicket`

## KDC ETL
```
[core] KdcCheckTicket() - TGT for user xxx from branch krbtgt_xxx presented to hub
```

# Troubleshooting steps

1. Verify tickets are getting cached:
   - `klist get krbtgt/kerberos.microsoftonline.com` - should return ticket from on-prem realm
   - `klist get cifs/<azfiles.host.name.com>` - should return ticket from kerberos.microsoftonline.com realm

2. Verify connectivity over Port 445 using `Test-NetConnection`

3. For storage-specific issues, refer to Windows client troubleshooting guide

4. Investigate message flow failures:
   - Wireshark: Client => on-prem KDC (AS-REQ => on-prem TGT, TGS-REQ => referral to kerberos.microsoftonline.com)
   - Fiddler: Client => login.microsoftonline.com/{tenant}/Kerberos => service ticket
