# AKS 节点 OS 与内核 -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | kubectl exec / docker exec fails with 'OCI runtime exec failed: exec failed: una... | PTY (pseudo-terminal) pool exhausted on the node: /proc/sys/... | (1) Temporarily increase PTY limit: `az vmss run-command inv... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVirtual%20Machine%20TSGs%2FNode%20PTY) |
| 2 | Customer modifies kernel parameters (sysctl) on AKS node VM, but changes do not ... | Work by design. AKS pods run in isolated namespaces and do n... | 1) Use Kubernetes allowed-unsafe-sysctls or safe sysctls in ... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Pods on AKS Ubuntu 24.04 nodes crash with Too many open files errors (java.net.S... | Ubuntu 24.04 updated systemd defaults set LimitNOFILESoft=10... | Apply a DaemonSet to create systemd override increasing Limi... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FLinux%2FContainerd%20File%20Descriptor%20Limits%20on%20Ubuntu%2024%2004%20Nodes) |

## Quick Troubleshooting Path

1. Check: (1) Temporarily increase PTY limit: `az vmss run-command invoke --resource-group <rg> --name <vmss>  `[source: ado-wiki]`
2. Check: 1) Use Kubernetes allowed-unsafe-sysctls or safe sysctls in pod security context for supported param `[source: onenote]`
3. Check: Apply a DaemonSet to create systemd override increasing LimitNOFILE and LimitNOFILESoft for containe `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/node-os-kernel.md)
