# Azure AD Sync Tool Installation & Configuration Wizard Errors

> Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/installation-configuration-wizard-errors

## Prerequisites Check
- PowerShell 1.0+
- Local Administrator
- 64-bit processor
- Windows Server 2003 SP2 x64+
- NOT a domain controller
- Domain-joined, in sync target forest
- .NET Framework 3.5+

## Common Errors Quick Reference

| Error | Resolution |
|-------|-----------|
| Computer must be joined to domain | Check domain membership; verify DNS; try unjoin/rejoin |
| Already installed | Remove MIIS from Add/Remove Programs; rename old folder; re-run |
| MachineIsNotDomainJoined | Verify domain join and DC connectivity |
| ADCredsNotValid | Verify Enterprise Admin credentials |
| UserNotAMemberOfMIISAdmins | Add user to MIIS Admins group; logoff/logon |
| ErrorStoppedDatabaseDiskFull | Free SQL DB storage space |
| ErrorNoStartConnection | Check AD DC connectivity |
| ErrorNoStartCredentials | Re-run config wizard with correct credentials |
| PowerShellRequired | Install PowerShell |

## Domain Connectivity Troubleshooting
```cmd
nltest /dsgetdc:<FQDN>     # Check DC discovery
nltest /dsgetsite           # Check site membership
ipconfig /all               # Check DNS settings
nslookup <DC-FQDN>         # Verify DNS resolution
```

## Event Viewer
All directory sync logging: Event Viewer → Windows Logs → Application → Filter by "Directory Synchronization" source
