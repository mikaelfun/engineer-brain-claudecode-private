---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] Container Debug Tools"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20Debug%20Tools"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG Container Debug Tools

Often we see customers running into issues with Container, those issues aren't ACI related but in the application. We can recommend debug tools to help them investigate.

- [Set up liveness probe on container instance - Azure Container Instances | Microsoft Docs](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-liveness-probe)
- Sending std out/err logs to log analytics: [Collect & analyze resource logs - Azure Container Instances | Microsoft Docs](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-log-analytics)
- Instrumenting application with application insights TSG: [Application Insights API for custom events and metrics - Azure Monitor | Microsoft Docs](https://docs.microsoft.com/en-us/azure/azure-monitor/app/api-custom-events-metrics)
- Adding ping/keep alive command and then exercising into the container: [Troubleshoot common issues - Azure Container Instances | Microsoft Docs](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-troubleshooting#container-continually-exits-and-restarts-no-long-running-process)
- [Update container group - Azure Container Instances | Microsoft Docs](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-update)

## Owner and Contributors

**Owner:** Kenneth Gonzalez Pineda <kegonzal@microsoft.com>
