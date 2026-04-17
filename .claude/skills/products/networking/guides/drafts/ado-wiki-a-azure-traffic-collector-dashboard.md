---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Advanced Troubleshooting/Azure Traffic Collector Dashboard"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FAzure%20Traffic%20Collector%20Dashboard"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Overview

The Azure Traffic Collector (ATC) Dashboard can be used to view and determine if there are certain issues with the ATC instances. The current ExR Traffic Collector dashboard can be found [here](https://portal.microsoftgeneva.com/s/D07D0E1).

**Note:** Other ASC dashboards with more in-depth detail are being designed for this product.

## Dashboard Information

The dashboard contains the following information for the ATC instances:

**Memory used** — Shows the current memory usage on the instances.

**CPU Active Usage** — Shows the current active CPU usage on the instances.

**TCP Flows Count** — Shows the current number of TCP flows on the instances.

## PowerShell Update Example

Example PS cmdlets to update a Circuit with Traffic Collector.

### Get ATC
```powershell
$cp = Get-AzNetworkFunctionCollectorPolicy -collectorpolicyname cp-1 -azuretrafficcollectorname test -resourcegroupname atcTest -SubscriptionId <SubscriptionId>
```

### Remove existing circuits
```powershell
Update-AzNetworkFunctionCollectorPolicy -collectorpolicyname cp1 -azuretrafficcollectorname test -resourcegroupname atcTest -location <location> -SubscriptionId <SubscriptionId> -IngestionPolicyIngestionSource @{} -IngestionPolicyIngestionType 'IPFIX'
```

### Add Circuit to ATC
```powershell
Update-AzNetworkFunctionCollectorPolicy -collectorpolicyname cp-1 -azuretrafficcollectorname test -resourcegroupname atcTest -location <location> -SubscriptionId <SubscriptionId> -IngestionPolicyIngestionSource @{ResourceId ="/subscriptions/<SubscriptionId>/resourceGroups/Test/providers/Microsoft.Network/expressRouteCircuits/TestCircuit"}, @{ResourceId ="/subscriptions/<SubscriptionId>/resourceGroups/Test/providers/Microsoft.Network/expressRouteCircuits/TestCircuit2"} -IngestionPolicyIngestionType 'IPFIX'
```
