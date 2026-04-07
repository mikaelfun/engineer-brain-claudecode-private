# Networking NSG 与 Network Watcher — 综合排查指南

**条目数**: 7 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: [mslearn-nsg-resource-logging.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 网络与路由
> 来源: mslearn + onenote

1. **Unmanaged Service Fabric Cluster - Service Fabric Explorer is unreachable, telnet to port fails**
   - 根因: Unlike Managed SF Clusters, unmanaged SF clusters created via Portal do not automatically create NSG inbound security rules on the VNET, blocking access to SF Explorer ports
   - 方案: Create 3 NSG inbound security rules (for SF Explorer, client connection, and application ports) and associate the NSG to the Service Fabric Cluster VNet subnet
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/2.4 非托管Service Fabric Cluster无法打开 Explorer.md]`

2. **NSG Flow Log JSON files from Azure Storage are difficult to read - raw format lacks human-readable timestamps**
   - 根因: NSG Flow Logs stored in JSON with Unix timestamps, making manual analysis cumbersome
   - 方案: Use NSGFlowLogFormatter.exe: place .json files in same directory, run tool, generates formatted_xxx.json with readable timestamps
   `[结论: 🟢 8.5/10 — onenote] [MCVKB/3.10 [NSG] NSG Flow Log Formatting Tool.md]`

3. **Network traffic unexpectedly blocked despite having an NSG allow rule - a higher-priority deny rule (lower priority numb**
   - 根因: NSG rules are evaluated by priority from lowest number to highest. A deny rule with priority 500 blocks traffic before an allow rule with priority 1000 is evaluated.
   - 方案: Review all rules sorted by priority. Either remove the conflicting deny rule, change the allow rule priority to a lower number than the deny rule, or narrow the scope of the deny rule to exclude desired traffic.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nsg-blocking-traffic)`

4. **Traffic blocked when NSGs applied at both subnet-level and NIC-level - one NSG allows traffic but the other blocks it**
   - 根因: When NSGs are applied at both subnet and NIC levels, BOTH must allow the traffic. For inbound: subnet NSG evaluated first, then NIC NSG. Missing allow rule in either NSG causes traffic to be denied by default DenyAllInBound rule.
   - 方案: Use Effective Security Rules view to identify which NSG is blocking. Add matching allow rules in both subnet-level and NIC-level NSGs. Simplify by removing NSG from either subnet or NIC if dual NSGs aren't needed.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nsg-blocking-traffic)`

5. **Traffic from certain source IPs blocked while traffic from other sources in the same VNet works - NSG rule has restricti**
   - 根因: NSG allow rule specifies a source IP range (e.g., 10.0.1.0/24) that doesn't include the connecting VM's subnet (e.g., 10.0.2.0/24). Traffic falls through to default deny rule.
   - 方案: Verify the source IP of the connecting machine. Update the rule's source IP range to include the correct address, or use service tag like VirtualNetwork. Be aware that VirtualNetwork tag includes peered networks and on-premises connections through gateways.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nsg-blocking-traffic)`

6. **SSH connection fails despite NSG rule allowing port 22 - sshd configured to listen on a custom non-standard port (e.g., **
   - 根因: Linux VM's SSH daemon (sshd) is configured via /etc/ssh/sshd_config to listen on a non-standard port, but the NSG allow rule only permits traffic on default port 22.
   - 方案: Check sshd_config for Port directive: grep -i port /etc/ssh/sshd_config. Update NSG rule destination port to match the configured SSH port. Update automation scripts and connection strings to use the custom port.
   `[结论: 🟢 7.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-ssh-nsg-problem)`

### Phase 2: 其他
> 来源: mslearn

1. **SSH connection to Azure Linux VM times out or returns 'Connection refused' / 'Connection timed out' - no inbound NSG rul**
   - 根因: When VM is created without selecting SSH as allowed inbound port, the default DenyAllInBound rule (priority 65500) blocks all SSH connections from outside the virtual network.
   - 方案: Add inbound NSG allow rule: Source=appropriate IP/range/service-tag, Destination port=22, Protocol=TCP, Action=Allow, Priority lower than any conflicting deny rule. Apply rule in BOTH subnet and NIC NSGs if both exist. Consider Azure Bastion or JIT access for production.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-ssh-nsg-problem)`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Unmanaged Service Fabric Cluster - Service Fabric Explore... | Unlike Managed SF Clusters, unmanaged SF cluste... | Create 3 NSG inbound security rules (for SF Exp... | 🟢 9.5 | [MCVKB/2.4 非托管Service Fabric Cluster无法打开 Explorer.md] |
| 2 | NSG Flow Log JSON files from Azure Storage are difficult ... | NSG Flow Logs stored in JSON with Unix timestam... | Use NSGFlowLogFormatter.exe: place .json files ... | 🟢 8.5 | [MCVKB/3.10 [NSG] NSG Flow Log Formatting Tool.md] |
| 3 | Network traffic unexpectedly blocked despite having an NS... | NSG rules are evaluated by priority from lowest... | Review all rules sorted by priority. Either rem... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nsg-blocking-traffic) |
| 4 | Traffic blocked when NSGs applied at both subnet-level an... | When NSGs are applied at both subnet and NIC le... | Use Effective Security Rules view to identify w... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nsg-blocking-traffic) |
| 5 | Traffic from certain source IPs blocked while traffic fro... | NSG allow rule specifies a source IP range (e.g... | Verify the source IP of the connecting machine.... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nsg-blocking-traffic) |
| 6 | SSH connection to Azure Linux VM times out or returns 'Co... | When VM is created without selecting SSH as all... | Add inbound NSG allow rule: Source=appropriate ... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-ssh-nsg-problem) |
| 7 | SSH connection fails despite NSG rule allowing port 22 - ... | Linux VM's SSH daemon (sshd) is configured via ... | Check sshd_config for Port directive: grep -i p... | 🟢 7.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-ssh-nsg-problem) |
