---
title: RHEL In-Place Upgrade Using Leapp on Azure PAYG VMs
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/leapp-upgrade-process-rhel-7-and-8
product: vm
tags: [RHEL, Leapp, upgrade, RHUI, PAYG, in-place-upgrade]
21vApplicable: false
21vNote: RHUI repository names and endpoints differ in Mooncake. leapp-rhui-azure package may not be available.
---

# RHEL In-Place Upgrade Using Leapp (PAYG VMs)

## Caution
In-place upgrade disconnects data plane from control plane. Azure features (auto guest patching, auto OS image upgrades, hotpatching, Azure Update Manager) will NOT be available after upgrade.

## Supported Paths
| Source | Target |
|--------|--------|
| RHEL 7.9 | RHEL 8.8 (EUS), 8.10 |
| RHEL 8.10 | RHEL 9.4, 9.6 |
| RHEL 9.7 | RHEL 10.1 |

## Prerequisites
- Backup VM or snapshot OS disk
- 2-5 GB free in /var/lib/leapp
- Serial Console access
- Root privileges

## Process
1. Prepare: Enable RHUI repos, install leapp-rhui-azure, update packages, reboot
2. Pre-upgrade: leapp preupgrade --target {ver} --no-rhsm
3. Review: Check /var/log/leapp/leapp-report.txt, resolve inhibitors
4. Upgrade via Serial Console: leapp upgrade --target {ver} --no-rhsm
5. Reboot when prompted
6. Verify: /etc/redhat-release, kernel, dnf repolist
7. Post-upgrade: Clean exclude list, remove old packages/kernels

## Notes
- RHUI is for PAYG only; BYOS must use RHSM/Satellite
- Run leapp upgrade through Serial Console (avoid SSH disruption)
- Disable antivirus and config management before upgrade
- RHEL 9: Migrate network-scripts to NetworkManager dispatcher scripts
