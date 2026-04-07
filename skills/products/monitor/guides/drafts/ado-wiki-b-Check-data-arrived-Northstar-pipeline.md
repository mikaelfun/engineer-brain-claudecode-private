---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Ingestion pipeline/How-to: Check if data arrived in the Northstar pipeline (GT)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FIngestion%20pipeline%2FHow-to%3A%20Check%20if%20data%20arrived%20in%20the%20Northstar%20pipeline%20(GT)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How-to: Check if Data Arrived in the Northstar Pipeline (GT)

> **Important**: Start troubleshooting from the SOURCE towards the DESTINATION, not the other way around.
> - For diagnostic settings data: first follow "Troubleshooting Resource Log data not being received by target destinations"
> - For agent data: follow agent TSGs to validate data collection config and agent is sending data

## Scenario
Validate if records of a specific data type are being correctly received by the Northstar pipeline, and confirm if data is sent to PSS (final component before Kusto ingestion).

## Prerequisites
- Verify the data type (table) is actually ingested via Northstar pipeline
- Follow: HT: Determine which pipeline is processing a given data type

## Key Steps
1. Determine pipeline type (INMEM vs Northstar)
2. Check Northstar pipeline for data arrival
3. Verify PSS delivery (final stage before workspace availability)
4. If data not found at any stage, engage appropriate team:
   - Source/Agent issue -> Agent team
   - Resource Provider issue -> RP team
   - Pipeline issue -> Ingestion PG

> Note: This page is very large (230KB+) with extensive Kusto queries and decision trees. For full content, refer to the source wiki page directly.
