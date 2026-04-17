# ACR Kusto Query Reference (Mooncake)

> Source: Mooncake POD Support Notebook — ACR Troubleshooting / Kusto query
> Quality: guide-draft (pending review)

## Mooncake Kusto Endpoint

```
https://acrmc2.chinaeast2.kusto.chinacloudapi.cn/acrprodmc
```

## Authentication Errors

```kql
RegistryActivity
| where PreciseTimeStamp > ago(9d) and PreciseTimeStamp < ago(4d)
| where level != "info"
| where http_request_host == "<registry>.azurecr.io"
//| where correlationid == "xxx"
```

## Pull (Manifest) Errors

```kql
RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_method == "GET" and http_request_uri contains "/manifests/"
| extend responseStatus = toint(http_response_status)
| extend State = iff(responseStatus < 400, "Success", "CustomerError")
| extend State = iff(State == "CustomerError" and responseStatus >= 500, "ServerError", State)
| extend Message = iff(State == "ServerError", strcat("SERVER ERROR: ", message), "SUCCESS")
| extend Message = iff(State == "CustomerError", "CUSTOMER ERROR", Message)
| summarize Total = count() by Day = bin(PreciseTimeStamp, 1d), Message
```

## Push (Manifest) Errors

```kql
RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_method == "PUT" and http_request_uri matches regex "/v2/(.+?)/manifests/(.*)"
| extend responseStatus = toint(http_response_status)
| extend State = iff(responseStatus < 400, "Success", "CustomerError")
| extend State = iff(State == "CustomerError" and responseStatus >= 500, "ServerError", State)
| extend Message = iff(State == "ServerError", strcat("SERVER ERROR: ", message), "SUCCESS")
| extend Message = iff(State == "CustomerError", "CUSTOMER ERROR", Message)
| summarize Total = count() by Day = bin(PreciseTimeStamp, 1d), Message
```

## ACR Build Logs

```kql
// By registry name
BuildHostTrace
| where env_time > ago(3d)
| where Tag contains "<registry>.azurecr.io"
| order by env_time
| project env_time, Message, Tag, DataJson, SourceNamespace

// By RUN_ID
BuildHostTrace
| where env_time > ago(1d)
| where Tag contains "<registry>.azurecr.io_<run_id>"
| order by env_time
```

## Count Manifests in Registry

```kql
WorkerServiceActivity
| where env_time > ago(7d)
| where OperationName == "ACR.Layer: ExecuteOperationOnListManifestsAsync"
| where RegistryLoginUri == "<acr>.azurecr.io"
| extend numManifests = toint(substring(Message, 52, strlen(Message) - 11 - 52))
| summarize numManifests = sum(numManifests) by bin(env_time, 1d), RegistryId, RegistryLoginUri, ImageType
```

## Unique Manifests (with tag info)

```kql
WorkerServiceActivity
| where env_time > ago(2d)
| where OperationName == "ACR.Layer: AddManifestRefAsync-Succeed"
| where RegistryLoginUri == "<acr>.azurecr.io"
| summarize count() by Repository, Tag, Digest
```

## Token Server Status (repos not visible in portal)

```kql
RegistryActivity
| where PreciseTimeStamp > ago(2h)
| where message contains "[error]"
| project PreciseTimeStamp, message, servicedeploymentinstance, service, correlationid, http_request_uri, http_response_status
| summarize count() by servicedeploymentinstance, service
```

## Tag Deletion Confirmation

```kql
let Registry = "<acr>.azurecr.io";
let Repository = "redis";
let Digest = "sha256:xxx";
let Uri = strcat("/v2/", Repository, "/manifests/", Digest);
RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where service == "nginx"
| where http_request_method == "DELETE"
| where http_request_host == Registry
| where http_request_uri == Uri
| project Day = bin(PreciseTimeStamp, 1d), Registry, Uri = http_request_uri, HttpStatus = http_response_status
```

## Repository Deletion Confirmation

```kql
let Registry = "<acr>.azurecr.io";
let Repository = "image/redis";
let Uri = strcat("/v2/_acr/", Repository, "/repository");
RegistryActivity
| where PreciseTimeStamp > ago(2d)
| where service == "nginx"
| where http_request_method == "DELETE"
| where http_request_host == Registry
| project Day = bin(PreciseTimeStamp, 1d), Registry, Uri = http_request_uri, HttpStatus = http_response_status, http_request_method, http_request_remoteaddr
```

## Push Error Response Check

```kql
RegistryActivity
| where PreciseTimeStamp > ago(1d) and http_request_host == "<acr>.azurecr.io" and service == "nginx"
| summarize count() by http_response_status
```

## ACR Deletion Events (ARM)

```kql
HttpIncomingRequests
| where PreciseTimeStamp > ago(1d)
| where subscriptionId contains "<sub-id>"
| where httpMethod contains "DELETE"
| where targetUri contains "<acr>"
| project TIMESTAMP, TaskName, ActivityId, subscriptionId, correlationId, principalPuid, authorizationAction, operationName, httpMethod, targetUri, clientIpAddress, commandName
```

## ACR Creation Date

```kql
RegistryMasterData
| where env_time > ago(1d)
| where LoginServerName == "<acr>.azurecr.io"
| take 1
| project CreatedTime, LoginServerName
```

## Geo-Replication Sync Progress

```kql
// Step 1: Find replication operation
let registry = "<registry>";
RPActivity
| where env_time > ago(1d)
| where HttpMethod == "PUT"
| where OperationName == "put/subscriptions/resourceGroups/registries/replications/"
| where ResourceUri has registry
| project env_time, CorrelationId, ClientRequestId, ResourceUri

// Step 2: Check sync status (use CorrelationId from Step 1)
RPActivity
| where env_time >= ago(1h)
| where CorrelationId == "<correlation-id>"
| where OperationName contains "ReplicationLayerCopyStatus"
| project env_time, CorrelationId, TaskName, OperationName, Message, RoleInstance, HttpStatus, Level, LoginServerName
| order by env_time desc
```

## Geo-Replication Push "Blob Upload Unknown" Failures

```kql
cluster("ACR").database("acrprod").RegistryActivity
| where PreciseTimeStamp > ago(10d)
| where http_request_host contains "<acr>.azurecr.io" and message == "fe_request_stop"
| where http_request_method in ("POST", "PUT", "PATCH")
| extend status = tostring(iff(be_err_code == "blob upload unknown", "FAIL", "SUCCESS"))
| summarize count() by Tenant, http_request_method, status
```

## Webhook Connectivity

```kql
RPActivity
| where env_time > ago(4d)
| where Role contains "notification"
| where OperationName == "WebHookCallStart"
| where LoginServerName == "<acr>.azurecr.io"
| extend Webhook = extract(" to ([[:alnum:]|-]*)", 1, Message)
| project Id = strcat(CorrelationId, Webhook), StartTime = env_time, Webhook
| join (
    RPActivity
    | where env_time > ago(4d)
    | where OperationName startswith "WebHookCallEnd"
    | where LoginServerName == "<acr>.azurecr.io"
    | extend Webhook = extract(" to ([[:alnum:]|-]*)", 1, Message)
    | project OperationName, Id = strcat(CorrelationId, Webhook), SourceNamespace, EndTime = env_time
) on Id
| project OperationName, SourceNamespace, Webhook, StartTime, EndTime, Duration = EndTime - StartTime
```

## ACR Build Service Incoming Events

```kql
BuildServiceIncomingEvent
| where TIMESTAMP > ago(3h)
| where EventId contains "<registry>.azurecr.cn"
| project TIMESTAMP, RequestId, EventType, EventId, ProcessorName
```

## Content Trust Enable Events

```kql
HttpIncomingRequests
| where PreciseTimeStamp > ago(1d)
| where operationName == "POST/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.CONTAINERREGISTRY/REGISTRIES/UPDATEPOLICIES"
| where targetUri contains "<acr>"
```

## Tags Pushed After Specific Date

```kql
WorkerServiceActivity
| where env_time > ago(10d)
| where OperationName == "ACR.Layer: AddManifestRefAsync-Succeed"
| where RegistryLoginUri == "<acr>.azurecr.io"
| extend FullName = iff(Repository == "helm/repo",
    strcat(RegistryLoginUri, "/", Repository, "/", Tag),
    strcat(RegistryLoginUri, "/", Repository, ":", Tag))
| extend Day = bin(env_time, 10d)
| summarize LastDayPushed = max(Day) by RegistryLoginUri, Repository, Tag, FullName
```

## SKU Migration Status (Classic to Managed)

```kql
let Id = RPActivity
| where env_time > ago(1d)
| where OperationName == "MigrationStart"
| where LoginServerName contains "<acr>"
| distinct CorrelationId;
RPActivity
| where env_time > ago(50m)
| where CorrelationId in (Id)
| project env_time, CorrelationId, SourceMoniker, TaskName, OperationName, Message, ExceptionMessage, HttpStatus, Level, LoginServerName
| order by env_time desc
```

## List of Tags in Registry

```kql
WorkerServiceActivity
| where env_time > ago(2d)
| where OperationName == "ACR.Layer: AddManifestRefAsync-Succeed"
| where RegistryLoginUri == "<acr>.azurecr.io"
| extend Count = 1
| distinct Repository, Tag, Digest, Count
```
