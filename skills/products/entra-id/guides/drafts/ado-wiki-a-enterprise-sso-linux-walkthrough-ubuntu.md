---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Walk-Through - Ubuntu"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FWalk-Through%20-%20Ubuntu"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Enterprise SSO for Linux Desktops — Walk-Through (Ubuntu/Debian)

> Video walk-through: [2209 - Linux desktop management GA Release](https://aka.ms/AAi4ix2)

---

## Step 1: Install Edge & Intune Portal

```bash
# Update package metadata
sudo apt update
sudo apt-get dist-upgrade

# Install Curl
sudo apt install curl

# Add Microsoft signing key
curl -sSl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc

# Add Microsoft focal production repo
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list | sudo tee /etc/apt/sources.list.d/microsoft-ubuntu-focal-prod.list

# Add Edge repo
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge-dev.list'

sudo apt update

# Install Edge and Intune Portal
sudo apt install microsoft-edge
sudo apt install intune-portal
```

---

## Step 2: Configure Compliance Policies (Pre-Requisites)

### Password Complexity (pam_pwquality)

```bash
sudo apt install libpam-pwquality

# Verify/edit /etc/pam.d/common-password:
sudo nano /etc/pam.d/common-password
```

Required line:
```
password    requisite    pam_pwquality.so retry=3 minlen=12 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1
```

Save: Ctrl+O → Enter → Ctrl+X

### Disk Encryption

During OS installation, select **Advanced Features** → **Use LVM with the new Ubuntu installation** → **Encrypt the new Ubuntu installation for Security**.

> Note (1/5/22): Disk Encryption policy evaluation is still being refined in the Microsoft Tenant.
> Reference: [StackOverflow article on Disk Encryption](https://stackoverflow.microsoft.com/questions/287059)

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
apt list -a intune-portal microsoft-edge-stable msft-identity-broker
```
