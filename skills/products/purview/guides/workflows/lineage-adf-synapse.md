# Purview ADF / Synapse 血缘 — 排查工作流

**来源草稿**: `ado-wiki-a-adf-related-lineage-tsg.md`, `ado-wiki-adb-lineage-openlineage-solution-accelerator.md`, `ado-wiki-sql-server-lineage-issues.md`, `ado-wiki-troubleshooting-data-factory-lineage-issues.md`
**Kusto 引用**: 无
**场景数**: 20
**生成日期**: 2026-04-07

---

## Scenario 1: ADF-Related Lineage Problems
> 来源: ado-wiki-a-adf-related-lineage-tsg.md | 适用: 未标注

### 排查步骤
For issues related with ADF lineage, please note the following TSG created by ADF PG for troubleshooting Lineage issues.

If you also support ADF or have access to ADF debugging clusters and are capable of troubleshooting ADF-related issues, you can move with this TSG autonomously. Otherwise please engage with an ADF CSS and do a joint troubleshoot.

**Reference TSG**: [ADF Lineage Investigation Process and TSG](https://dev.azure.com/Supportability/AzureDataFactory/_wiki/wikis/AzureDataFactory/704670/lineage-related-problem-investigation-process-and-TSG)

`[来源: ado-wiki-a-adf-related-lineage-tsg.md]`

---

## Scenario 2: Training Resources
> 来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md | 适用: 未标注

### 排查步骤
| Session | Link |
|--|--|
| Overview | [Session Link](https://microsoft-my.sharepoint.com/:v:/p/vimals/Ea4XyAEa6zBBlr9XLSYwGFIBvNuN5CLbShUUOZKO5e0bDQ?e=In6Fe7) |
| Deep-Dive | **[TBD]** |

`[来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`

---

## Scenario 3: Other Resources
> 来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md | 适用: 未标注

### 排查步骤
| Resources | Link |
|--|--|
| GitHub link to the Documentation | [ADB Lineage using OpenLineage Solution Accelerator](https://github.com/microsoft/Purview-ADB-Lineage-Solution-Accelerator) |
| Overview page of Solution Accelerating team | [Early Access Engineering](https://microsoft.sharepoint.com/teams/EA) |
| MLADs Technical Overview Session | [Slide Deck](https://microsoft.sharepoint.com/:p:/t/PurviewACC-Team/EceJcMWi41ZMhhV-eXRFAXgBSImYIK2q4IiSZqt__-eRcQ?e=fN827c&isSPOFile=1) |
| Configuration of Databricks Cluster | [Link](https://github.com/microsoft/Purview-ADB-Lineage-Solution-Accelerator/blob/main/deploy-base.md#download-the-openlineage-spark-agent-and-configure-with-your-azure-databricks-clusters) |
| What is Azure Databricks | [Documentation](https://docs.microsoft.com/en-us/azure/databricks/scenarios/what-is-azure-databricks) |

`[来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`

---

## Scenario 4: Troubleshooting
> 来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md | 适用: 未标注

### 排查步骤
The solution accelerator has certain limitations w.r.t. Data Sources supported and the Azure Databricks to Purview Solution Accelerator Connector which affect what sort of lineage can be collected. Refer to these limitations before troubleshooting any case.

`[来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`

---

## Scenario 5: Limitations
> 来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md | 适用: 未标注

### 排查步骤
https://github.com/microsoft/Purview-ADB-Lineage-Solution-Accelerator/blob/main/LIMITATIONS.md

Refer to the following link for troubleshooting issues related to ADB Lineage using OpenLineage Solution Accelerator:

`[来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`

---

## Scenario 6: Troubleshooting doc
> 来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md | 适用: 未标注

### 排查步骤
https://github.com/microsoft/Purview-ADB-Lineage-Solution-Accelerator#troubleshooting

`[来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`

---

## Scenario 7: How to contact OpenLineage Product Group
> 来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md | 适用: 未标注

### 排查步骤
The Solution Accelerator for ADB Lineage will be available in Public Preview soon. Customers should only be creating Sev 3 cases during Public Preview of this feature.

Please don't raise an ICM directly for this issue with the Lineage PG. All PG requests/escalations should be first discussed on Ava with the SMEs/EEEs and the Solution Accelerator team. We need to first identify if the customer's concern is because of Lineage issue with the Purview product or because of Lineage issue with the Solution Accelerator.

SMEs can use the following command to engage Solution Accelerator team: _**Ava involve OpenLineage**_

Please reach out to [Purview EEEs](mailto:azurepurvieweees@microsoft.com) for any queries or feedback.

`[来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`

---

## Scenario 8: Unable to access github documentation
> 来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md | 适用: 未标注

### 排查步骤
The github documentation should be publicly accessible, if you're unable to access it, please join the Microsoft organization from the list of "Available organizations" on github: [Organizations](https://repos.opensource.microsoft.com/orgs)

`[来源: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`

---

## Scenario 9: View Lineage
> 来源: ado-wiki-sql-server-lineage-issues.md | 适用: 未标注

### 排查步骤
SQL DB metadata scan includes lineage extraction for views. Only new scans include the view lineage extraction. At times, customers don't see View lineage being rendered. Run Kusto queries from the section below to check for errors.

If the asset was already ingested to data map, the lineage won't show in a new scan. Suggest deleting the asset from data map and re-running the scan.

Often, issues originate from MITI. Check MITI Kusto logs and escalate to connectors team if errors are found.

`[来源: ado-wiki-sql-server-lineage-issues.md]`

---

## Scenario 10: Stored Procedure Lineage
> 来源: ado-wiki-sql-server-lineage-issues.md | 适用: 未标注

### 排查步骤
Enable the Lineage Extraction toggle when setting up a scan. Refer to public documentation for stored procedure lineage supported behaviors and known limitations.

`[来源: ado-wiki-sql-server-lineage-issues.md]`

---

## Scenario 11: Check scan errors
> 来源: ado-wiki-sql-server-lineage-issues.md | 适用: 未标注

### 排查步骤
```kql
cluster('babylontest.eastus2.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == '<scan-result-id>'
| where Message contains 'error'
| project ['time'], Message
```

`[来源: ado-wiki-sql-server-lineage-issues.md]`

---

## Scenario 12: Check if View Lineage EC is enabled
> 来源: ado-wiki-sql-server-lineage-issues.md | 适用: 未标注

### 排查步骤
```kql
cluster('https://babylontest.eastus2.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == '<scan-result-id>'
| where Message contains "AutoExtractLineageSource enabled for"
| project ['time'], Message
```

`[来源: ado-wiki-sql-server-lineage-issues.md]`

---

## Scenario 13: Check MITI errors
> 来源: ado-wiki-sql-server-lineage-issues.md | 适用: 未标注

### 排查步骤
```kql
cluster('azuredmprod.kusto.windows.net').database('AzureDataMovement').TraceGatewayLocalEventLog
| where UserReportId == "<shir-report-id>"
| where LocalMessage contains "miti: ThreadID: main; TimeStamp:"
| order by LocalTimestamp asc
| project LocalTimestamp, LocalMessage, LocalTraceLevel
```

`[来源: ado-wiki-sql-server-lineage-issues.md]`

---

## Scenario 14: Check DataMap relationship API invocation
> 来源: ado-wiki-sql-server-lineage-issues.md | 适用: 未标注

### 排查步骤
```kql
cluster('babylontest.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierWebRequests
| where RequestId has "<scan-result-id>"
| project RequestUrl
```

`[来源: ado-wiki-sql-server-lineage-issues.md]`

---

## Scenario 15: Check entities sent to data map
> 来源: ado-wiki-sql-server-lineage-issues.md | 适用: 未标注

### 排查步骤
```kql
cluster('babylontest.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierDetailsPrivacy
| where RequestId has "<scan-result-id>"
```

`[来源: ado-wiki-sql-server-lineage-issues.md]`

---

## Scenario 16: Trace stored procedure lineage logs
> 来源: ado-wiki-sql-server-lineage-issues.md | 适用: 未标注

### 排查步骤
```kql
cluster('https://babylontest.eastus2.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == "<scan-result-id>"
| where Message contains "OneProvenance Configuration: "  // OneProvenanceModule executed
// Uncomment filters as needed:
//| where Message contains "Finding blobs modified after"  // AzBlobXelCollector executed
//| where Message contains "Starting xel batch processing, xel count"  // xel files for xevents
//| where Message contains "Malformed entity"
//| where Message contains "Relationship: {\"typeName\":\"azure_sql_stored_procedure_stored_procedure_runs\""
| sort by ['time'] asc
| project ['time'], ScanResultId, Message
```

`[来源: ado-wiki-sql-server-lineage-issues.md]`

---

## Scenario 17: Next Steps
> 来源: ado-wiki-sql-server-lineage-issues.md | 适用: 未标注

### 排查步骤
- If errors found in Kusto logs → engage engineering team with the log evidence.
- If no errors → verify customer followed all steps in [public documentation](https://learn.microsoft.com/en-us/purview/register-scan-azure-sql-database?tabs=sql-authentication). If still no success, escalate to engineering team.

`[来源: ado-wiki-sql-server-lineage-issues.md]`

---

## Scenario 18: Copy Activity
> 来源: ado-wiki-troubleshooting-data-factory-lineage-issues.md | 适用: 未标注

### 排查步骤
Refer the Troubleshooting Guide here to investigate ADF Copy Activity Lineage issues: https://dev.azure.com/Supportability/AzureDataFactory/_wiki/wikis/AzureDataFactory/704670/lineage-related-problem-investigation-process-and-TSG

`[来源: ado-wiki-troubleshooting-data-factory-lineage-issues.md]`

---

## Scenario 19: Data Flow Activity
> 来源: ado-wiki-troubleshooting-data-factory-lineage-issues.md | 适用: 未标注

### 排查步骤
Before troubleshooting Dataflow Activity Lineage check the following article and ensure that we don't hitting any limitation and the source & sink data sources are supported:

- [Data Flow Supported data sources](https://learn.microsoft.com/azure/purview/how-to-link-azure-data-factory#data-flow-support). Any data source/sink outside this table won't be supported for data flow lineage.
- Microsoft Purview currently doesn't support query or stored procedure for lineage or scanning
- Lineage is limited to table and view sources only
- Data flow lineage doesn't integrate with Microsoft Purview [resource set](https://learn.microsoft.com/azure/purview/concept-resource-sets)

`[来源: ado-wiki-troubleshooting-data-factory-lineage-issues.md]`

---

## Scenario 20: Query Dataflow Logs
> 来源: ado-wiki-troubleshooting-data-factory-lineage-issues.md | 适用: 未标注

### 排查步骤
Get the Dataflow ActivityID and query the Dataflow logs:

```kql
cluster('adfcus').database('AzureDataFactory').DataflowClusterLogs | union cluster('adfneu').database('AzureDataFactory').DataflowClusterLogs
| where ActivityRunId == "ef9f5b5b-xxxx-xxxx-xxxx-e7a0bd99f34c"  // Activity RunId
| where Caller contains "lineage"
```
You would see a request to create lineage entities, source and sink entities and all other entities list is sent to the Catalog.

You could further trace Lineage entries or any errors in the Catalog by checking the OnlineTier logs:

```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierDetails
| where RequestId contains "ef9f5b5b-xxxx-xxxx-xxxx-e7a0bd99f34c" //ActivityId
| project PreciseTimeStamp, Level, Msg, CatalogId, CatalogName, RequestId | order by PreciseTimeStamp asc
```

`[来源: ado-wiki-troubleshooting-data-factory-lineage-issues.md]`

---
