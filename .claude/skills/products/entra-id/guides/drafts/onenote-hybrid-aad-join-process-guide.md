# Windows 10 Hybrid Azure AD Join — Process & Troubleshooting Guide

> Source: OneNote case sharing | Quality: draft

## Prerequisites

### Machine Level
1. **Task Scheduler**: `Windows → Workplace Join` task must exist and be enabled
2. **User Certificate Attribute**: The computer object must have a `userCertificate` attribute populated

### Domain Level
1. **SCP (Service Connection Point)**: Device Registration configuration must be set in AD (CN=Device Registration Configuration)
2. **Domain Group Policy**: Auto workplace join policy must be configured
3. **Sync OU**: Computer objects must be in an OU that is in scope for Azure AD Connect sync

### Azure AD Connect
- Computer objects must be synced to Azure AD
- `userCertificate` attribute must not be empty (otherwise computer gets filtered out)

## Join Process Flow

1. Windows Task Scheduler triggers `dsregcmd.exe` to discover endpoint and SCP
2. `dsregcmd.exe` creates a certificate and populates the value back to local AD `userCertificate` attribute
3. At this point, Azure AD join will **still fail** — error recorded in User Device Registrations
4. Azure AD Connect syncs the computer to Azure AD:
   - Check MV (Metaverse) for `userCertificate` attribute — if empty, computer is filtered out
   - Once synced, computer object should have two connectors in MV
5. Manually trigger Task Scheduler → Windows → Workplace Join on the machine
6. Machine completes Hybrid Azure AD join successfully

## Troubleshooting Checklist

| Check | Command / Location |
|-------|-------------------|
| SCP configured | `dsregcmd /status` |
| Task exists | Task Scheduler → Microsoft → Windows → Workplace Join |
| userCertificate populated | AD Users & Computers → Computer properties → Attribute Editor |
| Computer in sync scope | Azure AD Connect sync rules |
| MV has two connectors | Azure AD Connect Synchronization Service Manager |
| Join status | `dsregcmd /status` → Device State |

## Common Error Code

- **801c03f2**: Usually indicates SCP discovery failure or sync not completed. Follow the flow above to verify each step.

## References

- [Hybrid Azure AD join setup](https://docs.microsoft.com/en-us/azure/active-directory/devices/hybrid-azuread-join-plan)
- [Hello for Business hybrid cert trust device registration](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-cert-trust-devreg)
