---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Azure Policy/How to view Azure Policy policy definitions in Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAzure%20Monitor%2FHow-To%2FAzure%20Policy%2FHow%20to%20view%20Azure%20Policy%20policy%20definitions%20in%20Azure%20Support%20Center"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to view Azure Policy policy definitions in Azure Support Center

## Introduction

For more information on Azure Policy, see the Azure Policy wiki at https://supportability.visualstudio.com/AzureDev/_wiki/wikis/AzureDev/401876/Start-Here

For details on seeing customer policy configurations in ASC, see https://supportability.visualstudio.com/AzureDev/_wiki/wikis/AzureDev/401889/Get-customer-configuration

## Instructions

1. Open the support request in Azure Support Center
2. Navigate to Resource Explorer
3. In the left hand navigation pane, click on the subscription
4. Locate and click on the **Policy** tab
5. Click on the **Policy definitions** anchor to jump down to that section
6. Locate the policy definition you are interested in and expand to see additional information including the policy definition in JSON format

> **Note**: Only custom policy definitions are shown in this interface. Built-in policy definitions should be viewed in the Azure portal as they will exist for all subscriptions including Microsoft internal subscriptions.
