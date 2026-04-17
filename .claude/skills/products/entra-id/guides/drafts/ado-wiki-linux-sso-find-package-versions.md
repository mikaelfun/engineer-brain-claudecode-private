---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Troubleshooting/Find Packages Versions Installed"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Linux%20Devices/Enterprise%20SSO%20for%20Linux%20Desktops/Troubleshooting/Find%20Packages%20Versions%20Installed"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Linux Enterprise SSO - Find Package Versions Installed

## Ubuntu/Debian

```bash
apt list -a [package name]

# Run for all apps
apt list -a intune-portal microsoft-edge-stable microsoft-identity-broker
```

## RedHat/Fedora

```bash
# Run for all apps
sudo dnf info microsoft-identity-broker intune-portal

# Run for a specific app
sudo dnf info microsoft-identity-broker
sudo dnf info intune-portal
sudo dnf info microsoft-edge-dev
sudo dnf info microsoft-edge-beta
sudo dnf info microsoft-edge
```

Reference: [DNF Package Manager](https://www.man7.org/linux/man-pages/man8/dnf.8.html)
