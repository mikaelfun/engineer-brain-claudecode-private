---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Learning Resources/Training/Course Materials/AMPLs Setup Guide - Hub and Spoke Networks Private Link Design/Add Virtual Network Link in AMPLs -> PE -> Private DNS Zone for the Spoke VNET"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAMPLS%20%28Azure%20Monitor%20Private%20Link%20Scope%29%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAMPLs%20Setup%20Guide%20-%20Hub%20and%20Spoke%20Networks%20Private%20Link%20Design%2FAdd%20Virtual%20Network%20Link%20in%20AMPLs%20-%3E%20PE%20-%3E%20Private%20DNS%20Zone%20for%20the%20Spoke%20VNET"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Overview

In this step, you will add a virtual network link for the Spoke Virtual Network (VNET) into the configured Azure Monitor Private Link Scope (AMPLs) → Private Endpoint (PE) → Private DNS Zone. The goal is to enable seamless DNS resolution/hostname resolution from Web app/Function app (within the Spoke VNET), ensuring traffic remains private and secure.

Reference: [What is a virtual network link?](https://learn.microsoft.com/en-us/azure/dns/private-dns-virtual-network-links)

# Workflow

**Add Virtual Network Link in AMPLs → PE → Private DNS Zone for the Spoke VNET**

1. Navigate to AMPLs → Private Endpoint created previously → search for **DNS configuration** blade → navigate to **privatelink.monitor.azure.com** Private DNS Zone.
2. Select **Virtual network links** → **Add**.
   - Provide a Link Name.
   - Select the Virtual Network used for Web App OR Function App outbound traffic (the Spoke VNET).
   - Enable auto-registration if needed.
   - Click **Create**.
3. Verify that the created Virtual network link status is **Completed**.

# Why This Step Matters

Without a VNet link in the Private DNS Zone, the Spoke VNET cannot resolve the private IP addresses for Azure Monitor endpoints. The DNS queries from the Web App/Function App would fall back to public DNS resolution, bypassing the private endpoint and potentially failing if public access is blocked.

# Public Documentation

- [What is a virtual network link?](https://learn.microsoft.com/en-us/azure/dns/private-dns-virtual-network-links)
