---
source: onenote
sourceRef: "MCVKB/Intune/Kusto/Kusto -21v.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune 21V (Mooncake) Kusto Access Guide

## Prerequisites

1. Request **IntuneKusto-CSSMoncake** permission via MyAccess:
   https://coreidentity.microsoft.com/manage/Entitlement/entitlement/intunekustoc-ftdh

2. A smart card (physical or virtual) is required for Mooncake Kusto connection.

3. Use **REDMOND credentials** (not CME).

## Connection Settings

| Setting | Value |
|---------|-------|
| Data Source | `https://intunecn.chinanorth2.kusto.chinacloudapi.cn` |
| Connection Alias | `Intunecn` |
| Client Security | `dSTS-Federated` |

Close and reopen Kusto Explorer after permission grant to refresh.

Reference: https://www.intunewiki.com/wiki/Enable_Kusto_in_Mooncake

## Sample Query: Policy Deployment Status (21V)

```kql
// Count overall deployment status for a specific policy
DeviceManagementProvider  
| where env_time >= ago(7h)
| where EventId == 5786
| project PreciseTimeStamp, ActivityId, PolicyName=name, PolicyType=typeAndCategory,
          Applicability=applicablilityState, Compliance=reportComplianceState,
          deviceId=ActivityId, PolicyID=['id'] 
| where PolicyID in ("AC_{accountId}/LogicalName_{policyId}/1")
| where Applicability=="Applicable"
| summarize Success=(count(Compliance=="Compliant")>0),
            Pending=(count(Compliance=="Compliant")==0),
            Error=(count(Compliance=="Error")>0) by ActivityId, PolicyName, PolicyType
| summarize SuccessCount=sum(Success), PendingCount=sum(Pending),
            ErrorCount=sum(Error) by PolicyName, PolicyType
| order by PolicyName desc
```

**How to get PolicyID**: `AC_{accountId}/LogicalName_{policyId}/number`

You can also retrieve PolicyID from device logs:
```kql
DeviceManagementProvider 
| where env_time > ago(10d) 
| where ActivityId == "{deviceId}"
| project env_time, userId, accountId, DeviceID=ActivityId, PolicyName=name,
          PolicyType=typeAndCategory, Applicability=applicablilityState,
          Compliance=reportComplianceState, TaskName, EventId, EventMessage, message 
| order by env_time asc
```
