---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Learning Resources/Training/Course Materials/AMPLs Setup Guide - Hub and Spoke Networks Private Link Design/Create (Spoke) VNET for Web App Outbound traffic"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAMPLS%20%28Azure%20Monitor%20Private%20Link%20Scope%29%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAMPLs%20Setup%20Guide%20-%20Hub%20and%20Spoke%20Networks%20Private%20Link%20Design%2FCreate%20%28Spoke%29%20VNET%20for%20Web%20App%20Outbound%20traffic"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Overview

This objective focuses on setting up the Spoke Virtual Network (VNET) that will be used for routing outbound traffic from your Web app or Function App.

Reference: [Create VNET](https://learn.microsoft.com/en-us/azure/virtual-network/quick-create-portal)

# Workflow

**Create VNET for Web App Outbound traffic**

1. Go to the Azure portal and select **Create a resource**.
2. Search for **Virtual Network**.
3. Provide the necessary details such as Subscription, Resource Group, Name, and Region. Then **Create**.
4. Wait for deployment completion.

> Note: When creating the Hub VNET later, ensure the IP ranges do not overlap. If this Spoke VNET uses `10.0.0.0/16`, the Hub VNET should use a different range such as `10.1.0.0/16`.

# Public Documentation

- [Create VNET](https://learn.microsoft.com/en-us/azure/virtual-network/quick-create-portal)
