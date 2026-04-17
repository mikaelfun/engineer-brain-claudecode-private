---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Customer Scenarios/How to gather NNF Feature flags on all network fabrics in all AT&T subscriptions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FCustomer%20Scenarios%2FHow%20to%20gather%20NNF%20Feature%20flags%20on%20all%20network%20fabrics%20in%20all%20AT%26T%20subscriptions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Gather NNF Feature Flags Across All Network Fabrics

> **Note:** Pending PG automation through Geneva action.

## Overview

When a customer requests NNF feature flags across all their network fabrics and subscriptions, follow these steps from a SAW device.

## Steps

### 1. Identify Subscriptions (if not provided by customer)

Query ARMProd on [ADX](https://dataexplorer.azure.com/clusters/armprodgbl.eastus/databases/ARMProd):

```kql
let HttpMethod = dynamic(null);
let _resourceProvider = 'microsoft.managednetworkfabric';
macro-expand isfuzzy=true ARMProdEG as X (X.database('Requests').HttpIncomingRequests)
| where targetResourceType != 'LOCATIONS'
| where tenantId contains "tenantID number"
| where isempty(['_resourceProvider']) or tolower(targetResourceProvider) in (['_resourceProvider'])
| where isempty(['HttpMethod']) or httpMethod in (['HttpMethod'])
| summarize by subscriptionId
```

### 2. Get Resources via Geneva Action

In https://portal.microsoftgeneva.com/actions, run **Get Resources mapped to a Subscription** for each subscription:
- **Endpoint**: Leave as default
- **Subscription ID**: From step 1
- **Resource Type**: Network Fabrics
- **ARM API Version**: Use current version

### 3. Download JSON Files

Download each JSON file from Geneva action results and save to a single folder on SAW device.

### 4. Extract Feature Flags with PowerShell

Create a `.ps1` script to extract the following 10 NNF feature flag fields:

1. `areExtTelcoUsersEnabled`
2. `areExtTelcoUsersCreated`
3. `isDefaultRoutePolicyEnabled`
4. `isDefaultACLEnabled`
5. `isDefaultUniqueRouteDistinguishersEnabled`
6. `isDefaultUniqueRDNNICEBasedEnabled`
7. `isDefaultCpuTpEnabled`
8. `isMicroBfdEnabled`
9. `isMultiNNISupportEnabled`
10. `isAutoPasswordRotationEnabled`

```powershell
$folderPath = "C:\path\to\json-data"
$outputPath = "C:\path\to\extracted-all.txt"
$fields = @(
    '"Id":', '"Name":',
    '"areExtTelcoUsersEnabled":', '"areExtTelcoUsersCreated":',
    '"isDefaultRoutePolicyEnabled":', '"isDefaultACLEnabled":',
    '"isDefaultUniqueRouteDistinguishersEnabled":',
    '"isDefaultUniqueRDNNICEBasedEnabled":',
    '"isDefaultCpuTpEnabled":', '"isMicroBfdEnabled":',
    '"isMultiNNISupportEnabled":', '"isAutoPasswordRotationEnabled":'
)
if (Test-Path $outputPath) { Remove-Item $outputPath }
Get-ChildItem -Path $folderPath -Filter *.json | ForEach-Object {
    $file = $_.FullName
    $lines = Get-Content -Path $file
    $matchingLines = $lines | Where-Object {
        $line = $_.Trim()
        $fields | ForEach-Object { $line.StartsWith($_) } | Where-Object { $_ }
    }
    Add-Content -Path $outputPath -Value "`n==== File: $($_.Name) ===="
    $matchingLines | Add-Content -Path $outputPath
}
```

## Reference
- [IcM 625525154](https://portal.microsofticm.com/imp/v5/incidents/details/625525154/summary)
