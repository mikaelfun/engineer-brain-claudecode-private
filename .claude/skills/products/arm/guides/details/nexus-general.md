# ARM Nexus 通用 — 综合排查指南

**条目数**: 8 | **草稿融合数**: 10 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-copilot-assisted-nexus-troubleshooting.md, ado-wiki-a-gnmi-in-nexus.md, ado-wiki-a-navigating-al-nexus-ado.md, ado-wiki-a-nexus-glossary.md, ado-wiki-a-nexus-observability.md (+5 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: rx-missed packet drops on Azure Operator Nexus tenant workload VMs running late…
> 来源: ado-wiki

**根因分析**: CPU stalls preventing timely RX ring draining due to missing CPU isolation (isolcpus/nohz_full/rcu_nocbs) and kubelet CPUAffinity not restricted in tenant VM

1. Configure kernel boot parameters: isolcpus, nohz_full, rcu_nocbs for dataplane CPUs.
2. Set kubelet CPUAffinity by creating /etc/systemd/system/kubelet.
3. d/10-cpu-affinity.
4. conf with [Service] CPUAffinity=0 1, then restart node.
5. This is tenant-managed, not a Nexus platform defect.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: ingress_overload or similar dataplane drops on Azure Operator Nexus tenant VMs,…
> 来源: ado-wiki

**根因分析**: Longer kernel stalls from shared CPU scheduling without isolation; scheduler ticks and RCU callbacks interrupt dataplane threads

1. Add kernel boot params: isolcpus=<dataplane-cpus> nohz_full=<dataplane-cpus> rcu_nocbs=<dataplane-cpus>.
2. Suppresses scheduler tick, removes CPUs from normal scheduling, offloads RCU callbacks.
3. Requires node reboot.
4. Validate with: cat /proc/cmdline.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: kubelet housekeeping preempts dataplane threads on Nexus tenant VM, causing int…
> 来源: ado-wiki

**根因分析**: kubelet CPUAffinity not set - by default kubelet runs on all CPUs including dataplane cores

1. Create kubelet CPU affinity drop-in: sudo mkdir -p /etc/systemd/system/kubelet.
2. d && create 10-cpu-affinity.
3. conf with [Service] CPUAffinity=0 1.
4. Run systemctl daemon-reload && systemctl restart kubelet.
5. Verify with: systemctl show -p CPUAffinity kubelet.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Azure Operator Nexus VM lifecycle operations (e.g. DELETE) fail with HTTP 5xx e…
> 来源: ado-wiki

**根因分析**: Transient TLS handshake failures caused by: 1) control plane load/concurrency exhausting connection/thread/CPU pools, 2) network-level packet loss or latency spikes, 3) downstream component restarts or rolling updates, 4) certificate chain validation latency

1. 1) Retry the operation - single TLS handshake timeouts are expected transient phenomena by design.
2. 2) Correlate across ARM -> RPaaS -> NetworkCloud -> Proxy layers.
3. 3) Check K8BridgeProxyTraces for TLS handshake timeout.
4. 4) If retry succeeds, benign.
5. 5) Escalate only if repeated failures across multiple customers/clusters or sustained control-plane unavailability.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Azure Operator Nexus network device metrics (e.g. Lldp Tlv Discards) show no da…
> 来源: ado-wiki

**根因分析**: Counter-based metrics only emit when the underlying counter increments; no zero values emitted. When no relevant events occur, metric produces no data points. By design, not telemetry failure. Known doc gap raised as repair item (ref IcM 21000000919452)

1. Explain to customer that no data is expected behavior for counter-based metrics when no events occur.
2. Verify other metrics flow normally to confirm telemetry pipeline is healthy.
3. Reference SR 2602120040006666 and IcM 21000000919452.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: IPv6 connectivity fails while IPv4 works in PCT lab environment; issue impacts …
> 来源: ado-wiki

**根因分析**: IPv6 was added to VNET after ExpressRoute gateway creation. Gateway did not advertise IPv6 routes until redeployed. Not a Nexus defect.

1. Route to Azure ExpressRoute - Connectivity and Performance (Private Peering) team.
2. VNET gateway must be redeployed after IPv6 configuration on VNET.
3. CSS should validate Nexus/NAKS health, confirm out-of-scope indicators, then escalate to correct infrastructure owner.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Azure Portal Diagnostic Settings blade shows 'The limit of 5 diagnostic setting…
> 来源: ado-wiki

**根因分析**: Orphaned diagnostic settings referencing deprecated IDRACLogs category remain in resource configuration but are not visible in portal, consuming the 5-setting limit.

1. Delete orphaned diagnostic settings via REST API (portal cannot delete them): az rest --method delete --url 'https://management.
2. com/<resource-URI>/providers/microsoft.
3. insights/diagnosticSettings/<setting-name>?api-version=2021-05-01-preview'.
4. Collect browser trace (.
5. har) from customer to identify orphaned setting names.
6. After deletion, verify portal displays correct list.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Customer submits a Nexus support case requesting a new feature or reporting uns…
> 来源: ado-wiki

1. Follow guidance at https://dev.
2. com/msazuredev/AzureForOperatorsIndustry/_wiki/wikis/AzureForOperatorsIndustry.
3. wiki/30560 (When Support Requests are design questions or feature requests).
4. Check existing tracked feature requests at https://dev.
5. com/msazuredev/AzureForOperatorsIndustry/_queries/query/e3c5246c-3084-4443-9a4c-434975b4138b/ (AT&T-requested features have ART-<NNN> prefix on their title).

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| rx-missed packet drops on Azure Operator Nexus tenant workl… | CPU stalls preventing timely RX ring draining due to missin… | Configure kernel boot parameters: isolcpus, nohz_full, rcu_… |
| ingress_overload or similar dataplane drops on Azure Operat… | Longer kernel stalls from shared CPU scheduling without iso… | Add kernel boot params: isolcpus=<dataplane-cpus> nohz_full… |
| kubelet housekeeping preempts dataplane threads on Nexus te… | kubelet CPUAffinity not set - by default kubelet runs on al… | Create kubelet CPU affinity drop-in: sudo mkdir -p /etc/sys… |
| Azure Operator Nexus VM lifecycle operations (e.g. DELETE) … | Transient TLS handshake failures caused by: 1) control plan… | 1) Retry the operation - single TLS handshake timeouts are … |
| Azure Operator Nexus network device metrics (e.g. Lldp Tlv … | Counter-based metrics only emit when the underlying counter… | Explain to customer that no data is expected behavior for c… |
| IPv6 connectivity fails while IPv4 works in PCT lab environ… | IPv6 was added to VNET after ExpressRoute gateway creation.… | Route to Azure ExpressRoute - Connectivity and Performance … |
| Azure Portal Diagnostic Settings blade shows 'The limit of … | Orphaned diagnostic settings referencing deprecated IDRACLo… | Delete orphaned diagnostic settings via REST API (portal ca… |
| Customer submits a Nexus support case requesting a new feat… | — | Follow guidance at https://dev.azure.com/msazuredev/AzureFo… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | rx-missed packet drops on Azure Operator Nexus tenant workload VMs running latency-sensitive datapl… | CPU stalls preventing timely RX ring draining due to missing CPU isolation (isolcpus/nohz_full/rcu_… | Configure kernel boot parameters: isolcpus, nohz_full, rcu_nocbs for dataplane CPUs. Set kubelet CP… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | ingress_overload or similar dataplane drops on Azure Operator Nexus tenant VMs, with regular millis… | Longer kernel stalls from shared CPU scheduling without isolation; scheduler ticks and RCU callback… | Add kernel boot params: isolcpus=<dataplane-cpus> nohz_full=<dataplane-cpus> rcu_nocbs=<dataplane-c… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | kubelet housekeeping preempts dataplane threads on Nexus tenant VM, causing intermittent performanc… | kubelet CPUAffinity not set - by default kubelet runs on all CPUs including dataplane cores | Create kubelet CPU affinity drop-in: sudo mkdir -p /etc/systemd/system/kubelet.service.d && create … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Operator Nexus VM lifecycle operations (e.g. DELETE) fail with HTTP 5xx errors; K8BridgeProxy… | Transient TLS handshake failures caused by: 1) control plane load/concurrency exhausting connection… | 1) Retry the operation - single TLS handshake timeouts are expected transient phenomena by design. … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Azure Operator Nexus network device metrics (e.g. Lldp Tlv Discards) show no data / empty graph in … | Counter-based metrics only emit when the underlying counter increments; no zero values emitted. Whe… | Explain to customer that no data is expected behavior for counter-based metrics when no events occu… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | IPv6 connectivity fails while IPv4 works in PCT lab environment; issue impacts multiple Nexus clust… | IPv6 was added to VNET after ExpressRoute gateway creation. Gateway did not advertise IPv6 routes u… | Route to Azure ExpressRoute - Connectivity and Performance (Private Peering) team. VNET gateway mus… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure Portal Diagnostic Settings blade shows 'The limit of 5 diagnostic settings was reached' but f… | Orphaned diagnostic settings referencing deprecated IDRACLogs category remain in resource configura… | Delete orphaned diagnostic settings via REST API (portal cannot delete them): az rest --method dele… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Customer submits a Nexus support case requesting a new feature or reporting unsupported Nexus funct… | — | Follow guidance at https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_wiki/wikis/AzureForO… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
