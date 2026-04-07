# AKS 防火墙与代理 — mcr -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-b-mcr-client-firewall-rules.md
**Generated**: 2026-04-07

---

## Phase 1: MCR endpoints renamed with new FQDNs required in f

### aks-099: AKS node image pull failures after MCR FQDN rename in Mooncake; addons may also ...

**Root Cause**: MCR endpoints renamed with new FQDNs required in firewall allow-lists.

**Solution**:
Update firewall allow-list to include both old and new MCR FQDNs per updated docs. For managed addons, same endpoints apply.

`[Score: [G] 9.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: MCR endpoint changed from mcr.azk8s.cn to mcr.azur

### aks-098: AKS image pull may fail if firewall only allows old MCR endpoint (mcr.azk8s.cn);...

**Root Cause**: MCR endpoint changed from mcr.azk8s.cn to mcr.azure.cn for AKS-managed images in Mooncake. Auto-fallback to old endpoint during staging.

**Solution**:
Update firewall rules to allow mcr.azure.cn. During transition period, fallback to mcr.azk8s.cn is automatic.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: Customer uses custom UDR routing outbound traffic 

### aks-235: AKS image pull fails with timeout or connection refused when cluster uses custom...

**Root Cause**: Customer uses custom UDR routing outbound traffic through NVA/firewall with different egress IP. MCR endpoint blocks requests from unregistered/unknown source IPs not in its allow-list

**Solution**:
1) Whitelist the NVA/firewall egress IP with MCR team (file ICM). 2) Ensure firewall rules allow traffic to mcr.azure.cn (Mooncake). 3) Verify UDR does not block MCR endpoints. See also aks-onenote-102 for MCR FQDN changes

`[Score: [B] 7.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: AKS cluster cannot reach MCR endpoints due to rest

### aks-828: Azure Backup extension install on AKS hangs until timeout. Extension agent logs:...

**Root Cause**: AKS cluster cannot reach MCR endpoints due to restrictive NSGs, DNS issues, or NVA/firewall rules. Extension agent cannot download Helm chart from MCR.

**Solution**:
Allow outbound access to: mcr.microsoft.com:443, *.data.mcr.microsoft.com:443, mcr-0001.mcr-msedge.net:443. Verify with 'curl -I https://mcr.microsoft.com/v2/_catalog' from debug pod. Check ASI Kube Events for EgressBlocked. Also ensure NSG inbound allows azurebackup and azurecloud service tags.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FAKS%20azure%20backup%20troubleshooting)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS node image pull failures after MCR FQDN rename in Mooncake; addons may also ... | MCR endpoints renamed with new FQDNs required in firewall al... | Update firewall allow-list to include both old and new MCR F... | [G] 9.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS image pull may fail if firewall only allows old MCR endpoint (mcr.azk8s.cn);... | MCR endpoint changed from mcr.azk8s.cn to mcr.azure.cn for A... | Update firewall rules to allow mcr.azure.cn. During transiti... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS image pull fails with timeout or connection refused when cluster uses custom... | Customer uses custom UDR routing outbound traffic through NV... | 1) Whitelist the NVA/firewall egress IP with MCR team (file ... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Azure Backup extension install on AKS hangs until timeout. Extension agent logs:... | AKS cluster cannot reach MCR endpoints due to restrictive NS... | Allow outbound access to: mcr.microsoft.com:443, *.data.mcr.... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FAKS%20azure%20backup%20troubleshooting) |
