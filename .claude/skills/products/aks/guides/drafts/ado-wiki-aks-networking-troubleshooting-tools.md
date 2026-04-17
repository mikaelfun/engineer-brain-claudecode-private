---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AKS Networking Troubleshooting Tools"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AKS%20Networking%20Troubleshooting%20Tools"
importDate: "2026-04-05"
type: troubleshooting-guide
---

Cheat sheet for most of the Networking tools AKS engineer can leverage, which include ASC, ASI, Linux N/W tools, Important IP's.

## Tools

1. [Linux debug tools](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/137263/Linux-debug-tools) (Note: ping is not recommended as ICMP is disabled by default in most Azure resources).
1. [Linux Network Commands](https://www.linuxandubuntu.com/home/10-essential-linux-network-commands)
1. Troubleshooting SNAT Exhaustion
1. How to capture TCP Dump with a sidecar container
1. [Common Linux networking commands](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/527300/Common-Linux-networking-commands)
1. [Linux Cyclic Traces](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/213073/Linux-Cyclic-Traces)
1. [Netsh Command Syntax, Contexts, and Formatting](https://docs.microsoft.com/en-us/windows-server/networking/technologies/netsh/netsh-contexts) (Note: Windows only).
1. [Netshoot](https://github.com/nicolaka/netshoot) (Note: check running netshoot in host network mode for node scope troubleshooting).
1. [MTR](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/278595/How-to-use-MTR)

## Important IP Addresses

- **168.63.129.16**: Azure default DNS and DHCP server in virtual IP, also known as "WireServer"
- **10.0.0.1**: When using default Service CIDR this IP corresponds to the **kubernetes** service in default namespace, which has API server IP as endpoint. This service is invoked to access API from pods.
- **10.0.0.10**: When using default Service CIDR this IP corresponds to **kube-dns**, which has coredns pod IPs as endpoints. This IP shows by default as DNS server in /etc/resolv.conf file in pods.

## Additional Notes

- For Analyzing etl file captured with netsh leverage netmon and enable the windows profile by default.
