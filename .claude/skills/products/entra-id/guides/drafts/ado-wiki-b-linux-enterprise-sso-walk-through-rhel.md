---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Walk-Through - RHEL"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FWalk-Through%20-%20RHEL"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Walk-Through: Enterprise SSO on RHEL/Fedora

Reference recordings:
- [2209 - Linux desktop management GA Release](https://aka.ms/AAi4ix2) — click **Login with your company account**, type `Microsoft` in Company Subdomain
- [CA on Fedora/RHEL Equivalent demo](https://microsoft-my.sharepoint-df.com/personal/jploegert_microsoft_com/Documents/Microsoft%20Teams%20Chat%20Files/2023-10-23--CA-On-Fedora.mp4)

## Step 1: Install Edge Repos & microsoft-edge-stable

```bash
# Import Microsoft GPG key
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc

# Add Edge repository
sudo dnf config-manager --add-repo https://packages.microsoft.com/yumrepos/edge
sudo mv /etc/yum.repos.d/packages.microsoft.com_yumrepos_edge.repo /etc/yum.repos.d/microsoft-edge.repo

# Update package cache
dnf check-update

# Install Edge
sudo dnf install microsoft-edge

# Install Microsoft package repo for Intune
curl -O -sSL https://packages.microsoft.com/config/rhel/9/packages-microsoft-prod.rpm
sudo dnf install ./packages-microsoft-prod.rpm

# Install Intune Portal
sudo dnf install intune-portal
```

## Step 2: Compliance Pre-Req — Configure Password Strength

Intune checks `pam_pwquality` configuration. Ensure `/etc/pam.d/password-auth` contains:

```
password    required    pam_pwquality.so retry=3 dcredit=-1 ocredit=-1 ucredit=-1 lcredit=-1 minlen=12
```

> For more info: [RHEL Security Guide - Forcing Strong Passwords](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/security_guide/chap-hardening_your_system_with_tools_and_services)

## Step 3: Compliance Pre-Req — Disk Encryption

Configure LVM disk encryption during OS installation (recommended to do before first use):
- Select **Advanced Options** during installation
- Choose **Use LVM** + **Encrypt** option

## Step 4: Launch Intune Portal & Sign In

1. Launch the Intune Portal application
2. Select **Sign In**
3. Enter your username (UPN)
4. Enter credentials (MFA if required)
5. When prompted to **Register your machine**, accept
6. After Entra registration, accept **Enroll in management** prompt
7. Enrollment triggers compliance check

**Compliance result:**
- ✅ Compliant: green status shown
- ❌ Non-compliant: compliance failure reason shown — address Password Complexity / Disk Encryption as needed

## Step 5: Launch Edge & Verify SSO

1. Launch Microsoft Edge
2. Username should auto-populate in sign-in dialog
3. Broker dialog will pop for authentication approval
4. Verify profile is logged in
5. Access Teams or other M365 apps via Edge to confirm SSO works

## Verify Registration Status

```bash
cat ~/.config/intune/registration.toml
```

- `account_hint` present → signed into Intune
- `aad_device_hint` present → registered with Entra ID
- `device_hint` present → enrolled in Intune MDM
