# AKS 内部负载均衡器 — general -- Comprehensive Troubleshooting Guide

**Entries**: 11 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-aks-restrict-ingress-loadbalancersourceranges.md, ado-wiki-b-Blue-Green-NodePool-Upgrade.md
**Generated**: 2026-04-07

---

## Phase 1: AKS platform-managed tags are used internally for 

### aks-142: Various issues (e.g., IP lease problems in Load Balancer) after deleting or modi...

**Root Cause**: AKS platform-managed tags are used internally for resource lifecycle management; removing or modifying them breaks AKS resource reconciliation

**Solution**:
Do NOT delete/modify platform-assigned managed tags in node resource group. Use 'az aks update --tags' for custom tags. Ref: https://learn.microsoft.com/en-us/azure/aks/use-tags

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Service Principal credentials used during AKS clus

### aks-168: AKS cannot create internal load balancer; AADSTS70002 error Invalid client secre...

**Root Cause**: Service Principal credentials used during AKS cluster creation were invalid or expired. The SP is required for AKS to manage Azure resources including load balancers.

**Solution**:
Reset the Service Principal credentials: az aks update-credentials or recreate the SP. Verify SP has Contributor role on the AKS resource group.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: PLS does not support basic LB or IP-based LB. With

### aks-455: AKS Private Link Service (PLS) connectivity broken or service stuck in Pending s...

**Root Cause**: PLS does not support basic LB or IP-based LB. With external standard LB and floating IP enabled (the default), PLS connectivity is broken. PLS also only works with IPv4 and cannot coexist with IPv6 frontend on the same SLB.

**Solution**:
Use an internal load balancer (annotation service.beta.kubernetes.io/azure-load-balancer-internal: true) or disable floating IP (annotation service.beta.kubernetes.io/azure-disable-load-balancer-floating-ip: true). For externalTrafficPolicy=Local, use a different subnet from Pod subnet.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FPublish%20AKS%20services%20with%20Azure%20Private%20Link%20and%20Front%20Door)]`

## Phase 4: kube-proxy iptables rules out of sync, DNAT not pr

### aks-566: AKS LoadBalancer service unreachable — connection timeout when accessing externa...

**Root Cause**: kube-proxy iptables rules out of sync, DNAT not properly forwarding traffic from LB to backend pods

**Solution**:
1. Test external IP and nodeport separately (nc -vz). 2. If both fail internally, check application health and iptables rules. 3. Restart kube-proxy pods to resync iptables. 4. Check NSG rules. 5. If internal works but external fails, check VIP/DIP availability and engage networking team.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service)]`

## Phase 5: Max surge value (percentage or fixed) applied to m

### aks-616: AKS nodepool scaling fails — 'Load balancer profile allocated ports is not in an...

**Root Cause**: Max surge value (percentage or fixed) applied to max node count causes total required ports to exceed available ports from load balancer public IPs. Each IP provides 64,000 ephemeral ports; required ports = (max_nodes + surge_nodes) * ports_per_node. When this exceeds available_IPs * 64,000, scaling fails.

**Solution**:
1) Check node pool setup in ASC for ports/node and surge values. 2) Calculate max supported nodes: (num_IPs * 64000) / ports_per_node. 3) Ensure active_nodes + surge_nodes never exceed this max. 4) Options to fix: reduce surge %, add more public IPs to LB, decrease ports_per_node (must be multiple of 8), or adjust maxCount. Example: 2560 ports/node with 2 IPs = max 50 nodes (128000/2560). Surge of 33% on maxCount=10 needs 13 nodes total.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FScaling_in_Azure_Kubernetes_Service_(AKS)_with_Surge_Setup_based_on_the_Loadbalancer_IP_count)]`

## Phase 6: Load balancer FrontEndIpConfiguration was accident

### aks-777: AKS cluster enters Failed state with 'Reconcile standard load balancer failed' -...

**Root Cause**: Load balancer FrontEndIpConfiguration was accidentally removed by customer, causing LB reconciliation failure

**Solution**:
Manually add back the FrontEndIpConfiguration with the same configuration ID referenced in the error message

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State)]`

## Phase 7: Product bug in Mooncake AKS portal: the UI incorre

### aks-194: AKS cluster created via Azure Portal in Mooncake shows Standard Load Balancer SK...

**Root Cause**: Product bug in Mooncake AKS portal: the UI incorrectly displays Standard LB as selected, but the backend creates a Basic LB. This was a known platform issue affecting multiple customers.

**Solution**:
1) Verify LB SKU with: az aks show -g <rg> -n <cluster> --query networkProfile.loadBalancerSku. 2) If Basic, recreate cluster explicitly specifying --load-balancer-sku standard in az aks create. 3) This was eventually fixed by PG deployment.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 8: Two scenarios: (1) VNet and VMSS are in different 

### aks-1190: AKS cluster create/update fails with InvalidResourceReference. Referenced resour...

**Root Cause**: Two scenarios: (1) VNet and VMSS are in different regions causing mismatch; (2) Default outbound rule 'aksOutboundRule' on load balancer was manually modified, breaking frontendIP reference.

**Solution**:
Scenario 1: Ensure VNet and cluster are in the same region. Scenario 2: Rerun az aks update with --load-balancer-outbound-ips parameter specifying the correct public IP resource ID.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/invalidresourcereference-error)]`

## Phase 9: A private link service is associated with the clus

### aks-1191: AKS cluster deletion blocked by CannotDeleteLoadBalancerWithPrivateLinkService o...

**Root Cause**: A private link service is associated with the cluster's internal load balancer, and the private link service has active private endpoint connections that must be removed first.

**Solution**:
Delete all private endpoint connections first, then delete the private link service, and finally retry deleting the AKS cluster.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/lb-pvtlinksvcwithpvtendptconn-error)]`

## Phase 10: Basic Load Balancer implementation does not automa

### aks-246: Newly provisioned VM in VMAS-based AKS cluster with basic LB has no outbound tra...

**Root Cause**: Basic Load Balancer implementation does not automatically create the kubernetes loadBalancer resource at cluster creation. Certain configurations break outbound connectivity for new nodes.

**Solution**:
1) Check if LB resource kubernetes exists. 2) Verify NSG rules allow outbound. 3) Consider migrating to Standard LB. 4) Engage networking IcM for infrastructure investigation.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 11: K8s 1.25 fix (PR #109826) corrected syncProxyRules

### aks-848: After upgrading AKS from 1.22 to 1.25+, intra-cluster traffic via external LB IP...

**Root Cause**: K8s 1.25 fix (PR #109826) corrected syncProxyRules LB loop nesting. LoadBalancerSourceRanges enforcement now works correctly, and cluster subnet was not in allowed ranges.

**Solution**:
Add AKS cluster subnet IP range to the service loadBalancerSourceRanges configuration.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FLoad%20Balancer%20Source%20Ranges%20service%20conf%20blocking%20in%20traffic)]`

---

## Known Issues Quick Reference

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
