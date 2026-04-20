---
title: RHEL SAP HANA/APPS PAYG VM Upgrade from 7.9 to 8.x Using Leapp
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/leapp-upgrade-rhel7dot9-to-8dotx-saphana-sapapps
product: vm
tags: [RHEL, SAP-HANA, SAP-APPS, Leapp, upgrade, E4S, EUS, PAYG, RHEL7]
21vApplicable: false
21vNote: RHUI endpoints and leapp-rhui-azure-sap package differ in Mooncake.
---

# RHEL SAP HANA/APPS 7.9 to 8.x Upgrade (PAYG)

## Supported Paths
| Config | Source | Target |
|--------|--------|--------|
| SAP HANA | RHEL 7.9 | RHEL 8.8 (default), 8.10 |
| SAP NetWeaver/Apps | RHEL 7.9 | RHEL 8.8, 8.10 (default) |

## SAP HANA Specifics
- Must first upgrade to RHEL 7.9 if running earlier version
- Stop SAP HANA, keep file systems mounted
- Remove kernel.sem line from /etc/sysctl.d/sap.conf (RHEL 8 default is higher)
- HA cluster: Must destroy existing cluster, recreate after upgrade
- RHEL 8.8 uses E4S: --channel e4s
- RHEL 8.10: no channel flag (final minor release)

## SAP APPS Specifics
- Use EUS for 8.8: --channel eus
- No channel for 8.10

## Post-configuration for SAP HANA
- Configure system per SAP Notes for RHEL 8
