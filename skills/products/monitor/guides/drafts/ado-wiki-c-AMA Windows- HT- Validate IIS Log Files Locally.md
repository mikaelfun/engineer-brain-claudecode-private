---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Validate IIS Log Files Locally"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Validate%20IIS%20Log%20Files%20Locally"
importDate: "2026-04-07"
type: troubleshooting-guide
---


:::template�/.templates/Common-Header.md

:::

## Overview
---
This guide outlines the steps to validate if the IIS log files are properly generated at the expected path by the IIS Service. In case there is no log generated yet, we can access the website once so that new entries will be logged.

## Steps
---
  1. To validate the log file path configured in IIS, Open IIS in the machine and navigate to logging.

   ![image.png](/.attachments/image-d7daf8cd-63a2-41ba-8218-8c74104986e4.png)

  2. See the path configured there, by default it is as below. Also make sure the format is W3C (default one) as that is the one which is supported.

![image.png](/.attachments/image-b2c6ea17-88c1-489a-93aa-64dcefc610a3.png)

  3. In the IIS log file path, check if the latest file has latest entries being written.

![image.png](/.attachments/image-42b68b16-f609-4c04-bd7e-ce85133f653d.png)

  4. You can also generate few by asking customer to browse the default/any app hosted on IIS like below, it will make new entries in those log files. Whether it opens anything in browser or not, it will make new entries in IIS log files.

![image.png](/.attachments/image-812f0748-bda6-4ccc-8cda-d9b09b9c289b.png)
