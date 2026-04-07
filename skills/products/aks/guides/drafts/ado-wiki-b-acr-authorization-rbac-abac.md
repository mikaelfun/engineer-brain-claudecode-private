---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/TSG/ACR Authorization RBAC-ABAC"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Authorization%20RBAC-ABAC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ACR Authorization - RBAC/ABAC

[[_TOC_]]

## Goals

Troubleshooting guide for the runtime AAD authorization checks that are performed using the new compliant data plane authorization service CheckAccess V2 (Remote PDP), RBAC, and ABAC.

## Non Goals

This is not a reference for questions like when & where complaint RBAC (Role-Based Access Control) or ABAC (Attribute-Based Access Control) are used. For detailed information about the authorization process in ACR, please refer to the [ABAC public documentation](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-abac-repository-permissions).

## Introduction

All authorization for AAD identities with compliant RBAC is handled by token server irrespective of where the request gets routed. Azure RBAC is an authorization system that helps manage who has access to Azure resources, what they can do with those resources, and what areas they have access to. Azure ABAC builds on Azure RBAC by adding role assignment conditions based on attributes in the context of specific actions.

In the token server, RBAC is handled by AzureRBACProvider.cs which uses different layers of cache to optimize the authorization checks. It writes a consolidated log entry with all details with the message name `rbac_request_log`. You can query the RBAC log for a request using the request's correlationId:

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "rbac_request_log"    
    | sort by PreciseTimeStamp asc
    | project-reorder PreciseTimeStamp, message, TenantId, http_request_host, Subscription, http_response_status, http_response_duration, rbac_response_source, rbac_cachekey, rbac_redis_duration, rbac_memorycache_count, err_detail
```

### RBAC log fields

| Log Field              | Description                                                                                                                                   |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| rbac_cachekey          | The cache key used for looking into the RBAC caches. Format: CheckAccessVersion:RegistryId:InputTokenId                                       |
| rbac_response_source   | Source from where the RBAC response is returned (local in-memory / Redis cache, or direct Azure RBAC API call)                               |
| rbac_redis_duration    | Duration in ms for Redis lookup (if Redis cache was accessed)                                                                                 |
| rbac_memorycache_count | Current count of the local in-memory cache                                                                                                    |
| rbac_abac              | Indicates whether the request uses ABAC                                                                                                       |
| TenantId               | Tenant Id of the subscription where the resource exists                                                                                       |
| Subscription           | Subscription Id of the resource                                                                                                               |
| http_request_host      | The registry login server being authenticated                                                                                                 |
| http_response_status   | The response status                                                                                                                           |
| http_response_duration | Response duration in ms of Azure RBAC API (if invoked)                                                                                       |
| err_detail             | Exception details if the request failed                                                                                                       |

Check whether ABAC (repo permission) feature is enabled:

```sql
RegistryMasterData
    | where RegistryName == "<registry name>"
    | summarize arg_max(PreciseTimeStamp, EnableRepoPermission)
```

### MSAL request log

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "msal_request_log"
    | sort by PreciseTimeStamp asc
    | project-reorder PreciseTimeStamp, message, http_response_status, http_response_duration, msal_token_source, msal_duration_total_ms, msal_duration_cache_ms, msal_duration_http_ms, err_detail
```

**When compliant RBAC is used** (may expand in future):
- Requests to token server for a registry belonging to a tenant with private endpoints enabled
- Requests with AAD tokens scoped to ACR audience `https://containerregistry.azure.net`
- Requests with AAD tokens scoped to ARM audience when UseCheckAccessForAuth feature flag is enabled (now enabled for all registries)

## Possible Troubleshooting scenarios

### 1. Token Server request fails with unexpected status code (>= 500)

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where http_request_host == "myregistry.azurecr.io"
    | where message == "ts_request_stop" or message == "fe_request_stop"
    | where http_response_status == 500
    | sort by PreciseTimeStamp asc
    | project PreciseTimeStamp, correlationId
```

Then check detailed logs and RBAC/MSAL exceptions:

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "rbac_request_log" or message == "msal_request_log"
    | project-reorder PreciseTimeStamp, message, http_response_status, err_detail
```

If error relates to CheckAccess API, see scenario 3. If exception indicates downtime/outage → create ICM.

### 2. Token server requests have long latency or time out

Get correlationId for slow request, then check RBAC/MSAL latency:

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "rbac_request_log" or message == "msal_request_log"
    | sort by PreciseTimeStamp asc
    | project-reorder PreciseTimeStamp, message, http_response_status, http_response_duration, err_detail
```

### 3. CheckAccess API request fails

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "checkAccess_api_stop"
    | project-reorder PreciseTimeStamp, correlationid, message, http_response_status, http_response_duration, err_detail, http_request_uri
```

If deeper investigation on CheckAccess is needed → escalate via ICM.

**Dashboards:**
- [CheckAccess Dashboard](https://portal.microsoftgeneva.com/dashboard/AzureContainerRegistry/Public/Dataplane/Features/Compliant-RBAC/CheckAccess)
- [ABAC Repo Permission Dashboard](https://portal.microsoftgeneva.com/dashboard/AzureContainerRegistry/Public/Dataplane/Features/Compliant-RBAC/ABAC%2520Repo%2520Permission)

### 4. Authorization Issues with Role Assignments (RBAC vs ABAC)

Check whether the registry uses ABAC repository permissions:

```sql
RegistryMasterData
| where env_time > ago(1d)
| where RegistryName == '<registry-arm-resource-name>' or LoginServerName == '<registryfqdn.azurecr.io>'
| project-reorder RegistryName, LoginServerName, EnableRepoPermission
```

- `EnableRepoPermission = True` → "RBAC Registry + ABAC Repository Permissions" (`roleAssignmentMode = AbacRepositoryPermissions`)
- `EnableRepoPermission = False` → "RBAC Registry Permissions only" (`roleAssignmentMode = LegacyRegistryPermissions`)

Consult [ACR role directory reference](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-directory-reference) for correct built-in roles per mode.

### 5. Troubleshooting Authorization Issues (Step-by-Step)

#### Customer Self-Diagnosis
Suggest customer run:
```bash
az acr check-health -n myregistry --repository myrepo
```
This shows which permissions they have (full / partial / none) to the specific repository.

#### Step 1: Get correlationId for the failed request

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(3h)
    | where http_request_host == "myregistry.azurecr.io"
    | where message == "fe_request_stop" or message == "ts_request_stop"
    | project-reorder PreciseTimeStamp, correlationid, jwtid, message, http_response_status, auth_token_access, err_detail, http_request_uri, err_code, err_message, http_request_useragent
```

#### Step 2: Analyze frontend request logs

Check `err_detail` — e.g. `bearer token authentication challenge ... err_auth_insufficient_scope`  
Check `auth_token_access` — empty scope means the token received by the registry has no permissions.

#### Step 3: Trace the token server request using jwtid

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationid == "<correlationid>"
    | project-reorder PreciseTimeStamp, correlationid, message, auth_token_access_granted, auth_token_access, http_request_host
```

#### Step 4: Compare requested vs. granted permissions

- **`auth_token_access`**: scope the user requested (e.g. `repository:hello-world:pull`)
- **`auth_token_access_granted`**: scope actually granted (e.g. `repository:hello-world:` — missing pull)

This reveals which specific permissions are missing, pointing to a role assignment gap.

## References

- [ACR RBAC Public Doc](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-overview)
- [ACR ABAC Public Doc](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-abac-repository-permissions)
- [ACR roles directory reference](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-directory-reference)

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>
