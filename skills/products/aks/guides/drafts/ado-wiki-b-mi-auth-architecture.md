---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/Platform and Tools/Architecture Diagrams/MI Auth Architecture"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FPlatform%20and%20Tools%2FArchitecture%20Diagrams%2FMI%20Auth%20Architecture"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Managed Identity Authentication Architecture

1. ACI customer calls `az container create` passing in Managed Identity Resource URI and server name of the targeted ACR instance, using the [ACI API 2021-07-01 or newer](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-reference-yaml). This triggers the ACI control plane to reach out to Azure Identity provider and retrieve an Infrastructure Token. This token is an implementation detail not visible to customers. It allows the ACI control plane to by-pass network protections and access the ACR instance.

2. The ACI control plane uses the token to by-pass ACR network protections and pull the customer's targeted image. If the customer has not given RBAC ACR Pull Permissions to the managed identity or incorrectly spelled the image name, this step will fail.

3. The Atlas control plane then assigns a host VM on the Atlas data plane to run the container group. The image pull process begins as the Atlas data plane pulls the image from the ACR data plane and starts up the container.

## Owner and Contributors

**Owner:** Adam Margherio <amargherio@microsoft.com>

**Contributors:**
- Adam Margherio <amargherio@microsoft.com>
