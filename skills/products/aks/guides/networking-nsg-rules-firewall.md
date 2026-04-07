# AKS NSG 规则排查 — firewall -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 7
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | OpenVPN tunnel (aks-link pod) logs show 'TLS Error: TLS key negotiation failed t... | Egress UDP port 1194 is blocked by firewall, NSG, or network... | 1) Verify aks-link pod status: 'kubectl get po -n kube-syste... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FTunnel%20TSG%20for%20AKS%20secure%20networking) |
| 2 | AKS node provisioning fails with vmssCSE exit code 50 (ERR_OUTBOUND_CONN_FAIL) o... | Node outbound connectivity to mcr.microsoft.com is blocked. ... | 1. Run on node: curl -v --connect-timeout 10 --insecure --pr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 3 | AKS node NotReady with CSE failure due to API server network timeout | API server unreachable from node - NSG blocking port 443 egr... | Check AKS subnet NSG allows port 443 egress; check node-leve... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-custom-script-extension-errors) |
| 4 | kubectl commands fail or AKS cluster creation/node pool scaling errors after res... | Egress restriction rules conflict with AKS required outbound... | Verify configuration against AKS required outbound network a... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/errors-arfter-restricting-egress-traffic) |
| 5 | AKS cluster creation/scale/upgrade fails with OutboundConnFailVMExtensionError (... | CSE cannot establish outbound connectivity to MCR (mcr.micro... | Use Azure Virtual Network Verifier for connectivity analysis... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-outboundconnfailvmextensionerror) |
| 6 | AKS cluster upgrade fails with error indicating NSG rule involvement; cluster ca... | Custom NSG rules on the MC_ resource group or subnet are blo... | Run 'az network nsg list' to find NSG linked to cluster in M... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/upgrade-fails-because-of-nsg-rules) |
| 7 | Adding Windows node pool fails with WINDOWS_CSE_ERROR_CHECK_API_SERVER_CONNECTIV... | Windows nodes cannot connect to the cluster API server. Comm... | 1) SSH to node, run Test-NetConnection <cluster-fqdn> 443. 2... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/windows-cse-error-check-api-server-connectivity) |

## Quick Troubleshooting Path

1. Check: 1) Verify aks-link pod status: 'kubectl get po -n kube-system | grep aks-link'; 2) Check aks-link lo `[source: ado-wiki]`
2. Check: 1 `[source: ado-wiki]`
3. Check: Check AKS subnet NSG allows port 443 egress; check node-level NSG; verify NVA/firewall allows port 4 `[source: mslearn]`
