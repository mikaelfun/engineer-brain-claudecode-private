---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Workspace Management/How-To: Check solution targetting"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/How-To%20Guides/Workspace%20Management/How-To%3A%20Check%20solution%20targetting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
In some scenarios, customers could be claiming that some machines do not have the 'updates' or 'security' solution added. The first thing to check is if the solution any changes were made on the solution targetting or if it was actually being applied to the solution - the steps below could help in doing so.

# High level steps
---

- [ ] Check using Azure Support Center
- [ ] Check the Solution Targetting Status 
- [ ] Check the last time when the solution was seen on the VM

#Using Azure Support Center
(if you know your way around Azure Support Center's Log Analytics extension, you can jump to step **4**)

1. Open [Azure Support Center](https://aka.ms/azuresupportcenter/caseoverview) (ASC) and enter the relevant case ID into the search box. Then either click the search icon or press enter:
![image.png](/.attachments/image-7ac3fe92-efa0-45fa-8242-9d1d92ea77e4.png)

2. By default, ASC will open the '**Case Overview**' page, so please select '**Resource Explorer**' on the top menu:
![image.png](/.attachments/image-510ca452-9c77-42a0-a70e-65ef224f18c2.png)

3. If the case was opened against the correct Log Analytics workspace, then you can skip to step **4**. However, if '**Resource Explorer**' didn't open on the correct resource type or the correct workspace, then please do one of the following:
* Type the workspace name on the search box and once if you find it, just click on it:
![image.png](/.attachments/image-49ab478a-f846-43c8-a3d2-ff9fa0368e06.png)
* Select the '**Resource Providers**' option, then expand the '**Microsoft.OperationalInsights/workspaces**' resource provider, then '**workspace**' and finally select the relevant workspace:
![image.png](/.attachments/image-4577b25a-ce7e-4b25-a425-4ad564e9b6c1.png)

4. Now that you're on the context of the correct workspace, select the '**Solutions**' tab and then expand the relevant solution (by clicking on the blue '>' sign in from off the solution name) or just filter the solutions by name (like on the screenshot bellow). Once you've expanded it, check the 'Is Targeted' property to see if there's any solution targeting applied:
![image.png](/.attachments/image-33127506-3864-4b83-94dc-e1c6d17b4115.png)
**Note**: As you can see, for the '**Updates**' solution, if Azure Security Center is enabled, then you should check the targeting under the '**Update**' table, under the solution '**Updates,SecurityCenterFree**'


#Using Workspace Dashboard tool
You can also use the Workspace Dashboard tool to check if a solution is targeted or not:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750251/How-To-Find-information-about-a-workspace-just-having-the-name-or-workspaceID
Searching for the relevant workspace, go to the section named "Solution Changes (V2 only)" and check the "SolutionTargeted" field value for the relevant solution.


#Check the last time when the solution was seen on the VM
```
Heartbeat
| where Solutions contains "changeTracking" // add your solution here (ex: "updates") 
| summarize max(TimeGenerated) by Computer, Solutions
```
![image.png](/.attachments/image-aeaf9307-bf8d-4dfe-9ed1-42d0ee297aa8.png)

Now I need to check if there were any events around 10:50 UTC
https://armprodgbl.eastus.kusto.windows.net/Armprodgbl
```
Unionizer("Requests", "HttpIncomingRequests") 
| where TIMESTAMP between (datetime(2019-05-21 10:00:00.0000000) .. datetime(2019-05-21 11:00:00.0000000))
| where subscriptionId == "00000000-0000-0000-0000-000000000000" //your subscription or the customer subscription
| where operationName contains "PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.OPERATIONALINSIGHTS/WORKSPACES/CONFIGURATIONSCOPES/"
| limit 10
```

![image.png](/.attachments/image-5ce49d7d-3d30-41ab-bc36-ded974d77fb5.png)

I see a configuration scope was pushed about 50 minutes before the problems started to appear�
Or you can check with this directly on the customer workspace with these additional queries.

```
Operation
| where OperationCategory == 'ConfigurationScope'
```
```
Operation
| where OperationCategory == 'ConfigurationScope' and OperationStatus == "InvalidSyntax"
```


