# ARM Nexus 网络 — 排查速查

**来源数**: 5 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | During NF wipe and repave, instance appears active in Azure portal despite being in maintenance mod… | Internal state transitions for Network Fabric instances are not exposed in the Azure portal UI. Thi… | 1) Use internal tools (Fabric Control Plane or Instance State Viewer) to verify actual state. 2) Cr… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | L2 network creation fails with errors related to Kubernetes cluster connectivity during NF (Network… | Hybrid connection agent is not connected or the NAKS cluster is unhealthy, preventing L2 network pr… | 1) Identify target NAKS cluster from instance metadata. 2) Run kubectl get nodes and kubectl get po… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Azure Operator Nexus resources (NFC, Network Fabric, Cluster) not visible in Azure Portal despite b… | Resources that fail early in provisioning may not complete registration in ARM. Azure Portal only d… | Use Azure CLI to verify provisioning state. Check Activity Logs for delete operations. Review backe… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Network Fabric password rotation fails with connectivity errors; devices remain Out of Sync after r… | Transient connectivity failures between Network Fabric Controller and fabric devices during passwor… | Built-in retry logic handles transient issues. For persistent failures, trigger resync for failed d… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Network Fabric upgrade is blocked; cannot upgrade fabric to newer version. Upgrade operation fails … | Fabric upgrades are blocked if any device passwords are Out of Sync after a failed or partial passw… | Resync all Out of Sync device passwords before attempting fabric upgrade. Use: az networkfabric dev… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. 1) Use internal tools (Fabric Control Plane or Instance State Viewer) to verify… `[来源: ado-wiki]`
2. 1) Identify target NAKS cluster from instance metadata. 2) Run kubectl get node… `[来源: ado-wiki]`
3. Use Azure CLI to verify provisioning state. Check Activity Logs for delete oper… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/nexus-networking.md#排查流程)
