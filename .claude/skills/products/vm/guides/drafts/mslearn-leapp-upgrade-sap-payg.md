# Leapp Upgrade for SAP HANA/APPS PAYG VMs

> Sources:
> - [RHEL 7.9→8.x SAP](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/leapp-upgrade-rhel7dot9-to-8dotx-saphana-sapapps)
> - [RHEL 8.x→9.x SAP](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/leapp-upgrade-rhel-8dotx-to-9dotx-saphana-sapapps)

## SAP-HANA Upgrade Paths

| Source | Target | Channel |
|--------|--------|---------|
| RHEL 7.9 | 8.8 | e4s |
| RHEL 7.9 | 8.10 | (none - final release) |
| RHEL 8.10 | 9.4 | e4s |
| RHEL 8.10 | 9.6 | e4s |

## SAP-APPS Upgrade Paths

| Source | Target | Channel |
|--------|--------|---------|
| RHEL 7.9 | 8.8 | eus |
| RHEL 7.9 | 8.10 | (none) |
| RHEL 8.10 | 9.4 | eus |
| RHEL 8.10 | 9.6 | eus |

## Key Differences from Standard RHEL Upgrade
- Install `leapp-rhui-azure-sap` (not `leapp-rhui-azure`)
- Stop SAP HANA/SAP processes but keep filesystems mounted
- Disable automatic SAP start at boot
- SAP HANA: adjust kernel.sem in /etc/sysctl.d/sap.conf (remove RHEL 7 value, RHEL 8 default is higher)
- SAP HANA HA cluster: must destroy and recreate cluster after upgrade (rolling upgrade not supported for major RHEL releases)
- Verify SAP compatibility with target RHEL version (SAP Note 2369910)

## Leapp Commands (SAP)
```bash
# SAP-HANA (e4s channel)
sudo leapp preupgrade --target <version> --channel e4s --no-rhsm
sudo leapp upgrade --target <version> --channel e4s --no-rhsm

# SAP-APPS (eus channel)
sudo leapp preupgrade --target <version> --channel eus --no-rhsm
sudo leapp upgrade --target <version> --channel eus --no-rhsm

# Exception: target 8.10 (final release, no channel)
sudo leapp preupgrade --target 8.10 --no-rhsm
```

## Post-configuration SAP HANA
After upgrade, configure system per applicable SAP notes for target RHEL version.
SAP Note 2772999: vm.max_map_count=2147483647, kernel.pid_max=4194304

## Minor Version Upgrades (Pre-Leapp)
- [RHEL 7.x→7.9 SAP](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/upgrade-rhel-7dotx-to-7dot9-sap-hana-apps): Remove RHUI E4S package, remove version lock, install rhui-azure-rhel7-base-sap-ha, yum update
- [RHEL 8.x→8.10 SAP](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/upgrade-rhel-8-dot-x-to-8-dot-10-on-sap-hana-apps): Remove RHUI E4S package, remove version lock, install rhui-azure-rhel8-base-sap-ha, dnf update
