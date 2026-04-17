---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/Platform and Tools/Atlas Creation Flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FPlatform%20and%20Tools%2FAtlas%20Creation%20Flow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Container Instances on Atlas

[[_TOC_]]

## Summary

This platform document acts as a reference for the Azure Container Instances on Atlas platform. It contains information about the platform architecture, the tools used to manage the platform, and the processes used to manage the platform.

## Container Group Creation Flow on Atlas

1. Customer sends request to ACI Resource Provider
2. ACI performs validation — if refused, returns error
3. ACI decides whether to allocate to K8s or Atlas (following steps are focused on Atlas)
4. Atlas RP accepts the request and validates — if fail, returns error
5. Atlas RP finds a Service Fabric cluster and then provisions an SF application to the cluster
6. SF accepts the request and starts to place the container
7. Atlas RP keeps querying the container state, and only when the container gets logs successfully does it consider the provision successful

## Troubleshooting Implications

- If the customer gets an error at step 2, it is an ACI RP validation issue.
- If the error occurs at step 4, it is an Atlas RP issue.
- If stuck at step 5-7, investigate Service Fabric cluster placement or capacity issues.
- Kusto queries for Atlas investigation are available in the Kusto Repo ACI guide.
