# AKS NSG 规则排查 — vmss -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster delete fails with LoadBalancerInUseByVirtualMachineScaleSet (409) or... | VMSS is still using the associated public IP address or NSG ... | Remove all public IP addresses associated with Azure Load Ba... | [G] 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/load-balancer-or-nsg-in-use-by-vm-scale-set) |
| 2 | AKS node provisioning fails; ASC Extensions tab shows vmssCSE (custom script ext... | Outbound connectivity from the new node is blocked by NSG ru... | Ask customer to review NSG and UDR rules to ensure required ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVMSS%20Overview) |
| 3 | Host Network NSG Control: cannot delete managed ASG because there are still refe... | Managed ASG was deleted before VMSS and NSG references were ... | Manually update VMSS and NSG to remove references to the man... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Host%20Network%20NSG%20Control) |

## Quick Troubleshooting Path

1. Check: Remove all public IP addresses associated with Azure Load Balancer, or dissociate the NSG used by th `[source: mslearn]`
2. Check: Ask customer to review NSG and UDR rules to ensure required outbound connectivity is not blocked `[source: ado-wiki]`
3. Check: Manually update VMSS and NSG to remove references to the managed ASG, then reconcile the agent pool `[source: ado-wiki]`
