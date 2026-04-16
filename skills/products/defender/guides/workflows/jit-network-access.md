# Defender JIT 网络访问 — 排查工作流

**来源草稿**: ado-wiki-a-jit-product-knowledge.md, ado-wiki-a-jit-troubleshooting-guide.md, onenote-vm-jit-access-tsg.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: JIT (Just In Time) VM Access - Product Knowledge
> 来源: ado-wiki-a-jit-product-knowledge.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Create a new Policy definition
2. Add policy rule that denies NSG security rules with priority 100, inbound allow, and source `*`/`Internet`/`0.0.0.0/0`/`ANY`
3. Assign the policy to the target scope
4. ARM VM (classic not supported)
5. NIC with NSG attached (directly or via subnet)
6. OS must be Linux or Windows
7. Not already JIT configured

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('romelogs.kusto.windows.net').database("Rome3Prod").FabricTraceEvent
| where env_time > ago(12d)
| where message contains "{subscriptionId}"
| where message has "JitNetworkAccessOrphanedRulesCleaner"
| project env_time, message, traceLevel, env_cloud_location
| order by env_time asc
```

---

## Scenario 2: JIT (Just In Time) VM Access - Troubleshooting Guide
> 来源: ado-wiki-a-jit-troubleshooting-guide.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Navigate to Activity Log
2. Remove filters, set correct time frame
3. Filter by operation "Create or update jit"
4. Check JSON properties to identify the user

### Portal 导航路径
- Activity Log

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('romelogs.kusto.windows.net').database("RomeTelemetry").JitPolicyIngestion
| where SubscriptionId == "{subscriptionId}"
| where UploadTime > ago(14d)
| extend JITPolicy = todynamic(VirtualMachinesConfigurations)
| sort by UploadTime desc
| project-away VirtualMachinesConfigurations
```

**查询 2:**
```kusto
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

**查询 3:**
```kusto
cluster('romelogs').database('Rome3Prod').FabricServiceOE
| where env_time > ago(7d)
| where applicationName == "fabric:/JitApp"
| extend Data = todynamic(customData)
| extend SubscriptionId = tostring(Data.SubscriptionId)
| where SubscriptionId == "{subscriptionId}"
| where operationName !in ("PostNotifyAsync", "GetInternalSubscriptionRegisteredVirtualMachinesAsync", "GetSubscriptionPoliciesAsync")
| project env_time, operationName, rootOperationId, SubscriptionId, resultSignature, resultDescription, resultType
```

**查询 4:**
```kusto
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

---

## Scenario 3: VM JIT Access Troubleshooting Guide
> 来源: onenote-vm-jit-access-tsg.md | 适用: Mooncake ✅

### 排查步骤
1. **Azure Portal** (UI)
2. **PowerShell Cmdlet** (unofficial, open-sourced on GitHub) - can bypass portal issues
3. **REST API** (no public docs yet)

### Kusto 诊断查询
**查询 1:**
```kusto
JitNetworkAccessIngestionTelemetry
| where subscriptionId == "<sub-id>"
```

**查询 2:**
```kusto
JitPolicyIngestion
| where SubscriptionId == "<sub-id>"
| where ResourceGroup contains "<rg>"
```

**查询 3:**
```kusto
cluster('romelogsmc').database('Rome3Prod').JitNetworkAccessBLEntryPointOE
| where env_time > ago(14d)
| where resultType == "Failure"
| where operationName !in ("PostNotifyAsync", "GetInternalSubscriptionRegisteredVirtualMachinesAsync", "GetSubscriptionPoliciesAsync")
| project env_time, operationName, RootOperationId, SubscriptionId, resultSignature, resultDescription, resultType
```

**查询 4:**
```kusto
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

**查询 5:**
```kusto
TraceEvent
| where env_time > ago(14d)
| where env_cv has "<rootOperationId>"
| project env_time, env_seqNum, traceLevel, message, env_cv
| order by env_time asc, env_seqNum asc
```

### 脚本命令
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

---
