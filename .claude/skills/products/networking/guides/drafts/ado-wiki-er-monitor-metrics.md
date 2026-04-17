---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/ExpressRoute Monitor"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Monitor"
importDate: "2026-04-17"
type: troubleshooting-guide
---

[[_TOC_]]

## ExpressRoute Metrics

To view Metrics, navigate to the Azure Monitor page and select Metrics. To view ExpressRoute metrics, filter by Resource Type ExpressRoute circuits. To view Global Reach metrics, filter by Resource Type ExpressRoute circuits and select an ExpressRoute circuit resource that has Global Reach enabled. To view ExpressRoute Direct metrics, filter Resource Type by ExpressRoute Ports.

Once a metric is selected, the default aggregation will be applied. Optionally, you can apply splitting, which will show the metric with different dimensions.

### Aggregation Types:

Metrics explorer supports SUM, MAX, MIN, AVG and COUNT as aggregation types. You should use the recommended Aggregation type when reviewing the insights for each ExpressRoute metrics.

- Sum: The sum of all values captured during the aggregation interval.
- Count: The number of measurements captured during the aggregation interval.
- Average: The average of the metric values captured during the aggregation interval.
- Min: The smallest value captured during the aggregation interval.
- Max: The largest value captured during the aggregation interval.

### Available Metrics
To see a list of available metrics, please navigate to the public documentation located here:  [Available Metrics](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-monitoring-metrics-alerts#available-metrics).

## Case Handling

ANP involvement should be limited to validating portal reporting accuracy.

## How it works

Data comes from a customer SNMP poller to MDM. The data will essentially be the same as what we have in Kusto.

## How To Validate Portal Results with ASC

1. Go to the ExpressRoute resource in ASC and select Azure Monitor Metrics. 

    ![Button in Azure Monitor Metrics](/.attachments/image-cefd37f3-194e-4cce-a49e-8bc035118818.png)

      Select "Click to Populate or Refresh the Metric or Namespace List"

2. From the Metric Name field, select the metric which customer is experiencing issues with:

   ![Metric ID List](/.attachments/image-c4de61c9-ad16-4399-bfc5-65164faf7d0b.png)
   - Metric Name Options:
      - ARP Availability
      - BGP Availability
      - BitsInPerSecond
      - BitsOutPerSecond
      - DroppedInBitsPerSecond
      - DroppedOutBitsPerSecond
      - GlobalReachBitsInPerSecond
      - GlobalReachBitsOutPerSecond

3. As an example, I am going to review the BitsInPerSecond. Next, select the time frame from when the customer reported seeing issues:

   ![Query Metric Data of BitsOutPerSecond option](/.attachments/image-f886baf6-a0c4-4161-85f6-0daee74429dc.png)

    Now select "Click to view metric data or apply additional filter"

4. You will see data start to populate:

   ![Data information and Metric Chart of Partial Data Received](/.attachments/image-279bdafe-9fc2-460d-a5bf-882286c4e135.png)

    These metrics should align with the portal metrics customer is seeing.

## Limitations

## Known Issues

#20718

There is a <span style="color: indianred"> known issue with our SNMP Poller </span>that it may sporadically timeout and stop functioning. An error is thrown for function `ExpressRouteDevicePollerChildWorkItemForMetrics` for the specific MSEE device and surfaced on the `ExpressRouteMonitoringLogsTable` as:

```
Message: ExpressRouteSnmpPollerChildWorkItemForMetrics has faulted with Exception. 
 Source: Microsoft.Azure.Networking.ExpressRoute.Monitoring 
 Type: System.Exception

 Exception Details: System.Exception: Failed to get the essential devices information to start polling.
   at Microsoft.Azure.Networking.ExpressRoute.Monitoring.ExpressRouteDeviceFastPoller.Init(DateTime& nextCycleTime) in X:\bt\1186472\repo\src\ExpressRoute\Monitoring\ExpressRouteMonitoring\Pollers\ExpressRouteDeviceFastPoller.cs:line 51
   at Microsoft.Azure.Networking.ExpressRoute.Monitoring.ExpressRouteDevicePollerBase.MonitorDevices() in X:\bt\1186472\repo\src\ExpressRoute\Monitoring\ExpressRouteMonitoring\Pollers\ExpressRouteDevicePollerBase.cs:line 283
   at Microsoft.CloudNet.GatewayManager.AsyncWorkItems.ExpressRouteDeviceFastPollerChildWorkItem.Run(AsyncOperationContext operationContext) in X:\bt\1186472\repo\src\gateway\GatewayManager\AsyncWorkItems\ExpressRouteDeviceFastPollerChildWorkItem.cs:line 86
```

This will correlate to the missing data from the metrics dashboard. The root cause is that during those missing data cycles, SNMP Poller cannot push metrics due to SNMP connection exception in creating connection to the device. The same root cause can be shared with the customer.

Links to the `ExpressRouteMonitoringLogsTable` logs: [[Jarvis Logs]](https://portal.microsoftgeneva.com/s/3F005593), [[Kusto] ](https://dataexplorer.azure.com/clusters/hybridnetworking/databases/aznwmds?query=H4sIAAAAAAAAA33QTUvDQBAG4Lu/YsmlCaQS/LjZkxooGC224FEmmzFZ3S9mJ6aR/nhThbSlpbdhmXl495W6DYwUT5q+JFVZ5M7Rl7L1JLmsgKGEgPEEfmxnqjC8Pa49YQivrmUsnFXsaFh+cnVYQanxYiO6BgnFglCqgCtlcMlgvLgTULv4OjPJuPPikYCVs89gUMxmItrXH/BbScwh8MJpjXTfKF29DeHmjCYakby1cjQaCKeQE0DuqEAmJcOOKoYrqP+Ud7C9iCNcS/RbPUoP3aU1/rw6HCCRo+3wAa3m/0HpKDmTHczVNLupDU2H9qbbaJ7cJ0o+KjTd1Tev0gMqHX+yEey8uM1E2R8Bvxcm6vj6AQAA)

```
Execute in [Web] [Desktop][cluster('hybridnetworking.kusto.windows.net').database('aznwmds')]

cluster('hybridnetworking').database('aznwmds').ExpressRouteMonitoringLogsTable
| where PreciseTimeStamp between (datetime("2022-04-19 18:00:00") ..  datetime("2022-04-19 19:00:00"))
| where OperationName == "ExpressRouteDeviceFastPollerChildWorkItem"
| where FunctionName has "ExpressRouteDevicePollerChildWorkItemForMetrics"
| where Message has_any ("exception", "ExpressRouteSnmpPollerChildWorkItemForMetrics", "error", "fault", "fail")
| where FunctionName has "bl31-09xgmr-cis"
| project PreciseTimeStamp, OperationId, FunctionName, Message | top 50 by PreciseTimeStamp
```
Links to the referenced ICM and Bug: [[ICM-180429571]](https://portal.microsofticm.com/imp/v3/incidents/details/180429571/home) [[ICM-310000897]](https://portal.microsofticm.com/imp/v3/incidents/details/310000897/home) [[Bug 6580254]](https://msazure.visualstudio.com/One/_workitems/edit/6580254)

## Public Documentation

- [ExpressRoute monitoring, metrics, and alerts](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-monitoring-metrics-alerts)
- [ExpressRoute Documentation](https://docs.microsoft.com/en-us/azure/expressroute/)

## Contributors
@<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78> 
