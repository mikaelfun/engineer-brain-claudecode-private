# Linux VM Performance Commands Reference

**Source**: MCVKB 3.9 | **Product**: VM | **ID**: vm-onenote-137

## CPU Monitoring

### top
```bash
top -d 1        # Display processes, refresh every 1 sec
top -cd 1       # Show full command path, refresh every 1 sec
# Press '1' to show per-CPU workload (identify single-threaded processes)
# Press 'c' to toggle command name vs full path
```

**Key fields**: %CPU, %MEM, VIRT, RES, SHR, load average

### Understanding Load Average
- Three numbers: 1-min, 5-min, 15-min averages
- Compare against number of CPUs (e.g., load avg 4.0 on 4-CPU = 100% utilization)

## Memory Monitoring
```bash
free -m         # Memory usage in MB
vmstat 1        # Virtual memory stats every 1 sec
```

## Disk I/O
```bash
iostat -x 1     # Extended disk stats every 1 sec
iotop           # Top-like interface for I/O
```

## Network
```bash
netstat -lpn    # Listening ports
ss -tunlp       # Socket statistics (newer alternative to netstat)
tcpdump -i eth0 -w capture.pcap   # Packet capture
```

## Process Analysis
```bash
ps aux --sort=-%cpu | head -20    # Top CPU consumers
ps aux --sort=-%mem | head -20    # Top memory consumers
strace -p <PID> -c               # System call summary
```

## Notes
- Batch mode for top: `top -b -n 5 -d 1 > top_output.txt`
- WALinuxAgent process (python3 bin/WALinuxAgent) is normal to see in process list
