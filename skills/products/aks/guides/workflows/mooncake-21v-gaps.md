# AKS Mooncake 21V 功能差异 — 排查工作流

**来源草稿**: ado-wiki-a-in-transit-encryption-using-wireguard.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-a-in-transit-encryption-using-wireguard.md | 适用: 适用范围未明确

### 排查步骤

##### Verify IP Reachability
```bash
kubectl node-shell -x <node-name>
chroot /host/
ping -c 4 {another-node-ip}
```

##### Verify Port Not Blocked (UDP 51871)

Node 1: `echo "this works" | nc -u -q 0 <node2-ip> 51871`
Node 2: `tshark -i eth0 -f "udp port 51871"`

If no packets seen, check: IPtables, NSGs, and other network filtering technologies.

---
