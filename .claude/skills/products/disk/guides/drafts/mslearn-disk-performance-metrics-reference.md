# Azure Disk Performance Metrics Reference Guide

> Source: [Disk performance metrics - Microsoft Learn](https://learn.microsoft.com/azure/virtual-machines/disks-metrics)
> Status: draft (from mslearn scan)

## 1. Disk IO / Throughput / Queue Depth / Latency Metrics

| Metric | Description | Notes |
|--------|-------------|-------|
| OS/Data Disk Latency (Preview) | Average IO completion time (ms) | SCSI only, not NVMe |
| OS/Data Disk Queue Depth | Outstanding IO requests waiting | |
| OS/Data Disk Read/Write Bytes/Sec | Throughput in bytes/sec | Includes cache if enabled |
| OS/Data Disk Read/Write Operations/Sec | IOPS | Includes cache if enabled |
| Temp Disk metrics | Latency, queue depth, throughput, IOPS for temp disk | Not available for NVMe temp disks |

## 2. Bursting Metrics (Premium Disks)

| Metric | Description |
|--------|-------------|
| Max Burst Bandwidth/IOPS (OS/Data) | Upper limit when bursting |
| Target Bandwidth/IOPS (OS/Data) | Baseline without bursting |
| Used Burst BPS/IO Credits Percentage | Credit consumption (5-min interval) |
| Disk On-demand Burst Operations | Burst transactions (hourly interval) |

## 3. VM Bursting Metrics

| Metric | Description |
|--------|-------------|
| VM Uncached/Cached Used Burst IO Credits % | VM-level burst credit consumption |
| VM Uncached/Cached Used Burst BPS Credits % | VM-level throughput burst consumption |

## 4. Storage IO Utilization (Bottleneck Detection)

### Disk-level capping:
- **Data/OS Disk IOPS Consumed %** — 100% = disk IOPS bottleneck
- **Data/OS Disk Bandwidth Consumed %** — 100% = disk throughput bottleneck

### VM-level capping:
- **VM Cached IOPS/Bandwidth Consumed %** — 100% = VM cached limit bottleneck
- **VM Uncached IOPS/Bandwidth Consumed %** — 100% = VM uncached limit bottleneck

## 5. Troubleshooting Workflow

1. Check **VM Uncached IOPS Consumed %** first — if 100%, VM is the bottleneck → upgrade VM size
2. Check **Data Disk IOPS Consumed %** per LUN (use metric splitting) — identify which disk is capped
3. Check **OS Disk IOPS Consumed %** — OS disk often overlooked as bottleneck
4. Compare burst credit metrics — if credits depleting, workload exceeds baseline, consider:
   - Upgrading disk tier
   - Enabling on-demand bursting (Premium SSD > 512 GiB)
   - Adding more disks and striping
