# AKS ACR 认证与 RBAC — kusto — 排查工作流

**来源草稿**: ado-wiki-acr-caching-kusto-logging.md, ado-wiki-acr-kusto-access.md, ado-wiki-acr-kusto-login-issues.md, ado-wiki-acr-kusto-queries.md
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: ACR Caching and Passthrough Image Pulls — Kusto Logging
> 来源: ado-wiki-acr-caching-kusto-logging.md | 适用: 适用范围未明确

### 排查步骤

#### ACR Caching and Passthrough Image Pulls — Kusto Logging

#### Overview

Caching for ACR enables caching container images from public and private repositories with benefits including high-speed pull operations, private network support, and avoiding Docker Hub rate limiting.

#### Kusto Logging

##### Percentage of registries with PTC enabled (i.e having cache rules)

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

##### Get registry frontend calls to the cache backend

```kql
let host = "myregistry.azurecr.io"
cluster("ACR").database("acrprod").RegistryActivity
| where PreciseTimeStamp > ago(8h)
| where http_request_host == host
| where message startswith "fe_pullthrough"
| project PreciseTimeStamp, message, correlationid, http_response_status, http_request_method, http_request_uri, http_request_host
```

##### Get cache backend messages

```kql
let corrId = "<correlation-id>";
cluster("ACR").database("acrprod").KubernetesContainers
| where ['time'] > ago(8h)
| where correlationid == corrId
| project ['time'], msg, log
```

##### Requests using PTC to pull images from upstream

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

##### Requests using PTC to pull images from upstream - per RegionStamp

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

##### Requests using PTC to pull images after authenticating with upstream

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

#### References

- [Public Docs](https://learn.microsoft.com/en-us/azure/container-registry/tutorial-registry-cache)

---

## Scenario 2: ACR Kusto Access
> 来源: ado-wiki-acr-kusto-access.md | 适用: Mooncake ✅

### 排查步骤

#### ACR Kusto Access

The Azure Container Registry team maintains Kusto clusters for troubleshooting and diagnostics.

#### Kusto Cluster Endpoints

| Environment | Cluster URL |
|-------------|-------------|
| Public | `acr.kusto.windows.net` |
| Fairfax (USGov) | `acrff.kusto.usgovcloudapi.net` |
| Mooncake (China) | `acrmc2.chinaeast2.kusto.chinacloudapi.cn` |

#### Access Management

Access is managed via MyAccess group **"ACR Kusto Access"**.

- Request access at https://myaccess
- Search for project "ACR Kusto Access"
- Access auto-expires and requires periodic renewal

#### Mooncake Notes

- **Important**: Client Security must be set to **dSTS-Federated**
- Kusto Cluster Connection: `acrmc2.chinaeast2.kusto.chinacloudapi.cn`

#### Contact

- ACR Kusto Admins: Krater-Admins@microsoft.com

---

## Scenario 3: Kusto query to look up ACR login issues
> 来源: ado-wiki-acr-kusto-login-issues.md | 适用: 适用范围未明确

### 排查步骤

#### Kusto query to look up ACR login issues

1. Check the ACIS endpoint to confirm that the customer has Admin enabled: <https://acis-beta.engineering.core.windows.net/WorkFlowTools.aspx?EndpointCategory=Azure%20Container%20Registry&Endpoint=Azure%20Container%20Registry&OperationKey=GetBasicRegistryDetails&registryloginserverparam=centralitycontainerregistry-on.azurecr.io&StartExecution=false>

2. Confirm that they are getting a login failed in registryactivity

    ```json
    cluster('acr.kusto.windows.net').database('acrprod').RegistryActivity
    |  where PreciseTimeStamp > ago(2d)
    | where http_request_host !contains "acrci" and http_request_uri == "/v2/" and toint(http_response_status) >= 400
    | take 100
    ```

3. Ask the customer to check the password in portal if they are using the right password

If the customer is trying to run Admin Creds and still fails then create an ICM.

If it fails with SP creds then its an issue with the SP creds not with registry "acrci" is the test account for PG.

The /v2/ is the request that comes in when a login operation is performed

---

## Scenario 4: ACR Kusto Queries
> 来源: ado-wiki-acr-kusto-queries.md | 适用: 适用范围未明确

### 排查步骤

#### ACR Kusto Queries


Kusto queries to Troubleshoot ACR Issues.

#### REQUIRED DABASE ACCESSES

##### ACR KUSTO DATABASE CONNECTION: `<https://acr.kusto.windows.net>`

#### ACR RELATED TABLES

- RegistryActivity
- BuildHostTrace
- WorkerServiceActivity
- RPActivity
- RegistryMasterData

##### ARM KUSTO DATABASE CONNECTION: `<https://armprod.kusto.windows.net>`

#### ARM RELATED TABLES

- HttpIncomingRequests

#### TSG Scenarios

##### Caching

Percentage of registries with PTC enabled (i.e having cache rules)

```sql
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

Get registry frontend calls to the cache backend

```sql
let host = "myregistry.azurecr.io"
cluster("ACR").database("acrprod").RegistryActivity
| where PreciseTimeStamp > ago(8h)
| where http_request_host == host
| where message startswith "fe_pullthrough"
| project PreciseTimeStamp, message, correlationid, http_response_status, http_request_method, http_request_uri, http_request_host
```

Get cache backend messages

```sql
let corrId = "8c85d7b2-65c1-4480-941f-bf2cbb8499da";
cluster("ACR").database("acrprod").KubernetesContainers
| where ['time'] > ago(8h)
| where correlationid == corrId
| project ['time'], msg, log
```

Requests using PTC to pull images from upstream

```sql
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

Requests using PTC to pull images from upstream - per RegionStamp

```sql
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

Requests using PTC to pull images after authenticating with upstream

```sql
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

##### ACR disabled issue

Check if the ACR under the Subscription ID is listed:

```sql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where PreciseTimeStamp > datetime(2020-11-07 06:55)
| where PreciseTimeStamp < datetime(2020-11-07 07:00)
| where operationName endswith "/MICROSOFT.CONTAINERREGISTRY/REGISTRIES/"
| where httpMethod == "GET" or httpMethod == "PUT" or httpMethod  == "DELETE"
| where targetUri contains "Microsoft.ContainerRegistry/registries/"
| where TaskName contains "End"
| where httpStatusCode == 404
| sort by PreciseTimeStamp asc
| project PreciseTimeStamp, principalOid, httpStatusCode, httpMethod, targetUri, SourceMoniker, userAgent, correlationId
| extend registryName = extract("registries/(.*)\\?api-version", 1, targetUri)
| distinct registryName
```

##### ACR Image or Repository Recovery

To see deleted repositories:

```sql
cluster("ACR").database("acrprod").RegistryManifestEvent
| where PreciseTimeStamp > ago(1d)
| where  Registry == "hannocreg.azurecr.io"
| where Action == "DeleteRepository"
| project PreciseTimeStamp, message, Registry, Action, Artifact, ArtifactType, Tag, SubscriptionId, Digest
```

Get tag info (if repository was created within 30 days):

```sql
cluster("ACR").database("acrprod").WorkerServiceActivity
| where env_time > ago(1d)
| where Repository == "aks-helloworld"
| where RegistryLoginUri == "hannocreg.azurecr.io"
| extend Count = 1
| distinct Repository , Tag, Digest, Count, OperationName, PreciseTimeStamp
```

##### Intermittent 502 responses from ACR

```sql
cluster('acr.kusto.windows.net').database('acrprod').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where err_message  <> "too many requests"
| where level != "info"
|where http_request_host contains "<acr name>.azurecr.io"
| project TIMESTAMP, activitytimestamp, level, message, servicedeploymentname, correlationid, http_request_host,Host,SourceNamespace
```

```sql
cluster('acr.kusto.windows.net').database('acrprod').RegistryActivity
| where PreciseTimeStamp > ago(19d)
| where http_request_method == "PUT" and http_request_uri matches regex "/v2/(.+?)/manifests/(.*)"
| extend Registry = http_request_host
| where Registry == "<acr name>.azurecr.io"
| extend responseStatus = toint(http_response_status)
| extend State = iff(responseStatus < 400, "Success", "CustomerError")
| extend State = iff(State == "CustomerError" and responseStatus >= 500, "ServerError", State)
| extend Message = iff(State == "ServerError", strcat("SERVER ERROR: ", message), "SUCCESS")
| extend Message = iff(State == "CustomerError", "CUSTOMER ERROR", Message)
| summarize Total = count() by Day = bin(PreciseTimeStamp, 1d), Message
```

If the 502s are confirmed, retry the Pull request. Internally should happen reboots of the Azure Storage tenants that can redirect the pull query to valid up time with resources tenants.

##### Recovery of Azure Container Registry

Run the below command in KUSTO to check for the deletion operation:

```sql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpOutgoingRequests")
| where PreciseTimeStamp > ago(5d)
| where targetUri contains "{Sub_Id}"
| where httpMethod contains "DELETE"
| where targetUri contains "Microsoft.ContainerRegistry"
| project TIMESTAMP , TaskName , ActivityId , subscriptionId , correlationId , principalPuid  , operationName , httpMethod , targetUri
```

Run the below KUSTO queries to get the registry SKU and Region:

```sql
cluster('acr.kusto.windows.net').database('acrprod').RegistryMasterData
| where env_time >= ago(7d)
| where LoginServerName == "<registry_name>.azurecr.io"
| sort by env_time desc
| project env_time, RegistryId, RegistryLocation, SkuId
```

---
