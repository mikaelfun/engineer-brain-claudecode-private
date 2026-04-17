---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Support Topics/I receive no data or cannot run queries/Errors when running queries, or other issue accessing data"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/AMPLS%20(Azure%20Monitor%20Private%20Link%20Scope)/Support%20Topics/I%20receive%20no%20data%20or%20cannot%20run%20queries/Errors%20when%20running%20queries%2C%20or%20other%20issue%20accessing%20data"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AMPLS — Errors When Running Queries / Issues Accessing Data

## Scenario

Questions related to errors or issues accessing data in an AMPLS-configured environment:
- Wants to configure Application Insights to use AMPLS / Private Link.
- All data suddenly stops flowing / querying data suddenly stops returning data.
- Errors when executing queries.

> AMPLS is owned by Azure Monitor but sits on top of Private Link (Azure Networking). Data access issues should be a partnership between Azure Monitor and Azure Networking CSS teams.

## Workflow

1. Complete Data Collection items below.
2. Check Known Issues for potential explanation.
3. Check product-specific troubleshooting paths:

**Application Insights:**
- Check Dropped By Reason in ASC for AMPLS-related codes.
- If AMPLS code found → see [Configuring Network Isolation and Private Link].

**Log Analytics Core:**
- See: Private link troubleshooting guide.

**Log Analytics Agents (AMA):**
- Check [Private Link for Monitor Agent (AMA)]
- Check VM for proper AMPLS name resolution
- Verify AMPLS resource configuration
- Confirm if customer is using AMPLS
- Check if Public Network Access for Ingestion is enabled

## Data Collection

*(No specific data collection items defined for this topic — gather standard AMPLS diagnostics: resource name, subscription, VNet details, DNS configuration, error messages.)*

## Public Documentation

- [Azure Monitor Private Link Scope samples](https://docs.microsoft.com/samples/azure-samples/azure-monitor-private-link-scope/azure-monitor-private-link-scope/)
- [Use Azure Private Link to connect networks to Azure Monitor](https://docs.microsoft.com/azure/azure-monitor/logs/private-link-security)
- [az monitor private-link-scope CLI commands](https://learn.microsoft.com/cli/azure/monitor/private-link-scope?view=azure-cli-latest)

## Recommended Root Cause

See: Root Cause an AMPLS Issue wiki page.
