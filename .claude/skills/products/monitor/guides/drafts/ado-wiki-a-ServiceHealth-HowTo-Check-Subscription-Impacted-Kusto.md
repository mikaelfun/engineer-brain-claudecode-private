---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Service Health/How-To/How to check if a subscription is impacted by a Service Health event in Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FService%20Health%2FHow-To%2FHow%20to%20check%20if%20a%20subscription%20is%20impacted%20by%20a%20Service%20Health%20event%20in%20Kusto"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Before You Begin
---
In order to query for diagnostic settings telemetry, you will need to ensure you have installed Kusto Explorer and added a connection for the **Icmcluster** Kusto cluster.

For details on adding Kusto clusters, see article [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer).

# Querying for Subscription Inclusion
---
1. Identify the Service Health tracking Id that you want to check (for example "8N_M-V98").
1. Open Kusto Explorer, select **Home** ribbon and click **New tab**.

   ![image.png](/.attachments/image-5f66b528-26ee-4ec5-95b5-46c8a6f721dd.png)

1. Expand the connection you created to the **Icmcluster** cluster and select the **ACM.Publisher** database.

   ![image.png](/.attachments/image-0d52c173-9e58-46c8-9736-6e4eaafb724e.png)

1. Copy and paste the following Kusto query into the query window and replace SUBSCRIPTIONIDGOESHERE with the Azure subscription and TRACKINGIDGOESHERE with the Service Health tracking Id that you want to check, then click **Run (F5)**.

   [[Open in Kusto Explorer](https://icmcluster.kusto.windows.net/ACM.Publisher?query=H4sIAAAAAAAEAMtJLVEoLk3yTFGwVVAKDnUKdg7yDAjx9PfzdHH3dw32cA1yVbLm5coBKispSkzOzsxLh6gNCXJ09vb0c0dV555aEgwyrdipMgSuXAOhU5OXq0YhJbO4JDMvuUQBqLQ4uSizoCQzPw8kUZ6RWpSKIqpgWwdxHgCmJxgZqAAAAA%3d%3d&web=0)] [[Open in Azure Data Explorer](https://icmcluster.kusto.windows.net/ACM.Publisher?query=H4sIAAAAAAAEAMtJLVEoLk3yTFGwVVAKDnUKdg7yDAjx9PfzdHH3dw32cA1yVbLm5coBKispSkzOzsxLh6gNCXJ09vb0c0dV555aEgwyrdipMgSuXAOhU5OXq0YhJbO4JDMvuUQBqLQ4uSizoCQzPw8kUZ6RWpSKIqpgWwdxHgCmJxgZqAAAAA%3d%3d&web=1)]

   ```
   let subId = "SUBSCRIPTIONIDGOESHERE";
   let trackingId = "TRACKINGIDGOESHERE";
   GetSubIdsByTrackingId(trackingId)
   | distinct Subscription
   | where Subscription =~ subId
   ```

If the subscription is included in the event, the subscription Id will be returned by the query.

**Example:**

```
let subId = "00000000-0000-0000-0000-000000000000";
let trackingId = "8N_M-V98";
GetSubIdsByTrackingId(trackingId)
| distinct Subscription
| where Subscription =~ subId
```

![image.png](/.attachments/image-baa5a52e-5297-4f5b-bd0e-2140514533d0.png)
