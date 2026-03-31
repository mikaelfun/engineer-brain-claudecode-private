---
name: RhwChassisSelItemEtwTable
database: AzureDcmDb
cluster: https://azuredcmmc.kusto.chinacloudapi.cn
description: 机箱 SEL (System Event Log) 事件表，记录 BMC 系统事件日志
status: active
---

# RhwChassisSelItemEtwTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azuredcmmc.kusto.chinacloudapi.cn |
| 数据库 | AzureDcmDb |
| 状态 | ✅ 可用 |

## 用途

记录物理节点 BMC (Baseboard Management Controller) 的系统事件日志（SEL），包括硬件传感器告警、温度/电压/风扇异常、内存 ECC 错误等。是硬件故障诊断的核心数据源。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | |
| Cluster | string | 集群名称 | |
| ResourceId | string | 节点资源 ID | |
| BmcSelItemTimeStamp | datetime | SEL 事件时间 | |
| BmcSelItemSeverity | string | 严重级别 | Critical/Warning |
| BmcSelItemSensorType | string | 传感器类型 | Temperature/Voltage |
| BmcSelItemSensorName | string | 传感器名称 | Inlet Temp |
| BmcSelItemDetails | string | 事件详情 | Upper Critical |
| BmcSelItemRawHex | string | 原始十六进制数据 | |
| BmcSelItemEventType | string | 事件类型 | |
| BmcSelItemSource | string | 事件来源 | |

## 常用筛选字段

- `ResourceId` - 按节点资源 ID 筛选
- `Cluster` - 按集群筛选
- `BmcSelItemSeverity` - 按严重级别筛选（Critical/Warning）
- `BmcSelItemSensorType` - 按传感器类型筛选

## 典型应用场景

1. **硬件故障根因分析** - 查看节点 BMC SEL 中的 Critical 事件
2. **内存 ECC 错误检查** - 筛选 Memory 类型传感器事件
3. **温度/电压异常** - 检查散热和供电问题

## 示例查询

```kql
RhwChassisSelItemEtwTable
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where ResourceId has "{nodeId}" or Cluster == "{clusterName}"
| where BmcSelItemSeverity in ("Critical", "Warning")
| project BmcSelItemTimeStamp, BmcSelItemSeverity, BmcSelItemSensorType, BmcSelItemSensorName, BmcSelItemDetails
| order by BmcSelItemTimeStamp desc
```

## 关联表

- [RhLiteDiagBmcSel.md](./RhLiteDiagBmcSel.md) - BMC SEL 诊断数据
- [dcmInventoryComponentSystemDirect.md](./dcmInventoryComponentSystemDirect.md) - 系统硬件清单
- [RdmResourceSnapshot.md](./RdmResourceSnapshot.md) - 节点资源快照
