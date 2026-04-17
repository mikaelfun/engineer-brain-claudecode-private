# Troubleshoot Performance Bottlenecks on Linux VMs

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-performance-bottlenecks-linux

## Bottleneck Identification Matrix

| Observation | Likely Bottleneck | Rationale |
|---|---|---|
| High load average + low CPU usage | Disk (I/O) | Processes blocked on I/O |
| High CPU + low load average | App design / single-threaded | CPU busy but not saturated |
| Increasing latency under load, CPU not saturated | Disk or network | Latency rises before utilization limits |
| Sharp CPU fluctuations + steady workload | CPU throttling/burst limits | Platform constraints |
| High I/O latency + low throughput | Disk saturation/throttling | Latency increases before bandwidth limits |
| Gradually increasing memory over time | Memory leak / cache growth | Progressive pressure |
| OOMKilled despite available disk | Memory | Disk != RAM |
| Good disk metrics but slow app I/O | Application I/O pattern | Small/sync I/O limits perf |
| Network below expectations | VM size / NIC limits | SKU caps bandwidth |
| Degradation only at peak | Capacity constraint | Limits reached under concurrency |

## Key Tools

| Resource | Tools |
|---|---|
| CPU | top, htop, mpstat, pidstat, vmstat |
| Disk | iostat, iotop, vmstat |
| Network | ip, vnstat, iperf3 |
| Memory | free, top, vmstat |

## CPU Diagnostics
- `top` (press 1 for per-CPU): check %idle, load average
- Load average interpretation: value / nproc = utilization ratio
- `uptime` for quick load average

## Disk (I/O) Diagnostics
- `iostat -dxctm 1`: key columns r/s, w/s, rMB/s, wMB/s, await, avgqu-sz
- High await = disk saturation; high avgqu-sz = requests queuing
- IOPS * IOSize = Throughput

## Network Diagnostics
- `ping` for latency
- `iperf3 -s` (server) + `iperf3 -c <ip>` (client) for bandwidth
- Network bounded by VM SKU

## Memory Diagnostics
- `free -m`: check available (not just free)
- buff/cache is reclaimable under pressure
- OOM Kill events in system log indicate real pressure

## PerfInsights
- Use for automated diagnostics: VM → Performance diagnostics
- Available for Linux: `how-to-use-perfinsights-linux`

## Migration Considerations (on-prem → cloud)
- CPU: clock speed differences mean 1:1 core mapping may not suffice
- Disk: latency differs by type (Ultra: μs, Premium SSD: ms, Standard HDD: 10s ms)
- Network: bounded by VM SKU, typically disk/VM limits first
