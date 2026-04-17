---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Classification and sensitivity labels/Missing or incorrectly labeled assets/Purview LabelService Logs and Debugging"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Classification%20and%20sensitivity%20labels/Missing%20or%20incorrectly%20labeled%20assets/Purview%20LabelService%20Logs%20and%20Debugging"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Purview LabelService Logs and Debugging

Author: Rahul Pyne

## Preliminary Verification

Confirm that the customer's tenant has the required graph permissions listed in https://learn.microsoft.com/en-us/graph/api/security-informationprotection-list-sensitivitylabels?view=graph-rest-beta&tabs=http

## Required Information

- ScanId
- Impacted Asset's FQN (Fully Qualified Name)

## Fetching Scan Details

Using the ScanId, query Kusto to grab the following details and share in the ICM:
- AccountId
- TenantId
- Region
- TimeStamp

```kql
Scan_Results
| where scanResultId == "<ScanId>"
| project AccountId, tenantId, location, TIMESTAMP
```

Cluster: `babylon.eastus2`, Database: `babylonMdsLogs`

## MiddleTier Logs (Geneva)

1. Go to Geneva logs: https://portal.microsoftgeneva.com/logs/dgrep
2. Populate:
   - Endpoint: Diagnostics PROD
   - Namespace: AzureClpMdsProd
   - Events to Search: ClassificationTraceTelemetry
   - Time range: Based on timestamp from Kusto
   - Scoping Conditions: Region == <Region>
   - Filtering Conditions: TraceData contains <Impacted FQN>

## Understanding MiddleTier Logs

MiddleTier Logs contain logs of 3 services, events flow in sequence:

1. **EventListenerService** — Receives events and parses classifications
2. **ClassificationService** — Calls MIPs API and receives Labels
3. **ReingestionService** — Calls Purview Ingestion API to update labels on assets

**CorrelationId** is the single identifier that binds all logs across services. Find a CorrelationId that reaches ReingestionService (indicates MIPs was already called).

## Scenario-Based Debugging

### Scenario 1: No label received from MIPs

If ClassificationService shows "not matching any labels":
- MIPs is not sending labels for the request
- **Action**: Transfer ICM to MIPs queue (see below for required info)

### Scenario 2: MatchingLabel found but Reingestion failed

If logs show label returned but reingestion fails with exceptions:
- Rare scenario where MIPs returned labels correctly but Reingestion is failing
- **Action**: Escalate to Purview OfflineTier team

## Transferring ICM to MIPs

Required information for MIPs team:
1. **MIPs RequestId** — from ClassificationRequestLogTelemetry logs
2. **MiddleTier TraceLog Link** — ShortLink with absoluteTime from Geneva
3. **MiddleTier RequestLog Link** — from ClassificationRequestLogTelemetry search

### Getting Request Logs

1. In Geneva, change Events to Search to **ClassificationRequestLogTelemetry**
2. Keep same CorrelationId filter
3. Find the record targeting MIPService — the RequestId is needed by MIPs team
4. Copy the ShortLink with absoluteTime

### MIPs TSG Reference

For details on MIPs support contact: see MIPs TSG section at Supportability wiki path `/Troubleshooting Guides (TSGs)/Classification and sensitivity labels/Missing or incorrectly labeled assets/Label is missing on an asset` (anchor: mips-tsgs)
