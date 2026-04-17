---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to restart the Azure Guest Agent - Windows"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/How-To/How%20to%20restart%20the%20Azure%20Guest%20Agent%20-%20Windows"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
Applies To:
- Troubleshooting Azure Virtual Machine running Microsoft Monitoring Agent :- All versions 

[[_TOC_]]

Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.

# Scenario
---
The **Windows Azure Guest Agent** runs on every **virtual machine created in Azure**, and amongst other tasks it manages all the machine's extensions. There are scenarios, that could benefit from an agent restart, for example orphaned extensions / extension files (that cannot be removed from the UI or PowerShell), old extension files are being accumulated and the guest agent is not performing the clean up or even to force a new version to be pushed

# High level steps
---
- [ ] Restart guest agent on Windows

## Restart guest agent on Windows

1. The recommended way to handle the guest agent in Windows, is actually to perform a reinstallation of the same

2. Remove the agent by going to **Control Panel - Uninstall a Program - remove Windows Azure VM Agent**

<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=/.attachments/image-43d5ba23-730d-4b1f-83f4-91efdb30146b.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>

3. Now to reinstall it, just head to this [link](https://docs.microsoft.com/azure/virtual-machines/extensions/agent-windows#manual-installation) and follow the steps


# References
---
[Azure Virtual Machine Agent overview](https://docs.microsoft.com/azure/virtual-machines/extensions/agent-windows)
- Also Check [How-to: Restart the Azure Guest Agent - Linux](/Monitor-Agents/Agents/OMS-Agent-for-Linux-\(omsagent\)/How%2DTo/How%2Dto:-Restart-the-Azure-Guest-Agent-%2D-Linux)


