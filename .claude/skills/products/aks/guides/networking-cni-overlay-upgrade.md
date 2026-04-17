# AKS CNI 与 Overlay 网络 — upgrade -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS PUT operations (upgrade/update) fail with OverlaymgrReconcileError / Overlay... | Kyverno validatingwebhookconfiguration is configured with fa... | 1. Remove readiness/liveness probes from kube-apiserver cont... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FOverlaymgrReconcileError%20caused%20by%20kyverno%20webhook%20failures) |
| 2 | AKS PUT operations fail with OverlaymgrReconcileError / OverlayMgrAPIRequestFail... | A noisy neighbor AKS cluster on the same underlay generates ... | 1. Identify noisy neighbor CCP via OverlaymgrApiQos Kusto qu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FOverlaymgrReconcileError%20caused%20by%20noisy%20neighbouring) |
| 3 | AKS PUT operations fail with OverlaymgrReconcileError (SubCode: OverlayMgrAPIReq... | Kyverno validating webhook configuration (kyverno-resource-v... | 1) Remove readiness/liveness probes from kube-apiserver cont... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FOverlaymgrReconcileError%20caused%20by%20kyverno%20webhook%20failures) |

## Quick Troubleshooting Path

1. Check: 1 `[source: ado-wiki]`
2. Check: 1 `[source: ado-wiki]`
3. Check: 1) Remove readiness/liveness probes from kube-apiserver container `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-cni-overlay-upgrade.md)
