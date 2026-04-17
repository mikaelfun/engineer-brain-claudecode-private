---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Copilot/Copilot Agents and Connectors"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FCopilot%2FCopilot%20Agents%20and%20Connectors"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Agents & Connectors

## Update November 18, 2025

Were introducing **support for Model Context Protocol (MCP)-based agents** in Microsoft 365 Copilot and the Microsoft 365 admin center. This update enables developers to build Copilot agents using MCP servers and allows users and admins to interact with these agents using familiar experiences. This change supports extensibility and improves agent management capabilities for organizations.

Rollout will begin in late October 2025 and is expected to complete by mid-November 2025.

What will happen:

- MCP-based agents will appear in the Copilot Agent Store
- Users can install MCP-based agents directly from the store
- Admins can deploy MCP-based agents to users via the store or custom packages
- Admins will see MCP agent details, including server information, in the Microsoft 365 admin center under **Copilot** > **Agents**
- Existing extensibility controls and lifecycle management policies for Copilot agents will apply to MCP-based agents
- The feature will be **ON by default for all tenants**

## Agent types you can manage

You can manage several types of agents in Microsoft 365 Copilot, each serving different purposes:

- **Custom agents** - Built with predefined instructions and actions. These agents follow structured logic and are best for predictable, rule-based tasks. Before becoming available to users, custom agents go through an admin approval and publishing process to ensure compliance and readiness.
- **Shared agents** - Configured for use by multiple users or groups. These agents are individually shared by their creators with other users.
- **First-party agents** - Developed by Microsoft and integrated with Microsoft 365 services.
- **External agents** - Created by external developers or vendors. You can control their availability and permissions.
- **Frontier agents** - Experimental or advanced agents that use new capabilities or integrations. These might be in early stages of development or testing and could require more oversight or limited rollout.

## Admin roles required to manage agents

The following administrator roles can manage agents in the Microsoft 365 admin center:

- AI Admin
- Global Admin
- Global Reader (view-only, no edit)

You can manage agents in the Microsoft 365 admin center by using the **Agents & connectors** page under the [Copilot Control System](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-page). On this page, you can:

- View available, deployed, or blocked agents.
- Configure agent availability and access.
- Perform actions such as deploying, blocking, or removing agents.

## SAPs and Support Boundaries

A comprehensive list of CoPilot support boundaries and SAPs has been created. Use the following link to access it.

- [Copilot Support Area Path (SAP)](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/1485077/Copilot-Support-Area-Path-(SAP))
