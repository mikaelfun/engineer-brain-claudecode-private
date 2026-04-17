# AKS AGIC HTTP 错误码排查 — upgrade -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS upgrade/update fails with FailedToWaitForOverlayExtensionConfigCleanup. agic... | On Azure CNI Overlay clusters with AGIC/AGC, the OverlayExte... | 1) Verify OEC stuck: kubectl get oec -n kube-system agic-ove... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/AKS%20Upgrade%20FailedToWaitForOverlayExtensionConfigCleanup) |
| 2 | AKS upgrade/update fails with FailedToWaitForOverlayExtensionConfigCleanup; agic... | On Azure CNI Overlay clusters with AGIC/AGC, the OEC cleanup... | 1) Verify cluster uses overlay and OEC is stuck in deletion ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/AKS%20Upgrade%20FailedToWaitForOverlayExtensionConfigCleanup) |
| 3 | AKS upgrade or update fails with FailedToWaitForOverlayExtensionConfigCleanup. T... | On Azure CNI Overlay clusters with AGIC/AGC, DNC-RC cleanup ... | 1) Verify cluster uses overlay networking and agic-overlay-e... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FAKS%20Upgrade%20FailedToWaitForOverlayExtensionConfigCleanup) |

## Quick Troubleshooting Path

1. Check: 1) Verify OEC stuck: kubectl get oec -n kube-system agic-overlay-extension-config -o yaml (check del `[source: ado-wiki]`
2. Check: 1) Verify cluster uses overlay and OEC is stuck in deletion with finalizers `[source: ado-wiki]`
3. Check: 1) Verify cluster uses overlay networking and agic-overlay-extension-config is stuck in deletion wit `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/agic-http-errors-upgrade.md)
