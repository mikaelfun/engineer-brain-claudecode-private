# AKS 外部负载均衡器与 SNAT — aks — 排查工作流

**来源草稿**: ado-wiki-aks-networking-known-scenarios.md, ado-wiki-aks-networking-troubleshooting-tools.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: aks-networking-known-scenarios
> 来源: ado-wiki-aks-networking-known-scenarios.md | 适用: 适用范围未明确

### 排查步骤

Note: Before doing any deep Network Troubleshooting make sure to verify and fix below mentioned issues (If any)

1. Resource exhaustion like CPU, Memory or IO usually cause a slow VM and due to this customer may notice request timeout, slow response etc, and if it is caused due to resource exhaustion, please follow provide step mentioned under Resource Exhaustion to fix the resource exhaustion before proceeding any further network troubleshooting

1. Make sure there is no SNAT PORT exhaustion, usually caused due to Basic Load Balancer instead of Standard LB, please refer [TSG] AKS Network Tools / AppLens Detector for identifying SNAT Port exhaustion.

1. For Readiness or Liveness Probe failure we need to verify the customer code which define readiness/Liveness Probe logic.

1. Make sure Firewall/NSG are allowlisted with required AKS PORT as mentioned in [Restrict egress traffic in Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/aks/limit-egress-traffic#azure-global-required-network-rules)

1. Make sure both client and Server is healthy during the time of issue.

---

## Scenario 2: aks-networking-troubleshooting-tools
> 来源: ado-wiki-aks-networking-troubleshooting-tools.md | 适用: 适用范围未明确

### 排查步骤

Cheat sheet for most of the Networking tools AKS engineer can leverage, which include ASC, ASI, Linux N/W tools, Important IP's.

#### Tools

1. [Linux debug tools](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/137263/Linux-debug-tools) (Note: ping is not recommended as ICMP is disabled by default in most Azure resources).
1. [Linux Network Commands](https://www.linuxandubuntu.com/home/10-essential-linux-network-commands)
1. Troubleshooting SNAT Exhaustion
1. How to capture TCP Dump with a sidecar container
1. [Common Linux networking commands](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/527300/Common-Linux-networking-commands)
1. [Linux Cyclic Traces](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/213073/Linux-Cyclic-Traces)
1. [Netsh Command Syntax, Contexts, and Formatting](https://docs.microsoft.com/en-us/windows-server/networking/technologies/netsh/netsh-contexts) (Note: Windows only).
1. [Netshoot](https://github.com/nicolaka/netshoot) (Note: check running netshoot in host network mode for node scope troubleshooting).
1. [MTR](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/278595/How-to-use-MTR)

#### Important IP Addresses

- **168.63.129.16**: Azure default DNS and DHCP server in virtual IP, also known as "WireServer"
- **10.0.0.1**: When using default Service CIDR this IP corresponds to the **kubernetes** service in default namespace, which has API server IP as endpoint. This service is invoked to access API from pods.
- **10.0.0.10**: When using default Service CIDR this IP corresponds to **kube-dns**, which has coredns pod IPs as endpoints. This IP shows by default as DNS server in /etc/resolv.conf file in pods.

#### Additional Notes

- For Analyzing etl file captured with netsh leverage netmon and enable the windows profile by default.

---
