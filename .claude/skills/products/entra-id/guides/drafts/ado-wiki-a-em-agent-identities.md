---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Entra ID Entitlement Management for Agent Identities"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FEntra%20ID%20Entitlement%20Management%20for%20Agent%20Identities"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Entitlement Management for Agent Identities

> This is an unreleased product. Documentation still in development.

## Overview

Agent identities are accounts in Entra ID providing unique identification and authentication for AI agents. They can be governed with the same lifecycle and access features as human identities.

## Key Concepts

- **Agent Identities**: Digital identities for AI agents in Entra ID
- **Sponsors**: Human users accountable for agent lifecycle and access decisions
- **Access Packages**: Can assign Security Groups, Application roles/API permissions, Entra ID roles

## Management Portals

- **My Account** (myaccount.microsoft.com): Enable/disable agent, view access/activity/lifecycle
- **My Access** (myaccess.microsoft.com): Request access packages on behalf of agent identities

## Requesting Access for Agent

1. Sign in to My Access portal
2. Select Access packages > locate package > Request
3. Under Request details, select "Sponsored agent"

## Limitations

- Cannot limit requests to specific agents (only allow all agents)
- Future enhancement planned

## License Requirements

- Microsoft Entra Agent ID license
- Microsoft Entra ID Governance licensing

## SAP

Azure/Microsoft Entra Governance, Compliance and Reporting/Entitlement Management/Agent Identities
