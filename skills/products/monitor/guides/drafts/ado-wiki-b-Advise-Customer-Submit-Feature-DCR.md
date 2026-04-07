---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/General/How to advise a customer to submit a feature or design change request for Azure Monitor"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAzure%20Monitor%2FHow-To%2FGeneral%2FHow%20to%20advise%20a%20customer%20to%20submit%20a%20feature%20or%20design%20change%20request%20for%20Azure%20Monitor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Design Change Request

The DCR process is available to Unified customers. The purpose of the Design Change Request (DCR) process is to capture differences between customer requirements and product capabilities. The process is initiated when the customer opens a support request and the root cause of the reported issue is identified as being a result of the expected design or a limitation of the expected design and the customer is seeking to have that design changed.

For more information on the CSS official guidance around DCRs, see article [Procedure: Bug Cases and Design Change Requests](https://internal.evergreen.microsoft.com/en-us/topic/0e6483d1-961f-ed26-4586-97ee5a791250).

> **Note**: Azure Carbon Optimization does not utilize the DCR process and only accepts feedback through the Azure Feedback process.

## Steps to Initiate a DCR:

1. Confirm that you are looking to submit a design change request for an Azure Monitor product or service.
2. Engage the Incident Manager (IM) for the customer. Identify the IM under Contacts in the support request. If no IM, engage the CSAM.
3. Provide the IM with:
   - The relevant support request number
   - The customer contact that the IM should engage
   - A clear and concise description of the request
   - Analysis detailing available workarounds, why they are not suitable, and negative impact
   - Information on how the fix/change will benefit other Microsoft customers
4. Request the IM engage with the customer and provide:
   - Impact on the customer's business (including cost analysis)
   - Loss of business to Microsoft if fix is not implemented
   - Determination if Critical or Non-Critical

**Critical DCR (cDCR)**: A requested change to a currently released product when the product works as designed but doesn't meet the customer's requirements, and the customer has a critical need.

**Non-Critical DCR (ncDCR)**: A change request for a future product version when the behavior doesn't meet customer needs.

5. Submit a new DCR request using the appropriate link:

| Product | Non-Critical DCR | Critical DCR |
|:--------|:-----------------|:-------------|
| Alerts | https://aka.ms/azmon/ncDCR-Alerts | https://aka.ms/azmon/cDCR-Alerts |
| Application Insights | https://aka.ms/azmon/ncDCR-ApplicationInsights | https://aka.ms/azmon/cDCR-ApplicationInsights |
| Container Insights | https://aka.ms/azmon/ncDCR-ContainerInsights | https://aka.ms/azmon/cDCR-ContainerInsights |
| Data Collection Rules | https://aka.ms/azmon/ncDCR-DCRs | https://aka.ms/azmon/cDCR-DCRs |
| Log Analytics | https://aka.ms/azmon/ncDCR-LogAnalytics | https://aka.ms/azmon/cDCR-LogAnalytics |
| Monitor Agent (AMA) for Linux | https://aka.ms/azmon/ncDCR-AMALinux | https://aka.ms/azmon/cDCR-AMALinux |
| Monitor Agent (AMA) for Windows | https://aka.ms/azmon/ncDCR-AMAWindows | https://aka.ms/azmon/cDCR-AMAWindows |
| Monitoring Essentials | https://aka.ms/azmon/ncDCR-MonitoringEssentials | https://aka.ms/azmon/cDCR-MonitoringEssentials |
| Workbooks | https://aka.ms/azmon/ncDCR-Workbooks | https://aka.ms/azmon/cDCR-Workbooks |

> Ensure that you populate the **Related Support Cases** value with your support request number (found under Teams tab).
> VM Insights and Managed Grafana DCRs: email azmonpodserviceta@microsoft.com.

6. Provide the ADO work item link to the IM and log it in case notes.
7. **Non-Critical DCR**: Update customer, seek approval to close.
8. **Critical DCR**: Update customer, keep SR open. PG should respond within 1 week. Status: "Waiting on product team".
9. Submit for manager recovery (product design doesn't match customer requirements).

# Azure Feedback

Available to all customers. Allows customers to suggest features directly to the product group.

1. Navigate to the appropriate feedback forum and check for existing ideas.
2. If not already suggested, submit a new idea with the appropriate category.
3. Submit for manager recovery.

## Feedback Forums

| Forum Name | Notes |
|:-----------|:------|
| [Azure Monitor](https://aka.ms/AzureMonitorFeedback) | All Azure Monitor products unless otherwise identified |
| [Azure Carbon Optimization](https://feedback.azure.com/d365community/forum/1694d59b-a692-ee11-be37-00224827362a) | |
| [Azure Managed Grafana](https://feedback.azure.com/d365community/forum/407d7fd4-f8db-ec11-a7b5-000d3a8d7a54) | |
| [Resource Health and Service Health](https://feedback.azure.com/d365community/forum/f36c61ce-0625-ec11-b6e6-000d3a4f07b8) | Also via Health history blade feedback link |

# Partner Solutions

Known publicly as Azure Native Integrations, feedback is captured through [Microsoft Developer Community](https://developercommunity.microsoft.com):
- [Datadog](https://developercommunity.microsoft.com/datadog)
- [Dynatrace](https://developercommunity.microsoft.com/dynatrace)
- [Elastic](https://developercommunity.microsoft.com/elastic)
- [NewRelic](https://developercommunity.microsoft.com/newrelic)

> No forum for Logz.io as there are no intentions of adding features to that service.
