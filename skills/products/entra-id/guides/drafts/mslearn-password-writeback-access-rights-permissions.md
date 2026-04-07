# Password Writeback Access Rights and Permissions

> Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/password-writeback-access-rights-permissions

## Overview

Comprehensive reference for AD permissions required for password writeback to function correctly.

## Identify the AD DS Connector Account

1. Open Synchronization Service Manager → Connectors tab → select AD connector → Properties
2. Select "Connect to Active Directory Forest" → copy the **User name** (MSOL_ account)

## Check Existing Permissions

Use `Set-ADSyncPasswordWritebackPermissions` from ADSyncConfig PowerShell module to set permissions automatically.

### Methods to verify permissions:
- **AD Users and Computers**: Security tab → Advanced → Effective Permissions → select MSOL_ account
- **Command prompt**: `dsacls "CN=User01,OU=Sync,DC=Contoso,DC=com"` to dump ACLs
- **PowerShell**: `Get-Acl "DC=Contoso,DC=com" | Export-Clixml aclDomain.xml` for offline analysis

## Required Permissions Summary

### Domain Root — MSOL_ Account (Allow)
| Permission | Apply to |
|---|---|
| Reset password | Descendant User objects |
| Replicating Directory Changes | This object only |
| Replicating Directory Changes All | This object only |
| Read/write all properties | Descendant User/Group/Contact/InetOrgPerson objects |

### User Object — MSOL_ Account (Allow)
| Permission | Inherited from |
|---|---|
| Reset password | domain root |
| Read/write all properties | domain root (User/Group/Contact/InetOrgPerson) |

### SAM Server Object (CN=Server,CN=System)
- Pre-Windows 2000 Compatible Access OR Authenticated Users must have Special permissions (List contents + Read all properties + Read permissions)
- Ensure **Authenticated Users** is a member of **Pre-Windows 2000 Compatible Access** group

### Builtin Container
- MSOL_ account needs Read/write all properties on descendant User/Group/Contact/InetOrgPerson objects

## Avoid Replication Issues
- Set preferred DC in Entra Connect AND point AD Users & Computers to the same DC
- Run `dcdiag` and `repadmin /replsum` to check replication health
- AD permission changes are subject to forest-wide replication delays

## Domain Group Policies
- Local Security Policy → User Rights Assignment → "Impersonate a client after authentication" must include: Administrators, LOCAL SERVICE, NETWORK SERVICE, SERVICE
