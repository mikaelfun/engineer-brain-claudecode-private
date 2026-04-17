---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Check if the Azure Arc agent downloaded extension binaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FAMA%20Linux%2FHow-To%2FAMA%20Linux%3A%20HT%3A%20Check%20if%20the%20Azure%20Arc%20agent%20downloaded%20extension%20binaries"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AMA Linux: Check if Azure Arc Agent Downloaded Extension Binaries

## Review Related Logs

Primary log file:
```
/var/lib/GuestConfig/ext_mgr_logs/gc_ext.log
```

### Download Sequence

1. **New extension identified and download begins**:
```
[DISPATCHER] [INFO] New extension 'AzureMonitorLinuxAgent' - Downloading and validating extension package
```
```
[Pull Client] [INFO] VM not in PrivateLink Downloading package from URI: https://<blob>.blob.core.windows.net/<guid>/<guid>_<version>.zip
```

2. **Unzipping binaries to disk**:
```
[Pull Client] [INFO] Unzipping extension package /var/lib/GuestConfig/downloads/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent<version>.zip to /var/lib/GuestConfig/downloads/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent<version> location.
```

3. **Package validation (signing)**:
```
[Pull Client] [INFO] Successfully downloaded extension signing files from https://oaasguestconfigeuss1.blob.core.windows.net/extensions/...
[PACKAGE_VALIDATOR] [INFO] Package: '/var/lib/GuestConfig/downloads/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent<version>' is valid.
[Pull Client] [INFO] Extension package validated.
```

## Common Errors
Check state.json for errors:
- Arc: `/var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-<version>/state.json`
- Troubleshooter: `amalogs-azurearc-<date-time>/<version>-extension_logs/state.json`
