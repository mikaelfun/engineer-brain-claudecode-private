---
title: Azure VM Allocation Failure Troubleshooting Guide
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/allocation-failure
product: vm
tags: [allocation-failure, capacity, deployment, availability-set, PPG, availability-zone]
21vApplicable: true
---

# Azure VM Allocation Failure Troubleshooting Guide

## 错误类型

| 错误代码 | 场景 |
|----------|------|
| AllocationFailed | 通用容量不足 |
| ZonalAllocationFailed | 可用区容量不足 |
| OverconstrainedAllocationRequest | 约束过多无法满足 |
| OverconstrainedZonalAllocationRequest | 可用区+多约束 |

## 场景决策树

### 1. 独立 VM（无 Availability Set/PPG）
- 原因：区域/Zone 容量不足
- 方案：重试 / 换 VM Size / 换 Region/Zone / 用 On-demand Capacity Reservations

### 2. Availability Set 中添加/调整 VM
- 原因：请求必须在托管现有 Availability Set 的原始集群执行，该集群可能不支持目标 Size 或容量不足
- 方案：创建新 Availability Set / 换 VM Size / 先 Deallocate 所有 VM 再批量启动

### 3. 完全停止的 Availability Set VM
- 原因：启动请求在区域/Zone 所有集群中尝试但均无足够容量
- 方案：重试 / 换 Size / 换 Region/Zone

### 4. Availability Zone 分配失败
- 原因：Zone 内物理隔离数据中心容量受限
- 方案：重试 / 换 Size / 换 Zone（从 snapshot 创建新 VM）/ 去除 Zone 约束

### 5. Overconstrained 分配失败
- 约束因素：VM Size + Accelerated Networking + Zone + Ephemeral Disk + PPG + Ultra/PremiumSSDv2
- 方案：逐步减少约束（禁用 AccelNet、移除 PPG、移除 Ultra Disk）

### 6. PPG 分配失败
- 原因：PPG 要求资源共置于同一数据中心，首个 VM 的数据中心选定后无法更改
- 方案：Deallocate 所有 PPG 中 VM → 按最受限 SKU 优先启动

### 7. 旧版 VM SKU
- Av1→Av2, Dv1/DSv1→Dv3/DSv3 或 Ev3/ESv3, D15v2→D16v3 或 E64i_v3
- 旧硬件逐步退役，迁移到新系列

### 8. 大规模部署 (>500 cores)
- 减少单次部署实例数 / 使用多 Placement Group 的 VMSS

## 背景知识

Azure 数据中心服务器分区为集群。正常分配请求在多集群尝试，但特定约束（VM Size、Ultra SSD、PPG）可能将请求限制到单个集群。约束越多，可用资源池越小，失败概率越高。
