---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Just In Time (JIT)/[Troubleshooting Guide] - Just In Time (JIT)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Servers%2FJust%20In%20Time%20(JIT)%2F%5BTroubleshooting%20Guide%5D%20-%20Just%20In%20Time%20(JIT)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# JIT (Just In Time) VM Access - Troubleshooting Guide

## Support Boundaries

- **JIT Connect Experience** (VM portal Connect blade): Escalate CRIs to **Azure Portal IaaS Experiences/Triage** team
- **JIT blade** (Defender for Cloud workload protection): Owned by MDC team
- If JIT blade works but Connect blade doesn't → issue is Compute, not MDC

## Dashboard

- [Defender for Cloud - Defender for Servers - Workload Protection](https://dataexplorer.azure.com/dashboards/348a3fbe-664a-45cf-b808-c078148133a4)

## Investigation Steps

### Find Who Enabled JIT
1. Navigate to Activity Log
2. Remove filters, set correct time frame
3. Filter by operation "Create or update jit"
4. Check JSON properties to identify the user

### Get JIT Policy for Subscription
```kql
cluster('romelogs.kusto.windows.net').database("RomeTelemetry").JitPolicyIngestion
| where SubscriptionId == "{subscriptionId}"
| where UploadTime > ago(14d)
| extend JITPolicy = todynamic(VirtualMachinesConfigurations)
| sort by UploadTime desc
| project-away VirtualMachinesConfigurations
```
- Append `| where JITPolicy contains "{vmName}"` to search specific VM

### Get JIT Access Requests
```kql
cluster('romelogs.kusto.windows.net').database("RomeTelemetry").JitNetworkAccessIngestionTelemetry
| where subscriptionId == "{subscriptionId}"
| where telemetryType == "JitNetworkAccessPolicyInitiated"
| where TIMESTAMP > ago(30d)
| sort by TIMESTAMP desc
| extend DataArr = parse_json(['data'])
| extend Request = DataArr.request
| extend VMName = split((DataArr.request.VirtualMachines.[0].Id), "/")[-1]
| extend Ports = Request.VirtualMachines.[0].Ports.[0].Number
| extend Status = Request.VirtualMachines.[0].Ports.[0].Status
| extend StatusReason = Request.VirtualMachines.[0].Ports.[0].StatusReason
| project TIMESTAMP, telemetryType, VMName, Ports, Status, StatusReason
```

**Status/StatusReason dictionary:**
- **RevokeReasons**: 0=UserManuallyRevoked, 1=Expired
- **InitiateReasons**: 2=UserRequested
- **FailureReasons**: 0=VMNotFound, 1=MissingNSGs, 2=MissingJitResources, 3=NSGRulesQuotaReached, 4=RGBeingDeleted, 5=ScopeLocked, 6=SubscriptionReadOnly, 7=DisallowedByPolicy, 8=RateLimitReached, 9=IntentPolicyConflict, 10=CreateOrUpdateGeneralError, 11=GeneralError, 12=InvalidFirewallResource

### FabricServiceOE Investigation
```kql
cluster('romelogs').database('Rome3Prod').FabricServiceOE
| where env_time > ago(7d)
| where applicationName == "fabric:/JitApp"
| extend Data = todynamic(customData)
| extend SubscriptionId = tostring(Data.SubscriptionId)
| where SubscriptionId == "{subscriptionId}"
| where operationName !in ("PostNotifyAsync", "GetInternalSubscriptionRegisteredVirtualMachinesAsync", "GetSubscriptionPoliciesAsync")
| project env_time, operationName, rootOperationId, SubscriptionId, resultSignature, resultDescription, resultType
```

**Deep investigation (initiate failures):**
```kql
let since = ago(2d);
cluster('RomeLogs').database('Rome3Prod').FabricServiceOE
| where env_time > since
| where applicationName == "fabric:/JitApp"
| extend Data = todynamic(customData)
| extend SubscriptionId = tostring(Data.SubscriptionId)
| where SubscriptionId == "{subscriptionId}"
| where Data.StateName == "JitRequestInitiateStateContext"
| extend RootOperationId = tolower(rootOperationId)
| join (cluster('RomeLogs').database('Rome3Prod').FabricTraceEvent
    | where env_time > since
    | where applicationName == "fabric:/JitApp"
    | where serviceTypeName == "JitBackgroundServiceType"
    | where traceLevel <= 2
    | extend RootOperationId = tolower(substring(env_cv, 2, 36))
) on RootOperationId
| project env_time, message, traceLevel, RootOperationId, SubscriptionId
| order by env_time asc
```

## Known Issues

### 1. 'default' Contains Non-existent Virtual Machines
**Symptom:** Error "Just-In-Time Network Access Policy: 'default' contains non-existent virtual machines"
**Solution:** GET existing policy → remove bad VM section → PUT modified body → verify

### 2. Region Not Supported (NoRegisteredProviderFound)
**Symptom:** Error `NoRegisteredProviderFound` for `jitNetworkAccessPolicies` in a new region
**Cause:** Region not in JIT ARM manifest
**Solution:** Add region to Rome-Arm-Manifest repo (8 blocks in Prod + Canary), submit PR, deploy via pipelines
**Quick mitigation:** Create NSG rules manually

### 3. JIT Entry Removal Blocked by Resource Lock
**Symptom:** JIT entry won't delete; no error in JIT blade but lock error on NSG removal
**Solution:** Remove the delete lock on the resource/resource group
