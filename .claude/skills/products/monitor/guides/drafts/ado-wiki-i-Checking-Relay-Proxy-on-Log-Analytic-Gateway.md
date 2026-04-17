---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Checking Relay Proxy on Log Analytic Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FChecking%20Relay%20Proxy%20on%20Log%20Analytic%20Gateway"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

---
Applies To:
- Microsoft Monitoring Agent :- All versions
---
Note: All machine names and Ips provided on this page are from learning lab and dont reflect any PII data.
[[_TOC_]]

#Introduction
---
The Log Analytics gateway some times is configured to forward its traffic to Corporate proxy to route data to internet. 
Its important to learn via PowerShell that Gateway is using right proxy ip & port number.

![image.png](/.attachments/image-780e0811-0642-4c99-9210-e2cf4e16ac02.png)
#Useful PowerShell cmdlets
For PowerShell cmdlet documentation please refer to official [documentation](https://docs.microsoft.com/azure/azure-monitor/agents/gateway#useful-powershell-cmdlets).

![image.png](/.attachments/image-c4492bbf-97dd-47fd-a234-8c8785a53bc1.png) 
