# AKS 网络连通性通用 — mooncake -- Quick Reference

**Sources**: 1 | **21V**: Partial | **Entries**: 4
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Kubelogin errors when connecting to AAD-integrated AKS cluster; authentication f... | AAD-integrated AKS clusters require kubelogin for authentica... | Install kubelogin and configure for Mooncake AAD endpoints. ... | [G] 9.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS Kusto queries return incomplete data or fail to connect using old endpoint a... | AKS Kusto endpoint migrated from akscn to mcakshuba.chinaeas... | Use mcakshuba.chinaeast2.kusto.chinacloudapi.cn. Join CME gr... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Ubuntu unattended daily update on AKS nodes causes AKS connection timeout; node ... | Ubuntu default unattended-upgrades package triggers daily OS... | Use AKS cluster auto-upgrade with node-image channel: az aks... | [B] 6.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.4] |
| 4 | AKS pods experience intermittent connection timeout or connection reset errors a... | Ubuntu unattended daily upgrades trigger systemd package upd... | 1) OS-level: edit /etc/apt/apt.conf.d/20auto-upgrades, set A... | [Y] 3.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |

## Quick Troubleshooting Path

1. Check: Install kubelogin and configure for Mooncake AAD endpoints `[source: onenote]`
2. Check: Use mcakshuba `[source: onenote]`
3. Check: Use AKS cluster auto-upgrade with node-image channel: az aks update --resource-group <rg> --name <cl `[source: onenote]`
