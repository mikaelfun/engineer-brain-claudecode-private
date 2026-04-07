# AAD Authorization Kusto Diagnostics (Mooncake)

> Source: entra-id-onenote-115 | Status: draft

## Cluster & Database

- Cluster: `msodsmooncake.chinanorth2.kusto.chinacloudapi.cn`
- Database: `MSODS`

## Step 1: Check Authorization Result

Query `IfxBECAuthorizationManager` to see if a principal (user or SP) was GRANTED or DENIED:

```kql
IfxBECAuthorizationManager
| where servicePrincipalObjectId == "<SP_OBJECT_ID>"
    // or: where userObjectId == "<USER_OBJECT_ID>"
| where env_time > datetime(YYYY-MM-DDThh:mm) and env_time < datetime(YYYY-MM-DDThh:mm)
| project env_time, internalCorrelationId, result, parameters, task, scopeClaim, userObjectId, servicePrincipalObjectId, isAppGrantedAccess
```

Key fields:
- `result`: GRANTED or DENIED
- `task`: The operation attempted (e.g., ListApplications, AddApplication)
- `scopeClaim`: The permission scope in the token
- `isAppGrantedAccess`: Whether app-level consent was granted

## Step 2: Correlate with Context Logs

Use `internalCorrelationId` from Step 1 to get detailed context:

```kql
IfxUlsEvents
| where internalCorrelationId == "<CORRELATION_ID>"
| where env_time > datetime(YYYY-MM-DDThh:mm) and env_time < datetime(YYYY-MM-DDThh:mm)
| project env_time, internalCorrelationId, internalOperationType, message
```

This reveals the actual permission carried in the AAD token and explains why the permission was denied or granted.
