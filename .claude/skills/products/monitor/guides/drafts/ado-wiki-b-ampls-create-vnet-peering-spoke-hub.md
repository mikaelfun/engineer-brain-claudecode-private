---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Learning Resources/Training/Course Materials/AMPLs Setup Guide - Hub and Spoke Networks Private Link Design/Create VNET Peering between the Spoke VNET and the Hub VNET"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAMPLS%20%28Azure%20Monitor%20Private%20Link%20Scope%29%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAMPLs%20Setup%20Guide%20-%20Hub%20and%20Spoke%20Networks%20Private%20Link%20Design%2FCreate%20VNET%20Peering%20between%20the%20Spoke%20VNET%20and%20the%20Hub%20VNET"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Overview

In this step, you will configure peering between the Spoke VNET (configured for Web App Outbound Traffic) and the Hub VNET (configured for AMPLs/Private Endpoint). The goal is to establish a secure and efficient connection between the two VNETs, enabling seamless communication.

Reference: [Azure Virtual Network peering](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview)

# Workflow

**Create VNET Peering between the Spoke VNET and the Hub VNET**

1. Go to the Azure portal → search for **Virtual networks**.
2. Navigate to the VNET created for Web App/Function App Outgoing traffic.
3. Select **Peerings** under **Settings** → Click **+ Add** to create a new peering.
4. Configure the remote VNET peering:
   - Provide a name for the remote VNET peering (e.g., `VNETForWebAppOutboundTraffic`).
   - Select the deployment model of the remote VNET.
   - Select the subscription of the AMPLs-PE VNET (Hub VNET).
   - **Allow virtual network access**: Enable this option to allow traffic between the VNETs.
5. Configure the local VNET peering:
   - Provide a name for the local VNET (e.g., `VNETForAMPLs-PE`).
   - **Allow virtual network access**: Enable this option.
   - Click **Add**.
6. Verify the Peering state is **Connected**.

# Public Documentation

- [Azure Virtual Network peering](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview)
