# macOS Intune Log Collection Guide

## Source
- OneNote: Mooncake POD Support Notebook > Intune > MISC > Collect Intune logs from macOS device
- Reference: https://cloudinfra.net/how-to-collect-intune-logs-from-macos-device/
- Internal: https://eng.ms/docs/microsoft-security/management/intune/microsoft-intune/intune/scenarios/macsidecar/tsgs

## Key Log File Locations

| Path | Content |
|------|---------|
| `/Library/Logs/Microsoft/Intune/IntuneMDMDaemon*.log` | MDM daemon logs (enrollment, policy sync, compliance) |
| `~/Library/Logs/Company Portal/com.microsoft.CompanyPortalMac*.log` | Company Portal app logs |
| `/private/var/log/install.log` | Package installation logs |
| `/var/log/install.log` | System install log (symlink) |

## Console Log Collection Commands

Use `>>` operator to capture output to file. Each command should output to its own file:

```bash
# Download/content delivery logs (last 7 days)
log show --style syslog --info --debug --predicate 'process CONTAINS[c] "downloadd"' --last 7d >> ~/Documents/downloadd.log

# Uber agent logs (last 4 days)
log show --style syslog --info --debug --predicate 'eventMessage CONTAINS[c] "uber"' --last 4d >> ~/Documents/uber.log

# All Intune + MDM process logs
log show --style syslog --info --debug --predicate 'process BEGINSWITH "Intune" || process CONTAINS[c] "downloadd" || process CONTAINS "mdm"' >> ~/Documents/intune-mdm.log

# MDM client logs (last 30 days)
log show --last 30d --predicate 'process == "mdmclient" OR subsystem == "com.apple.ManagedClient" OR processImagePath contains "mdmclient"' >> ~/Documents/mdmclient.log

# App Store download logs (last 30 days)
log show --last 30d --predicate 'processImagePath contains "storedownloadd" OR processImagePath contains "appstored"' >> ~/Documents/appstore.log
```

## Usage Tips

- Always collect **IntuneMDMDaemon** logs first - they cover most enrollment and policy issues
- For app deployment issues, combine **Company Portal** logs with **storedownloadd** logs
- For VPP/managed app issues, the **appstored** predicate is essential
- Console log commands can take several minutes to complete on 30-day ranges
