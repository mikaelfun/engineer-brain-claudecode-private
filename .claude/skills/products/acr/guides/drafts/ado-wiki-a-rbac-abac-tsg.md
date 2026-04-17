---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/TSG/ACR Authorization RBAC-ABAC"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Authorization%20RBAC-ABAC"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Authorization - RBAC/ABAC

[[_TOC_]]

## Goals

Troubleshooting guide for the runtime AAD authorization checks that are performed using the new compliant data plane authorization service CheckAccess V2 (Remote PDP), RBAC, and ABAC.

## Non Goals

This is not a reference for questions like when & where complaint RBAC (Role-Based Access Control) or ABAC (Attribute-Based Access Control) are used. For detailed information about the authorization process in ACR, please refer to the [design spec](https://msazure.visualstudio.com/DefaultCollection/AzureContainerRegistry/_git/specs?path=/Registry/Access-Control), [CheckAccessV2 Migration](https://msazure.visualstudio.com/DefaultCollection/AzureContainerRegistry/_git/specs?path=/Registry/Access-Control/CheckAccess-Migration/ACR-Compliant-RBAC-CheckAccessV2-Migration.md&_a=preview), [Repo-Permission design spec](https://msazure.visualstudio.com/DefaultCollection/AzureContainerRegistry/_git/specs?path=/Registry/Access-Control/Repo-Permission.md&_a=preview), and [ABAC public documentation](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-abac-repository-permissions).

## Introduction

All authorization for AAD identities with compliant RBAC is handled by token server irrespective of where the request gets routed. Azure RBAC is an authorization system that helps manage who has access to Azure resources, what they can do with those resources, and what areas they have access to. Azure ABAC builds on Azure RBAC by adding role assignment conditions based on attributes in the context of specific actions.

In the token server, this is handled by [AzureRBACProvider.cs](https://msazure.visualstudio.com/One/_git/DevServices-ContainerRegistry-Service?path=/src/services/src/tokenserver/ACR.TokenService/AzureRBAC/AzureRBACProvider.cs) which uses different layers of cache to optimize the authorization checks. It writes a consolidated log entry with all details with the message name `rbac_request_log`. You can query the RBAC log for a request using the request's correlationId

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "rbac_request_log"    
    | sort by PreciseTimeStamp asc
    | project-reorder PreciseTimeStamp, message, TenantId, http_request_host, Subscription, http_response_status, http_response_duration, rbac_response_source, rbac_cachekey, rbac_redis_duration, rbac_memorycache_count, err_detail

```

The different fields of the log entry are

| Log Field              | Description                                                                                                                                   |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| rbac_cachekey          | The cache key used for looking into the RBAC caches. It is in the format CheckAccessVersion:RegistryId:InputTokenId                           |
| rbac_response_source   | The source indicating from where the RBAC response is returned. It can be from local(in memory)/Redis cache or by calling the Azure RBAC API. |
| rbac_redis_duration    | If Redis cache is accessed as part of serving the RBAC request, the duration in ms taken for Redis lookup                                     |
| rbac_memorycache_count | The current count of the local in-memory cache                                                                                                |
| rbac_abac              | Indicates whether the request uses ABAC                                                                                                       |
| TenantId               | The tenant Id of the subscription where the resource exists. RBAC request is initiated for the resource.                                      |
| Subscription           | The subscription Id of the resource                                                                                                           |
| http_request_host      | The registry login server that is being authenticated                                                                                         |
| http_response_status   | The response status                                                                                                                           |
| http_response_duration | The response duration in ms of the Azure RBAC API if at all it is invoked.                                                                    |
| err_detail             | If the request is failed, this property captures the corresponding exception .                                                                |

`RegistryMasterData` can be used to check whether the repository permission (ABAC) feature is enabled for the registry.

```sql
RegistryMasterData
    | where RegistryName == "<registry name>"
    | summarize arg_max(PreciseTimeStamp, EnableRepoPermission)
```

As part of compliant RBAC, we use MSAL to fetch the first party AAD token. The information for MSAL request is logged with message name `msal_request_log` under the same `correlationId` of the RBAC request.

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "msal_request_log"
    | sort by PreciseTimeStamp asc
    | project-reorder PreciseTimeStamp, message, http_response_status, http_response_duration, msal_token_source, msal_duration_total_ms, msal_duration_cache_ms, msal_duration_http_ms, err_detail
```

The different fields of the log entry are

| Log Field              | Description                                                                                                                                                                                                                                                                                                                             |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| msal_token_source      | The source of the token returned from the MSAL client library (from cache or calling the AAD endpoint)                                                                                                                                                                                                                                  |
| msal_duration_total_ms | Total time (in ms) spent to service this request, in ms. Includes time spent making Http Requests Microsoft.Identity.Client.AuthenticationResultMetadata.DurationInHttpInMs,  time spent in token cache callbacks Microsoft.Identity.Client.AuthenticationResultMetadata.DurationInCacheInMs, time spent in MSAL and context switching. |
| msal_duration_cache_ms | Time (in ms) MSAL spent in reading and writing to the token cache, i.e. in the OnBeforeAccess, OnAfterAccess etc. callbacks. Does not include internal MSAL logic for searching through the cache once loaded.                                                                                                                          |
| msal_duration_http_ms  | Time (in ms) MSAL spent for HTTP communication.                                                                                                                                                                                                                                                                                         |
| http_response_status   | The response status                                                                                                                                                                                                                                                                                                                     |
| http_response_duration | The total request duration to fetch the acces token from Msal client. This is the E2E latency involving calls to create confidential client application.                                                                                                                                                                                |
| err_detail             | If the request is failed, this property captures the corresponding exception .                                                                                                                                                                                                                                                          |

If you fetch all the logs for a `correlationid`, it should include logs for both RBAC and MSAL if they are used for a request.

``` sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
```

**NOTE**: Due to request coalescing, some token server requests may share the same AAD request. Large registries like MAR send hundreds of auth requests per second checking the same SPN. Upon cache miss of the first auth request, a request is sent to AAD service. Before the response arrives, concurrent auth requests also have cache misses. To avoid sending duplicated AAD requests, coalescing is done on each node. Outstanding AAD requests are tracked and reused for other concurrent requests before response comes back. When coalescing happens, only the first auth request logs `msal_request_log`, while others will log correlationId of the first one. Field `msg` of these log entries are like:

```sql

    "aad_access_token_with_sp_coalesced. Reused request: correlationId = 31af0cde-ea81-4770-9961-5e511daa1f8c"

```

Currently compliant RBAC is used only for three types of requests (this might expand in future for more request types)

- Requests to token server for a registry that belongs to a tenant with private endpoints enabled. In other words, for all registries that belong to the tenant with ARM private endpoints enabled.
- Requests to token server with AAD tokens scoped to ACR audience `https://containerregistry.azure.net`
- Requests to token server with AAD tokens scoped to ARM audience when UseCheckAccessForAuth feature flag is enabled for the registry. This includes service principal scenarios. (Note: The UseCheckAccessForAuth feature flag is now enabled for all registries.)

## Possible Troubleshooting scenarios

### 1.Token Server request fails with unexpected status code like >= 500

Get the `correlationId` for the request under investigation.

``` sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where http_request_host == "myregistry.azurecr.io"
    | where message == "ts_request_stop" or message == "fe_request_stop"
    | where http_response_status == 500
    | sort by PreciseTimeStamp asc
    | project PreciseTimeStamp, correlationId
```

Query the detailed logs for a request using the correlationId

``` sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | project-reorder PreciseTimeStamp, correlationid, message, http_request_host, http_response_status, http_response_duration, err_detail, http_request_uri
```

Check the exception for RBAC request / MSAL request

``` sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "rbac_request_log" or message == "msal_request_log"
    | project-reorder PreciseTimeStamp, message, http_response_status, err_detail
```

If the error is related to the CheckAccess API call, visit [CheckAccess API request fails](/Azure-Kubernetes-Service-Wiki/ACR/TSG/ACR-Authorization-RBAC%2DABAC#3.-checkaccess-api-request-fails)

If the exception `err_detail` indicate potential downtime or outage of the corresponding services, create an ICM.

### 2. Token server requests has long latency or times out

Get the `correlationId` for a request with the symptom.

``` sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where http_request_host == "myregistry.azurecr.io"
    | where message == "ts_request_stop" or message == "fe_request_stop"
    | where http_response_status == 500
    | sort by PreciseTimeStamp asc
    | project PreciseTimeStamp, correlationId
```

Check the latency information `http_response_duration` for RBAC/MSAL if they are contributing to the latency or timeouts

``` sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "rbac_request_log" or message == "msal_request_log"
    | sort by PreciseTimeStamp asc
    | project-reorder PreciseTimeStamp, message, http_response_status, http_response_duration, err_detail
```

### 3. CheckAccess API request fails

You will be able to observe some error logs related to MISE while querying the detailed logs for a request using the correlationId.

``` sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | project-reorder PreciseTimeStamp, correlationid, message, http_request_host, http_response_status, http_response_duration, err_detail, http_request_uri
```

``` sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "checkAccess_api_stop"
    | project-reorder PreciseTimeStamp, correlationid, message, http_response_status, http_response_duration, err_detail, http_request_uri
```

If more detailed investigatioon is needed on CheckAccess, please escalate via ICM.

---

Dashboards are setup for monitoring the overall health of these dependent services:

- [CheckAccess Dashboard](https://portal.microsoftgeneva.com/dashboard/AzureContainerRegistry/Public/Dataplane/Features/Compliant-RBAC/CheckAccess) is used to track overall success rate and performance of the CheckAccess API.
- [ABAC Repo Permission](https://portal.microsoftgeneva.com/dashboard/AzureContainerRegistry/Public/Dataplane/Features/Compliant-RBAC/ABAC%2520Repo%2520Permission) is used to track the success rate and request metrics related to the ABAC Repo Permission feature.

For any unexpected behavior, escalate via ICM

### 4. Authorization Issues with Role Assignments

Registries that are enabled for [RBAC Registry + ABAC Repository Permissions](https://aka.ms/acr/auth/abac) recognize a different set of built-in roles for authorization. This could be a possible issue why customers cannot perform specific actions even though they have relied on such existing role assignments for a while.

To check whether a registry is configured for "RBAC Registry + ABAC Repository Permissions" is to (1) check the `EnableRepoPermission` value in the `RegistryMasterData` table, or (2) check the registry's ARM property `roleAssignmentMode`.

- A `True` value means the registry is configured for "RBAC Registry + ABAC Repository Permissions", supporting both RBAC role assignments and optional ABAC conditions. The registry ARM property `roleAssignmentMode` should be equal to `AbacRepositoryPermissions`.
- A `False` value means the registry is configured for "RBAC Registry Permissions", supporting only RBAC role assignments. The registry ARM property `roleAssignmentMode` should be equal to `LegacyRegistryPermissions`.

```sql
RegistryMasterData
| where env_time > ago(1d)
| where RegistryName == '<registry-arm-resource-name>' or LoginServerName == '<registryfqdn.azurecr.io>'
| project-reorder RegistryName, LoginServerName, EnableRepoPermission
```

Alternatively, you can check the `EnableRepoPermission` value in the ASI:
![Screenshot showing the ASI EnableRepoPermission view](/.attachments/asi-enablerepopermission-42a1acf0-6fc4-4e19-b3bf-e29d87da4e0b.png)

To check the correct built-in role that the customer should use depending on whether the registry is "RBAC + ABAC" or "RBAC", please consult the [ACR role directory reference on MS Learn](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-directory-reference?tabs=registries-configured-with-rbac-registry-abac-repository-permissions).
Also consult the [ACR ABAC documentation on MS Learn](https://aka.ms/acr/auth/abac).

### 5. Troubleshooting Authorization Issues

#### Customer Self-Diagnosis: Repository Permission Check

You can suggest the customer run `az acr check-health -n myregistry --repository myrepo` to get the health state of the target registry "myregistry" and check allowed permissions to the specific repository "myrepo". This can be executed on the customer side to check which permissions they have to the repository. Below is a sample output.

![check-health-repository.png](/.attachments/check-health-repository-2398df1f-6020-46dd-ab4a-236ca5982bee.png)

- **No permissions**: When the customer has no permissions to the repository, it will show an error message.
- **Full permissions**: When the customer has full permissions to the repository, it shows the customer is able to fetch access token successfully for the repository.
- **Partial permissions**: When the customer has partial permissions to the repository, the error message will show which permissions they have and which they lack.

### Troubleshoot Using Kusto Queries

#### Step 1: Get the `correlationid` for the request under investigation

``` sql
RegistryActivity
    | where PreciseTimeStamp > ago(3h)
    | where http_request_host == "abacdemoacr.azurecr.io" // registry name
    | where message == "fe_request_stop" or message == "ts_request_stop"
    | project-reorder PreciseTimeStamp, correlationid, jwtid, message, http_response_status, auth_token_access, err_detail, http_request_uri, err_code, err_message, http_request_useragent
```

#### Step 2: Analyze the frontend request logs

![authz-troubleshoot-1.png](/.attachments/authz-troubleshoot-1-c2c1f59b-7c6d-4bac-9d4a-487c55bced3e.png)

Look at the `fe_request_stop` log entry. The `err_detail` field provides error information such as:

```bash
bearer token authentication challenge for realm "https://abacdemoacr.azurecr.io/oauth2/token": err_auth_insufficient_scope
```

This indicates the token had insufficient scope. Check the `auth_token_access` field to see the granted scope:

```bash
map[{Type:repository Name:hello-world}:{stringSet:map[]}]
```

An empty scope means the token received by the registry from the client has no permissions.

#### Step 3: Trace the token server request

Using the `jwtid` from Step 2 (e.g., `af84f5ff-1c19-48a5-a79d-01d926007260`), find the corresponding token server request, and query the detailed logs for a specific request using the correlationid.

``` sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationid == "<correlationid>"
    | project-reorder PreciseTimeStamp, correlationid, message, auth_token_access_granted, auth_token_access, http_request_host
```

#### Step 4: Compare requested vs. granted permissions*

![authz-troubleshoot-2.png](/.attachments/authz-troubleshoot-2-38f141dd-a62e-4a81-9790-9bbfc064441c.png)

- **`auth_token_access`**: Shows what scope the user requested (e.g., `repository:hello-world:pull`)
- **`auth_token_access_granted`**: Shows what scope was actually granted (e.g., `repository:hello-world:` - missing pull permission)

This comparison reveals which specific permissions are missing.

Below is an example of a successful request where the required access has been granted.

![authz-troubleshoot-3.png](/.attachments/authz-troubleshoot-3-e7ddc1e5-01ab-4e36-81d4-69dc9b9962ce.png)

## References

[ACR RBAC Public Doc](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-overview?tabs=registries-configured-with-rbac-registry-abac-repository-permissions)  
[ACR ABAC Public Doc](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-abac-repository-permissions?tabs=azure-portal)  
[ACR roles directory reference Public Doc](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-directory-reference?tabs=registries-configured-with-rbac-registry-abac-repository-permissions)

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>
