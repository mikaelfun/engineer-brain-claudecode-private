---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Support Topics/Configuring Azure Monitor Private Link Scope/Issues with permissions"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/AMPLS%20(Azure%20Monitor%20Private%20Link%20Scope)/Support%20Topics/Configuring%20Azure%20Monitor%20Private%20Link%20Scope/Issues%20with%20permissions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AMPLS — Issues with Permissions (RBAC)

## Scenario

Questions related to RBAC with Azure Monitor Private Link Scope (AMPLS).

> AMPLS is owned by Azure Monitor but sits on top of Private Link (Azure Networking). RBAC issues should be a partnership between Azure Monitor and Azure Networking CSS teams.

## Workflow

1. Complete Data Collection items below.
2. Check Known Issues for potential explanation.
3. Check product-specific troubleshooting paths:

**Application Insights:**
- Check Dropped By Reason in ASC for AMPLS-related codes.
- If Dropped By Reason shows an AMPLS code → see [Configuring Network Isolation and Private Link].

**Log Analytics Core:**
- See: Private link troubleshooting guide.

**Log Analytics Agents (AMA):**
- Check [Private Link for Monitor Agent (AMA)]
- Check VM for proper AMPLS name resolution
- Verify AMPLS resource configuration
- Confirm whether customer is using AMPLS
- Check if Public Network Access for Ingestion is enabled

## Data Collection

- What is the name of the RBAC role involved?
- Is this with a custom role or a predefined role?

## Public Documentation

- [Roles, permissions, and security in Azure Monitor](https://learn.microsoft.com/azure/azure-monitor/roles-permissions-security)
- [Azure Monitor Private Link Scope samples](https://docs.microsoft.com/samples/azure-samples/azure-monitor-private-link-scope/azure-monitor-private-link-scope/)
- [Use Azure Private Link to connect networks to Azure Monitor](https://docs.microsoft.com/azure/azure-monitor/logs/private-link-security)
- [az monitor private-link-scope CLI commands](https://learn.microsoft.com/cli/azure/monitor/private-link-scope?view=azure-cli-latest)

## Recommended Root Cause

See: Root Cause an AMPLS Issue wiki page.
