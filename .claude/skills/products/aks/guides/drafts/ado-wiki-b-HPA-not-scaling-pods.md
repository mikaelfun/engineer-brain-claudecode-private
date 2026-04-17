---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Others/Pod General Investigation/HPA does not scale pods even though resource utilization exceeds threshold"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FPod%20General%20Investigation%2FHPA%20does%20not%20scale%20pods%20even%20though%20resource%20utilization%20exceeds%20threshold"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# HPA does not scale Pods even though resource utilization exceeds threshold

[[_TOC_]]

## Summary

This TSG addresses the issue where the Horizontal Pod Autoscaler (HPA) fails to scale the number of pods even when the average CPU utilization exceeds the defined threshold.
Understanding the HPA's scaling behavior and configuration is essential to resolving this issue effectively.

## Reported and observed symptoms

### Symptoms

- Customer configured HPA for their application Pods. The HPA scales Pods based on the average CPU utilization of Pods.
- The HPA does not update the number of Pod replicas despite Pod CPU usage exceeding the `averageUtilization` threshold.

### Environment Details

- **Example HPA Configuration**:
  - `minReplicas`: 6
  - `maxReplicas`: 70
  - `metrics.resource.target.averageUtilization` (cpu): 30

No scaling events were triggered even Pod CPU usage exceeding over the `averageUtilization` of 30.

## Cause

Here are several possible reasons why HPA doesn't scale Pods:

1. HPA misconfigurations
    - HPA incorporates stabilization windows and scaling policies to prevent rapid fluctuations in pod counts, which can lead to instability.
2. Insufficient cluster resources
    - Factors such as insufficient cluster resources or misconfigurations can hinder the HPA from scaling Pods effectively.
3. By design of HPA
    - If the value of `averageUtilization` is slightly fluctuating around the threshold value and HPA doesn't scale Pods, the observed result may be the expected behavior by design of HPA.
    - Refer to the [HPA Algorithm Details](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#algorithm-details) for an in-depth understanding of how HPA determines scaling actions.
4. Metrics API is unavailable
    - HPA gets resource usage metrics from Metrics API. If the API temporary unavailable, scaling will not be worked.

### Troubleshooting

#### HPA status

You can see HPA status using Kusto query. Logs are part of `kube-audit` log.
You need to specify `PreciseTimeStamp`, `ccpNamespace`, `RequestURI`, and optionally `averageUtilization`.

```kusto
let ccp_namespace = "<CCP Namespace>";
let hpa_resource_name = "<HPA Resource Name>";
let average_utilization = 30;
union cluster("akshuba.centralus.kusto.windows.net").database("AKSccplogs").ControlPlaneEvents, cluster("akshuba.centralus.kusto.windows.net").database("AKSccplogs").ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between(datetime(2025-02-28T00:00:00) .. datetime(2025-03-02T00:00:00))
| where ccpNamespace == ccp_namespace
| where category == 'kube-audit'
| extend event=parse_json(tostring(parse_json(properties).log))
| where event.stage == "ResponseComplete"
| where event.objectRef.subresource !in ("proxy", "exec")
| extend verb=tostring(event.verb)
| extend subresource=tostring(event.objectRef.subresource)
| extend Pod = extractjson('$.pod', properties, typeof(string))
| extend Log = extractjson('$.log', properties, typeof(string))
| extend Method = parse_json(tostring((parse_json(properties).log))).verb
| extend RequestURI = tostring(parse_json(tostring((parse_json(properties).log))).requestURI)
| extend User = tostring(parse_json(tostring((parse_json(properties).log))).user.username)
| extend UserAgent = parse_json(tostring((parse_json(properties).log))).userAgent
| extend ResponseStatus = parse_json(tostring((parse_json(properties).log))).responseStatus.code
| where Method !in ("get", "list", "watch")
| where RequestURI contains hpa_resource_name
| summarize take_any(*) by PreciseTimeStamp, RequestURI
| extend currentReplicas = parse_json(Log).requestObject.status.currentReplicas
| extend desiredReplicas = parse_json(Log).requestObject.status.desiredReplicas
| extend conditions = parse_json(Log).requestObject.status.conditions
| extend averageValue = parse_json(Log).requestObject.status.currentMetrics[0].resource.current.averageValue
| extend averageUtilization = parse_json(Log).requestObject.status.currentMetrics[0].resource.current.averageUtilization
| where averageUtilization >= average_utilization
| project PreciseTimeStamp, Method, RequestURI, currentReplicas, desiredReplicas, averageValue, averageUtilization, conditions[0].message
| sort by PreciseTimeStamp asc
```

When Pods are not scaled due to the design of HPA, query results show `currentReplicas == desiredReplicas` with message "recommended size matches current size" while `averageUtilization` fluctuates around the threshold.

HPA controller operates on the ratio between desired metric value and current metric value.
HPA controller skips any scaling action if the ratio is sufficiently close to 1.0 (within a globally-configurable tolerance, 0.1 by default).

For example, if the current metric value is `159m` and the desired metric value is `150m`, we get the following ratio `159 / 150 = 1.06`.
Which differs from 1.0 by 0.06 and so is smaller than the default tolerance of 0.1, hence HPA will not scale up.

#### HPA controller logs

Logs are part of `kube-controller-manager` log.

```kusto
let ccp_namespace = "<CCP Namespace>";
union cluster("akshuba.centralus.kusto.windows.net").database("AKSccplogs").ControlPlaneEvents, cluster("akshuba.centralus.kusto.windows.net").database("AKSccplogs").ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between(datetime(2025-02-28T00:00:00) .. datetime(2025-03-02T00:00:00))
| where ccpNamespace == ccp_namespace
| where category == 'kube-controller-manager'
| extend Log = extractjson('$.log', properties, typeof(string))
| where Log contains "horizontal.go"
| project PreciseTimeStamp, Log
```

If logs show "failed to get cpu resource metric value" or "unable to fetch metrics from resource metrics API" -> Metrics API issue, possibly due to control plane maintenance or tunnel connectivity issue.

## Mitigation Steps

1. **Verify HPA Configuration**: Ensure minReplicas, maxReplicas, and targetCPUUtilizationPercentage are set appropriately. Adjust stabilization window settings.
2. **Check Cluster Resource Availability**: Confirm sufficient CPU/memory. See TSGs for Pending Pods.
3. **Monitor HPA Activity**: Use InsightsMetrics table with `Name == 'kube_hpa_status_current_replicas'`.
4. **Consult Documentation**: Review HPA Algorithm Details.
5. **Scale Manually if Necessary**: As interim solution for Sev A cases.

## References

- [HPA Algorithm Details](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#algorithm-details)
- [HPA Stabilization Window](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#stabilization-window)
- [InsightsMetrics table](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/insightsmetrics)
