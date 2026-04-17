---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Troubleshooting/Edge Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Linux%20Devices/Enterprise%20SSO%20for%20Linux%20Desktops/Troubleshooting/Edge%20Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Linux Enterprise SSO - Edge Troubleshooting

## Capturing Detailed Edge Logs

```bash
# Capturing detailed OneAuth logs
microsoft-edge-dev --enable-logging -v=1 --oneauth-log-level=5 --oneauth-log-pii
```

## Disabling Features in Edge

Used for troubleshooting specific Edge features (e.g., Profile Sync issues):

```bash
# Launch Edge with Profile Sync Service disabled
microsoft-edge-dev --disable-features=msEdgeSyncESR
```
