---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Test performance counters with typeperf"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Test%20performance%20counters%20with%20typeperf"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Purpose
[Typeperf](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/typeperf) is a command line utility that allows us to query the [PDH API](https://learn.microsoft.com/en-us/windows/win32/perfctrs/using-the-pdh-functions-to-consume-counter-data), which is the same API that the Azure Monitor Agent (AMA) would use to fetch performance counters. By using this utility, we can test the capability of the operating system to respond to AMA when it attempts to fetch the counters.

# Using typeperf
*Be sure to replace the values in the below commands with values for your scenario.*

**List counters that are available on this system:**
*This command to enumerates a list of counters that the operating system has available to query.*

``typeperf -q``

![image.png](/.attachments/image-9a41d66d-1f92-4cf6-b99f-ba6df7f11b7e.png)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: Is the counter, as specified in the [mcsconfig.latest.xml](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590096/AMA-Windows-HT-Review-agent-instruction-set?anchor=scenario%3A-performance-counters) **exactly** matching a counter you see on this list? Is there a typo (example: LogicalDisk vs. Logical Disk)?
</div>

**List counters that are available on this **system (filtered):****
*This command enumerates a ***filtered*** list of counters that the operating system has available to query.*
``typeperf -q | find "LogicalDisk"``

![image.png](/.attachments/image-40d40b3f-4acb-4402-b476-5ad4efb869f8.png)

**Query a specific counter:**
*This command tests querying a specific counter using the PDH API (the same way the AMA will query it).*
``typeperf -sc 5 "\LogicalDisk(*)\% Free Space"``

![image.png](/.attachments/image-5cb36621-76a2-4133-9f1e-0b18b481aa89.png)
