# AKS ICM 与升级 -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | 客户 AKS 集群使用已超出 LTS 支持窗口的 Kubernetes 版本（如 1.29），询问是否仍能获得支持 | AKS LTS 版本有明确的支持时间窗口，超出后不再获得平台级别支持。Free tier 集群不享受 LTS 支持 | 1) 与 PG 协商延长特定集群的支持期限; 2) 在 ICM comments 中注明: 'Synced with P... | [G] 9.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS nodes with ephemeral OS disk encounter issues; remediator mechanism not avai... | Ephemeral OS disk feature may be enabled by default for supp... | 1) Use CLI flag '--node-osdisk-type Managed' to disable ephe... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS nodes running Mariner OS encounter OS-level issues; CSS cannot troubleshoot ... | Mariner (CBL-Mariner/Azure Linux) is a Microsoft-owned Linux... | For Mariner OS-level issues, directly raise ICM to Mariner P... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Engineer wants to raise ICM for AKS RP issue but unsure about approval process | AKS RP ICMs require EEE team review before submission to avo... | 1) Do NOT open ICM for AKS RP without going through EEE; 2) ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FProcesses%2FICM%20Quality%20Improvement%2FImproving%20Quality%20raising%20of%20ICMs) |
| 5 | Kata pod fails to start with FailedCreatePodSandBox: failed to create shim task ... | This error indicates an issue in the Kata software stack (HV... | Escalate to the Kata/Pod Sandboxing feature team via ICM. Th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FPod%20Sandboxing%20and%20Kernel%20Isolation%20%28kata%29) |

## Quick Troubleshooting Path

1. Check: 1) 与 PG 协商延长特定集群的支持期限; 2) 在 ICM comments 中注明: 'Synced with PG and will extend platform level support `[source: onenote]`
2. Check: 1) Use CLI flag '--node-osdisk-type Managed' to disable ephemeral and use managed disk if remediator `[source: onenote]`
3. Check: For Mariner OS-level issues, directly raise ICM to Mariner PG team `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/icm-escalation.md)
