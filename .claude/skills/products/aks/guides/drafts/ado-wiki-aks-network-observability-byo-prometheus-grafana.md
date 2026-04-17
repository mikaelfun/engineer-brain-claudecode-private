---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Monitoring/AKS Network Observability - BYO Prometheus and Grafana example"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FAKS%20Network%20Observability%20-%20BYO%20Prometheus%20and%20Grafana%20example"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS Network Observability - BYO Prometheus and Grafana example

## Summary

AKS Network Observability addon has two options:
- Azure managed Prometheus and Grafana
- **BYO Prometheus and Grafana** (customer-managed, outside support scope, best-effort assistance)

This guide covers setup using kube-prometheus-stack helm chart.

## Prerequisites

- Enable `aks-preview` CLI extension
- Register `NetworkObservabilityPreview` feature flag
- An existing AKS cluster

## Setup Steps

### 1. Enable Network Observability

Follow official docs: https://learn.microsoft.com/en-us/azure/aks/network-observability-byo-cli

### 2. Install kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus \
  prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

Check status:
```bash
kubectl -n monitoring get all
```

### 3. Add Custom Scrape Configs for Kappie Pods

Create `prom-custom-values.yaml`:

```yaml
prometheus:
  prometheusSpec:
    additionalScrapeConfigs:
      - job_name: "network-obs-pods"
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_container_name]
            action: keep
            regex: kappie(.*)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            separator: ":"
            regex: ([^:]+)(?::\d+)?
            target_label: __address__
            replacement: ${1}:${2}
            action: replace
          - source_labels: [__meta_kubernetes_pod_node_name]
            action: replace
            target_label: instance
        metric_relabel_configs:
          - source_labels: [__name__]
            action: keep
            regex: (.*)
```

Upgrade release:
```bash
helm upgrade prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f prom-custom-values.yaml
```

### 4. Verify Prometheus Targets

```bash
kubectl port-forward -n monitoring prometheus-prometheus-kube-prometheus-prometheus-0 9090
```
Open http://localhost:9090 -> Status -> Targets -> verify `network-obs-pods` targets exist for each node.

### 5. Configure Grafana Dashboard

```bash
GRAFANA_POD=$(kubectl -n monitoring get po -l app.kubernetes.io/name=grafana -o=jsonpath='{.items..metadata.name}')
kubectl port-forward -n monitoring $GRAFANA_POD 3000
```

- Default credentials: admin / prom-operator
- Import dashboard JSON from: https://raw.githubusercontent.com/Azure/azure-container-networking/master/cns/doc/examples/metrics/grafana.json
- Go to Home -> Dashboard -> Import
