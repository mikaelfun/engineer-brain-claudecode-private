---
title: RHEL SAP HANA/APPS PAYG VM Upgrade from 8.x to 9.x Using Leapp
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/leapp-upgrade-rhel-8dotx-to-9dotx-saphana-sapapps
product: vm
tags: [RHEL, SAP-HANA, SAP-APPS, Leapp, upgrade, E4S, EUS, PAYG]
21vApplicable: false
21vNote: RHUI endpoints and leapp-rhui-azure-sap package differ in Mooncake.
---

# RHEL SAP HANA/APPS 8.x to 9.x Upgrade (PAYG)

## Supported Paths
| Config | Source | Target |
|--------|--------|--------|
| SAP HANA | RHEL 8.10 | RHEL 9.4, 9.6 |
| SAP NetWeaver/Apps | RHEL 8.10 | RHEL 9.4, 9.6 |

## SAP HANA Specifics
- Must first upgrade to RHEL 8.10
- Stop SAP HANA but keep file systems mounted
- Configure sap.conf: vm.max_map_count=2147483647, kernel.pid_max=4194304
- HA cluster: Nodes must NOT use Resilient Storage packages
- Use E4S channel: --channel e4s

## SAP APPS Specifics
- Stop SAP processes, keep file systems mounted
- Use EUS channel: --channel eus

## Post-upgrade
- Configure system for SAP HANA per SAP Notes 2772999, 2382421
