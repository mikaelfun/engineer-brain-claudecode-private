---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/How-To/Filter Container Insights for specific tables"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/How-To/Filter%20Container%20Insights%20for%20specific%20tables"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::


[[_TOC_]]
#Context
---
When [Configure Container insights data collection - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-data-collection-configure?tabs=portal), we can choose only groups of logs. It is not possible to choose individual tables from default configuration.

![image.png](/.attachments/image-0a7fc7cb-f592-4d51-a055-e4e05c55953e.png)

The **Collected data** option allows you to select the tables that are populated for the cluster. The tables are grouped by the most common scenarios. To specify individual tables, you must modify the DCR using another method.

# Process
---
       
If you need to collect only specific tables (not groups of tables as explained ahead), you need to change the [Stream values in DCR](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Flearn.microsoft.com%2Fen-us%2Fazure%2Fazure-monitor%2Fcontainers%2Fcontainer-insights-data-collection-configure%3Ftabs%3Dportal%23stream-values-in-dcr&data=05%7C02%7Cbalexandre%40microsoft.com%7C331aadb677374cd9839a08dd31943ab0%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638721234920449282%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=yLX6oB%2FmGVrrPNhUz79wflOR80FzWUBUdfl5RYOlnOE%3D&reserved=0) to choose specific tables according to the list below.
![==image_0==.png](/.attachments/==image_0==-f0a5cc5e-1e9a-4a9f-83c0-cb7a1a50df84.png) 

To do this, you need to be familiarized to [Structure of a data collection rule (DCR) in Azure Monitor - Azure Monitor | Microsoft Learn](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Flearn.microsoft.com%2Fen-us%2Fazure%2Fazure-monitor%2Fessentials%2Fdata-collection-rule-structure&data=05%7C02%7Cbalexandre%40microsoft.com%7C331aadb677374cd9839a08dd31943ab0%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638721234920460804%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=mwuKSGzdvLopKiqS3z13IgpwR4IBd1N1O8rY047mhSA%3D&reserved=0) and [Data transformations in Container insights - Azure Monitor | Microsoft Learn](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Flearn.microsoft.com%2Fen-us%2Fazure%2Fazure-monitor%2Fcontainers%2Fcontainer-insights-transformations&data=05%7C02%7Cbalexandre%40microsoft.com%7C331aadb677374cd9839a08dd31943ab0%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638721234920471568%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=0QQzV8cme7XySBkezICEOxZs3ie5yBd%2B5bQuszeEaP4%3D&reserved=0)

In the example below we want to collect only “_ContainerLogV2_” and “_KubePodInventory_“ tables.
For this, we need to [Create data collection rules (DCRs) in Azure Monitor - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/data-collection-rule-create-edit?tabs=cli)

1 – The DCR with default logs collection. It means, all container insights tables will be populated.
        ![==image_0==.png](/.attachments/==image_0==-29725987-64b4-433b-a8fa-0140a3d10b2c.png) 
      
2 – Follow the steps below to edit the DCR

**2.1 - Export the DCR content and save it to a file**



```
$ResourceId = "<ResourceId>" # Resource ID of the DCR to edit
$FilePath = "<FilePath>" #  Store DCR content in this file. Create manually an empty JSON file, first
$DCR = Invoke-AzRestMethod -Path ("$ResourceId"+"?api-version=2022-06-01") -Method GET
$DCR.Content | ConvertFrom-Json | ConvertTo-Json -Depth 20 | Out-File -FilePath $FilePath 
```

**2.2 - Edit the exported DCR content according to "**[**Data transformations in Container insights**](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Flearn.microsoft.com%2Fazure%2Fazure-monitor%2Fcontainers%2Fcontainer-insights-transformations%23add-a-column-to-a-table&data=05%7C02%7Cbalexandre%40microsoft.com%7C331aadb677374cd9839a08dd31943ab0%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638721234920482538%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=8MFwc2oyofUpxSVWBIFGCxfRl%2FszuvJmRg1fO6BGWHY%3D&reserved=0) **" to add only the Streams (tables) you want.**

In this example: Tables “ContainerLogV2” and “KubePodInventory” and corelated Streams “Microsoft-ContainerLogV2” and “Microsoft-KubePodInventory”
```      
 "dataSources": {
            "extensions": [
                {
                    "streams": [
                        "Microsoft-ContainerLogV2",
                        "Microsoft-KubePodInventory"
                    ],
                    "extensionName": "ContainerInsights",
                    "extensionSettings": {
                        "dataCollectionSettings": {
                            "enableContainerLogV2": true
                        }
                    },
                    "name": "ContainerInsightsExtension"
   ///

        },
        "dataFlows": [
            {
                "streams": [
                        "Microsoft-ContainerLogV2",
                        "Microsoft-KubePodInventory"
                ],
                "destinations": [
                    "la-workspace"
                ]
            }
        ],
```
**2.3 - Apply changes to update the DCR:**


```
$ResourceId = "<ResourceId>" # Resource ID of the DCR to edit
$FilePath = "<FilePath>" # Store DCR content in this file
$DCRContent = Get-Content $FilePath -Raw
Invoke-AzRestMethod -Path ("$ResourceId"+"?api-version=2022-06-01") -Method PUT -Payload $DCRContent
```
After this, you’ll see your DCR was changed.
        ![==image_0==.png](/.attachments/==image_0==-47843bce-e2e3-4875-9a6d-fec04626d5f0.png) 
      
After some time, when the new configuration finish propagates, you’ll see all logs stopped to be collected except “_ContainerLogV2_” and “_KubePodInventory_”.

 ![==image_0==.png](/.attachments/==image_0==-df71c0c5-690f-4eaa-80d3-b400ffca09a0.png) 

      
**ATTENTION!** _This action will not delete the tables already created in the log analytics workspace. This only will stop the logs be collected and the tables will no populated anymore_.

An important point is to know what information you want to collect and in what table this information is recorded.
Please, see this document about [Azure Monitor Logs reference - ContainerLogV2 - Azure Monitor | Microsoft Learn](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Flearn.microsoft.com%2Fen-us%2Fazure%2Fazure-monitor%2Freference%2Ftables%2Fcontainerlogv2&data=05%7C02%7Cbalexandre%40microsoft.com%7C331aadb677374cd9839a08dd31943ab0%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638721234920514908%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=Q6adlhtNbBeE75VJL6OPXmsT17IrnsazWb6tcItl6j8%3D&reserved=0) and search for each table schema according to the list of tables used by Container Insights.

![image.png](/.attachments/image-d2d6f587-c828-40d3-a608-c4061277da0c.png)

#References
---
* [Configure Container insights data collection - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-data-collection-configure?tabs=portal)
* [Data transformations in Container insights - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-transformations)
* [Create data collection rules (DCRs) in Azure Monitor - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/data-collection-rule-create-edit?tabs=cli)


