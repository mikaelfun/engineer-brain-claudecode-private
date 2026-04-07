---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Azure Resource Manager (ARM)/How to identify ICM service and team for issues registering an Azure resource provider"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAzure%20Monitor%2FHow-To%2FAzure%20Resource%20Manager%20(ARM)%2FHow%20to%20identify%20ICM%20service%20and%20team%20for%20issues%20registering%20an%20Azure%20resource%20provider"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to identify ICM service and team for issues registering an Azure resource provider

> Note: There may be a 15-30 minute delay for trace logging data to appear in Kusto.

## Before You Begin

You will need Kusto Explorer with a connection for the **Armprod** Kusto cluster (or appropriate cluster for the cloud). See [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer).

## Instructions

1. Open Kusto Explorer or Azure Data Explorer connecting to the **armprod** database of the **Armprod** cluster

2. Run the following query (replace subscription ID and time window):

   ```kusto
   let subId = "AZURESUBSCRIPTIONIDGOESHERE";
   let startTime = ago(1d);
   let endTime = now();
   cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer('Requests', 'HttpOutgoingRequests')
   | where PreciseTimeStamp between (startTime .. endTime)
   | where subscriptionId =~ subId
   | where operationName =~ "PUT/SUBSCRIPTIONS/"
   | where TaskName contains "End"
   | where httpStatusCode != 200
   | extend endpointUriWithPort = tostring(split(targetUri, '/subscriptions')[0])
   | extend endpointUri = replace_string(endpointUriWithPort, ':443', '')
   | project PreciseTimeStamp, TaskName, ActivityId, correlationId, httpStatusCode, endpointUri, targetUri, $cluster
   | order by PreciseTimeStamp desc
   ```

   > If you have the correlation id, add: `| where correlationId =~ "CORRELATIONIDGOESHERE"`

3. Review results to find the failure record and copy **targetResourceProvider** and **endpointUri** values

4. Navigate to https://armmanifest.visualstudio.com/One/_git/Manifest

5. Scroll to the folder matching **targetResourceProvider**, then click into the appropriate cloud sub-folder (usually PROD)

6. Click on **MANIFEST.JSON**

7. Search (CTRL+F) for the **endpointUri** value

8. Scroll down to the first **management** property — this will contain the ICM service and team details that own the failing endpoint

## Escalating to Product Group

To escalate based on these results:
1. Follow normal steps in [How to open a CRI (ICM) in Azure Support Center](/Azure-Monitor/How%2DTo/ICM/How-to-open-a-CRI-\(ICM\)-in-Azure-Support-Center)
2. Instead of selecting a recommended escalation template, select **All**
3. Search for **resource provider registration** → find template **Azure Monitor | Resource Provider Registration**

If ASC is not available, see [How to open a CRI when ASC is down](/Azure-Monitor/How%2DTo/ICM/How-to-open-a-CRI-\(ICM\)-when-Azure-Support-Center-is-down).
