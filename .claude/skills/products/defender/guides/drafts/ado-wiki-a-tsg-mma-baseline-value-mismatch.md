---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/Baselines (configure machines securely)/[deprecated] MMA Baselines (Security Configuration)/[TSG] - I see a different value on the machine compared with the value in MDC"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Recommendations%20and%20remediation/Baselines%20%28configure%20machines%20securely%29/%5Bdeprecated%5D%20MMA%20Baselines%20%28Security%20Configuration%29/%5BTSG%5D%20-%20I%20see%20a%20different%20value%20on%20the%20machine%20compared%20with%20the%20value%20in%20MDC"
importDate: "2026-04-06"
type: troubleshooting-guide
status: deprecated
---

> **Note**: This page is deprecated. MMA is no longer supported. Refer to MDVM configuration baselines or Guest Configuration Baselines instead.

# I see a different value on the machine compared with the value I see in MDC

## Background
First read the [Product Knowledge - MMA Baselines](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/1915/-Product-Knowledge-MMA-Baselines) overview.

## Overview
This can result from the agent not sending data properly to the workspace, or MDC not refreshing the data correctly from the workspace. To identify where the issue is, compare MDC results with workspace query results.

## Step by Step Instructions

1. Go to Recommendations > "Machines should be configured securely"

2. Run the SecurityBaseline query on each workspace the machine reports to:
   ```kql
   SecurityBaseline
   | where (BaselineType =~ 'WindowsOS' or BaselineType =~ 'Windows OS' or BaselineType =~ 'Linux' or BaselineType =~ 'Oms.Linux' or BaselineType =~ 'Web' or (isempty(BaselineType) and isnotempty(TimeGenerated)))
   | summarize arg_max(TimeGenerated, *) by SourceComputerId, Computer, BaselineRuleId, RuleSeverity, BaselineRuleType
   | where BaselineRuleId =~ "<baseline_rule_id>"
   | where SubscriptionId == "<subscription_id>" or isempty(SubscriptionId)
   ```

3. **If workspace matches MDC but not machine** → Agent issue → open ticket with ASM-Dev team

4. **If workspace matches machine but not MDC** → Could be:
   - Log Analytics agent not sending certain fields correctly
   - MDC issue

5. **To distinguish agent vs MDC issue**, collect from workspace:
   - Run the main query showing SourceComputerId, ResourceId, AnalyzeResult
   - Verify:
     - `SourceComputerId` = valid GUID
     - `ResourceId` = valid Azure Resource ID (unless on-prem)
     - `AnalyzeResult` = Failed (unless machine is Healthy for that rule)
   - If any field has invalid value → agent or ASM-Dev issue

6. **If all fields are valid** → MDC discrepancy → open CRI ticket with:
   - MDC screenshots
   - Workspace query results (screenshots, not CSV)
   - Include both query and marked fields in screenshots

> CRIs lacking this info will be mitigated as noise until all data has been fully provided.
