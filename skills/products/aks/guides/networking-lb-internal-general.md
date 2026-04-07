# AKS 内部负载均衡器 — general -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 11
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Various issues (e.g., IP lease problems in Load Balancer) after deleting or modi... | AKS platform-managed tags are used internally for resource l... | Do NOT delete/modify platform-assigned managed tags in node ... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS cannot create internal load balancer; AADSTS70002 error Invalid client secre... | Service Principal credentials used during AKS cluster creati... | Reset the Service Principal credentials: az aks update-crede... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS Private Link Service (PLS) connectivity broken or service stuck in Pending s... | PLS does not support basic LB or IP-based LB. With external ... | Use an internal load balancer (annotation service.beta.kuber... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FPublish%20AKS%20services%20with%20Azure%20Private%20Link%20and%20Front%20Door) |
| 4 | AKS LoadBalancer service unreachable — connection timeout when accessing externa... | kube-proxy iptables rules out of sync, DNAT not properly for... | 1. Test external IP and nodeport separately (nc -vz). 2. If ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service) |
| 5 | AKS nodepool scaling fails — 'Load balancer profile allocated ports is not in an... | Max surge value (percentage or fixed) applied to max node co... | 1) Check node pool setup in ASC for ports/node and surge val... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FScaling_in_Azure_Kubernetes_Service_(AKS)_with_Surge_Setup_based_on_the_Loadbalancer_IP_count) |
| 6 | AKS cluster enters Failed state with 'Reconcile standard load balancer failed' -... | Load balancer FrontEndIpConfiguration was accidentally remov... | Manually add back the FrontEndIpConfiguration with the same ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 7 | AKS cluster created via Azure Portal in Mooncake shows Standard Load Balancer SK... | Product bug in Mooncake AKS portal: the UI incorrectly displ... | 1) Verify LB SKU with: az aks show -g <rg> -n <cluster> --qu... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 8 | AKS cluster create/update fails with InvalidResourceReference. Referenced resour... | Two scenarios: (1) VNet and VMSS are in different regions ca... | Scenario 1: Ensure VNet and cluster are in the same region. ... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/invalidresourcereference-error) |
| 9 | AKS cluster deletion blocked by CannotDeleteLoadBalancerWithPrivateLinkService o... | A private link service is associated with the cluster's inte... | Delete all private endpoint connections first, then delete t... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/lb-pvtlinksvcwithpvtendptconn-error) |
| 10 | Newly provisioned VM in VMAS-based AKS cluster with basic LB has no outbound tra... | Basic Load Balancer implementation does not automatically cr... | 1) Check if LB resource kubernetes exists. 2) Verify NSG rul... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 11 | After upgrading AKS from 1.22 to 1.25+, intra-cluster traffic via external LB IP... | K8s 1.25 fix (PR #109826) corrected syncProxyRules LB loop n... | Add AKS cluster subnet IP range to the service loadBalancerS... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FLoad%20Balancer%20Source%20Ranges%20service%20conf%20blocking%20in%20traffic) |

## Quick Troubleshooting Path

1. Check: Do NOT delete/modify platform-assigned managed tags in node resource group `[source: onenote]`
2. Check: Reset the Service Principal credentials: az aks update-credentials or recreate the SP `[source: onenote]`
3. Check: Use an internal load balancer (annotation service `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-lb-internal-general.md)
