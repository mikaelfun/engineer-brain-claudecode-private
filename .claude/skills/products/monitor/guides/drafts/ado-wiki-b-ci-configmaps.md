---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/Concepts/ConfigMaps"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/Concepts/ConfigMaps"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ConfigMaps for Container Insights

## What is a ConfigMap?
A Kubernetes API object used to store non-confidential data in key-value pairs. Pods can consume ConfigMaps as environment variables, command-line arguments, or as configuration files in a volume.

## How Does it Relate to Container Insights?
Container Insights utilizes a ConfigMap to determine what data it is collecting. Customers can change this file and apply it to either collect more information or restrict the amount of data collected.

## Resources
- [Kubernetes ConfigMaps Documentation](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Container Insights Configure Data Collection Via ConfigMap](https://learn.microsoft.com/azure/azure-monitor/containers/container-insights-agent-config)
- [Container Insights Template ConfigMap](https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/kubernetes/container-azm-ms-agentconfig.yaml)
