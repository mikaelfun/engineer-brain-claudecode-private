---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Elastic SAN/How Tos/Elastic SAN Jarvis Logs_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/pages/SME%20Topics/Azure%20Elastic%20SAN/How%20Tos/Elastic%20SAN%20Jarvis%20Logs_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Elastic SAN Jarvis Logs Investigation

## Jarvis Configuration

1. Open [Jarvis/MDM](http://aka.ms/jarvis) > **Logs** section
2. Select **DGRep** subsection
3. Configure query parameters:

| Parameter | Value |
|-----------|-------|
| Endpoint | Diagnostics PROD |
| Namespace | ElasticSAN |
| Events | ServiceApiQosEvent, ServiceBackgroundActivityEvent, ServiceConfigurationActivityEvent, ServiceOperationActivityEvent, ServiceSystemActivityEvent |
| Time range | Time range of the issue |
| Scoping conditions | Tenant == regional Elastic SAN tenant (e.g., ElasticSanCentralIndia) |

## Investigation Workflow

1. Query **ServiceApiQosEvent** to fetch all ElasticSAN operations against the resource
2. Note the **correlationId** for the operation you're investigating (e.g., PutElasticSanOperation)
3. Use the correlationId in **filtering conditions** to pull detailed logs from all tables:
   - ServiceApiQosEvent
   - ServiceBackgroundActivityEvent
   - ServiceConfigurationActivityEvent
   - ServiceOperationActivityEvent
   - ServiceSystemActivityEvent

## Sample Queries

- List all operations: https://jarvis-west.dc.ad.msft.net/10239915
- Detailed trace by correlationId: https://jarvis-west.dc.ad.msft.net/39643FDA
