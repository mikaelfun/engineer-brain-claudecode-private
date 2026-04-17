---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/How-To/How to add custom Windows Perf Counter to DCR"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FHow-To%2FHow%20to%20add%20custom%20Windows%20Perf%20Counter%20to%20DCR"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Add Custom Windows Perf Counter to DCR

## Scenario
Customer wants to add a non-standard Windows performance counter to a DCR for performance data collection.

## Steps

### 1. Find the performance counter format string
Use **Perfmon.msc** on a Windows Server that has the counter installed:

1. Open Perfmon on a server with the required role/feature installed (e.g., IIS)
2. Navigate to **Data Collector Sets > User Defined**
3. Right click **User Defined** > **New > Data Collector Set**
4. Choose **Create manually (Advanced)** > click **Next**
5. Choose **Create data logs** > check **Performance counter** > click **Next**
6. Click **Add...**
7. Locate the counter, choose the instance(s), click **Add** then **OK**
8. Note the format string of the counter (e.g., `\HTTP Service Request Queues(*)\*`)

### 2. Add the counter to the DCR
In the DCR configuration, use the **Custom** option to add the counter:

1. Type the counter string (e.g., `\HTTP Service Request Queues(*)\*`)
2. Click **Add**
3. Check the checkbox next to the counter
4. Click **Save**

### 3. Validate
After saving, browse away from the DCR and then back into the perf data source to confirm the counter appears. You can also check the JSON of the DCR (you may need to update the API version to the latest to see it).
