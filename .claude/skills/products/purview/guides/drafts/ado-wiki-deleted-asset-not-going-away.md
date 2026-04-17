---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/Deleted asset not going away"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/Deleted asset not going away"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Deleted Asset Not Going Away

## Prerequisite
Walk through Asset ingestion workflow description TSG first.

## IR Table Selection
- **Self-Hosted IR** -> `TraceGatewayLocalEventLog`
- **Azure IR** -> `DataScanAgentLinuxEvent`

## Sanity Check

1. **Timing**: Scan must be triggered AFTER the target asset is already deleted from data source
2. **Scope**: Scan scope must be configured to **DIRECT PARENT OR HIGHER** of the deleted asset

Example: To delete folder 1.1.1, scope must be set to Folder 1.2 (direct parent) or Folder 1 (higher). Scoping to a sibling or the asset itself won't trigger deletion detection.

## Step 1: Check Traversed Assets

```kql
let regOp = @'(.*)"URI":(.*)"Store"(.*)';
DataScanAgentLinuxEvent
| where ScanResultId == "<scan_run_id>"
| where Message has "OpInfo" or Message has "DataFlowGraph" or Message has "EntityInfo"
| project extract(regOp, 2, Message)
```

Compare output with customer's stated scope.

## Step 2: Check Scan Scope

Verify the root checkbox is selected. Sometimes customers think they're scoping to ROOT db level but haven't selected the root checkbox. The parent selection checkbox must be checked for automatic inclusion of subordinate assets.

## Step 3: Check Parent Entity Output

```kql
DataScanAgentLinuxEvent
| where ScanResultId == "<scan_run_id>"
| where Message contains "ConvertedEntities"
| where Message contains "<parent_folder>"
| order by env_time asc
| project env_time, Message
```

Check `traversedLeafCount` and `traversedLeafNodes` in the entity output:
- If child item list is correct (deleted asset not listed) -> escalate to **Offline Tier PG**
- If child item list still includes deleted asset -> escalate to **Scan PG**
