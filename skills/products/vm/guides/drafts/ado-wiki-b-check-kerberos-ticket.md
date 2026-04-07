---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Azure Files Identity/How to Check Kerberos Ticket_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FHow%20Tos%2FAzure%20Files%20Identity%2FHow%20to%20Check%20Kerberos%20Ticket_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Check Kerberos Ticket for Azure Files

Applicable scenarios: On-premises AD DS, Microsoft Entra Domain Services, Microsoft Entra Kerberos for hybrid user identities.

## Method 1 - klist
Built-in Windows command. Get service tickets for domain-joined storage account:

```
klist get cifs/<storageaccount>.file.core.windows.net
```

### Successful output example
```
Client: <user> @ DOMAIN.COM
Server: cifs/<storage-account>.file.core.windows.net @ DOMAIN.COM
KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96
Ticket Flags: forwardable renewable pre_authent name_canonicalize
Session Key Type: AES-256-CTS-HMAC-SHA1-96
```

### Known error outputs

**Error 0xc000018b/-1073741429**: "The SAM database on the Windows Server does not have a computer account for this workstation trust relationship"
- Check: client domain membership, storage account SPN existence, AD trust

**Error 0x80090342/-2146892990**: "The encryption type requested is not supported by the KDC"
- Check: supported encryption types on storage AD object, domain GPO Kerberos settings

## Method 2 - Get-AzStorageKerberosTicketStatus
From AzFilesHybrid module. Shows Azure File Health Status:
- **Healthy**: valid ticket with supported encryption
- **Unhealthy**: unsupported encryption type in ticket; also shows klist error

```powershell
Get-AzStorageKerberosTicketStatus
```

## Method 3 - Debug-AzStorageAccountAuth
Comprehensive validation including CheckGetKerberosTicket step:
- Attempts to get Kerberos ticket for storage account
- Returns SUCCESS or FAILED with error details
- If FAILED, run `klist get cifs/<sa>.file.core.windows.net` to examine error code

See: Debug-AzStorageAccountAuth execution guide in ADO Wiki.
