---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Troubleshooting/Edge Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FTroubleshooting%2FEdge%20Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Edge Troubleshooting — Linux Enterprise SSO

## Capture Detailed OneAuth Logs

``` bash
# Capturing detailed OneAuth logs
microsoft-edge-dev --enable-logging -v=1 --oneauth-log-level=5 --oneauth-log-pii
```

## Disable a Feature in Edge

``` bash
# Example: launch Edge with Profile Sync Service disabled (used to troubleshoot sync failures)
microsoft-edge-dev --disable-features=msEdgeSyncESR
```
