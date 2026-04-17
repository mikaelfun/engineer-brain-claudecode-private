# Windows 10 Hybrid Azure AD Join - Complete Process Walkthrough

> Source: OneNote case sharing
> Status: draft (pending SYNTHESIZE)

## Prerequisites

### Machine Level

1. **Task Scheduler** — Verify `Windows > Workplace Join` task exists and is enabled
2. **User Certificate Attribute** — Computer object in AD must have `userCertificate` attribute populated by dsregcmd.exe

### Domain Level

1. **SCP (Service Connection Point)** — Device Registration Configuration must be properly set in AD
2. **Domain Group Policy** — Correct GPO for device registration must be applied
3. **Sync OU** — The OU containing target computer objects must be in Azure AD Connect sync scope

### Azure AD Connect

- Computer objects must be synced to Azure AD
- Critical attribute: `userCertificate` — if empty, the computer object may be filtered out during sync

## Process Flow

1. Windows Task Scheduler triggers `dsregcmd.exe` to discover SCP endpoint
2. `dsregcmd.exe` creates a self-signed certificate and writes it to the `userCertificate` attribute of the computer in local AD
3. At this point, Azure AD join will still fail (error 801c03f2) — this is expected
4. Azure AD Connect syncs the computer object (with `userCertificate`) to Azure AD
5. Verify in AAD Connect: computer object appears in Connector Space (CS) and Metaverse (MV) with two connectors
6. Return to the machine, manually trigger Task Scheduler > Windows > Workplace Join
7. Machine completes Hybrid Azure AD join successfully

## Troubleshooting Error 801c03f2

This error typically means the device registration has not completed the full cycle:

- **Check `userCertificate`** on the computer object in AD — if empty, dsregcmd hasn't run or failed
- **Check AAD Connect sync** — ensure the computer is in sync scope and `userCertificate` is flowing
- **Check SCP configuration** — verify with `dsregcmd /status`
- **Manually trigger** the Workplace Join task after confirming sync completion

## References

- [Configure hybrid Azure AD join](https://docs.microsoft.com/en-us/azure/active-directory/devices/howto-hybrid-azure-ad-join)
- [WHFB cert trust device registration](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-cert-trust-devreg)
