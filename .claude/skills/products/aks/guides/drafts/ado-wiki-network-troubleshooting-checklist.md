---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] Aks and Network team common troubleshooting/4 - Troubleshooting checklists"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F4%20-%20Troubleshooting%20checklists"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS Network Troubleshooting Checklists

## General Troubleshooting Steps

1. **Verify connectivity**: Check that nodes can communicate with each other and with external resources.
2. **Check DNS resolution**: Ensure DNS service is functioning correctly. Access services by IP to rule out DNS issues.
3. **Check the firewall**: Ensure necessary ports are open. Verify NSG rules allow traffic.
4. **Check Kubernetes resources**: Verify services, endpoints, and pods are running and healthy.
5. **Check container logs**: Inspect container logs for errors or warnings.
6. **Check AKS logs**: Check cluster logs and related services (Azure LB, App Gateway).
7. **Upgrade Kubernetes**: Consider upgrading to latest version for bug fixes and improvements.
8. **Check for resource constraints**: Verify CPU/memory usage, scale up if needed.
9. **Check for network overlays**: Verify Calico/Flannel functioning, check network policies and routing.

## Network Setup Information Checklist (WHAT-TO-CHECK)

- [ ] Network Plugin type (Kubenet / Azure CNI / BYOCNI)
- [ ] Route table assignments
- [ ] Route table entries to NVA/Firewall
- [ ] Network security groups at Subnet level and VMSS level
- [ ] Service endpoints assigned to Subnet
- [ ] Private link usage
- [ ] AKS VNET Link to Private DNS Zone (if Private link created)
- [ ] HUB-SPOKE and Peering configuration
- [ ] AKS Outbound type: LB / NAT / UserDefinedRouting
- [ ] AKS API Authorized Ranges
- [ ] NAT Gateway used at AKS subnet or not
- [ ] DNS server being used at VNET and Forwarders for custom servers
- [ ] DNS servers reachability (test port 53)
- [ ] Network Plugin Policy being used or not
- [ ] CoreDNS custom configmap
- [ ] Applied Daemonsets that alter networking config (node/kernel/kube-system)
- [ ] Applied Custom script extensions at VMSS level that alter networking config
- [ ] Virtual Network Gateway (VPN to Onprem) with Express Route or not
- [ ] AKS Cluster type: Public / Private / VNet Integrated

## Troubleshooting Links by Category

### Inbound Connections
- [Basic troubleshooting](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connection-issues-application-hosted-aks-cluster)
- [Custom NSG blocks traffic](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/custom-nsg-blocks-traffic)
- [az aks command invoke failures](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/resolve-az-aks-command-invoke-failures)
- [HTTP response codes](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/get-and-analyze-http-response-codes)
- [Intermittent timeouts](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/intermittent-timeouts-or-server-issue)

### API Server Connectivity
- [Basic troubleshooting](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-cluster-connection-issues-api-server)
- [Client IP can't access API server](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/client-ip-address-cannot-access-api-server)
- [Config file not available](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/config-file-is-not-available-when-connecting)
- [Tunnel connectivity issues](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/tunnel-connectivity-issues)

### Outbound Connections
- [Basic network flow](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/basic-troubleshooting-outbound-connections)
- [Pod-to-pod connectivity](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-connection-pods-services-same-cluster)
- [Same VNet endpoints](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-connections-endpoints-same-virtual-network)
- [External endpoints](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-connections-endpoints-outside-virtual-network)
- [DNS failure from pod](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-dns-failure-from-pod-but-not-from-worker-node)
- [Custom NSG blocks inter-nodepool traffic](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/traffic-between-node-pools-is-blocked)
