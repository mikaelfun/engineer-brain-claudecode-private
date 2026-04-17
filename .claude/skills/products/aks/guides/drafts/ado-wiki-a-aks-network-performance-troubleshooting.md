---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] Aks and Network team common troubleshooting/6 - Troubleshoot Performance issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting%2F6%20-%20Troubleshoot%20Performance%20issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshoot AKS Network Performance Issues

## Packet Capture Tools

- **tcpdump** (Linux): [How to take captures with TCPDUMP](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/140089/TCPdump)
- **Wireshark filters**: [Capture filters reference](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/733061/Wireshark-Capture-Filters)
  - [Wireshark Profiles](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/620043/Wireshark-Profiles)
  - [How to merge PCAP files](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/690207/How-to-merge-Packet-capture-(PCAP)-files-using-Wireshark)
- **tcpdump from Windows and Linux** (commands): [Take tcpdump from NVA](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-troubleshoot-nva#capture-network-trace)

## Testing Network Performance in AKS

See internal wiki: [Testing network performance in AKS](/Azure-Kubernetes-Service-Wiki/AKS/How-Tos/Networking/Testing-network-performance-in-AKS)

## Latency Testing

To test latency between VMs:
- **Windows**: Use [Latte](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-test-latency)
- **Linux**: Use [SockPerf](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-test-latency)

More information: [Test network latency between Azure VMs](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-test-latency)
