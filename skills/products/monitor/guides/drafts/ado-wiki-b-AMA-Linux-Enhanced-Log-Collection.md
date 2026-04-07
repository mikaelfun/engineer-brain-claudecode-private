---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Enhanced log collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Enhanced%20log%20collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This guide outlines the steps to investigate an Out-Of-Memory (OOM) killer event where an Azure Monitor Agent (AMA) process is terminated by the system. An OOM event occurs when the system cannot allocate additional memory. The kernel assigns an `oom_score` to processes, targeting the one most likely contributing to the memory shortage for termination. These events are recorded in `dmesg` logs.

# Scenario: amacoreagent
Step 1: Enable verbose logging for amacoreagent

```
systemctl edit azuremonitor-coreagent
```

Step 2: Update config with these lines

```
[Service]
Environment=PA_VERBOSE=1
```

![image.png](/.attachments/image-bf719e63-6665-41dc-9d9d-2615e5ac2958.png)

**CTRL + X** to exit and **Y** to save

Step 3: Restart to make changes effective and validate logs are being written (these will also be collected as part of the AMA Troubleshooter)

```
systemctl restart azuremonitor-coreagent && tail -f $(ls -t /var/opt/microsoft/azuremonitoragent/log/amaca*.log | head -n 1)
```

![image.png](/.attachments/image-f4f728dd-e448-4b83-88c6-faa3297f648a.png)

# Scenario: OOM Killer
This will help us confirm that we are in an OOM killer scenario and collect logs that PG can use, if required.

```
# Last modified: 2025-06-18
# Set the directory path to a variable
LOG_DIR="/tmp/ama_dbg-sys_$(hostname)_$(date +%Y%m%d)"

# Create the directory
mkdir -p "$LOG_DIR"

# Journal logs
journalctl -u azuremonitoragent > "$LOG_DIR/journal_u_azuremonitoragent.txt" 2>&1
journalctl | grep -i mdsd > "$LOG_DIR/journal_mdsd.txt" 2>&1
journalctl | grep -i azuremonitoragent > "$LOG_DIR/journal_azuremonitoragent.txt" 2>&1
journalctl | grep -i amacoreagent> "$LOG_DIR/journal_amacoreagent.txt" 2>&1

# System logs
## Scenario: Invalid CPU instruction set
if [ -f /var/log/syslog ]; then
    grep -i azuremonitoragent /var/log/syslog > "$LOG_DIR/syslog_ama.txt" 2>&1
    grep -i mdsd /var/log/syslog > "$LOG_DIR/syslog_mdsd.txt" 2>&1
    grep -i amacoreagent /var/log/syslog > "$LOG_DIR/syslog_amacoreagent.txt" 2>&1
fi

if [ -f /var/log/messages ]; then
    grep -i azuremonitoragent /var/log/messages > "$LOG_DIR/messages_ama.txt" 2>&1
    grep -i mdsd /var/log/messages > "$LOG_DIR/messages_mdsd.txt" 2>&1
    grep -i amacoreagent /var/log/messages > "$LOG_DIR/syslog_amacoreagent.txt" 2>&1
fi

# Check for kernel ring buffer messages (mdsd)
## Scenario: OOM Killer
output=$(dmesg | grep -i mdsd)

if [ -n "$output" ]; then
    echo "$output" > "$LOG_DIR/dmesg_mdsd.txt"
fi

# Check for kernel ring buffer messages (amacoreagent)
output=$(dmesg | grep -i amacoreagent)

if [ -n "$output" ]; then
    echo "$output" > "$LOG_DIR/dmesg_amacoreagent.txt"
fi

# Check CPU instruction set
# Expected instruction set - AMACoreAgent:�popcnt,sse,sse2,sse3,ssse3,sse4.1,sse4.2
## Scenario: Invalid CPU instruction set
cat /proc/cpuinfo > "$LOG_DIR/proc_cpuinfo.txt" 2>&1

# Get copy of system.conf
cp /etc/systemd/system.conf "$LOG_DIR/systemd_system.conf"

# Status of azuremonitoragent service + number of tasks
systemctl status azuremonitor* > "$LOG_DIR/systemctl_azuremonitor.txt" 2>&1

# Compress LOG_DIR to a .tgz file
tar -czf "$LOG_DIR.tgz" -C "$(dirname "$LOG_DIR")" "$(basename "$LOG_DIR")"

# Clean up
# rm -rf "$LOG_DIR"
# rm "$LOG_DIR.tgz"
```

## Review Logs (OOM Killer)
Here are examples of what we might see in dmesg_mdsd.txt (output from above script) if we are in an OOM killer scenario:

### Example: system memory exhausted (CONSTRAINT_NONE)

```
[662335.855977] [1975949]   104 1975949  1207814   762501   761861      640         0  6586368        0             0 mdsd
[662335.855982] oom-kill:constraint=CONSTRAINT_NONE,nodemask=(null),cpuset=azuremonitoragent.service,mems_allowed=0,global_oom,task_memcg=/system.slice/azuremonitoragent.service,task=mdsd,pid=1975949,uid=104
[662335.856098] Out of memory: Killed process 1975949 (mdsd) total-vm:4831256kB, anon-rss:3047444kB, file-rss:2560kB, shmem-rss:0kB, UID:104 pgtables:6432kB oom_score_adj:0
[662381.213583] mdsd invoked oom-killer: gfp_mask=0x140dca(GFP_HIGHUSER_MOVABLE|__GFP_COMP|__GFP_ZERO), order=0, oom_score_adj=0
[662381.213593] CPU: 1 PID: 1977413 Comm: mdsd Not tainted 6.8.0-1028-azure #33~22.04.1-Ubuntu
```

### Example: memory cgroup exhausted (CONSTRAINT_MEMCG)

```  
[580660.355521] [2002099]   104 2002099  3168592  2620316 21450752        0             0 mdsd
[580660.355525] oom-kill:constraint=CONSTRAINT_MEMCG,nodemask=(null),cpuset=/,mems_allowed=0,oom_memcg=/system.slice/azuremonitoragent.service,task_memcg=/system.slice/azuremonitoragent.service,task=mdsd,pid=2002099,uid=104
[580660.355669] Memory cgroup out of memory: Killed process 2002099 (mdsd) total-vm:12674368kB, anon-rss:10457828kB, file-rss:23436kB, shmem-rss:0kB, UID:104 pgtables:20948kB oom_score_adj:0
[580693.095421] mdsd invoked oom-killer: gfp_mask=0xcc0(GFP_KERNEL), order=0, oom_score_adj=0
[580693.095428] CPU: 1 PID: 2005834 Comm: mdsd Not tainted 5.15.0-1088-azure #97~20.04.1-Ubuntu
```

