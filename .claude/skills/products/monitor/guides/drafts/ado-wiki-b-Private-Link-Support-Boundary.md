---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Boundaries/Support Boundary: Azure Monitor Private link"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FSupport%20Boundaries%2FSupport%20Boundary%3A%20Azure%20Monitor%20Private%20link"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Support Boundary: Azure Monitor Private Link

## Overview

If customer is using Azure Private Link to securely connect networks to Azure Monitor, there might be a need for collaboration between Azure Monitor and Azure Networking team to resolve customer issue.

Azure Private Link allows you to securely link Azure PaaS services to your virtual network using private endpoints. Azure Monitor is a constellation of different interconnected services that work together to monitor your workloads. A resource called Azure Monitor Private Link Scope (AMPLS) defines the boundaries of your monitoring network and connects to your virtual network.

## Boundaries

If it's not clear whether the case falls within Azure Monitor support boundaries, accept ownership of the case, perform FQR actions and engage with the customer. Once you understand the issue, follow the below guidelines.

## Monitor Issues (Azure Monitoring Queue)

| Issue Description | Queue |
|--|--|
| Issues related to Azure Monitor Private Link Scope (AMPLS) | Azure Monitoring |
| Connecting AMPLS to Azure Monitor resources | Azure Monitoring |
| Issues related to Log Analytics workspace, Billing, retention | Azure Monitoring |
| Issues related to Application Insights component, Billing, retention | Azure Monitoring |
| Issues related to Agents, enabling monitoring, troubleshooting agent | Azure Monitoring |
| Issues related to App Insights, configuring SDK or auto-instrumentation, troubleshooting SDK and attach scenarios | Azure Monitoring |
| Issues related to data ingestion, verify it works when connected through public network (internet) | Azure Monitoring |
| Issues related to Monitor endpoints | Azure Monitoring |

## Networking Issues (Azure Networking Queue)

| Issue Description | Queue |
|--|--|
| Issues related to VNET configuration, configuring VNet, troubleshooting VNet issues, issues related to Express Route | Azure Networking |
| Issues related to configuring Private Endpoints, Creating/deleting private endpoint | Azure Networking |
| Issues related to DNS configuration, providing guidance if customer is using custom DNS, troubleshooting name resolution | Azure Networking |
| Issues related to Azure Private Link, testing private link connectivity using networking TSG | Azure Networking |
| Help with troubleshooting if data is not reaching Azure Monitor through private link but works when using public network (only after confirming that there is no issue with Agent or App Insights SDK Configuration) | Azure Networking |
