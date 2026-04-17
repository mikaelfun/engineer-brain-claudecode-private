---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Support Topics/Configuring Azure Monitor Private Link Scope/Managing AMPLS using PowerShell, CLI, REST API, ARM - Bicep"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/AMPLS%20(Azure%20Monitor%20Private%20Link%20Scope)/Support%20Topics/Configuring%20Azure%20Monitor%20Private%20Link%20Scope/Managing%20AMPLS%20using%20PowerShell%2C%20CLI%2C%20REST%20API%2C%20ARM%20-%20Bicep"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Scenario

*Questions related to managing AMPLS resource using various programmatic methods*

- Trying to deploy an AMPLS resource programmatically
- Trying to configure an existing AMPLS resource programmatically

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

- What API is being used — PowerShell, CLI, REST API, ARM, or Bicep?
- Repro code or snippet of relevant code if repro is not possible. Repro is ideal as it speeds efforts and takes the customer out of the loop.
- What is the high-level goal trying to be achieved with this code?
- Why is this being done? Understanding this is important — writing code for a one-time effort versus generic repeated use brings entirely different options.
- Get full error messages if being encountered.

# Public Documentation

- Use Azure Monitor Private Link Scope (AMPLS): https://docs.microsoft.com/samples/azure-samples/azure-monitor-private-link-scope/azure-monitor-private-link-scope/
- Use Azure Private Link to connect networks to Azure Monitor: https://docs.microsoft.com/azure/azure-monitor/logs/private-link-security
- az monitor private-link-scope CLI commands: https://learn.microsoft.com/cli/azure/monitor/private-link-scope

# Recommended Root Cause

See: Root Cause an AMPLS Issue wiki page.
