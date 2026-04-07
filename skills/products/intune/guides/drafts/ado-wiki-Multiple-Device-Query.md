---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/AdminUI/Multiple Device Query"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAdminUI%2FMultiple%20Device%20Query"
importDate: "2026-04-04"
type: troubleshooting-guide
---

# Intune Multiple Device Query (MDQ) — 排查指南

## 功能简介

Multiple Device Query (MDQ) 是 Intune Advanced Analytics 功能，允许管理员通过 KQL 语法跨设备查询收集的 Inventory 数据。

> ⚠️ 是 "KQL-like"，不完全等同于标准 KQL。注意**大小写敏感**。

**License 要求**：Intune Advanced Analytics / Intune Suite add-on

## 工作原理

1. 管理员在 Admin Center 选择目标表
2. 输入查询语句
3. 服务验证 scope、RBAC 和查询限制
4. 跨符合条件的设备执行查询
5. 聚合结果返回 UI

## Scoping Questions

1. 使用的确切查询语句是什么？
2. 设备平台和 OS 版本？
3. 目标设备数量？
4. 能否用更小的测试组复现？
5. 失败是持续还是间歇性？
6. 正常/失败管理员之间有 RBAC 差异吗？
7. 最近是否有服务事件或租户级别延迟？

## 常见问题排查

### 查询语法正确但无结果

**可能原因**：查询过于具体，底层数据不存在或过滤条件太严格

**排查**：
1. 减少过滤条件，验证底层数据是否存在
2. 区分"好查询无结果"和"坏查询报错"（见下图说明）

### 查询报语法错误

**排查**：
- 注意属性名大小写（如 `CycleCount` 不是 `Cyclecount`）
- 检查报错提示中的具体位置

## 常见查询模式 + Troubleshooting

### Pattern 1: `summarize` 或 `order by` 与 Device 实体
```kusto
// ❌ 不可靠
Cpu
| summarize max(CpuUsage) by Device

// ✅ 推荐
Cpu
| summarize MaxCpuUsage = max(CpuUsage) by Device.DeviceName
| order by MaxCpuUsage desc
```

### Pattern 2: 聚合别名错误
```kusto
// ❌ 可能报错
Device
| summarize dcount(DeviceId)
| order by dcount_DeviceId

// ✅ 推荐
Device
| summarize DeviceCount = dcount(DeviceId)
| order by DeviceCount desc
```

### Pattern 3: Join 问题
```kusto
// ✅ 推荐 - 使用 on Device，最多 3 个 join
EncryptableVolume
| where ProtectionStatus != "PROTECTED"
| join LogicalDrive on Device
| project Device.DeviceName, DriveLetter, ProtectionStatus
```

> ⚠️ 2602 更新：不再支持 `on Device.DeviceId`，改用 `on Device` 或省略 on 子句

### Pattern 4: 结果过多或超时
```kusto
// ✅ 先 where 缩小范围，再 take/top 限制输出
Cpu
| where Device.OSVersion startswith "10.0."
| project Device.DeviceName, CpuUsage, Model
| top 200 by CpuUsage desc
```

### Pattern 5: `datetime_add()` 负值失败
```kusto
// ✅ 用 ago() 做相对时间比较
Time
| where Timestamp >= ago(1d)
| project Device.DeviceName, Timestamp
```

## 已知 Good 查询示例

```kusto
// 设备数按 OS 版本统计
Device
| summarize count() by OsDescription, OsVersion

// 未加密磁盘设备
EncryptableVolume
| where ProtectionStatus != "PROTECTED"
| join LogicalDrive

// 电池容量 Top 10 低的设备
Battery
| project Device, InstanceName, Manufacturer, Model, SerialNumber, CycleCount, DesignedCapacity, FullChargedCapacity, FullChargedCapacityPercent = (FullChargedCapacity*100)/DesignedCapacity
| top 10 by FullChargedCapacityPercent asc
```

## 2602 重要变更

- **新支持 Join 类型**：`leftsemi`、`rightsemi`、`leftanti`、`rightanti`
- **不再支持** `on Device.DeviceId`，改用 `on Device`
- `distinct`、`summarize`、`order by` 中不能使用裸 `Device`，必须引用具体属性

## 2603 新功能

- 查询结果支持文本搜索框
- 列标题可添加过滤器
- 可从设备结果直接创建 Microsoft Entra 安全组

## FAQ

**Q: 为什么某些设备没有返回结果？**
A: 设备可能离线、不在查询支持范围、不符合条件或最近未同步。

**Q: 两个管理员看到结果不同？**
A: 通常因为 RBAC scope、分配目标或条件访问控制不同。
