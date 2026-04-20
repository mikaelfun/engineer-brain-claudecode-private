---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Log Sources For Azure ExpressRoute"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Log%20Sources%20For%20Azure%20ExpressRoute"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

# Log Sources

::: template /.templates/LogSourcesPreface.md
:::

## Syslog

```k
cluster('azphynet.kusto.windows.net').database('azdhmds').SyslogData
| where Device contains "-06gmr-cis-3" or Device contains "-06gmr-cis-4" //<------MSEEs
| where (PreciseTimeStamp > datetime(2026-02-24 05:00) and PreciseTimeStamp < datetime(2026-02-24 08:00)) //<------TimeStamp
| where Message contains "" or Message contains "" //<------VRFs or Peer IP
| project PreciseTimeStamp , Device , Message , Severity , EventName//<------Columns to include
```
## MSEE Maintenace

```k
cluster('azwan').database('OneWan').ExpressRouteCommsLog
| where MaintenanceStartTime >= ago(30d)
| where deviceName =~ "[MSEE device name]"
```
## Provider Issues

Equinix impacting and non-impacting events:

[ExpressRoute Provider Issues - Overview](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1340592/ExpressRoute-Provider-Issues)

## Gateway Manager Logs

### Kusto

```k
cluster('hybridnetworking.kusto.windows.net').database('aznwmds').GatewayManagerLogsTable
| where CustomerSubscriptionId == ""
| where Message contains ""
```

### Jarvis

https://jarvis-west.dc.ad.msft.net/240CAE35

## QOS Drops/Rate Limiting


```k
cluster('hybridnetworking.kusto.windows.net').database('aznwmds').ERMetricsLogsTable
| where TIMESTAMP >= ago(7d)
| where MetricName == "QosDropBitsInPerSecond" or MetricName == "QosDropBitsOutPerSecond"
| parse Message with "ResourceId="ResourceID",ServiceKey="ServiceKey",MetricValue="QosDropBits
| parse FunctionName with "ExpressRouteDevicePollerChildWorkItemForMetrics@("MSEEdevices ")"
| where QosDropBits != "0"
| where ServiceKey == "{AzureServiceKey}" //Replace AzureServiceKey from customer's circuit
| project TIMESTAMP, MSEEdevices, MetricName, ServiceKey, QosDropBits, ResourceID
```

## Device OS History

How to confirm the MSEE was updated:

Enter both primary and secondary MSEE device names in the following kusto query:

```k
cluster('azphynet.kusto.windows.net').database('azphynetmds').DeviceOSHistory
| where DeviceName == "" or DeviceName == ""
| project DeviceName, NgsDeviceType, HardwareSku, OSVersion,SysUpTime,SysUpTimeLastUpdateTime,updataTime
```

![Kusto output for MSEE device OS history indicating how to determine when OS version changed](/.attachments/ExpressRoute/MSEE-OS-Version.png)  


## MSEE BGP Route History

### Kusto

Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2fhybridnetworking.kusto.windows.net/databases/aznwmds?query=H4sIAAAAAAAEAKWRzU7DMBCE75X6Dque4EAscYwoUtVGUREJKFBxdp1tY5F4Le%2bmrRAPj5OKH3HgwtFrz4y%2f2RUerMHsgE7uac%2fPetvidPIOxwYDQhn8JliYz2F2UzxlGZTVI2yq9e0MlMpOuvMtwkUj4jlVCjVLz9eJQzlSeE30Wx8wMdQp7rdsgvViyfFwsrUKyNQHg3mg3rOqcuUDHWyNgVVhTSCmnSTl2UvhyUcBV9QLLm0wvRVW5aLILqcTpTYupnSRAaRB2FHb0tG6PbTWIWw1Yw3kIELWFNJB8AlYRE%2b9RzDkRFvHMMtJICb5%2bFGEFAotpony0SmFsYWRHpaWDcEVLOoazt3oDn96r8Zqh%2bl3gVGqXQ0PHoMeyvi6zVFGtnEBL5F4LdiNOXe9s%2fH5X0n%2foFgEy6J%2fm38Ao%2fD50hYCAAA%3d)] [[Desktop](https://hybridnetworking.kusto.windows.net/aznwmds?query=H4sIAAAAAAAEAKWRzU7DMBCE75X6Dque4EAscYwoUtVGUREJKFBxdp1tY5F4Le%2bmrRAPj5OKH3HgwtFrz4y%2f2RUerMHsgE7uac%2fPetvidPIOxwYDQhn8JliYz2F2UzxlGZTVI2yq9e0MlMpOuvMtwkUj4jlVCjVLz9eJQzlSeE30Wx8wMdQp7rdsgvViyfFwsrUKyNQHg3mg3rOqcuUDHWyNgVVhTSCmnSTl2UvhyUcBV9QLLm0wvRVW5aLILqcTpTYupnSRAaRB2FHb0tG6PbTWIWw1Yw3kIELWFNJB8AlYRE%2b9RzDkRFvHMMtJICb5%2bFGEFAotpony0SmFsYWRHpaWDcEVLOoazt3oDn96r8Zqh%2bl3gVGqXQ0PHoMeyvi6zVFGtnEBL5F4LdiNOXe9s%2fH5X0n%2foFgEy6J%2fm38Ao%2fD50hYCAAA%3d&web=0)] [[Web (Lens)](https://lens.msftcloudes.com/v2/#/discover/query//results?datasource=(cluster:hybridnetworking.kusto.windows.net,database:aznwmds,type:Kusto)&query=H4sIAAAAAAAEAKWRzU7DMBCE75X6Dque4EAscYwoUtVGUREJKFBxdp1tY5F4Le%2bmrRAPj5OKH3HgwtFrz4y%2f2RUerMHsgE7uac%2fPetvidPIOxwYDQhn8JliYz2F2UzxlGZTVI2yq9e0MlMpOuvMtwkUj4jlVCjVLz9eJQzlSeE30Wx8wMdQp7rdsgvViyfFwsrUKyNQHg3mg3rOqcuUDHWyNgVVhTSCmnSTl2UvhyUcBV9QLLm0wvRVW5aLILqcTpTYupnSRAaRB2FHb0tG6PbTWIWw1Yw3kIELWFNJB8AlYRE%2b9RzDkRFvHMMtJICb5%2bFGEFAotpony0SmFsYWRHpaWDcEVLOoazt3oDn96r8Zqh%2bl3gVGqXQ0PHoMeyvi6zVFGtnEBL5F4LdiNOXe9s%2fH5X0n%2foFgEy6J%2fm38Ao%2fD50hYCAAA%3d&runquery=1)] [[Desktop (SAW)](https://hybridnetworking.kusto.windows.net/aznwmds?query=H4sIAAAAAAAEAKWRzU7DMBCE75X6Dque4EAscYwoUtVGUREJKFBxdp1tY5F4Le%2bmrRAPj5OKH3HgwtFrz4y%2f2RUerMHsgE7uac%2fPetvidPIOxwYDQhn8JliYz2F2UzxlGZTVI2yq9e0MlMpOuvMtwkUj4jlVCjVLz9eJQzlSeE30Wx8wMdQp7rdsgvViyfFwsrUKyNQHg3mg3rOqcuUDHWyNgVVhTSCmnSTl2UvhyUcBV9QLLm0wvRVW5aLILqcTpTYupnSRAaRB2FHb0tG6PbTWIWw1Yw3kIELWFNJB8AlYRE%2b9RzDkRFvHMMtJICb5%2bFGEFAotpony0SmFsYWRHpaWDcEVLOoazt3oDn96r8Zqh%2bl3gVGqXQ0PHoMeyvi6zVFGtnEBL5F4LdiNOXe9s%2fH5X0n%2foFgEy6J%2fm38Ao%2fD50hYCAAA%3d&saw=1)] [https://hybridnetworking.kusto.windows.net/aznwmds](https://hybridnetworking.kusto.windows.net/aznwmds)
```k
cluster('hybridnetworking.kusto.windows.net').database('aznwmds').DeviceEventLogsTable
| where NrpUri == "<MSEE NRP URI>" //Example (https://eastus2.network.azure.com/subscriptions/subid/resourceGroups/RG/providers/Microsoft.Network/expressRouteCircuits/NAME)
//Uncomment the following line based on vendor:
//| where Message contains "Got response : Matched line : <MSEE>" // Cisco - Add MSEE Name
//| where DeviceName == "<MSEE>" and OperationName == "GetRouteTableWorkItem" // Juniper - Add MSEE Name
//| where Message contains "Got response : Matched line : <MSEE>" // Arista - Add MSEE Name
```
### Jarvis Logs

Cisco: https://portal.microsoftgeneva.com/82AA4F59

Juniper: https://portal.microsoftgeneva.com/s/5509EBD9

Arista: https://portal.microsoftgeneva.com/82AA4F59

## Global Reach Connections

```k
cluster("Hybridnetworking").database("aznwmds").CircuitConnection
| where CircuitSvcKey == "00000000-0000-0000-0000-000000000000"
| project TIMESTAMP, RoleInstance, ProviderGuid, EventName, CircuitSvcKey, SubscriptionId, ResourceGuid, CircuitBgpNrpUri, PeerResourceId, PeerResourcesNrpUri,GwmProvisioningState, ConnectionStatus
```

## Bluebird (MSEEv2) & MSEE Manager Logs

https://portal.microsoftgeneva.com/8685B4AF

## Gateway health and scale metrics (count of prefixes learned, among many other metrics)

https://portal.microsoftgeneva.com/s/9AF27A15

## ExpressRoute Direct

###Port Group Table

```k
cluster("Hybridnetworking").database("aznwmds").PortGroupTable
//| where (PreciseTimeStamp > datetime(2022-11-07 14:25) and PreciseTimeStamp < datetime(2022-11-08 14:35))
| where TIMESTAMP >=ago(1d)
| where SubscriptionId == "" // Replace with customer subscription associated with ExR Direct
| project PreciseTimeStamp, RoleInstance, ProviderGuid, ActivityId, EventName, SubscriptionId, ArmGuid, NrpResourceUri, PortGroupName, PortPairName, PortGroupPorts, Region
 
```

### Gateway Manager Inventory Table


```k
cluster("Hybridnetworking").database("aznwmds").GatewayManagerInventoryTable 
//| where (PreciseTimeStamp > datetime(2022-11-07 14:25) and PreciseTimeStamp < datetime(2022-11-08 14:35))
| where TIMESTAMP >=ago(1d)
| where DeviceName contains "exr01.chg" or DeviceName contains "exr02.chg"
| project PreciseTimeStamp, DeviceName, PortId, Bandwidth, Direction, RackId, PatchPanelId, AzurePortName, SourceMoniker, RowKey2, ServiceProviderName,PortpairId
 ```
# Contributor
@<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78> 