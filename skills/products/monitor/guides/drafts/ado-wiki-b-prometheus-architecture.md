---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Prometheus/Concepts/Common Configurations/Managed Prometheus | Architecture"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FManaged%20Prometheus%2FConcepts%2FCommon%20Configurations%2FManaged%20Prometheus%20%7C%20Architecture"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

![ManagedPrometheusPublic.png](/.attachments/ManagedPrometheusPublic-841eb110-24d3-48e3-b37c-f7f98cb7ce8b.png)

# Overview
The diagram above illustrates the Azure Resource architecture of Managed Prometheus on an AKS Cluster

# Components
1. The AKS Cluster, Data Collection Rule, and Azure Monitor Workspace exist on the Resource Group `RG-AKS`. The DCE will exist in a separate managed resource group created during the creation of the Azure Monitor Workspace, but is put here for illustrative purposes.

2. The `MC_AKS` Resource Group refers to the managed Resource Group created as a part of the AKS Cluster creation process. This Resources Group houses the infrastructure in which to host the AKS Cluster. Each node is a Virtual Machine Scale Set instance.

3. The Managed Prometheus metrics addon is composed of the daemonset (ama-metrics-node) and replicasets (ama-metrics, ama-metrics-ksm) pods. Within each pod there will exist the containers 'prometheus-collector' and 'addon-token-adapter'. The pods live in the kube-system namespace of the AKS Cluster, a namespace being a logical grouping of pods.

- Each of the ama-metrics pods will contain the containers 'addon-token-adapter' which is responsible for authentication using the Managed Identity and prometheus-collector which performs the scraping actions on the AKS Cluster to send to an Azure Monitor Workspace via the Data Collection Endpoint connected to it.

5. The AKS cluster reaches out to the Data Collection Rule to obtain its configuration to determine what data to collect, where to send it and at what interval.

