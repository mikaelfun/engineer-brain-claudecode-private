---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/AKS networking connectivity issues base line template"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FAKS%20networking%20connectivity%20issues%20base%20line%20template"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS networking connectivity issues base line template

Author: Sergio Turrent

## Summary

The following document aims to provide a minimum baseline of required information that has to be requested to the customer or collected using our internal tools before we start troubleshooting network connectivity issues.

## Baseline template

### Network flow information

| **Source IP** | **Protocol**      | **Port** | **Source Network details**             | **Error from Src perspective**                |
|---------------|-------------------|----------|----------------------------------------|-----------------------------------------------|
| x.x.x.x       | TCP \| UDP \| N/A | # \| N/A | VNET \| Internet \| On-Prem \| Cluster | Error code \| Connection status \| Client log |

| **Destination IP / URL**           | **Protocol**      | **Port** | **Destination Network details**        | **Error from Dst perspective**                |
|------------------------------------|-------------------|----------|----------------------------------------|-----------------------------------------------|
| x.x.x.x \| "`example.org/test:8443`" | TCP \| UDP \| N/A | # \| N/A | VNET \| Internet \| On-Prem \| Cluster | Error code \| Connection status \| Server log |

### AKS information

| **CNI type**                                                                                  | **Outbound type**                                                                 | **Has UDR / Firewall** | **Network Policies**         | **Custom DNS**        | **Service Mesh**                                  | **Ingress Controller**                                                                     |
|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|-------------|------------------------------|-----------------------|---------------------------------------------------|--------------------------------------------------------------------------------------------|
| Azure CNI legacy \| Overlay \| Dynamic allocation of IPs \| Kubenet \| Cilium \| BYO CNI | LoadBalancer \| managedNATGateway \| userAssignedNATGateway \| userDefinedRouting | Yes with FW \| Yes for Kubenet only no FW \| No   | Azure \| Calico \| No \| N/A | VNET \| Coredns \| No | Istio Add-on \| OSM Add-on \| Custom \| No \| N/A | AGIC Add-on \| Custom AGIC \| Routing Add-On \| Custom nginx-ingress \| Other \| No \| N/A |

## Examples

### Sample 1: pod fails to connect to API

Issue description: Custom pod running an API health check that is failing with:

`Status = " curl: (35) OpenSSL SSL_connect: SSL_ERROR_SYSCALL in connection to kubernetes.default.svc:443  " - Date = Thu Feb  8 22:45:36 UTC 2024`

Using the AKS with firewall lab for a sample issue.

### Sample 2: connection to service in AKS fails with timeout

Issue description: Service exposed with public IP is not reachable. Connections fails with error:

`curl: (28) Failed to connect to 10.81.x.x port 80 after 21033 ms: Timed out`

Using sample troubleshooting scenario from [custom-nsg-blocks-traffic](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/custom-nsg-blocks-traffic).
