# ARM Nexus 通用 — 排查速查

**来源数**: 8 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | rx-missed packet drops on Azure Operator Nexus tenant workload VMs running latency-sensitive datapl… | CPU stalls preventing timely RX ring draining due to missing CPU isolation (isolcpus/nohz_full/rcu_… | Configure kernel boot parameters: isolcpus, nohz_full, rcu_nocbs for dataplane CPUs. Set kubelet CP… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | ingress_overload or similar dataplane drops on Azure Operator Nexus tenant VMs, with regular millis… | Longer kernel stalls from shared CPU scheduling without isolation; scheduler ticks and RCU callback… | Add kernel boot params: isolcpus=<dataplane-cpus> nohz_full=<dataplane-cpus> rcu_nocbs=<dataplane-c… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | kubelet housekeeping preempts dataplane threads on Nexus tenant VM, causing intermittent performanc… | kubelet CPUAffinity not set - by default kubelet runs on all CPUs including dataplane cores | Create kubelet CPU affinity drop-in: sudo mkdir -p /etc/systemd/system/kubelet.service.d && create … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Azure Operator Nexus VM lifecycle operations (e.g. DELETE) fail with HTTP 5xx errors; K8BridgeProxy… | Transient TLS handshake failures caused by: 1) control plane load/concurrency exhausting connection… | 1) Retry the operation - single TLS handshake timeouts are expected transient phenomena by design. … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Azure Operator Nexus network device metrics (e.g. Lldp Tlv Discards) show no data / empty graph in … | Counter-based metrics only emit when the underlying counter increments; no zero values emitted. Whe… | Explain to customer that no data is expected behavior for counter-based metrics when no events occu… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | IPv6 connectivity fails while IPv4 works in PCT lab environment; issue impacts multiple Nexus clust… | IPv6 was added to VNET after ExpressRoute gateway creation. Gateway did not advertise IPv6 routes u… | Route to Azure ExpressRoute - Connectivity and Performance (Private Peering) team. VNET gateway mus… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Azure Portal Diagnostic Settings blade shows 'The limit of 5 diagnostic settings was reached' but f… | Orphaned diagnostic settings referencing deprecated IDRACLogs category remain in resource configura… | Delete orphaned diagnostic settings via REST API (portal cannot delete them): az rest --method dele… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Customer submits a Nexus support case requesting a new feature or reporting unsupported Nexus funct… | — | Follow guidance at https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_wiki/wikis/AzureForO… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Configure kernel boot parameters: isolcpus, nohz_full, rcu_nocbs for dataplane … `[来源: ado-wiki]`
2. Add kernel boot params: isolcpus=<dataplane-cpus> nohz_full=<dataplane-cpus> rc… `[来源: ado-wiki]`
3. Create kubelet CPU affinity drop-in: sudo mkdir -p /etc/systemd/system/kubelet.… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/nexus-general.md#排查流程)
