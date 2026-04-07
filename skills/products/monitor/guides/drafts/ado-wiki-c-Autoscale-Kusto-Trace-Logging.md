---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Autoscale/How-To/How to analyze Autoscale job trace logging in Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Autoscale/How-To/How%20to%20analyze%20Autoscale%20job%20trace%20logging%20in%20Kusto"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

# Before You Begin
---
In order to query for Activity Log events for a given Azure subscription, you will need to ensure you have installed Kusto Explorer and added a connection for the **Azureinsights** Kusto cluster.

For details on adding Kusto clusters, see article [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer).

# Querying For Activity Log Events
---
1. Open Kusto Explorer, select **Home** ribbon and click **New tab**.

   ![image.png](/.attachments/image-5f66b528-26ee-4ec5-95b5-46c8a6f721dd.png)

1. Expand the connection you created to the **Azureinsights** cluster and select the **Insights** database.

   ![image.png](/.attachments/image-ec3f3f84-2400-4fed-9914-3831f15c454f.png)

1. Copy and paste the following Kusto query into the query window and replace ACTIVITYIDGOESHERE with the desired autoscale event ActivityId, then click **Run (F5)**.

   [[Open in Kusto Explorer](https://azureinsights.kusto.windows.net/Insights?query=H4sIAAAAAAAEAGXLQQrCMBAF0H1PMXSdG4iLokEjomKD4HIaPxppTEiGSkE8uxWXrh%2bvhxA7MReaU90srDkZezbL1V63a33U9azaxM5mdijVi543ZFDjxA9exm96%2f%2fZkJWahbqRDhvMF1ge0wiERFzdxyvEOJ3%2bsaIsBvaKYkFl8fOw4QFFAKXxF9QF8WXD4oQAAAA%3d%3d&web=0)] [[Open in Azure Data Explorer](https://azureinsights.kusto.windows.net/Insights?query=H4sIAAAAAAAEAGXLQQrCMBAF0H1PMXSdG4iLokEjomKD4HIaPxppTEiGSkE8uxWXrh%2bvhxA7MReaU90srDkZezbL1V63a33U9azaxM5mdijVi543ZFDjxA9exm96%2f%2fZkJWahbqRDhvMF1ge0wiERFzdxyvEOJ3%2bsaIsBvaKYkFl8fOw4QFFAKXxF9QF8WXD4oQAAAA%3d%3d&web=1)]
   ```
   let actId = "ACTIVITYIDGOESHERE";
   JobTraces
   | where ActivityId =~ actId
   | sort by PreciseTimeStamp asc
   | project PreciseTimeStamp, Level, operationName, message
   ```

# Example
---
**Autoscale event ActivityId:** 441c1431-1fca-4e1a-ab8e-c4c7704275ab

```
let actId = "441c1431-1fca-4e1a-ab8e-c4c7704275ab";
JobTraces
| where ActivityId =~ actId
| sort by PreciseTimeStamp asc
| project PreciseTimeStamp, Level, operationName, message
```

![image.png](/.attachments/image-ce96482a-96f9-4004-9fcc-d00891a97623.png)
