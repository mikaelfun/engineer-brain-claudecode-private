---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/Platform and Tooling/Tools/Kusto/ACR Kusto Queries"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FKusto%2FACR%20Kusto%20Queries"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Kusto Queries

[[_TOC_]]

Kusto queries to Troubleshoot ACR Issues.

## REQUIRED DABASE ACCESSES

### ACR KUSTO DATABASE CONNECTION: `<https://acr.kusto.windows.net>`

[Link to instructions](/Azure-Kubernetes-Service-Wiki/ACR/Platform-and-Tooling/Tools/Kusto/ACR-Kusto-Access.md)

#### ACR RELATED TABLES

- RegistryActivity
- BuildHostTrace
- WorkerServiceActivity
- RPActivity
- RegistryMasterData

### ARM KUSTO DATABASE CONNECTION: `<https://armprod.kusto.windows.net>`

#### ARM RELATED TABLES

- HttpIncomingRequests

## ACR Kusto Queries Repo

[Link to ACR Queries Repo](/Azure-Kubernetes-Service-Wiki/ACT-Team/Tools/Kusto-Repo/Kusto-Repo-ACR.md)

## TSG Scenarios

### Caching  

[Link to TSG](/Azure-Kubernetes-Service-Wiki/ACR/TSG/Caching.md)

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
let startTime = <start-time-here>; //Ex: let startTime=datetime(2023-02-15 00:00:00);
cluster("ACR").database("acrprod").KubernetesContainers
| where PreciseTimeStamp >= startTime
| where service == "pullthroughcache"
| where msg startswith "Found cache rule"
    // Exclude known test images
    // Not ideal way of doing things, but AFAIK we are currently not logging good
    // contextual data to make querying easier
    and msg !endswith "name=cacherule-mcr-helloworld"
    and msg !endswith "name=cacherule-dh-helloworld"
| summarize count() by bin(PreciseTimeStamp, 1h)
| render timechart
```

Requests using PTC to pull images from upstream - per RegionStamp

```sql
let startTime = <start-time-here>; //Ex: let startTime = datetime(2023-02-15 00:00:00);
cluster("ACR").database("acrprod").KubernetesContainers
| where PreciseTimeStamp >= startTime
| where service == "pullthroughcache"
| where msg startswith "Found cache rule"
    // Exclude known test images
    // Not ideal way of doing things, but AFAIK we are currently not logging good
    // contextual data to make querying easier
    and msg !endswith "name=cacherule-mcr-helloworld"
    and msg !endswith "name=cacherule-dh-helloworld"
| summarize count() by RegionStamp
| render barchart
```

Requests using PTC to pull images after authenticating with upstream

```sql
let startTime = <start-time-here>; //Ex: let startTime = datetime(2023-02-15 00:00:00);
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
// When upstream challenges us for a token, we invoke a code path which logs this message.
// We cache the token, but this the below message gets printed for both cached and non-cached cases,
// which is ok for the scenario here
| where msg startswith "Acquiring token for"
| summarize count() by bin(PreciseTimeStamp, 1h)
| render timechart
```

### ACR disabled issue

[Link to TSG](/Azure-Kubernetes-Service-Wiki/ACR/TSG/ACR-disabled-issue.md)

Check if the ACR under the Subscription ID is listed as results for the next Kusto Query

```sql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests") 
| where PreciseTimeStamp > datetime(2020-11-07 06:55)
| where PreciseTimeStamp < datetime(2020-11-07 07:00)
| where operationName endswith "/MICROSOFT.CONTAINERREGISTRY/REGISTRIES/"
| where httpMethod == "GET" or httpMethod == "PUT" or httpMethod  == "DELETE"
| where targetUri contains "Microsoft.ContainerRegistry/registries/"
| where TaskName contains "End"
| where httpStatusCode == 404
//| where targetUri contains "<ACR_NAME>"
| sort by PreciseTimeStamp asc 
| project PreciseTimeStamp, principalOid, httpStatusCode, httpMethod, targetUri, SourceMoniker, userAgent, correlationId
| extend registryName = extract("registries/(.*)\\?api-version", 1, targetUri)
| distinct registryName
```

### ACR Image or Repository Recovery

[Link to TSG](/Azure-Kubernetes-Service-Wiki/ACR/TSG/ACR-Image-or-Repository-Recovery.md)

To see deleted repositories you can use this Kusto query:

```sql
cluster("ACR").database("acrprod").RegistryManifestEvent
| where PreciseTimeStamp > ago(1d)
| where  Registry == "hannocreg.azurecr.io"
| where Action == "DeleteRepository"
| project PreciseTimeStamp, message, Registry, Action, Artifact, ArtifactType, Tag, SubscriptionId, Digest
```

From the output of this query note down the ôArtifactTypeö:

![Screenshot of the Kusto output from the query in step one, highlighting the ArtifactType value](/.attachments/acrr-1.png)

   Unfortunately the output of the above query does not provide the tag, but we can get it from another query IF the repository was not created more than 30 days ago, if it was created more than 30 days ago youÆll have to get the tag from the customer if they did not provide it already

```sql
cluster("ACR").database("acrprod").WorkerServiceActivity
| where env_time > ago(1d)
| where Repository == "aks-helloworld" 
| where RegistryLoginUri == "hannocreg.azurecr.io"
| extend Count = 1
| distinct Repository , Tag, Digest, Count, OperationName, PreciseTimeStamp
```

![Kusto query output showing an image with multiple tags and digests - confirm which tag/digest the customer needs to recover](/.attachments/acrr-2.png)

   Also if there are multiple tags, then weÆd need to verify with the customer which one to restore.

   Once you have the above details, please reach out to your TA to do the recovery of the image/s.

### Intermittent 502 responses from ACR

[Link to TSG](/Azure-Kubernetes-Service-Wiki/ACR/TSG/Intermittent-502-responses-from-ACR.md)

```sql
// cx is doing more than 10 concurrent pulls ACR will throttle them The error usually states too many requests
cluster('acr.kusto.windows.net').database('acrprod').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where err_message  <> "too many requests"
| where level != "info"
//|where http_request_host !contains acr
//| where err_code == toomanyrequests
|where http_request_host contains "<acr name>.azurecr.io"
| project TIMESTAMP, activitytimestamp, level, message, servicedeploymentname, correlationid, http_request_host,Host,SourceNamespace
```

```sql
cluster('acr.kusto.windows.net').database('acrprod').RegistryActivity
| where PreciseTimeStamp > ago(19d)
| where http_request_method == "PUT" and http_request_uri matches regex "/v2/(.+?)/manifests/(.*)"// We can also filter by a specific customer
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

### Recovery of Azure Container Registry

[Link to TSG](/Azure-Kubernetes-Service-Wiki/ACR/TSG/Recovery-of-Azure-Container-Registry.md)

Run the below command in KUSTO to check for the deletion operation.

```sql
//ACR DELETION 
Execute in [Web] [Desktop] [cluster('armprod.kusto.windows.net').database('ARMProd')]
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpOutgoingRequests") 
| where PreciseTimeStamp > ago(5d) 
| where targetUri contains "{Sub_Id}"
| where httpMethod contains "DELETE"
//ACR NAME
| where targetUri contains "Microsoft.ContainerRegistry"
| project TIMESTAMP , TaskName , ActivityId , subscriptionId , correlationId , principalPuid  , operationName , httpMethod , targetUri
```

Run the below KUSTO queries to get the registry SKU and Region.

```sql
cluster('acr.kusto.windows.net').database('acrprod')RegistryMasterData
| where env_time >= ago(7d) // depending on when the ACR was deleted
| where LoginServerName == "<registry_name>.azurecr.io" // registryName has to be lowercase
| sort by env_time desc
| project env_time, RegistryId, RegistryLocation, SkuId // Sku -> {1: Basic, 2: Std, 3: Premium}
```

```sql
cluster('acr.kusto.windows.net').database('acrprod').RegistryMasterData
| where env_time >= ago(7d) // depending on when the ACR was deleted
| where LoginServerName == tolower("MicrobotPlatformDev.azurecr.io") // registryName has to be lowercase
| sort by env_time desc
| project env_time, RegistryId, RegistryLocation, SkuId // Sku -> {1: Basic, 2: Std, 3: Premium}
```

## Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Luis Alvarez <lualvare@microsoft.com>
- Fabian Gonzalez Carrillo <Fabian.Gonzalez@microsoft.com>
