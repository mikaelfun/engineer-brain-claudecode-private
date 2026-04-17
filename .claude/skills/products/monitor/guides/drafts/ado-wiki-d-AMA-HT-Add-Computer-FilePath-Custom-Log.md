---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Add Computer and FilePath fields to AMA Agent Custom Log table"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Add%20Computer%20and%20FilePath%20fields%20to%20AMA%20Agent%20Custom%20Log%20table"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]


# Introduction
---
We've received multiple feedbacks and requests from our customers asking for the **Computer** and **FilePath** fields under the Custom Log table when using AMA agent to collect custom logs in order to know from which path and which machine the data are coming from exactly, this is especially needed when the customer configure multiple machines and files/directories to collect custom logs from.

Starting with the Agent versions listed below, the Computer column is available along with FilePath column which was previously introduced. 

AMA Windows **1.29**
AMA Linux **1.32.6**

on this How-To wiki we are going to describe how to add this functionality under the custom log table.

# Instructions
---

If the custom log table already exist as well as the DCR, then there are two parts to be done:

1-Editing the schema of the Custom table under it's Log Analytics Workspace.
2-Exporting the DCR itself which used to collect that custom log and redeploy it while adding the required fields. 

below are the detailed steps: 

**Part one:** 

1. Go the Log Analytics Workspace which contains the Custom Log table.
2. Go to **Tables** tab under that Workspace. 
3. Find the needed custom log table (Example: MSRepro_CL). 
4. Click on the three dots and choose to **Edit Schema** of that table. 
5. Click **add Column** and write in the _column name_ **Computer** and keep the _type_ as **String**. 
6. Click on **Save**.

(you also may check the numbered steps in the screenshot below)

![image.png](/.attachments/image-52a9a823-7439-4386-9b52-c00f9670dcad.png)


**Part two:** 
 
1. Go to **Data collection rules** and export the needed DCR (Custom Log DCR) by choosing **Export Template** option under Automation. 
2. Click **deploy** to deploy the template.
3. Click **Edit Template** and add the **Computer** and **FilePath** fields to it as the below example: 


**Example**: (copiable text)


       "streamDeclarations": {

             "Custom-Text-MSRepro_CL": {
                "columns": [
                    {
                        "name": "TimeGenerated",
                        "type": "datetime"
                    },
                    {
                        "name": "RawData",
                        "type": "string"
                    },
                    {
                        "name": "FilePath",
                        "type": "string"
                    },
                    {
                        "name": "Computer",
                        "type": "string"
                    }
                ]
            }
        },


4. then click **Create**.

(you also may check the numbered steps in the screenshot below)


![image.png](/.attachments/image-0b281bf2-16fe-4513-a59d-f76c106f2a0b.png)



**Note 1:** 
If it is a **new** deployment of the custom log table and the custom log DCR then the table creation step is already described in the public doc here: https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-text?tabs=portal#custom-table.


    




for the DCR part, the customer still needs to manually edit his DCR to add the **Computer** and **FilePath** fields since it is not doable from the portal, to do that, part two above has to be followed. 
(below table is from our public doc here: https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-text?tabs=portal#incoming-stream

![image.png](/.attachments/image-a15e685a-34a0-4539-a245-310dd20737bd.png)

**Note 2:** We already informed the product group to automatically add the new fields to the Custom log schema (StreamDeclrations), and we have a work item to update the custom log DCR default schema and the documentation as well, stay tuned.  

**WorkItem** - [Feature 29326805](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fdev.azure.com%2Fmsazure%2FOne%2F_workitems%2Fedit%2F29326805&data=05%7C02%7CThamer.Obeidat%40microsoft.com%7C9fc381325e364f68a61a08dccdd2e704%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638611554686965413%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=z0gqYZVFUw96dyNy%2Bea0brS3AG28A2QAfu41DtBcbO0%3D&reserved=0): Add new columns in DCR schema when creating custom Text and JSON DCRs


# Reviewing the results
---
Write some data to the log file on the monitored machine and wait for the data to be uploaded to the workspace, then check the new fields appearing now as below:


![image.png](/.attachments/image-308050e5-be42-4efa-bb9c-034a5ced58e4.png)





