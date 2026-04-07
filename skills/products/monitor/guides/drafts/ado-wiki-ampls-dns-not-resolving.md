---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Support Topics/I receive no data or cannot run queries/DNS not resolving to correct IP address"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAMPLS%20(Azure%20Monitor%20Private%20Link%20Scope)%2FSupport%20Topics%2FI%20receive%20no%20data%20or%20cannot%20run%20queries%2FDNS%20not%20resolving%20to%20correct%20IP%20address"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AMPLS DNS Not Resolving to Correct IP Address

## Scenario
- DNS resolution does not show expected IP for Azure Monitor endpoints when using AMPLS
- Client resolves FQDN to incorrect or public IP

## Workflow
1. Complete Data Collection items below
2. Check Known Issues section
3. AMPLS is a layer on top of Private Link (owned by Azure Networking) - troubleshooting is a partnership between Azure Monitor and Azure Networking teams

### By Component

**Application Insights:**
1. Check Dropped By Reason for related codes in ASC (Read Aggregate by Dropped By Reason or Dropped)
2. If Dropped by Reason indicates AMPLS-related issue, see Configuring Network Isolation and Private Link
3. **Stale Private DNS Zone** can lead to failed name resolutions and affect telemetry ingestion

**Log Analytics Core:**
- See Private Link troubleshooting guide

**Log Analytics Agents (AMA):**
- Check VM for Proper AMPLS Name Resolution
- Verify AMPLS resource configuration
- Confirm customer is using AMPLS
- Check if Public Network Access For Ingestion is Enabled

## Data Collection
- Is it client-specific or all clients get the wrong IP?
- What is the endpoint URL to be resolved?
- What is the IP being returned to the client?
- What is the expected IP?
- What does the AMPLS resource show with regards to the address?

## Public Documentation
- [Azure Monitor Private Link Scope samples](https://docs.microsoft.com/samples/azure-samples/azure-monitor-private-link-scope/azure-monitor-private-link-scope/)
- [Use Azure Private Link to connect networks to Azure Monitor](https://docs.microsoft.com/azure/azure-monitor/logs/private-link-security)
- [az monitor private-link-scope CLI commands](https://learn.microsoft.com/cli/azure/monitor/private-link-scope?view=azure-cli-latest)
