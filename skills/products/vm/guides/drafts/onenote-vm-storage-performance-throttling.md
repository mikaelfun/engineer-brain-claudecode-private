---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======6. Storage=======/_6.1 [Storage][Perf][Azure VM Storage Performance.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure VM Storage Performance and Throttling Demystified

## Overview

Storage performance issues on Azure VMs are mainly due to blocking IOs where the application sends more IO than the storage can handle. Blocking is caused by software throttling at three levels:

1. **Disk Level** IO throttling
2. **VM Level Cached** IO throttling
3. **VM Level Uncached** IO throttling

## Key Concepts

### Independent vs Dependent Blocking

- **Independent blocking**: Throttling on disk 1 won't affect disk 2 (only when no VM-level throttling)
- **Dependent blocking**: VM-level throttling causes one disk's heavy IO to block ALL other disks

### Sync IO vs Async IO

- **Sync IO**: Single outstanding IO, max IOPS = 1000ms / latency_ms (e.g., 500 IOPS at 2ms latency for Premium disk)
- **Async IO**: Can push multiple outstanding IOs, can reach disk IOPS limit
- Formula: Outstanding IOs needed = Disk_IOPS_limit / Single_IO_IOPS (e.g., 10 outstanding for P30 5000 IOPS)
- Adding more disks does NOT help sync IO performance

### How Azure Throttles

- IOs checked every 50ms window (not per second)
- If limit hit in any 50ms window, outstanding IOs delayed to next bucket (+50ms)
- Multiple throttle events compound latency
- Queue length 100 on P30: avg latency = 19.6ms
- Queue length 1000 on P30: avg latency = 196ms

## Best Practices

### Scenario 1: Temp disk NOT required
1. Disable temp local disk
2. Ensure: VM total cached disk throughput < VM cached max limit
3. Ensure: Total disk throughput < VM uncached max limit

### Scenario 2: Temp disk IS required
1. Do NOT enable disk cache on mission critical disks (temp disk triggers cached throttling)
2. Total disk throughput (excluding temp) < VM uncached max limit
3. Consider disabling OS disk cache too (P10 OS without cache may be slow, upgrade to P20/P30)

### Scenario 3: Large VM still throttled
- Move workload to different server if even largest VM size throttles

## Real Test Results (DS13_V2: 256M cached, 384M uncached)

| Test | Result |
|------|--------|
| Temp disk alone | 256M (hits cached limit) |
| Temp + cached disk | 187M + 70M = 257M (cached limit) |
| Temp + cached + uncached | 171M + 86M + 194M (cached limit + uncached within limit) |
| Sync IO without VM throttling | 1.88M, 481 IOPS, 2.072ms latency |
| **Sync IO WITH VM throttling** | **0.11M, 27 IOPS, 37ms latency** |
| 4 disks no temp | Total 386M (uncached limit) |

## SQL Server Specific

- Separate async IO (DATA) and sync IO (LOG) to different disks
- Excessive temp disk IO triggers VM cached throttling, killing LOG disk performance
- Fine-tune SQL write IO size and pattern
- Consider RAMDISK for high-perf temp storage (283K-72K IOPS, 4-8GB/s throughput)

## Capacity Planning Example (DS15_V2: 640M cached, 960M uncached)

- 1 P10 OS + 4 P30 Data + 2 P30 Log = 100M + 800M + 400M = 1300M > 960M = WILL THROTTLE
- Recommendation: No more than 4 P30 disks total
- With cache: No temp disk, max 2 P30 cached data + 2 P30 uncached log = 900M < 960M
- Without cache: Temp disk OK, max 3 P30 data + 1 P30 log = 900M < 960M

## Additional Considerations

1. Antivirus real-time monitoring affects storage performance - exclude SQL DB/LOG files
2. ReFS, RAID5 checksum overhead hurts latency-sensitive applications
