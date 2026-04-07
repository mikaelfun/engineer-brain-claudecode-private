---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Hotpatching Support Boundaries_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Hotpatching%20Support%20Boundaries_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.RDP-SSH
- cw.How-To
- cw.Reviewed-07-2023
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]

# Summary


This wiki consists of **Support Boundaries** to troubleshoot **Hotpatching** cases.  There are certain scenarios that will be supported by different support teams, Azure IaaS VM and Update Management Center (UMC) support teams primarily. 



<span style="color:#FF0000">**IMPORTANT**</span>:
- Support topics are dynamic and may be changed by support teams. Please do your due diligence and choose appropriate support topics as needed.
- The destination queue (when transferring a case) varies based on the support topic, service level, support contract, cloud offering (Public, Fairfax, Mooncake) etc. **DO NOT** manually override queues unless instructed by your TA.
<br/>
<br/>

# Hotpatching Support Boundaries

For guidance on support boundaries for our different scenarios see below table:

|Scenario  |Supported by | Support Area Path (SAP) |
|--|--|--|
|VM Provisioning failure for hotpatching enabled images| Azure IaaS VM - Configuration| Azure/Virtual Machine running Windows/Cannot create a VM|
|Performance degradation after moving workload to hotpatching enabled images| Azure IaaS VM - Management| Azure/Virtual Machine running Windows/VM Performance/CPU usage is higher than expected|
|Enable/disable hotpatch feature on existing VMs using Portal|Azure Monitoring - UMC|Azure/Update management center/Issues related to change update settings page and patch orchestration settings|
|Enable/disable hotpatch feature on existing VMs using PowerShell/CLI|Azure IaaS VM - Configuration|Azure/Virtual Machine running Windows/Windows Update, Guest Patching and OS Upgrades/Issue enabling HotPatching|
|Windows updates fail to install at Guest OS level|Azure IaaS VM - Connectivity|Azure/Virtual Machine running Windows/Windows Update, Guest Patching and OS Upgrades/Update issue - patch fails to install|
|Hotpatch enabled VM is not getting patched|Azure Monitoring - UMC|Azure/Azure Automation/Update Management/Update Deployment did not install some or all updates|
|Hotpatch status issues in Update Management Center blade in Azure portal|Azure Monitoring - UMC|Azure/Update management center/Issues related to Portal UI/Data displayed on the page is wrong|
|Hotpatching causes a VM restart|Azure IaaS VM - Configuration|Azure/Virtual Machine running Windows/VM restarted or stopped unexpectedly|
|Any workload specific issues outside of hotpatching|Team owning the support for the workload or product|There is no recommendation, reach out to TA if help is needed|

# Azure Monitoring UMC support boundaries reference:
- Above support boundaries are agreed between VM and UMC support teams, [UMC support boundaries](https://supportability.visualstudio.com/AzureAutomation/_wiki/wikis/Azure-Automation.wiki/1075087/SB-Hotpatching-WIP).

::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
