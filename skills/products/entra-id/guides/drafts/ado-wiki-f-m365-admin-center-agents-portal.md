---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Agent 365/M365 Admin Center Agents Portal"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FAgent%20365%2FM365%20Admin%20Center%20Agents%20Portal"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# M365 Admin Center Agents Portal

## Summary

Agent 365 is a new feature set that allows admins to enable, manage and publish agents across their organization. The new feature exists as a separate "Agents" portal under the M365 Admin Center.

## Portal Structure

### Overview Portal
- Total number of Agents in the organization
- Total number of Active Users interacting with agents
- Agent Analytics:
  - Agent Publishers: agents shared/published by org + external partners
  - Agent Platforms: source from which agents were created (Copilot Studio, Foundry)
  - Active Users Over Time
- Top Actions: pending agent requests and ownerless agents

### All Agents
**Registry Tab:** Shows all agents in the organization (same as former Copilot Control System).
- Admins can Block or Deploy agents published to the organization
- Block or Remove agents Published By the Organization
- View agent details:
  - For Org-Published agents: Overview, Deployment scope, Availability, Data/Tools, Security/Compliance
  - For Third-Party agents: Overview, Availability, Permissions, Data/Tools, Security/Compliance, Certification
  - For MS 1P agents: Overview, Deployment scope, Availability, Data/Tools

**Requests Tab:** Publish, update or reject agent requests (same as former Copilot Control System / Agents / Requested Agents).

**Tools Tab:** Lists all available MCP servers and their associated URLs.

### Settings
- **Allowed Agent Types:** Specify types of agents visible in the Store
- **Sharing:** Determines who can share agents with the organization
- **User Access:** Determines which users/groups can use agents
- **Templates:** Agent Templates (also called Blueprints in Entra) - shows available licenses and Purview/Entra/SharePoint policies

## Troubleshooting

### Agent page fails to load with blade error
- **Cause:** Agent does not have an owner assigned
- **Fix:** Set an owner from the Entra Agent ID interface in the Entra Admin Center

## Escalation Path

**Engineers:**
- Product: M365 Admin Center
- Team: Manage User, Groups, and Domains

**TA ICM Path:**
- Owning Service: Office 365 Admin Portal and Support
- Owning Team: Office 365 Admin
