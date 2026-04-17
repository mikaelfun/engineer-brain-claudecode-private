---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/File Integrity Monitoring (FIM)/[deprecated] - FIM AMA/[Support boundaries] - FIM v2: FIM over AMA"
importDate: "2026-04-06"
type: troubleshooting-guide
---

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;background-color:#d7eaf8">

#:warning:Important



**[This feature is deprecated](https://learn.microsoft.com/en-us/azure/defender-for-cloud/file-integrity-monitoring-enable-ama)**

**Please advise customers to utilize [FIM over MDE](https://learn.microsoft.com/en-us/azure/defender-for-cloud/file-integrity-monitoring-overview)**
</div>

**File Integrity Monitor (FIM) over AMA [DRAFT]**


[[_TOC_]]
# Training FIM v2 (AMA based)

| Recording | PowerPoint deck | date | PM | Dev |  
| --- | --- | --- | --- | --- | 
| [FIM v2 Overview session](https://microsoft-my.sharepoint-df.com/:v:/p/elsagie/EexGO52BpdBNowhwsBvVtaABSwXuHxO1HYgSy-Q0uYm_Nw) | [FIM training to CSS.pptx](https://microsofteur-my.sharepoint.com/:p:/g/personal/nenorman_microsoft_com/Ed05sVYEywtLs5C7gGafeksB9Cc4KqOdT605-j0icbwURA?e=I0Ly0A) | September 2022 | Netta Norman, Shiful Parti | Maya Bar-Rabi | 

# FIM Support boundaries

- [Enable File Integrity Monitoring(FIM) when using AMA](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/749330/Enable-File-Integrity-Monitoring(FIM)-when-using-AMA)
- MDC supporting the extension provisioning (ChangeTracking-Windows/ChangeTracking-Linux) and the changes display and workspace query for the results.

## Supported Regions

South Central US is supported though it is not included in our documentation:  
[Supported regions for linked Log Analytics workspace](https://docs.microsoft.com/azure/automation/how-to/region-mappings)

## Escalations

- For any escalation, collect [Windows data](https://supportability.visualstudio.com/AzureAutomation/_wiki/wikis/Azure-Automation.wiki/24440/How-To-Collect-common-Microsoft-Monitoring-Agent-Update-Management-and-Hybrid-Worker-data), or [Linux data](https://supportability.visualstudio.com/AzureAutomation/_wiki/wikis/Azure-Automation.wiki/24438/HT-Collect-common-OMS-Agent-for-Linux-troubleshooting-data).  
<font size=2> ***Note:** This is mainly for MMA/OMS based CT onboarded resources,  but can be relevant for some AMA scenarios.*</font>

- ChangeTracking-Windows logs:
   - Azure VM: `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows`
   - ARC machine: `C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows`
 
- ChangeTracking-Linux logs:
   - Azure VM: `/var/log/azure/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux`
   - Azure ARC: `TBD`

**MDC CSS and PG are responsible for:** validation of the FIM DCR has been correctly associated with the workload and Change-Tracking Extension in installed

**Change Tracking CSS and PG are responsible for:**  if any file related changes or registry related changes are not seen in LA workspace.  **ICM escalation team**: ChangeTracking team.

**Important Note:** the above boundaries were discussed directly with the Change Tracking PG - maygupt@microsoft.com and the Log Analytics STAs - irfanr@microsoft.com and rofrenke@microsoft.com and akapetaniou@microsoft.com (MDC Team)

### Azure Monitor Change tracking escalations

1. Open collaboration task to:
   - **Azure/Change Tracking and Inventory/Change Tracking and Inventory with AMA(preview)**
2. Change tracking IcM team (for FIM escalations on ChangeTracking issues):
   - **Automation/Initial Triage** 

1. To consult with ChangeTracking Dev team: "Change Tracking Engineering Team" \<changeinventory@microsoft.com\>

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::

