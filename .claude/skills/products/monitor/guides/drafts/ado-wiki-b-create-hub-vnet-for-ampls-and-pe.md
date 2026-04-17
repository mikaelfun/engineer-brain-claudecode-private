---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Learning Resources/Training/Course Materials/AMPLs Setup Guide - Hub and Spoke Networks Private Link Design/Create (Hub) VNET for AMPLs and PE"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/AMPLS%20(Azure%20Monitor%20Private%20Link%20Scope)/Learning%20Resources/Training/Course%20Materials/AMPLs%20Setup%20Guide%20-%20Hub%20and%20Spoke%20Networks%20Private%20Link%20Design/Create%20(Hub)%20VNET%20for%20AMPLs%20and%20PE"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Overview

This objective focuses on creating the Hub Virtual Network (VNET) that will be used for Azure Monitor Private Link Scope (AMPLs) and Private Endpoint (PE).

Reference: [Create a virtual network](https://learn.microsoft.com/en-us/azure/virtual-network/quick-create-portal)

## Workflow

**Create Hub VNET for AMPLs and PE**

1. Go to the Azure portal and select **Create a resource**.

2. Search for **Virtual Network**.

3. Provide the necessary details: Subscription, Resource Group, Name, and Region. Then **Create**.

4. **Important**: Select a default Subnet IP address range that does NOT overlap with the Spoke VNET for Web App OR Function App Outbound traffic.
   - Example: If Spoke VNET uses **10.0.0.0/16**, configure Hub VNET default Subnet IP address to **10.1.0.0/16**.

5. Wait for deployment completion.

## Public Documentation

- [Create a virtual network](https://learn.microsoft.com/en-us/azure/virtual-network/quick-create-portal)
