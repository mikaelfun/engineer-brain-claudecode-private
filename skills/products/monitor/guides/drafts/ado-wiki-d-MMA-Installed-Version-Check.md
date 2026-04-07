---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to locate installed version of MMA Agent"
sourceUrl: "https://dev.azure.com/Supportability/6f9dfd80-6071-4f7b-8bf9-c97214ca68cf/_wiki/wikis/bebfc12e-d2ce-4ed1-8a64-d64c20264fd2?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FHow-To%2FHow%20to%20locate%20installed%20version%20of%20MMA%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
---
Applies To:
- Microsoft Monitoring Agent :- All versions
---

# Note
 - The screenshot and output provided are from test labs there is no pii data present.
# From Azure Support Center:
If Machine ever successfully send Heartbeat and data is not purged yet, then we can find agent detail and version in Azure Support Center.

![image.png](/.attachments/image-6647fb98-68e0-423c-a2c6-871d53f67eb6.png)

#From Customer's Machine Via Powershell:

Finding MMA agent version installed / previously left over MMA in Windows
Get-WmiObject -Class Win32_Product -Filter "Name='Microsoft Monitoring Agent'" -ComputerName.
 
![image.png](/.attachments/image-716ba648-342e-4ca6-8e7c-bbe681af4e48.png)

#From Customer's Machine Via MMA Agent properties in Control Panel:

![image.png](/.attachments/image-59bdc943-8e0c-4930-ba77-6af7705687c7.png)
