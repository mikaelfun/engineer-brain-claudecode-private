---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Kusto for troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Kusto%20for%20troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Kusto for Troubleshooting

Kusto queries can be used to troubleshoot issues involving Entra ID Application Proxy.

## Terminology

- **FrontendURL**: External URL as shown in the App Proxy config in the Entra portal
- **BackendURL**: Customer's internal URL for their Web App
- **SubscriptionID**: Tenant ID
- **LogicResult**: Outcome of the Transaction
- **ExtraResultData**: Additional contextual information on the outcome

## Get MEAP Cluster Access

Support Engineers **must use Kusto Web UX** integrated in ASC. External access from Fat Kusto Client / Kusto Explorer will be deprecated.

### Configure Kusto Web UX

1. Start Kusto Web UX in ASC
2. Choose **idsharedweu** and click on Add Cluster
3. If 403 error occurs, your TSE account access package may have expired - follow steps in [Access to Advanced Diagnostic Tools](https://dev.azure.com/IdentityCommunities/Community%20-%20Identity%20Diagnostics%20and%20Tooling/_wiki/wikis/Community---Identity-Diagnostics-and-Tooling.wiki/1016/Access-to-Advanced-Diagnostic-Tools)

The tables under **MEAP** are the most important for troubleshooting. Query results are always filtered on the tenant Id of the context you started Kusto Web UX in.

## Sample Queries for Access Issues

### Traces (using Transaction ID)

```kusto
let tran='<TransactionID>';
Traces | where (TransactionId == tran or Message contains tran) | project TIMESTAMP, Message
```

> **Note:** Message must be capitalized.

### TransactionSummaries (find Transaction IDs)

All transactions for a specific FrontEndURL:

```kusto
TransactionSummaries | where FrontendUrl contains "<ExternalURL>"
```

### All failed transactions in the last 4 hours

```kusto
TransactionSummaries
| where FrontendUrl contains "ExternalURL" and LogicResult != "Success" and TIMESTAMP > ago(4h)
| project TIMESTAMP, TransactionId, ExtraResultData, LogicResult
```

### Failed transactions 4-5 hours ago

```kusto
TransactionSummaries
| where FrontendUrl contains "ExternalURL" and LogicResult != "Success" and TIMESTAMP > ago(5h) and TIMESTAMP < ago(4h)
| project TIMESTAMP, TransactionId, ExtraResultData, LogicResult
```

### Failed transactions in a specific time span

```kusto
TransactionSummaries
| where FrontendUrl contains "ExternalURL" and LogicResult != "Success"
    and TIMESTAMP > datetime(2017-11-05 19:19:07) and TIMESTAMP < datetime(2017-11-05 19:20:07)
| project TIMESTAMP, TransactionId, ExtraResultData, LogicResult
```

> Provide a time range since database timestamps are more precise than error timestamps.

### Failed transactions by Tenant ID

```kusto
TransactionSummaries
| where SubscriptionId == "Tenant ID"
| project TIMESTAMP, TransactionId, ExtraResultData, LogicResult, SessionId, ConnectorID
```

### All 401 responses from backend

```kusto
TransactionSummaries
| where FrontendUrl contains "BackendURL" and ExtraResultData contains "IwaUnauthorizedFromBackend"
| project TIMESTAMP, TransactionId, ExtraResultData, LogicResult, SessionId
```

## Sample Queries for Connector Issues

### Connector information with operations

```kusto
BootstrapRootOperationEvent
| where subscriptionId == "TenantID"
| project env_time, connectorId, connectorVersion, operationName, requestString
```

### Connector info via TransactionSummaries

```kusto
TransactionSummaries
| where FrontendUrl contains "FrontendURL"
| project ServiceName, ConnectorId, RoleInstance
```

## Sample Queries to List Top Applications by Transaction Volume

```kusto
let startTime = datetime(2025-03-16 09:00:00);
let endTime = datetime(2025-03-17 17:00:00);
TransactionSummaries
| where TIMESTAMP between (startTime .. endTime)
| summarize TransactionsPerHour = count() by bin(TIMESTAMP, 1h), ApplicationId
| join kind=inner (
    TransactionSummaries
    | summarize TotalTransactions = count() by ApplicationId
    | top 5 by TotalTransactions
) on ApplicationId
| project TIMESTAMP, ApplicationId, TransactionsPerHour
| order by TIMESTAMP asc, TransactionsPerHour desc
| render timechart
```
