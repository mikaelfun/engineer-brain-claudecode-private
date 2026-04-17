---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Learning Resources/Training/Course Materials/AMPLs Setup Guide - Hub and Spoke Networks Private Link Design/Test the Azure Monitor Private Link Connection"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAMPLS%20%28Azure%20Monitor%20Private%20Link%20Scope%29%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAMPLs%20Setup%20Guide%20-%20Hub%20and%20Spoke%20Networks%20Private%20Link%20Design%2FTest%20the%20Azure%20Monitor%20Private%20Link%20Connection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Overview

The goal is to verify that the Application Insights **Ingestion Endpoint and Live Endpoint** DNS resolution aligns with the Private IPs/FQDNs configured in the Azure Monitor Private Link Scope (AMPLs) → Private Endpoint (PE) → Private DNS Zone.

This guide offers a comprehensive approach on testing the Azure Monitor Private Link Connection to ensure network traffic is correctly routed through private endpoints.

# Workflow

**Test the Azure Monitor Private Link Connection**

1. The Web App or Function App should now be able to send monitoring data to the configured Application Insights component over the private IP address.
2. To verify, go to monitored Web App or Function App → (SSH) **Console** and perform a DNS (nslookup) test on the configured Application Insights component's **Ingestion Endpoint** and **Live Endpoint**.
3. Verify that endpoints are resolving to **associated Private IP addresses** (from the AMPLs → PE → Private DNS Zone configuration).

**Example nslookup test (from App Service Console/SSH)**:

```bash
# Test Ingestion Endpoint
nslookup dc.services.visualstudio.com

# Test Live Endpoint
nslookup live.applicationinsights.azure.com
```

Expected result: Both endpoints should resolve to **private IP addresses** from your Private DNS Zone, not public IPs.

# What to Check if DNS Resolution Returns Public IPs

- Verify the Virtual Network Link for the Spoke VNET has been added to the Private DNS Zone (see guide: `ado-wiki-b-ampls-add-vnet-link-to-private-dns-zone.md`)
- Verify VNET Peering between Spoke and Hub VNETs is in **Connected** state
- Verify the Web App's VNET Integration is configured to route all traffic through the Spoke VNET
- Ensure AMPLS Ingestion Access Mode is set to **Private Only**

# Public Documentation

- N/A
