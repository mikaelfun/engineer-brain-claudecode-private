---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Boundaries/Azure Monitor Application Insights .NET Kubernetes enricher"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Boundaries%2FAzure%20Monitor%20Application%20Insights%20.NET%20Kubernetes%20enricher"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Kubernetes (.NET Enricher) - Application Insights Support Boundaries

## Overview

This refers to the project: https://github.com/microsoft/ApplicationInsights-Kubernetes

## Specifics on Integration

- Telemetry produced by this enricher will have the sdkVersion value **"ai-k8s"**, e.g. `ai-k8s:7.0.0.0`.
- The purpose of this package is to be paired with the .NET SDK and serve as means to enrich the telemetry with AKS-specific environment details.
- **The Azure Monitoring team (nor any other CSS team) has any support ownership for this package.** The only existing support channel is through filing a GitHub issue directly on the repo: https://github.com/microsoft/ApplicationInsights-Kubernetes/issues
- The above does not mean the Azure Monitoring team shouldn't help customers in validating other aspects of the troubleshooting process (such as networking, DNS, or the underlying .NET SDK) if the situation warrants. It simply means library-specific questions need to be addressed through a GitHub issue as there is currently no IcM escalation path.
- If you have any questions or need clarity for your case, reach out to any of the SMEs or TAs in the team.

## Suggested SAP for Collaboration/Transfer

- GitHub Issues: https://github.com/microsoft/ApplicationInsights-Kubernetes/issues
