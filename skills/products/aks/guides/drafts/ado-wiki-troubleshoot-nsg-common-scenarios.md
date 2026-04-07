---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] Aks and Network team common troubleshooting/11 - Troubleshoot NSG Common Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting%2F11%20-%20Troubleshoot%20NSG%20Common%20Scenarios"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshoot NSG Common Scenarios

## Inbound traffic is blocked by the NSG on a node pool

To resolve the issue, the custom NSG should be configured to allow traffic between the node pools, specifically on UDP port 53. AKS does not automatically update the custom NSG associated with the subnets.

### Using Portal — Network Watcher

1. Open **Network Watcher** → NSG diagnostics
2. Target resource type: VMSS network interface
3. Select the NIC matching the node (e.g. machine 1)
4. Protocol: ANY or UDP
5. Source Type: IPv4
6. IPv4 addresses: The other Node IP (e.g. 10.5.3.20)
7. Result shows which NSG is blocking; click **View details** to see the specific rule

Reference: https://learn.microsoft.com/en-us/azure/network-watcher/network-watcher-connectivity-portal

### Using ASC (Test Traffic) — Internal

1. Microsoft Compute > virtualMachineScaleSets > NodeName > NodeInstance
2. Diagnostic > Test Traffic
3. Traffic Direction: **TunnelorLocalIn** (testing inbound traffic)
4. Source IP: Other node IP (e.g. 10.5.3.20)
5. Source Port: any high port (33890)
6. Destination IP: Our node IP (e.g. 10.5.3.6)
7. Destination Port: 53
8. Transport Protocol: UDP

Internal ref: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/140399/VM-to-VM-Connectivity-Troubleshooting-TSG

## Outbound traffic is blocked by the NSG on a different node pool

Same procedure as inbound, but configure the custom NSG to allow traffic on the specific protocol/port (e.g. TCP 30578).

### Using Azure Portal — Network Watcher

1. Open Network Watcher → NSG diagnostics
2. Target resource type: VMSS network interface (from source)
3. Protocol: TCP
4. Source Type: IPv4 → other Node IP (e.g. 10.224.0.17)
5. Destination port: e.g. 30578
6. Click details to see which rule is blocking

### Using ASC (Test Traffic)

1. Traffic Direction: **TunnelorLocalIn** (testing inbound to destination)
2. Source IP: e.g. 10.224.0.10
3. Destination IP: e.g. 10.224.0.17
4. Destination Port: 30578
5. Transport Protocol: TCP

**Owner:** mario.chaves <mariochaves@microsoft.com>
