---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/Fabric and PowerBI Scanning"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FFabric%20and%20PowerBI%20Scanning"
importDate: "2026-04-05"
type: troubleshooting-guide
---

General guidance on troubleshooting issues scanning Fabric and/or PowerBI

# Issues
-------------------------

*   **Scan failed with exceptions**: This is a general error, first try to involve the Data scan team to check why the scan has failed. If it is related to data source specific issues, please check the below logs.
*   **Scan failed/succeeded after taking a long time (for example, 5 days)**: Scan might be taking a lot of time in the discovery or classification or ingestion phase.
    *   Succeeded after long time: Check whether the number of assets to be discovered and ingested are huge. If the number is high, then it is expected that scan will take long time.
    *   If it is not the discovery phase which is taking the longest amount of time, involve the teams for which the scan is taking the highest amount of time.
Query to determine:

```
let _scanId = "5fd6a883-3f80-4af7-b69f-97b8f2d160c5";
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').CustomerFacingEvent
| where * contains _scanId
| extend parsedProperties = parse_json(properties)
| extend scanId = tostring(parsedProperties.scanResultId)
| project PreciseTimeStamp, resultType, resultDescription, properties
```

*   **Some files are not appearing in the scanned assets**: Scan did not ingest this file, could happen when the scan could not discover this file correctly.
*   **Auth issues**: For Fabric, Scan calls different Fabric apis and SDK to gather the metadata and lineage. Auth issues generally happen when CX has not provided enough permissions while running the scan.
*   Hidden columns in Fabric scanned to Purview - this is **expected behavior**. Hiding the column in fabric is a standalone UI feature in fabric. Purview scans underlying schema where it is still present.

Identification
--------------

Run below script to identify what all issues are there in scan (update the cluster according to the Purview region).

```
cluster('purviewadxcc.canadacentral.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == '90d2a045-c354-4f5a-a52c-8400674c45d5'
| where Level == 2
| where Message !contains "[LogId:"
| project Source, Level, Message
```

### Non-Service Principal Auth Issue

Currently, Fabric lakehouse metadata and lineage is supported with service principal auth only. If user complaints, lakehouse tables or files data are not appearing then check whether customer is using service principal auth or some other auth mechanism.

Query to check the auth type:

```
let _scanResultID = "5799a6d9-6181-4741-a9a7-f42b4f36db01";
cluster('https://catalogtelemetrykusto.eastus.kusto.windows.net').database('Scan').GetScanAgentLinuxEvent(_scanResultID)
| where Message contains "credential kind"
| project Message
```

> Note: In this scenario, ask the customer to switch to service principal auth and re-run the scan.

### Auth issues

First thing is to ensure that the user has provided all the permissions to the credentials as per this document: [Connect to your Microsoft Fabric tenant in same tenant as Microsoft Purview (preview)](https://learn.microsoft.com/en-us/purview/register-scan-fabric-tenant?context=%252Ffabric%252Fgovernance%252Fcontext%252Fcontext-purview&tabs=Scenario1).

| Category | Owner | Action |
| --- | --- | --- |
| Forbidden/Unauthorized issue for a table artifact/URI | Fabric team (Fabric SDK Scanner) | Involve and share the logs to Fabric CSS and Engineering team to look into the issue. |
| Forbidden/Unauthorized issue for a file artifact/URI | Fabric team (Onelake/ADLS Gen 2) | Involve and share the logs to Fabric CSS and Engineering team to look into the issue. |
| Error: `MoveNextHandlerAsync: Error fetching next value from enumerator. Value cannot be null. (Parameter 'clientSecret')` | Customer | Ask customer to switch to service principal auth. |

### Other issues

| Category | Owner | Action |
| --- | --- | --- |
| Logs starting with: `[Microsoft.Fabric.Arctic.Scanner]` and Level == 2 | Fabric team (Fabric SDK Scanner) | Involve and share the logs to Fabric CSS and Engineering team. Transfer ICM to OneLake/OneLakeCore team. |
| Null reference exception in NumRecords | Fabric team (Fabric SDK Scanner) | Handled by catch clause, should not prevent entity publishing. If NumRecords is required, transfer IcM to OneLake/OneLakeCore team. |
| Null reference exception for lakehouse tables | Fabric team (Fabric SDK Scanner) | Involve Fabric CSS and Engineering team. Transfer ICM to OneLake/OneLakeCore team. |
| Issue related to parquet files | Customer/Datasource team/Fabric onelake team | Check known limitations for parquet. If not a known limitation, involve datasource team. |
| Ingestion failure for JPG/Jar/Gzip | Known issue | Currently not supported. |
| DAX expressions not coming | Limitation | Currently not supported. |
| QualifiedNamePatternNotMatch error for fabric_lakehouse | Nonfunctional Bug | Bug 4116866 Fix invalid FQN errors in fabric scanning. Ping EEE for additional information. |
| Hidden columns in Fabric scanned to Purview | Expected Behavior | Hiding is a Fabric UI feature; Purview scans underlying schema. |

## What to do from here?

Reach out to Datasource oncall, if required create an ICM. Share:

1. Scan Result ID
2. Error logs from customer
3. Credential kind used by customer
4. Type of IR
