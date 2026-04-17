---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/TSG/Caching"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/Caching"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Caching and Passthrough Image Pulls

## Overview

Caching for ACR enables you to cache container images from public and private repositories.

Implementing Caching for ACR provides the following benefits:

- High-speed pull operations
- Private networks
- Avoiding Docker Hub [rate limiting](https://docs.docker.com/docker-hub/download-rate-limit/)

**During preview, the cache rules are limited to 50. Once it goes GA, the max will be increased to 500. The eventual goal will be to have a max of 10k.**

## Usage

Customers will create a cache rule for the image/repo they want to cache. Giving the source registry, and repo path. They can also give credentials to log in to the source registry. This will give them higher pull limits from Docker Hub.

In the initial preview form, there are quite a few limitations. Some of them will be removed during preview.

- Maximum of 1,000 cache rules
- Quarantine functions like signing, scanning, and manual compliance approval are on the roadmap but not included in this release.
- Caching will only occur after at least one pull request is complete on the available container image. For every new image available, a new pull request must be complete. Caching for ACR does not automatically pull new versions of images when a new version is available. It is on the roadmap but not supported in this release.
- Multiple registries are supported, with more planned. Check [the docs here](https://learn.microsoft.com/en-us/azure/container-registry/artifact-cache-overview#upstream-support) for the latest list.

## Error Messages

- **Resource names must contain alphanumeric characters and must be between 5 and 50 characters optionally separated by '-'.**

  - This error occurs when a customer tries to name their Rule Name an invalid name.
  - Fix: Use a valid name. Names must be within 5–50 characters, and can only consist of letters and numbers.

- **Repository names should follow the standardized docker repository naming conventions. All characters should be lowercase.**

  - Unsupported upstream or login server provided. Supported upstreams: `docker.io`, `mcr.microsoft.com`.
  - Fix: Only pull from docker.io (Docker Hub) or mcr.microsoft.com (Microsoft Artifact Registry).

- **The user does not have secrets get permission on key vault.**

  - This occurs when a customer made a Credential set but didn't assign access to the Key Vault.
  - Fix: `az keyvault set-policy --name myKeyVaultName --object-id myObjID --secret-permissions get`
  - Reference: [Assign an Azure Key Vault access policy (CLI)](https://learn.microsoft.com/en-us/azure/key-vault/general/assign-access-policy?tabs=azure-cli)

- **Failed to create Cache Rule — Quota exceeded for resource type cacheRules for the registry SKU Standard.**

  - This error occurs when a customer tries to make more than 50 cache rules.
  - Fix: Delete unneeded rules.
  - Note: Upgrading SKUs will NOT increase the cache rule limit.

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
let corrId = "8c85d7b2-65c1-4480-941f-bf2cbb8499da";
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

[Public Docs](https://learn.microsoft.com/en-us/azure/container-registry/tutorial-registry-cache)
