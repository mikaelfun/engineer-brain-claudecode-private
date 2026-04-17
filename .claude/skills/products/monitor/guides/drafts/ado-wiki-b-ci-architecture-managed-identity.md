---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/Concepts/Common Configurations/Container Insights | Architecture For Managed Identity Configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/Concepts/Common%20Configurations/Container%20Insights%20%7C%20Architecture%20For%20Managed%20Identity%20Configuration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Container Insights Architecture For Managed Identity Configuration

## Overview
Architecture of a Container Insights installation using a standard AKS Cluster with Managed Identity.

## Components

1. **AKS Cluster, DCR, and Log Analytics Workspace** reside in Resource Group `RG-AKS`.

2. **MC_AKS Resource Group** - managed Resource Group created during AKS Cluster creation. Houses infrastructure (VMSS instances) for the cluster.

3. **Container Insights Agent** - composed of:
   - **Replicaset pod (ama-logs-rs*)** - ensures daemonset pods on each node, also collects some data itself
   - **Daemonset pods (ama-logs)** - one per node for data collection

### Replicaset (ama-logs-rs) Tables

| Table | Data Source |
|--|--|
| ContainerNodeInventory | Fluentd in ama-logs-rs |
| KubeEvents | Fluentd in ama-logs-rs |
| KubeNodeInventory | Fluentd in ama-logs-rs |
| KubePodInventory | Fluentd in ama-logs-rs |
| KubePVInventory | Fluentd in ama-logs-rs |
| KubeServices | Fluentd in ama-logs-rs |

### Daemonset (ama-logs) Tables

| Table | Data Source |
|--|--|
| ContainerInventory | Fluentd in ama-logs |
| ContainerLog | Fluent Bit: tail "/var/log/containers/your container log" |
| ContainerLogV2 | Fluent Bit: tail "/var/log/containers/your container log" |
| kubeMonAgentEvents | Fluent Bit: tail "/var/log/containers/your ama-logs pod" |
| InsightsMetrics | Telegraf -> fluent-bit |
| Perf | CAdvisor/Docker daemon -> fluentd |

4. Each pod contains **addon-token-adapter** container (Managed Identity auth) and **ama-logs** container (data collection).

5. The AKS cluster reaches out to the **Data Collection Rule** to obtain configuration (what to collect, where to send, at what interval).
