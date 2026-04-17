---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Send data to Fabric and Azure Data Explorer"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FSend%20data%20to%20Fabric%20and%20Azure%20Data%20Explorer"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Public Documentation
[Send data to Fabric and Azure Data Explorer (Preview) - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/send-fabric-destination)

# Troubleshooting

## Does the Managed Identity used for this DCR also apply to the AMA extension?

No. The Managed Identity used for this DCR is only for the purpose of routing data to the Fabric/ADX destination. It does not impact any identities used for the AMA.

## Do all resources need to be in the same region (i.e. VM, DCR, Destination)?

No. Only the DCR and destination resource (Fabric eventhouse/ADX cluster) need to be in the same region.

## Will this process work with any version of AMA?

Customers will need at least **Windows Agent v1.39** or **Linux AMA v1.38** to use this feature.

## Does this process support KQL transformations?

Yes. Custom KQL feature is available on all log types. Details on how to configure are available at [Create a transformation in Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/data-collection/data-collection-transformations-create?tabs=portal)

## Is this feature available in all clouds/regions?

As of Ignite Launch, this feature is available in all public cloud regions except: WCUS, SouthIndia, ItalyNorth, IsraelCentral, WestUS3, WestUS2, EUS, EUS2 and Qatar. Public documentation will be updated once these regions come online.

## Detecting Data is Missing from ADX/Fabric

Identifying the root cause for missing data will involve confirming that data is processed along various points in the pipeline: DCR Processing, Delivery, and ADX/Fabric Ingestion.

### Step 1: Confirm DCR Processing

To confirm that logs are being collected by the Data Collection Rule (DCR):

1. Access the Azure Portal and navigate to the relevant DCR.
2. Under the 'Monitoring' section, select 'Metrics'.
3. Within the Metric filter, choose 'Log Ingestion Bytes per Min'.

The graph will display metrics for logs ingested over the last 24 hours.

You may also run this query to verify any processing done for this DCR:

Kusto Cluster: https://omsgenevatlm.kusto.windows.net/
Database: GenevaNSProd

```kusto
ProcessedChunk
| where TIMESTAMP > ago(1h)
| where DcrId == <Insert dcr Id>
```

If metrics are not showing and/or the above query returns 0 results, check:
- DCR is configured properly and associated to a resource
- Logs are ingested into the pipeline
- AMA agent is configured properly, customer is using the latest version

If metrics are showing and/or the query returns results, proceed to Step 2.

### Step 2: Confirm Data Delivery

To confirm that Delivery Services are sending data to ADX/Fabric destinations:

1. Access the Delivery Dashboard (Grafana) via https://gds-grafana-gveub7c4gxdpcrd4.wus2.grafana.azure.com/goto/UaULMQkvR?orgId=1
2. Select the DCR Region from the Scale Unit filter (all regions are prefixed with "gds-")
3. Enter the Data Collection Rule's Immutable ID in the DCR ID filter (available on DCR Overview page)
4. Adjust the time filter as needed. Default: past 4 hours.

The resulting graphs will display metrics for processed and delivered logs.

- If metrics are **not** showing → transfer ICM to **Observability Pipeline Delivery Services**
- If metrics are showing → proceed to Step 3

### Step 3: Confirm ADX/Fabric Ingestion

1. Confirm ADX cluster is in running state via Azure Portal
2. Review the cluster state on the Overview tab

If the cluster is in any state other than "Running", logs will not ingest properly. Engage ADX support team.
Kusto bot link: https://aka.ms/kai

## Detecting data delays in delivery to ADX/Fabric

Currently, there are no SLAs for services in the Azure Monitor to ADX/Fabric pipeline during public preview. SLAs and monitoring will be introduced when the service reaches General Availability (GA).

If customers inquire on delays, transfer ICM to **Observability Pipeline Delivery Services**.

## IcM Escalation Paths

| Scenario | Escalation Path |
|----------|----------------|
| Windows AMA (install/uninstall, sending logs, incorrect version) | Azure Monitor Data Collection/AMA Windows |
| Linux AMA (install/uninstall, sending logs, incorrect version) | Azure Monitor Data Collection/AMA Linux |
| DCR (error creating, help with creating/associating/viewing) | Azure Monitor Control Service (AMCS)/Triage |
| Delivery (errors/delays delivering data) | Observability Pipeline Delivery Services |
| Storage ADX/Fabric (cluster errors, ingestion issues) | Collab through DFM - see Support Boundary: Azure Data Explorer and Fabric |
