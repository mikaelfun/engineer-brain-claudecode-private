---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/Check ACI Quota for Subscription"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FCheck%20ACI%20Quota%20for%20Subscription"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Checking ACI Quotas on a Subscription

[[_TOC_]]

## Overview

This guide demonstrates how to check ACI quota utilization and limits for a customer subscription as well as options for increasing
the available quota.

## Checking quota utilization

### Kusto

This Kusto query ran against the database ACCPRod will show you the quota for ACI per Region, just fill in the SubscriptionId

```sql
cluster("Accprod").database("accprod").SubscriptionPolicy
| where subscriptionId == "{Sub_ID}"
| extend containerquota = parse_json(quotas)[0]
| extend coresquota = parse_json(quotas)[1]
| extend requestquota = parse_json(requestLimits)[0]
| evaluate bag_unpack(containerquota, 'containerQuota_')
| evaluate bag_unpack(coresquota, 'coresQuota_')
| evaluate bag_unpack(requestquota, 'requestQuota_')
| summarize arg_max(TIMESTAMP,*) by location, subscriptionId
| project subscriptionId, location, containerQuota_type, containerQuota_value, coresQuota_type, coresQuota_value, requestQuota_pT5M, requestQuota_pT1H
```

```sql
//check quotas
cluster("Accprod").database("accprod").SubscriptionPolicy
| summarize max(PreciseTimeStamp) by subscriptionId, location, quotas, requestLimits
| where subscriptionId == "ab5ebc06-6ad0-4205-8090-6e27039f329f"
| project max_PreciseTimeStamp, subscriptionId, location, parse_json(quotas), parse_json(requestLimits)
```

```sql
// Check quota for GPU SKUs (K80, V100, P100)
cluster("Accprod").database("accprod").SubscriptionPolicy
| where subscriptionId == "{Sub_ID}"
| extend containerquota == parse_json(quotas)[0]
| extend corequota == parse_json(quotas)[1]
| extend v100quota == parse_json(quotas)[2]
| extend k80quota == parse_json(quotas)[3]
| extend p100quota == parse_json(quotas)[4]
| extend requestquota == parse_json(requestLimits)[0]
| summarize arg_max(TIMESTAMP,*) by location, subscriptionId
| project subscriptionId, location, containerquota, coresquota, v100quota, k80quota, p100quota, requestquota
```

#### Notes

The queries above will show current utilization on the target subscription.

- `pt5M` is the upper limit for the sum of create/delete operations in a 5 minute window.
- `pt1H` is the upper limit for the sum of create/delete operations in a 1 hour window.
- `coresQuota` value is equal to the number of cores currently in use.
- `containerQuota_value` is equal to the number of container groups they have deployed.

`pt5M` and `pt1H` information is not displayed in the [List Usage API output](https://docs.microsoft.com/en-us/rest/api/container-instances/location/list-usage)
so share with the customer as-needed.

## Check the regional availability

```sql
cluster("Accprod").database("accprod").ResourceAvailability
| where PreciseTimeStamp >ago(1d)
| where cpu < 64
| extend memoryInGB = iif(memoryInGB == 3.5 or memoryInGB == 7, real(8), iif(memoryInGB == 14, real(16), memoryInGB))
| extend  perc = (availableNodes*100/totalNodes)
| extend ['Available Nodes %']=iif(perc >0, perc,0),['Availabel Nodes Count'] = availableNodes
| extend  usedNodes = totalNodes-availableNodes
| extend util =toint( (usedNodes*100/totalNodes))
| summarize arg_max(PreciseTimeStamp,*) by location,osType,osVersion,cpu,memoryInGB,networkPolicy
| order by util desc
| summarize arg_max(cpu,*) by location,osType,osVersion,networkPolicy,memoryInGB
| summarize arg_max(memoryInGB,*) by location,osType,osVersion,networkPolicy
| order by util
| project location,osType,osVersion,cpu,memoryInGB,networkPolicy,['Clusters'] = totalClusters ,['Utilization'] =strcat(util,'%')
```

## Increasing Quotas for ACI

To increase the available quota for ACI, you'll need to open an ICM, use this [template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=23QA1u), with the following details:

Note that this quota increase request is done by a Geneva action through the IcM, be accurate in what your request details are in the template because that is what will be automatically done by the Geneva action. There is no person behind the request.

```txt
- Cloud instance: Public or goverment (if goverment, which one).
- Quota Type: StandardCores, StandardSpotCores or StandardV100Cores.
- Subscription ID.
- Region.
- ContainerGroup Network Type: All, OutboundOnly, PublicIP, VNET.
- Container Orchestration Type: Azure Container Instances or Virtual node in AKS.
- ContainerType: All, Confidential or Regular.
- Azure Availability Zone: All, NA, Zone1, Zone2 or Zone3.
- Total Container Group Count.
- Total Core Count.
- vCPU per Container Group.
- GB per Container Group.
- Container Deployment Environment: Production or Testing.
```

## Public Docs

- ACI Quotas: <https://docs.microsoft.com/en-us/azure/container-instances/container-instances-quotas>
