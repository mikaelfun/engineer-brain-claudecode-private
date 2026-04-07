---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Monitoring/Monitoring API Server performance"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FMonitoring%20API%20Server%20performance"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Monitoring API Server Performance

## Background

Customer may experience apiserver performance issues when applying Kubernetes applications. Troubleshooting involves reviewing master component performance metrics.

| Visibility        | Method            |
| ----------------- | ----------------: |
| etcd object count | apiserver metrics |
| request volume    | audit log         |
| request latency   | audit log         |

## Monitoring via Apiserver Metrics

Kube-apiserver provides Prometheus-format metrics via `/metrics` endpoint. View all metrics with:
```bash
kubectl get --raw /metrics
```

> Note: Metrics are per-apiserver. Due to HA, requests hit different apiservers, limiting usefulness to etcd metrics.

### Prerequisites

Enable Azure Monitoring for AKS and configure Prometheus scraping via ConfigMap:

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: container-azm-ms-agentconfig
  namespace: kube-system
data:
  schema-version: v1
  config-version: ver1
  prometheus-data-collection-settings: |-
    [prometheus_data_collection_settings.cluster]
        interval = "5m"
        fieldpass = ["etcd_object_counts"]
        urls = ["https://kubernetes.default:443/metrics"]
```

### Etcd Object Counts Query

```kql
InsightsMetrics
| where Name == 'etcd_object_counts'
| extend labels = parse_json(Tags)
| project TimeGenerated, Val, tostring(labels.resource)
| render timechart
```

## Monitoring via Audit Logs

### Prerequisites

Enable `kube-audit` in master component logs. Note: `kube-audit-admin` excludes read-only API calls (get/list).

### Base Query

```kql
let ResourceId = '<AKS-resource-ID>';
AzureDiagnostics
| where ResourceId has ResourceId
| where Category contains 'kube-audit'
| extend event = parse_json(log_s)
| where event.stage == "ResponseComplete"
| extend responseCode = toint(event.responseStatus.code)
| where responseCode between (200 .. 299)
| extend verb = tostring(event.verb),
         requestURI = tostring(event.requestURI),
         user = tostring(event.user.username),
         userAgent = tostring(event.userAgent),
         latency = datetime_diff('Millisecond', todatetime(event.stageTimestamp), todatetime(event.requestReceivedTimestamp))
| project TimeGenerated, verb, requestURI, responseCode, user, userAgent, latency
```

### Request Volume
```kql
// Append to base query
| summarize count() by verb, bin(TimeGenerated, 1m)
| render timechart
```

### Request Volume by User
```kql
// Append to base query
| summarize count() by user, userAgent, verb
| order by count_ desc
| take 10
```

### Request Latency
```kql
// Append to base query
| summarize percentiles(latency, 99, 90, 50) by tostring(verb)
```
