# VM Linux 配置与工具 — 排查速查

**来源数**: 2 (ML, ON) | **条目**: 5 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | SUSE Enterprise Linux 15 SP6 VM repos not registered automatically; /var/log/cloudregister shows 'No | VM cannot reach SUSE regional servers and SMT server (smt-azure.susecloud.net) o | 1) Whitelist SMT server IPs (from susepubliccloudinfo.suse.com/v1/microsoft/serv | 🔵 7.5 | ON |
| 2 | Ubuntu VM: cloud-init-nonet waiting 120 seconds for a network device / route_info failed / Missing r | (Error 1) Outdated udev saves previous NIC as eth0, new NIC becomes eth1 due to  | (Error 1) Delete /etc/udev/rules.d/70-persistent-net.rules and update udev packa | 🔵 5.5 | ML |
| 3 | Cloud-init Linux VM takes over 2 minutes to start: ephemeral device did not appear after 120 seconds | VM size has no local ephemeral disks (Ev4, Dv5, Dasv5). Cloud-init waits 120s fo | Upgrade cloud-init to 21.2+. Workaround: sed maxwait from 120 to 2 in DataSource | 🔵 5.5 | ML |
| 4 | Linux VM networking fails after NIC change. MAC address mismatch, cloud-init apply_network_config fa | NIC MAC changed but OS config not updated. cloud-init apply_network_config disab | Set apply_network_config: true in cloud-init cfg. Or rm /var/lib/cloud/instance/ | 🔵 5.5 | ML |
| 5 | Cannot access Gen2 Linux VM after reboot. Password authentication fails. | Bug in cloud-init 19.3 and earlier on Gen2 VMs breaks password auth after reboot | Upgrade cloud-init to 19.4+. If locked out, use VM Access extension or portal Pa | 🔵 5.5 | ML |

## 快速排查路径

1. **SUSE Enterprise Linux 15 SP6 VM repos not registered automatically; /var/log/clo**
   - 根因: VM cannot reach SUSE regional servers and SMT server (smt-azure.susecloud.net) on port 443. Often caused by NVA deep pac
   - 方案: 1) Whitelist SMT server IPs (from susepubliccloudinfo.suse.com/v1/microsoft/servers/smt.xml) and region server IPs (regionserver.xml); 2) Verify SSL c
   - `[🔵 7.5 | ON]`

2. **Ubuntu VM: cloud-init-nonet waiting 120 seconds for a network device / route_inf**
   - 根因: (Error 1) Outdated udev saves previous NIC as eth0, new NIC becomes eth1 due to MAC change after resize/move. (Error 2) 
   - 方案: (Error 1) Delete /etc/udev/rules.d/70-persistent-net.rules and update udev package. (Error 2) Reset eth0.cfg to 'auto eth0; iface eth0 inet dhcp' and 
   - `[🔵 5.5 | ML]`

3. **Cloud-init Linux VM takes over 2 minutes to start: ephemeral device did not appe**
   - 根因: VM size has no local ephemeral disks (Ev4, Dv5, Dasv5). Cloud-init waits 120s for non-existent disk.
   - 方案: Upgrade cloud-init to 21.2+. Workaround: sed maxwait from 120 to 2 in DataSourceAzure.py.
   - `[🔵 5.5 | ML]`

4. **Linux VM networking fails after NIC change. MAC address mismatch, cloud-init app**
   - 根因: NIC MAC changed but OS config not updated. cloud-init apply_network_config disabled.
   - 方案: Set apply_network_config: true in cloud-init cfg. Or rm /var/lib/cloud/instance/obj.pkl and reboot.
   - `[🔵 5.5 | ML]`

5. **Cannot access Gen2 Linux VM after reboot. Password authentication fails.**
   - 根因: Bug in cloud-init 19.3 and earlier on Gen2 VMs breaks password auth after reboot
   - 方案: Upgrade cloud-init to 19.4+. If locked out, use VM Access extension or portal Password Reset.
   - `[🔵 5.5 | ML]`

