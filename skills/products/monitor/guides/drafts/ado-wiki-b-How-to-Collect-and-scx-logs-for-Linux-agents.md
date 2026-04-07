---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/How-To/How-to: Collect  and scx logs for Linux agents"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/How-To/How-to%3A%20Collect%20%20and%20scx%20logs%20for%20Linux%20agents"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

# Scenario
---
Typically OMI agents and SCX logs are collected before reaching out to the engineering team for an ICM or they can be analyzed by Support. When OMI agent stopped or components of the OMS agent cannot be installed, omi and scx logs are useful to be collected.
_Why OMI agent stopped? Why the agent component cannot be installed?_
 
# High level steps
---
1. Enable SCX verbose logging: 
`scxadmin -log-set all verbose`
1. Enable OMI verbose logging (Uncomment line starting with loglevel and change logging level to verbose in omiserver.conf file): 
`sed -i 's/#loglevel = WARNING/loglevel = VERBOSE/g' /etc/opt/omi/conf/omiserver.conf` 
1. Restart omiserver
1. `scxadmin �restart`
1. Reproduce the issue and wait a few minutes.
1. Set log level back to default.

# References
---
[How to troubleshoot issues with the Log Analytics agent for Linux](https://docs.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot)

