# VM RHEL Leapp 升级 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 11 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure China (Mooncake) marketplace does not offer RedHat images; customers cannot directly deploy RH | 21Vianet operates Azure China separately; RedHat images are not published in the | 1) Upload custom RedHat VHD image following docs.azure.cn guide: https://docs.az | 🟢 8 | ON |
| 2 | VM deployment fails with error 'Plan ID: cis-rhel8-1l cannot be purchased due to validation error' w | CIS (Center for Internet Security) changed their offerings in Feb 2024 and remov | Request customer to reach out to CIS directly to correct the issue, or create a  | 🔵 6.5 | AW |
| 3 | Dpsv6/Dplsv6/Epsv6 VM deployment fails when using RedHat Linux Enterprise marketplace images; NVMe r | Dpsv6 ARM64-based series does not support RedHat Linux Enterprise guest OS image | Use a different supported Linux distribution (Ubuntu, SLES, etc.) for Dpsv6 seri | 🔵 6.0 | AW |
| 4 | PAYG SUSE SLES VM needs registration or re-registration against Azure Public Cloud Update Infrastruc | SUSE registration configuration (/etc/SUSEConnect, zypp repos) is corrupt, stale | Run: rm /etc/SUSEConnect && rm -f /etc/zypp/{repos,services,credentials}.d/* &&  | 🔵 6 | ON |
| 5 | RHEL Pacemaker cluster node does not join after restart. Quorum error, nodes UNCLEAN (offline). Coro | Missing or incorrect quorum section in /etc/corosync/corosync.conf (VoteQuorum p | Add quorum { provider: corosync_votequorum; two_node: 1 } to corosync.conf. Put  | 🔵 5.5 | ML |
| 6 | Pacemaker VIP (IPaddr2) resource fails with [findif] failed error | NIC is down or no matching route for VIP IP/netmask in default routing table, so | Specify nic=eth0 in IPaddr2 resource config: pcs resource update vip_XXX nic=eth | 🔵 5.5 | ML |
| 7 | Fenced Pacemaker node does not rejoin cluster. Logs show: We were allegedly just fenced | Node rejoins Corosync membership too quickly after fencing. STONITH completion m | Add startup delay for Corosync: create systemd drop-in with ExecStartPre=/bin/sl | 🔵 5.5 | ML |
| 8 | Both Pacemaker cluster nodes terminated after failover in RHEL 8 two-node cluster | During outage, both nodes try to fence each other simultaneously via STONITH dev | Use priority-fencing-delay=15s (Pacemaker 2.0.4-6+) or pcmk_delay_max=15s (older | 🔵 5.5 | ML |
| 9 | RHEL yum update timeout to rhui-3/rhui4-1.microsoft.com. Forced tunneling/VPN reroutes RHUI traffic. | ExpressRoute/VPN forced tunneling routes RHUI to on-premises. RHUI only accepts  | Create UDR for RHUI 4 IPs with next hop Internet. Per-region IPs: West Europe 52 | 🔵 5.5 | ML |
| 10 | RHEL yum fails through proxy. Misconfigured or residual proxy in /etc/yum.conf. | Wrong proxy config in /etc/yum.conf. Or leftover proxy= when no proxy exists. | Set correct proxy= or remove proxy= lines from yum.conf/dnf.conf. | 🔵 5.5 | ML |
| 11 | yum RHEL 7 HTTPS 403 Forbidden to RHUI. Third-party curl from city-fan.org. | Third-party curl certificates not recognized by Red Hat. | Downgrade to official RHEL curl: yum downgrade curl libcurl --disablerepo=*. | 🔵 5.5 | ML |

## 快速排查路径

1. **Azure China (Mooncake) marketplace does not offer RedHat images; customers canno**
   - 根因: 21Vianet operates Azure China separately; RedHat images are not published in the China marketplace. RedHat is available 
   - 方案: 1) Upload custom RedHat VHD image following docs.azure.cn guide: https://docs.azure.cn/zh-cn/virtual-machines/linux/redhat-create-upload-vhd. 2) Alter
   - `[🟢 8 | ON]`

2. **VM deployment fails with error 'Plan ID: cis-rhel8-1l cannot be purchased due to**
   - 根因: CIS (Center for Internet Security) changed their offerings in Feb 2024 and removed old plan information from Azure Marke
   - 方案: Request customer to reach out to CIS directly to correct the issue, or create a new VM image using an available and new deployable Marketplace image. 
   - `[🔵 6.5 | AW]`

3. **Dpsv6/Dplsv6/Epsv6 VM deployment fails when using RedHat Linux Enterprise market**
   - 根因: Dpsv6 ARM64-based series does not support RedHat Linux Enterprise guest OS images from Azure Marketplace during preview;
   - 方案: Use a different supported Linux distribution (Ubuntu, SLES, etc.) for Dpsv6 series VMs. For storage, use SCSI-based remote disks instead of NVMe remot
   - `[🔵 6.0 | AW]`

4. **PAYG SUSE SLES VM needs registration or re-registration against Azure Public Clo**
   - 根因: SUSE registration configuration (/etc/SUSEConnect, zypp repos) is corrupt, stale, or was never initialized properly for 
   - 方案: Run: rm /etc/SUSEConnect && rm -f /etc/zypp/{repos,services,credentials}.d/* && rm -f /usr/lib/zypp/plugins/services/* && sed -i '/^# Added by SMT reg
   - `[🔵 6 | ON]`

5. **RHEL Pacemaker cluster node does not join after restart. Quorum error, nodes UNC**
   - 根因: Missing or incorrect quorum section in /etc/corosync/corosync.conf (VoteQuorum provider not configured)
   - 方案: Add quorum { provider: corosync_votequorum; two_node: 1 } to corosync.conf. Put cluster in maintenance, sync and reload corosync.
   - `[🔵 5.5 | ML]`

