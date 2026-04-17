---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Log Analytic Gateways & Supported Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FLog%20Analytic%20Gateways%20%26%20Supported%20Scenarios"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Log Analytics Gateways & Supported Scenarios

## Introduction

The Log Analytics gateway is an HTTP forward proxy that supports HTTP tunneling using the HTTP CONNECT command. It sends data to Azure Automation and a Log Analytics workspace in Azure Monitor on behalf of computers that cannot directly connect to the internet.

**Official documentation**: https://docs.microsoft.com/azure/azure-monitor/agents/gateway

## Terminology

- **AGENT**: A supported Windows machine running MMA or a supported Linux machine running OMS Agent, configured to connect to a workspace.
- **LOG ANALYTICS GATEWAY**: A supported Windows server acting as proxy between agents and Log Analytics workspace. Two main functions:
  1. Download solutions enabled in workspace for agents
  2. Collect and upload workflow data from agents to workspace
- **PROXY RELAY**: A proxy server between the Gateway and Azure Cloud, acting as an identification shield.

## Connection Scenarios

### Scenario A — Agent Using Company Proxy

- Machine running MMA configured to use company proxy IP:Port to connect to workspace directly
- Each agent must use proxy IP:Port
- Proxy admin maintains allow/deny rules for each agent
- Scales poorly: proxy rules must be updated manually for each new/removed agent

### Scenario B — Agent Using Log Analytics Gateway

- Machine running MMA configured to use Gateway IP:Port "as proxy" to connect to workspace
- Gateway has direct internet access
- Each agent must know Gateway IP:Port
- In SCOM-integrated scenarios, Gateway IP:Port can be distributed via SCOM

### Scenario C — Agent Using Gateway + Company Proxy as Relay

- Agents connect to Gateway IP:Port
- Gateway routes data through company proxy (acting as Relay) to internet
- Proxy admin only maintains ONE set of rules for Gateway's IP
- Most secure and easiest to maintain at scale

## Brownbag Reference

- Topic: Hybrid Design, Config & Troubleshooting of Log Analytics Gateways in Azure Monitor Logs
- [Session recording](https://msit.microsoftstream.com/video/db128db5-82cb-437e-99ac-a7c3252a5e0e?st=20)
