---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Prometheus/Learning Resources/Lab | Collect custom metrics using PodMonitor and ServiceMonitor - Prometheus"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Managed%20Prometheus/Learning%20Resources/Lab%20%7C%20Collect%20custom%20metrics%20using%20PodMonitor%20and%20ServiceMonitor%20-%20Prometheus"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Collect Custom Prometheus Metrics Using PodMonitor and ServiceMonitor CRDs

## Overview

Lab guide for using PodMonitor and ServiceMonitor CRDs to automatically discover and scrape custom Prometheus metrics, as an alternative to manual ConfigMap configuration.

## Prerequisites

- AKS Cluster
- Azure Monitor Workspace (Managed Prometheus)

## When to Use CRDs vs ConfigMap

### ConfigMap Limitations
- Requires creating individual scrape jobs for each metrics endpoint manually
- When applications change services, metrics collection breaks
- Not scalable for environments with dozens of applications

### CRD Advantages (PodMonitor/ServiceMonitor)
- **Automated discovery**: Automatically discovers and scrapes custom Prometheus metrics
- **ServiceMonitor**: Scrapes metrics from Kubernetes Services
- **PodMonitor**: Scrapes metrics directly from pods (when no service exists for metrics)

## Setup Examples

### Redis with Metrics Exporter

```bash
kubectl create namespace redis
helm install redis oci://registry-1.docker.io/bitnamicharts/redis --namespace redis -f redis-values.yaml
```

Redis values config available at: https://raw.githubusercontent.com/braieralves/redis-custom-value/main/redis-values.yaml

### MySQL with Metrics Exporter

```bash
kubectl create namespace mysql
helm install mariadb oci://registry-1.docker.io/bitnamicharts/mariadb -nmysql
```

Then deploy MySQL exporter with config from: https://raw.githubusercontent.com/braieralves/Deploying-MySQL-and-PostgreSQL-on-AKS-cluster/refs/heads/main/mysql-exporter-values.yaml

### Apache Web Server

```bash
kubectl apply -f https://raw.githubusercontent.com/braieralves/Apache-AKS---with-Prometheus-metrics/refs/heads/main/deployment.yaml
```

## Creating CRDs

Reference: [Create custom Prometheus scrape job from Kubernetes cluster using CRDs](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-scrape-crd)

### ServiceMonitor
- Used when a Kubernetes Service exposes the metrics endpoint
- Template: https://github.com/Azure/prometheus-collector/blob/main/otelcollector/deploy/addon-chart/azure-monitor-metrics-addon/templates/ama-metrics-servicemonitor-crd.yaml

### PodMonitor
- Used when scraping metrics directly from pods (no service)
- Template: https://github.com/Azure/prometheus-collector/blob/main/otelcollector/deploy/addon-chart/azure-monitor-metrics-addon/templates/ama-metrics-podmonitor-crd.yaml

## Troubleshooting CRD-Based Scraping

1. Verify the CRD is applied: `kubectl get servicemonitor -A` / `kubectl get podmonitor -A`
2. Check Prometheus interface targets for the discovered endpoints
3. Verify the application service/pod labels match the CRD selector
4. Check ama-metrics pod logs for scrape errors

## Resources

- [Create custom Prometheus scrape job using CRDs](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-scrape-crd)
- [ConfigMap-based scrape configuration](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-scrape-configmap)
- Complement to: [Lab | Collect custom metrics using ConfigMap](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1177870/Lab-Collect-custom-metrics-using-ConfigMap-Prometheus)
