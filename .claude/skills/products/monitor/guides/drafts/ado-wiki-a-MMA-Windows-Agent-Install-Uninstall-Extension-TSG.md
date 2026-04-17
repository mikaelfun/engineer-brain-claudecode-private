---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting Windows Agent Installation and Uninstallation Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/Troubleshooting%20Guides/Troubleshooting%20Windows%20Agent%20Installation%20and%20Uninstallation%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

Applies To:
- Microsoft Monitoring Agent :- All versions when installed as Extension

[[_TOC_]]

****Note:** All IPs and machine names in this page are from test lab and don't compromise any Pii data.**


# Workflow
---
This workflow represents a level 2 support topics that is presented to the customer in the Azure Portal when opening a service request.
Be sure the support topic in the case is set appropriately.

# Scenario
---
 Troubleshooting Windows Microsoft Monitoring Agents for Log Analytics when deployed as an extension.

# Data Collection
---
This information should also be put into your cases notes. 
This initial block of information should be discoverable in the Verbatim section of the case and in Azure Support Center(ASC) see: [Azure Support Center - Find basic Log Analytics Workspace information](/Monitor-Agents/Agents/How%2DTo/General/Azure-Support-Center-%2D-Find-basic-Log-Analytics-Workspace-information).
* Subscription id
* Workspace name
* Workspace ID
* Region where the workspace is hosted
* Screenshot of the error from Azur portal when deploying Extension

Information that probably needs answers from customer are the following, but this information might be discernable from investigative queries against their workspace in ASC too.

* How many Agents as MMA extension are we unable to deploy? One or many? Gather some specific machine names for targets to focus on in the investigation. 
- Customer used which of the following method to deploy MMA extension?
1.  Log Analytic workspace Portal \ Virtual Machine \ Connect button
1.  Azure Cloud Shell
1.  Azure Security Center

* Was any version of MMA agent previously running on this machine before MMA agent extension deployment was started?
 


# Troubleshooting Guides
---

[Troubleshooting MMA Extension Deployment](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-MMA-Extension-Deployment)



# Concepts
---
[Windows Agent Basics (Microsoft Monitoring Agent)](/Monitor-Agents/Agents/Common-Concepts/Windows-Agent-Basics-\(Microsoft-Monitoring-Agent\))


# Helpful Related Articles

[Troubleshooting MMA Extension Deployment](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-MMA-Extension-Deployment)

[Troubleshooting  Mon-agent fails to install with error: Failed to install performance counters (The parameter is incorrect)](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting--Mon%2Dagent-fails-to-install-with-error:-Failed-to-install-performance-counters-\(The-parameter-is-incorrect\))

[Upgrade is not supported for currently Installed Version](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Known-Issues/Upgrade-is-not-supported-for-currently-Installed-Version)

 [Troubleshooting MMA fails to install with error ConvertStringSecurityDescriptorToSecurityDescriptor failed : 87](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-MMA-fails-to-install-with-error-ConvertStringSecurityDescriptorToSecurityDescriptor-failed-:-87)

[How to retrieve MMA installation logs](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/How-to-retrieve-MMA-installation-logs)



# Training Module
<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#E8F5E9">
A training Module on MMA Agent as an Extension Install & Troubleshooting is available as Advanced Learning under Azure Monitoring Learning Path. 

https://cloudacademy.com/learning-paths/app-insights-log-analytics-1854-5548/
</div>
