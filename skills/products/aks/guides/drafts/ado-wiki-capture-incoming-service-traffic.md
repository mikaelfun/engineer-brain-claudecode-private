---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Capture incoming service traffic to nodes and pods"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FCapture%20incoming%20service%20traffic%20to%20nodes%20and%20pods"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Capture incoming service traffic to nodes and pods

## Summary

Clarifies how requests from Load Balancers reach AKS pool nodes and how to capture this traffic with tcpdump on both nodes & pods. There are significant differences compared to a typical LB + backend pool setup and even compared to a regular LB + VMSS deployment (without AKS).

## Key Findings

- **Probe source IP**: The source IP for probe packets is **168.63.129.16** (Azure WireServer), not an internal LB address as expected in a typical LB→Backend probe setup.
- **Client request destination IP**: Client requests arriving at the node use the **service's public/private IP** (same as LB frontend IP), not the node or pod IP. Packets are forwarded by iptables to the appropriate pod IP/port.
- **Service port not listening on node**: The service port is not open for connections on the node (only the probe port is in LISTEN state). This differs from a normal LB+VMSS setup where packets arrive with the node's private IP as destination.

## Diagrams

### Kubenet
- Load Balancer → Node (destination IP = service frontend IP) → iptables → Pod

### Azure CNI
- Load Balancer → Node (destination IP = service frontend IP) → iptables → Pod

## tcpdump Commands

Adapt the tcpdump commands from the diagrams to your specific needs for capturing incoming traffic on both Kubenet and Azure CNI clusters.

## Owner

Naomi Priola <Naomi.Priola@microsoft.com>

**Contributors:** Ines Monteiro, Karina Jacamo, Joao Tavares
