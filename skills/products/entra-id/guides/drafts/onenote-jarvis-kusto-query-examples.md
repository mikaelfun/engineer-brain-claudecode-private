# Jarvis & Kusto Query Examples for Mooncake Entra ID

## Overview
Reference guide for Jarvis and Kusto queries used in Mooncake Entra ID troubleshooting. Covers EvoSTS sign-in logs, MSODS audit logs, diagnostic traces, and more.

## EvoSTS (Sign-in Logs)

### Cluster
- Kusto: `estscnn2.chinanorth2.kusto.chinacloudapi.cn` / Database: `ESTS`

### Authentication Request Logs (PerRequestTableIfx)
```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time > datetime(2024-09-27T02:30) and env_time < datetime(2024-09-27T03:10)
| where TenantId == "<tenant-id>"
| where UserPrincipalObjectID == "<user-object-id>"
//| where RequestId == "<request-id>"
//| where DeviceId == '<device-id>'
//| where CorrelationId == '<correlation-id>'
| project env_time, RequestId, TenantId, CorrelationId, DeviceId, IsInteractive, ApplicationDisplayName, ApplicationId, ResourceDisplayName, ResourceId, Result, ErrorCode, ErrorNo, ITData, OTData, UserPrincipalObjectID, ClientIp
| order by env_time asc
```

### Key Fields
- **UserAuth == True**: Filter for user authentication (vs service-to-service)
- **ITData**: Input token data (refresh token, password info)
- **OTData**: Output token data (access token, ID token, refresh token)

### Token Lifetime Notes
- Access token valid time starts **5 minutes before** authentication
- Refresh token valid for **14 days**; if used within 14 days, new RT issued until **90 days** after auth time

### Diagnostic Traces
```kql
DiagnosticTracesIfx
| union database('ESTSPII').table('DiagnosticTracesSecureIfx')
| where CorrelationId == "<correlation-id>"
| where env_time > ago(3d)
| project env_time, Message, Exception
```

## MSODS (Directory Audit Logs)

### Cluster
- Kusto: `msodsmooncake.chinanorth2.kusto.chinacloudapi.cn` / Database: `MSODS`

> **Note**: Since 2020/4/20, logs are split into multiple namespaces starting with `msods`. Select all of them.

### Audit Log Query
```kql
IfxAuditLoggingCommon
| where internalCorrelationId == "<correlation-id>"
| where env_time > ago(1h)
| project env_time, operationName, resultType, internalCorrelationId, contextId, actorContextId, actorObjectId, targetObjectId
```
- **TargetObjectID**: Object that was changed
- **actorObjectId**: Object that made the change

### Detailed Audit Log
```kql
IfxUlsEvents
| where internalCorrelationId == "<correlation-id>"
| where env_time > ago(1h)
| project env_time, loggingLevel, message
```

### REST API Operation Context
- Namespace/DB: `msodsmooncake.chinanorth2`
- Table: `IfxUlsEvent`
```kql
IfxUlsEvents | where * contains "<objectid>" | project env_time, message
```

### DPX Search
```kql
IfxDPXSearchMetrics
| where env_time > datetime(<time>) - 5m and env_time < datetime(<time>) + 5m
| where correlationId == "<correlation-id>"
| project internalCorrelationId
```

## Other Namespaces

| Service | Namespace | Tables |
|---|---|---|
| AAD DS | dcaasmcfleetprod | AccountLockoutEvents, AccountLogonEvents, SecurityEvents |
| IAMUX (My* portal) | IAMK8sMC | RequestEvent (requests), DiagnosticEvent (details) |

## Jarvis Access
- Endpoint: CA Mooncake
- EvoSTS Namespace: AadEvoSTSCHINA
- MSODS Namespace: msodsfe (and all msods* namespaces)

## Source
OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > General Tools > Jarvis query example + Kusto query example
