---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Deployment/(LabSetup) Register Azure Ubuntu VM in Azure DRS/Setting up a CSS Dev Environment"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FDeployment%2F(LabSetup)%20Register%20Azure%20Ubuntu%20VM%20in%20Azure%20DRS%2FSetting%20up%20a%20CSS%20Dev%20Environment"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Setting up a CSS Dev Environment — Register Ubuntu VM in Azure DRS

> ⚠️ **IMPORTANT**: This is an internal lab setup guide. Server SKUs with desktop installed are **not officially supported** and will eventually be blocked. Only Ubuntu Desktop SKU is supported for device registration.

## Prerequisites

- Windows client with WSL (Windows Subsystem for Linux) + Ubuntu
- Azure subscription (AIRS-compatible)
- Access to Microsoft tenant self-host (for RHEL: request "Linux RHEL pilot" access package at https://myaccess.microsoft.com)

---

## Step 1: Prep Windows Client for Linux (WSL)

```command
# Install WSL via DISM (administrator cmd.exe)
Dism /Online /Enable-Feature /FeatureName:Microsoft-Windows-Subsystem-Linux /All
```

Then install Ubuntu from Windows Store. Launch `bash` and install Azure CLI:

```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

---

## Step 2: Deploy Ubuntu VM in Azure

1. Azure portal → Virtual Machines → Create → Azure virtual machine
2. Deploy **Ubuntu LTS** gallery image (Standard B2ms recommended for disk encryption support)
3. Authentication: SSH public key
4. Inbound ports: SSH (22) + RDP (3389)
5. Download the `.pem` file when prompted

---

## Step 3: Connect to VM via SSH

```bash
# From WSL bash shell:
cd /
sudo umount /mnt/c
sudo mount -t drvfs C: /mnt/c -o metadata
sudo chmod 400 /mnt/c/Users/{YOURLOCALPROFILE}/LinuxVMs/{vmname}/{vmname}_key.pem
sudo ssh -i /mnt/c/Users/{YOURLOCALPROFILE}/LinuxVMs/{vmname}/{vmname}_key.pem azureuser@{VM_IP}
```

---

## Step 4: Upgrade packages

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade
```

---

## Step 5: Install GNOME Desktop

```bash
# Ubuntu 22.04/20.04
sudo apt install ubuntu-desktop
```

Then restart: `sudo reboot`

---

## Step 6: Install XRDP (Remote Desktop)

```bash
sudo apt install xrdp -y
sudo systemctl enable xrdp
sudo systemctl start xrdp
# Set password for azureuser
sudo passwd azureuser
```

Connect via mstsc.exe using the VM IP and azureuser credentials.

---

## Step 7: Install Microsoft Package Signing Key

```bash
sudo apt install curl gpg
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/
```

---

## Step 8: Install Microsoft Edge

```bash
curl -sSl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc
sudo add-apt-repository "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main"
sudo apt update
sudo apt install microsoft-edge-stable
```

---

## Step 9: Configure Microsoft Package Repository

**Ubuntu 20.04:**
```bash
sudo sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/ubuntu/20.04/prod focal main" > /etc/apt/sources.list.d/microsoft-ubuntu-focal-prod.list'
```

**Ubuntu 22.04:**
```bash
sudo sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/ubuntu/22.04/prod jammy main" > /etc/apt/sources.list.d/microsoft-ubuntu-jammy-prod.list'
```

---

## Step 10: Install Intune Agent

```bash
sudo apt update
sudo apt install intune-portal
sudo reboot
```

---

## Step 11: Enroll in Intune via RDP

1. RDP to VM → Launch Edge
2. Enter keyring password when prompted
3. Launch Intune app → Sign in with Azure AD UPN → Register → Begin setup

---

## RHEL Setup Notes

For RHEL private preview:
1. Request "Linux RHEL pilot" access at https://myaccess.microsoft.com
2. Download RHEL from https://developers.redhat.com/products/rhel/download
3. Activate: `subscription-manager register --org=<ORG> --activationkey=<KEY>`

## Copying Files: Windows ↔ Linux

Use SFTP via WinSCP: https://ploegert.gitbook.io/til/os/virtualization/transfer-files-from-windows-to-ubuntu-vm
