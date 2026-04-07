# AKS 通用排查 — pod-sandboxing -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 2 | **Kusto queries**: 2
**Source drafts**: ado-wiki-b-Pod-Sandboxing-Kata.md, mslearn-pod-crashloopbackoff-troubleshooting.md
**Kusto references**: pod-restart-analysis.md, pod-subnet-sharing.md
**Generated**: 2026-04-07

---

## Phase 1: ARM64 is incompatible with CVM, Trusted Launch, an

### aks-708: Error: CVM enabled clusters are not supported for ARM64 enabled nodes when using...

**Root Cause**: ARM64 is incompatible with CVM, Trusted Launch, and Pod Sandboxing (Confidential Containers) in AKS

**Solution**:
Cannot combine ARM64 with these security features. Choose either ARM64 or CVM/Trusted Launch/Pod Sandboxing.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Arm64%20node%20pools)]`

## Phase 2: Known intermittent issue in the Kata runtime where

### aks-944: Kata pod stuck in Running phase and never reaches Succeeded phase after command ...

**Root Cause**: Known intermittent issue in the Kata runtime where the pod does not transition to Succeeded phase even after the container command finishes. Rare and not consistently reproducible.

**Solution**:
Escalate to the Kata feature owner (Fanglu Guo). This is a known intermittent Kata runtime issue.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FPod%20Sandboxing%20and%20Kernel%20Isolation%20%28kata%29)]`

## Phase 3: The runtimeClass kata-mshv-vm-isolation is automat

### aks-946: Pod creation fails with RuntimeClass kata-mshv-vm-isolation not found error when...

**Root Cause**: The runtimeClass kata-mshv-vm-isolation is automatically created by OverlayManager for clusters with k8s >= 1.24.0 and KataVMIsolationPreview feature registered. Missing class means feature flag not registered or k8s version too old.

**Solution**:
1) Verify KataVMIsolationPreview feature flag is registered on the subscription; 2) Ensure cluster k8s version >= 1.24.0; 3) Check that at least one nodepool has matching labels (kubernetes.azure.com/kata-mshv-vm-isolation=true) and correct workloadRuntime.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FPod%20Sandboxing%20and%20Kernel%20Isolation%20%28kata%29)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Error: CVM enabled clusters are not supported for ARM64 enabled nodes when using... | ARM64 is incompatible with CVM, Trusted Launch, and Pod Sand... | Cannot combine ARM64 with these security features. Choose ei... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Arm64%20node%20pools) |
| 2 | Kata pod stuck in Running phase and never reaches Succeeded phase after command ... | Known intermittent issue in the Kata runtime where the pod d... | Escalate to the Kata feature owner (Fanglu Guo). This is a k... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FPod%20Sandboxing%20and%20Kernel%20Isolation%20%28kata%29) |
| 3 | Pod creation fails with RuntimeClass kata-mshv-vm-isolation not found error when... | The runtimeClass kata-mshv-vm-isolation is automatically cre... | 1) Verify KataVMIsolationPreview feature flag is registered ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FPod%20Sandboxing%20and%20Kernel%20Isolation%20%28kata%29) |
