---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Check if the Azure VM Guest Agent is running"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Check%20if%20the%20Azure%20VM%20Guest%20Agent%20is%20running"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# PowerShell (on VM)
```Get-Service WindowsAzureGuestAgent```

![image.png](/.attachments/image-e1c6e180-fb31-4b95-bf11-dd7b49ced166.png)

# Azure Support Center (ASC)
```Azure Support Center > Resource Explorer > Virtual Machine > Properties > Additional Vm Data > Guest Agent Status = "Ready"```

![image.png](/.attachments/image-6128f39f-d179-46b0-80cc-5ebcd572dadc.png)

# Azure Portal
```Azure Portal > Virtual Machine > Extensions + applications```

If the VM is powered on (and did not recently start up), we will see the following if the agent is unresponsive:
![image.png](/.attachments/image-a5d84302-3fa8-4309-b1fe-742e67697dc9.png)
