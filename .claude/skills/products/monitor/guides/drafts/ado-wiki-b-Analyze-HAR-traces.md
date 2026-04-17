---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/General/How-To: Analyze HAR traces and decide if and which product team should we escalate to"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/How-To%20Guides/General/How-To%3A%20Analyze%20HAR%20traces%20and%20decide%20if%20and%20which%20product%20team%20should%20we%20escalate%20to"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
In case a customer runs into a portal issue that is related to Log Analytics, the very first thing we should do is to collect a HAR trace during the issue reproduction. 
When opening a new CRI (ICM), we are often asked to provide this HAR trace. Analyzing this trace beforehand would help us pinpoint the source of the issue and start the investigation with the right product team. It may also help us resolve the issue without raising a CRI at all.


# High level steps
---
 Network requirements for using the Portal
 Collect a HAR trace during issue reproduction
 Open the HAR trace using a web debugging tool
 Initial analysis guidelines
 CSS Investigation
 Decide which product group a CRI investigation should start with

# Network requirements for using the Portal
---
Check that the customer has the following requirements met to be able to access and browse the portal for using Log Analytics (NOTE: These are also general for Azure Monitor):
https://learn.microsoft.com/azure/azure-monitor/app/ip-addresses


# Collect a HAR trace during issue reproduction
---
Please follow the instructions on the follow wiki article: [How to capture a browser trace (HAR) for troubleshooting](/Azure-Monitor/How%2DTo/General/How-to-capture-a-browser-trace-\(HAR\)-for-troubleshooting)

#  Open the HAR trace using a web debugging tool
---
A HAR trace can by analyzed by various web debugging tools, including a browser debugger and 3rd party tools such as Fiddler. For the sake of demonstration, we will be using Fiddler in this troubleshooting guide.
To analyze a .har trace using Fiddler, open the application and click F12 right away to stop active collection from your own machine (Fiddler default behavior). Post that action, Use the keyboard combination of Ctrl+X to remove any data that might have been collected from your machine during this time.

Then, click on "File>Import Session" 
![image.png](/.attachments/image-c049ff22-691f-4e07-bdac-f862a3040d73.png)

Choose "HTTPArchive" from the dropdown menu, click on "Next" and import the .har trace you wish to analyze:
![image.png](/.attachments/image-6c8786ad-e22d-4420-b74b-5cdabdc0b16f.png)

A list of every HTTP\S Request-Response communication captured during .har collection will be displayed on the left pane. Use Ctrl+A to choose them all, right click on any of the displayed rows and choose "Decode Selected Sessions".



# Initial analysis guidelines
---

Before raising any CRI, we would need to perform an initial analysis within CSS, potentially involving our customer in the process.

**Start by performing a few basic actions which may help resolve the issue. In case the issue hasn't been resolved, make sure to include the outcome in any CRI you raise under the steps you have performed:**

1. Try using different browsers (Chrome, Edge, Firefox etc.) to check if there is any difference
2. Try reproducing the same behavior inhouse using our internal portal (MPAC). This should be done over a pound for pound comparison, meaning walking through the exact same steps as the customer and having the affected resource(s) (For instance, the workspace) on the same region as the customer's. If it works on MPAC, this may mean a fix for this issue has been deployed and did not reach the customer's ring just yet.
To check the portal behavior on customer's ring (Not MPAC), use this URL:
https://portal.azure.com/?feature.customportal=false&feature.canmodifystamps=true&Microsoft_Azure_Monitoring_Logs=stage1&Microsoft_OperationsManagementSuite_Workspace=stage1
3. Check if a workaround is applicable using any other method then the portal (AzCLI, API, ARM Template, PowerShell etc.). 
4. Use the Empty Cache and Hard Reload on your browser (F12>Right Click on the "Refresh" button>Choose the "Empty cache and hard reload" option)
5. Enable 3rd party cookies on the browser and test the behavior post this change.
6. Check for any existing\known issues in our Wiki, Teams channels, Previous CRIs, Iridias, Emails sent to various DLs, public official blogs and documentation.
7. Check if this behavior is expected on public documentation\introduced on the "What's new" webpage:	https://learn.microsoft.com/en-us/azure/azure-monitor/whats-new?tabs=2024
8. Bypass any web proxy\firewall standing in between (If feasible) and test the behavior on different networks.
9. Use the browser's developer tools (Clicking on F12) and check for any red error messages and\or exceptions that can explain the issue.
	
**If any of the above did not resolve the issue, while having the HAR trace opened, Look for any response that indicates an issue:**
Skip any unrelated traffic (For example, calls that got caught unintentionally such as requests sent to websites which aren't Microsoft's).
Specifically, the focus should be on any requests\response related to the operation that failed to perform\the issue the customer encountered. The response codes which usually stick out are 3xx (Less common), 4xx,5xx, 0 and 200 Ok with no content coming back. 
	
**We can divide the responses investigation into two chronological steps:**
	1. CSS Investigation
	2. Decide which product group a CRI investigation should start with
	



# CSS Investigation
---


- **Any self-explanatory response body of 3xx-4xx-5xx codes.** Use Fiddler and its various capabilities to inspect the response and check what is the error message and description returned by the server. 
For example, response 503 Service Unavailable can indicate a transient high load of the service that returns this status code, hence checking for any existing\emerging outage of this particular service in this relevant region would be a good starter.
	
-  If a **HTTP 0.0 response** is coming back, **this usually indicates a networking issue on customer's end. You would commonly see that requests made to api.loganalytics.io (Or https://api.loganalytics.azure.com, where the api.loganalytics.io endpoint is being replaced by api.loganalytics.azure.com. The api.loganalytics.io endpoint will continue to be supported for the forseeable future.) return response code 0. It is required to make sure that the customer's machines can access this URL on port 443 with no TLS inspection** Since this type of response usually indicates a customer environmental networking issue, the very first step would be for the customer to look into their networking enviornment and examine the issue on their end, as it can be resulted by a proxy and/or firewall on their end. If any assistance is needed with this analysis, depending on the scenario, please engage the Networking team on a collaboration task to look into the trace. For example:
	
![image.png](/.attachments/image-a48f55f3-1b2a-4dc1-96a8-554e3422c15b.png)
- If an **empty response with no content** is coming back (Might have a **200 OK response code**), look for any **special headers on the RESPONSE.** There are cases where a proxy intervention has potentially malformed the traffic and led to this situation. In that case, The same actions listed for HTTP 0.0 (Previous bullet) will apply here. An example would be:
	![image.png](/.attachments/image-f99fe4cb-48bc-4e53-8320-a5d6c24dcfc9.png)

**If these actions did not yield any outcome, please proceed the next step:** _"Decide which product group a CRI investigation should start with_"

# Decide which product group a CRI investigation should start with
---
If the previous steps did not help with getting the issue resolved, please proceed with opening a CRI to the right team, following the guidelines listed below.

To open a CRI, please make sure you follow the instructions in this wiki page: [Escalating to the Azure Log Analytics product group](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480442/Product-Group-Escalation)
In case of any doubts, please reach out to a Log Analytics SME\TA\STA\EEE.

* **Owning Service: Azure Log Analytics
Owning Team: DataPlane_API_QueryService**
The Draft team is responsible for any Query related operations. This includes RBAC of Queries execution. Most of the dashboards that visualize workspace data are making calls to Draft to get that data. This team is considered to be part of Data Plane (Consumption).
	**Issues identified with following calls should be routed first to Draft team:**
		 api.loganalytics.io or https://api.loganalytics.azure.com (The api.loganalytics.io endpoint is being replaced by api.loganalytics.azure.com. The api.loganalytics.io endpoint will continue to be supported for the forseeable future.)
 management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/ExampleRG/providers/microsoft.operationalinsights/workspaces/MyWorkspaceName/api/metadata?.......
		 management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/ExampleRG/providers/microsoft.operationalinsights/workspaces/MyWorkspaceName/api/query?api-version=2017-01-01-preview
	**Portal Blades owned by this team are:**
		 Logs (Only the Draft calls, the UI\UX part is owned by Logs Portal team)


* **Owning Service: Azure Log Analytics
	Owning Team: Control Plane - CRIs for AMS and DAS only (QUERY issues use Draft-API)**
	In general, The AMS/DAS team is responsible for any workspace configuration tasks (Creation, deletion, data sources management etc.). This includes RBAC of configuration related operations. This team is considered to be part of the Control Plane.
	**Issues identified with following calls should be routed first to AMS\DAS team:**
		 URL: management.azure.com/api/invoke
			 Header: x-ms-path-query: /subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/ExampleRG/providers/microsoft.operationalinsights/MyWorkspaceName/XYZ?api-version=2015-03-20 (Where XYZ can have different values such as the workspace name and the word views, excluding query which is for Draft team as mentioned above)
			 Header: x-ms-path-query: /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/ExampleRG/providers/Microsoft.OperationsManagement/solutions?$filter=properties/workspaceResourceId%2520eq%2520%2527MyWorkspaceName%2527&api-version=2015-11-01-preview
		 URL: management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/ExampleRG/providers/microsoft.operationalinsights/workspaces/XYZ?api-version=2015-03-20
	**Portal Blades owned by this team are:**
		 Network Isolation (Used for Azure Monitor Private Link)
		
* **Owning Service: Azure Log Analytics
	Owning Team: Logs Portal**
	Logs portal is the logs UI team in addition to workspace configuration (CRUD) and workspace advanced settings. An investigation should start with the UI team if the error is a UI failure, or is not obvious from HAR captures, error messages and ARM logs. This team also owns parts of Log Analytics dashboard (Such as pinning queries results\visual charts to the dashboard) and visualization experience. For example, Properties blade is handled by this team, while "Usage and Estimated costs" blade is not.
	**Issues identified with following calls should be routed first to Logs Portal team:**
		 Portal.loganalytics.io
		 logsextension.hosting.portal.azure.net/logsextension
	**Portal Blades owned by this team are:**
		 Overview
		 Agents management
		 Advanced Settings (Split between Operational Framework/Triage team and Logs Portal team, should start with Logs Portal team first, see roadmap here
		 Logs (The UI\UX, Unless the issue is related to an underlying call to Draft)
		 Properties
		 Virtual Machines


	
*  **Owning Service: Operational Framework
	Owning Team: Incident Manager**
	The Operational Framework team mainly handles Solutions related tiles and dashboards, including the Workspace summary blade experience. This team does not own the actual solutions but the UI underlying components. This team also owns some of the "Advanced Settings" blade experience, however this blade's upcoming new experience will be owned by Logs Portal team once released.
	There are no direct and visible API calls for this team's components. These calls can also go through an AMS\DAS call.
	**Portal Blades owned by this team are:**
		 Solutions
		 Workspace summary 
		
