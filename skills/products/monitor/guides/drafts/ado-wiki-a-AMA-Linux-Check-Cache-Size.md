---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Check agent event cache max size"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FAMA%20Linux%2FHow-To%2FAMA%20Linux%3A%20HT%3A%20Check%20agent%20event%20cache%20max%20size"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AMA Linux: Check Agent Event Cache Max Size

## Purpose
The Azure Monitor Agent (AMA) has a configurable event cache size (default 10GB). This guide shows how to check the configured cache size.

## Check Cache Size
The configured cache size is logged in mdsd.info:

```bash
cat /var/opt/microsoft/azuremonitoragent/log/mdsd.info | grep "Using disk quota specified in AgentSettings"
```

## Key Behaviors
- If the defined cache size does not allow a 5% volume buffer, it will automatically reduce the cache size to give a 5% buffer
- The cache size is a **threshold** (not a hard limit) - when exceeded, the garbage collector deletes the oldest 5%
- Garbage collection logs appear in `mdsd.warn`

## Related
- [AgentSettings DCR configuration](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-manage?tabs=azure-resource-manager#setting-up-agentsettings-dcr)
- [Review mdsd.warn - garbage collection scenario](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1779086/AMA-Linux-HT-Review-mdsd.warn)
