---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Solutions/How-to: Manage the solution targeting"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/How-To%20Guides/Solutions/How-to%3A%20Manage%20the%20solution%20targeting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]


To access your Solution Targeting, go to the workspace and from here either:

Go to Solutions -> click on the solution (ex: Updates) -> Solution Targeting (Preview):

![image.png](/.attachments/image-af591b9c-d0dd-48b2-bfda-91b3d2800fee.png)

Or from the workspace -> go directly to Solution Targeting.



Check the last time when the solution was seen on the VM:


```
Heartbeat
| where Solutions contains "changeTracking" // add your solution here (ex: "updates") 
| summarize max(TimeGenerated) by Computer, Solutions
```

![image.png](/.attachments/image-77707838-2627-48d6-bff4-ac1bd8ec9e52.png)

Now I need to check if there were any events around 10:50 UTC


https://armprodgbl.eastus.kusto.windows.net/Armprodgbl
```
Unionizer("Requests", "HttpIncomingRequests") 
| where TIMESTAMP between (datetime(2019-05-21 10:00:00.0000000) .. datetime(2019-05-21 11:00:00.0000000))
| where subscriptionId == "" //your subscription or the customer subscription
| where operationName contains "PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.OPERATIONALINSIGHTS/WORKSPACES/CONFIGURATIONSCOPES/"
| limit 10
```

![image.png](/.attachments/image-d0247a59-8701-4327-ac0f-22745c735717.png)

I see a configuration scope was pushed about 50 minutes before the problems started to appear�

Or you can check with this directly on the customer workspace with these additional queries.


```
Operation
| where OperationCategory == 'ConfigurationScope'


Operation
| where OperationCategory == 'ConfigurationScope' and OperationStatus == "InvalidSyntax"
```

You can do a repro yourself by following the documentation.

Below you can see an reproduction of the configuring a scope, although it is a bit disorganized. It is always best to test it yourself, but the below screenshots can server as a reference.



We need to use the operator distinct and a function in order to create a Computer Group.

![image.png](/.attachments/image-5ba627b9-37f0-470d-acd6-adfe7e06f370.png)

![image.png](/.attachments/image-45196bd5-2951-4722-9a86-29400941d8ca.png)

However, this function said that it has a wrong syntax� so in order to make sure we are getting things right, please use this format that you see in the Saved groups in Advanced Settings

![image.png](/.attachments/image-d8b38927-4207-4638-bcb9-3e9f1df8a701.png)

So I will remove the configuration called myFirstScopeConfiguration1

![image.png](/.attachments/image-c14b6ef8-a434-4476-9f19-c83e857fa4b7.png)

And I will replace it with YourWin16 - you can see all of this in Activity Log

![image.png](/.attachments/image-cd169dd7-7b76-4ef0-ae30-f65269788fce.png)


Also, don't create the scope and assign it from the solution, but rather from the Workspace -> Data Sources -> Scope Configurations

![image.png](/.attachments/image-591f06ea-3b46-41fa-b149-a33ce1021636.png)

Only then assign it to the solution that you want.

Here is the event:
![image.png](/.attachments/image-3fe55152-1906-4480-8629-f4d1a61a7ef5.png)


Before I pushed the new scope:
![image.png](/.attachments/image-5252d9e2-f53d-4d9a-ba35-adfd57cf984d.png)


```
Heartbeat
| where TimeGenerated > ago(10m)
| where Solutions contains "change"
| summarize max(TimeGenerated) by Computer, Solutions
```
 




After pushing the new scope:

![image.png](/.attachments/image-6e916612-579f-43db-910c-f5a2998c2b2f.png)

No events were generated for the machine that's still in the scope - Windows Server 2016 


However, we can see the new configuration pushed on the servers that are OUTSIDE of the scope (for example, this Windows Server 2012) - we need to look for Event ID 1210

![image.png](/.attachments/image-891c4553-a495-46db-8884-5ac8fad1d3ed.png)

We can see that the Ubuntu machine, the Windows Server 2012 are no longer in the Scope - however, two of the non-Azure VMs are still in the scope

![image.png](/.attachments/image-5a576ded-70ea-4661-a2db-c32dd4a1cb44.png)

It might take a bit longer for the non-Azure VMs to get rid of the configuration

In my case, I can see on my laptop that in the Event Viewer, the new configuration was pushed at 1:26, but in Log Analytics, I see the old configuration (with Change Tracking) stayed until 1:53� so it might take about 30 minutes for the new configuration to fully apply

![image.png](/.attachments/image-5472035b-2221-4b76-a4ad-813bb2d26ece.png)

![image.png](/.attachments/image-08133891-bae7-49e5-9e1b-55eecbb07f41.png)

Now I can see that I have only one VM in that scope.

![image.png](/.attachments/image-9cac212b-4d6b-4ebc-b410-31c242fd4555.png)



