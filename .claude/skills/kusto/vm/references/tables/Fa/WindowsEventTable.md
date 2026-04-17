---
name: WindowsEventTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: Windows 事件日志，记录主机节点上的系统事件
status: active
---

# WindowsEventTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa (也可使用 rdos) |
| 状态 | ✅ 可用 |

## 用途

存储主机节点上的 Windows 系统事件日志，用于排查主机级别问题、Hyper-V 容器事件、内存不足等问题。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| TimeCreated | datetime | 事件创建时间 |
| NodeId | string | 主机节点 ID |
| Cluster | string | 集群名称 |
| EventId | int | Windows 事件 ID |
| ProviderName | string | 事件提供者名称 |
| Level | int | 事件级别 (1=Critical, 2=Error, 3=Warning, 4=Info) |
| Channel | string | 事件通道 |
| Description | string | 事件描述 |

## 常见事件 ID

| EventId 范围 | ProviderName | 说明 |
|-------------|--------------|------|
| 18500-18560 | Microsoft-Windows-Hyper-V-Worker | Hyper-V 容器事件 |
| 2004, 3050, 3122, 12030 | - | 内存不足相关 |
| 505, 504 | Storport | 存储性能事件 |
| 11, 15, 129, 7, 51 | StorPort/stornvme/Disk | 磁盘错误 |
| 3095 | NETLOGON | 网络工作组配置 |

## 常用筛选字段

- `NodeId` - 按节点筛选 (必需)
- `EventId` - 按事件 ID 筛选
- `ProviderName` - 按提供者筛选
- `Description` - 按描述内容筛选
- `Level` - 按级别筛选

## 典型应用场景

1. **主机节点问题排查** - 查看节点系统事件
2. **Hyper-V 容器事件** - 排查容器启动/停止问题
3. **内存不足诊断** - 检查 OOM 相关事件
4. **磁盘错误诊断** - 检查磁盘相关事件

## 示例查询

### 基础查询（过滤噪音事件）

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').WindowsEventTable 
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime})) 
| where NodeId == '{nodeId}' 
| where not (ProviderName == "NETLOGON" and EventId == 3095) 
| where not (ProviderName == 'IPMIDRV' and EventId == 1004) 
| where not (ProviderName == "VhdDiskPrt" and EventId == 47) 
| where ProviderName <> "CMClientLib" 
| where EventId <> 7000 
| where EventId <> 1023 
| where EventId !in (505, 504, 146, 145, 142) 
| project todatetime(TimeCreated), Cluster, Level, ProviderName, EventId, Channel, Description, NodeId 
| order by TimeCreated asc
```

### 查询 Hyper-V 容器事件

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').WindowsEventTable 
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime})) 
| where NodeId == '{nodeId}' 
| where EventId in (18500, 18502, 18504, 18508, 18510, 18512, 18514, 18516, 18596, 18590, 19060, 18190, 18560) 
| project TimeCreated, Cluster, EventId, ProviderName, Description 
| order by TimeCreated asc
```

### 查询内存低事件

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').WindowsEventTable 
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime})) 
| where NodeId == '{nodeId}' 
| where EventId in (2004, 3050, 3122, 12030) 
| project TimeCreated, Cluster, EventId, ProviderName, Description 
| order by TimeCreated asc
```

### 查询特定容器相关事件

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').WindowsEventTable
| where TIMESTAMP > ago(3d)
| where NodeId == "{nodeId}"
| where Description contains "{containerId}"
| project PreciseTimeStamp, EventId, ProviderName, Channel, Description, Cluster, NodeId
| order by PreciseTimeStamp desc
```

### 查询 Hyper-V 相关错误和警告

```kql
cluster('rdosmc.kusto.chinacloudapi.cn').database('rdos').WindowsEventTable
| where PreciseTimeStamp >= datetime({starttime}) and TIMESTAMP <= datetime({endtime})
| where NodeId == "{nodeId}"
| where Description contains "{containerId}"
| extend EventId = tolong(EventId) 
| where (ProviderName == "Microsoft-Windows-Hyper-V-Worker" and EventId in (18500, 18502, 18504, 
        18508, 18512, 18514, 18550, 18560, 18570, 18572, 18590, 18190, 33100, 33103, 33104, 
        33107, 33108)) or
    (ProviderName == "Microsoft-Windows-Hyper-V-SynthNic" and EventId in (12590, 12586, 12614, 
        12584, 12588)) or 
    (ProviderName == "Microsoft-Windows-Hyper-V-VID") or
    (ProviderName == "Microsoft-Windows-Hyper-V-VMMS" and Level < 4)
| project StartTime = todatetime(TimeCreated), ProviderName, EventId, Channel, Description, NodeId
| order by StartTime asc
```

## 关联表

- [LogNodeSnapshot.md](./LogNodeSnapshot.md) - 节点快照
- [HyperVWorkerTable.md](./HyperVWorkerTable.md) - Hyper-V Worker 详细事件
- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 获取 NodeId

## 注意事项

- 查询时必须指定 `NodeId`
- 建议过滤常见的噪音事件 (如 3095, 7000, 1023 等)
- 也可使用 RDOS MC 集群 (rdosmc.kusto.chinacloudapi.cn) 的 rdos 数据库
- Level 1=Critical, 2=Error, 3=Warning, 4=Info
