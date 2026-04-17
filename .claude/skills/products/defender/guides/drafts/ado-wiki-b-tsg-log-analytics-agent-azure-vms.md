---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Archive/Microsoft Monitoring Agent (MMA)/[TSG] - Log Analytics agent for Azure VMs"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FArchive%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%2F%5BTSG%5D%20-%20Log%20Analytics%20agent%20for%20Azure%20VMs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

> ⚠️ **Deprecation Note:** The MMA/Log Analytics agent is **retired as of August 2024**. AMA agent deprecated Sep 1, 2024 (except SQL on Machine plan). MMA features deprecated end of Nov 2024 with extended support for MDC.

# Log Analytics Agent (MMA) TSG for Azure VMs

## Availability

| Aspect | Azure VMs | Azure Arc-enabled machines |
|---|---|---|
| Defender plan | Defender for Servers / SQL | Defender for Servers / SQL |
| Required roles | Contributor or Security Admin | Owner |
| Policy-based | No | Yes |
| Clouds | Commercial + Azure Government + **Azure China 21Vianet** | Commercial only |

## Common Scenarios

### How to Store Windows Security Events
Security Events are collected at workspace level. Four collection tiers:
1. All Events
2. Common Events
3. Minimal Events
4. None

### How to Determine the Data Tier Used by the Customer
```kusto
SecurityEvent
| project EventID
| extend DataTier = case(
    EventID in (1102,4624,4625,4657,4663,4688,4700,4702,4719,4720,4722,4723,4724,4727,4728,4732,4735,4737,4739,4740,4754,4755,4756,4767,4799,4825,4946,4948,4956,5024,5033,8001,8002,8003,8004,8005,8006,8007,8222), "Minimal",
    EventID in (1,299,300,324,340,403,404,410,411,412,413,431,500,501,1100,1102,1107,1108,4608,4610,4611,4614,4622,4624,4625,4634,4647,4648,4649,4657,4661,4662,4663,4665,4666,4667,4688,4670,4672,4673,4674,4675,4689,4697,4700,4702,4704,4705,4716,4717,4718,4719,4720,4722,4723,4724,4725,4726,4727,4728,4729,4733,4732,4735,4737,4738,4739,4740,4742,4744,4745,4746,4750,4751,4752,4754,4755,4756,4757,4760,4761,4762,4764,4767,4768,4771,4774,4778,4779,4781,4793,4797,4798,4799,4800,4801,4802,4803,4825,4826,4870,4886,4887,4888,4893,4898,4902,4904,4905,4907,4931,4932,4933,4946,4948,4956,4985,5024,5033,5059,5136,5137,5140,5145,5632,6144,6145,6272,6273,6278,6416,6423,6424,8001,8002,8003,8004,8005,8006,8007,8222,26401,30004), "Common",
    "Non-Common-Non-Minimal")
| summarize count(EventID) by DataTier
| union (SecurityEvent | project EventID | extend DataTier = "All" | summarize count(EventID) by DataTier)
```

### How to Determine MDC Data Ingestion (Billing Issues)
```kusto
Usage
| where TimeGenerated > ago(32d)
| where StartTime >= startofday(ago(31d)) and EndTime < startofday(now())
| where IsBillable == true
| summarize BillableDataGB = sum(Quantity) / 1000 by Solution, DataType
| sort by Solution asc, DataType asc
```

If SecurityEvents are the source, find the high-volume resource:
```kusto
SecurityEvent
| summarize countofEvents = count() by EventID, Computer
| sort by countofEvents desc
```

## Common Issues

### Auto Provisioning Enabled but VMs Not Automatically Onboarded
**Root Cause:** Customer selected "New VMs only" instead of "Existing and new VMs" during auto provisioning setup.

**Fix:**
1. Set auto provisioning to "Connect Azure VMs to the default workspace(s) created by Defender for Cloud" → Apply and Save
2. Reconfigure to desired workspace → popup appears for scope selection
3. Select **"Existing and new VMs"**

### How to Exclude Specific Resources/RGs from Auto Provisioning
Auto provisioning for VMs does not support exclusions natively. Workaround:
- Disable auto provisioning
- Create Deploy If Not Exist policies manually for specific VMs/groups

### Unable to Collect Security Events (Tier Options Grayed Out)
**Root Cause:** Azure Sentinel "Security Events via Legacy Agent" data connector is already configured for the workspace — Security Events tier is controlled by Sentinel.

**Fix:** Change the tier in **Azure Sentinel** data connector settings; changes propagate to MDC automatically.

## Checking Agent Status (Azure VM)
1. Go to Log Analytics workspace → Computer data sources → Virtual Machines
2. Find the machine and check status:
   - **Connected** → OK
   - **Another workspace** → Machine connected to different workspace
   - **Not connected** → No agent installed
   - **Error** → Agent error

## MMA PowerShell Operations

### Add a Workspace
```powershell
$workspaceId = "<Your workspace Id>"
$workspaceKey = "<Your workspace Key>"
$mma = New-Object -ComObject 'AgentConfigManager.MgmtSvcCfg'
$mma.AddCloudWorkspace($workspaceId, $workspaceKey)
$mma.ReloadConfiguration()
```

### Remove a Workspace
```powershell
$workspaceId = "<Your workspace Id>"
$mma = New-Object -ComObject 'AgentConfigManager.MgmtSvcCfg'
$mma.RemoveCloudWorkspace($workspaceId)
$mma.ReloadConfiguration()
```

## Networking Troubleshooting
- Ensure machine can communicate on **port 443**
- Windows connectivity test:
  ```
  cd 'C:\Program Files\Microsoft Monitoring Agent\Agent'
  TestCloudConnection.exe
  ```

## GetAgentInfo.ps1 Data Collection
Script location: `C:\Program Files\Microsoft Monitoring Agent\Agent\GetAgentInfo.ps1`

Scenarios:
1. Agent not reporting data or heartbeat missing
2. Agent extension deployment failing
3. Agent crashing
4. Agent consuming high CPU/memory
5. Installation/uninstallation failures
6. Custom logs issue
7. OMS Gateway issue
8. Performance counters issue
