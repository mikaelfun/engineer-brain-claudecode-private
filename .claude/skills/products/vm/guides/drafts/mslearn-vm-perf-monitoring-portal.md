# VM Performance Troubleshooting via Azure Portal Monitoring

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-performance-virtual-machine-linux-windows

## Setup: Enable VM Diagnostics
1. VM → Monitoring → Diagnostics Settings
2. Select storage account → Enable guest-level monitoring

## CPU Bottleneck Analysis
- VM → Metrics → CPU Percentage
- Patterns:
  - **Spiking**: scheduled task → check if acceptable
  - **Spike + constant**: new workload → identify process
  - **Constant high**: identify process → consider resize
  - **Steadily increasing**: inefficient code or growing load
- Remediation: resize VM (more cores) or optimize application

## Memory Bottleneck Analysis
- Add Memory Usage tile
- Patterns:
  - **Constant high**: may be normal (e.g. DB engines)
  - **Steadily increasing**: possible memory leak or warming up
  - **Page/Swap file**: high R/W on swap = low memory
- Remediation: resize VM (more RAM) or fix application

## Disk Bottleneck Analysis (Unmanaged Disks)
- Storage Account → Metrics → Blob → Availability
- Check for:
  - **Availability drops**: platform issue → check Azure Status
  - **TimeOutErrors**: check AverageServerLatency vs AverageE2ELatency
  - **ThrottlingError**: hitting IOPS limit (20K per storage account)
- Each VHD: 500 IOPS or 60 MBits limit
- Check VM-level Disk Read/Write metrics

## Remediation Summary
| Issue | Action |
|---|---|
| High CPU (>95%) | Resize VM or optimize app |
| High Memory | Resize VM, check for leaks |
| Disk throttling | Rebalance VHDs, migrate to Premium SSD |
| High latency | Use Premium Storage (DS/GS series) |

## PerfInsights
- Use for both Windows and Linux VMs
- VM → Performance diagnostics → Install and run
- Or VM → Diagnose and Solve Problems → VM Performance Issues
