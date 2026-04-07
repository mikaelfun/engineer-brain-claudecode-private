---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Prometheus/Learning Resources/Lab | Azure Managed Prometheus"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Managed%20Prometheus/Learning%20Resources/Lab%20%7C%20Azure%20Managed%20Prometheus"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Managed Prometheus Setup and Architecture

## Overview

Lab guide for setting up Azure Managed Prometheus, covering the full architecture including Azure Monitor Workspace, Managed Grafana, DCR/DCE/DCRA, and AKS metrics addon.

## Prerequisites

- AKS Cluster
- Azure Monitor Workspace

## Setup Process

### 1. Enable Managed Prometheus

From AKS Cluster > Insights blade or from Azure Monitor Workspace > Monitored clusters:
- Configure monitoring for the AKS Cluster
- Create or link an Azure Managed Grafana instance

### 2. Deployment Resources Created

When enabling Managed Prometheus, the following deployments are created:

| Deployment | Purpose |
|-----------|---------|
| AddAMWIntegrationToGrafana | Integration between Managed Grafana and Azure Monitor Workspace |
| AddMonitorDataReaderRoleAssignmenttoGrafanaMSIForAMW | Monitor Data Reader RBAC role for Grafana MSI on AMW scope |
| AddAdministratorRoleForGrafana | Grafana Admin RBAC role for your account |
| AddMonitorReaderRoleAssignmentToGrafanaMSIForGrafana | Monitoring Reader RBAC role for Grafana MSI at subscription level |
| AKSClusterPutProm | Enables metrics addon on AKS Cluster (deploys ama-metrics pods) |
| CreatePromDCRA | Creates Data Collection Rule Association |
| CreatePromDCR | Creates Data Collection Rule for metrics addon |
| CreateGrafanaWorkspace | Creates Azure Managed Grafana instance |
| CreatePromRecordingRules | Creates Prometheus Recording Rules on AMW |
| CreatePromDCE | Creates Data Collection Endpoint |

### 3. Resources Created

- Azure Managed Grafana instance
- AKS cluster: ama-metrics pods (metrics addon)
- Data Collection Rule (DCR)
- Data Collection Rule Association (DCRA)
- Data Collection Endpoint (DCE)

## Data Flow

```
AKS Cluster (ama-metrics pods) -> Azure Monitor Workspace -> Azure Managed Grafana
```

## Validating Data

### Azure Monitor Workspace Sections

- **Overview**: Query endpoint (for Grafana/other consumers) + metrics ingestion endpoint + DCR/DCE info
- **Linked Grafana workspaces**: Connected Grafana instances
- **Data Collection Endpoints**: DCEs connected (AMW-created + AKS-created)
- **Monitored clusters**: AKS clusters sending metrics
- **Prometheus explorer**: Query metrics using PromQL

### Grafana Validation

Navigate to Managed Grafana > Endpoint URL to access dashboards showing default Kubernetes metrics.

## Architecture Components

- **Azure Monitor Workspace (AMW)**: Stores Prometheus metrics, provides query endpoint
- **Data Collection Rule (DCR)**: Configuration for what metrics to collect and where to send
- **Data Collection Endpoint (DCE)**: Endpoint for data ingestion and configuration retrieval
- **Data Collection Rule Association (DCRA)**: Links DCR to the AKS cluster
- **Prometheus Recording Rules**: Pre-configured PromQL queries for Grafana dashboards

## Resources

- [Azure Managed Prometheus Overview](https://learn.microsoft.com/azure/azure-monitor/essentials/prometheus-metrics-overview)
- [Azure Monitor Workspaces](https://learn.microsoft.com/azure/azure-monitor/essentials/azure-monitor-workspace-overview)
- [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/)
