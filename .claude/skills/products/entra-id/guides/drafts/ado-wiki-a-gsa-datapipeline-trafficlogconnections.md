---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA DataPipline TrafficLogConnections"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGSA%20DataPipline%20TrafficLogConnections"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA DataPipeline - Connections (Traffic Logs)

## Background

The traffic logs in the Global Secure Access solution provide a comprehensive record of network activities, including source/destination data, timestamps, and activity types. These logs are essential for IT, networking, and security teams to identify suspicious patterns, detect anomalies, investigate incidents, and understand information flow.

Current traffic logs face two main challenges: usability and data platform load. The logs are flat representations without aggregation or hierarchy, making it complex for admins to understand and troubleshoot issues.

A **connection** represents multiple transactions sharing a single Flow Correlation Id (AKA Connection Id).

## How to Query Connections via ASC Graph Explorer

1. Go to [Azure Support Center Portal](https://aka.ms/azuresupportcenter) and insert the Case Id.
2. Navigate to **Graph Explorer** Tab in the left pane.
3. Insert in Query URL:

```
networkaccess/logs/connections
```

### Query with Filters/OrderBy

```
networkaccess/logs/connections?$filter=trafficType eq 'internet'
networkaccess/logs/connections?$filter=createdDateTime ge 2025-03-24T05:56:07.000Z and trafficType eq 'private'
networkaccess/logs/connections?$filter=status eq 'closed'&$orderby=endDateTime desc
```

### Explore Transactions within a Connection

1. Get the relevant connectionId from the connections query result.
2. Run query:

```
networkaccess/logs/traffic?$filter=connectionId eq 'LSxR/741zkOaMlBU.0'
```

Replace with desired connection Id.

## ICM Escalations

Microsoft Network as a Service / ZTNA Data Pipeline: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=j1L1U3
