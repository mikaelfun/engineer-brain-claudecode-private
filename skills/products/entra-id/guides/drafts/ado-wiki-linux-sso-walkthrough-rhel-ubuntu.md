---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Walk-Through - RHEL + Walk-Through - Ubuntu"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FWalk-Through%20-%20RHEL"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Linux Enterprise SSO Walk-Through (RHEL & Ubuntu)

## RHEL/Fedora Setup

### Install Edge & Intune Portal

```bash
# install edge repos
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo dnf config-manager --add-repo https://packages.microsoft.com/yumrepos/edge
sudo mv /etc/yum.repos.d/packages.microsoft.com_yumrepos_edge.repo /etc/yum.repos.d/microsoft-edge.repo

# Update Package Cache
dnf check-update

# install edge
sudo dnf install microsoft-edge

# install packages
curl -O -sSL https://packages.microsoft.com/config/rhel/9/packages-microsoft-prod.rpm
sudo dnf install ./packages-microsoft-prod.rpm

# install intune portal
sudo dnf install intune-portal
```

### RHEL Compliance: Password Complexity (pam_pwquality)

Ensure the following line is in `/etc/pam.d/password-auth`:

```
password    required    pam_pwquality.so retry=3 dcredit=-1 ocredit=-1 ucredit=-1 lcredit=-1 minlen=12
```

> For more info: [RHEL Security Guide - Forcing Strong Passwords](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/security_guide/chap-hardening_your_system_with_tools_and_services)

---

## Ubuntu/Debian Setup

### Install Edge & Intune Portal

```bash
sudo apt update
sudo apt-get dist-upgrade
sudo apt install curl

# Install Microsoft's public key
curl -sSl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc

# Install the standard focal production repo
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list | sudo tee /etc/apt/sources.list.d/microsoft-ubuntu-focal-prod.list

# Install Edge's repo
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge-dev.list'

sudo apt update
sudo apt install microsoft-edge
sudo apt install intune-portal
```

### Ubuntu Compliance: Password Complexity (pam_pwquality)

```bash
sudo apt install libpam-pwquality

# Check/update /etc/pam.d/common-password:
password    requisite    pam_pwquality.so retry=3 minlen=12 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1
```

### Ubuntu Compliance: Disk Encryption

When creating a new VM/image, select "Advanced Features" during setup:
1. Select "Use LVM with the new Ubuntu Installation"
2. Select "Encrypt the new Ubuntu installation for Security"
3. Enter security key

> Note: Drive Encryption compliance evaluation is still being refined.

---

## Enrollment Flow (Both Platforms)

1. Launch Intune Portal, select Sign-in
2. Enter username and credentials
3. User is prompted to register device with Entra
4. After registration, user is prompted to enroll in management
5. Compliance check runs
6. If compliant: success screen; if not: non-compliance details shown

## SSO Verification

1. Launch Edge
2. Username auto-populated in sign-in dialog
3. Broker dialog appears (SSO via identity broker)
4. Verify Edge profile shows signed-in state
5. Access Teams/M365 resources with SSO
