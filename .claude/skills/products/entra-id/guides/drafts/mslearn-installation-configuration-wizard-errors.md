# Azure AD Sync / Entra Connect Installation & Configuration Wizard Errors

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/installation-configuration-wizard-errors)

## System Requirements

- Windows PowerShell 1.0+
- Local Administrators group membership
- 64-bit processor, Windows Server 2003 x64 SP2+
- NOT a domain controller; Domain-joined, in the forest to be synced
- .NET Framework 3.5+

## Permission Requirements

- Local MIIS Admins group membership to start Config Wizard
- Enterprise Admin credentials for on-premises AD
- Global Admin credentials for cloud service

## Domain Connectivity Check

```cmd
nltest /dsgetdc:<FQDN>
nltest /dsgetsite
```

## Common Errors Reference

| Error | Resolution |
|-------|-----------|
| MachineIsNotDomainJoined | Join computer to domain |
| DirSyncAlreadyInstalled | Uninstall previous versions first |
| DirSyncNotInstalledError | Uninstall all versions, reinstall latest |
| InstallNotAllowedOnDomainController | Install on domain-joined non-DC |
| PowerShellRequired | Install PowerShell |
| ADCredsNotValid | Verify Enterprise Admin credentials |
| ErrorNoStartConnection | Verify DC connectivity from sync server |
| ErrorNoStartCredentials | Rerun Config Wizard, reenter credentials |
| ErrorStoppedConnectivity | Restore internet, ping provisioning.microsoftonline.com |
| ErrorStoppedDatabaseDiskFull | Free SQL database storage |
| UserNotAMemberOfMIISAdmins | Add user to MIIS Admin group (logoff/logon) |
| UserNotAnEnterpriseAdmin | Add user to Enterprise Admins group |
| MIISSyncIsInProgressError | Wait for current sync to complete |
| InstallPathLengthTooLong | Use path < 116 characters |
| InsufficientDiskSpace | Free disk space |

## Troubleshooting Steps

1. Check Event Viewer -> Application -> filter by "Directory Synchronization" source
2. Verify domain connectivity with nltest and nslookup
3. If "already installed" error: check Add/Remove Programs for MIIS, rename old folder, retry
4. For credential errors: verify account is Enterprise Admin and has portal Global Admin access
