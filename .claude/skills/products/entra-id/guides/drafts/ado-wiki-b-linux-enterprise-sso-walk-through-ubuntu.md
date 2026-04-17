---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Walk-Through - Ubuntu"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FWalk-Through%20-%20Ubuntu"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Walk-Through: Enterprise SSO on Ubuntu

Reference recording: [2209 - Linux desktop management GA Release](https://aka.ms/AAi4ix2)

## Step 1: Install Edge & Intune Portal

```bash
# Update package metadata
sudo apt update
sudo apt-get dist-upgrade

# Install Curl
sudo apt install curl

# Add Microsoft public key
curl -sSl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc

# Add Microsoft production repo (Ubuntu 20.04)
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list | sudo tee /etc/apt/sources.list.d/microsoft-ubuntu-focal-prod.list

# Add Edge stable repo
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge-dev.list'

sudo apt update

# Install Edge
sudo apt install microsoft-edge

# Install Intune Portal
sudo apt install intune-portal
```

## Step 2: Compliance Pre-Req — Configure Password Strength

Intune checks `pam_pwquality`. Install and configure:

```bash
sudo apt install libpam-pwquality
```

Ensure `/etc/pam.d/common-password` contains:

```
password    requisite    pam_pwquality.so retry=3 minlen=12 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1
```

To edit:
```bash
sudo nano /etc/pam.d/common-password
```
Save with Ctrl+O, Ctrl+X.

## Step 3: Compliance Pre-Req — Disk Encryption

Configure during Ubuntu installation:
1. Select **Advanced Features**
2. Choose **Use LVM with the new Ubuntu Installation**
3. Select **Encrypt the new Ubuntu installation for Security**
4. Enter and confirm security key

> StackOverflow reference: [Disk Encryption on Ubuntu](https://stackoverflow.microsoft.com/questions/287059)

## Step 4: Launch Intune Portal & Sign In

1. Launch the Intune Portal application and select **Sign In**
2. Enter username (UPN) and credentials (MFA if required)
3. When prompted to **Register your machine**, accept
4. After Entra registration, accept **Enroll in management** prompt
5. Wait for enrollment and compliance check to complete

**Compliance result:**
- ✅ Compliant: green status shown
- ❌ Non-compliant: address Password Complexity / Disk Encryption issues

## Step 5: Launch Edge & Verify SSO

1. Launch Microsoft Edge
2. Username should auto-populate in sign-in dialog
3. Broker dialog pops for authentication approval
4. Verify profile shows as logged in
5. Access Teams or other M365 resources via Edge to confirm SSO works

## Verify Registration Status

```bash
cat ~/.config/intune/registration.toml
```

- `account_hint` present → signed into Intune
- `aad_device_hint` present → registered with Entra ID
- `device_hint` present → enrolled in Intune MDM
