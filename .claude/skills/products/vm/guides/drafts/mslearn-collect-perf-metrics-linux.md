# Collect Performance Metrics from Linux VM (Sysstat)

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/collect-performance-metrics-from-a-linux-system

## Install Sysstat

| Distro | Command |
|---|---|
| Ubuntu | `sudo apt install sysstat -y` |
| RHEL | `sudo dnf install sysstat -y` |
| SUSE | `sudo zypper install sysstat --non-interactive` |

Or via az vm run-command: `az vm run-command invoke --scripts "apt install sysstat -y"`

## CPU Metrics

### mpstat
```bash
mpstat -P ALL 1 2
```
Key columns: %usr, %sys, %iowait, %idle, %steal
- Check all CPUs are loaded (not single-threaded bottleneck)
- High %iowait → I/O bottleneck
- High %soft → high network traffic

### vmstat
```bash
vmstat -w 1 5
```
- procs r: runnable processes (> nproc = CPU saturation)
- procs b: blocked on I/O
- cpu us/sy/id/wa/st

### uptime
Load average: 1m/5m/15m. Divide by nproc for utilization.

## Memory Metrics

### free
```bash
free -h
```
- available = free + reclaimable buff/cache
- Check swap usage

### swapon
```bash
swapon -s
```
- Verify swap is on ephemeral drive, not OS/data disk

## Disk I/O Metrics

### iostat
```bash
iostat -dxtm 1 5
```
Key columns: r/s, w/s, rMB/s, wMB/s, r_await, w_await, aqu-sz
- await < 9ms expected for Premium SSD
- aqu-sz > 1 → requests queuing (saturation)

### lsblk
```bash
lsblk
ls -lr /dev/disk/azure  # correlate block device to Azure LUN
```

## Process Metrics

### pidstat
```bash
pidstat 1 2        # CPU per process
pidstat -r 1 2     # Memory per process (RSS, majflt/s)
pidstat -d 1 2     # I/O per process (kB_rd/s, kB_wr/s)
```

### ps
```bash
ps aux --sort=-%cpu | head -10  # top CPU processes
ps aux --sort=-%mem | head -10  # top memory processes
```

## Consolidated Collection Script
```bash
mpstat -P ALL 1 2 && vmstat -w 1 5 && uptime && free -h && swapon && iostat -dxtm 1 1 && lsblk && ls -l /dev/disk/azure && pidstat 1 1 -h --human && pidstat -r 1 1 -h --human && pidstat -d 1 1 -h --human && ps aux --sort=-%cpu | head -20 && ps aux --sort=-%mem | head -20
```
