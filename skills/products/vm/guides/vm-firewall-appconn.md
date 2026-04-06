# VM Windows 防火墙与应用连接排查 — 排查速查

**来源数**: 6 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | 指南：禁用 Guest OS 防火墙（CSE/Remote PS/PSTools/Remote Registry/Offline 多种方法） | Guest OS 防火墙阻断流量 | 见融合指南 guides/drafts/mslearn-disable-guest-os-firewall.md | 🔵 6.5 — MS Learn 指南 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/disable-guest-os-firewall-windows) |
| 2 📋 | 指南：启用或禁用 Guest OS 特定防火墙规则（多种方法精确规则管理） | 特定防火墙规则配置错误 | 见融合指南 guides/drafts/mslearn-enable-disable-firewall-rule.md | 🔵 6.5 — MS Learn 指南 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/enable-disable-firewall-rule-guest-os) |
| 3 📋 | 指南：Guest OS 防火墙配置错误诊断 — 诊断命令与决策树 | 防火墙配置错误阻断部分或全部流量 | 见融合指南 guides/drafts/mslearn-firewall-misconfigured.md | 🔵 6.5 — MS Learn 指南 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/guest-os-firewall-misconfigured) |
| 4 📋 | 指南：应用连接故障排查 — 系统化 4 步诊断（应用不可达） | 多种可能：应用未运行/未监听预期端口、端口被防火墙/NSG 阻断、网络规则错误、边缘设备阻断 | 见融合指南 guides/drafts/mslearn-troubleshoot-app-connection.md | 🔵 6.5 — MS Learn 指南 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-app-connection) |
| 5 📋 | 指南：Redeploy VM 到新节点 — 当 RDP/应用连接排查穷尽时 | 底层主机节点问题无法通过其他方式解决 | 见融合指南 guides/drafts/mslearn-redeploy-vm-to-new-node.md | 🔵 6.5 — MS Learn 指南 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/redeploy-to-new-node-windows) |
| 6 | Failover Cluster 集群名 Ping 超时 — 非 owner 节点 ping Clustered Name 返回 Request timed out | Azure 网络中 Clustered IP 资源功能有限，不响应 ICMP ping（by design） | 用 TCP 连接测试替代 ICMP ping；集群管理用 period (.) 或节点名本地连接；这是 Azure Failover Clustering 的 by-design 行为 | 🟢 8 — MS Learn 详细+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/ping-clustered-name-fail) |

## 快速排查路径
1. 确认 NSG 规则是否阻断目标端口 → Network Watcher IP Flow Verify `[来源: MS Learn]`
2. 确认应用是否在 Guest OS 中监听正确端口 → netstat -ano `[来源: MS Learn]`
3. 检查 Guest OS 防火墙 `[来源: MS Learn]`
   - 防火墙阻断所有入站 → #1 禁用防火墙指南
   - 特定规则配置错误 → #2 启用/禁用规则指南
   - 不确定哪条规则 → #3 诊断命令+决策树
4. 应用层排查 → #4 四步诊断法 `[来源: MS Learn]`
5. 以上均无效 → #5 Redeploy VM 到新节点 `[来源: MS Learn]`
6. Failover Cluster ping 超时 → #6 by design，改用 TCP 测试 `[来源: MS Learn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-firewall-appconn.md#排查流程)
