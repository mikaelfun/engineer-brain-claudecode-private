# Host Analyzer Report — VM Metrics Tab

**Source**: Mooncake POD Support Notebook > VMSCIM > VM > Tools > Host Analyzer > b. VM Metrics

## Overview

VM Metrics Tab 包含多个子标签页，涵盖 VM 自身的性能计数器（不同时间范围和采样周期）、性能图表、可用性详情和 Guest OS 信息。

> **Microsoft Confidential**: HA 报告内容为严格内部使用，不可对客户共享截图或图表。

## Sub-Tabs

| Sub-Tab | 用途 |
|---------|------|
| VM Details | VM 基本信息：名称、Cluster、NodeId、ContainerId、VM Size (Fabric)、OS Type 等 |
| Container Snapshot | 容器快照信息 |
| VM Blobs | VM VHD blob 信息 |
| VM Limits Charts | VM 限制相关图表（IOPS、带宽等） |
| BlobPerf Charts | Blob 性能图表（基于 SurfaceCounter 文件） |
| VM BlobPerf | 5 秒粒度的性能统计：throttling、MBPS、cache、IO size |
| VM Perf (last 2 days) | 最近 2 天性能数据 |
| VM 5 Min Counters | 5 分钟粒度性能计数器 |
| VM Health | VM 健康状态 |
| Guest Agent Logs | Guest Agent 日志 |
| IO Latency Quantiles | IO 延迟分位数 |
| GuestOS Detail | Guest OS 详情 |
| Container Health Snapshot | 容器健康快照 |

## Key Notes

- BlobPerf 数据来源于 SurfaceCounter 文件，HostAnalyzer 本地存储
- 对于性能问题，BlobPerf 提供 5 秒平均值统计，用于理解特定时间窗口的 throttling 情况
- ADO Wiki 链接：https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495956/Host-Analyzer-Report-Disk-VM-Metrics_Tool
