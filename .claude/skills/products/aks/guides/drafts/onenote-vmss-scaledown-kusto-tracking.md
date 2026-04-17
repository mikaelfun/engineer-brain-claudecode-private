---
source: onenote
sourceRef: "MCVKB/Net/=======8.AKS=======/8.5[AKS] How to check the AKS node pool VMSS scale.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# AKS Cluster Autoscaler VMSS Scale-Down 追踪指南

当 AKS 节点因 cluster-autoscaler 被 scale down 后，如何通过 Kusto 追踪该节点的历史信息（IP、VM ID、containerId 等）。

## 步骤 1：通过 Kusto 查看 cluster-autoscaler 日志

Kusto 集群：`akscn.kusto.chinacloudapi.cn` / 数据库：`AKSccplogs`

```kusto
union cluster('Akscn').database('AKSccplogs').ControlPlaneEvents,
      cluster('Akscn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp >= datetime(2021-03-13 0:00) and PreciseTimeStamp <= datetime(2021-03-13 1:00)
| where resourceId has '<subscription-id>/resourceGroups/<rg>/providers/Microsoft.ContainerService/managedClusters/<cluster-name>'
| where category == 'cluster-autoscaler'
| extend Log = extractjson('$.log', properties, typeof(string))
| where Log contains "scale_down.go"
| project PreciseTimeStamp, Log
```

日志中会显示被跳过或删除的节点，如：
```
Skipping aks-nodepool-72075615-vmss00005r from delete consideration...
```

## 步骤 2：将 VMSS 节点名转换为实例 ID

VMSS 节点名后缀使用 Base-36 编码，需转换为十进制才能对应 VMSS 实例 ID。

例：`vmss00005r` → `5r`（Base-36）→ 207（十进制）→ VMSS 实例 `_207`

转换工具：https://www.unitconverters.net/numbers/base-36-to-decimal.htm

## 步骤 3：查询 VMSS 实例历史信息

Kusto 集群：`azurecm.chinanorth2.kusto.chinacloudapi.cn` / 数据库：`azurecm`

```kusto
LogContainerSnapshot
| where TIMESTAMP >= ago(3d)
| where subscriptionId == "<subscription-id>"
| where roleInstanceName contains "aks-nodepool-72075615-vmss"
| project TIMESTAMP, Tenant, nodeId, roleInstanceName, subscriptionId, containerId, tenantName, virtualMachineUniqueId
| summarize arg_max(TIMESTAMP, *) by containerId
```

## 步骤 4：查询历史 IP 和 MAC 地址

```kusto
AllocatorServiceContainerAttributes
| where containerId contains "<containerId>"
| project containerId, name, value, PreciseTimeStamp
```
