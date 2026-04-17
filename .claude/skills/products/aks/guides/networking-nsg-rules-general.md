# AKS NSG 规则排查 — general -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 11
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster with custom vnet + kubenet network plugin has network connectivity i... | When using custom vnet with kubenet, customer did not follow... | 1) Follow official doc to associate route table and NSG with... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS Private Link Service (PLS) creation fails with LinkedAuthorizationFailed: cl... | When creating a Kubernetes service with azure-pls-create ann... | Assign Contributor (or a custom role with Microsoft.Network/... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FPublish%20AKS%20services%20with%20Azure%20Private%20Link%20and%20Front%20Door) |
| 3 | AKS cluster delete fails with DeleteResourceGroupError / ResourceGroupDeletionTi... | Backend services (ARM, NRP) became out-of-sync due to tempor... | No CSS self-service fix. Escalate via IcM to Cloudnet/NRP EE... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FAKS%20cluster%20cannot%20be%20deleted%20because%20NSG%20deletion%20fails%20with%20Microsoft.WindowsAzure.Networking.Rnm.Contracts.Faults) |
| 4 | AKS cluster delete fails with DeleteResourceGroupError and ResourceGroupDeletion... | Azure backend services (NRP) out-of-sync: a leaked NSG objec... | No customer-ready mitigation. Escalate via IcM to Cloudnet/N... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Delete/AKS%20cluster%20cannot%20be%20deleted%20because%20NSG%20deletion%20fails%20with%20Microsoft.WindowsAzure.Networking.Rnm.Contracts.Faults) |
| 5 | AKS nodepool operations fail with ProvisioningError on MMAExtension exit code 53... | Log Analytics workspace key in AKS (omsagent-secret) mismatc... | 1) Compare omsagent-secret (base64 decoded) with Log Analyti... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FInvalid%20workspace%20key%20fails%20cluster%20operations) |
| 6 | Custom NSG blocks traffic to AKS LoadBalancer service: timeout despite pod runni... | Custom NSG on AKS subnet missing inbound allow rule for serv... | Add inbound allow rule for service port in custom subnet-lev... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/custom-nsg-blocks-traffic) |
| 7 | 'Error from server: error dialing backend: dial tcp <nodeIP>:10250: i/o timeout'... | NSG or firewall rule blocks inbound TCP port 10250 on the no... | Check NSG on node subnet for inbound rules blocking TCP port... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/error-from-server-error-dialing-backend-dial-tcp) |
| 8 | AKS authorized IP range feature limited to 200 entries despite NSG supporting 10... | Authorized IP range feature internally uses NSG shared acros... | Use private cluster as alternative to authorized IP ranges. ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 9 | AKS cluster creation fails with RequestDisallowedByPolicy: Resource was disallow... | Subscription administrators assigned Azure Policy restrictio... | 1. Identify the blocking policy from the error message (poli... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/requestdisallowedbypolicy-error) |
| 10 | NAP/Karpenter pod connectivity issues - pods cannot communicate with other pods ... | NSG rules blocking traffic, incorrect subnet config in AKSNo... | Review NSG rules, verify subnet config in AKSNodeClass, rest... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-node-auto-provision) |
| 11 | Terraform unable to create NSG for AKS subnet. Long-aged case pending on network... | Product issue / by-design limitation. AKS manages its own NS... | Do not create custom NSG directly on AKS node subnet if usin... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 1) Follow official doc to associate route table and NSG with subnet: https://docs `[source: onenote]`
2. Check: Assign Contributor (or a custom role with Microsoft `[source: ado-wiki]`
3. Check: No CSS self-service fix `[source: ado-wiki]`
