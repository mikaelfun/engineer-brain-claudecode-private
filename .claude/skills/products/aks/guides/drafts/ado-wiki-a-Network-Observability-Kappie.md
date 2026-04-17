---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Network Observability (Kappie)"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNetwork%20Observability%20(Kappie)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Network Observability (Kappie)

[[_TOC_]]

## Overview

Network Observability (Previously called Kappie internally) is an interface to kubernetes cluster network traffic. It generates additional metrics that can then be ingested into other tooling. Right now, it will be scraped by Managed Prometheus and shown by Managed Graphana (Owned by the Monitoring team). However, it is intended for the metrics to be accessible by any monitoring solution/tooling.  It can also be used to run packet captures on clusters.

## Pre-requisites

To determine if a cluster as Network Observability enabled, check the following property in ASI.

## Scenarios

### **I'm not seeing any metrics shown in Azure Monitor**

Refer to the metrics troubleshooting guide for more information.

### **I'm having trouble running a network capture**

Refer to the capture troubleshooting guide for more information.

## Escalation Paths

The path we would go depends on the type of issue seen.  

- Extension addition/removal issues - AKS EEE/PG ICM (our normal process)
- Metrics collection, ACNS/kappie pod issues - ICM to Cloudnet/containernetworking
- Metric scraping for Managed Prometheus/Graphana - Collab to Monitoring team
