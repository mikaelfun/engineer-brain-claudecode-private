# Windows 10 Hybrid Azure AD Join Process and Error 801c03f2

## Overview

Comprehensive guide for the Windows 10 Hybrid Azure AD Domain Join process, covering prerequisites, workflow, and troubleshooting error code 801c03f2.

## Prerequisites

### Machine Level
- **Task Scheduler**: Windows > Workplace Join task must be present and enabled
- **User Certificate Attribute**: Computer object must have usercertificate attribute populated

### Domain Level
- **SCP (Service Connection Point)**: Device registration configuration must be set in AD (CN=Device Registration Configuration)
- **Domain Group Policy**: Appropriate GPO for device registration
- **Sync OU**: Computer objects in correct OU for Azure AD Connect sync

### Azure AD Connect
- Computer objects with populated usercertificate attribute must sync to Azure AD
- Verify in MV (Metaverse) that computer has two connectors (AD + AAD)

## Hybrid AADJ Workflow

1. Windows Task Scheduler runs `dsregcmd.exe` to discover endpoint and SCP
2. `dsregcmd.exe` creates a certificate and populates value back to local AD
3. Certificate is written into **usercertificate** attribute of the computer object
4. At this stage, Azure AD join will still show failure in User Device Registration admin event log
5. Azure AD Connect syncs the computer object to Azure AD
   - **Critical**: If `usercertificate` value is empty, the computer may be filtered out during sync
6. Once synced, computer object appears in MV with two connectors
7. Manually trigger Task Scheduler > Windows > Workplace Join (or wait for next scheduled run)
8. Machine completes Hybrid Azure AD Join successfully

## Troubleshooting Error 801c03f2

- Check Task Scheduler for Workplace Join task existence and status
- Verify usercertificate attribute on computer object in AD
- Check Azure AD Connect sync status for the computer
- Verify SCP configuration: `dsregcmd /status`
- Check User Device Registration event logs (Event IDs 102, 105)

## Key Event Log Locations

- `Microsoft-Windows-User Device Registration/Admin`
  - Event 102: Join request initialization
  - Event 105: Join response completion

## Source

- OneNote: Mooncake POD Support Notebook > Windows 10 hybrid Azure AD join
