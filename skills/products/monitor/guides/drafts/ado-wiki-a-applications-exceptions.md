---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Boundaries/Application's exceptions"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Support%20Boundaries/Application's%20exceptions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Support Boundary: Application Exceptions in App Insights

## Overview
Application Insights is an APM service that logs application exceptions and errors. The presence of exceptions in telemetry is **expected behavior** - it indicates the product is doing what it is supposed to.

## Key Decision Points

### App Insights Team Handles:
- "Application Insights is **not** logging exceptions" -> Yes, this is our scope

### Route to Other Teams:
- "Why is this exception being thrown?" -> Route to the API/service team
- "How to prevent this exception?" -> Route to the API/service team

## Common Routing

### SQL Exceptions
- On-Prem SQL: `SQL Server\SQL Server 2019\SQL Server Connectivity\Network errors (intermittent)`
- Azure SQL DB: `Azure\SQL Database\Connectivity: Troubleshoot DB Availability and Connection Errors`

## Data Collection (for external engagement)
- Precise ask to the external team
- Resource URIs of the product/service involved with Application Insights
- Application Insights resource URI

## SAP Routing
Depends on which API or library is involved. When in doubt, reach out to SME/TA for guidance.
