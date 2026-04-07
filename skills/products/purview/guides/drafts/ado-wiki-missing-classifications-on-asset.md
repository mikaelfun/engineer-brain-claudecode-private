---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Classification and sensitivity labels/Missing or incorrectly classified assets/Missing classifications on an asset"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Classification%20and%20sensitivity%20labels/Missing%20or%20incorrectly%20classified%20assets/Missing%20classifications%20on%20an%20asset"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Missing Classifications on an Asset

**NOTE:** Use "Entity info"/"convertedEntities" instead of "OpInfo" for checking information.

## Background
For an asset in the data source scanned, customer expects to see a tag on the asset, but it is not found in the catalog.
If Threshold Values and System Classification TSGs are not applicable, proceed with this.

## Scoping Questions
- Purview classification rule (out of the box or custom details)
- Purview Scan Run ID
- An example of assets that you expect to be classified that were not

## Possible Causes

1. **Data removed or has security restrictions** — data within the current region deployment was removed/not populated due to security concerns (source folders have access restrictions). At scan time, Purview didn't have any data to classify.
2. **Inconsistent data classification** — data quality issues when sourcing from data sources such as Salesforce can generate inconsistent classifications.

## Identification

### Check OpInfo (Azure IR)
```kql
DataScanAgentLinuxEvent
| where * contains "[SCANRUNID]"  // RunID from UI
| where Message contains "OpInfo:"
| where Message !contains "\"IsLeafNode\":\"false\""
| where Message contains "ClassificationExample.csv"  // asset for which classification was expected
```

### Check OpInfo (SHIR)
```kql
cluster('azuredmprod.kusto.windows.net').database('AzureDataMovement').TraceGatewayLocalEventLog
| where * contains "[REPORTID]"  // ReportID from SHIR
| where Message contains "OpInfo:"
| where Message !contains "\"IsLeafNode\":\"false\""
| where Message contains "ClassificationExample.csv"
```

### If OpInfo is missing — check find module exceptions
```kql
DataScanAgentLinuxEvent
| where * contains "[SCANRUNID]"
| where * contains "ExceptionDetails: "
| where Source == "find"
```
Common exception: `403 Forbidden` — ACL verification failed, resource doesn't exist or user not authorized.

### If OpInfo exists but tag missing — check shuffle module
```kql
DataScanAgentLinuxEvent
| where * contains "[SCANRUNID]"
| where * contains "ExceptionDetails: "
| where Source == "ShufModule"
```

## Mitigation Decision Tree

| Scenario | Action |
|----------|--------|
| OpInfo missing + find module exception (403) | File ICM with **DataScan** — RunID, asset name, exception details |
| OpInfo exists + high confidence tag emitted but not in catalog | File ICM with **Data Map Team** — OpInfo, RunID, asset/column name, expected tag |
| OpInfo exists + tag missing + shuffle module exception | Ask customer to **rerun scan**. If persists → file ICM with **DataScan** citing shuffle module failure |
