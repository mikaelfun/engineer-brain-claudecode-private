---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Observability/On-Demand Log Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Observability/On-Demand%20Log%20Collection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# On-Demand Log Collection for Azure Local Disconnected Operations

## Overview
On-Demand Log Collection is a diagnostic capability in Azure Local disconnected operations that enables targeted log gathering for troubleshooting scenarios.

## Supported Scenarios

### 1. Direct Collection
- **When**: Management endpoint accessible AND appliance connected to Azure.
- **Command**: `Invoke-ApplianceLogCollection`

### 2. Indirect Collection
- **When**: Appliance disconnected from Azure BUT management endpoint accessible.
- **Commands**:
  1. `Invoke-ApplianceLogCollectionAndSaveToShareFolder`
  2. `Send-DiagnosticData`

### 3. Fallback Collection
- **When**: Management endpoint inaccessible OR appliance VM down.
- **Commands**:
  1. `Copy-DiagnosticData` (extract from mounted VHDs)
  2. `Send-DiagnosticData`

## Decision Tree
```
Is management endpoint accessible?
├─ YES → Is appliance connected to Azure?
│   ├─ YES → Direct Collection (Invoke-ApplianceLogCollection)
│   └─ NO  → Indirect Collection (save to share + send)
└─ NO  → Fallback Collection (mount VHD + copy + send)
```

## Further Reading
- Internal Wiki: https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2133283/On-Demand-Log-Collection
- Public Docs: https://learn.microsoft.com/en-us/azure/azure-local/manage/disconnected-operations-on-demand-logs
