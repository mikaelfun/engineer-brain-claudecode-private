# ARM Nexus 网络 — 综合排查指南

**条目数**: 5 | **草稿融合数**: 18 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-Invoke-AzsSupportSdnResourceRequest.md, ado-wiki-a-copilot-assisted-nexus-troubleshooting.md, ado-wiki-a-gnmi-in-nexus.md, ado-wiki-a-install-the-sdn-diagnostics-module.md, ado-wiki-a-navigating-al-nexus-ado.md (+13 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: During NF wipe and repave, instance appears active in Azure portal despite bein…
> 来源: ado-wiki

**根因分析**: Internal state transitions for Network Fabric instances are not exposed in the Azure portal UI. This is a known limitation.

1. 1) Use internal tools (Fabric Control Plane or Instance State Viewer) to verify actual state.
2. 2) Cross-check with telemetry logs.
3. 3) Notify customer portal may not reflect current state.
4. 4) Document discrepancy.
5. 5) File low-priority ICM but proceed if internal state is valid.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: L2 network creation fails with errors related to Kubernetes cluster connectivit…
> 来源: ado-wiki

**根因分析**: Hybrid connection agent is not connected or the NAKS cluster is unhealthy, preventing L2 network provisioning.

1. 1) Identify target NAKS cluster from instance metadata.
2. 2) Run kubectl get nodes and kubectl get pods -A.
3. 3) Check hybrid connection agent status, restart if unresponsive.
4. 4) Validate ports and DNS.
5. 5) Retry L2 network creation.
6. 6) If persists, collect logs and escalate.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Azure Operator Nexus resources (NFC, Network Fabric, Cluster) not visible in Az…
> 来源: ado-wiki

**根因分析**: Resources that fail early in provisioning may not complete registration in ARM. Azure Portal only displays resources fully materialized in ARM.

1. Use Azure CLI to verify provisioning state.
2. Check Activity Logs for delete operations.
3. Review backend logs with correlation IDs.
4. Validate RBAC permissions and propagation timing.
5. If transient, retry creation without deleting the resource.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Network Fabric password rotation fails with connectivity errors; devices remain…
> 来源: ado-wiki

**根因分析**: Transient connectivity failures between Network Fabric Controller and fabric devices during password rotation process. Most common cause of rotation errors.

1. Built-in retry logic handles transient issues.
2. For persistent failures, trigger resync for failed devices: az networkfabric device resync-password --resource-id <device_resource_id>.
3. Error messages provide actionable next steps.
4. Always attempt resync before opening support cases.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Network Fabric upgrade is blocked; cannot upgrade fabric to newer version. Upgr…
> 来源: ado-wiki

**根因分析**: Fabric upgrades are blocked if any device passwords are Out of Sync after a failed or partial password rotation.

1. Resync all Out of Sync device passwords before attempting fabric upgrade.
2. Use: az networkfabric device resync-password --resource-id <device_resource_id> for each affected device.
3. Monitor synchronization status until all devices show In Sync.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| During NF wipe and repave, instance appears active in Azure… | Internal state transitions for Network Fabric instances are… | 1) Use internal tools (Fabric Control Plane or Instance Sta… |
| L2 network creation fails with errors related to Kubernetes… | Hybrid connection agent is not connected or the NAKS cluste… | 1) Identify target NAKS cluster from instance metadata. 2) … |
| Azure Operator Nexus resources (NFC, Network Fabric, Cluste… | Resources that fail early in provisioning may not complete … | Use Azure CLI to verify provisioning state. Check Activity … |
| Network Fabric password rotation fails with connectivity er… | Transient connectivity failures between Network Fabric Cont… | Built-in retry logic handles transient issues. For persiste… |
| Network Fabric upgrade is blocked; cannot upgrade fabric to… | Fabric upgrades are blocked if any device passwords are Out… | Resync all Out of Sync device passwords before attempting f… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | During NF wipe and repave, instance appears active in Azure portal despite being in maintenance mod… | Internal state transitions for Network Fabric instances are not exposed in the Azure portal UI. Thi… | 1) Use internal tools (Fabric Control Plane or Instance State Viewer) to verify actual state. 2) Cr… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | L2 network creation fails with errors related to Kubernetes cluster connectivity during NF (Network… | Hybrid connection agent is not connected or the NAKS cluster is unhealthy, preventing L2 network pr… | 1) Identify target NAKS cluster from instance metadata. 2) Run kubectl get nodes and kubectl get po… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Azure Operator Nexus resources (NFC, Network Fabric, Cluster) not visible in Azure Portal despite b… | Resources that fail early in provisioning may not complete registration in ARM. Azure Portal only d… | Use Azure CLI to verify provisioning state. Check Activity Logs for delete operations. Review backe… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Network Fabric password rotation fails with connectivity errors; devices remain Out of Sync after r… | Transient connectivity failures between Network Fabric Controller and fabric devices during passwor… | Built-in retry logic handles transient issues. For persistent failures, trigger resync for failed d… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Network Fabric upgrade is blocked; cannot upgrade fabric to newer version. Upgrade operation fails … | Fabric upgrades are blocked if any device passwords are Out of Sync after a failed or partial passw… | Resync all Out of Sync device passwords before attempting fabric upgrade. Use: az networkfabric dev… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
