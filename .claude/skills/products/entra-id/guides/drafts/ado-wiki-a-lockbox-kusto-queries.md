---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/Kusto Queries"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FCustomer%20LockBox%2FKusto%20Queries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Customer Lockbox - Kusto Queries

The following Kusto Queries are broken down into scenarios where you are most likely to use them.

## Subscription details

Get subscriptions and other details from past months. Helpful when investigating lockbox request history.

**Cluster**: azureslam.kusto.windows.net / JIT

```kql
ResourceAccessGrant
| where PreciseTimeStamp > ago(30d)
| where Operation == "PolicyEvaluated"
| where ResourceDetail contains "<IsCustomerApprovalRequired>true</IsCustomerApprovalRequired>"
| where ResourceDetail contains "Microsoft.WindowsAzure.Wapd.Acis.AccessControl.ACSResourceNode"
| join kind=inner RequestProcess on RequestId
| project PreciseTimeStamp, HostName, RequestId, Requestor, WorkItemSource, WorkItemId, ResourceId, ResourceDetail
```

## Lockbox Request Count

Get the count of lockbox requests for a given period.

```kql
ResourceAccessGrant
| where PreciseTimeStamp > ago(90d)
| where PreciseTimeStamp < ago(60d)
| where Operation == "PolicyEvaluated"
| where ResourceDetail contains "<IsCustomerApprovalRequired>true</IsCustomerApprovalRequired>"
| where ResourceDetail contains "Microsoft.WindowsAzure.Wapd.Acis.AccessControl.ACSResourceNode"
| join kind=inner RequestProcess on RequestId
| project PreciseTimeStamp, HostName, RequestId, Requestor, WorkItemSource, WorkItemId, ResourceId, ResourceDetail
| where Requestor != "lockboxrunner@microsoft.com" and Requestor != "lockboxrunnerv@microsoft.com"
| distinct RequestId
```

For tenant-specific info: https://tenants

## JIT phases by Request ID

Follow the phases of a JIT request by a specific Request ID. Helpful when debugging a no lockbox log issue.

**Cluster**: azureslam.kusto.windows.net / JIT

```kql
<JIT table>
| where PreciseTimeStamp >= ago(1d)
| where Role == "JITProcessorWorkerRole"
| where Requestor != "jitrp@microsoft.com"
| where Requestor != "jitrv@microsoft.com"
| where RequestId == "<request-id>"
```

> Note: "jitrp@microsoft.com" and "jitrv@microsoft.com" are JIT runner accounts.

## Sample ARM Kusto Queries

### Look for a specific request based on correlation Id

**Cluster**: armprod.kusto.windows.net / ARMProd

```kql
(union JobTraces, JobErrors, Traces, Errors, ProviderTraces, ProviderErrors)
| where TIMESTAMP > ago(10d)
| where correlationId == "<correlation-id>"
```

### Looking at incoming HTTP requests to the RP

```kql
HttpIncomingRequests
| where TIMESTAMP > ago(10d)
| where operationName contains "CustomerLockBox"
| where operationName contains "register"
```
