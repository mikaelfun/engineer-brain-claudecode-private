---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Enterprise SSO for Linux Desktops

## Architecture Overview

Components:
- **Linux OS**: systemd, Secret Service (keyring), D-Bus, LSB/FHS
- **Microsoft Edge**: Only method of accessing CA-protected resources on Linux; integrates with broker
- **Microsoft Identity Broker**: Shared auth component (WPJ, login, MFA, SSO via D-Bus)
- **Intune Agent**: Portal UI (GTK+), background agent (systemd), uses broker for auth

Flow: CA policy → Edge → Broker (D-Bus) → Intune → compliance check → grant/deny

## Supported Platforms

| Component | Ubuntu 20.04 | Ubuntu 22.04 | RHEL 9.x | Fedora |
|-----------|-------------|-------------|----------|--------|
| Identity Diagnostics | ✅ | ✅ | ✅ | ✅ |
| Identity Broker | ✅ | ✅ | ✅ | ✅ |
| Intune Agent | ✅ | ✅ | ✅ | ✅ |

**Note**: Ubuntu 23.xx NOT officially supported (Java 11 compatibility issue)

## Installation (Ubuntu 22.04 example)

```bash
# 1. Install dependencies
sudo apt install curl gpg wget software-properties-common apt-transport-https

# 2. Install Microsoft package signing key
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/
sudo sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/ubuntu/22.04/prod jammy main" > /etc/apt/sources.list.d/microsoft-ubuntu-jammy-prod.list'

# 3. Install Edge
curl -sSl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc
sudo add-apt-repository "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main"
sudo apt update
sudo apt install microsoft-edge

# 4. Install Intune Agent (auto-installs broker + diagnostics)
sudo apt install intune-portal

# 5. Reboot, launch Intune app, sign in with UPN
```

## Removal

### Via Company Portal UI
Launch Intune Agent → Context Menu → Remove Device

### Via Command Line (Ubuntu)
```bash
sudo systemctl stop microsoft-identity-device-broker
systemctl --user stop microsoft-identity-broker
sudo systemctl clean --what=configuration --what=runtime --what=state microsoft-identity-device-broker
systemctl --user clean --what=state --what=configuration --what=runtime microsoft-identity-broker
rm -r ~/.config/intune
sudo apt remove intune-portal
sudo apt remove microsoft-edge-stable
sudo apt autoremove
```

### Verify Removal
Browse to https://aka.ms/cpweb → Devices → locate Linux device → Remove

## Upgrade

```bash
# Ubuntu
sudo apt update && sudo apt-get dist-upgrade

# RHEL
sudo dnf update
```

## Compliance Requirements

- **Password complexity**: pam_pwquality with minlen=12, ucredit=-1, lcredit=-1, dcredit=-1, ocredit=-1
- **Disk encryption**: dm-crypt (LUKS format preferred), set up during OS install
- **Compliance check interval**: ~1 hour automatic; manual via Intune app Refresh
