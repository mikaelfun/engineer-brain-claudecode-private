# ARM Nexus 计算与 BMM — 排查速查

**来源数**: 9 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | CMBU fails when invalid or non-existent target version is specified for Geneva Action; Cluster Mana… | No RP-side validation exists for CMBU target version. Invalid version passes through RP and fails a… | Validate target version before triggering Geneva Action. If failed, retry with correct/valid versio… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | CMBU update halts after first cluster fails; remaining clusters not updated; concurrency set to 0; … | CMBU failure propagation logic halts all updates when first cluster fails to prevent cascading fail… | Resume update using Geneva action: Resume-CMU -ClusterManager <name>. This sets spec.resumeUpdate=t… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | BMM node temporarily cordoned due to transient network instability; PortDownProblem or PortFlapping… | Transient eth0 down on single BMM node causes PortDown/PortFlapping conditions, triggering automati… | No action needed for transient events. Verify: BmmNetworkLinksUp stabilized, hwvalidation-failed is… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Engineers misinterpret BMM provisioningState as operational health; provisioningState shows Failed … | provisioningState only tracks ARM-initiated PUT/PATCH operations (creation, replace, reimage, tag u… | Use detailedStatus and detailedStatusMessage for operational state assessment. readyState indicates… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | CMBU upgrade from 4.8.5 to 4.9.7 fails; Nexus overlay extension update fails with Helm timeout and … | hybridaksclusters CRD storedVersions contains stale v1 entry conflicting with spec.versions due to … | Use Geneva Action RetrieveKubernetesResource to check hybridaksclusters CRDs. If storedVersions has… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | BMM Replace operation fails after motherboard replacement when using --storage-policy Preserve. TPM… | After motherboard replacement, the TPM key changes. With storage-policy Preserve, the system valida… | Run BMM Replace with --storage-policy DiscardAll instead of Preserve. Verify by asking customer if … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | BMM Replace fails with --storage-policy Preserve due to stale BMC password. Authentication fails wh… | A stale BMC password caused by a failed credential rotation (typically following hardware issues). … | Run BMM Replace with --storage-policy DiscardAll. Verify by checking onprembmcloudinitlogs for: Pas… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Azure CLI run-data-extract command for BMM TSR collection fails with BMMRunDataExtractCMDReconcilia… | Default or low --limit-time-seconds value (e.g. 600 seconds) is insufficient for hardware-support-d… | Increase --limit-time-seconds to 1000 or higher. Preferred method: collect TSR via iDRAC9 (Maintena… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | NAKS worker nodes show NotReady, stuck in Terminating, or pods stuck in Pending. Kubernetes-level t… | Underlying Bare Metal Machine (BMM) hosting the NAKS node is unhealthy/unreachable/degraded (readyS… | First validate Kubernetes-level causes. If not explanatory: 1) Identify hosting BMM via CSS Nexus D… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Validate target version before triggering Geneva Action. If failed, retry with … `[来源: ado-wiki]`
2. Resume update using Geneva action: Resume-CMU -ClusterManager <name>. This sets… `[来源: ado-wiki]`
3. No action needed for transient events. Verify: BmmNetworkLinksUp stabilized, hw… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/nexus-compute.md#排查流程)
