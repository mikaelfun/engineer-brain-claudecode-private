# CPU Performance Troubleshooting on Linux VMs

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-performance-cpu-linux

## Quick Assessment Tools

### top
```bash
top
```
- Press `1` for per-CPU view
- Key: load average vs nproc, %idle, %wa (I/O wait)
- Process states: R=running, D=uninterruptible sleep (I/O blocked)
- Multithreaded processes can show >100% CPU

### ps (top consumers)
```bash
sudo ps -eo pcpu,pmem,pid,user,args | sort -r -k1 | head -6
```

## CPU Resource Priority (high → low)
1. Hardware Interrupts (unconditional, immediate)
2. Soft Interrupts (kernel maintenance, clock tick)
3. Real Time Threads
4. Kernel Threads
5. User Threads (applications - lowest priority)

## sar (Historical Analysis)
```bash
sudo systemctl enable sysstat && sudo systemctl start sysstat
sudo sar -t -P ALL              # current CPU stats
sar -t -u -f /var/log/sa/sa10   # from log file
```
- Default collection: every 10 minutes
- Adjust interval for brief/intermittent issues
- Critical for baseline comparison

## vmstat (During High I/O)
```bash
vmstat 2 5
```
- procs r: run queue (> nproc = CPU saturated)
- procs b: blocked on I/O
- cpu wa: I/O wait percentage
- system cs: context switches per second

## Identifying High Context Switches
```bash
sudo pidstat -wt 2 5
```
- `-w`: task switching activity
- `-t`: per-thread statistics
- High cswch/s correlates with vmstat cs column

## Debugging High CPU Processes
```bash
# Get stack traces of top 3 CPU processes
for H_PID in $(ps -eo pcpu,pid,ppid,user,args | sort -k1 -r | grep -v PID | head -3 | awk '{print $2}'); do
  ps -Llp $H_PID
  sudo cat /proc/$H_PID/stack
  echo
done
```

## Key Diagnostic Questions
1. Is sar/sysstat enabled? (Required for historical analysis)
2. Is the issue current or intermittent?
3. Single-threaded or multi-threaded workload?
4. What process is consuming CPU? (top/ps)
5. Is high context switching involved? (vmstat cs + pidstat -wt)
