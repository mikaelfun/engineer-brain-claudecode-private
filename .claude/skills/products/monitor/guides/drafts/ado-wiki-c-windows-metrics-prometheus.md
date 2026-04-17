---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Prometheus/Learning Resources/Lab | Collecting AKS Windows metrics (default and custom) to Managed Prometheus"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Managed%20Prometheus/Learning%20Resources/Lab%20%7C%20Collecting%20AKS%20Windows%20metrics%20(default%20and%20custom)%20to%20Managed%20Prometheus"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Collecting AKS Windows Metrics to Managed Prometheus

## Overview

Guide for enabling and troubleshooting Windows metrics collection with Azure Managed Prometheus on AKS clusters.

**Important**: Windows k8s is NOT supported on ARC. Windows pods are not installed/configured on ARC Windows nodes.

## Prerequisites

- AKS Cluster with at least one Windows node pool (Mode: User, SKU: Windows)
- Azure Monitor Workspace (Managed Prometheus)
- Azure Managed Grafana

## Key Concept

Windows scrape targets are **configured but disabled (OFF) by default**. You need to:
1. Enable scraping via `ama-metrics-settings-configmap`
2. Deploy `windows-exporter-config` ConfigMap

## Enabling Windows Metrics

### Step 1: Deploy/Update ama-metrics-settings-configmap

Copy content from [ama-metrics-settings-configmap.yaml](https://github.com/Azure/prometheus-collector/blob/main/otelcollector/configmaps/ama-metrics-settings-configmap.yaml).

Change values:
- `windowsexporter`: `false` -> `true`
- `windowskubeproxy`: `false` -> `true`

Apply via AKS Portal > Kubernetes resources > Configuration > Apply a YAML.

### Step 2: Deploy Windows Exporter ConfigMap

Deploy the `windows-exporter-config` ConfigMap per [Windows metrics collection documentation](https://learn.microsoft.com/azure/azure-monitor/containers/kubernetes-monitoring-enable?tabs=cli#enable-windows-metrics-collection-preview).

### Step 3: Custom Windows Metrics (Optional)

Customize the `windows-exporter-config` ConfigMap with desired collectors per [Prometheus/Windows_Exporter](https://github.com/prometheus-community/windows_exporter#windows_exporter).

## Troubleshooting

### 1. Verify ConfigMap Settings

```bash
# List ConfigMaps (search for ama-metrics-settings-configmap)
kubectl get configmap -nkube-system

# Verify windowsexporter and windowskubeproxy are "true"
kubectl get configmap ama-metrics-settings-configmap -nkube-system -o yaml
```

### 2. Verify Windows Exporter Config

```bash
# List ConfigMaps (search for windows-exporter-config)
kubectl get configmap -nmonitoring
```

### 3. Check Prometheus Interface Targets

```bash
# List pods
kubectl get pods -nkube-system

# Expose Prometheus interface
kubectl port-forward ama-metrics-win-node-xxxxx -nkube-system 9090
```

Look for target errors in the Prometheus interface.

### 4. Check Pod Logs

```bash
kubectl describe pod ama-metrics-win-node-xxxxx -nkube-system
```

### 5. ama-metrics-win Pods Not Created

If `ama-metrics-win-xxxx` pods were not created:

1. Disable monitoring:
   ```bash
   az aks update --disable-azure-monitor-metrics -n <cluster-name> -g <cluster-resource-group>
   ```

2. Re-enable with Windows recording rules:
   ```bash
   az aks update --enable-azure-monitor-metrics --enable-windows-recording-rules -n <cluster-name> -g <cluster-resource-group>
   ```

## Resources

- [Default Prometheus metrics configuration](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-scrape-default)
- [Enable Windows metrics collection](https://learn.microsoft.com/azure/azure-monitor/containers/kubernetes-monitoring-enable?tabs=cli#enable-windows-metrics-collection-preview)
- [Disable Prometheus](https://learn.microsoft.com/azure/azure-monitor/containers/kubernetes-monitoring-disable#disable-prometheus)
- [Enable Prometheus on AKS](https://learn.microsoft.com/azure/azure-monitor/containers/kubernetes-monitoring-enable?tabs=cli#aks-cluster)
- [Windows Exporter](https://github.com/prometheus-community/windows_exporter#windows_exporter)
