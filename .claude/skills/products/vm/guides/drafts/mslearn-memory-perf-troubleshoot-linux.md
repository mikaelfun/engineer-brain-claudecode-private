# Memory Performance Troubleshooting on Linux VMs

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-performance-memory-linux

## Key Areas Affected by Memory
- **Process Memory Allocation**: stack/heap usage per process
- **Page Cache**: kernel uses free memory for I/O cache (normal, reclaimable)
- **NUMA Architecture**: cross-node memory access adds latency
- **Memory Overcommitment**: kernel may allow over-allocation
- **Swap Space**: buffer for low-memory conditions (should be on ephemeral disk)

## Diagnostic Tools

### free
```bash
free -m
```
- 99% memory usage is normal in Linux (page cache)
- Focus on `available` column, not `free`

### pidstat + vmstat
```bash
pidstat -r 1 2    # per-process: VSZ, RSS, majflt/s
vmstat 2 5        # system-wide: si/so (swap in/out)
```
- VSZ = total virtual memory reserved
- RSS = actual physical memory in use
- High majflt/s = swapping from disk (memory pressure)
- High si/so in vmstat = active swapping

### ps (top memory consumers)
```bash
ps aux --sort=-rss | head -n 10
```
- Sort by RSS (physical memory), not VSZ

## HugePages vs Transparent HugePages (THP)
- **HugePages**: reserved, not all apps can use → may cause unavailable memory
- **THP**: kernel manages dynamically, JVM flag: `-XX:+UseTransparentHugePages`
- Check THP usage: `cat /proc/meminfo | grep AnonHugePages`
- Per-process: `/proc/<PID>/smaps` → look for THPeligible

## NUMA Considerations
```bash
numactl --hardware    # show NUMA topology and distances
numastat              # check memory allocation per node
```
- Same-node access: distance 10 (fast)
- Cross-node access: distance 12-32 (slower)
- Use `migratepages` to move pages to correct node
- UMA preferred when processes need full RAM access

## Overcommit Settings
- Modes: 0=Heuristic (default), 1=Always, 2=Never
- Check: `cat /proc/sys/vm/overcommit_memory`
- Wrong setting can prevent memory allocation or cause OOM

## OOM Killer Analysis
- Triggered when RAM + swap exhausted
- Check logs: `dmesg | grep -i "out of memory"`
- Key fields: total memory, free vs min watermark, process oom_score
- When free < min watermark → only kernel can allocate → OOM invoked

## Monitoring Memory Growth
```bash
sudo sar -r    # historical memory usage from sysstat
```
- Look for steady increase over hours/days
- Correlate with application activity
- High usage during peak hours may be normal

## Resolution Checklist
1. Is swap configured on ephemeral disk? (not OS/data disk)
2. Are HugePages reserving memory unnecessarily?
3. Is overcommit setting appropriate?
4. Which process has highest RSS?
5. Is there a memory leak (steadily increasing RSS)?
6. Is NUMA alignment optimal?
7. Scale up VM if resource constraint confirmed
