---
name: vm-network
description: VM 网络配置查询 - 获取 VNet/Subnet/CA/PA/MAC/TOR 等网络信息
tables:
  - DCMNMQOSInfoEtwTable
  - InterfaceAliasProgrammedFiveMinuteTable
  - DCMLNMPubSubTaskEventEtwTable
  - Servers
  - DeviceInterfaceLinks
  - DeviceStatic
  - DeviceIpInterface
parameters:
  - name: subscription
    required: false
    description: 订阅 ID
  - name: vmname
    required: false
    description: VM 名称
  - name: containerId
    required: false
    description: 容器 ID
  - name: starttime
    required: true
    description: 开始时间
  - name: endtime
    required: true
    description: 结束时间
---

# VM 网络配置查询

## 用途

获取 VM 的网络配置信息，包括 VNet、Subnet、CA (Customer Address)、PA (Provider Address)、MAC 地址、TOR 交换机信息等。用于网络连接问题诊断。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 否 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {vmname} | 否 | VM 名称 | myvm |
| {containerId} | 否 | 容器 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {starttime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 获取 VM 网络配置 (CA/PA/MAC/VNet)

通过 VM 名称查询网络分配信息：

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let VMName = "{vmname}";
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').DCMNMQOSInfoEtwTable
| where TIMESTAMP < endtime
| where isnotempty(VMName)
| where operation =~ 'AllocateNetworkResource' or operation =~ 'BatchUpdateNetworkResource-Allocation'
| where additionalMessage has 'CustomerIPAddress'
| where additionalMessage contains VMName
| project TIMESTAMP=PreciseTimeStamp, AllocationString = split(additionalMessage, '\r\n\r\n')
| parse-where kind=regex flags=im AllocationString with @'VNetId:\s*' VNetId:string
| extend VnetGuid=tostring(split(VNetId,',')[0])
| mv-expand AllocationString
| parse-where kind=regex flags=im AllocationString with @'ContainerId:\s*' ContainerId:string
| parse-where kind=regex flags=im AllocationString with @'MacAddress:\s*00000000-0000-0000-0000-' MAC:string
| extend MACAddress=tostring(toupper(trim(@'\s', MAC)))
| parse-where kind=regex flags=im AllocationString with @'IPAddress:\s*' PA:string
| parse-where kind=regex flags=im AllocationString with @'CustomerIPAddress:\s*' CA:string
| parse-where kind=regex flags=im AllocationString with @'HostLocalIPAddress:\s*' HLIP:string
| extend RoleInstanceName = trim(@'\s', extract(@"GroupName=([^:,\r\n]+)", 1, tostring(AllocationString)))
| extend Subnets = trim(@"\s", extract(@"Subnets=([^,\r\n]+)", 1, tostring(AllocationString)))
| project TIMESTAMP, RoleInstanceName, VNetId=VnetGuid, Subnets, 
         ContainerId = trim(@'\s', ContainerId), 
         PrimaryCA = trim(@'\s', CA), 
         PAv4 = trim(@'\s', PA), 
         MACAddress, 
         HLIP = trim(@'\s', HLIP)
| summarize TIMESTAMP=max(TIMESTAMP) by RoleInstanceName, VNetId, Subnets, ContainerId, PrimaryCA, PAv4, MACAddress, HLIP
| order by TIMESTAMP desc
```

### 通过 ContainerId 查询网络配置

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let ContId = "{containerId}";
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').DCMNMQOSInfoEtwTable
| where PreciseTimeStamp <= endtime
| where isnotempty(ContId)
| where operation =~ 'AllocateNetworkResource' or operation =~ 'BatchUpdateNetworkResource-Allocation'
| where additionalMessage has 'CustomerIPAddress'
| where additionalMessage has ContId
| project TIMESTAMP=PreciseTimeStamp, AllocationString = split(additionalMessage, '\r\n\r\n')
| parse-where kind=regex flags=im AllocationString with @'VNetId:\s*' VNetId:string
| extend VnetGuid=tostring(split(VNetId,',')[0])
| mv-expand AllocationString
| parse-where kind=regex flags=im AllocationString with @'ContainerId:\s*' ContainerId:string
| parse-where kind=regex flags=im AllocationString with @'MacAddress:\s*00000000-0000-0000-0000-' MAC:string
| extend MACAddress=tostring(toupper(trim(@'\s', MAC)))
| parse-where kind=regex flags=im AllocationString with @'IPAddress:\s*' PA:string
| parse-where kind=regex flags=im AllocationString with @'CustomerIPAddress:\s*' CA:string
| parse-where kind=regex flags=im AllocationString with @'HostLocalIPAddress:\s*' HLIP:string
| project TIMESTAMP, VnetGuid, ContainerId = trim(@'\s', ContainerId), PrimaryCA = trim(@'\s', CA), PAv4 = trim(@'\s', PA), MACAddress, HLIP = trim(@'\s', HLIP)
| where ContainerId in (ContId)
| summarize ET=max(TIMESTAMP) by VnetGuid, ContainerId, PrimaryCA, PAv4, MACAddress
| project ET, VnetGuid, ContainerId, PrimaryCA, PAv4, MACAddress
```

### 获取 TOR 交换机和节点信息

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscriptionid = "{subscription}";
let VMName = "{vmname}";
let ContId = "{containerId}";
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where PreciseTimeStamp >= starttime and PreciseTimeStamp <= endtime
| where ((isnotempty(subscriptionId) and subscriptionId =~ subscriptionid and isnotempty(VMName) and roleInstanceName contains VMName)) 
    or (isnotempty(ContId) and containerId == ContId)
| summarize arg_max(TIMESTAMP,*) by roleInstanceName, nodeId
| join (cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').Servers | extend nodeId = tolower(NodeId)) on $left.nodeId == $right.nodeId
| join (cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceInterfaceLinks | project StartDevice, StartPort, EndDevice, EndPort) on $left.DeviceName == $right.StartDevice
| join (cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceStatic | project Cluster, Regions, DeviceName, HardwareSku, OSVersion, Vender, FirmwareProfile) on $left.DeviceName == $right.DeviceName
| join (cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceIpInterface | where isnotempty(AddressesV4) | where InterfaceName =~ 'HostIP') on DeviceName
| join (cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').DeviceIpInterface | where isnotempty(AddressesV6) | where InterfaceName =~ 'HostIP1') on DeviceName
| order by TIMESTAMP
| project TIMESTAMP, Regions, Cluster, nodeId, containerId, roleInstanceName, 
         ServerName=StartDevice, ServerPort=StartPort, TOR=EndDevice, TORPort=EndPort, 
         HardwareSku, OSVersion, Vender, FirmwareProfile, AddressesV4
| sort by Regions, roleInstanceName
```

### 查询 PAv6 地址 (IPv6)

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let ContId = "{containerId}";
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').DCMLNMPubSubTaskEventEtwTable
| where isnotempty(ContId)
| where CAMappingData contains ContId
| where CAMappingData contains "PAv6"
| summarize arg_max(PreciseTimeStamp, *) by CustomerAddress
| project PreciseTimeStamp, CustomerAddress, Region, CAMappingData
```

### 查询多 NIC/NVA 场景 (InterfaceAlias)

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let ContId = "{containerId}";
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').InterfaceAliasProgrammedFiveMinuteTable
| where TIMESTAMP < endtime
| where ContainerId =~ ContId
| summarize ET=max(TIMESTAMP) by ContainerId, VnetGuid
| order by ET desc 
| take 1
| join kind=leftouter (
    cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').InterfaceAliasProgrammedFiveMinuteTable
    | where ContainerId =~ ContId
) on $left.VnetGuid == $right.VnetGuid
| parse-where kind=regex flags=im Detail with @'VA_HOST_IP_V6=\s*' VA_HOST_IP_V6:string
| extend VA_HOST_IP_V6=tostring(split(split(VA_HOST_IP_V6,',')[0],';')[0])
| parse-where kind=regex flags=im Detail with @'VA_PRIMARY_PA_V6=\s*' VA_PRIMARY_PA_V6:string
| extend VA_PRIMARY_PA_V6=tostring(split(split(VA_PRIMARY_PA_V6,',')[0],';')[0])
| parse-where kind=regex flags=im Detail with @'VA_HLIP_\s*' VA_CA:string
| extend VA_PRIMARY_CA_V4=tostring(split(VA_CA,'=')[0])
| parse-where kind=regex flags=im Detail with @'VA_PRIMARY_PA_V4=\s*' VA_PRIMARY_PA_V4:string
| extend VA_PRIMARY_PA_V4=tostring(split(split(VA_PRIMARY_PA_V4,',')[0],';')[0])
| parse-where kind=regex flags=im Detail with @'VA_HOST_IP_V4=\s*' VA_HOST_IP_V4:string
| extend VA_HOST_IP_V4=tostring(split(split(VA_HOST_IP_V4,',')[0],';')[0])
| summarize ST=min(TIMESTAMP), ET=max(TIMESTAMP) by VnetGuid, ContainerId, MACAddress, VA_HOST_IP_V6, VA_PRIMARY_PA_V6, VA_PRIMARY_CA_V4, VA_PRIMARY_PA_V4, VA_HOST_IP_V4
| project ST, ET, VnetGuid, ContainerId, MACAddress, PrimaryCA=VA_PRIMARY_CA_V4, PAv4=VA_PRIMARY_PA_V4, PA_V6=VA_PRIMARY_PA_V6, Host_IP=VA_HOST_IP_V4, VA_HOST_IP_V6
```

### 查询 NIC 和 VNet 信息 (ARM Resource Graph)

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscriptionid = "{subscription}";
let Name = "{vmname}";
cluster('argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn').database('AzureResourceGraph').Resources
| where timestamp <= endtime
| where isnotempty(subscriptionid) and isnotempty(Name)
| where subscriptionId =~ subscriptionid
| where properties contains Name
| where type contains "microsoft.network/networkinterfaces"
| order by timestamp
| project timestamp, subscriptionId, type, id, NicName=name, location, 
         subnetname = tostring(properties.ipConfigurations[0].properties.subnet.id), 
         privateIPAddress = tostring(properties.ipConfigurations[0].properties.privateIPAddress), 
         publicIpId = tostring(properties.ipConfigurations[0].properties.publicIPAddress.id),
         MAC_Address = tostring(properties.macAddress),
         enableAcceleratedNetworking = tostring(properties.enableAcceleratedNetworking),
         enableIPForwarding = tostring(properties.enableIPForwarding)
| summarize arg_max(timestamp, *) by NicName
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| VNetId / VnetGuid | 虚拟网络 ID |
| Subnets | 子网信息 |
| PrimaryCA | Customer Address (客户 IP) |
| PAv4 / PA_V6 | Provider Address (提供商 IP，IPv4/IPv6) |
| MACAddress | MAC 地址 |
| HLIP | Host Local IP |
| TOR | Top of Rack 交换机名称 |
| TORPort | 交换机端口 |
| ServerName | 服务器名称 |
| ServerPort | 服务器端口 |

## 集群信息

| 集群 | URI | 数据库 | 用途 |
|------|-----|--------|------|
| Azure CM | https://azurecm.chinanorth2.kusto.chinacloudapi.cn | azurecm | Fabric 层日志 |
| Azure NW China MC | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn | aznwmds | 网络 MDS 数据 |
| ARG MC | https://argmcn2nrpone.chinanorth2 | AzureResourceGraph | ARM 资源图 |

## 关联查询

- [container-snapshot.md](./container-snapshot.md) - 获取 containerId
- [vm-operations.md](./vm-operations.md) - VM 操作查询
