---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Boundaries/Support Boundaries: Azure Sentinel"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/Support%20Boundaries/Support%20Boundaries%3A%20Azure%20Sentinel"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Support Boundaries: Azure Sentinel vs Azure Monitor

> Note: This page has been consolidated into Agents support boundaries. See: /Agents/Support-Boundaries/Support-Boundaries:-Sentinel

> Important: Security - Infrastructure Solutions POD will NOT raise IcMs directly to Log Analytics PG. Azure Monitor POD engineer will review, collect info/logs and escalate when appropriate.

Applies to both Log Analytics Agent (Legacy) and Azure Monitor Agent (New).

## Azure Sentinel (Security - Infrastructure Solutions POD)

- Installation/configuration of Sentinel Data Connector prerequisites (including agent-specific configs)
- Azure Portal Sentinel UI
- DNS Analytics (including solution with MMA and AMA)
- Logstash to LA Connector
- Default and custom workbooks creation/configuration
- Default Kusto queries in Sentinel
- Usage Costs related to Sentinel Solutions billing data
- All data connectors EXCEPT: Azure Active Directory, Azure Activity (legacy), Microsoft WAF
- Custom Kusto queries involving Sentinel providers/connectors
- Workspace move: Sentinel-enabled workspaces cannot be moved to other RG/subscriptions

## Azure Monitor POD

- Workspace management: Create and delete
- Query execution errors related to Kusto engine
- Log Analytics agents installation and maintenance (direct + extensions)
- Workbook experience (not related to missing data/data accuracy)
- Data connectors: **Azure Active Directory**, **Azure Activity (legacy)**, **Microsoft WAF**

## Before Engaging Security - Infrastructure Solutions POD

- Confirm agent is connected and sending data (at least Heartbeat)
- For other connectors: check ingestion errors, daily cap settings

## How to Engage

1. Add note referencing: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750318/Support-Boundaries-Azure-Sentinel
2. Include: Issue description, Subscription ID, Workspace ID/name, VM name/data connector name, Analysis, Screenshots
3. Transfer to: Product: Microsoft Sentinel, appropriate Support Topic

## Before Engaging Azure Monitor POD

- Review agent prerequisites, perform basic troubleshooting
- Linux: full cleanup (solves 90%)
- For AAD/Activity/WAF connectors: check if generating data, verify daily cap

## How to Engage Azure Monitor POD

1. Reference support boundaries wiki
2. Include: Issue description, Subscription ID, Workspace ID/name, VM/connector name, Analysis
3. Transfer to: Product: Log Analytics, appropriate Support Topic
