---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Monitoring/AKS Network Observability - BYO Prometheus and Grafana example"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FAKS%20Network%20Observability%20-%20BYO%20Prometheus%20and%20Grafana%20example"
importDate: "2026-04-24"
type: guide-draft
---

# AKS Network Observability - BYO Prometheus and Grafana Setup

## Summary
Setup guide for using AKS Network Observability with self-managed Prometheus and Grafana.

## Prerequisites
- aks-preview CLI extension
- NetworkObservabilityPreview feature flag registered

## Steps
1. Enable Network Observability on AKS cluster
2. Install kube-prometheus-stack via Helm
3. Add custom scrapeConfigs for AKS network metrics
4. Configure Grafana dashboard

## Notes
- BYO setup is outside support scope; best-effort guidance only
- Alternative: use Azure managed Prometheus and Grafana (fully supported)
