# Troubleshooting Red Hat OS Upgrade Issues (Leapp)

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-red-hat-os-upgrade-issues

## Overview
Common issues during RHEL major upgrades (7->8, 8->9) using the Leapp tool. Always check `/var/log/leapp/leapp-report.txt` for inhibitors before proceeding.

## Pre-Upgrade Recommendations
- Backup VM or snapshot OS disk
- 2-5 GB free in `/var/lib/leapp`
- Serial Console access configured
- RHEL 7 EOL: June 30, 2024 (consider ELS Add-On if staying on 7)

## Common Leapp Inhibitors and Fixes

### PAM module pam_pkcs11 not available in RHEL 8
- Remove: `sudo yum remove pam_pkcs11`
- Or: remove from PAM config files

### Deprecated NTP detected
- Migrate from ntpd to chronyd before upgrade

### Missing /etc/fstab entries
- Verify all mounted filesystems have entries in /etc/fstab

### Firewalld AllowZoneDrifting
- Set `AllowZoneDrifting=no` in `/etc/firewalld/firewalld.conf`

### GRUB core not on expected device
- Reinstall GRUB on correct device before upgrade

### Network-scripts deprecated (RHEL 8->9)
- Migrate to NetworkManager dispatcher scripts before upgrade

### Leapp upgrade hangs or fails during reboot
- Monitor via Serial Console
- Check `/var/log/leapp/leapp-upgrade.log`
- If stuck: boot previous kernel, review logs, fix issues, retry

### Package conflicts or dependency errors
- Run `yum/dnf update` to latest minor before Leapp
- Remove version locks: `yum versionlock clear`
- Remove EUS/E4S locks if applicable

## Key Troubleshooting Commands
```bash
# Check pre-upgrade report
cat /var/log/leapp/leapp-report.txt

# Check upgrade log
cat /var/log/leapp/leapp-upgrade.log

# Answer Leapp questions (auto-accept known inhibitors)
sudo leapp answer --section remove_pam_pkcs11_module_check.confirm=True

# List Leapp answers
cat /var/log/leapp/answerfile
```

## Post-Upgrade Issues
- If VM fails to boot after upgrade: boot previous kernel via GRUB menu
- If repos are broken: reinstall RHUI packages for target version
- If Azure extensions fail: reinstall waagent
