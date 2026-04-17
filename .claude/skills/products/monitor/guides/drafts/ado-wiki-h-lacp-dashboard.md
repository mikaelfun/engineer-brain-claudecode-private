---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Tools/Collect Log Analytics workspace properties using LACP Dashboard"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FTools%2FCollect%20Log%20Analytics%20workspace%20properties%20using%20LACP%20Dashboard"
importDate: "2026-04-05"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
::: 

[[_TOC_]]

#Overview
___
The following article provides a quick overview of the LACP dashboard that exposes a great deal of information about a specific Log Analytics workspace, provided you have the workspace ID to use in your search. 

#Considerations
___
- N/A

#Workflow
___
1. Access the dashboard by click this [link](https://dataexplorer.azure.com/dashboards/57eff9ae-528d-426a-9650-18b5b02e62ea?p-_startTime=30days&p-_endTime=now&p-_regionCode=v-all&p-_workspaceName=v-10000000-0000-0000-0000-000000000001&p-_serviceVersion=all&p-_role=all#362bd42c-b4e4-49d6-9c92-ce6d655bdb9d)
1. On the top menu options, replace the default workspace ID with the value of the workspace you are wanting to investigate: 

   ![image.png](/.attachments/image-ca043e3c-91dd-4ef6-baca-ad3c55bd5555.png)

   ![image.png](/.attachments/image-17690bc9-10ca-4832-802f-ca7c65ac617a.png)

1. Once that new workspace ID is entered, you will see information on that workspace populate int he dashboard. This dashboard contains additional information on the resource that you might now necessarily find through other means like ASC or AIMC. 

   ![image.png](/.attachments/image-9ef21ee2-3f94-4ec4-a16f-3980d6bcbbae.png)


#Public Documentation
___
- N/A

#Internal References
___
- N/A
___
Last Modified: 2024/07/17
Last Modified By: nzamoralopez