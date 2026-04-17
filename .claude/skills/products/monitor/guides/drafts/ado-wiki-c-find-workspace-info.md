---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Workspace Management/How-To: Find information about a workspace just having the name or workspaceID"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/How-To%20Guides/Workspace%20Management/How-To%3A%20Find%20information%20about%20a%20workspace%20just%20having%20the%20name%20or%20workspaceID"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::


[[_TOC_]]

# Scenario
---
During the troubleshooting process, it is crucial to gather as much information as possible regarding the Log Analytics workspace. Both Azure Support Center and Kusto are viable sources to investigate this type of information, but sometimes the customer will only provide the workspace name or workspaceID without providing the subscriptionID 
 
# IMPORTANT NOTE
---
<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#FF99C1">

Please DO NOT share any details out of this telemetry as is with customers. This also includes sensitive internal data. In case of doubt, reach out the STA\SME\TA\EEE.
</div>

# High level steps
---
- [ ] Make sure you're a part of the 'Azure Monitor POD Global' security group
- [ ]  Use the GetLastWorkspaceSnapshot function to retrieve data

## Verify if you're a part of the 'Azure Monitor POD Global' security group
---
We use the global ['**Azure Monitor POD Global**'](mailto:AZMONPODGLOBAL@microsoft.com) security group to provide access to most of the resources and tools we use, including the access to 'Azure Monitor Mission Control' (aimc).

This global group contains the groups from all the sites/locations where we have engineers supporting Azure Monitor, so you should request access to the one relevant to you, based on your location and team. If needed, please follow up with your Technical Advisor or Partner Technical Advisor.


## Use the Workspace Dashboard to search for a workspace by its wsid\Name\ResourceId
---

1. Go to the **Workspace Dashboard tool:**
<div style="font-size:x-large;margin-bottom:20px;padding:10px;min-width:500px;width:75%;">
<a href="https://dataexplorer.azure.com/dashboards/57eff9ae-528d-426a-9650-18b5b02e62ea"> Click Here</a>
</div>

2. Open the search box for Workspace and enter the workspace id or name you wish to look for under "Enter filter value (String)":
![image.png](/.attachments/image-5c7fdb98-75b2-40a0-9bbf-52d867fa0aec.png)

3. Look into the results table named "Workspace Details" and fetch the required details from it.

# References
---


