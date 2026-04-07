---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Troubleshooting/ADFS - GMSA Service account information and troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/ADFS%20and%20WAP/ADFS%20Troubleshooting/ADFS%20-%20GMSA%20Service%20account%20information%20and%20troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS - GMSA Service Account Information and Troubleshooting

## Overview

GMSA (Group Managed Service Accounts) in Active Directory are used for advanced security with automatic password management without service disruption. Eliminates the need for service administrators to manage password synchronization between service instances.

## Benefits of gMSA

- Strong passwords: 240-byte, randomly generated passwords
- Automatic password management: OS manages password, changes every 30 days
- Support for server farms: can be deployed to multiple servers
- Simplified SPN management: SPNs can be set up with PowerShell
- Single identity solution for services on server farms or behind NLB

## KDS Root Key

- Created via `Add-KdsRootKey` cmdlet (one-time per AD forest)
- Allow 10 hours replication delay before using gMSA
- Stored in `CN=Master Root Keys,CN=Group Key Distribution Service,CN=Services,CN=Configuration,DC=<forest name>`
- Requires Domain Admins or Enterprise Admins membership

## Key gMSA Properties

| Property | Description |
|----------|-------------|
| Name | Account name |
| DNSHostName | DNS host name of service |
| msDS-SupportedEncryptionType | Encryption types (None, RC4, AES128, AES256) |
| msDS-ManagedPasswordInterval | Password change interval (default 30 days) |
| PrincipalsAllowedToRetrieveManagedPassword | Computer accounts/groups allowed to retrieve password |
| ServicePrincipalNames | SPNs for the service |

## PowerShell Troubleshooting Commands

1. **Test-ADServiceAccount** - Verify gMSA can authenticate:
   ```powershell
   Test-ADServiceAccount -Identity <gmsa_name>
   ```

2. **Get-ADServiceAccount** - Review properties:
   ```powershell
   Get-ADServiceAccount <gmsa_name> -Properties PrincipalsAllowedToRetrieveManagedPassword
   ```

3. **Set-ADServiceAccount** - Modify permissions:
   ```powershell
   Set-ADServiceAccount <gmsa_name> -PrincipalsAllowedToRetrieveManagedPassword Host1$,Host2$
   ```
   > **Warning**: Always review existing list first with Get-ADServiceAccount and include existing entries when running Set-ADServiceAccount.

## Common Issues

### Scenario 1: Permission denied to read gMSA password (0xc0000022)

Netlogon.log shows `[MSA]` section with STATUS_ACCESS_DENIED:
```
NetpGMSAAddWrapper for account <name> failed, 0xc0000022
```
**Fix**: Add server to PrincipalsAllowedToRetrieveManagedPassword.

### Scenario 2: Encryption type mismatch (0xc0000719)

Netlogon.log shows:
```
Supported encryption types did not match, 0xc0000719
```
**Fix**: Ensure msDs-SupportedEncryptionTypes matches on both computer and gMSA AD objects.

## Required Logs

Capture ADFS tracing script + Netlogon.log when troubleshooting gMSA issues.

## References

- https://learn.microsoft.com/en-us/windows-server/security/group-managed-service-accounts/group-managed-service-accounts-overview
- https://learn.microsoft.com/en-us/windows-server/security/group-managed-service-accounts/getting-started-with-group-managed-service-accounts
- https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/decrypting-the-selection-of-supported-kerberos-encryption-types/ba-p/1628797
