# AKS ICM 与升级 -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Microsoft-KubernetesConfiguration-Escalation.md
**Generated**: 2026-04-07

---

## Phase 1: AKS LTS 版本有明确的支持时间窗口，超出后不再获得平台级别支持。Free tier 集群不享受

### aks-190: 客户 AKS 集群使用已超出 LTS 支持窗口的 Kubernetes 版本（如 1.29），询问是否仍能获得支持

**Root Cause**: AKS LTS 版本有明确的支持时间窗口，超出后不再获得平台级别支持。Free tier 集群不享受 LTS 支持

**Solution**:
1) 与 PG 协商延长特定集群的支持期限; 2) 在 ICM comments 中注明: 'Synced with PG and will extend platform level support for these clusters till {date}'; 3) 邮件中告知客户升级计划和时间表; 4) 期间如遇 support 无法解决的问题仍可开 ICM

`[Score: [G] 9.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Ephemeral OS disk feature may be enabled by defaul

### aks-108: AKS nodes with ephemeral OS disk encounter issues; remediator mechanism not avai...

**Root Cause**: Ephemeral OS disk feature may be enabled by default for supported VM sizes (API version >= 2020-11-01). When nodes have ephemeral OS disk, the remediator may not be available to auto-heal node issues. Without remediator, node recovery requires manual intervention or PG escalation.

**Solution**:
1) Use CLI flag '--node-osdisk-type Managed' to disable ephemeral and use managed disk if remediator is needed. 2) If no remediator available, raise ICM to AKS PG. 3) Do NOT proactively mention ephemeral disk issues to customer unless they specifically ask. 4) Check remediator status via cluster diagnostics.

`[Score: [B] 7.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: Mariner (CBL-Mariner/Azure Linux) is a Microsoft-o

### aks-138: AKS nodes running Mariner OS encounter OS-level issues; CSS cannot troubleshoot ...

**Root Cause**: Mariner (CBL-Mariner/Azure Linux) is a Microsoft-owned Linux distribution. OS-level issues in Mariner nodes are owned by the Mariner PG team, not the AKS support team.

**Solution**:
For Mariner OS-level issues, directly raise ICM to Mariner PG team. AKS support handles AKS-specific issues but Mariner kernel/package issues are escalated to Mariner PG.

`[Score: [B] 7.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: AKS RP ICMs require EEE team review before submiss

### aks-700: Engineer wants to raise ICM for AKS RP issue but unsure about approval process

**Root Cause**: AKS RP ICMs require EEE team review before submission to avoid noise ICMs and ensure quality

**Solution**:
1) Do NOT open ICM for AKS RP without going through EEE; 2) Consult SME/TA on Teams or Ava first; 3) Get TA approval in Teams channel; 4) Exception: weekends, can open directly if no TA available; 5) Ensure correct SAP; 6) Open from ASC; 7) Sev 2 ICM for RCA needs strong business impact + TA approval

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FProcesses%2FICM%20Quality%20Improvement%2FImproving%20Quality%20raising%20of%20ICMs)]`

## Phase 5: This error indicates an issue in the Kata software

### aks-942: Kata pod fails to start with FailedCreatePodSandBox: failed to create shim task ...

**Root Cause**: This error indicates an issue in the Kata software stack (HVLite/containerd shim layer), not a customer configuration problem.

**Solution**:
Escalate to the Kata/Pod Sandboxing feature team via ICM. This is a Kata stack bug, not resolvable by customer-side actions.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FPod%20Sandboxing%20and%20Kernel%20Isolation%20%28kata%29)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | 客户 AKS 集群使用已超出 LTS 支持窗口的 Kubernetes 版本（如 1.29），询问是否仍能获得支持 | AKS LTS 版本有明确的支持时间窗口，超出后不再获得平台级别支持。Free tier 集群不享受 LTS 支持 | 1) 与 PG 协商延长特定集群的支持期限; 2) 在 ICM comments 中注明: 'Synced with P... | [G] 9.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS nodes with ephemeral OS disk encounter issues; remediator mechanism not avai... | Ephemeral OS disk feature may be enabled by default for supp... | 1) Use CLI flag '--node-osdisk-type Managed' to disable ephe... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS nodes running Mariner OS encounter OS-level issues; CSS cannot troubleshoot ... | Mariner (CBL-Mariner/Azure Linux) is a Microsoft-owned Linux... | For Mariner OS-level issues, directly raise ICM to Mariner P... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Engineer wants to raise ICM for AKS RP issue but unsure about approval process | AKS RP ICMs require EEE team review before submission to avo... | 1) Do NOT open ICM for AKS RP without going through EEE; 2) ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FProcesses%2FICM%20Quality%20Improvement%2FImproving%20Quality%20raising%20of%20ICMs) |
| 5 | Kata pod fails to start with FailedCreatePodSandBox: failed to create shim task ... | This error indicates an issue in the Kata software stack (HV... | Escalate to the Kata/Pod Sandboxing feature team via ICM. Th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FPod%20Sandboxing%20and%20Kernel%20Isolation%20%28kata%29) |
