---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/TSG/Caching"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FCaching"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Caching and Passthrough Image Pulls — Kusto Logging

## Overview

Caching for ACR enables caching container images from public and private repositories with benefits including high-speed pull operations, private network support, and avoiding Docker Hub rate limiting.

## Kusto Logging

### Percentage of registries with PTC enabled (i.e having cache rules)

```kql
let startTime = ago(2d);
let workerServiceRunId=WorkerServiceActivity
| where env_time > startTime
| where AppRole == "ACR.WorkerService"
| where Message startswith "Upload RegistryMaster Table for all accounts completed"
| order by env_time desc
| take 1
| project CorrelationId;
cluster("ACR").database("acrprod").RegistryMasterData
| where env_time > startTime
| where CorrelationId in (workerServiceRunId)
| summarize round(100.0 * countif(HasCacheRules == "True") / count(), 5)
```

### Get registry frontend calls to the cache backend

```kql
let host = "myregistry.azurecr.io"
cluster("ACR").database("acrprod").RegistryActivity
| where PreciseTimeStamp > ago(8h)
| where http_request_host == host
| where message startswith "fe_pullthrough"
| project PreciseTimeStamp, message, correlationid, http_response_status, http_request_method, http_request_uri, http_request_host
```

### Get cache backend messages

```kql
let corrId = "<correlation-id>";
cluster("ACR").database("acrprod").KubernetesContainers
| where ['time'] > ago(8h)
| where correlationid == corrId
| project ['time'], msg, log
```

### Requests using PTC to pull images from upstream

```kql
let startTime = <start-time-here>;
cluster("ACR").database("acrprod").KubernetesContainers
| where PreciseTimeStamp >= startTime
| where service == "pullthroughcache"
| where msg startswith "Found cache rule"
    and msg !endswith "name=cacherule-mcr-helloworld"
    and msg !endswith "name=cacherule-dh-helloworld"
| summarize count() by bin(PreciseTimeStamp, 1h)
| render timechart
```

### Requests using PTC to pull images from upstream - per RegionStamp

```kql
let startTime = <start-time-here>;
cluster("ACR").database("acrprod").KubernetesContainers
| where PreciseTimeStamp >= startTime
| where service == "pullthroughcache"
| where msg startswith "Found cache rule"
    and msg !endswith "name=cacherule-mcr-helloworld"
    and msg !endswith "name=cacherule-dh-helloworld"
| summarize count() by RegionStamp
| render barchart
```

### Requests using PTC to pull images after authenticating with upstream

```kql
let startTime = <start-time-here>;
let correlationIds = database("acrprod").KubernetesContainers
| where PreciseTimeStamp > startTime
| where service == "pullthroughcache"
| where msg startswith "Found cache rule"
    and msg !endswith "name=cacherule-mcr-helloworld"
    and msg !endswith "name=cacherule-dh-helloworld"
| project correlationid;
database("acrprod").KubernetesContainers
| where PreciseTimeStamp > startTime
| where service == "pullthroughcache"
| join kind=inner correlationIds on correlationid
| where msg startswith "Acquiring token for"
| summarize count() by bin(PreciseTimeStamp, 1h)
| render timechart
```

## References

- [Public Docs](https://learn.microsoft.com/en-us/azure/container-registry/tutorial-registry-cache)
