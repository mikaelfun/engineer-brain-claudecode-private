# Networking NSG 与 Network Watcher — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Unmanaged Service Fabric Cluster - Service Fabric Explore... | Unlike Managed SF Clusters, unmanaged SF cluste... | Create 3 NSG inbound security rules (for SF Exp... | 🟢 9.5 | [MCVKB/2.4 非托管Service Fabric Cluster无法打开 Explorer.md] |
| 2 📋 | NSG Flow Log JSON files from Azure Storage are difficult ... | NSG Flow Logs stored in JSON with Unix timestam... | Use NSGFlowLogFormatter.exe: place .json files ... | 🟢 8.5 | [MCVKB/3.10 [NSG] NSG Flow Log Formatting Tool.md] |
| 3 📋 | Network traffic unexpectedly blocked despite having an NS... | NSG rules are evaluated by priority from lowest... | Review all rules sorted by priority. Either rem... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nsg-blocking-traffic) |
| 4 📋 | Traffic blocked when NSGs applied at both subnet-level an... | When NSGs are applied at both subnet and NIC le... | Use Effective Security Rules view to identify w... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nsg-blocking-traffic) |
| 5 📋 | Traffic from certain source IPs blocked while traffic fro... | NSG allow rule specifies a source IP range (e.g... | Verify the source IP of the connecting machine.... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-nsg-blocking-traffic) |
| 6 📋 | SSH connection to Azure Linux VM times out or returns 'Co... | When VM is created without selecting SSH as all... | Add inbound NSG allow rule: Source=appropriate ... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-ssh-nsg-problem) |
| 7 📋 | SSH connection fails despite NSG rule allowing port 22 - ... | Linux VM's SSH daemon (sshd) is configured via ... | Check sshd_config for Port directive: grep -i p... | 🟢 7.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-ssh-nsg-problem) |

## 快速排查路径
1. Create 3 NSG inbound security rules (for SF Explorer, client connection, and application ports) and  `[来源: onenote]`
2. Use NSGFlowLogFormatter.exe: place .json files in same directory, run tool, generates formatted_xxx. `[来源: onenote]`
3. Review all rules sorted by priority. Either remove the conflicting deny rule, change the allow rule  `[来源: mslearn]`
4. Use Effective Security Rules view to identify which NSG is blocking. Add matching allow rules in bot `[来源: mslearn]`
5. Verify the source IP of the connecting machine. Update the rule's source IP range to include the cor `[来源: mslearn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/nsg-network-watcher.md#排查流程)
