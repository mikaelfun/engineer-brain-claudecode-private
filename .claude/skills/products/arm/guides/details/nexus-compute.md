# ARM Nexus 计算与 BMM — 综合排查指南

**条目数**: 9 | **草稿融合数**: 14 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-bmm-replacement-process.md, ado-wiki-a-collecting-tsr-from-bmm.md, ado-wiki-a-copilot-assisted-nexus-troubleshooting.md, ado-wiki-a-gnmi-in-nexus.md, ado-wiki-a-navigating-al-nexus-ado.md (+9 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: CMBU fails when invalid or non-existent target version is specified for Geneva …
> 来源: ado-wiki

**根因分析**: No RP-side validation exists for CMBU target version. Invalid version passes through RP and fails at Cluster Manager level.

1. Validate target version before triggering Geneva Action.
2. If failed, retry with correct/valid version to resume the update.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: CMBU update halts after first cluster fails; remaining clusters not updated; co…
> 来源: ado-wiki

**根因分析**: CMBU failure propagation logic halts all updates when first cluster fails to prevent cascading failures across the fleet. Concurrency is set to 0.

1. Resume update using Geneva action: Resume-CMU -ClusterManager <name>.
2. This sets spec.
3. resumeUpdate=true in the cluster CR.
4. Monitor first cluster closely as it determines fleet-wide progression.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: BMM node temporarily cordoned due to transient network instability; PortDownPro…
> 来源: ado-wiki

**根因分析**: Transient eth0 down on single BMM node causes PortDown/PortFlapping conditions, triggering automatic cordon. Issue is isolated to single node, not cluster-wide.

1. No action needed for transient events.
2. Verify: BmmNetworkLinksUp stabilized, hwvalidation-failed is false, provisioningState is provisioned, cordonStatus is Uncordoned.
3. Check degradedStartTime/degradedEndTime to confirm self-resolution.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Engineers misinterpret BMM provisioningState as operational health; provisionin…
> 来源: ado-wiki

**根因分析**: provisioningState only tracks ARM-initiated PUT/PATCH operations (creation, replace, reimage, tag updates). A failed tag-only update sets provisioningState to Failed without any impact on machine health or readiness.

1. Use detailedStatus and detailedStatusMessage for operational state assessment.
2. readyState indicates cluster eligibility.
3. Never use provisioningState for operational decisions, troubleshooting, or escalation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: CMBU upgrade from 4.8.5 to 4.9.7 fails; Nexus overlay extension update fails wi…
> 来源: ado-wiki

**根因分析**: hybridaksclusters CRD storedVersions contains stale v1 entry conflicting with spec.versions due to mid-migration state, causing Kubernetes to reject the extension update.

1. Use Geneva Action RetrieveKubernetesResource to check hybridaksclusters CRDs.
2. If storedVersions has v1, use ClusterExecuteScript GA with Lockbox to delete stale CRDs: kubectl delete crd hybridaksclusters.
3. com hybridaksclusters.
4. infrastructure.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: BMM Replace operation fails after motherboard replacement when using --storage-…
> 来源: ado-wiki

**根因分析**: After motherboard replacement, the TPM key changes. With storage-policy Preserve, the system validates the previous TPM key, causing a mismatch and preventing Replace from completing.

1. Run BMM Replace with --storage-policy DiscardAll instead of Preserve.
2. Verify by asking customer if motherboard was replaced and if Preserve policy was used, or check onprembmcloudinitlogs for TPM error: WARNING:esys:src/tss2-esys/api/Esys_Load.
3. c:324:Esys_Load_Finish() Received TPM Error.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: BMM Replace fails with --storage-policy Preserve due to stale BMC password. Aut…
> 来源: ado-wiki

**根因分析**: A stale BMC password caused by a failed credential rotation (typically following hardware issues). The system fails authentication with the old password from environment variable $PASSWORD.

1. Run BMM Replace with --storage-policy DiscardAll.
2. Verify by checking onprembmcloudinitlogs for: Password from environment variable $PASSWORD did not work: Operation not permitted.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Azure CLI run-data-extract command for BMM TSR collection fails with BMMRunData…
> 来源: ado-wiki

**根因分析**: Default or low --limit-time-seconds value (e.g. 600 seconds) is insufficient for hardware-support-data-collection to complete.

1. Increase --limit-time-seconds to 1000 or higher.
2. Preferred method: collect TSR via iDRAC9 (Maintenance > SupportAssist > Export SupportAssist Collection).
3. If both methods fail, node responsiveness is the underlying issue.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: NAKS worker nodes show NotReady, stuck in Terminating, or pods stuck in Pending…
> 来源: ado-wiki

**根因分析**: Underlying Bare Metal Machine (BMM) hosting the NAKS node is unhealthy/unreachable/degraded (readyState=False, hardware failure, PXE port unhealthy, or power state mismatch). NAKS nodes run directly on BMMs.

1. First validate Kubernetes-level causes.
2. If not explanatory: 1) Identify hosting BMM via CSS Nexus Dashboard or Kusto, 2) Inspect BMM health (az networkcloud baremetalmachine show), check readyState/powerState/detailedStatus, 3) If BMM unhealthy, escalate to BMM/Undercloud SRE.
3. Do NOT recommend node deletion while BMM remediation is ongoing.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| CMBU fails when invalid or non-existent target version is s… | No RP-side validation exists for CMBU target version. Inval… | Validate target version before triggering Geneva Action. If… |
| CMBU update halts after first cluster fails; remaining clus… | CMBU failure propagation logic halts all updates when first… | Resume update using Geneva action: Resume-CMU -ClusterManag… |
| BMM node temporarily cordoned due to transient network inst… | Transient eth0 down on single BMM node causes PortDown/Port… | No action needed for transient events. Verify: BmmNetworkLi… |
| Engineers misinterpret BMM provisioningState as operational… | provisioningState only tracks ARM-initiated PUT/PATCH opera… | Use detailedStatus and detailedStatusMessage for operationa… |
| CMBU upgrade from 4.8.5 to 4.9.7 fails; Nexus overlay exten… | hybridaksclusters CRD storedVersions contains stale v1 entr… | Use Geneva Action RetrieveKubernetesResource to check hybri… |
| BMM Replace operation fails after motherboard replacement w… | After motherboard replacement, the TPM key changes. With st… | Run BMM Replace with --storage-policy DiscardAll instead of… |
| BMM Replace fails with --storage-policy Preserve due to sta… | A stale BMC password caused by a failed credential rotation… | Run BMM Replace with --storage-policy DiscardAll. Verify by… |
| Azure CLI run-data-extract command for BMM TSR collection f… | Default or low --limit-time-seconds value (e.g. 600 seconds… | Increase --limit-time-seconds to 1000 or higher. Preferred … |
| NAKS worker nodes show NotReady, stuck in Terminating, or p… | Underlying Bare Metal Machine (BMM) hosting the NAKS node i… | First validate Kubernetes-level causes. If not explanatory:… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | CMBU fails when invalid or non-existent target version is specified for Geneva Action; Cluster Mana… | No RP-side validation exists for CMBU target version. Invalid version passes through RP and fails a… | Validate target version before triggering Geneva Action. If failed, retry with correct/valid versio… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | CMBU update halts after first cluster fails; remaining clusters not updated; concurrency set to 0; … | CMBU failure propagation logic halts all updates when first cluster fails to prevent cascading fail… | Resume update using Geneva action: Resume-CMU -ClusterManager <name>. This sets spec.resumeUpdate=t… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | BMM node temporarily cordoned due to transient network instability; PortDownProblem or PortFlapping… | Transient eth0 down on single BMM node causes PortDown/PortFlapping conditions, triggering automati… | No action needed for transient events. Verify: BmmNetworkLinksUp stabilized, hwvalidation-failed is… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Engineers misinterpret BMM provisioningState as operational health; provisioningState shows Failed … | provisioningState only tracks ARM-initiated PUT/PATCH operations (creation, replace, reimage, tag u… | Use detailedStatus and detailedStatusMessage for operational state assessment. readyState indicates… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | CMBU upgrade from 4.8.5 to 4.9.7 fails; Nexus overlay extension update fails with Helm timeout and … | hybridaksclusters CRD storedVersions contains stale v1 entry conflicting with spec.versions due to … | Use Geneva Action RetrieveKubernetesResource to check hybridaksclusters CRDs. If storedVersions has… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | BMM Replace operation fails after motherboard replacement when using --storage-policy Preserve. TPM… | After motherboard replacement, the TPM key changes. With storage-policy Preserve, the system valida… | Run BMM Replace with --storage-policy DiscardAll instead of Preserve. Verify by asking customer if … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | BMM Replace fails with --storage-policy Preserve due to stale BMC password. Authentication fails wh… | A stale BMC password caused by a failed credential rotation (typically following hardware issues). … | Run BMM Replace with --storage-policy DiscardAll. Verify by checking onprembmcloudinitlogs for: Pas… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Azure CLI run-data-extract command for BMM TSR collection fails with BMMRunDataExtractCMDReconcilia… | Default or low --limit-time-seconds value (e.g. 600 seconds) is insufficient for hardware-support-d… | Increase --limit-time-seconds to 1000 or higher. Preferred method: collect TSR via iDRAC9 (Maintena… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | NAKS worker nodes show NotReady, stuck in Terminating, or pods stuck in Pending. Kubernetes-level t… | Underlying Bare Metal Machine (BMM) hosting the NAKS node is unhealthy/unreachable/degraded (readyS… | First validate Kubernetes-level causes. If not explanatory: 1) Identify hosting BMM via CSS Nexus D… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
