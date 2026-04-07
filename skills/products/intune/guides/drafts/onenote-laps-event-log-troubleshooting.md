# Windows LAPS with Azure AD - Event Log Troubleshooting Guide

## Support Boundaries
- LAPS configured via GPO to backup to Windows AD or Azure AD: Windows DS team
- LAPS configured via Intune to backup to Azure AD: Intune team (partial)
- Reference: Intune Workflow: Support Boundaries for Windows LAPS with Azure AD

## Key Event IDs (Event Viewer > Applications and Services > Microsoft > Windows > LAPS > Operational)

| Event ID | Level | Meaning |
|----------|-------|---------|
| 10004 | Info | Password processing succeeded (stable state) |
| 10010 | Info | Backup location confirmed (Azure AD) |
| 10015 | Info | Password update required (local state inconsistent) |
| 10020 | Info | Local admin password updated successfully |
| 10022 | Info | Policy configuration read (shows source: CSP/GPO, backup dir, account name, password settings) |
| 10025 | Error | Azure tenant discovery failed (check DNS to enterpriseregistration.windows.net) |
| 10028 | Error | Failed to update Azure AD with password (0x80070190) |
| 10029 | Info | Password successfully backed up to Azure AD |
| 10030 | Info | Tenant discovery success / lapsdevicepasswordupdate notification |
| 10032 | Error | Failed to authenticate to Azure using device identity |
| 10058 | Warning | PasswordAgeDays below Azure AD minimum (7); auto-adjusted |
| 10059 | Error | Azure returned failure code (403=auth denied, 400=device missing) |

## Quick Connectivity Check
```cmd
curl https://enterpriseregistration.windows.net/ -D -
Reset-LapsPassword -Verbose -Debug
```

## ASC Troubleshooting
- **Audit Logs**: Filter Service=Device Registration Service, Category=Device
- **Activities**: Reveal local administrator password, Update local administrator password
- **Device Policy**: Settings blade > Devices > LAPS policy setting
- **Local Administrator Password tab**: Lists all LAPS-backed-up devices with backup dates

## Common Error Codes
- **0x80072EE7**: DNS resolution failure for enterpriseregistration.windows.net
- **HTTP 403**: authorization_error - tenant policy not enabled
- **HTTP 400**: error_missing_device - device object not in Azure AD
- **0x80070190**: Thread background processing mode error
