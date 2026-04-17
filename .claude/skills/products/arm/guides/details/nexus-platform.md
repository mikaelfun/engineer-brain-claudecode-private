# ARM Nexus 平台与 NAKS — 综合排查指南

**条目数**: 3 | **草稿融合数**: 10 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-copilot-assisted-nexus-troubleshooting.md, ado-wiki-a-gnmi-in-nexus.md, ado-wiki-a-navigating-al-nexus-ado.md, ado-wiki-a-nexus-glossary.md, ado-wiki-a-nexus-observability.md (+5 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: NAKS (Nexus AKS) log collector script cannot be operated or fails to run on the…
> 来源: ado-wiki

**根因分析**: Collector script may fail due to environment-specific issues on NAKS cluster; script execution depends on cluster accessibility and proper node connectivity

1. 1) SSH to Control Plane node via az connectedk8s proxy or direct SSH.
2. 2) Manually export cloud-init logs: /var/log/cloud-init.
3. log and /var/log/cloud-init-output.
4. 3) If customer cannot copy logs via standard method, create az ssh config with az ssh config --subscription <subId> --local-user azureuser --private-key-file <file> --resource-group <rg> --name <name> --resource-type Microsoft.
5. HybridCompute/machines --port 22 -f <ssh-config-file> then use scp -O -F <ssh-config-file> <path>/node_name_date.
6. gz to copy files.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: NAKS KubernetesCluster CR has status.terminal=true; nc-aks-operator stops all r…
> 来源: ado-wiki

**根因分析**: Terminal state is set when nc-aks-operator encounters an unrecoverable condition. Once terminal=true, all reconciliation stops permanently until manually cleared.

1. Requires DRI action: kubectl -n nc-system patch kubernetescluster <NAME> --subresource=status --type merge --patch with status.
2. terminal set to false.
3. Collect minimum evidence before escalation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: NAKS Arc resource shows disconnected or not-connected status; customer cannot m…
> 来源: ado-wiki

**根因分析**: Arc connectivity agent (datasyncservice) lost communication with Azure. Various causes including network issues, agent failures, or certificate expiry.

1. Query K8ConnectRPLogs via ARC Infra Kusto (azarccoreprod.
2. net, database K8ConnectRP) to check connectivityStatus timeline.
3. Filter by ServiceName=datasyncservice and ArmId containing subscription/NAKS name.
4. See guide: guides/drafts/ado-wiki-a-arc-infra-kusto-repo.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| NAKS (Nexus AKS) log collector script cannot be operated or… | Collector script may fail due to environment-specific issue… | 1) SSH to Control Plane node via az connectedk8s proxy or d… |
| NAKS KubernetesCluster CR has status.terminal=true; nc-aks-… | Terminal state is set when nc-aks-operator encounters an un… | Requires DRI action: kubectl -n nc-system patch kubernetesc… |
| NAKS Arc resource shows disconnected or not-connected statu… | Arc connectivity agent (datasyncservice) lost communication… | Query K8ConnectRPLogs via ARC Infra Kusto (azarccoreprod.ea… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | NAKS (Nexus AKS) log collector script cannot be operated or fails to run on the cluster; customer u… | Collector script may fail due to environment-specific issues on NAKS cluster; script execution depe… | 1) SSH to Control Plane node via az connectedk8s proxy or direct SSH. 2) Manually export cloud-init… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | NAKS KubernetesCluster CR has status.terminal=true; nc-aks-operator stops all reconciliation; clust… | Terminal state is set when nc-aks-operator encounters an unrecoverable condition. Once terminal=tru… | Requires DRI action: kubectl -n nc-system patch kubernetescluster <NAME> --subresource=status --typ… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | NAKS Arc resource shows disconnected or not-connected status; customer cannot manage NAKS cluster f… | Arc connectivity agent (datasyncservice) lost communication with Azure. Various causes including ne… | Query K8ConnectRPLogs via ARC Infra Kusto (azarccoreprod.eastus.kusto.windows.net, database K8Conne… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
