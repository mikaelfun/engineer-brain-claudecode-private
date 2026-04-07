---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/CRUD/Upgrade and Update/OverlaymgrReconcileError caused by noisy neighbouring"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FOverlaymgrReconcileError%20caused%20by%20noisy%20neighbouring"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# OverlaymgrReconcileError during AKS PUT operations caused by noisy neighbouring

[[_TOC_]]

## Issue Summary

This TSG describes how to troubleshoot the OverlaymgrReconcileError when it's caused by "noisy neighboring".

## Error

When doing an operation (update/upgrade/etc...) against an AKS cluster, user receives an error like below. This one should also be visible in AKS QoS or ContextActivity logs.

`
ReconcileOverlay failed. error: Category: InternalError; Code: OverlaymgrReconcileError; SubCode: OverlayMgrAPIRequestFailed; Message: Internal server error; InnerMessage: ; Dependency: ; AKSTeam: ; OriginalError: context deadline exceeded
`

## Investigation

The first step consists in checking the AKS ContextActivity logs for the given operations. You can use ASI or Kusto for that. Sample query:

```text
union cluster("Aks").database("AKSprod").FrontEndContextActivity , cluster("Aks").database("AKSprod").AsyncContextActivity //| summarize min(PreciseTimeStamp)
| where PreciseTimeStamp >= datetime(2024-10-23 13:01:00) and PreciseTimeStamp <= datetime(2024-11-30 21:20:59)
| project PreciseTimeStamp, operationID, level, msg,  traceId, SourceNamespace, fileName, lineNumber,correlationID, PanicFileName, PanicFunctionName, PanicLineNumber, PanicStackHash, source, SourceVersion,subscriptionID, resourceName, serviceBuild
| where operationID =="0849370b-d8d5-4f6f-b4a0-15c591f4fa00" or operationID=="dd4bf9ee-713e-40a5-a631-b812a66e53be" 
// | where level <> 'info'
```

Then you can have a look at the OverlayMgrEvents table and see if there are "failed to annotateReleaseInfo" errors:

```text
union cluster("Aks").database("AKSprod").OverlaymgrEvents
| where PreciseTimeStamp >= datetime(2024-11-21 13:01:00) and PreciseTimeStamp <= datetime(2024-11-23 21:20:59)
| project PreciseTimeStamp, operationID, level, msg,   SourceNamespace, fileName, lineNumber,correlationID, PanicFileName, PanicFunctionName, PanicLineNumber, PanicStackHash, source, SourceVersion,subscriptionID, resourceName, serviceBuild//
| where operationID =="0849370b-d8d5-4f6f-b4a0-15c591f4fa00" or operationID=="dd4bf9ee-713e-40a5-a631-b812a66e53be" or operationID =="450e27e4-6ebc-4a75-b70b-67f4977f49a1" or operationID =="a39cc950-429b-4e39-9548-325a868027f5"
//| where level <> 'info'
| where msg contains "failed to annotateReleaseInfo"
```

![Failed to annotateReleaseInfo in the OverlaymgrEvents table](/.attachments/OverlaymgrReconcileError_1.jpg)

And we can also verify how many times the given cluster faced that OverlaymgrReconcileError. Note that there are internal retries, so it's expected to see multiple errors for a given operation.

```text
let oids=
database("AKSprod").OverlaymgrApiQos
| where PreciseTimeStamp between (datetime("2024-11-21") .. datetime("2024-11-24"))
| where ccpID contains "636371fcd8a22f000170860e"
| where UnderlayName == "hcp-underlay-centralus-cx-264"
| project PreciseTimeStamp, operationID, requestID, resultType, operationName, ccpID
| distinct operationID;
database("AKSprod").AsyncQoSEvents
| where PreciseTimeStamp between (datetime("2024-11-21") .. datetime("2024-11-24"))
| where operationID in (oids)
| project PreciseTimeStamp, subscriptionID, resourceGroupName, resourceName, operationName, suboperationName, resultType, resultCode, errorDetails
```

From here, we can have a look at the CPU usage for the "overlaymanager" pods. Below is a CPU consumption of ~60% which is considered high.

```text
cluster('akshubb.westus3.kusto.windows.net').database('AKSinfra').ProcessInfo
| where PreciseTimeStamp between (datetime("2024-11-20T22:01:35.0575495Z") .. datetime("2024-11-24T13:01:35.0575495Z"))
| where UnderlayName == "hcp-underlay-centralus-cx-264"
| where PodName startswith "overlaymgr-overlaymanager-"
| where PodContainerName == "overlaymanager"
| summarize max(CPUUtil) by bin(PreciseTimeStamp, 1h)
| render timechart
```

![CPU consumption for OverlayManager pods](/.attachments/OverlaymgrReconcileError_2.jpg)

So... what's consuming all that CPU? Then we can have a look at what the OverlayManager is doing. The query below shows similar "ReconcileOverlayError" in the CentralUS region - and the count of operations for each CCP (one CCP = one AKS cluster). Notice that we're also displaying in which Underlay they are.

```text
cluster("Aks").database("AKSprod").OverlaymgrApiQos
| where PreciseTimeStamp between (datetime("2024-11-21") .. datetime("2024-11-24"))
| where RPTenant == "centralus"
| where operationName == "ReconcileOverlayHandler.POST"
| where resultCode contains "ReconcileOverlayError"
| project PreciseTimeStamp,operationID, operationName, resultType, resultCode, resultSubCode, errorDetails, ccpID, cxUnderlayName, UnderlayName, Underlay
| summarize count() by ccpID, UnderlayName
```

![number of errors per CCP and per underlay](/.attachments/OverlaymgrReconcileError_3.jpg)

So in the results above, we can see that our CCP "636371fcd8a22f000170860e" faced 22 errors. It's in Underlay "hcp-underlay-centralus-cx-264".

Note that in the same underlay, there's another AKS cluster (CCP 673efef7f16b930001e9c9f8) which faced ~63764 errors during the same timeframe. This other AKS cluster is certainly hammering the underlay host nodes and their OverlayManager pods...

From Now, the best is to have a look at Azure Service Insights (ASI) and search for this other CCPNamespace. You'll certainly find that it belongs to another Subscription / another customer, and you can search for what this other cluster is doing, with eg. a query like below:

```text
let querySubscriptionId = "25b174eb-e281-4183-8906-89037a996460";
let queryResourceGroupName = "apm1010973-slvr-dlxz-01-rg";
let queryResourceName = "aks-pilot-spoke";
let queryFrom = datetime("2024-11-22 00:00:00");
let queryTo = datetime("2024-11-22 01:59:59");
cluster("Aks").database("AKSprod").FrontEndQoSEvents
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where subscriptionID == querySubscriptionId
| where resourceGroupName == queryResourceGroupName
| where resourceName == queryResourceName
| where operationName !has "GET"
| where httpMethod !has "GET"
| project logPreciseTime, operationName, suboperationName, resultCode, errorDetails, httpStatus, httpMethod, resourceName, agentPoolName, correlationID, operationID, clientApplicationID, userAgent, clientPrincipalName, latency, region, propertiesBag, log, resourceGroupName, targetURI, subscriptionID
| extend p = todynamic(propertiesBag)
| extend K8sGoalVersion = tostring(p.k8sGoalVersion)
| order by logPreciseTime asc
```

![operations from the other CCP Namespace - likely DiagnosticsSettings](/.attachments/OverlaymgrReconcileError_4.jpg)

So we can confirm that this other AKS cluster is triggering A LOT of "LinkedNotificationHandler.POST"  (+2600 in 2 hours) and this is overloading the OverlayManager pods and our underlay "hcp-underlay-centralus-cx-264".

## Mitigation Steps

In the few CRIs we've seen, it's been confirmed that there was one other customer creating AKS clusters with incorrect Diagnostics Settings causing all these "LinkedNotificationHandler.POST" operations.

Our AKS PG decided to get in touch with this specific customer to better understand what they were doing, and that customer deleted the offending clusters. After an operation on your customer's cluster (eg. Reconcile), this should be immediately mitigated.

Another mitigation could be to migrate your customer's cluster to a different underlay - so that it's not impacted anymore. This require an approval from customer as it will cause a minor downtime given all CCP pods will be restarted. And it will require an IcM to AKS PG.

## References

Sample CRIs: [570099514](https://portal.microsofticm.com/imp/v5/incidents/details/570099514/summary) / [572815754](https://portal.microsofticm.com/imp/v5/incidents/details/572815754/summary) / [561899777](https://portal.microsofticm.com/imp/v5/incidents/details/561899777/summary) / [566423883](https://portal.microsofticm.com/imp/v5/incidents/details/566423883/summary)

Also the [Emerging Issue 85749: #emergingissue #aks OverlaymgrReconcileError / ReconcileOverlayError in EastUS](https://supportability.visualstudio.com/AzureContainers/_workitems/edit/85749)

Generic guidance on troubleshooting the OverlaymgrReconcileError error - [AKS CRUD operation failing with OverlaymgrReconcileError](/Azure-Kubernetes-Service-Wiki/AKS/TSG/CRUD/AKS-CRUD-operation-failing-with-OverlaymgrReconcileError.md)

## Owner and Contributors

**Owner:** Rory Lenertz <rorylen@microsoft.com>

**Contributors:**

- Joao Tavares <Joao.Tavares@microsoft.com>
- Axel Guerrier <Axel.Guerrier@microsoft.com>
