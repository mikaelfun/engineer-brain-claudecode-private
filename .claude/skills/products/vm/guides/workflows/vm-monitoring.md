# VM Monitoring — 排查工作流

**来源草稿**: ado-wiki-c-monitoring-extension-linux-manual-upgrade.md, ado-wiki-c-monitoring-extension-windows-manual-upgrade.md, mslearn-vm-perf-monitoring-portal.md, onenote-host-monitoring-agent-logs.md, onenote-sar-linux-performance-monitoring.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 1
**覆盖子主题**: vm-monitoring
**生成日期**: 2026-04-07

---

## Scenario 1: Onenote Sar Linux Performance Monitoring
> 来源: onenote-sar-linux-performance-monitoring.md | 适用: Mooncake \u2705

### 排查步骤
# SAR (System Activity Reporter) Linux Performance Monitoring
> Source: OneNote - Mooncake POD / 4. Linux on Azure / 4.3
> Quality: guide-draft | Product: vm
## Overview
SAR is a utility from the `sysstat` package for collecting and reporting system activity metrics. Useful for establishing performance baselines, detecting anomalies before crashes/hangs, and tuning monitoring thresholds.
## Installation
```bash
# RHEL 5/6/7
yum install sysstat
chkconfig sysstat on      # RHEL 5/6
systemctl enable sysstat  # RHEL 7/8
# RHEL 8 uses systemd timers instead of cron
# See: https://access.redhat.com/solutions/5115491
```
## How SAR Works
- Writes binary logs to `/var/log/sa/sa##` (## = day of month)
- Daily text summary to `/var/log/sa/sar##`
- Cron job in `/etc/cron.d/sysstat` collects every 10 minutes
- Config in `/etc/sysconfig/sysstat` (HISTORY=7 days default, can increase)
## Common Commands
```bash
# All CPU stats for today
sar -P ALL
# Network stats from specific day (13th)
sar -n ALL -f /var/log/sa/sa13
# Memory stats between 10AM-2PM, day 7, output to file
sar -r -s 10:00:00 -e 14:00:00 -f /var/log/sa07 -o /tmp/mem.txt
```
## Use Cases
1. **Memory leak detection**: Watch `sar -r` for %memused creeping to 100%, then swap usage climbing
2. **Hangwatch tuning**: Use `sar -q` (load average) to determine normal vs abnormal load thresholds
3. **Pre-crash analysis**: Review historical data leading up to system hang/crash events
## Tips
- Change collection interval: edit `/etc/cron.d/sysstat`, change `*/10` to desired minutes (e.g., `*/5`)
- Extend history: edit `HISTORY` in `/etc/sysconfig/sysstat`
- Visualization: Use KSar (open source Java tool) to generate PDF reports from SAR data

`[来源: onenote-sar-linux-performance-monitoring.md]`

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|
