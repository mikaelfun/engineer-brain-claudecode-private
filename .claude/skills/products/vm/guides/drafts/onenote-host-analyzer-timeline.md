# Host Analyzer Report — Timeline Tab

**Source**: Mooncake POD Support Notebook > VMSCIM > VM > Tools > Host Analyzer > d. Timeline

## Overview

Timeline 是 HA 报告的第一个显示标签页，汇集了所有关键发现，按时间顺序展示来自 Host、Hyper-V、Fabric、VM、NetVMA 等不同视角的事件。

支持鼠标滚轮缩放查看更细粒度的数据，双击特定事件可跳转到对应详情标签页。

> **Microsoft Confidential**: 报告内容不可对客户共享。

## Timeline Rows

| Row | 说明 |
|-----|------|
| IO Throttling | IO 限流事件 |
| IO Latency | IO 延迟事件 |
| VM Health | VM 健康状态变化 |
| Container Health | 容器健康状态变化 |
| Host PingMesh | 宿主机 PingMesh 网络探测 |
| NET VMA | 网络 VMA 事件 |
| CRP Events | CRP（Compute Resource Provider）事件 |

## Key Notes

- 事件来自不同的数据源和视角，Timeline 有助于理解事件的时间先后关系
- 可通过鼠标交互缩放和跳转
- ADO Wiki 链接：https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495965/Host-Analyzer-Report-Timeline_Tool
