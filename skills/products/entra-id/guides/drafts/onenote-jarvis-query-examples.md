# Jarvis Query Examples for Mooncake Entra ID

## EvoSTS (Authentication)

### Authentication Request Logs
- Endpoint: CA Mooncake
- Namespace: AadEvoSTSCHINA
- Table: PerRequestTableIfx

```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time > datetime(2024-09-27T02:30) and env_time < datetime(2024-09-27T03:10)
| where TenantId == "<tenant-id>"
| where UserPrincipalObjectID == "<user-object-id>"
| project env_time, RequestId, TenantId, CorrelationId, DeviceId, IsInteractive, ApplicationDisplayName, ApplicationId, ResourceDisplayName, ResourceId, Result, ErrorCode, ErrorNo, ITData, OTData, UserPrincipalObjectID, ClientIp
| order by env_time asc
```

**Key filters**: RequestId, CorrelationId, DeviceId, UserAuth==True

### Token Data Fields
- **ITData**: Input data (refresh token, password)
- **OTData**: Output data (access token, ID token, refresh token)
- Access token starts **5 minutes before** authentication time
- Refresh token valid for **14 days**, renewed up to **90 days** from auth time

### Diagnostic Traces
```kql
DiagnosticTracesIfx
| union database('ESTSPII').table('DiagnosticTracesSecureIfx')
| where CorrelationId == "<correlation-id>"
| where env_time > ago(3d)
| project env_time, Message, Exception
```

## MSODS (Directory)

> **Important**: Since 2020/4/20, logs in msodsgallatin are split into different namespaces. Select ALL namespaces starting with `msods`.

### AAD Audit Logs
- Namespace: msods* (all)
- Table: IfxAuditLoggingCommon (filter: auditLibrary=="AzureAudit")

```kql
IfxAuditLoggingCommon
| where internalCorrelationId == "<correlation-id>"
| where env_time > ago(1h)
| project env_time, operationName, resultType, internalCorrelationId, contextId, actorContextId, actorObjectId, targetObjectId
```

### Detailed Logs
```kql
IfxUlsEvents
| where internalCorrelationId == "<correlation-id>"
| where env_time > ago(1h)
| project env_time, loggingLevel, message
```

### REST API Operation Context
- Kusto DB: msodsmooncake.chinanorth2
- Table: IfxUlsEvent
```kql
IfxUlsEvents | where * contains "<objectid>" | project env_time, message
```

### DPX Search Metrics
```kql
IfxDPXSearchMetrics
| where env_time > datetime(...) - 5m and env_time < datetime(...) + 5m
| where correlationId == "<correlation-id>"
| project internalCorrelationId
```

## Other Namespaces/Tables
| Service | Namespace | Tables |
|---|---|---|
| AAD DS | dcaasmcfleetprod | AccountLockoutEvents, AccountLogonEvents, SecurityEvents |
| IAMUX (My* portal) | IAMK8sMC | RequestEvent, DiagnosticEvent |

## Source
- OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > General Tools > Jarvis query example
