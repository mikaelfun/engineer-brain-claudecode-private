---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/Outbound provisioning/Troubleshooting Identity Provisioning issues/Performance Issues - Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FOutbound%20provisioning%2FTroubleshooting%20Identity%20Provisioning%20issues%2FPerformance%20Issues%20-%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AAD Sync Fabric Performance Issues - Troubleshooting

## Overview

This guide covers factors causing performance issues in AAD Sync Fabric, identification of runProfile performance problems, troubleshooting/mitigation, and configuration considerations.

## Primary Performance Factors

1. **Tenant size** (# of objects) - larger tenants = more objects returned by Graph API queries
2. **Churn rate** (# changes/period) - Differential Query returns ALL changed objects regardless of attribute
3. **Sync scope** - "Sync all" vs "Sync assigned users/groups" impacts volume
4. **Target API rate limits** - 429 Too Many Requests causes escrow buildup
5. **Target app response time** - Slow target responses increase sync duration
6. **Application restarts** - Frequent restarts trigger initial cycles, creating backlogs
7. **Cycle completion status** - Incomplete cycles accumulate work

## Sync Scope Considerations

- **< 30% users in scope** -> Use "Sync Assigned Users/Groups"
- **> 30% users in scope** -> Usually "Sync All Users/Groups"
- When using assigned groups: break large groups (>10K members) into smaller groups

## Mitigation

- Simple gap: clear state/restart from portal (but **NOT multiple restarts** in a row)
- **WARNING**: If app provisions group objects, clear state/restart is risky - removed group members may be orphaned in target system because engine only knows "after" state
- For group provisioning scenarios: "wait it out" to ensure membership removal integrity

## Key Kusto Queries

### Admin Actions (restarts/changes)

```kusto
let runProfileId = "jobId/runprofileId";
GlobalIfxAuditEvent
| where env_time > ago(1d)
        and runProfileIdentifier == runProfileId
        and eventName contains "admin"
| project env_time, correlationId, sourceAnchor, targetAnchor, reportableIdentifier, eventName, description, details
| order by env_time asc
```

### Sync Cycle Progress (Lock + Watermark + RunProfileStatistics)

```kusto
let period = 2d;
let startTime = now() - period;
let endTime = startTime + period;
GlobalIfxUsageEvent
| where env_time between (startTime..endTime)
| where internalCorrelationId has "runprofileID"
| where (usageType == "Lock" and env_cloud_role == "SynchronizationWorker" and message contains "result: True") or usageType == "Watermark" or (usageType == "RunProfileStatistics" and message !has "Executing" and message !has "NotRun" and (message !has "## SPLIT " or message has "#1 of "))
| parse internalCorrelationId with * "Synchronization job identifier: " runProfileIdentifier "Schedule" *
| project env_time, runProfileIdentifier, correlationId, env_seqNum, env_cloud_deploymentUnit, usageType, message, contextId
| order by env_time asc
```

**Key field**: `Most-recent steady state time` = 0001-01-01 means cycle has not finished (performance issue confirmed)

### Sync Progress Chart (Read/Write Gap)

```kusto
GlobalIfxRunProfileStatisticsEvent
| where env_time > ago(3d)
| where runProfileIdentifier contains "JobID/runprofileId"
| project env_time, Gap = ((countUnitsIngested - countUnitsDigested)*50), ReadCursor = (countUnitsIngested*50), WriteCursor = (countUnitsDigested*50)
| summarize max(Gap), max(ReadCursor), max(WriteCursor) by env_time
| render timechart
```

- **ReadCursor**: Total objects ingested (total work)
- **WriteCursor**: Objects digested (work done)
- **Gap**: Remaining work. Gap=0 means steady state.

### Round Trip Time (RTT) Analysis

Use RTT query to compare response times between gallery vs BYOA SCIM apps. High RTT indicates target system performance issue.

## 429 Error Handling

- Escrow + exponential backoff for 429'd requests
- >5000 escrows -> quarantine evaluation
- Gallery apps: file IcM for PG to adjust outbound rate
- BYOA SCIM: customer must adjust target system's rate limit
