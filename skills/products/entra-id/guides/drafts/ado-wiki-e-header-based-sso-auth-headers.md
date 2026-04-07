---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Native Header-based SSO Sent Authentication Headers"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Native%20Header-based%20SSO%20Sent%20Authentication%20Headers"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Native Header-based SSO — Inspecting Authentication Headers

How to inspect/verify the authentication headers that Microsoft Entra Application Proxy sends to the backend server during header-based SSO.

## Client Side

Authentication headers are NOT visible on the client side — they are constructed in Entra and sent by the connector to the web application.

## Microsoft Entra Application Proxy Cloud Service

> Headers values are NOT visible at this layer — only header names/statistics.

### Option A: Kusto Query

Follow the transaction flow using the TransactionId:

```kql
let tran = 'TRANSACTION_ID';
let transdate = datetime("YYYY-MM-DDTHH:MM:SS");
Traces
| where TIMESTAMP > transdate-5m and TIMESTAMP < transdate+5m
    and (TransactionId == tran or Message contains tran)
| project TIMESTAMP, Message, TransactionId, SubscriptionId
```

### Option B: DataExplorer Dashboard

Configure the correct tenant and use the dashboard to view header-based authentication statistics in the last 24 hours:

[DataExplorer Dashboard Link](https://dataexplorer.azure.com/dashboards/116d5e2c-996e-4410-b7bc-d912537dc9db)

## Connector Level

### Option A: Data Collector Script

Collect `AppProxylog.bin` or `COMPUTERNAME-HTTP-network.etl` files using the Data Collector Script. Convert using InsightWebClient.

### Option B: Network Trace (HTTP internal URL)

If internal URL uses `http://`, collect a network trace to check headers. Use the Data Collector Script.

### Option C: Fiddler (HTTPS internal URL)

If internal URL uses `https://`, use Fiddler to inspect SSL traffic between connector and web app.

## Backend Server

### Option A: IIS Advanced Logging

Configure custom logging to capture request headers in IIS logs.

Reference: [Advanced Logging for IIS - Custom Logging](https://docs.microsoft.com/iis/extensions/advanced-logging-module/advanced-logging-for-iis-custom-logging)

### Option B: Test App

Use the simple web page that displays request headers received by the web application.

### Option C: Vendor Involvement

Engage the vendor of the backend server to inspect received headers.

## Diagnostic Flow

1. Start at **Backend Server** — most direct way to see actual header values
2. If backend can't log → use **Connector** network trace/Fiddler
3. For transaction flow tracking → use **Cloud Service** Kusto query
4. **Client side** cannot see these headers (by design)
