---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/System Updates/[TSG] Legacy System Updates"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20and%20remediation%2FSystem%20Updates%2F%5BTSG%5D%20Legacy%20System%20Updates"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG: Legacy System Updates (MMA/OMS-based)

## Overview

MDC provides system updates recommendations based on system updates data in the user's Log Analytics workspaces. MDC aggregates data across all workspaces (including cross-subscription) and shows it centralized.

> **Key point:** MDC is NOT responsible for the agent sending reports to the workspace. MDC only reads from workspaces. This TSG focuses on verifying whether the required data exists in the workspace.

## How MDC Determines Health Status

**For Linux:**
```kusto
Update
| where TimeGenerated>ago(5h) and OSType=="Linux" | where Computer contains "{VMName}"
| summarize hint.strategy=partitioned arg_max(TimeGenerated, UpdateState, Classification, BulletinUrl, BulletinID) by Computer, SourceComputerId, Product, ProductArch
| where UpdateState=~"Needed"
```

**For Windows:**
```kusto
Update
| where OSType != "Linux"
| where iff(isnotnull(toint(Optional)), Optional == false, Optional == "false") == true and
    iff(isnotnull(toint(Approved)), Approved != false, Approved != "false") == true
| where Classification in ("Critical Updates", "Security Updates")
| where ResourceType !has 'virtualMachineScaleSets'
```

**Health state logic:**
1. Any row with `UpdateState == "Needed"` → **Not Healthy**
2. All rows have `UpdateState == "Installed"` → **Healthy**
3. No rows matching the query → **N/A** (MDC cannot determine health)

> A resource with no Update rows at all is N/A, not Healthy. Healthy resources must send Update reports with `UpdateState == "Installed"`.

## Resource Considered Deleted

MDC also queries Heartbeat table. A resource not reporting either Heartbeat or Updates for 2 days is considered deleted and excluded from the recommendation.

## System Updates Data in ARG

```kusto
// Assessment for a specific resource
securityresources
| where type=="microsoft.security/assessments"
| where name=="4ab6e3c5-74dd-8b35-9ab9-f61b30875b27"
```

```kusto
// Sub-assessments
securityresources
| where type=="microsoft.security/assessments/subassessments"
| extend assessmentKey=extract(".*assessments/(.+?)/.*",1,id), severity=tostring(properties.status.severity)
| where assessmentKey=="4ab6e3c5-74dd-8b35-9ab9-f61b30875b27"
```

## Customer Troubleshooting Steps

1. Go to Security Center → Inventory → Select VM → System Updates under Virtual machine information
2. Check `UpdateSummary` in Log Analytics workspace:
   ```kusto
   UpdateSummary
   | where Computer contains "{VM name}"
   ```
   Note `WindowsUpdateSetting` and `WSUSServer` fields.

## Checking Health Monitoring (LastPatchTimestamp)

The System Updates scanner is part of the workspace-installed 'security' or 'securityCenterFree' solution.

```kusto
cluster("Romelogs").database("Prod").HybridOmsHealthMonitoringOE
| where SubscriptionId == '{subscriptionId}'
//| where ComputerName has "VMname"
| summarize arg_max(env_time, *) by ComputerName
| sort by env_time
| project ComputerName, env_time, Heartbeat=LastHeartbeatTimestamp, AntimalewareHB=LastAntimalwareTimestamp,
          BaselineScan=LastBaselineTimestamp, SystemUpdatesScan=LastPatchTimestamp,
          Solutions, ComputerEnvironment, SubscriptionId, OmsWorkspaceCustomerId
```

## Linux - Check Pending Updates Manually

```bash
sudo apt-get upgrade -s | grep ^Inst | grep Security
```
Shows pending Security updates. Remove the `grep Security` filter to see all pending updates.

## FAQ

### Resource is healthy in MDC but unhealthy on workspace (or vice versa)
Run the MDC update queries above and check the `UpdateState` field for all results.

### Resource has no rows in Updates table → why N/A instead of Healthy?
Healthy resources must actively send `UpdateState == "Installed"` rows. No data = N/A (MDC can't determine health).

### Queries return 0 rows - what to do?
Could be an agent issue or an issue specific to Updates:
- If Updates-specific → raise collaboration with **Azure Monitoring CSS team**
  - [Azure Automation TSG - Update Management](https://supportability.visualstudio.com/AzureAutomation/_wiki/wikis/Azure-Automation.wiki/294438/TSG-Update-management)
