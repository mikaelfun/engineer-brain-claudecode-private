# ARM Nexus 平台与 NAKS — 排查速查

**来源数**: 3 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | NAKS (Nexus AKS) log collector script cannot be operated or fails to run on the cluster; customer u… | Collector script may fail due to environment-specific issues on NAKS cluster; script execution depe… | 1) SSH to Control Plane node via az connectedk8s proxy or direct SSH. 2) Manually export cloud-init… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | NAKS KubernetesCluster CR has status.terminal=true; nc-aks-operator stops all reconciliation; clust… | Terminal state is set when nc-aks-operator encounters an unrecoverable condition. Once terminal=tru… | Requires DRI action: kubectl -n nc-system patch kubernetescluster <NAME> --subresource=status --typ… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | NAKS Arc resource shows disconnected or not-connected status; customer cannot manage NAKS cluster f… | Arc connectivity agent (datasyncservice) lost communication with Azure. Various causes including ne… | Query K8ConnectRPLogs via ARC Infra Kusto (azarccoreprod.eastus.kusto.windows.net, database K8Conne… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. 1) SSH to Control Plane node via az connectedk8s proxy or direct SSH. 2) Manual… `[来源: ado-wiki]`
2. Requires DRI action: kubectl -n nc-system patch kubernetescluster <NAME> --subr… `[来源: ado-wiki]`
3. Query K8ConnectRPLogs via ARC Infra Kusto (azarccoreprod.eastus.kusto.windows.n… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/nexus-platform.md#排查流程)
