---
title: Capacity Reservation Billing Scenarios
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/capacity-reservation-billing-scenerios
product: vm
21vApplicable: false
date: 2026-04-18
---

# Capacity Reservation 计费场景

## 概述
Azure Capacity Reservation 按底层 VM 大小的相同费率计费。

## 计费规则

### 基本原则
- 创建预留即开始计费，无论是否使用
- VM 关联到预留后，只收 VM 费用，不额外收预留费
- 已用和未用的预留均可享受 Reserved Instances 折扣

### 示例 1
- 预留 10 个 D2s_v3
- 部署 5 个 VM 关联到预留
- 账单：5 个 VM + 5 个未用预留（费率相同）
- 如有 2 个 RI：抵扣 2 个资源（VM 或未用预留均可），剩余 8 个按 PAYG

### 示例 2
- 预留数量 2，有 1 个匹配的 RI
- RI 折扣应用于一个未用实例，该实例费用归零
- 另一个按 PAYG 计费
- VM 分配后，磁盘/网络/扩展等组件另计
