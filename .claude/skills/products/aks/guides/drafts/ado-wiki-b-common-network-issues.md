---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] Aks and Network team common troubleshooting/3 - Troubleshoot Common issues when working with customer"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/AKS%20Network%20Troubleshooting%20Methodology/%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting/3%20-%20Troubleshoot%20Common%20issues%20when%20working%20with%20customer"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshoot Common issues when working with customer

## 1. Troubleshoot inbound connections

- Basic troubleshooting: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connection-issues-application-hosted-aks-cluster
- Custom NSG blocks traffic: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/custom-nsg-blocks-traffic
- Failures in the "az aks command invoke" command: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/resolve-az-aks-command-invoke-failures
- Get and analyze HTTP response codes: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/get-and-analyze-http-response-codes
- Intermittent timeouts or server issues: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/intermittent-timeouts-or-server-issue

## 2. Cannot connect to AKS cluster through API server

- Basic troubleshooting: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-cluster-connection-issues-api-server
- Client IP address can't access API server: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/client-ip-address-cannot-access-api-server
- Config file isn't available when connecting: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/config-file-is-not-available-when-connecting
- Tunnel connectivity issues: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/tunnel-connectivity-issues
- User can't get cluster resources: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/user-cannot-get-cluster-resources

## 3. Troubleshoot outbound connections

- Basic network flow and troubleshooting: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/basic-troubleshooting-outbound-connections
- Can't connect to pods and services in same cluster: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-connection-pods-services-same-cluster
- Can't connect to endpoints in same virtual network: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-connections-endpoints-same-virtual-network
- Can't connect to endpoints outside virtual network (public internet): https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-connections-endpoints-outside-virtual-network
- DNS resolution failure from within pod but not from worker node: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-dns-failure-from-pod-but-not-from-worker-node
- Traffic between node pools is blocked by custom NSG: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/traffic-between-node-pools-is-blocked
