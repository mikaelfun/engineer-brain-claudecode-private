---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Troubleshooting/Get Device Id"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Linux%20Devices/Enterprise%20SSO%20for%20Linux%20Desktops/Troubleshooting/Get%20Device%20Id"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Linux Enterprise SSO - Query Device ID

```bash
cat .config/intune/registration.toml
```

Output:
```
account_hint = '{GUID}'
device_hint = '{GUID}'
aad_device_hint = '{GUID}'
needs_patching = 'false'
```

- **aad_device_hint** — This is the Device ID from Azure DRS.
