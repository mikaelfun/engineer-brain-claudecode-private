---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Data Collection Rules (DCR)/Troubleshooting Guides/Troubleshooting Data Collection Rules (DCR)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FData%20Collection%20Rules%20(DCR)%2FTroubleshooting%20Guides%2FTroubleshooting%20Data%20Collection%20Rules%20(DCR)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Data Collection Rules (DCR)

## Documentation

- [DCR Overview](https://docs.microsoft.com/azure/azure-monitor/agents/data-collection-rule-overview)
- [Configure DCR for Azure Monitor Agent](https://docs.microsoft.com/azure/azure-monitor/agents/data-collection-rule-azure-monitor-agent)

## Limit Data Collection with Custom XPath Queries

Since you're charged for any data collected in a Log Analytics workspace, collect only the data you require. Using basic configuration in Azure portal, you have limited ability to filter events.
- [XPath Queries documentation](https://docs.microsoft.com/azure/azure-monitor/agents/data-collection-rule-azure-monitor-agent#limit-data-collection-with-custom-xpath-queries)
- [Shortcut Way to Create XPath Queries for Microsoft Sentinel DCRs](/Monitor-Agents/Agents/Data-Collection-Rules-(DCR)/How-To/Shortcut-Way-to-Create-XPath-Queries-for-Microsoft-Sentinel-DCRs)

## Verify DCR in ASC

Follow wiki article: [How to get Data Collection Rules associated to an Azure resource](/Monitor-Agents/Agents/Data-Collection-Rules-(DCR)/How-To/How-to-get-Data-Collection-Rules-associated-to-an-Azure-resource)

## Debug DCR Issues Using ARM Logs

> **Access Requirements:**
> - Connect to ARMProd Kusto cluster: https://eng.ms/docs/products/arm/data/kustov2/overview_kustov2
> - Must be entitled in [CoreIdentity/ARM Logs (armlogs-pbfu)](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/armlogs-pbfu)

ARM is the gateway for all Azure control plane calls, including CRUD on DCR/DCRA and subscription registration calls.

### Key Tables

**HttpIncomingRequests** - Requests incoming to ARM (customer-triggered):
- Two rows per request (start + end), identified by `TaskName` column
- End request row contains final status code

**Sample Query: DCR Operations**
```kql
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where TIMESTAMP > now(-1h)
| where operationName contains "/PROVIDERS/MICROSOFT.INSIGHTS/DATACOLLECTIONRULES"
| where TaskName !contains "HttpIncomingRequestStart"
| where subscriptionId == "<subscriptionID>"
| take 100
```

**Sample Query: Subscription Registration**
```kql
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where TIMESTAMP > now(-1h)
| where operationName == "/PROVIDERS/MICROSOFT.INSIGHTS/REGISTER"
| where httpMethod == "POST"
| where TaskName !contains "HttpIncomingRequestStart"
| where subscriptionId == "<subscriptionID>"
| take 100
```

**HttpOutgoingRequests** - Requests outgoing from ARM to RPs (e.g., AMCS):

**Sample Query: Calls to AMCS**
```kql
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where TIMESTAMP > now(-15m)
| where TaskName != "HttpOutgoingRequestStart"
| where targetUri contains "eastus.frontend.control.monitor.azure.com"
```

**Sample Query: Subscription State Notifications to AMCS**
```kql
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where TIMESTAMP > now(-15m)
| where TaskName != "HttpOutgoingRequestStart"
| where operationName == "PUT/SUBSCRIPTIONS/"
| where targetUri contains "eastus.frontend.control.monitor.azure.com"
```

## IcM Escalation Paths

| Scenario | Escalation Path |
|----------|----------------|
| **Windows AMA**: Install/uninstall, no heartbeat, missing data, text/IIS logs | Azure Monitor Data Collection/AMA Windows |
| **Linux AMA**: Install/uninstall, no heartbeat, missing data, rsyslog/hardening | Azure Monitor Data Collection/AMA Linux |
| **DCR**: Error creating/deleting DCR, help with creating/associating/viewing DCR | Azure Monitor Control Service (AMCS)/Triage |
