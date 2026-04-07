# AKS NSG 规则排查 — networking -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | 手动在 NSG 上添加的规则指向 AKS LoadBalancer 公网 IP 后，规则过一段时间自动消失 | AKS 的 cloud-controller-manager 会自动管理与 LoadBalancer Service 关... | 在 Service spec 中使用 loadBalancerSourceRanges 字段指定允许的源 CIDR，AK... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAKS%20Restrict%20Ingress%20loadBalancerSourceRanges) |
| 2 | 在 AKS Service 上同时使用 loadBalancerSourceRanges 和 service.beta.kubernetes.io/azure-... | 当 loadBalancerSourceRanges 被设置后，kube-proxy 会添加 DROP iptables... | 将 Service Tag 对应的 CIDR 合并到 loadBalancerSourceRanges 中，并移除 az... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAKS%20Restrict%20Ingress%20loadBalancerSourceRanges) |
| 3 | AKS outbound traffic between node pools blocked — custom NSG on subnet blocks sp... | Custom NSG associated with AKS subnet has deny rules or miss... | 1) Use Network Watcher > NSG diagnostics (Target: VMSS NIC o... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting%2F11%20-%20Troubleshoot%20NSG%20Common%20Scenarios) |
| 4 | Host Network NSG Control: Reconcile application security group failed error, or ... | Feature not enabled or misconfigured: allowed-host-ports ran... | 1) Verify feature enabled in ASI nodepool page. 2) Check all... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Host%20Network%20NSG%20Control) |
| 5 | Some calico-node pods are in 0/1 Running state (not ready) on nodes that do not ... | Customer NSG has a Deny rule where the Source Address Prefix... | Review and modify the NSG rules to ensure Deny rules do not ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FUngrouped%2FNSG%20prevents%20Calico%20pods%20from%20starting) |

## Quick Troubleshooting Path

1. Check: 在 Service spec 中使用 loadBalancerSourceRanges 字段指定允许的源 CIDR，AKS 会自动在 NSG 上创建并维护对应规则，例如: spec `[source: ado-wiki]`
2. Check: 将 Service Tag 对应的 CIDR 合并到 loadBalancerSourceRanges 中，并移除 azure-allowed-service-tags 注解。Service Tag  `[source: ado-wiki]`
3. Check: 1) Use Network Watcher > NSG diagnostics (Target: VMSS NIC of source, Protocol: TCP, Source IP: sour `[source: ado-wiki]`
