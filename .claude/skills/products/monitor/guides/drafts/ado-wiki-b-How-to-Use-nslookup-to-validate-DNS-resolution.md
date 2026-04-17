---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/How-To/How-to: Use nslookup to validate DNS resolution"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/How-To/How-to%3A%20Use%20nslookup%20to%20validate%20DNS%20resolution"
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
When validating network connectivity, you may need to check the DNS behavior for the endpoint connectivity, there can be instances where either a DNS server cannot be reached to resolve an address or if private links is configured in the environment, we can see whether or not the endpoints are resolving to private or public addresses.

# What is nslookup
---
nslookup is a simple command line tool which is mainly used for finding IP related information on any given computer or host which includes our endpoint addresses. For our purposes we will be using to test DNS resolution for a given resource trying to access the agent endpoints.


# Usage syntax and execution of the command
---

Open up a console or command window and execute the command followed by the endpoint to check:

```
nslookup ########-####-####-####-############.oms.opinsights.azure.com


where ########-####-####-####-############ is the workspace id the agent is trying to connect to.
```
When executed you will see the following values returned:

![image.png](/.attachments/image-e90d96e6-4d68-4d50-9b6a-561d7ccb8f60.png)

If the host is able to resolve the endpoint it will provide the following infomration:
* DNS Server IP
* All CNAME records associated with the endpoint name
* The Destination IP Address


