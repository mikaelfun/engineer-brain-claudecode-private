---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Walk-Through - RHEL"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FWalk-Through%20-%20RHEL"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Enterprise SSO for Linux Desktops — Walk-Through (RHEL/Fedora)

> Video walk-through: [2209 - Linux desktop management GA Release](https://aka.ms/AAi4ix2)
> CA on Fedora/RHEL Equivalent video (internal)

---

## Step 1: Install Edge Repos & microsoft-edge-stable

```bash
# Import Microsoft signing key
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc

# Add Edge repo
sudo dnf config-manager --add-repo https://packages.microsoft.com/yumrepos/edge
sudo mv /etc/yum.repos.d/packages.microsoft.com_yumrepos_edge.repo /etc/yum.repos.d/microsoft-edge.repo

# Update Package Cache
dnf check-update

# Install Edge
sudo dnf install microsoft-edge

# Add Microsoft prod repo
curl -O -sSL https://packages.microsoft.com/config/rhel/9/packages-microsoft-prod.rpm
sudo dnf install ./packages-microsoft-prod.rpm

# Install Intune Portal
sudo dnf install intune-portal
```

---

## Step 2: Configure Compliance Policies (Pre-Requisites)

### Password Complexity (pam_pwquality)

Intune checks `pam_pwquality` for enforcement. Edit `/etc/pam.d/password-auth`:

```
password    required    pam_pwquality.so retry=3 dcredit=-1 ocredit=-1 ucredit=-1 lcredit=-1 minlen=12
```

> For full RHEL hardening reference: https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/security_guide/chap-hardening_your_system_with_tools_and_services

### Disk Encryption

If setting up a new VM: select **Advanced Options** → **Use LVM** → **Encrypt the installation for Security** during OS installation.

> Note (1/5/22): Disk Encryption policy evaluation is still being refined in the Microsoft Tenant.

---

## Step 3: Sign in to Intune Portal

1. Launch Intune Portal
2. Enter username
3. Enter credentials (MFA if required)
4. When prompted to register the machine — accept

---

## Step 4: Entra Registration + Intune Enrollment

1. After sign-in, user is prompted to register machine with Entra ID
2. User is prompted to enroll in Intune management
3. "Registering" process begins (enrollment)
4. Compliance check runs after enrollment

**Compliant result**: Device shows compliant status  
**Non-compliant result**: Device shows non-compliant with reason

---

## Step 5: Verify SSO with Microsoft Edge

1. Launch Edge
2. Username is auto-populated from broker
3. Broker dialog appears for authentication consent
4. Check Edge profile to confirm sign-in
5. Teams/M365 apps via Edge browser should now have SSO

---

## Verify Installation

```bash
sudo dnf info microsoft-identity-broker intune-portal microsoft-edge-dev
```
