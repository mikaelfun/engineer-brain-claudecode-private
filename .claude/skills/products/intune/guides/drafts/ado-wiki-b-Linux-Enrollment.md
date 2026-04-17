---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Enroll Device/Linux"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEnroll%20Device%2FLinux"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Linux Enrollment in Intune

**Supported tenants: Commercial only.**

## Architecture Overview

| Old Model (Java Broker, <2.0.2) | New Model (C++ Broker, >=2.0.2) |
| -- | -- |
| Java-based authentication broker | C++ Identity Broker |
| Entra Registration | Entra Join |
| Token loosely tied to user | Token bound to device |
| Password / Auth App only | Certificate-based authentication possible |
| No proxy support | OS-based proxy support |

## Prerequisites

- Microsoft Edge 102.x or later
- Intune App (`intune-portal`)
- Supported Ubuntu Linux distribution (GNOME desktop required — CLI-only not supported)

## Features (GA)

- Compliance Policies: password complexity, allowed distro version, custom compliance via script, disk encryption
- Device Inventory / Reporting
- Conditional Access via Microsoft Edge to Office 365 web apps
- Enrollment type: **Corporate only** (BYOD not supported)

## Conditions That Will NOT Work

- Using Firefox/Chrome/Safari (must use Microsoft Edge)
- CA Policy enabled but not using Edge
- Hardware binding (TPM/HSM) — not currently supported
- WSL — not currently supported

---

## Installing Intune on Ubuntu

```bash
# Install prerequisites
sudo apt install curl gpg

# Add Microsoft package signing key
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/
sudo sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/ubuntu/20.04/prod focal main" > /etc/apt/sources.list.d/microsoft-ubuntu-focal-prod.list'
sudo rm microsoft.gpg

# Install
sudo apt update
sudo apt install intune-portal
```

Reboot recommended after installation.

## Uninstalling / Resetting

**Via Company Portal UI**: Context Menu → Remove Device

**Manual removal:**
```bash
sudo systemctl stop microsoft-identity-device-broker
systemctl --user stop microsoft-identity-broker

sudo systemctl clean --what=configuration --what=runtime --what=state microsoft-identity-device-broker
systemctl --user clean --what=state --what=configuration --what=runtime microsoft-identity-broker
rm -r ~/.config/intune

sudo apt remove intune-portal microsoft-edge-stable
sudo apt autoremove
```

**Remove secrets only (identity broker 2.0.2+):**
```bash
dsreg --cleanup
```
(Does not clean server-side entries)

---

## Scoping Questions

**Enrollment phase:**
- Linux OS version?
- Intune-portal version? Supported?
- Identity broker version?
- Are broker services running?

**CA/Compliance related:**
- Intune device ID? Entra device ID? (check `~/.config/intune/registration.xml`)
- Compliance policy ID?
- Which browser? Which service?
- Compliant state in Intune app vs. portal vs. Entra ID?
- Sign-in error code?

---

## General Troubleshooting Commands

```bash
# Check for updates
sudo apt update

# Check device IDs
cd $HOME/.config/intune/ && cat registration.toml

# Refresh Intune Agent
systemctl --user start intune-agent.service

# Get hostname and OS
hostnamectl | grep hostname && hostnamectl | grep Operating

# Check disk encryption
sudo dmsetup status

# Check installed Microsoft apps and versions
dpkg --list | grep microsoft
dpkg --list | grep Intune
apt-cache policy microsoft-identity-broker
apt-cache policy msalsdk-dbusclient
```

---

## Disk Encryption

- All writable local file systems must be encrypted
- Ignored: read-only, pseudo filesystems (/proc, /sys), /boot/efi
- Supported: dm-crypt subsystem (LUKS recommended)
- Best practice: configure encryption **during OS install**

### Check encryption:
```bash
sudo dmsetup status
```

---

## Password Policy

Intune checks `pam_pwquality` configuration:

```bash
sudo apt install libpam-pwquality
```

Required line in `/etc/pam.d/common-password`:
```
password requisite pam_pwquality.so retry=3 dcredit=-1 ocredit=-1 ucredit=-1 lcredit=-1 minlen=12
```

To edit:
```bash
sudo nano /etc/pam.d/common-password
```

---

## Log Collection

**Collect identity broker logs:**
```bash
journalctl --user -f -u microsoft-identity-broker.service --since today
journalctl --system -f -u microsoft-identity-device-broker.service --since today
```

**Collect Edge logs:**
```bash
/opt/microsoft/msedge/./msedge --enable-logging -v=1 --oneauth-log-level=5 --oneauth-log-pii
```

**Enable debug mode and collect:**
```bash
cd /opt/microsoft/intune/bin
INTUNE_LOG_LEVEL=debug ./intune-portal
```

**Collect PowerLift logs (Ubuntu 20.04):**
```bash
sudo apt-get install microsoft-identity-diagnostics
sudo /opt/microsoft/microsoft-identity-diagnostics/scripts/collect_logs
```

**Collect PowerLift logs (Ubuntu 22.04):**
```bash
cd $HOME/Downloads/
wget https://packages.microsoft.com/ubuntu/20.04/prod/pool/main/m/microsoft-identity-diagnostics/microsoft-identity-diagnostics_1.1.0_amd64.deb
chmod +x microsoft-identity-diagnostics_1.1.0_amd64.deb
sudo apt install ./microsoft-identity-diagnostics_1.1.0_amd64.deb
sudo /opt/microsoft/microsoft-identity-diagnostics/scripts/collect_logs
```

---

## Known Issues / FAQ

### Error 2400 — "Something went wrong" during initial enrollment
**Root Cause**: JavaBroker takes 5-10 minutes to start after new install or reboot.  
**Workaround**: Wait 5-10 minutes and retry.

### Error 1001 — "An unexpected error has occurred" / SSPR
**Root Cause**: User in tenant with SSPR enabled, has never signed in before → redirected to mysignins to register auth methods.  
**Solution**: User opens browser → signs into Azure portal → registers SSPR auth methods → returns to Linux device → Intune-Portal registration succeeds.  
**Log indicator**: `ErrorCode:PasswordResetRegistrationRequiredInterrupt ErrorNo:50125`

### Error 530003 / "Access Denied" page
**Causes**:
- Not using Microsoft Edge
- CA Policy enabled but using Firefox/Chrome/Safari
- Edge Dev build older than 100.x
- Device not enrolled or not compliant

### "Are you trying to sign in to Microsoft Authentication Broker?"
**Root Cause**: Known issue — AAD server code not recognizing Linux Broker as known agent. Displays "speedbump" for transparency.  
**Status**: Will be fixed in future release when server libraries updated to recognize platform from user agent.

### Device shows compliant but can't access resources
**Checklist**:
1. Visit https://aka.ms/CPWeb — verify device is compliant (10-20 min delay)
2. Check `/etc/pam.d/common-password` — file may have reset, re-add `pam_pwquality` line
3. Re-sign into Intune Portal → wait 10-20 min for re-push

### Root access required for scripts
Modify `/usr/share/polkit-1/actions/com.microsoft.intune.policy` — set `allow_active` to `yes`.  
**Warning**: May impact device security.

### Scripts requiring `sudo` will fail
Discovery scripts run in user context — cannot check System-level settings requiring elevation.

### BYOD not available
All Linux enrollments are Corporate-owned. Admin must manually change ownership to Personal if needed.

---

## Support Boundaries

- Intune owns: enrollment, compliance policy, Intune Agent issues
- Collaborate with AAD Auth for: device identity, identity broker, Conditional Access issues
- Intune Agent failures → ICM to Intune PG (use LINUX-SPECIFIC ICM TEMPLATE: https://microsoft.sharepoint.com/teams/IntuneCRI/SitePages/CRI-Templates-v2.aspx)

**SME Channel**: https://teams.microsoft.com/l/channel/19%3af7998410bdd147438b33fadc3dc9c3d4%40thread.skype/LinuxMDM  
**Email**: IntuneLinuxSME@microsoft.com

---

## Additional Resources

- Internal eng docs: https://eng.ms/docs/microsoft-security/management/intune/microsoft-intune/intune/archive/intunewiki/docs/linuxmdm
- Public docs: https://learn.microsoft.com/en-us/mem/intune/user-help/enroll-device-linux
- [Identity wiki (AAD)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/712901/Enterprise-SSO-for-Linux-Desktops)
