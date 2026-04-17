---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Learning Resources/Training/Course Materials/AMPLs Setup Guide - Hub and Spoke Networks Private Link Design/Enable (Spoke) VNET Integration in the Web App's outbound traffic configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAMPLS%20%28Azure%20Monitor%20Private%20Link%20Scope%29%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAMPLs%20Setup%20Guide%20-%20Hub%20and%20Spoke%20Networks%20Private%20Link%20Design%2FEnable%20%28Spoke%29%20VNET%20Integration%20in%20the%20Web%20App%27s%20outbound%20traffic%20configuration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Overview

In this step, you will integrate the Web app or Function app with the Spoke Virtual Network (VNET). The goal is to establish a secure connection between the Web app/Function app and the Spoke VNET, enabling the app to route its outbound traffic through the Spoke VNET.

Reference: [Enable integration with an Azure virtual network - Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/configure-vnet-integration-enable)

# Workflow

**Enable VNET Integration in the Web App's or Function App's outbound traffic configuration**

1. Navigate to Web App or Function App → **Networking** blade.
2. Search for **Outbound traffic configuration** → **Virtual Network Integration**.
3. Click **Add Virtual Network Integration**.
4. Select the VNET which was created for Web App/Function App Outbound traffic (the Spoke VNET).
5. Specify the subnet range for the VNET and click **Connect**.
6. Verify that the expected VNET is connected/integrated.

# Public Documentation

- [Enable integration with an Azure virtual network - Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/configure-vnet-integration-enable)
