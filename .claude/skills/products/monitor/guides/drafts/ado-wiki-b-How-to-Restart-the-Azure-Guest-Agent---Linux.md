---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/How-To/How-to: Restart the Azure Guest Agent - Linux"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/How-To/How-to%3A%20Restart%20the%20Azure%20Guest%20Agent%20-%20Linux"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
Applies To:
- Troubleshooting Azure Virtual Machine running OMS agent for Linux:- All versions 

[[_TOC_]]

Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.

# Scenario
---
The **Microsoft Azure Linux Agent (waagent) ** runs on every **Linux virtual machine created in Azure**, and amongst other tasks it manages all the machine's extensions. There are scenarios, that could benefit from an agent restart, for example orphaned extensions / extension files (that cannot be removed from the UI or PowerShell), old extension files are being accumulated and the guest agent is not performing the clean up or even to force a new version to be pushed

# High level steps
---

- [ ] Restart guest agent on Linux


## Restart guest agent on Linux

1. On Linux, you can perform a regular restart

- For Ubuntu distributions, run the following commands:
```
sudo -i 
```
```
service walinuxagent stop
```
```
mv /var/lib/waagent /var/lib/waagent.old
```
```
service walinuxagent restart
```

- For RedHat and other distributions:
```
sudo -i 
```
```
service waagent stop
```
```
mv /var/lib/waagent /var/lib/waagent.old
```
```
service waagent restart
```

2. The commands above perform a restart alongside a clearing of the agent's cache

# References
---
[Azure Virtual Machine Agent overview](https://docs.microsoft.com/azure/virtual-machines/extensions/agent-windows)



