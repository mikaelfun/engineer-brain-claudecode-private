---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/Asset ingestion workflow description"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/Asset ingestion workflow description"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Asset Ingestion Workflow Description

## Overview

Asset ingestion workflow in Purview:

1. **DB Source** traverses and reads data
2. **Integration Runtime** creates ingestion job, writes raw assets to **Staging Storage** (managed storage account)
3. **Ingestion Service** pulls from staging, aggregates into Resource Sets if needed
4. **Ingestion Service** sends offline notifications to OT & calls **Data Map Service**
5. **Data Map Service** persists assets, sends RS notification to OT
6. **Offline Tier (OT)** scheduled job enriches RS: calculates size, partition count, updates schema & classifications, then re-ingests to Data Map

**Important**: Advanced Resource Set must be enabled from UI for OT job functions. Wait ~12 hours for OT job to complete re-ingestion.

## During Traverse and Read

When IR traverses data source, Purview:
1. Discovers assets
2. Matches Resource Set patterns
3. Samples data
4. Retrieves Schema (if classified) or basic Entities/Relationships
5. Classifies data
6. Creates Entities/Relationships

## Kusto Tables Reference

| Table | Description | Component |
|-------|-------------|-----------|
| DataScanAgentLinuxEvent | Raw assets discovered for Azure IR. Query correct Kusto endpoint per region. | Integration Runtime |
| TraceGatewayLocalEventLog | Raw assets discovered for Self-Hosted IR | Integration Runtime |
| CustomLogEvent | Verbose runtime log and error callstack | Integration Runtime |
| ScanningLog | Scanning details (which IR used, etc.) | Integration Runtime |
| OnlineTierIngestionDetails | Request and runtime details in ingestion service | Ingestion Service |
| OnlineTierWebRequests | Data Map HTTP request status | Data Map Service |
| OnlineTierDetails | Data Map request detail | Data Map Service |
| OnlineTierDetailsPrivacy | Data Map request payload | Data Map Service |

## ConvertedEntities Log

Query `DataScanAgentLinuxEvent` with `Message has "ConvertedEntities"`:

- **referredEntities**: columns info, classification info, parent level info
  - Column attributes: displayName, columnType, qualifiedName
  - Classifications: confidence score, category (e.g., MICROSOFT.GOVERNMENT.CITY_NAME)
  - Parent: location, resourceGroupName, subscriptionId, typeName

- **entity**: asset attributes, sampling status, collection info
  - File assets: fileName, path, schemaType, resourceId, ownership, modification timestamps
  - Container/folder assets: location, itemName, traversedLeafCount, traversedLeafNodes

## Scope and Responsibility

Troubleshoot based on workflow and check respective Kusto tables before escalating. Describe all troubleshooting steps and attach logs per "Logs Required for Escalation" TSG.
