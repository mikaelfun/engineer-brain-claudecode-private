# AKS 节点镜像升级 — node-image -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 6
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS nodes using Ubuntu 18.04 (node image 202510.19 or 202510.29) fail to scale o... | Ubuntu 18.04 EOL. PG removed 1804 node images. Clusters on k... | 1) Upgrade node image to 202511.07+. 2) Upgrade k8s to 1.25+... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS nodes vulnerable to CVE-2024-21626 - container breakout through runc process... | Vulnerability in runc allows malicious container image to ex... | 1) Upgrade node image: Azure Linux >= 202401.17.2 (runc 1.1.... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Running 'az aks upgrade' or 'az aks nodepool upgrade' does not upgrade existing ... | By design, az aks upgrade / az aks nodepool upgrade only upg... | Create a new nodepool that supports Gen2 on the upgraded clu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Gen2%20VMs) |
| 4 | Self-hosted Karpenter using unsupported Community Gallery VHDs instead of AKS-su... | Customer-hosted Karpenter is pulling VHDs from the Community... | 1) Use 'kubectl describe node' to verify node image origin; ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29) |
| 5 | Ubuntu 18.04 EOL on AKS nodes; customers on AKS <1.25 need migration plan | Ubuntu 18.04 support ended May 2023. AKS continued images un... | Upgrade to AKS 1.25+ for Ubuntu 22.04. For 1.24, run az aks ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | Customer reports security scan finding CVE vulnerabilities in AKS node packages;... | AKS node images are rebuilt weekly with latest security patc... | 1) Inform customer AKS PG fixes CVEs within 30 days. 2) Chec... | [Y] 3.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |

## Quick Troubleshooting Path

1. Check: 1) Upgrade node image to 202511 `[source: onenote]`
2. Check: 1) Upgrade node image: Azure Linux >= 202401 `[source: onenote]`
3. Check: Create a new nodepool that supports Gen2 on the upgraded cluster: for k8s >= 1 `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/upgrade-node-image-node-image.md)
