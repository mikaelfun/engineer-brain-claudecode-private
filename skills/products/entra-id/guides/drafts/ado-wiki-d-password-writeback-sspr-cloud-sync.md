---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Cloud Sync/Passsword Management/Password Writeback/Password Writeback and SSPR with Cloud Sync"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FCloud%20Sync%2FPasssword%20Management%2FPassword%20Writeback%2FPassword%20Writeback%20and%20SSPR%20with%20Cloud%20Sync"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Password Writeback and SSPR with Cloud Sync

## Prerequisites Check

1. Check Cloud Sync Agent version - requires agent build 1.1.977.0 or greater
   - Common failure causes:
     - TLS 1.2 is not enabled
     - TLS 1.3 is enabled but only works on Windows Server 2022 with .NET 4.8+
2. Verify Object Sync and Password Hash Sync configuration completed successfully
3. Check on-premises integration under SSPR (Password Management) blade - check should be green

## Password Writeback Flow

When password writeback is configured but not syncing back to on-premises, determine at which point the flow fails:
- SSPR Service → HIS Proxy Client → Cloud Sync Agent → On-premises AD

### Coexistence with Entra Connect

- PWD WriteBack Policy can coexist with both Entra Connect and CloudSync
- SSPR resets through CloudSync if domain is configured; falls back to Entra Connect otherwise
- Only Entra Connect flag ON → SSPR through AADConnect
- Only CloudSync flag ON → SSPR checks domain config; runtime error if not configured

### Determining Writeback Agent

Check Audit Logs > Reset Password > Additional Details:
- `OnPremisesAgent` field shows "CloudSync" when Cloud Sync handled the writeback

### Retry Logic and Timeout

| Service/Role | Milliseconds | Seconds |
|---|---|---|
| HISProxyClientSettingsMaxTotalLatencyMs | 90000 | 90s |
| HISProxyClientSettingsMinAttemptLatencyMs | 9000 | 9s |
| HISProxyClientSettingsMaxAttemptLatencyMs | 45000 | 45s |
| HISProxyClientSettingsInducedLatencyBufferMs | 300 | 0.3s |

## Log Collection

### Audit Logs
- Check SSPR audit events in Entra Portal or ASC
- Save: timestamp, correlation ID, sample user

### SSPR Diagnostic Trace Events (Kusto)
Clusters by region:
- **AMER**: idsharedwus.westus
- **EMEA**: idsharedneu.northeurope
- **Japan**: idsharedjpn.japaneast

Database: `aadssprprod`

Sample queries:
```kql
IfxTraceEvent
| where env_time >= ago(1h)
| where correlationId == "xxxxxx"
| project env_time, env_seqNum, traceEnumCode, message
```

```kql
IfxTraceEvent
| where env_time >= ago(5d)
| where contextId == "<TenantID>"
| where * contains "<ObjectID>"
| project env_time, env_seqNum, traceEnumCode, correlationId, message, exceptionText, loggingLevel, operationName
| order by env_time
```

### Agent Verbose Trace Logs
Enable via: AADCloudSyncTools > Export-AADCloudSyncToolsLogs

## Step-by-Step Troubleshooting

1. Ask customer to do SSPR from https://passwordreset.microsoftonline.com
2. Collect correlation ID from the bottom of the page
3. Query SSPR Kusto tables with correlation ID
4. In results check:
   - Domain the user belongs to and publishedResource
   - Confirm Password Writeback configured for Cloud Sync
   - Confirm Cloud Sync used as writeback agent
   - If domain not configured for Cloud Sync, look for: `UsingAADConnectAgentForOnPremisesOperations`
   - Check for error messages with event IDs

## Error Code Analysis
Cloud Sync error codes are mostly identical to AADConnect errors. If unclear from SSPR tables and verbose logs, post to Microsoft Entra Cloud Sync Teams channel.
