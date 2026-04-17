# ARM Kube-OVN 网络 geneve kubectl ko — 排查速查

**来源数**: 5 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Kube-OVN GENEVE tunnel not established between nodes, no cross-node pod connectivity | Wrong encap type configured in OVN Southbound DB (e.g., vxlan instead of geneve) | Verify encap type: ovn-sbctl list encap. Ensure all chassis records show type=geneve. | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Kube-OVN GENEVE tunnel not established, tcpdump shows no UDP/6081 traffic between nodes | Network firewall or host iptables rules blocking UDP port 6081 between cluster nodes | Check firewall rules on all nodes. Test UDP/6081: nc -uz <remote-ip> 6081. Add firewall exception i… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Kube-OVN cluster networking intermittently broken across some node pairs, OVN SB DB inconsistent | OVN control plane split-brain due to quorum loss in Southbound DB cluster | Check cluster status: ovn-appctl -t /var/run/ovn/ovnsb_db.ctl cluster/status OVN_Southbound. Restor… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Running kubectl ko nbctl lr-list returns error: unknown command ko - Kube-OVN kubectl plugin not in… | kubectl ko plugin binary is missing from PATH on this node/jumpbox | Use OVN CLI fallback: kubectl -n kube-system exec -it <ovn-central-pod> -- ovn-nbctl lr-list (and l… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | OVN logical router route exists in lr-route-list but traffic still fails to reach destination in Ku… | Router policy (lr-policy-list) drop/reroute conflict, missing/incorrect NAT in lr-nat-list, or data… | Check: 1) lr-route-list prefix/next-hop, 2) lr-policy-list for conflicts, 3) lr-nat-list NAT presen… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Verify encap type: ovn-sbctl list encap. Ensure all chassis records show type=g… `[来源: ado-wiki]`
2. Check firewall rules on all nodes. Test UDP/6081: nc -uz <remote-ip> 6081. Add … `[来源: ado-wiki]`
3. Check cluster status: ovn-appctl -t /var/run/ovn/ovnsb_db.ctl cluster/status OV… `[来源: ado-wiki]`
