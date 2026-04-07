---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/How-To/How to verify in ASC that DCR is created and associated with VM"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Windows%2FHow-To%2FHow%20to%20verify%20in%20ASC%20that%20DCR%20is%20created%20and%20associated%20with%20VM"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.

[[_TOC_]]
# Learning DCR Association with VM via ASC Feature
In ASC: Navigate to 
Microsoft.insights >> DataCollectionRules >> {DCR NAME}
Once DCR is selected, Resource Explorer view will be loaded.

![image.png](/.attachments/image-e32e52c4-ccba-467f-8bcc-ab9f68fa696d.png)

Association details will be shown as follows:

![image.png](/.attachments/image-f8712dca-2ef1-4f1d-a7e5-1ced15d3552c.png)

Properties tab shows details about target DCR (that is immutable id, data sources, destinations, etc.)

![image.png](/.attachments/image-5d02ba3f-3635-4b35-9b78-9df1b6b75cdd.png)

# How to check DCR association If DCR association feature is not working in ASC?
Using the following method we can find DCR association for any given resource with ASC.

**Step1:**
Lets say the resource you are interested in is an Azure VM.
Locate Azure VM in ASC. 
Follow the screenshot below to locate the Azure VM to learn its resource Id.

![image.png](/.attachments/image-5ea10e73-3048-456b-bb64-4ca611a84b0e.png)
**Step2:**
Once you have resource ID copied, you got to microsoft.insights/dataCollectionRules in ASC
**Don't click the actual DCR name but rather select dataCollectionRules just like in image below**

![image.png](/.attachments/image-7ff7ac63-e5e7-47a0-923e-e10e18ec46af.png)

**Step 3:**
Please note the DCR association with VM shows the name of the associated DCRs.

![image.png](/.attachments/image-829b2ea0-612e-4687-b0f0-1e0cea86b6be.png)

# Using Azure Resource Graph Queries
In case  when there is no data collection rule in current subscription or or all Data Collection Rules belong to another subscription which is not added in ASC, you will not see Microsoft.Insights --> Data collection rules to enter VM resource Id to get details of the DCR association for that VM. you can use Azure Resource Graph queries in that case to get DCR association details.

In ASC: Navigate to >> Subscription (Root level) >> ARG Query Editor
**![ARG.png](/.attachments/ARG-e1cc0bf8-3651-4b0e-bbb1-6d0f9075ade8.png)**
a) Azure Virtual machine

**insightsresources
| where type == 'microsoft.insights/datacollectionruleassociations'
| where id contains 'microsoft.compute/virtualmachines/'  
| project id = trim_start('/', tolower(id)), properties
| extend idComponents = split(id, '/')
| extend subscription = tolower(tostring(idComponents[1])), resourceGroup = tolower(tostring(idComponents[3])), vmName = tolower(tostring(idComponents[7]))
| extend dcrId = properties['dataCollectionRuleId']
| where isnotnull(dcrId)
| extend dcrId = tostring(dcrId)
| where vmName =~ "<<VM_NAME>>"
| summarize dcrList = make_list(dcrId), dcrCount = count() by subscription, resourceGroup, vmName
| sort by dcrCount desc**

b) VMSS

**insightsresources
| where type == 'microsoft.insights/datacollectionruleassociations'
| where id contains 'microsoft.compute/virtualMachineScaleSets'
| project id = trim_start('/', tolower(id)), properties
| extend idComponents = split(id, '/')
| extend subscription = tolower(tostring(idComponents[1])), resourceGroup = tolower(tostring(idComponents[3])), vmName = tolower(tostring(idComponents[7]))
| extend dcrId = properties['dataCollectionRuleId']
| where isnotnull(dcrId)
| extend dcrId = tostring(dcrId)
| where vmName =~ "<<VMSS_name>>"
| summarize dcrList = make_list(dcrId), dcrCount = count() by subscription, resourceGroup, vmName
| sort by dcrCount desc**

c) Azure Arc

**insightsresources
| where type == 'microsoft.insights/datacollectionruleassociations'
| where id contains 'Microsoft.HybridCompute/'
| project id = trim_start('/', tolower(id)), properties
| extend idComponents = split(id, '/')
| extend subscription = tolower(tostring(idComponents[1])), resourceGroup = tolower(tostring(idComponents[3])), vmName = tolower(tostring(idComponents[7]))
| extend dcrId = properties['dataCollectionRuleId']
| where isnotnull(dcrId)
| extend dcrId = tostring(dcrId)
| where vmName =~ "<<ARC_machine_name>>"
| summarize dcrList = make_list(dcrId), dcrCount = count() by subscription, resourceGroup, vmName
| sort by dcrCount desc**


Data Collection Endpoint association with VM:

**insightsresources
| project id = trim_start('/', tolower(id)), properties
| extend idComponents = split(id, '/')
| extend subscription = tolower(tostring(idComponents[1])), resourceGroup = tolower(tostring(idComponents[3])), vmName = tolower(tostring(idComponents[7]))
| extend dceId = properties['dataCollectionEndpointId']
| where isnotnull(dceId)
| where vmName =~ "<<VM_name>>"
| project dceId, vmName, resourceGroup, subscription**
