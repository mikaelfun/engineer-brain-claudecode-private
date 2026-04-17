---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/How-To/How-to: Use telnet to validate endpoint port connectivity"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/How-To/How-to%3A%20Use%20telnet%20to%20validate%20endpoint%20port%20connectivity"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
---
Applies To:
- All agents: All versions
---

# Note
 - The screenshot and output provided are from test labs there is no pii data present.

# Scenario
---
When validating network connectivity, a computer may be able to resolve an endpoint address but due to port restrictions it still may be not be able to successfully complete a connection to the endpoint. We can utilize telnet to test this connectivity.

# What is telnet
---
Telnet is a protocol that provides a command line interface for communication with a remote device or server. While sometimes employed for remote management it's also used for initial device setup like network hardware. Telnet can be used to establish a connection with a remote server in a variety of manners using different parameters. For our purposes we will be using it to test port specific connectivity to the agent endpoints. 

# Usage syntax and execution of the command
---

Open up a console or command window and execute the command followed by the endpoint and port to connect to:

```
telnet ########-####-####-####-############.oms.opinsights.azure.com 443

where ########-####-####-####-############ is the workspace id the agent is trying to connect to, and "443" is the remote port we are looking to connect on
```
If a successful connection is made you should see the following output:

![image.png](/.attachments/image-a643524a-7bf3-4151-a536-8f59acf467dd.png)

Of the agent is unable to connect it should display a relevant error message.
