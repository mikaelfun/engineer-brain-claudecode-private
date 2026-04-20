---
title: "Linux VM 内存性能排查指南"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-performance-memory-linux"
product: vm
date: 2026-04-18
21vApplicable: true
---

# Linux VM 内存性能排查指南

## 排查维度
1. **进程内存分配** - Stack vs Heap，应用设计决定内存用量
2. **Page Cache** - 文件服务器场景大量使用 page cache
3. **内存架构** - UMA vs NUMA，影响内存访问延迟
4. **内存 Overcommit** - 内核是否允许超额分配
5. **Swap** - 启用 swap 提升低内存条件下的系统稳定性

## 常用工具

### free
查看总体内存使用情况（total/used/free/available/swap）。

### pidstat -r
按进程查看内存使用：VSZ（虚拟内存）、RSS（物理内存）、majflt/s（major page fault）。

### vmstat
监控 page-in/page-out，判断 swap 使用是否过高。

### numactl / numastat
NUMA 架构下查看节点间内存距离和分布，`migratepages` 可迁移内存页到正确节点。

## Transparent HugePages (THP)
- 内核动态管理大内存页，无需预留
- JVM 可通过 `-XX:+UseTransparentHugePages` 启用
- 检查 `/proc/meminfo` 的 `AnonHugePages` 字段
- 进程级：检查 `/proc/<pid>/smaps` 的 `THPeligible`

## HugePages vs THP
- HugePages：预留内存，不是所有应用能使用
- THP：动态分配，更灵活
- 过多 HugePages 预留会导致可用内存不足

## OOM Killer
- 触发条件：free 内存低于 min watermark
- 选择 oom_score 最高 + RSS 最大的进程终止
- 日志：`dmesg | grep -i oom`
- Overcommit 模式：0=Heuristic（默认）、1=Always、2=Don't

## 监控内存增长
```bash
sar -r  # 按时间查看内存使用趋势
ps aux --sort=-rss | head -n 10  # RSS 排序找内存大户
```
