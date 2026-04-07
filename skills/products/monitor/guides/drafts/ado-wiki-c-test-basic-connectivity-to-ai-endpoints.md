---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Validate Network Connectivity/Test Basic Connectivity to Application Insight Endpoints"
sourceUrl: "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Validate%20Network%20Connectivity/Test%20Basic%20Connectivity%20to%20Application%20Insight%20Endpoints"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Test Basic Connectivity to Application Insight Endpoints

## Overview

Connectivity to Application Insights endpoints is required to send telemetry from an application to the ingestion service.

- Live Metrics endpoint is **different** from the ingestion endpoint — both must be reachable for full functionality
- Public endpoint reference: [Azure Monitor endpoint access and firewall configuration](https://learn.microsoft.com/en-us/azure/azure-monitor/fundamentals/azure-monitor-network-access#outgoing-ports)

## Step-by-Step Connectivity Validation

Follow these steps in order, stopping at the first failure:

### Step 1: Validate DNS Resolution
Ensure basic DNS resolution to Application Insights endpoints can occur.
→ See: [Validate DNS connectivity in Application Insights](guides/drafts/ado-wiki-c-validate-dns-connectivity.md)

### Step 2: Check TCP Connectivity
If DNS resolution is successful, verify a basic TCP connection can be established.
→ See: [Validate TCP connectivity in Application Insights](guides/drafts/ado-wiki-c-validate-tcp-connectivity.md)

### Step 3: Verify TLS Connectivity
If DNS and TCP succeed, check for proper TLS handshake.
→ See: [Validate TLS connectivity in Application Insights](guides/ado-wiki-c-validate-tls-known-issue.md)

### Step 4: Address Network Restrictions
If TCP/TLS connectivity is confirmed restricted (via curl or network traces), review potential network restriction reasons.

## Internal References
- [Determine if a web app is using VNET integration](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki)
- [Find out associated VNET for ASE-hosted web apps](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki)
- [Determine name resolutions for VNET integrated web apps](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki)

## Public Documentation
- [Troubleshoot missing application telemetry in Azure Monitor](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/investigate-missing-telemetry)
- [Azure Monitor endpoint access and firewall configuration](https://learn.microsoft.com/en-us/azure/azure-monitor/fundamentals/azure-monitor-network-access#outgoing-ports)
