# Host Analyzer Report — Host Metrics Tab

**Source**: Mooncake POD Support Notebook > VMSCIM > VM > Tools > Host Analyzer > c. Host Metrics

## Overview

包含物理服务器的遥测信息，数据来源于物理服务器性能计数器和 Kusto（RDOS/AzureVM cluster）。

## Sub-Tabs

| Sub-Tab | 用途 |
|---------|------|
| Host Details | Cluster、NodeId、NodeIp、ContainerCount、HostOS 版本、Disk Configuration (AllDisksAbc/AllDisksJbod/AllDisksInStripe) |
| OS Component Versions | 宿主机驱动和库文件版本列表 |
| Host Charts | Hyper-V 宿主机性能指标图表（指定时间范围）：可用内存等 |
| PoolMon Data | 内存池监控数据 |
| Azure Profiler | Azure Profiler 数据 |
| VhdDisk ETW Events | VHD 磁盘 ETW 事件 |
| OsBlobCacheConfigTable | OS Blob 缓存配置表 |
| BlobProperties | Blob 属性 |
| OsAnalyzerTable | OS 分析表 |
| OsDriverLogTable | OS 驱动日志 |
| OsLoggerTable | OS Logger 表 |
| ComputeHourUsageTable | 计算小时使用量 |
| ExtendedDetailsEtwTable | 扩展详情 ETW 表 |
| Node Service Fault Events | 节点服务故障事件 |
| Barbera Data | Barbera 数据 |

## Key Notes

- Host Charts 基于 Hyper-V 宿主机性能指标（参考 [Hyper-V Terminology](https://docs.microsoft.com/windows-server/administration/performance-tuning/role/hyper-v-server/terminology)）
- Disk Configuration 字段可指示磁盘配置模式
- ADO Wiki 链接：https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495961/Host-Analyzer-Report-Host-Metrics_Tool
