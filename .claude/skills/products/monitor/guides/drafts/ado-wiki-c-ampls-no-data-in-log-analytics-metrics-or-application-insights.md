---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Support Topics/I receive no data or cannot run queries/No data in Log Analytics, Metrics, or Application Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/AMPLS%20(Azure%20Monitor%20Private%20Link%20Scope)/Support%20Topics/I%20receive%20no%20data%20or%20cannot%20run%20queries/No%20data%20in%20Log%20Analytics%2C%20Metrics%2C%20or%20Application%20Insights"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Scenario

*Questions related to no data showing in Log Analytics, Metrics, or Application Insights*

- Data suddenly stops flowing to the resource(s)
- Querying data suddenly stops returning data

# Workflow

1. Complete any Data Collection items from this page below.
1. Check the Known Issues section below, for potential explanation.
1. Azure Monitor Private Link Scope or AMPLS is a feature created and owned by Azure Monitor, it is a layer that sits on top of Private Link. Private Link is a feature / resource owned by Azure Networking. Keep this in mind as these issues are *not* solely owned by Azure Networking these issues should be a partnership between the two teams.
1. Validate Known Good AMPLS configuration.

**Application Insights:**
1. Check Dropped By Reason for related codes in ASC.
1. Ensure the web app, function, or resource hosting the application is on at least a private network; otherwise it will resolve the ingestion endpoint to a public IP and cannot send telemetry. NOTE: App Services free tier does NOT offer VNet support.
1. If Dropped by Reason shows a code indicating AMPLS issue, see Configuring Network Isolation and Private Link.

**Log Analytics Core:**
- See Private link troubleshooting guide.

**Log Analytics Agents:**
- Private Link for Monitor Agent (AMA)
- Azure Monitoring Private Link Scope (AMPLS)
  - Check the VM for Proper AMPLS Name Resolution
  - Verify the AMPLS resource configuration
  - Is the customer using AMPLS?
  - Is Public Network Access For Ingestion Enabled?

# Data Collection

- How and where is the determination made that there is no data being collected?
- Is this metric or log data?
- When was AMPLS added to the impacted resource?

# Public Documentation

- Use Azure Monitor Private Link Scope (AMPLS): https://docs.microsoft.com/samples/azure-samples/azure-monitor-private-link-scope/azure-monitor-private-link-scope/
- Use Azure Private Link to connect networks to Azure Monitor: https://docs.microsoft.com/azure/azure-monitor/logs/private-link-security
- az monitor private-link-scope CLI commands: https://learn.microsoft.com/cli/azure/monitor/private-link-scope

# Recommended Root Cause

See: Root Cause an AMPLS Issue wiki page.
