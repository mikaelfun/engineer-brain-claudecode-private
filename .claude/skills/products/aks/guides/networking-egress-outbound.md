# AKS 出站连接 -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 8
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS nodes vulnerable to CVE-2024-6387 (regreSSHion) - remote unauthenticated cod... | Security regression of CVE-2006-5051 in OpenSSH sshd allows ... | 1) Upgrade AKS node image to 202407.01.0+; 2) Temp mitigatio... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | kubectl logs, exec, port-forward, cp, top commands fail with 'Error from server:... | AKS tunnel (tunnelfront/aks-link/konnectivity-agent) between... | 1) Identify tunnel type: V1 (tunnelfront pod, port TCP 9000)... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FTunnel%20TSG%20for%20AKS%20secure%20networking) |
| 3 | AKS node provisioning fails with vmssCSE exit code 50 (ERR_OUTBOUND_CONN_FAIL) —... | Customer deployed AKS in a custom VNET with address range ov... | 1. Verify VNET address space does not overlap with public IP... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 4 | Multiple validation errors when updating existing AKS cluster to Automatic SKU: ... | AKS Automatic requires 20+ features/addons to be enabled. So... | Enable each required feature using specific az aks CLI comma... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/AKS%20Automatic%20SKU) |
| 5 | Node auto-repair fails with OutboundConnectivityNotEnabledOnVMSS error | Node or VMSS has no outbound internet access configured, req... | Enable outbound connectivity for the VMSS using NAT Gateway,... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-auto-repair-errors) |
| 6 | AKS cluster creation with outbound type none/block fails with OrasPullNetworkTim... | Network isolated cluster's private ACR cache (bootstrap ACR)... | Verify ACR cache rule includes aks-managed-rule with source ... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/vmextensionerror-oraspullnetworktimeout) |
| 7 | AKS cluster creation with outbound type none/block fails with OrasPullUnauthoriz... | Kubelet identity missing AcrPull or Container Registry Repos... | Assign AcrPull (or Container Registry Repository Reader for ... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/vmextensionerror-oraspullunauthorized) |
| 8 | After disabling OutboundNAT on AKS Windows node pool, customer experiences netwo... | DisableOutboundNAT is node pool level and cannot be toggled ... | Cordon and drain DisableOutboundNAT nodes, create new normal... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%20Disable%20OutboundNAT) |

## Quick Troubleshooting Path

1. Check: 1) Upgrade AKS node image to 202407 `[source: onenote]`
2. Check: 1) Identify tunnel type: V1 (tunnelfront pod, port TCP 9000), OpenVPN (aks-link pods, port UDP 1194) `[source: ado-wiki]`
3. Check: 1 `[source: ado-wiki]`
