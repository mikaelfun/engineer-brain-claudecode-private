---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Validate Network Connectivity/Validate AMPLS Connectivity"
sourceUrl: "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Validate%20Network%20Connectivity/Validate%20AMPLS%20Connectivity"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Validate AMPLS Connectivity

## Overview

**Azure Monitor Private Link Scope (AMPLS)** is a feature layer that defines the DNS mapping between public Application Insights endpoints and private link endpoint resources.

Connectivity starts with DNS resolution. AMPLS intercepts the `*.privatelink.monitor.azure.com` CNAME and maps it to a private IP address.

## Steps to Validate DNS Mapping with AMPLS

1. Get the Application Insights ingestion endpoint being used
2. From the client resource (App Service, Azure VM, or on-premises):
   - Run `nslookup` against the ingestion endpoint (or Live Metrics endpoint)
   - Note the resolved IP address (second "Address" value in output)
3. Navigate to the Application Insights resource → **Network Isolation**
   - This shows the AMPLS resource linked to the AI resource
4. Click on the AMPLS resource → **Private Endpoint connections**
   - View the Private Endpoint linked to AMPLS
5. Click on the Private Endpoint → **DNS Configuration**
   - Compare the IP address listed in DNS Configuration with the IP resolved by the client
   - ✅ If IP addresses match → AMPLS DNS mapping is valid and working
   - ❌ If IP addresses do not match → investigate DNS configuration

## Key Concept

All Application Insights endpoints use a `*.privatelink.monitor.azure.com` CNAME in the resolution chain:
```
{region}.in.applicationinsights.azure.com
  → {region}.in.ai.monitor.azure.com
  → {region}.in.ai.privatelink.monitor.azure.com   ← AMPLS intercepts here
  → (private IP or public IP via traffic manager)
```

When AMPLS is properly configured, `*.privatelink.monitor.azure.com` resolves to a private IP from the Private Endpoint.

## Related
- [Test Basic Connectivity to AI Endpoints](guides/drafts/ado-wiki-c-test-basic-connectivity-to-ai-endpoints.md)
- [Validate DNS connectivity in Application Insights](guides/drafts/ado-wiki-c-validate-dns-connectivity.md)
