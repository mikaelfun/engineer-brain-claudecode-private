---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Agent 365/Managing Microsoft Agent 365 Agents in the MAC"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FAgent%20365%2FManaging%20Microsoft%20Agent%20365%20Agents%20in%20the%20MAC"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Managing Microsoft Agent 365 Agents in the MAC

## Key Concepts

- A **template agent** is a preconfigured, IT-approved template that defines capabilities, permissions, and compliance settings for an AI agent within Microsoft 365. It helps create secure, governed AI instances.
- Template agents ensure consistency and control by letting IT admins manage activation, licensing, and policies centrally.

## Enabling Agent Extensibility

Admins control access to agents from: **M365 Admin Center > Agents > Settings**

## Controlling Agent Types

1. M365 Admin Center > Agents > Settings > **Allowed Agent Types**
2. Options:
   - Allow apps and agents built by Microsoft
   - Allow apps and agents built by your organization
   - Allow apps and agents built by external publishers

## Controlling Sharing

1. M365 Admin Center > Agents > Settings > **Sharing**
2. Options:
   - Allow all users to share with anyone in the organization
   - No users can share with anyone (but can choose who to share with)
   - Allow specific groups of users to share

## Controlling User Access

1. M365 Admin Center > Agents > Settings > **User Access**
2. Options: All Users / No users / Specific users/groups

## Creating / Instantiating Agent Instance Flow

1. Admin or User views template agents in Teams app store
2. If agent not activated, submit activation request
3. IT admin receives notification in M365 admin center
4. Admin reviews via **Agent 365 Overview > Pending Requests** or **All Agents > Requests**
5. Admin approves: selects scope, chooses default template (auto-assigns Agent 365 license), grants MCP server/tool permissions, applies policies, activates
6. Agent appears in Teams app store; user is notified

## Managing Agent Requests

- Users request template agents in Teams or Agent store
- If users are in Activation Scope during activation, they do not need to request
- Approve flow: **Agent 365 Overview > Pending Requests > Manage** or **All Agents > Requests**
- Select users > Approve request and activate / Reject request
- Requests remain visible until approved or denied

## Activating Agents

1. M365 Admin Center > Agents > All Agents
2. Select the template agent > **Activate**
3. Select users/groups scope (everyone or specific)
4. Apply policy template
5. Accept permissions
6. Review and finish

**Note:** If requesting user is in activation scope, they get a Biz Chat notification. If not in scope, they continue to see "requested" on store listing.

## Troubleshooting

### Agents not showing in MAC
- Agent does not have an Agent ID (optional field)
- Copilot Studio and Foundry auto-assign Agent IDs
- Mainly affects third-party agents

### Agent Publishing Error
- Confirm sufficient Agent 365 licenses available
- Confirm the agent has an owner
- Confirm the agent has a sponsor

## Escalation Path

**Engineers:**
- Product: M365 Admin Center
- Team: Manage User, Groups, and Domains

**TA ICM Path:**
- Owning Service: Office 365 Admin Portal and Support
- Owning Team: Office 365 Admin
