# AKS 容量与可用性区域 -- Comprehensive Troubleshooting Guide

**Entries**: 2 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-VM-VMSS-Allocation-or-Capacity-Errors.md, ado-wiki-b-Node-scaling-allocation-capacity-issues.md, ado-wiki-b-atlas-creation-flow.md
**Generated**: 2026-04-07

---

## Phase 1: ccp-webhook could not find available ports. Either

### aks-923: AKS Auto Assign Host Ports: Failed to allocate host port for container - no enou...

**Root Cause**: ccp-webhook could not find available ports. Either it failed to fetch pod.HostPort/svc.NodePort status, or all ports in the defined range are occupied.

**Solution**:
Check error field in mutator logs. If no enough host ports available: reduce pods per node or expand port range. If fetch port status error: investigate Kubernetes API connectivity from ccp-webhook.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Auto%20Assign%20Host%20Ports)]`

## Phase 2: The requested VM SKU has zone restrictions in the 

### aks-1183: AKS cluster creation fails with AvailabilityZoneNotSupported: the requested zone...

**Root Cause**: The requested VM SKU has zone restrictions in the subscription. SKU may not be available in the specified availability zone.

**Solution**:
1) az vm list-skus -l <location> --size <SKU> to check restrictions. 2) If restricted (reasonCode: NotAvailableForSubscription), request access via Azure region access request process. 3) Or select a different AZ/SKU.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/availabilityzonenotsupported-error)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS Auto Assign Host Ports: Failed to allocate host port for container - no enou... | ccp-webhook could not find available ports. Either it failed... | Check error field in mutator logs. If no enough host ports a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Auto%20Assign%20Host%20Ports) |
| 2 | AKS cluster creation fails with AvailabilityZoneNotSupported: the requested zone... | The requested VM SKU has zone restrictions in the subscripti... | 1) az vm list-skus -l <location> --size <SKU> to check restr... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/availabilityzonenotsupported-error) |
