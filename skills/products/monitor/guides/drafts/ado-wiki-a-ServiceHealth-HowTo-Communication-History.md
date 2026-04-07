---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Service Health/How-To/How to get communication history for a Service Health event"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FService%20Health%2FHow-To%2FHow%20to%20get%20communication%20history%20for%20a%20Service%20Health%20event"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

#Instructions
---
1. Identify the Service Health tracking Id that you want to check (for example "8N_M-V98").
1. Open a browser and navigate to [Iridias](https://aka.ms/iridias).
1. Enter your tracking Id into the search dialog and then click on the match from the returned results.

   ![image.png](/.attachments/image-a4b1456d-d172-4e63-895f-89236a5deace.png)

At the top of the page will be a summary of the event including a link to the corresponding incident in ICM.

![image.png](/.attachments/image-ae82e5ea-b6fd-4eaa-b1e7-5d5480f8c892.png)

In the **Communications** section will be all communications related to the event with tabs filtering by internal, Azure portal and Azure status page communications (default is to show all communications).

![image.png](/.attachments/image-bc392f5f-f352-4ddd-b22e-6013d6158add.png)

Each communication has a unique communication Id.

![image.png](/.attachments/image-4633a62c-e685-46c2-8488-eeabc5307aca.png)


