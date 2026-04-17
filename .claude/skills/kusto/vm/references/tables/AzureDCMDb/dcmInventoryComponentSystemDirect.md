---
name: dcmInventoryComponentSystemDirect
database: AzureDCMDb
cluster: https://azuredcmmc.kusto.chinacloudapi.cn
description: DCM 系统组件清单表，记录节点系统级硬件信息（BIOS、主板、处理器、内存等）
status: active
---

# dcmInventoryComponentSystemDirect

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azuredcmmc.kusto.chinacloudapi.cn |
| 数据库 | AzureDcmDb |
| 状态 | ✅ 可用 |

## 用途

记录物理节点的系统级硬件清单信息，包括制造商、BIOS 版本、BMC 版本、处理器数量、内存容量等。用于硬件故障诊断和固件版本确认。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| DataCollectedOn | datetime | 数据采集时间 | |
| ClusterId | string | 集群 ID | |
| NodeId | string | 节点 ID | |
| Manufacturer | string | 制造商 | Dell Inc. |
| ProductName | string | 产品名称 | PowerEdge R640 |
| SerialNumber | string | 序列号 | |
| BIOSVersion | string | BIOS 版本 | |
| BmcVersion | string | BMC 版本 | |
| Wmi_CS_NumberOfProcessors | long | CPU 数量 | 2 |
| Wmi_CS_NumberOfLogicalProcessors | long | 逻辑核心数 | 96 |
| Wmi_CS_TotalPhysicalMemory | real | 物理内存总量 | |
| OsImageName | string | OS 镜像名称 | |
| Hostname | string | 主机名 | |

## 常用筛选字段

- `NodeId` - 按节点 ID 筛选
- `ClusterId` - 按集群筛选
- `Manufacturer` / `ProductName` - 按硬件型号筛选

## 典型应用场景

1. **硬件信息查询** - 获取节点的制造商、型号、序列号
2. **固件版本确认** - 查看 BIOS/BMC 版本是否需要升级
3. **硬件故障辅助诊断** - 结合 SEL 事件分析硬件问题

## 示例查询

```kql
dcmInventoryComponentSystemDirect
| where NodeId == "{nodeId}"
| top 1 by DataCollectedOn desc
| project DataCollectedOn, Manufacturer, ProductName, SerialNumber, BIOSVersion, BmcVersion, 
         Wmi_CS_NumberOfProcessors, Wmi_CS_TotalPhysicalMemory
```

## 关联表

- [dcmInventoryComponentDiskDirect.md](./dcmInventoryComponentDiskDirect.md) - 磁盘清单
- [RdmResourceSnapshot.md](./RdmResourceSnapshot.md) - 节点资源快照
- [RhwChassisSelItemEtwTable.md](./RhwChassisSelItemEtwTable.md) - 机箱 SEL 事件
