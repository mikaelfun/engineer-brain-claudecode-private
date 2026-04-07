# AKS 防火墙与代理 — mcr -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS node image pull failures after MCR FQDN rename in Mooncake; addons may also ... | MCR endpoints renamed with new FQDNs required in firewall al... | Update firewall allow-list to include both old and new MCR F... | [G] 9.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS image pull may fail if firewall only allows old MCR endpoint (mcr.azk8s.cn);... | MCR endpoint changed from mcr.azk8s.cn to mcr.azure.cn for A... | Update firewall rules to allow mcr.azure.cn. During transiti... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS image pull fails with timeout or connection refused when cluster uses custom... | Customer uses custom UDR routing outbound traffic through NV... | 1) Whitelist the NVA/firewall egress IP with MCR team (file ... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Azure Backup extension install on AKS hangs until timeout. Extension agent logs:... | AKS cluster cannot reach MCR endpoints due to restrictive NS... | Allow outbound access to: mcr.microsoft.com:443, *.data.mcr.... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FAKS%20azure%20backup%20troubleshooting) |

## Quick Troubleshooting Path

1. Check: Update firewall allow-list to include both old and new MCR FQDNs per updated docs `[source: onenote]`
2. Check: Update firewall rules to allow mcr `[source: onenote]`
3. Check: 1) Whitelist the NVA/firewall egress IP with MCR team (file ICM) `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-firewall-proxy-mcr.md)
