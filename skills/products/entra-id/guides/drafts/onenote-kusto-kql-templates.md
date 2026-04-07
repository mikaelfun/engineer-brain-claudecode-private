# Kusto KQL Query Templates for Mooncake Entra ID

## Clusters
| Service | Cluster |
|---|---|
| ESTS | estscnn2.chinanorth2.kusto.chinacloudapi.cn |
| MSODS | msodsmooncake.chinanorth2.kusto.chinacloudapi.cn |

## ESTS Sign-in Log Query
```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time > datetime(2024-09-27T02:30) and env_time < datetime(2024-09-27T03:10)
| where TenantId == "<tenant-id>"
| where UserPrincipalObjectID == "<user-object-id>"
//| where RequestId == "<request-id>"
//| where DeviceId == '<device-id>'
//| where CorrelationId == '<correlation-id>'
| project env_time, RequestId, TenantId, CorrelationId, DeviceId, IsInteractive,
          ApplicationDisplayName, ApplicationId, ResourceDisplayName, ResourceId,
          Result, ErrorCode, ErrorNo, ITData, OTData, UserPrincipalObjectID, ClientIp
| order by env_time asc
```

Reference: [Kusto EvoSTS TableDef](https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD/184178/Kusto-EvoSTS-TableDef)

## ESTS Diagnostic Trace
```kql
DiagnosticTracesIfx
| union database('ESTSPII').table('DiagnosticTracesSecureIfx')
| where CorrelationId == "<correlation-id>"
| where env_time > ago(3d)
| project env_time, Message, Exception
```

## MSODS Audit Log (Single Entry)
```kql
IfxAuditLoggingCommon
| where internalCorrelationId == "<Correlation ID from Audit Log>"
| where env_time > ago(1h)
| project env_time, operationName, resultType, internalCorrelationId, contextId,
          actorContextId, actorObjectId, targetObjectId
```

Reference: [Kusto MSODS Queries](https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD/184179/Kusto-MSODS-Queries)

## MSODS Detailed Log
```kql
IfxUlsEvents
| where internalCorrelationId == "<Correlation ID from Audit Log>"
| where env_time > ago(1h)
| project env_time, loggingLevel, message
```

## MSODS DPX Search
```kql
IfxDPXSearchMetrics
| where env_time > datetime(5/27/2022 12:48 PM) - 5m and env_time < datetime(5/27/2022 12:48 PM) + 5m
| where correlationId == "<correlation-id>"
| project internalCorrelationId
```

Then use internalCorrelationId to query detailed ULS events with env_cloud_role == "directoryproxy".

## Access Methods
- **Web**: Azure Data Explorer (dataexplorer.azure.com)
- **Desktop**: Kusto.Explorer (requires CME smartcard, AAD Authentication)
- **Lens**: lens.msftcloudes.com
- **SAW**: Desktop client via SAW machine

## Notes
- CME now covers permissions automatically
- MSODS logs split into multiple namespaces since 2020/4/20

## Source
- OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > General Tools > Kusto query example
