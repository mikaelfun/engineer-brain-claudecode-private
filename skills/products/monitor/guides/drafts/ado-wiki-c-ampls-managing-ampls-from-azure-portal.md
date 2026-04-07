---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Support Topics/Configuring Azure Monitor Private Link Scope/Managing AMPLS from Azure Portal"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/AMPLS%20(Azure%20Monitor%20Private%20Link%20Scope)/Support%20Topics/Configuring%20Azure%20Monitor%20Private%20Link%20Scope/Managing%20AMPLS%20from%20Azure%20Portal"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Scenario

*Questions related to setting up or configuring an AMPLS resource through the portal experience*

- Wants to create and/or configure Azure Monitor Private Link (AMPLS) / Private Link via the portal experience

# Workflow

1. Complete any Data Collection items from this page below.
1. Check the Known Issues section below, for potential explanation.
1. Azure Monitor Private Link Scope or AMPLS is a feature created and owned by Azure Monitor, it is a layer that sits on top of Private Link. Private Link is a feature / resource owned by Azure Networking. Keep this in mind as these issues are *not* solely owned by Azure Networking these issues should be a partnership between the two teams.

**Application Insights:**
1. Check Dropped By Reason for related codes in ASC.
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

- What is the specific overarching goal — what is trying to be done?
- If a specific error or experience is happening, get the full error and/or screenshots (be sure it is the full portal window).
- If there is no error, is the configuration not working as expected? If yes, what is the exact expectation and reason behind those expectations?

# Public Documentation

- Use Azure Monitor Private Link Scope (AMPLS): https://docs.microsoft.com/samples/azure-samples/azure-monitor-private-link-scope/azure-monitor-private-link-scope/
- Use Azure Private Link to connect networks to Azure Monitor: https://docs.microsoft.com/azure/azure-monitor/logs/private-link-security
- az monitor private-link-scope CLI commands: https://learn.microsoft.com/cli/azure/monitor/private-link-scope

# Recommended Root Cause

See: Root Cause an AMPLS Issue wiki page.
