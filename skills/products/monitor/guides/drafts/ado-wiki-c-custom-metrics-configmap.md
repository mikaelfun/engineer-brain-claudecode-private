---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Prometheus/Learning Resources/Lab | Collect custom metrics using ConfigMap - Prometheus"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Managed%20Prometheus/Learning%20Resources/Lab%20%7C%20Collect%20custom%20metrics%20using%20ConfigMap%20-%20Prometheus"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Collect Custom Prometheus Metrics Using ConfigMap

## Overview

Lab guide for collecting custom Prometheus metrics from applications on AKS using ConfigMap scrape configuration.

## Prerequisites

- AKS Cluster
- Azure Monitor Workspace (Managed Prometheus)
- Azure Managed Grafana

## How Prometheus Works

- Prometheus collects data as time series via a pull (scrape) model
- Metrics have names used for referencing and querying
- Data stored locally on disk for fast storage/querying
- Each server is standalone

## Default vs Custom Metrics

### Default Metrics

Managed Prometheus deploys with a pack of default metrics (scrape frequency: 30 seconds). See [Default Prometheus metrics configuration](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-scrape-default).

When an AKS cluster is configured for Managed Prometheus, default metrics (cluster resource info: nodes, pods, volumes) are collected by `ama-metrics-xxx` pods automatically.

### Custom Metrics

Applications running on AKS may expose custom Prometheus metrics. Custom scrape configuration is done via [ConfigMaps](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-scrape-configuration#configmaps).

## Setting Up Custom Metrics Collection

### 1. Verify Application Exposes Metrics

The application must provide a Prometheus metrics endpoint (e.g., Redis exporter on port 9121).

**Important**: We cannot create settings for applications running on clusters. Customers must ensure their applications expose metrics endpoints.

### 2. Identify the Target

From Prometheus interface, identify the metrics endpoint in format: `service-name.namespace.svc.cluster.local:port`

### 3. Create ConfigMap

Use [ama-metrics-prometheus-config.yaml](https://github.com/Azure/prometheus-collector/blob/main/otelcollector/configmaps/ama-metrics-prometheus-config-configmap.yaml) to create scrape jobs targeting the metrics endpoints.

Format for targets matches the Endpoint shown in Prometheus interface.

### 4. Apply ConfigMap

```bash
kubectl apply -f ama-metrics-prometheus-config.yaml
```

### 5. Validate in Prometheus Explorer / Grafana

Check Azure Monitor Workspace > Prometheus Explorer or Managed Grafana dashboards for the custom metrics.

## Analyzing Prometheus Environment on AKS

Access [Managed Prometheus interface](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-troubleshoot#prometheus-interface) to view scrape targets.

Default service `ama-metrics-ksm` is created automatically when Prometheus monitoring is enabled.

## Resources

- [Custom configuration for Prometheus metrics](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-scrape-validate)
- [Default Prometheus metrics configuration](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-scrape-default)
- [Prometheus metrics scrape configuration](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-scrape-configuration#configmaps)
