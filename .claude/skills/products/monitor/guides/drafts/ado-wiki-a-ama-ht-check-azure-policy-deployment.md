---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Check the Azure Policy deployment and remediation status"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/How-To/AMA%3A%20HT%3A%20Check%20the%20Azure%20Policy%20deployment%20and%20remediation%20status"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
In some cases, Azure Monitor Agent (AMA) can be deployed via a policy. This how-to will go throught the steps to verify the policy deployment and remediation status.

# Process
- Confirm with the customer which policy was assigned. You can find some built-in policies and initiatives in this public documentation: [Use Azure Policy to Install the Azure Monitor Agent - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-policy)

- Navigate to the Policy page in the Azure portal and look for the policy assignment blade. For example, the built-in policy initiative "Configure Windows machines to run Azure Monitor Agent and associate them to a Data Collection Rule":
![image.png](/.attachments/image-bc999ae6-3eb8-4a79-820b-c688b4a6cd43.png)

- Select the policy and click on "View compliance" at the top.

- Check if the resources are compliant or not. From the example screenshot below, we can see that there is one resource that is not compliant, meaning that it does not have the AMA installed.
![image.png](/.attachments/image-dcc22f8b-8d2d-4a26-9132-b630272cd7b0.png)

- The same can be checked if a remediation task was run for a policy. Select the remediation task that was executed as shown in the example below. Click on the three dots on the right to view the task and get information on the scoped resources:
![image.png](/.attachments/image-ddd0bc7c-03a8-4b7d-bd6f-6d3e1811eb79.png)

If there are issues with the policy assignment or the remediation task, assistance can be requested from the Policy team. Please open a collaboration with this SAP: Azure/Azure Policy/Policy behavior not as expected/Remediation task behavior not as expected

# Common Issues
#88769