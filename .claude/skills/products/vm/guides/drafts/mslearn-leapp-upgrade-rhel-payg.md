# Leapp Upgrade for RHEL PAYG VMs (7→8, 8→9, 9→10)

> Source: [MS Learn - Leapp upgrade process RHEL 7 and 8](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/leapp-upgrade-process-rhel-7-and-8)

## Supported Upgrade Paths

| Source | Target | EOS |
|--------|--------|-----|
| RHEL 7.9 | 8.8 (EUS), 8.10 | May 2025 / Jun 2028 |
| RHEL 8.10 | 9.4 (EUS), 9.6 (EUS) | Apr 2026 / Apr 2027 |
| RHEL 9.7 | 10.1 | TBD |

## Caution
In-place upgrade causes data/control plane disconnect. Auto guest patching, auto OS image upgrades, hotpatching, Azure Update Manager will NOT work after upgrade. Recommend creating new VM instead.

## Prerequisites
- Backup VM or snapshot OS disk
- 2-5 GB free in /var/lib/leapp
- Serial Console access
- Root privileges
- Remove version lock: `yum versionlock clear` / `dnf versionlock clear`

## Pre-upgrade Steps (RHEL 7→8)
```bash
sudo yum-config-manager --enable rhui-microsoft-azure-rhel7
sudo yum -y install rhui-azure-rhel7
sudo yum-config-manager --enable rhui-rhel-7-server-rhui-extras-rpms
sudo yum -y install leapp-rhui-azure
sudo yum install leapp-upgrade
sudo yum update && sudo reboot
```

## Pre-upgrade Steps (RHEL 8→9)
```bash
sudo dnf config-manager --set-enabled rhui-microsoft-azure-rhel8
sudo dnf -y install rhui-azure-rhel8 leapp-rhui-azure
sudo dnf install leapp-upgrade
sudo dnf update && sudo reboot
```
Note: RHEL 9 dropped legacy network-scripts. Migrate to NetworkManager dispatcher scripts before upgrade.

## Leapp Pre-upgrade
```bash
sudo leapp preupgrade --target <version> --no-rhsm
```
Review /var/log/leapp/leapp-report.txt. Resolve all inhibitors before proceeding.

## Leapp Upgrade (via Serial Console!)
```bash
sudo leapp upgrade --target <version> --no-rhsm [--reboot]
```
If no --reboot, manually reboot when prompted.

## Post-upgrade Tasks
1. Clear exclude list: `dnf config-manager --save --setopt exclude=''`
2. Remove old packages: `rpm -qa | grep '\.el[67]' | grep -vE 'gpg-pubkey|libmodulemd'`
3. Remove weak modules from old kernel
4. Remove old kernel from bootloader
5. Remove leapp deps: `yum remove leapp-deps-el8 leapp-repository-deps-el8`

## Troubleshooting
See: [Troubleshoot Red Hat OS upgrade issues](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-red-hat-os-upgrade-issues)
