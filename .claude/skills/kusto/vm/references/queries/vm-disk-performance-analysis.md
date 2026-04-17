---
name: vm-disk-performance-config
description: VM 磁盘性能配置分析 - 查询 VM SKU、附加磁盘类型、IOPS/带宽限制，识别性能瓶颈
tables:
  - VMApiQosEvent (crp_allmc)
  - Disk (Disks)
  - Microsoft Learn API (VM SKU/Disk 规格)
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: vmname
    required: true
    description: VM 名称
  - name: resourceId
    required: false
    description: VM 资源 ID (可选)
---

# VM 磁盘性能配置分析

## 用途

端到端分析 Azure VM 的磁盘性能配置，包括：
1. 查询 VM SKU 型号和磁盘数量
2. 查询附加的所有磁盘 (OS + Data) 的类型和大小
3. 根据 VM SKU 和磁盘 SKU 确定 IOPS/带宽限制
4. 识别性能瓶颈 (VM 级别 vs 磁盘级别)
5. 提供性能优化建议

## 诊断流程

```
步骤 1: 查询 VM SKU 和基本配置
   ↓
步骤 2: 查询附加磁盘的详细信息
   ↓
步骤 3: 从 Microsoft Learn 获取 VM SKU 性能规格
   ↓
步骤 4: 从 Microsoft Learn 获取磁盘性能规格
   ↓
步骤 5: 对比 VM 和磁盘限制，识别瓶颈
   ↓
步骤 6: 生成性能分析报告和优化建议
```

## 查询语句

### 步骤 1: 查询 VM SKU 和磁盘数量

```kql
// 从 CRP Kusto 获取 VM 的 SKU、OS 类型、磁盘配置
let subscriptionId = "{subscription}";
let vmName = "{vmname}";
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VMApiQosEvent
| where TIMESTAMP > ago(365d)
| where subscriptionId == subscriptionId
| where resourceName =~ vmName
| where isnotempty(vMSize)
| summarize arg_max(PreciseTimeStamp, *) by vMId
| project PreciseTimeStamp, vMId, resourceName, vMSize, oSType, oSDiskStorageAccountType, 
         platformImage, galleryImage, isManaged, fabricCluster, fabricTenantName, extraVMProperties
```

**结果字段说明:**
- `vMSize`: VM SKU 型号 (例如: Standard_E2s_v3, Standard_D4s_v3)
- `oSDiskStorageAccountType`: OS 磁盘类型 (Premium_LRS, StandardSSD_LRS, Standard_LRS)
- `extraVMProperties`: JSON 字符串，包含 `DataDisks` 数量、`OSDiskSizeInGB` 等信息

**解析 extraVMProperties 示例:**
```json
{
  "OSDiskSizeInGB": 127,
  "DataDisks": 2,
  "HyperVGenerationType": "Gen1"
}
```

---

### 步骤 2: 查询附加磁盘的详细配置

```kql
// 从 Disk RP Kusto 获取 VM 所有附加磁盘的信息
let subscriptionId = "{subscription}";
let vmName = "{vmname}";
cluster('disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').Disk
| where SubscriptionId == subscriptionId
| where TIMESTAMP > ago(7d)
| parse kind=regex OwnerReferenceKey with * 'VIRTUALMACHINES%2F' VMName '$'
| where VMName =~ vmName
| extend DiskSizeGB = DiskSizeBytes / 1024 / 1024 / 1024
| extend TotalIOPS = TotalOperationsPerSecond
| extend TotalMBPS = TotalBytesPerSecond / 1024 / 1024
| summarize arg_max(TIMESTAMP, *) by DiskArmId
| project DiskArmId, DisksName, AccountType, Tier, DiskSizeGB, TotalIOPS, TotalMBPS, 
         OwnershipState, VMName, TimeCreated, BlobUrl
| order by DisksName asc
```

**结果字段说明:**
- `AccountType`: 磁盘类型 (Premium_LRS, StandardSSD_LRS, Standard_LRS)
- `DiskSizeGB`: 磁盘大小 (GB)
- `Tier`: 性能层级 (可能为空，需根据 AccountType + Size 推断)
- `TotalIOPS` / `TotalMBPS`: 配置的 IOPS/吞吐量 (通常为 0，需查询官方规格)

**磁盘类型和层级对应关系:**

| 磁盘类型 | 大小范围 | 层级 | IOPS | 吞吐量 |
|----------|----------|------|------|--------|
| Premium_LRS | 32 GB | P4 | 120 | 25 MB/s |
| Premium_LRS | 64 GB | P6 | 240 | 50 MB/s |
| Premium_LRS | 128 GB | P10 | 500 | 100 MB/s |
| Premium_LRS | 256 GB | P15 | 1,100 | 125 MB/s |
| Premium_LRS | 512 GB | P20 | 2,300 | 150 MB/s |
| Premium_LRS | 1024 GB | P30 | 5,000 | 200 MB/s |
| Premium_LRS | 2048 GB | P40 | 7,500 | 250 MB/s |
| Premium_LRS | 4096 GB | P50 | 7,500 | 250 MB/s |
| StandardSSD_LRS | 1024 GB | E30 | 500 | 100 MB/s (基准) |
| StandardSSD_LRS | 1024 GB | E30 | 1,000 | 250 MB/s (Burst 30分钟) |
| Standard_LRS | - | - | ~500 | ~60 MB/s (不保证) |

---

### 步骤 3: 查询 VM SKU 性能规格 (Microsoft Learn)

**MCP 工具:** `microsoftdocs-microsoft_docs_search`

**查询参数:**
```
query: "{vMSize} VM size IOPS bandwidth throughput limits specifications"
例如: "Standard_E2s_v3 VM size IOPS bandwidth throughput limits specifications"
```

**关键信息提取:**
- Max data disks (最大数据磁盘数)
- Max cached disk throughput: IOPS/MBps (缓存磁盘性能)
- Max uncached disk throughput: IOPS/MBps (非缓存磁盘性能) ⚠️ 关键瓶颈
- Burst uncached disk throughput: IOPS/MBps (突发性能)
- Max NICs / Expected network bandwidth (网络带宽)

**常见 VM 系列性能对照表:**

| VM SKU | vCPU | RAM | 非缓存 IOPS | 非缓存吞吐量 | 缓存 IOPS | 缓存吞吐量 |
|--------|------|-----|-------------|--------------|-----------|------------|
| Standard_E2s_v3 | 2 | 16 GB | 3,200 | 48 MB/s | 4,000 | 32 MB/s |
| Standard_E4s_v3 | 4 | 32 GB | 6,400 | 96 MB/s | 8,000 | 64 MB/s |
| Standard_E8s_v3 | 8 | 64 GB | 12,800 | 192 MB/s | 16,000 | 128 MB/s |
| Standard_D4s_v3 | 4 | 16 GB | 6,400 | 96 MB/s | 8,000 | 64 MB/s |
| Standard_D8s_v3 | 8 | 32 GB | 12,800 | 192 MB/s | 16,000 | 128 MB/s |

**文档链接:**
- [Ev3 and Esv3-series](https://learn.microsoft.com/en-us/azure/virtual-machines/ev3-esv3-series)
- [Dv3 and Dsv3-series](https://learn.microsoft.com/en-us/azure/virtual-machines/dv3-dsv3-series)

---

### 步骤 4: 查询磁盘性能规格 (Microsoft Learn)

**MCP 工具:** `microsoftdocs-microsoft_docs_search`

**查询参数:**
```
query: "Premium_LRS StandardSSD_LRS P30 E30 disk IOPS bandwidth performance limits Azure"
```

**关键信息提取:**
- Disk size (磁盘大小)
- Tier (性能层级: P10, P30, E30 等)
- Max IOPS per disk (最大 IOPS)
- Max throughput per disk (最大吞吐量)
- Burst IOPS / Burst throughput (突发性能，仅 StandardSSD)

**Premium SSD (Premium_LRS) 性能规格:**

| 层级 | 大小 | 最大 IOPS | 最大吞吐量 |
|------|------|-----------|------------|
| P4 | 32 GB | 120 | 25 MB/s |
| P6 | 64 GB | 240 | 50 MB/s |
| P10 | 128 GB | 500 | 100 MB/s |
| P15 | 256 GB | 1,100 | 125 MB/s |
| P20 | 512 GB | 2,300 | 150 MB/s |
| P30 | 1024 GB | 5,000 | 200 MB/s |
| P40 | 2048 GB | 7,500 | 250 MB/s |
| P50 | 4096 GB | 7,500 | 250 MB/s |

**Standard SSD (StandardSSD_LRS) 性能规格:**

| 层级 | 大小 | 基准 IOPS | 基准吞吐量 | Burst IOPS | Burst 吞吐量 |
|------|------|-----------|------------|------------|--------------|
| E10 | 128 GB | 500 | 100 MB/s | 600 | 150 MB/s |
| E15 | 256 GB | 500 | 100 MB/s | 600 | 150 MB/s |
| E20 | 512 GB | 500 | 100 MB/s | 600 | 150 MB/s |
| E30 | 1024 GB | 500 | 100 MB/s | 1,000 | 250 MB/s |
| E40 | 2048 GB | 500 | 100 MB/s | - | - |
| E50 | 4096 GB | 500 | 100 MB/s | - | - |

**文档链接:**
- [Scalability and performance targets for VM disks](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-scalability-targets)
- [Azure managed disk types](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-types)

---

## 性能瓶颈分析方法

### 瓶颈识别公式

```
实际可用 IOPS = MIN(VM 非缓存 IOPS, SUM(各磁盘 IOPS))
实际可用吞吐量 = MIN(VM 非缓存吞吐量, SUM(各磁盘吞吐量))
```

### 瓶颈判断

| 条件 | 瓶颈位置 | 建议 |
|------|----------|------|
| VM IOPS < 磁盘总 IOPS | ❌ **VM 级别瓶颈** | 升级 VM SKU |
| VM 吞吐量 < 磁盘总吞吐量 | ❌ **VM 级别瓶颈** | 升级 VM SKU |
| VM IOPS > 磁盘总 IOPS | ✅ 磁盘充分利用 | 考虑升级磁盘 SKU |
| VM 吞吐量 > 磁盘总吞吐量 | ✅ 磁盘充分利用 | 考虑升级磁盘 SKU |

### 示例分析

**场景:** Standard_E2s_v3 + P30 (1024 GB Premium_LRS)

| 性能维度 | VM 限制 | 磁盘能力 | 实际可用 | 瓶颈 |
|----------|---------|----------|----------|------|
| IOPS | 3,200 | 5,000 | **3,200** | ❌ VM 限制 |
| 吞吐量 | 48 MB/s | 200 MB/s | **48 MB/s** | ❌ VM 限制 |

**结论:** P30 磁盘的 5,000 IOPS / 200 MB/s 性能被 VM 的 3,200 IOPS / 48 MB/s 限制。升级到 Standard_E4s_v3 (6,400 IOPS / 96 MB/s) 可解锁更多磁盘性能。

---

## 性能优化建议模板

### 建议 1: 升级 VM SKU

**适用场景:** VM IOPS/吞吐量 < 磁盘总性能

**推荐 SKU:**
- 从 Standard_E2s_v3 → Standard_E4s_v3 (IOPS 翻倍: 3,200 → 6,400)
- 从 Standard_E4s_v3 → Standard_E8s_v3 (IOPS 翻倍: 6,400 → 12,800)

**优先级:** 🔴 高

**预期效果:**
- 非缓存 IOPS 提升 X 倍
- 非缓存吞吐量提升 Y 倍
- 可充分利用磁盘性能

---

### 建议 2: 启用主机缓存

**适用场景:** 读多写少的工作负载 (如数据库只读副本)

**缓存模式:**
- **ReadOnly**: 适用于只读数据磁盘
- **ReadWrite**: 适用于 OS 磁盘 (默认启用)
- **None**: 适用于写密集型工作负载 (默认)

**优先级:** 🟡 中

**预期效果:**
- 读操作 IOPS 可达缓存限制 (通常高于非缓存)
- 降低读延迟 (从缓存读取)
- 不适用于写密集型场景

---

### 建议 3: 升级磁盘 SKU

**适用场景:** VM IOPS/吞吐量 > 磁盘总性能

**升级路径:**
- StandardSSD_LRS (E30) → Premium_LRS (P30): IOPS 500 → 5,000
- Premium_LRS (P20) → Premium_LRS (P30): IOPS 2,300 → 5,000

**优先级:** 🟡 中

**注意事项:**
- 需要停止 VM 并分离/重新附加磁盘
- 或创建新磁盘并迁移数据

---

### 建议 4: 考虑 Premium SSD v2

**适用场景:** 需要灵活配置 IOPS/吞吐量

**优势:**
- 按需独立调整 IOPS 和吞吐量
- 不受磁盘大小限制
- 更精细的性能控制

**优先级:** 🟢 低

**限制:**
- 需要重建磁盘 (不支持原地升级)
- 某些区域可能不可用
- 成本可能更高

---

## 报告输出格式

### 一、VM 基本信息

| 字段 | 值 |
|------|-----|
| 资源 ID | {resourceId} |
| VM 名称 | {vmName} |
| VM SKU | {vMSize} |
| 操作系统 | {oSType} + {platformImage} |
| 区域 | {region} |
| 创建时间 | {TimeCreated} |

---

### 二、诊断查询过程

**步骤 1: 查询 VM SKU**
- KQL 查询语句
- 查询结果表格
- 发现/结论

**步骤 2: 查询附加磁盘**
- KQL 查询语句
- 查询结果表格
- 发现/结论

---

### 三、性能限制汇总

#### VM 级别限制 ({vMSize})

| 性能指标 | 限制值 |
|----------|--------|
| 最大数据磁盘数 | {maxDataDisks} |
| 非缓存磁盘最大 IOPS | {uncachedIOPS} ⚠️ |
| 非缓存磁盘最大吞吐量 | {uncachedThroughput} ⚠️ |
| 缓存磁盘最大 IOPS | {cachedIOPS} |
| 缓存磁盘最大吞吐量 | {cachedThroughput} |

#### 磁盘级别限制

**OS 磁盘:**
- 类型: {osDiskType}
- 大小: {osDiskSizeGB} GB
- 层级: {osDiskTier}
- IOPS: {osDiskIOPS}
- 吞吐量: {osDiskThroughput}

**数据磁盘 1:**
- 类型: {dataDisk1Type}
- 大小: {dataDisk1SizeGB} GB
- 层级: {dataDisk1Tier}
- IOPS: {dataDisk1IOPS}
- 吞吐量: {dataDisk1Throughput}

---

### 四、瓶颈分析

| 性能维度 | VM 限制 | 磁盘总和 | 实际可用 | 瓶颈位置 |
|----------|---------|----------|----------|----------|
| IOPS | {vmIOPS} | {totalDiskIOPS} | {actualIOPS} | {bottleneck} |
| 吞吐量 | {vmThroughput} | {totalDiskThroughput} | {actualThroughput} | {bottleneck} |

**关键发现:**
- ✅ / ❌ 磁盘性能充足/不足
- ✅ / ❌ VM 型号是否成为瓶颈
- 实际可用性能说明

---

### 五、优化建议

| 建议 | 优先级 | 预期效果 |
|------|--------|----------|
| {建议1} | 🔴/🟡/🟢 | {效果描述} |
| {建议2} | 🔴/🟡/🟢 | {效果描述} |

---

## 相关查询

- [vm-operations.md](./vm-operations.md) - VM 操作查询
- [container-snapshot.md](./container-snapshot.md) - VM 容器快照
- [disk-operations.md](./disk-operations.md) - 磁盘操作查询
- [../../disk/references/queries/disk-metadata.md](../../disk/references/queries/disk-metadata.md) - 磁盘元数据查询

---

## 技术原理说明

### VM 磁盘性能限制层级

```
┌──────────────────────────────────────────┐
│ 应用程序 I/O 请求                          │
└──────────────────┬───────────────────────┘
                   ↓
┌──────────────────────────────────────────┐
│ VM 级别限制 (非缓存/缓存)                  │ ← 第一层瓶颈
│ - Max uncached IOPS/Throughput            │
│ - Max cached IOPS/Throughput              │
└──────────────────┬───────────────────────┘
                   ↓
┌──────────────────────────────────────────┐
│ 磁盘级别限制 (每块磁盘独立)               │ ← 第二层瓶颈
│ - Premium SSD (P10/P30/P50)               │
│ - Standard SSD (E10/E30/E50)              │
│ - Standard HDD                            │
└──────────────────┬───────────────────────┘
                   ↓
┌──────────────────────────────────────────┐
│ Azure Storage 后端 (XStore)               │
└──────────────────────────────────────────┘
```

**关键要点:**
1. **VM 限制优先级最高**: 即使磁盘性能很高，也会被 VM 限制
2. **缓存 vs 非缓存**: 缓存磁盘有独立的更高限制
3. **磁盘累加**: 多块磁盘的 IOPS/吞吐量可以累加，但不能超过 VM 限制

---

## 故障排查检查清单

- [ ] 确认 VM SKU 和磁盘类型
- [ ] 计算 VM 级别和磁盘级别的 IOPS/吞吐量限制
- [ ] 识别性能瓶颈位置 (VM vs 磁盘)
- [ ] 检查是否启用了主机缓存
- [ ] 确认工作负载类型 (读密集 vs 写密集)
- [ ] 评估是否需要升级 VM SKU 或磁盘 SKU
- [ ] 提供具体的优化建议和预期效果
