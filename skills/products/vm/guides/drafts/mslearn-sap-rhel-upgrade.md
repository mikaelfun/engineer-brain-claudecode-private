# SAP HANA/APPS RHEL Upgrade for Azure PAYG VMs

> Sources:
> - https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/leapp-upgrade-rhel7dot9-to-8dotx-saphana-sapapps
> - https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/leapp-upgrade-rhel-8dotx-to-9dotx-saphana-sapapps
> - https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/upgrade-rhel-7dotx-to-7dot9-sap-hana-apps
> - https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/upgrade-rhel-8-dot-x-to-8-dot-10-on-sap-hana-apps

## Upgrade Path Matrix

### Minor Version Upgrades (yum/dnf update)
| Source | Target | Image Type |
|--------|--------|-----------|
| RHEL 7.x | 7.9 | SAP-HANA / SAP-APPS PAYG |
| RHEL 8.x | 8.10 | SAP-HANA / SAP-APPS PAYG |

### Major Version Upgrades (Leapp)
| Source | Target | Channel | Image Type |
|--------|--------|---------|-----------|
| RHEL 7.9 | 8.8 | e4s (HANA) / eus (APPS) | SAP-HANA / SAP-APPS |
| RHEL 7.9 | 8.10 | none | SAP-HANA / SAP-APPS |
| RHEL 8.10 | 9.4 | e4s (HANA) / eus (APPS) | SAP-HANA / SAP-APPS |
| RHEL 8.10 | 9.6 | e4s (HANA) / eus (APPS) | SAP-HANA / SAP-APPS |

## Key Differences from Standard RHEL Upgrade

### SAP-HANA Specific
- **Stop SAP HANA but keep filesystems mounted** (needed for version detection)
- Disable automatic SAP process startup before reboot
- `leapp-rhui-azure-sap` package instead of `leapp-rhui-azure`
- SAP HANA kernel settings: keep `/etc/sysctl.conf` unchanged, remove `kernel.sem` from `/etc/sysctl.d/sap.conf` (RHEL 8 default is higher)
- For RHEL 8.10→9.x: set `vm.max_map_count=2147483647` and `kernel.pid_max=4194304` in `/etc/sysctl.d/sap.conf`
- HA cluster: must destroy cluster before upgrade, re-create after

### SAP-APPS Specific
- Stop all SAP/application processes
- Same `leapp-rhui-azure-sap` package
- EUS channel instead of E4S

## 7.x -> 7.9 (Minor Upgrade)

### SAP-HANA PAYG
```bash
sudo yum remove $(rpm -qa | grep -i rhui)
sudo rm /etc/yum/vars/releasever
sudo tee rhel7-base-sap-ha.config > /dev/null <<< $'[rhui-microsoft-azure-rhel7-base-sap-ha]\nname=Microsoft Azure RPMs for Red Hat Enterprise Linux 7 (rhel7-base-sap-ha)\nbaseurl=https://rhui4-1.microsoft.com/pulp/repos/unprotected/microsoft-azure-rhel7-base-sap-ha\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc\nsslverify=1'
sudo yum --config rhel7-base-sap-ha.config install rhui-azure-rhel7-base-sap-ha
sudo yum repolist
sudo yum update && sudo reboot
```

### SAP-APPS PAYG
```bash
sudo yum remove $(rpm -qa | grep -i rhui)
sudo rm /etc/yum/vars/releasever
sudo tee rhel7-base-sap-apps.config > /dev/null <<< $'[rhui-microsoft-azure-rhel7-base-sap-apps]\nname=Microsoft Azure RPMs for Red Hat Enterprise Linux 7 (rhel7-base-sap-apps)\nbaseurl=https://rhui4-1.microsoft.com/pulp/repos/unprotected/microsoft-azure-rhel7-base-sap-apps\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc\nsslverify=1'
sudo yum --config rhel7-base-sap-apps.config install rhui-azure-rhel7-base-sap-apps
sudo yum repolist
sudo yum update && sudo reboot
```

## 8.x -> 8.10 (Minor Upgrade)

### SAP-HANA PAYG
```bash
sudo dnf remove $(rpm -qa | grep -i rhui)
sudo rm /etc/yum/vars/releasever
sudo tee rhel8-base-sap-ha.config > /dev/null <<< $'[rhui-microsoft-azure-rhel8-base-sap-ha]\nname=Microsoft Azure RPMs for Red Hat Enterprise Linux 8 (rhel8-base-sap-ha)\nbaseurl=https://rhui4-1.microsoft.com/pulp/repos/unprotected/microsoft-azure-rhel8-base-sap-ha\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc\nsslverify=1'
sudo dnf --config rhel8-base-sap-ha.config install rhui-azure-rhel8-base-sap-ha
sudo dnf repolist
sudo dnf update && sudo reboot
```

## 7.9 -> 8.x (Leapp Major Upgrade)

```bash
# SAP-HANA: install leapp-rhui-azure-sap, stop HANA (keep FS mounted)
sudo yum-config-manager --enable rhui-rhel-7-server-rhui-extras-rpms
sudo yum install leapp-rhui-azure-sap
sudo yum install leapp-upgrade
sudo yum update && sudo reboot

# Pre-upgrade (SAP-HANA uses e4s, SAP-APPS uses eus)
sudo leapp preupgrade --target 8.8 --channel e4s --no-rhsm   # HANA
sudo leapp preupgrade --target 8.10 --no-rhsm                # 8.10 (no channel)

# Upgrade via Serial Console
sudo leapp upgrade --target 8.8 --channel e4s --no-rhsm --reboot
```

## Post-Upgrade
1. Follow standard Leapp post-upgrade cleanup
2. SAP-HANA: configure system per SAP notes for new RHEL version
3. Verify repos match expected output for target version
