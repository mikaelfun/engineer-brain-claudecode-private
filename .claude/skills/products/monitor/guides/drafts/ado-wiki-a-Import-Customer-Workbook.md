---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Workbooks/How-To/Import Customer Workbook Into The Portal For Analysis"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Workbooks/How-To/Import%20Customer%20Workbook%20Into%20The%20Portal%20For%20Analysis"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Instructions
---

# Explanation
1. For some Workbooks cases it may be required to obtain a copy of a customer's Workbook to review. This can now be done in Azure Support Center by locating the Workbook, copying the JSON and importing it into your subscription. This set of instructions will show you how to upload it into your Azure Portal so you can see the contents.
    -  Note: Would be used if customer created their own custom Workbook, in instances they are using one of the built-in 
       Workbooks you can collab with the team that owns the Workbook.

# Process
1. If you need to review a Workbook outside a customer call, have the customer click the 'Edit' button from within the Workbook:
![image.png](/.attachments/image-c78ba391-42e2-4a66-9a5c-dcfc9b87e161.png)

2. After clicking that there will be more options available, next click on the icon that looks like '</>' for the advanced editor:
![image.png](/.attachments/image-860caebe-ddac-47ea-b35e-a6df3c30b48e.png)

3. Once this is clicked there will be a screen which shows both the Gallery template as well as the ARM template. For our purposes we can collect either of these, but I'd say the Gallery template is preferred as it's much faster to import. Have the customer collect these and upload them to the DTM.

4. Once you have the data navigate to 'Monitor -> Workbooks' in the Azure Portal and choose the option New or Empty to start a new Workbook:
![image.png](/.attachments/image-115eaca1-808a-4909-b438-b4f00cfb0bf3.png)

5. From here all you'll need to do is navigate to the advanced editor, copy the entire gallery template that the customer provided and replace all the text in the gallery template section of your new Workbook. Then click 'Apply', look at the changes and save the Workbook so you have it for review:
![image.png](/.attachments/image-70e0aa1c-d281-46ce-9ce7-31a64229b4c7.png)

Note: The Workbook may not necessarily populate all the data as it's more targeted towards the customers' resources, but it can be good to have to review any queries and how it's pulling data for investigation. The Workbook should also be deleted once the case is closed, or at the minimum you should sanitize the data within to remove any hardcoded resource ID's or any other values the customer might have put in there (you can do this by modifying the gallery template).

# Resources
[Deploying Workbook Templates](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-automate)
