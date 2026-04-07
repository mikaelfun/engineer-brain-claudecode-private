# VM JIT Access Troubleshooting Guide

> Source: OneNote - Mooncake POD Support Notebook / Microsoft Defender for Cloud / Defender for Servers / VM JIT Access

## Overview

JIT (Just-In-Time) VM Access manages NSG rules with prefix `SecurityCenter-JITRule`. Available via 3 interfaces:
1. **Azure Portal** (UI)
2. **PowerShell Cmdlet** (unofficial, open-sourced on GitHub) - can bypass portal issues
3. **REST API** (no public docs yet)

## PowerShell: Request JIT Access

```powershell
Connect-AzAccount -Environment AzureChinaCloud
Select-AzSubscription -SubscriptionID "<sub-id>"
$jit = Get-AzJitNetworkAccessPolicy -ResourceGroupName <RG>
$JitPolicyVm1 = (@{
  id="/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Compute/virtualMachines/<vm>"
  ports=(@{
    number=3389;
    endTimeUtc="2020-03-16T07:00:00.3658798Z";
    allowedSourceAddressPrefix=@("192.168.0.101")
  })
})
Start-AzJitNetworkAccessPolicy -ResourceId $jit.id -VirtualMachine @($JitPolicyVm1)
```

## Kusto Diagnostics

### Cluster: romelogsmc.kusto.chinacloudapi.cn

**JIT policy access requests (Database: RomeTelemetry):**
```kql
JitNetworkAccessIngestionTelemetry
| where subscriptionId == "<sub-id>"
```

**JIT policy configuration (Database: RomeTelemetry):**
```kql
JitPolicyIngestion
| where SubscriptionId == "<sub-id>"
| where ResourceGroup contains "<rg>"
```

### Enable/Request Access Not Working

**Step 1: Query failures (Database: Rome3Prod)**
```kql
cluster('romelogsmc').database('Rome3Prod').JitNetworkAccessBLEntryPointOE
| where env_time > ago(14d)
| where resultType == "Failure"
| where operationName !in ("PostNotifyAsync", "GetInternalSubscriptionRegisteredVirtualMachinesAsync", "GetSubscriptionPoliciesAsync")
| project env_time, operationName, RootOperationId, SubscriptionId, resultSignature, resultDescription, resultType
```

**Step 2: For async initiate requests (return 202), query RunStateOE:**
```kql
let since = ago(14d);
cluster('RomeLogsmc').database('Rome3Prod').RunStateOE
| where env_time > since
| where env_cloud_name == "Rome.R3.JitRP"
| where StateName == "JitRequestInitiateStateContext"
| extend RootOperationId = tolower(RootOperationId)
| join (
  cluster('RomeLogsmc').database('Rome3Prod').TraceEvent
  | where env_time > since
  | where env_cloud_name == "Rome.R3.JitRP"
  | where env_cloud_role == "JitBackgroundRole"
  | where traceLevel <= 2
  | extend RootOperationId = tolower(substring(env_cv, 2, 36))
) on RootOperationId
| project env_time, message, traceLevel, RootOperationId, SubscriptionId
| order by env_time asc
```

**Step 3: Drill into specific RootOperationId:**
```kql
TraceEvent
| where env_time > ago(14d)
| where env_cv has "<rootOperationId>"
| project env_time, env_seqNum, traceLevel, message, env_cv
| order by env_time asc, env_seqNum asc
```

### Recommended/Not Recommended Issues

```kql
cluster('romelogsmc').database('Rome3Prod').WafBLEntryPointOE
| where env_time > ago(40d)
| where operationName == "InternalEntryPointDiscoverTasks_JIT Network Access Tasks"
| where SubscriptionId == "<sub-id>"
| order by env_time asc
| project env_time, RootOperationId, resultType
```

### JIT Cleaner Tool (orphaned NSG rules)

```kql
cluster("romelogsmc").database("Rome3Prod").TraceEvent
| where env_time > ago(12d)
| where message has "JitNetworkAccessOrphanedRulesCleaner"
| project env_time, message, traceLevel, env_cloud_location
| order by env_time asc
```

## Key Notes
- Most issues occur at UI level - try REST/PowerShell as workaround
- JIT depends on external services (Network RP), errors may not be from JIT itself
- Access requests are **async** (HTTP 202), failures may not show in resultType
- JIT deprecated with Defender for Servers retirement in Mooncake (see defender-onenote-027)
