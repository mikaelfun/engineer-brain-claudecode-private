# Disk Benchmarking Guide — DiskSpd & FIO

> Source: https://learn.microsoft.com/azure/virtual-machines/disks-benchmarks
> Status: draft (mslearn extraction)

## Overview

Benchmarking Azure managed disks using DiskSpd (Windows) and FIO (Linux) to measure IOPS, throughput, and latency under synthetic workloads.

## Setup

- VM: Standard_D8ds_v4 with 4x Premium SSDs attached
- 3 disks with host caching = None → striped into "NoCacheWrites" volume
- 1 disk with host caching = ReadOnly → "CacheReads" volume

## Key: Warm Up Cache First

Disk with ReadOnly host caching can give IOPS higher than disk limit via cache hits. **Must warm cache before every benchmark run (and after every VM reboot).**

## DiskSpd (Windows)

### Max Write IOPS
```
diskspd -c200G -w100 -b8K -F4 -r -o128 -W30 -d30 -Sh testfile.dat
```
- Queue depth 128, block size 8KB, 4 threads, random writes
- D8ds_v4 result: ~12,800 write IOPS

### Max Read IOPS
```
diskspd -c200G -b4K -F4 -r -o128 -W7200 -d30 -Sh testfile.dat
```
- Queue depth 128, block size 4KB, 4 threads, random reads
- 2-hour warmup needed for cache
- D8ds_v4 result: ~77,000 read IOPS

### Max Throughput
- Change block size to 64KB for throughput testing

## FIO (Linux)

### Max Write IOPS
```ini
[global]
size=30g
direct=1
iodepth=256
ioengine=libaio
bs=4k
numjobs=4

[writer1]
rw=randwrite
directory=/mnt/nocache
```
```bash
sudo fio --runtime 30 fiowrite.ini
```

### Max Read IOPS
```ini
[global]
size=30g
direct=1
iodepth=256
ioengine=libaio
bs=4k
numjobs=4

[reader1]
rw=randread
directory=/mnt/readcache
```

### Combined Read+Write
```ini
[reader1]
rw=randread
directory=/mnt/readcache

[writer1]
rw=randwrite
directory=/mnt/nocache
rate_iops=3200
```
- D8ds_v4 result: ~90,000 combined IOPS

## Key Parameters

| Parameter | Write Test | Read Test | Combined |
|-----------|-----------|-----------|----------|
| Queue Depth | 128-256 | 128-256 | 128 |
| Block Size | 4-8 KB | 4 KB | 4 KB |
| Threads | 4 | 4 | 4+4 |
| Cache Warmup | No | Yes (2h) | Yes |

## Notes

- Always use `direct=1` (FIO) or `-Sh` (DiskSpd) to bypass OS cache
- Results depend on VM size limits (cached vs uncached IOPS caps)
- Premium SSD performance scales with disk size (P30 = 5,000 IOPS)
