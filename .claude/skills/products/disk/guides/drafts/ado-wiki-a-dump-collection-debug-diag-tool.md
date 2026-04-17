---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/WebApps_training/Dump Collection|Debug diag tool"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/WebApps_training/Dump%20Collection%7CDebug%20diag%20tool"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Here are the steps to collect 3 consecutive hang dumps when the issue starts to happen:

1.Launch debugdiag (download: [https://www.microsoft.com/en-us/download/details.aspx?id=58210](https://www.microsoft.com/en-us/download/details.aspx?id=58210 "https://www.microsoft.com/en-us/download/details.aspx?id=58210") )
2.Dismiss the pop-up.
3.Go to processes tab and identify your W3WP process instance
4.Wait for issue to reproduce
5.When the hang starts to happen, right click on the w3wp instance and generate Full User dump. Repeat this step 3 times each 1-2 minutes apart. Make sure hang is happening when collecting dumps
