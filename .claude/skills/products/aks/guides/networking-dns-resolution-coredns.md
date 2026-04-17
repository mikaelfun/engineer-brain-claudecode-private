# AKS DNS 解析排查 — coredns -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 7
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | WIZ security scanner reports aws-sdk-go v1 EOL alert on AKS node at path /opt/az... | The coredns binary used by AKS localdns feature bundles aws-... | This is a false positive for AKS - coreDNS in AKS does not u... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | After enabling addon-autoscaling, VPA recommends too large CPU/memory resources ... | VPA (Vertical Pod Autoscaler) recommended resource requests ... | 1) Enable cluster autoscaler to add more nodes, or create a ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAddon%20Autoscaling) |
| 3 | AKS Extensions creation stuck in creating state with 'Errorcode: 403, Message: T... | A pre-existing PrivateLinkScope (PLS) for Azure Arc-enabled ... | Option 1: Create separate VNETs for AKS cluster and Arc-enab... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FUngrouped%2FAKSExtension%20AzureArc) |
| 4 | AKS cluster upgrade or scale-down hangs indefinitely; node drain never completes... | A PodDisruptionBudget (PDB) with maxUnavailable=0 or minAvai... | 1) Check for blocking PDBs: kubectl get pdb --all-namespaces... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2] |
| 5 | CoreDNS in AKS Mooncake cluster is upgraded by platform without prior customer n... | AKS platform performed CoreDNS component upgrade. CXP confir... | Post-incident: Service Health now includes AKS. Mitigation: ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | AKS system nodepool constraints: cannot delete last system nodepool, system pods... | By design: AKS requires at least one system nodepool with mi... | System nodepool must have >= 1 node; use Az CLI >= 2.3.1. Us... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 7 | AKS cluster extension agent returns 403 'This traffic is not authorized' when ca... | A preexisting PrivateLinkScope for Azure Arc-enabled Kuberne... | Option 1 (recommended): Create separate VNets for Arc and AK... | [Y] 4.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors) |

## Quick Troubleshooting Path

1. Check: This is a false positive for AKS - coreDNS in AKS does not use the AWS route53 plugin, meaning no co `[source: onenote]`
2. Check: 1) Enable cluster autoscaler to add more nodes, or create a new node pool with larger VM SKUs `[source: ado-wiki]`
3. Check: Option 1: Create separate VNETs for AKS cluster and Arc-enabled Kubernetes `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-dns-resolution-coredns.md)
