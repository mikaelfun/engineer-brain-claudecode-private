---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Prometheus/Troubleshooting Guides/TSG Requests to Increase Managed Prometheus Limits"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FManaged%20Prometheus%2FTroubleshooting%20Guides%2FTSG%20Requests%20to%20Increase%20Managed%20Prometheus%20Limits"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG Requests to Increase Managed Prometheus Limits

## Symptom(s)
- Customer has requested to increase a limit for Managed Prometheus.

## Process
- The link at the bottom of the TSG contains the Service Limits for Managed Prometheus including noting which limits can be increased. Please pay attention to which type of limit (**ingestion, query, alert and recording rules**) you are requesting an increase for as these get routed to different teams on the backend.
- If the customer wants to increase limits in multiple areas (e.g increase ingestion limits AND increase query limits) please create one ICM for the ingestion related limits and a separate ICM for the query related limit increase so they can proceed in parallel and be routed to the correct team.

## Ingestion limits

These are the most common limits we see requests to increase. Once the limit is exceeded data will be dropped during ingestion. Please follow this guide for updates to ingestion limits:

| Requested Limit (events or time series) | Guidance | Action to take |
|---|---|---|
| 1M-2M | Request will be approved (barring temporary capacity restrictions) | Create ICM using template below |
| 2M-50M | Utilization should be 50% (for example, if it is using 5M the max requested can be 10M without further engagement from PG) | Create ICM using template below, communicate that max approved will be based on 50% usage |
| 50M+ (Already ingesting a lot of data) | MDM team reviews and approves max allowable limit by their guidelines | Create ICM using template below |
| 50M+ (New AMW requesting high limit from previously low limit) | Raise an exception. PM should be engaged to understand ingestion needs | Reach out to PM Sunayana Singh with contact information |

- Active time series with metrics that have been reported in the last ~12 hours. Default Value: 1,000,000
- Events per minute ingested. Default Value: 1,000,000

**Note:** Capability to increase the ingestion limits for an Azure Monitor Workspace through an ARM/API update is now in public preview and available in all regions. If customer is interested in trying it out, point them to documentation: [Monitor Azure Monitor workspace metrics ingestion](https://learn.microsoft.com/en-us/azure/azure-monitor/metrics/azure-monitor-workspace-monitor-ingest-limits#request-for-an-increase-in-ingestion-limits-preview)

- Once identified or if there is a need to increase the limit, submit ICM with requested limit increase. For Active time series and events per minute ingested, request increase based on the metric values when checking for Metrics Throttling.
  - If at 200%, consider requesting an increase to 2,500,000 so there is room to grow.

## Query limits

There are 3 groups of query limits: general, pre-parsing, and post-parsing.

General query limits are rarely modified except for largest customers exceeding 50M+ active time series. In this group, we can consider modifying limits for time series per metric (150,000 time series) and samples returned (50M per query) on a case by case basis. Other general limits cannot be modified. Route these requests to Sunayana Singh who will reach out to the customer for additional details.

Pre-parsing and post-parsing limits are set quite high by default. These limits can be increased. Please use the ICM template to request an increase.

For many customers the issue may be poorly designed queries versus a need for increasing the limits.

### Pre-parsing limits (based on query time range and request type over a 30-second window):
- Query hours per user (AAD app, managed identity, Managed Grafana workspace): Default 30,000
- Query hours per Azure Monitor workspace: Default 60,000
- Query hours per Azure tenant: Default 600,000

### Post-parsing limits (based on query time range and range vectors over a 30-second window):
- Query hours per user: Default 2,000,000
- Query hours per Azure Monitor workspace: Default 2,000,000
- Query hours per Azure tenant: Default 20,000,000

## Alert and recording rules limits

These limits can be increased. Please use the ICM template to request an increase.

- Rule groups per Azure Monitor Workspace, in an Azure subscription: Default 500

**Note:** The Rules per rule group cannot be updated at this time. Request customers to split up their rule groups until PG advises that it can be increased.
- Rules per rule group: Default 20

## ICM Templates

- **Ingestion limits**: 'Azure Monitor | Azure Managed Prometheus - AMW Quota Requests' - Use Azure Support Center to select the ICM Template. Direct link: [x23314](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=x23314)
- **Query limit increases**: [ICM Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Z183U1)

## Resources
- [Managed Prometheus | Service Limits](https://learn.microsoft.com/azure/azure-monitor/service-limits#prometheus-metrics)
- [Managed Prometheus | Metrics Throttling](https://learn.microsoft.com/azure/azure-monitor/essentials/prometheus-metrics-troubleshoot#metrics-throttling)
