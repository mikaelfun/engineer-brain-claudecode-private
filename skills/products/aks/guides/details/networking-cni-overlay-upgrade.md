# AKS CNI 与 Overlay 网络 — upgrade -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 2 | **Kusto queries**: 2
**Source drafts**: ado-wiki-a-OverlaymgrReconcileError-noisy-neighbouring.md, ado-wiki-a-OverlaymgrReconcileError-troubleshooting.md
**Kusto references**: auto-upgrade.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Kyverno validatingwebhookconfiguration is configur

### aks-810: AKS PUT operations (upgrade/update) fail with OverlaymgrReconcileError / Overlay...

**Root Cause**: Kyverno validatingwebhookconfiguration is configured with failurePolicy=Fail, but the Kyverno service pods are down or have no endpoints. This blocks API server requests including overlay manager reconciliation, causing OverlaymgrReconcileError with context deadline exceeded.

**Solution**:
1. Remove readiness/liveness probes from kube-apiserver container. 2. Access overlay cluster and delete the kyverno-resource-validating-webhook-cfg ValidatingWebhookConfiguration. 3. Verify APIService v1beta3.flowcontrol.apiserver.k8s.io is created. 4. Use Geneva action to reconcile the cluster. 5. Wait for new API Servers to come up healthy.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FOverlaymgrReconcileError%20caused%20by%20kyverno%20webhook%20failures)]`

## Phase 2: A noisy neighbor AKS cluster on the same underlay 

### aks-811: AKS PUT operations fail with OverlaymgrReconcileError / OverlayMgrAPIRequestFail...

**Root Cause**: A noisy neighbor AKS cluster on the same underlay generates excessive API operations (often from misconfigured DiagnosticsSettings with thousands of LinkedNotificationHandler.POST per hour), overloading shared OverlayManager pods and causing CPU saturation that prevents overlay reconciliation.

**Solution**:
1. Identify noisy neighbor CCP via OverlaymgrApiQos Kusto query filtering by RPTenant and ReconcileOverlayError. 2. Look up offending CCP in ASI. 3. AKS PG contacts offending customer. 4. Alternative: migrate cluster to different underlay (requires customer approval + IcM to AKS PG). 5. Reconcile affected cluster after mitigation.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FOverlaymgrReconcileError%20caused%20by%20noisy%20neighbouring)]`

## Phase 3: Kyverno validating webhook configuration (kyverno-

### aks-824: AKS PUT operations fail with OverlaymgrReconcileError (SubCode: OverlayMgrAPIReq...

**Root Cause**: Kyverno validating webhook configuration (kyverno-resource-validating-webhook-cfg) blocks kube-apiserver readiness. The webhook calls kyverno-svc which has no running endpoints, causing a deadlock that prevents overlaymgr from communicating with the CCP API server.

**Solution**:
1) Remove readiness/liveness probes from kube-apiserver container. 2) Delete the 'kyverno-resource-validating-webhook-cfg' ValidatingWebhookConfiguration from the overlay cluster. 3) Verify APIService v1beta3.flowcontrol.apiserver.k8s.io is created. 4) Use Geneva action to reconcile the cluster. 5) Wait for new API servers to come up healthy.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FOverlaymgrReconcileError%20caused%20by%20kyverno%20webhook%20failures)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS PUT operations (upgrade/update) fail with OverlaymgrReconcileError / Overlay... | Kyverno validatingwebhookconfiguration is configured with fa... | 1. Remove readiness/liveness probes from kube-apiserver cont... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FOverlaymgrReconcileError%20caused%20by%20kyverno%20webhook%20failures) |
| 2 | AKS PUT operations fail with OverlaymgrReconcileError / OverlayMgrAPIRequestFail... | A noisy neighbor AKS cluster on the same underlay generates ... | 1. Identify noisy neighbor CCP via OverlaymgrApiQos Kusto qu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FOverlaymgrReconcileError%20caused%20by%20noisy%20neighbouring) |
| 3 | AKS PUT operations fail with OverlaymgrReconcileError (SubCode: OverlayMgrAPIReq... | Kyverno validating webhook configuration (kyverno-resource-v... | 1) Remove readiness/liveness probes from kube-apiserver cont... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FOverlaymgrReconcileError%20caused%20by%20kyverno%20webhook%20failures) |
