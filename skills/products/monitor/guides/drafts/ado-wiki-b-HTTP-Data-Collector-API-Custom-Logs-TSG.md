---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Data sources/APIs/How to: Investigate HTTP Data Collector API Custom Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FData%20sources%2FAPIs%2FHow%20to%3A%20Investigate%20HTTP%20Data%20Collector%20API%20Custom%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# HTTP Data Collector API Custom Logs - Investigation Guide

> **DEPRECATED**: The Azure Monitor HTTP Data Collector API will no longer be functional as of 9/14/2026. Replaced by the Logs Ingestion API. Advise customers to migrate: https://learn.microsoft.com/azure/azure-monitor/logs/custom-logs-migrate

> **NOT for agent-based custom logs.** For AMA logs, see the respective AMA TSGs.

## Overview
- HTTP Data Collector API allows direct ingestion of logs to a Log Analytics workspace
- AuthN/AuthZ: HMAC based on workspace key
- Table created during ingestion (not pre-defined)
- SourceSystem = "RestAPI"; RawData, Computer, MG columns are empty

## What Uses HTTP Data Collector API
1. Logic App connector (Azure Log Analytics Data Collector)
2. Logstash Connector (output plugin)
3. Azure Container Instances logging, Apache Spark monitoring
4. Some Sentinel Connectors (supported by Sentinel team)
5. Customer-originated custom data collection flows

## Common Limitations
1. Must be HTTP POST
2. Body must be valid JSON
3. Max 30 MB per single POST
4. Max 500 custom fields per table
5. Max 32KB per field content

## FAQ
- **AMPLS support**: HTTP Data Collector API does NOT support AMPLS
- **Identify if table uses Data Collector API**: Use HTTP Data Collector API Dashboard (Kusto). Schema V1=Data Collector/legacy agent, V2=Log Ingestion API, V2Migrated=migrated table

## Troubleshooting: Data Missing

1. Check Operation table / _LogOperation function for errors:
   - "Custom log is V2, Workspace cannot be modified" -> Table migrated to CLV2, blocks new fields via Data Collector API
   - "Custom log limit for workspace reached" -> Max custom log count exceeded

2. Use **HTTP Data Collector API Dashboard** for telemetry

## Common HTTP Errors

### 400 Bad Request (InvalidDataFormat)
- Reserved field name used (Tenant, TimeGenerated)
- Invalid JSON format (validate in VSCode, NOT online tools)
- Invalid data value (datetime not in quotation marks)

### 403 Forbidden
- **InvalidAuthorization (invalid signature)**: Wrong HMAC in custom code, or TLS inspection proxy modifying request
- **Time mismatch (>15 min drift)**: Local system clock out of sync with Azure
- **AMPLS with public ingestion disabled**: Request from outside VNet, ODS drops it
- **DisableLocalAuth = True**: Workspace blocks workspace key auth

### 500 / 503 (Internal Server Error / Service Unavailable)
- Only a problem if rate is significantly high vs 200 OK rate
- 503s normal if < ~15 minutes
- Customer should implement retry with exponential back-off
- If rate is unreasonable, check for outages and open CRI for Ingestion team
