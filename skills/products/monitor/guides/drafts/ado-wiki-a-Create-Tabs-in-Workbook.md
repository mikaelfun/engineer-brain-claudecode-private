---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Workbooks/How-To/Create Tabs in Workbook"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Workbooks/How-To/Create%20Tabs%20in%20Workbook"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Instructions
---
This is an intro on how to create tabs in your Workbook. Tabs can be used to logically split up sections of your Workbook for a better reading experience. Using tabs relies on making items conditionally visible depending on which tab is picked, below I will create a simple example of this.

# Process
- From 'Monitor->Workbooks' select to create a new Workbook.
- Click on the '+ Add' button and select 'Add links/tabs':
![image.png](/.attachments/image-94b6d956-f996-45b8-9689-9534a23cef13.png)

- This will launch a box with a bunch of empty boxes within it, change the 'Style' section to Tabs:
![image.png](/.attachments/image-5629efaa-b203-49ae-a3a9-0f0b57dda76f.png)

    - Explaining the above picture, each row is a new tab I've created, and I've set the action to 'Set a parameter 
      value'. After this we are telling it to set the parameter 'selectedTab' to the value in the 'Settings' column.

- After creating this (it doesn't look like much) you'll see your three tabs. Next, we'll make a few different items and set them to only show when clicking on a certain tab:
![image.png](/.attachments/image-c45b9014-bac8-4255-b505-22ddfbf0e253.png)

- In this example, I'm going to create a few text boxes by again clicking on '+ Add' and then selecting 'Add text':
![image.png](/.attachments/image-baff3e85-835a-4c3e-9f59-ac9956b8341d.png)

- From here, add any text you want (I put 'Only show in Tab 1') and then click on 'Advanced Settings':
![image.png](/.attachments/image-46f75d66-ff1b-43c6-9213-eb197b48f04b.png)

    - Explaining the above picture, when you set an item as conditionally visible you are applying a condition on the item to only appear when the condition is met. In this example I only want to see it when the parameter 'selectedTab' equals 1 which is set by selecting 'Tab 1' in the Workbook.

- Save your changes and then click on 'Tab 1' in your Workbook. This will set the parameter 'selectedTab' to equal 1, which satisfies the condition set in your conditionally visible setting. In which case you should now see your text:
![image.png](/.attachments/image-41925fec-ecbb-4db4-aa85-852fe00ae5a8.png)

- Do the same for Tab 2 and 3, feel free to add different visualizations to the experiment. This was my finished product, note that you'll see the other tabs when in edit mode, but they'll show as greyed out. Once you leave edit mode, you'll only see the visual for each tab:
![image.png](/.attachments/image-6113b88a-f286-406c-9105-e6e712c4c17c.png)

# Resources
[Azure Workbooks | Creating Tabs](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-create-workbook#tabs)
