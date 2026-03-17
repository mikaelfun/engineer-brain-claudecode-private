---
name: hardware-failure
description: 硬件故障查询 - 排查节点硬件问题和修复历史
tables:
  - ResourceSnapshotHistoryV1  # ⚠️ Mooncake 不可用，改用 RdmResourceSnapshot
  - ResourceSnapshotHistoryV2  # ⚠️ Mooncake 不可用，改用 RdmResourceSnapshot
  - dcmInventoryComponentDiskDirect
  - FaultCodeTeamMapping  # ⚠️ Mooncake 不可用
  - RhwChassisSelItemEtwTable
  - HawkeyeRCAEvents
  - AnvilASMNodeFaultEvents
  - CentralBondOSVhdDiskE17
parameters:
  - name: nodeId
    required: true
    description: 节点 ID
  - name: starttime
    required: false
    description: 开始时间
  - name: endtime
    required: false
    description: 结束时间
---

# 硬件故障查询

## 用途

排查节点硬件问题，包括故障代码、修复历史、硬件库存、BMC-SEL 日志等。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {nodeId} | 是 | 节点 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {starttime} | 否 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 否 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询节点生命周期状态

> ⚠️ **Mooncake 不可用**: ResourceSnapshotHistoryV1 在 Mooncake 不存在。替代方案：使用 RdmResourceSnapshot 表查询当前状态。

```kql
cluster("azuredcmmc.kusto.chinacloudapi.cn").database("AzureDCMDb").ResourceSnapshotHistoryV1
| where ResourceId == "{nodeId}"
| project PreciseTimeStamp, LifecycleState, NeedFlags, FaultCode, FaultDescription
```

### 查询节点修复历史

> ⚠️ **Mooncake 不可用**: ResourceSnapshotHistoryV2 在 Mooncake 不存在。替代方案：使用 RdmResourceSnapshot 表。

```kql
cluster("azuredcmmc.kusto.chinacloudapi.cn").database("AzureDCMDb").ResourceSnapshotHistoryV2
| where ResourceId == "{nodeId}"
| project PowerCycleTime, UnexpectedRebootTime, RepairCode, RepairResolutionDetails, 
         RepairRequireHardwareDiscovery, PreciseTimeStamp
```

### 查询硬件故障信息

```kql
cluster("azuredcmmc.kusto.chinacloudapi.cn").database("AzureDCMDb").RdmResourceSnapshot
| where PreciseTimeStamp between(datetime({starttime}) .. datetime({endtime}))
| where ResourceId == "{nodeId}"
| project PreciseTimeStamp, ResourceId, OSType, LifecycleState, PfState, PfRepairState, 
         HealthGrade, HealthSummary, FaultCode, FaultDescription
| order by PreciseTimeStamp asc
| where LifecycleState != prev(LifecycleState)
    or PfState != prev(PfState)
    or PfRepairState != prev(PfRepairState)
    or FaultCode != prev(FaultCode)
```

### 解析故障代码

> ⚠️ **Mooncake 不可用**: FaultCodeTeamMapping 在 Mooncake 不存在。故障代码可在 TMMgmtNodeFaultEtwTable 的 Reason/Details 字段中获取描述。

```kql
cluster("azuredcmmc.kusto.chinacloudapi.cn").database("AzureDCMDb").FaultCodeTeamMapping
| where FaultCode == "{FaultCode}"
| project FaultCode, FaultReason
```

### 查询磁盘硬件库存

```kql
cluster("azuredcmmc.kusto.chinacloudapi.cn").database("AzureDCMDb").dcmInventoryComponentDiskDirect
| where NodeId == "{nodeId}"
| project NodeId, SCSIPort, SCSIBus, SCSIAddress, SCSILUN, DriveSerialNumber, DriveProductId, 
         FirmwareRevision, DriveBusType, SystemDrive, DeviceGuid, Region, DataCenter
```

### 查询 BMC-SEL 事件

```kql
union
(cluster("azuredcmmc.kusto.chinacloudapi.cn").database('AzureDCMDb').RhwChassisSelItemEtwTable | extend SelSource = "RhwChassisSelItemEtwTable"),
(cluster("azuredcmmc.kusto.chinacloudapi.cn").database("AzureDCMDb").RhLiteDiagBmcSel | extend SelSource = "RhLiteDiagBmcSel"),
(cluster("azuredcmmc.kusto.chinacloudapi.cn").database("AzureDCMDb").RhLiteDiagSel | extend SelSource = "RhLiteDiagSel" | extend BmcSelItemTimeStamp = SelTimeStamp)
| where BmcSelItemTimeStamp between(datetime({starttime}) .. 2d)
| where ResourceId == '{nodeId}'
| where BmcSelItemEventType !contains "CollectoreHeartbeat"
| project-away TIMESTAMP, PreciseTimeStamp, Tenant
```

### 查询 Hawkeye RCA

```kql
cluster("https://hawkeyedataexplorer.chinanorth2.kusto.chinacloudapi.cn").database("HawkeyeLogs").HawkeyeRCAEvents
| where PreciseTimeStamp between(datetime({starttime})..1d)
| where NodeId == "{nodeId}"
| project PreciseTimeStamp, Scenario, EscalateToOrg, EscalateToTeam, RCALevel1, RCALevel2
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| FaultCode | 故障代码 |
| FaultDescription | 故障描述 |
| LifecycleState | 生命周期状态 |
| RepairCode | 修复代码 (如 "Fixed") |
| RepairResolutionDetails | 修复详情 (如更换的硬件和固件版本) |
| PowerCycleTime | 电源循环时间 |
| UnexpectedRebootTime | 意外重启时间 |

## 常见 DCM 故障代码

| HmsCode | HmsComponent | 说明 |
|---------|--------------|------|
| 33023 | Disk | 磁盘故障 (最常见) |
| 32608 | FPGA | 网络 FPGA 故障 |
| 60094 | CPU | CPU 故障 |
| 32600 | Memory | 内存错误 |
| 30081 | Hardware | 通用硬件故障 |

## 变体查询

### 查询系统组件清单 (BIOS/BMC 版本)

```kql
cluster('azuredcmmc.kusto.chinacloudapi.cn').database('AzureDcmDb').dcmInventoryComponentSystemDirect
| where NodeId == "{nodeId}"
| where DataCollectedOn > datetime({starttime}) and DataCollectedOn < datetime({endtime})
| project NodeId, DataCollectedOn, BmcVersion, BIOSRelDate, BIOSVersion, BaseboardProduct, ProductName
```

### 查询固件部署遥测

```kql
cluster('sparkle.chinaeast2.kusto.chinacloudapi.cn').database('defaultdb').FWDeploymentTelemetryFull
| where ClientTimeStamp > datetime({starttime}) - 1d and ClientTimeStamp < datetime({endtime}) + 2d
| where NodeId contains "{nodeId}"
| project DeploymentId, SessionId, ClientTimeStamp, FirmwareType, Operation, OperationResult, OperationResultDescription
```

## 关联查询

- [node-events.md](./node-events.md) - 节点事件查询
- [vma-analysis.md](./vma-analysis.md) - VMA 可用性分析
- [service-healing.md](./service-healing.md) - Service Healing 查询

---

## 补充查询

### 查询节点故障事件 (AnvilASM)

检查节点级别的故障事件，包括故障代码、故障范围、修复状态等：

```kql
let NodeIds =
    cluster("azurecm.chinanorth2.kusto.chinacloudapi.cn").database("azurecm").LogContainerSnapshot
    | where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
    | where isempty("{subscription}") or subscriptionId has "{subscription}"
    | where isempty("{vmname}") or roleInstanceName has "{vmname}"
    | distinct nodeId;
cluster("azcore.chinanorth3.kusto.chinacloudapi.cn").database("AzureCP").AnvilASMNodeFaultEvents
| where NodeID in (NodeIds)
| project TIMESTAMP, NodeID, Details, FaultCode, FaultScope, FabricOperationStringV2, OldFaultInfo, NewFaultInfo, HolmesRepair
| take 50000
```

### 按 NodeId 直接查询节点故障

```kql
cluster("azcore.chinanorth3.kusto.chinacloudapi.cn").database("AzureCP").AnvilASMNodeFaultEvents
| where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
| where NodeID == "{nodeId}"
| project TIMESTAMP, NodeID, Details, FaultCode, FaultScope, FabricOperationStringV2, OldFaultInfo, NewFaultInfo, HolmesRepair
| order by TIMESTAMP desc
```

### 查询磁盘 Event 17 (OS VHD 磁盘错误)

Event 17 是 Windows 磁盘错误事件，通常表示磁盘 I/O 问题：

```kql
let NodeIds =
    cluster("azurecm.chinanorth2.kusto.chinacloudapi.cn").database("azurecm").LogContainerSnapshot
    | where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
    | where isempty("{subscription}") or subscriptionId has "{subscription}"
    | where isempty("{vmname}") or roleInstanceName has "{vmname}"
    | distinct nodeId;
cluster("azcore.chinanorth3.kusto.chinacloudapi.cn").database("Fa").CentralBondOSVhdDiskE17
| where NodeId in (NodeIds)
| project TIMESTAMP, NodeId, ProviderName, EventId, ParamStr1, ParamBinary1
| take 50000
```

### 按 NodeId 直接查询 Disk Event 17

```kql
cluster("azcore.chinanorth3.kusto.chinacloudapi.cn").database("Fa").CentralBondOSVhdDiskE17
| where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
| where NodeId == "{nodeId}"
| project TIMESTAMP, NodeId, ProviderName, EventId, ParamStr1, ParamBinary1
| order by TIMESTAMP desc
```

### AnvilASM 字段说明

| 字段 | 说明 |
|------|------|
| FaultCode | 故障代码 |
| FaultScope | 故障范围 (Node/Container/Tenant) |
| FabricOperationStringV2 | Fabric 操作字符串 |
| OldFaultInfo | 旧故障信息 |
| NewFaultInfo | 新故障信息 |
| HolmesRepair | Holmes 自动修复状态 |

### Disk Event 17 说明

| 字段 | 说明 |
|------|------|
| ProviderName | 事件提供程序 |
| EventId | 事件 ID (17 = 磁盘错误) |
| ParamStr1 | 参数字符串 (通常包含设备路径) |
| ParamBinary1 | 二进制参数 |
