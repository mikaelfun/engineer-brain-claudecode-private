---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Workbooks/How-To/Set Timezone to Local Time (Default) or UTC"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Workbooks/How-To/Set%20Timezone%20to%20Local%20Time%20%28Default%29%20or%20UTC"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Instructions
---
In some instances, a customer might want to make sure there is a set time when viewing the data such as in UTC. This can be done by customizing the column settings.

- In your Azure Workbook in edit mode, click on the 'Column Settings' option at the top part of your query:
![image.png](/.attachments/image-884a0c1f-f6ae-41ea-8acd-cad517ff11e1.png)

- Click on the column that you would like to use as a 'Date/Time' column and then modify the option 'Column renderer' to 'Date/Time'. In this example I'm using my TimeGenerated column in my query to set the Date/Time:
![image.png](/.attachments/image-b2a3619a-e43b-400f-9f39-25993b33e4f2.png)

- From here click on the checkbox 'Custom date formatting' which will launch other options below it. From here you can set to show the time as Local Time (This is the Default) or UTC. You can also modify how the date format is as well:
![image.png](/.attachments/image-5985d141-9413-4b8e-821f-ee8cc0494983.png)

- Once you click 'Apply' at the bottom the TimeGenerated column will change the format as you have set it in the column settings. In my example I left this at the full date time option but set the 'Show time as' UTC:
![image.png](/.attachments/image-61ae38cf-5108-4fb9-8cd4-efa45bb3ce24.png)

# Resources
[Azure Workbooks | Custom Date Formatting](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-grid-visualizations#custom-date-formatting)
