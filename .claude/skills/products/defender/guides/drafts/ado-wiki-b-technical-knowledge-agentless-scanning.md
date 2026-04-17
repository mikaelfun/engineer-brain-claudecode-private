---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/Agentless scanning VM VA/[Technical Knowledge] - Agentless scanning"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Servers%2FVulnerability%20Assessment%2FAgentless%20scanning%20VM%20VA%2F%5BTechnical%20Knowledge%5D%20-%20Agentless%20scanning"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [Technical Knowledge] - Agentless Scanning

## Interaction with Other VA Solutions

### VA Pipeline Architecture

Data Sources: MDE Agent, Agentless Scanner, Qualys Agent
-> Data Analysis: MDVM (for MDE+Agentless), Qualys Cloud (for Qualys)
-> DefenderForCloud: Rome 3

**Key Points:**

1. **MDVM Pipeline**: Single pipeline for vulnerability calculations, integrating MDE agent and agentless scanner data.
2. **Licensing**: Both MDVM and agentless scanning require MDE license. Customers must enable CSPM plan (agentless) or Defender for Servers (P1/P2).
3. **Data Injection**: Agentless findings injected into MDE workspace. Without enabling plans, findings are filtered out.
4. **UI Integration**: MDC UI links to MDE portal because agentless and MDE-agent data are published identically.
5. **Supported OS**: Machines must run [supported operating systems](https://learn.microsoft.com/en-us/microsoft-365/security/defender-vulnerability-management/tvm-supported-os).
6. **Recommendation Logic**: If a VM receives agentless VA recommendations -> Healthy. No VA coverage -> Unhealthy.

### Decision Criteria for Findings Display

Prioritization logic:
- Valid & reporting provider prioritized over non-reporting one.
- If both providers report, explicitly chosen provider is prioritized.

## Agentless Scanning Steps

Processing pipeline (in reverse order):
1. **GetNdrTenantInfoAsync** (Step 1): Obtains VM/tenant/subscription info.
2. **DownloadVmScanResultBlobAsync** (Step 2): Retrieves VM scan results.
3. **ConvertBlobContentToNdrEventsAsync** (Step 3): Processes events.
4. **SendEventToNdrAsync** (Step 4): Sends data to MDE.
5. **CompletedSuccessfully** (Step 5): Validates success.

### Checking Process Query

```kusto
cluster("Romelogs").database("Rome3Prod").FabricServiceOE
| where applicationName endswith "vaApp"
| where operationName endswith "RunState"
| extend Data = todynamic(customData)
| extend StateName = tostring(Data.StateName)
| extend StepId = tostring(Data.StepId)
| extend StateRunResult = tostring(Data.StateRunResult)
| extend ScannedVmId = tostring(Data.ScannedVmId)
| extend ScannedVmDistribution = tostring(Data.ScannedVmDistribution)
| extend CloudProvider = tostring(Data.CloudProvider)
| extend ValidNdrEventTypes = tostring(Data.ValidNdrEventTypes)
| extend MisformattedEventResults = tostring(Data.MisformattedEventResults)
| where StateName has "AgentlessVaVmScanReportStateContext"
| project ScannedVmId, env_time, env_cv, ProcessingResult = StepId, ScannedVmDistribution, CloudProvider, customData, SuccessfullyProcessedEvents = ValidNdrEventTypes, MisformattedEventResults, operationId
| summarize count() by ProcessingResult
```

## Known Errors

### GetNdrTenantInfoAsync Error
- **Cause**: MDE Org ID is `00000000-0000-0000-0000-000000000000`
- **Explanation**: MDE license not yet created (takes 24h after enabling plans) or license creation error.
- **Action**: Wait 24h. If persists, escalate to PG.

### Agentless Freshness Stuck After MDE Offboard
- **Cause**: MDE retains device ID for 30 days after offboarding.
- **Impact**: No agentless freshness until device record is removed.
- **Action**: Wait 30 days or request PG to expedite removal.

## API to Enable/Disable Agentless Scanning

### Enable

```
PUT https://management.azure.com/subscriptions/{subscriptionID}/providers/Microsoft.Security/pricings/VirtualMachines?api-version=2023-01-01
```

```json
{
  "type": "Microsoft.Security/pricings",
  "properties": {
    "extensions": [
      {
        "name": "AgentlessVmScanning",
        "isEnabled": "True",
        "additionalExtensionProperties": {
          "ExclusionTags": "[]"
        }
      }
    ],
    "subPlan": "P2",
    "pricingTier": "Standard"
  }
}
```

### Disable

```
PUT https://management.azure.com/subscriptions/{subscriptionID}/providers/Microsoft.Security/pricings/VirtualMachines?api-version=2023-01-01
```

```json
{
  "type": "Microsoft.Security/pricings",
  "properties": {
    "extensions": [
      {
        "name": "AgentlessVmScanning",
        "isEnabled": "False"
      }
    ],
    "subPlan": "P2",
    "pricingTier": "Standard"
  }
}
```
