---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Scan/L1-L2-L3 Scan Trouble Shooting"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FL1-L2-L3%20Scan%20Trouble%20Shooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# L1/L2/L3 Scan Trouble Shooting

## Background

Different scan levels are integral parts of the scanning process. L1/L2/L3 scan options are explicitly supported in Purview.

## Feature Scope
Currently this feature is only available for **Azure SQL Database** and **Snowflake** on **Azure IR** and **Managed VNet IR v2**. Support for more sources and integration runtimes will come in the future.

## Troubleshooting Steps

### Step 1: Check if L1/L2/L3 feature is enabled

Check whether the feature is enabled on the customer's Purview accountId, subscriptionId or tenantId. If not, engage PG directly.

```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "<scanRunId>" and Message contains "EC ScanSvcEnableScanScope is"
| project Message
```

### Step 2: Check scan level change logs

If customer upgrades scan level (e.g., L1→L3, L2→L3), verify related service logs:

```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "<scanRunId>" and Message contains "The value of ScanScopeType is changed to"
| project Message
```

### Step 3: Get scan execution region

```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "<scanRunId>" and Message contains "executionRegion"
```

### Step 4: Check runtime details (use region-specific cluster)

- **EC value passed to runtime:**
```kql
cluster('purviewadx{region}.{region}.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == "<scanRunId>" and Message contains "ScanModelSettings scanScopeType specified by customer"
| project Message
```

- **Scan level accepted by scan sample module:**
```kql
cluster('purviewadx{region}.{region}.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == "<scanRunId>" and Message contains "SCAN_SCOPE_TYPE:"
| project Message
```

- **L2 scan — verify schema-only read:**
```kql
cluster('purviewadx{region}.{region}.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == "<scanRunId>" and Message contains "while ignore sample data in L2 scan"
| project Message
```

- **L3 scan — verify classification in atlas entities:**
```kql
cluster('purviewadx{region}.{region}.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == "<scanRunId>" and Message contains "ClassificationRuleType"
| project Message
```

### Step 5: Engage PG

After gathering all information, summarize findings and engage PG for further help.
