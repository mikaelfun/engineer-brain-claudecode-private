---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Policy/Policy - Customer Issues/Track or Triage the request from UI"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Policy/Policy%20-%20Customer%20Issues/Track%20or%20Triage%20the%20request%20from%20UI"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Issue
This TSG covers steps to triage UI issues related to Purview Policy.

## Triaging Steps / Root Cause

1. Go to **Jarvis DGrep** (Jarvis - microsoftgeneva.com)
2. Run a query on **GatewayEvent**:
   - Endpoint: set appropriately (e.g., "Test" or "Prod")
   - Namespace: `GatewayDogfood` (or appropriate production namespace)
   - Events to search: Check **AuthorizationEvent** and **GatewayEvent**
   - Set appropriate time range around the issue time
   - Add filtering condition: `RequestId == {customer's request ID}`
3. Get the **Correlation Id** from the logs
4. Query **PolicyStoreEvent** with the Correlation Id:
   - Namespace: `PolicyStoreDogFood` (or appropriate production namespace)
   - Events to search: Check **PolicyStoreLogEvent**
   - Filter by `CorrelationId == {correlation ID from step 3}`
5. Check the logs and get the exception details

## Resolution
- Make sure to delete all the bindings and retry the operation
- Investigate the specific exception details from PolicyStoreLogEvent for targeted resolution
