---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to restart and clear the MMA cache"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/How-To/How%20to%20restart%20and%20clear%20the%20MMA%20cache"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

# Scenario
---
Whenever customers are facing difficulties with windows Microsoft monitoring agents, have made any major changes or even you are requesting Event Viewer logs for further troubleshooting, clearing the cache would be great to validate that new configuration updates on the machine. 
 
# High level steps in Graphical User Interface
---

1. Login to the machine, and open Services
1. Locate the Microsoft Monitoring Agent and stop it
1. Head to: C:\Program Files\Microsoft Monitoring Agent\Agent and change the Health Service State folder name to Health Service State old 
1. Start the mentioned service again


# PowerShell approach

_**Open an elevated PowerShell session (Run As Administrator) and run these 3 commands:**_


```
Stop-Service HealthService -Force

Rename-Item "C:\Program Files\Microsoft Monitoring Agent\Agent\Health Service State" -NewName "C:\Program Files\Microsoft Monitoring Agent\Agent\Health Service State_old"

Start-Service HealthService
```
