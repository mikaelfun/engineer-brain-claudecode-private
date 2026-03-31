---
name: VMALENS_MonitorRCAEvents
database: vmadb
cluster: https://vmainsight.kusto.windows.net
description: VMA LENS Monitor RCA 事件，记录 VM 可用性的详细 RCA 分析结果
status: active
---

# VMALENS_MonitorRCAEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://vmainsight.kusto.windows.net |
| 数据库 | vmadb |
| 状态 | ✅ 可用 |

> ⚠️ 此集群为 Public 端点，但包含 Mooncake VM 数据

## 用途

VMA LENS 系统的 Monitor RCA 事件表，提供比 VMA 表更详细的 RCA 分析数据，包含两级 RCA 分类。用于深度可用性分析。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 事件时间 | |
| querytime | datetime | 查询时间 | |
| seed | datetime | 种子时间 | |
| RCALevel1 | string | RCA 一级分类 | PlatformInitiated |
| RCALevel2 | string | RCA 二级分类 | HardwareFailure |
| NodeId | string | 节点 ID | |
| ContainerId | string | 容器 ID | |
| ResourceId | string | ARM 资源 ID | |

## 常用筛选字段

- `ContainerId` - 按容器 ID 筛选
- `ResourceId` - 按 ARM 资源 ID 筛选
- `RCALevel1` / `RCALevel2` - 按 RCA 分类筛选

## 典型应用场景

1. **深度 RCA 分析** - 获取比 VMA 表更细粒度的根因分类
2. **可用性趋势** - 按 RCA 分类统计可用性影响事件
3. **Platform vs Customer 区分** - 确认事件是平台发起还是客户发起

## 示例查询

```kql
VMALENS_MonitorRCAEvents
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where ContainerId == "{containerId}"
| project PreciseTimeStamp, RCALevel1, RCALevel2, NodeId, ContainerId, ResourceId
| order by PreciseTimeStamp desc
```

## 关联表

- [VMA.md](./VMA.md) - VMA 可用性事件（主表）
