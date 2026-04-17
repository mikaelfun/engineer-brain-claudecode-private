---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] Collaborations when doing AKS network troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/AKS%20Network%20Troubleshooting%20Methodology/%5BTSG%5D%20Collaborations%20when%20doing%20AKS%20network%20troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Determine when a collaboration is required

Network issues on AKS might involve network paths outside AKS scope like VPNs, express route, firewalls, and other specific network topology setups. Some scenarios will require the help of other Azure support teams in order to follow a similar troubleshooting approach for the resources and components used on those network paths external to AKS. Another possibility will be around backend issues that could required assistance from EEE and/or PG, for example issues with AKS CCP or underlay components.

Before we open a particular collaboration or escalation with IcM, we must have evidence that the particular component or network resource has issues outside of AKS scope. This means isolating this component or network resource and identifying an incorrect behavior or issues.

Note: Refer [TSG]Component Level Troubleshooting for responsible team for AKS Networking component.

# Azure network support teams

An AKS cluster will include and/or interface with multiple network components. When we run through the steps of the troubleshooting cycle, we have to get a general idea of all the network resources involved that might need specific troubleshooting or review from a particular Azure network support team like:

- Azure Application Gateway (Normal AppGw in front of AKS nodes or AGIC)
- Azure Bastion
- Azure DNS
- Azure ExpressRoute
- Azure Firewall
- Azure Front Door
- Azure Load Balancer
- Azure NVA
- Azure Peering Service
- Azure Private Link
- Azure Virtual Network
- Azure VPN

## Full traffic flow

Make sure before going for a collaboration you have a clear picture of all infrastructure involved and the full traffic flow in question. Ask Cx for any network diagrams that may help understanding the particular scenario. Having a clear understanding on the different levels of networking involved (Azure Networking level and Kubernetes level) will help explaining the issue to Azure Networking team so they do not attempt troubleshooting or ask for info that doesn't apply to Kubernetes.

## Network captures

There will be scenarios that required a network traffic capture to get a better understanding of the network issue. Before starting the capture its critical to consider:

1. What is the expected network path? Any and all network devices the traffic travels through is critical because they are another point of capture.
2. What are the source and destination IP addresses?
3. If either are a fully qualified domain name, resolve the FQDN based on the counterpart.
4. What is the source and destination port and protocol?
5. What is the precise problem description?

From AKS side we will be responsible to guide the Cx on how to collect the network captures from AKS side (nodes or pods), but the capture analysis can be done in a collaboration with the Network support team.

# Collaboration scenarios

## 1. Pod to external destination communication (Storage, Database, Cache etc.)

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (cluster outbound type, Firewalls, UDR, etc.)
- Make sure there is no resource saturation for the node which hosts both client and server.
- Make sure both the client pod and Server are healthy.
- Make sure AKS Cluster is configured with the recommended and supported networking settings (e.g: required ports are open, no CIDR overlap, etc.)
- Assist in getting networking traces from pod.
- Determine routing via ASC Test Traffic.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Make sure there are no known issues with Azure Network configuration in customers environment.
- Collect and analyze networking traces from pod/VM to determine the bottleneck.
- Collect and analyze the Azure Networking components (Azure DNS, VNet, Load Balancer, etc.)
- Engage the CloudNet EEE/ CloudNet PG if needed.

> Azure Networking POD L2 SAP: `Azure\Virtual Network\*`

## 2. Tunnel Connectivity

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (cluster outbound type, Firewalls, UDR, etc.)
- Make sure all the tunnel components/API server are healthy.
- Make sure there is no resource saturation for the node which is hosting tunnel component.
- Make sure NSG/Firewall allows egress communication (port TCP 9000 for tunnelfront, port UDP 1194 for OpenVPN/aks-link, port TCP 443 for Konnectivity).
- Verify whether node can communicate with API server in corresponding port via netcat/telnet commands and ASC Test Traffic.
- Assist in getting networking traces from test helper pod on same node hosting the tunnel component.
- Determine routing via ASC Test Traffic.

**Azure Networking POD Engineers Responsibilities:**
- Collect and analyze the Azure Networking components (Firewall, NAT Gateway, etc.)
- Collect and analyze networking traces from test helper pod.
- Help AKS POD engineer to fix conflicting routes such as BGP.

> Azure Networking POD L2 SAP: `Azure\Virtual Network\*`. VPN: `Azure\VPN Gateway\*`. ExpressRoute: `Azure\ExpressRoute\*`. Virtual WAN: `Azure\Virtual WAN\*`

## 3. Node to API server Connectivity

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (cluster outbound type, Firewalls, UDR, etc.)
- Validate status of node pool and VMs.
- Review cluster CIDRs and VNet CIDRs don't have address conflicts.
- Identify nodes effective routing via ASC Test Traffic.
- Assist in getting networking traces from node via debug helper pod.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from debug helper pod.
- Help AKS POD engineer to fix conflicting routes such as BGP.

> Azure Networking POD L2 SAP: `Azure\Virtual Network\*`

## 4. Pod to AKS Control Plane Communication

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (cluster outbound type, Firewalls, UDR, etc.)
- Validate nodes outbound setup.
- Identify nodes effective routing via ASC Test Traffic.
- Assist in getting networking traces from pod.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from debug helper pod.
- Help AKS POD engineer to fix conflicting routes such as BGP.

> Azure Networking POD L2 SAP: `Azure\Virtual Network\*`

## 5. Pod to Pod Connectivity

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (cluster networking plugin, UDR, network policies, etc.)
- Review cluster CIDRs and VNet CIDRs don't have address conflicts.
- Validate nodes subnet NSG and UDR.
- Identify nodes effective routing via ASC Test Traffic if using CNI.
- Validate configuration of network policies.
- Assist in getting networking traces from client and server pods.
- Test connectivity from helper pod in other nodes.
- Review kube-proxy pod logs.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from pods.

> Azure Networking POD L2 SAP: `Azure\Virtual Network\*`

## 6. Failed to resolve DNS

**AKS POD Engineer Responsibilities:**
- Identify DNS server configuration at VNET.
- Review the CoreDNS Log to spot out any issue.
- Review the /etc/resolv.conf configuration of source pod.
- Review if there are CoreDNS customizations via coredns-custom configmap.
- Determine if issue is related to connectivity to DNS server (i/o timeout, connection timeout) or getting invalid response from server (address not found).
- If the issue is related to connectivity, determine full traffic flow (cluster outbound type, DNS on prem, Firewalls, UDR, VPN, etc.)
- Collect networking traces from node via debug helper pod.
- Test with nslookup/dig commands from helper pod pointing to CoreDNS pod IP and directly to DNS server IP.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from debug helper pod.
- If the issue is related to connectivity, assist AKS POD engineer trace traffic along full flow (UDR, BGP, VPN).
- If using Azure Default DNS collect and analyze the Azure Networking logs.

> Azure Networking POD L2 SAP: `Azure\Azure DNS\*`

## 7. Private link Connectivity

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (Private Endpoint, target service, Private cluster API, etc.)
- Determine if connectivity was setup via explicit Private Endpoint or Subnet Service Endpoint.
- Validate Private link setup: VNET DNS and link to Private Zone record.
- If using custom DNS servers in VNET validate the Private Zone record is attached to their VNET and a forwarding rule for private FQDN has been setup to send request to Azure Internal DNS (168.63.129.16).
- Collect networking traces from node via debug helper pod.
- Test with nslookup/dig commands from helper pod to validate private link internal IP is returned.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from debug helper pod.
- Collect and analyze the Azure Networking components (Private link, backbone connectivity).

> Azure Networking POD L2 SAP: `Azure\Azure Private Link\*`

## 8. Connection Latency

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (cluster outbound type, Firewalls, UDR, etc.)
- Collect networking traces from pod.
- Discard SNAT port exhaustion if applicable (target is on public Internet).

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from pod.
- Collect and analyze the Azure Networking components (VNet, Load Balancer, etc.)

> Azure Networking POD L2 SAP: `Azure\Virtual Network\*`

## 9. Application Gateway Ingress Controller (AGIC)

**AKS POD Engineer Responsibilities:**
- Determine full setup config (AGIC helm installation or addon, Green or Brown field deployment, SP or User Assigned Identity, etc.)
- Determine full traffic flow from AG subnet (Firewalls, UDR, etc.)
- Validate AG backend has correct pod IPs.
- Determine if issue is related to connectivity to pods, writing configuration of AG (azure-ingress and aad-pod-identity pods logs) or errors in end pods.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze the Azure Networking components (VNet, AG).
- Validate AG probes status.

> Azure Networking POD L2 SAP: `Azure\Application Gateway\*`

## 10. APIM/Traffic Manager to Pod Communication

**AKS POD Engineer Responsibilities:**
- Determine full traffic flow (Firewalls, UDR, etc.)
- Validate service and pod are working properly via connection test from helper pod.
- Track down APIM/Traffic Manager request in pod logs.

**Azure Networking POD Engineers Responsibilities:**
- Assist the AKS POD engineer to understand customers' Azure network topology.
- Collect and analyze networking traces from APIM side.
- Collect and analyze the Azure Networking components (VNet, Load Balancer, etc.)

> Azure Networking POD L2 SAP: `Azure\Traffic Manager - DNS based load balancing\*`

# EEE AKS / AKS PG

Network issues related to specific AKS internal network components might require collaboration with EEE AKS and/or AKS PG. For example, issues with components like:

- Kubenet
- Kube-proxy
- Coredns
- Network policies (Calico)
- Ip-masq-agent
- Tunnel (ssh tunnel, Openvpn or Konnectivity)

Note: Please refer [TSG]Component Level Troubleshooting before engaging EEE/PG, and make sure all the required logs are collected.
