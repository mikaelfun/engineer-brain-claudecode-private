# Disk 产品排查 Skill

> 覆盖 Azure Managed Disks、Ultra Disk、Premium SSD v2、Disk Encryption。

## 1. 诊断层级

```
Layer 1: Disk RP
  ├─ 集群: disksmc.chinaeast2 / Disks
  ├─ 关键表: DiskManagerApiQoSEvent, DiskRPResourceLifecycleEvent
  └─ 用途: 磁盘操作 API 日志

Layer 2: Host IO
  ├─ 集群: azcore.chinanorth3 / Fa
  ├─ 关键表: OsXIOSurfaceCounterTable, OsXIOThrottleCounterTable
  └─ 用途: IO 性能指标、限流检测

Layer 3: Hardware
  ├─ 集群: azuredcmmc / AzureDCMDb
  ├─ 关键表: dcmInventoryComponentDiskDirect
  └─ 用途: 物理磁盘状态
```

## 2. 决策树

### IO 性能问题
```
磁盘 IO 慢
  ├─→ Host 查 OsXIOThrottleCounterTable → 是否触发限流
  │     ├─ ThrottleCount > 0 → 达到 IOPS/MBPS 上限
  │     │     └─ 建议: 升级 SKU / 启用 bursting / 分散 IO
  │     └─ 无限流 → 查 OsXIOSurfaceLatencyHistogramTableV2 → 延迟分布
  ├─→ Host 查 OsXIOSurfaceCounterTable → IOPS/MBPS 使用率
  └─→ msft-learn: "Azure disk performance troubleshoot"
```

### 磁盘操作失败
```
Disk attach/detach/resize 失败
  ├─→ Disk RP 查 DiskManagerApiQoSEvent → 操作结果
  ├─→ Disk RP 查 DiskManagerContextActivityEvent → 详细错误
  └─→ 如果是 CRP 问题 → 转 VM 产品 skill
```

## 3. 可用工具链

- **Kusto**: `skills/kusto/disk/` (3 DB: Disks, Fa, AzureDCMDb)
- **ADO Wiki**: "disk throttling", "disk performance"
- **msft-learn**: Azure Disk 性能文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| IO throttling | 达到 IOPS/MBPS 上限 | 升级 SKU / 启用 bursting |
| 高延迟 | Storage 后端延迟 | 检查 XStore latency |
| Disk attach 失败 | 并发操作 / LUN 限制 | 等待后重试 / 检查 LUN 数量 |
