---
name: server-tor
description: 服务器节点 TOR 交换机信息查询
tables:
  - Servers
  - DeviceInterfaceLinks
  - DeviceStatic
  - DeviceIpInterface
  - LogContainerSnapshot
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: starttime
    required: true
    description: 开始时间
  - name: endtime
    required: true
    description: 结束时间
---

# 服务器 TOR 查询

## 用途

查询服务器节点连接的 TOR (Top of Rack) 交换机信息，用于网络拓扑分析和故障定位。

---

## 查询 1: 查询订阅下 VM 的 TOR 交换机信息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {subscription} | 是 | 订阅 ID |
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |

### 查询语句

```kql
let NodeIds = 
    cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
    | where TIMESTAMP >= datetime({starttime}) and TIMESTAMP <= datetime({endtime})
    | where subscriptionId == "{subscription}"
    | distinct nodeId;
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').Servers
| where NodeId in (NodeIds)
| join (
    cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceInterfaceLinks 
    | project StartDevice, StartPort, EndDevice, EndPort
) on $left.DeviceName == $right.StartDevice
| join (
    cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceStatic 
    | project Cluster, Regions, DeviceName
) on $left.DeviceName == $right.DeviceName
| join (
    cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceIpInterface
    | where isnotempty(AddressesV4) 
    | where InterfaceName =~ 'HostIP'
) on DeviceName
| extend nodeId = tolower(NodeId)
| project Regions, Cluster, nodeId, ServerName = StartDevice, ServerPort = StartPort, 
         TOR = EndDevice, TORPort = EndPort, AddressesV4
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| Regions | 区域 |
| Cluster | 集群 |
| nodeId | 节点 ID |
| ServerName | 服务器名称 |
| ServerPort | 服务器端口 |
| TOR | TOR 交换机名称 |
| TORPort | TOR 端口 |
| AddressesV4 | IP 地址 |

---

## 查询 2: 按节点 ID 查询 TOR 信息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {nodeId} | 是 | 物理节点 ID |

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').Servers
| where NodeId =~ "{nodeId}"
| join (
    cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceInterfaceLinks 
    | project StartDevice, StartPort, EndDevice, EndPort, BandwidthInGbps
) on $left.DeviceName == $right.StartDevice
| join (
    cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceStatic 
    | project Cluster, Regions, DeviceName, AzureDeviceType
) on $left.DeviceName == $right.DeviceName
| project NodeId, ServerName = DeviceName, Cluster, Regions, 
         TOR = EndDevice, TORPort = EndPort, BandwidthInGbps
```

---

## 查询 3: 查询 TOR 设备详情

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {torDevice} | 是 | TOR 设备名称 |

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceStatic 
| where DeviceName == "{torDevice}"
| project DeviceName, Cluster, Regions, Datacenter, AzureDeviceType, 
         HardwareSku, OSVersion, Status, ManagementIP
```

---

## 查询 4: 查询受影响 TOR 下的所有服务器

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {torDevice} | 是 | TOR 设备名称 |

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceInterfaceLinks 
| where EndDevice == "{torDevice}"
| project ServerDevice = StartDevice, ServerPort = StartPort, TOR = EndDevice, TORPort = EndPort
| join (
    cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').Servers
    | project DeviceName, NodeId
) on $left.ServerDevice == $right.DeviceName
| project NodeId, ServerDevice, ServerPort, TOR, TORPort
```

---

## 关联查询

- [nmagent.md](./nmagent.md) - NMAgent 错误查询
