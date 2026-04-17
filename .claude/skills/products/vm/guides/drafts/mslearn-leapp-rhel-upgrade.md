# RHEL Leapp In-Place Upgrade for Azure PAYG VMs

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/leapp-upgrade-process-rhel-7-and-8

## Supported Upgrade Paths

| Source | Target | Notes |
|--------|--------|-------|
| RHEL 7.9 | RHEL 8.8 (EUS) / 8.10 | 8.10 is default |
| RHEL 8.10 | RHEL 9.4 (EUS) / 9.6 (EUS) | |
| RHEL 9.7 | RHEL 10.1 | |

## Prerequisites
- Backup VM or snapshot OS disk
- 2-5 GB free in `/var/lib/leapp`
- Serial Console access
- Root privileges
- Disable antivirus and config management (Puppet/Salt/Chef/Ansible)

## RHEL 7.9 -> 8.x

```bash
sudo yum versionlock clear
sudo yum-config-manager --enable rhui-microsoft-azure-rhel7
sudo yum -y install rhui-azure-rhel7
sudo yum-config-manager --enable rhui-rhel-7-server-rhui-extras-rpms
sudo yum -y install leapp-rhui-azure
sudo yum install leapp-upgrade
sudo yum update && sudo reboot

# Pre-upgrade check
sudo leapp preupgrade --target 8.10 --no-rhsm

# Review /var/log/leapp/leapp-report.txt, fix inhibitors

# Upgrade (run via Serial Console!)
sudo leapp upgrade --target 8.10 --no-rhsm --reboot
```

## RHEL 8.x -> 9.x

```bash
sudo dnf versionlock clear
sudo dnf config-manager --set-enabled rhui-microsoft-azure-rhel8
sudo dnf -y install rhui-azure-rhel8 leapp-rhui-azure
sudo dnf install leapp-upgrade
sudo dnf update && sudo reboot

# RHEL 9 requires: migrate network-scripts to NetworkManager dispatcher

sudo leapp preupgrade --target 9.4 --no-rhsm
sudo leapp upgrade --target 9.4 --no-rhsm --reboot
```

## Post-Upgrade Tasks
1. Clear Leapp exclude list: `sudo dnf config-manager --save --setopt exclude=''`
2. Remove old RHEL packages: `rpm -qa | grep '\.el[67]'` then `dnf remove`
3. Remove old kernels from bootloader
4. Remove Leapp dependency packages

## Key Notes
- RHUI is for PAYG only; BYOS needs RHSM/Satellite
- In-place upgrade disconnects control plane (no auto-patching, Azure Update Manager)
- Always run leapp upgrade via Serial Console
- Troubleshoot inhibitors: see mslearn-rhel-upgrade-troubleshooting.md
