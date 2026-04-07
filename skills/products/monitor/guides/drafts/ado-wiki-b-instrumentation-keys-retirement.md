---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Deprecated features/Instrumentation keys retirement"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FDeprecated%20features%2FInstrumentation%20keys%20retirement"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Instrumentation Keys Retirement / Migration to Connection Strings

**Scenario**: Notification for instrumentation key-based global ingestion feature ending; need assistance with switching to connection strings

## Key Dates

- **April 30, 2025**: End of support (deprecated) for global ingestion endpoint
  - Global endpoint will NOT go away on this date
  - After this date: no updates or support for global ingestion endpoint
  - Only TLS 1.2+ will be supported on global endpoints
  - There is NO current official retirement date for when global endpoint ceases to exist

## Global vs Regional Ingestion Endpoints

### Global endpoints (old/original)
Used by default when only an Instrumentation Key is used, or Connection String without regional endpoint:
- dc.applicationinsights.azure.com
- dc.applicationinsights.microsoft.com
- dc.services.visualstudio.com

**NOTE**: Internal Availability test feature uses global endpoint. Microsoft notifications exclude Availability test usage. If all app telemetry uses connection strings with regional endpoints AND Availability tests are used, global endpoint traffic will still appear in ASC ingestion metrics.

### Regional endpoints (recommended)
Follow naming convention with region prefix:
- `*.in.applicationinsights.azure.com` (e.g., `centralus-0.in.applicationinsights.azure.com`)

## Migration Benefits

- Full list: https://docs.microsoft.com/azure/azure-monitor/app/migrate-from-instrumentation-keys-to-connection-strings#new-capabilities
- Successfully sending telemetry via regional endpoint confirms TLS 1.2+ is working

## Scoping: Determine Endpoints Used

- Use ASC to check ingestion endpoints per component
- Determine sources of global endpoint traffic via ingestion tab aggregation

## RP-Specific Migration

### API Management (APIM)
- APIM auto-instrumentation uses instrumentation key by default
- Migration to connection strings: https://learn.microsoft.com/azure/api-management/api-management-howto-app-insights
- **Cases should be coded to and owned by APIM team**
- APIM supports TLS 1.2 and 1.3 for outbound calls

### Power Platform (Dynamics)
- Currently relies on instrumentation key
- Update to support connection strings scheduled for **October 2025**
- **All related cases managed by Power Platform Team (Dynamics)**

## TLS Considerations

- After May 1, 2025: global endpoint only accepts TLS 1.2+
- For TLS deprecation details: See wiki page on TLS 1.0/1.1 deprecation

## Public Documentation

- [Migrate from instrumentation keys to connection strings](https://docs.microsoft.com/azure/azure-monitor/app/migrate-from-instrumentation-keys-to-connection-strings)
