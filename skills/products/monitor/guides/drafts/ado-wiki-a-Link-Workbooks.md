---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Workbooks/How-To/Link one Workbook to Another Workbook"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Workbooks/How-To/Link%20one%20Workbook%20to%20Another%20Workbook"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Instructions
---
This process will cover how to create a link from an existing Workbook to another created Workbook. This can be useful if you have data in one Workbook but want to link to another Workbook with more specific information.

# Process
- You'll need two created Workbooks to complete this. If you have two you can follow the steps to link them together or you can create two Workbooks and follow the steps.

1. From the 1st Workbook select the '+ Add' option and then choose 'Add links/tabs':
![image.png](/.attachments/image-b327344f-3c33-4b5d-a763-018080ba67a0.png)

2. In the link edit screen you can update the options like the ones below. I changed the style to a list and to a button. The action you'll want to use is the 'Workbook (Template)' action:
![image.png](/.attachments/image-2a2102b5-94fc-4fb3-8d42-852048b142bd.png)

3. Next, we'll click on the 'Configure...' button in the same line to launch some additional options, this is where we create the link!

4. In the options in this section, we'll want to change the option 'Workbook/Template Id comes from' to 'Static Value'. Then within it we'll input the full Resource ID of the other Workbook you want to link to:
![image.png](/.attachments/image-736c26b3-e2fa-4db0-9426-d691e1ad3813.png)

5. Save and close this panel and click on 'Done editing' on the links tab. If you created a button, click on it and it should take you to your other Workbook!

# Resources
[Azure Workbooks | Linking Workbooks](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-create-workbook#add-links)
