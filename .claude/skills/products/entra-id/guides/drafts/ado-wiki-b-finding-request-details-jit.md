---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/Log Query Reference/Finding request details in JIT"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Customer%20LockBox/Log%20Query%20Reference/Finding%20request%20details%20in%20JIT"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Customer Lockbox - Finding Request Details in JIT

## Method 1: Query JIT Kusto Table

1. Query the JIT Kusto table by Request ID. See [Kusto Queries](./ado-wiki-b-lockbox-kusto-queries.md) for the JIT phases query.
2. Runner accounts to filter: `jitrp@microsoft.com` and `jitrv@microsoft.com`
3. The query returns requestor info, JIT request phases, and other details.
4. Can also search by specific requester or other details.
5. Requests can be searched by "Id" (for your own requests) or by "Requestor" in the JIT portal.

## Method 2: JIT Logs in Geneva

**Default selection** provides information about a request. Select different tables/roles for other specific information.

> **Important**: If a request creation has failed, it will NOT be found in `JITProcessWorkerRole` and could be found in `ACISWebRole`.

### Identify requests created

Filter logs for JIT posting to lockbox topic:
- Add a new filter: `message contains "Topic"`

### Sample Geneva Query

https://portal.microsoftgeneva.com/s/94AA4C19
