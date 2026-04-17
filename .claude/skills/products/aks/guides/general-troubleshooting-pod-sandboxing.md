# AKS 通用排查 — pod-sandboxing -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Error: CVM enabled clusters are not supported for ARM64 enabled nodes when using... | ARM64 is incompatible with CVM, Trusted Launch, and Pod Sand... | Cannot combine ARM64 with these security features. Choose ei... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Arm64%20node%20pools) |
| 2 | Kata pod stuck in Running phase and never reaches Succeeded phase after command ... | Known intermittent issue in the Kata runtime where the pod d... | Escalate to the Kata feature owner (Fanglu Guo). This is a k... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FPod%20Sandboxing%20and%20Kernel%20Isolation%20%28kata%29) |
| 3 | Pod creation fails with RuntimeClass kata-mshv-vm-isolation not found error when... | The runtimeClass kata-mshv-vm-isolation is automatically cre... | 1) Verify KataVMIsolationPreview feature flag is registered ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FPod%20Sandboxing%20and%20Kernel%20Isolation%20%28kata%29) |

## Quick Troubleshooting Path

1. Check: Cannot combine ARM64 with these security features `[source: ado-wiki]`
2. Check: Escalate to the Kata feature owner (Fanglu Guo) `[source: ado-wiki]`
3. Check: 1) Verify KataVMIsolationPreview feature flag is registered on the subscription; 2) Ensure cluster k `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/general-troubleshooting-pod-sandboxing.md)
