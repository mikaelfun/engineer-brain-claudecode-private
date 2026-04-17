---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Boundaries/Support Boundaries: Azure Network"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/Support%20Boundaries/Support%20Boundaries%3A%20Azure%20Network"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Support Boundaries: Azure Network vs Azure Monitor

## Overview

Azure Network provides networking capabilities with several monitoring features using Azure Monitor Logs and Log Analytics workspace. This guide defines support boundaries between Azure Network and Azure Monitor PODs.

## Azure Network POD Responsibilities

### Traffic Analytics
- Fully supported by Azure Network team

### WireData 2.0 (RETIRED March 31, 2022)
- Replaced by VM insights and Service Map solution (both use LA agent + Dependency agent)

### Network Performance Monitor (NPM) (RETIRED)
- New tests blocked since July 1, 2021
- Migrate to Connection Monitor in Azure Network Watcher before Feb 29, 2024
- Azure Network supports:
  - Configuration/setup and troubleshooting of underlying network connectivity
  - NPM agent component issues: NPMDAgent (Windows), NPMD (Linux)
  - NPM billing: https://azure.microsoft.com/pricing/details/network-watcher/

## Azure Monitor POD Responsibilities

### Traffic Analytics
- LA workspace management (create, move, delete) and query customization

### NPM
- LA workspace management
- Query execution and data ingestion issues
- LA agent installation and connectivity: HealthService/MonitoringHost (Windows), omsagent/omiserver/omiagent (Linux)
- LA billing: https://azure.microsoft.com/pricing/details/monitor/

## Before Engaging Azure Network Team

- [ ] Verify agent is connected and sending data (at least Heartbeat)
- [ ] Confirm 'networkmonitoring' solution targeting is not excluding the agent
- [ ] For deployment failures, check ARM logs
- Check Azure Network TSG: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/143936/Network-Performance-Monitor-TSG

## How to Engage Azure Network Team

1. Add case note referencing: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750317/Support-Boundaries-Azure-Network
2. Include: Issue description, Subscription ID, Workspace ID/name, Feature name, VM name/ResourceUri, Agent log analysis, Screenshots
3. Transfer case accordingly

## Before Engaging Azure Monitor Team

- [ ] Review agent prerequisites: Windows/Linux OS support, Network requirements
- [ ] Perform basic agent troubleshooting (upgrade/reinstall)
- [ ] Linux: full cleanup (solves 90% of issues)
- [ ] Check for duplicated AgentID
- [ ] For workspace management: check "Common Problems" sections
- [ ] For data ingestion: check daily cap and latency

## How to Engage Azure Monitor Team

1. Add case note referencing support boundaries wiki page
2. Include: Issue description, Subscription ID, Workspace ID/name, VM name/ResourceUri, Agent log analysis, Screenshots
3. Transfer to: Product: Log Analytics, appropriate Support Topic/Subtopic
