---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Data sources/APIs/Ingest events from Azure Event Hub to Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FData%20sources%2FAPIs%2FIngest%20events%20from%20Azure%20Event%20Hub%20to%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Ingest Events from Azure Event Hub to Logs - TSG

## Prerequisite
- Workspace must be linked to a dedicated cluster
- Check via: HT: Check if a workspace is linked to a dedicated cluster

> **Note**: The prerequisite for commitment tier/dedicated cluster is only checked at first-time setup. If workspace later moves to PAYG tier, ingestion continues unless DCR and DCRA are removed.

## Common Issues

### BadRequest(400) Creating DCR
- Error: "Event Hub data imports are only available with LACluster and CapacityReservation SKUs"
- Solution: Link workspace to dedicated cluster with proper SKU

### Data Stops After Tenant Move
- Solution: Recreate DCR MSI and reassign permissions to event hub

### Unsupported Region
- Solution: Verify region is supported per docs

### DCRA Creation Fails
- Solution: Grant Azure Event Hubs Data Receiver/Owner role to DCR MSI on event hub namespace

### Data Only in RawData/TimeGenerated Columns
- Solution: Add transformKql to DCR to extract values for columns (no automatic parser)

### Data Not Flowing
Checklist:
1. Workspace linked to dedicated cluster with correct setup
2. Event Hub namespace, event hub, consumer group all exist and match DCR config
3. Consumer group in DCR matches event hub consumer group (default: $Default)

Error in Operation table: "Event Hub Connection Error. make sure event hub xxxx exist under event hub namespace xxxx"

## Useful Kusto Queries

### Get workspace from snapshot (AMSTelemetry):
```kql
WorkspaceHistoryV2
| where SnapshotTimestamp > ago(1d)
| where WorkspaceId == "<WORKSPACE_ID>"
```

### Ingestion failures (dependencies) - via ASC Draft Telemetry:
```kql
dependencies
| where customDimensions.EventHubNamespace == "<NS>" and customDimensions.EventHubName == "<EH>"
| where success == false
```

### General errors - via ASC Draft Telemetry:
```kql
exceptions
| where customDimensions.EventHubNamespace == "<NS>" and customDimensions.EventHubName == "<EH>"
```

## IcM Escalation
Feature area: "Custom Logs Ingestion pipeline - Ingestion" under Log Analytics Core IcM template
