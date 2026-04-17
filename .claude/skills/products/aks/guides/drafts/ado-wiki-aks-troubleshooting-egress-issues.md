---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AKS troubleshooting egress issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AKS%20troubleshooting%20egress%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS troubleshooting egress issues

Author: Sergio Turrent

## Summary

The objective of this document is to guide engineers on the setup and resolution of an AKS cluster with intermittent egress issues. The setup has an AKS cluster running a database client connectivity test that is configured to poll the access to an Azure Database for PostgreSQL flexible server on a peered VNET.

## Lab setup

The scenario will be setup with a Bicep template using the following steps:

### 1. Cloning the repo

On a terminal run the following command to clone the GitHub repo with the Bicep files:

```bash
git clone https://github.com/sturrent/aks-net-outbound-troubleshooting-1.git
```

### 2. Deploy cluster lab

Change directory to the repo directory and run the deployment with the following commands:

```bash
cd aks-net-outbound-troubleshooting-1
az deployment sub create --name aks-egress-lab1 -l eastus2 --template-file main.bicep
```

### 3. Confirm cluster status and get credentials

```bash
az aks show -g aks-workbench-lab1-rg -n aks-workbench -o table
az aks get-credentials -g aks-workbench-lab1-rg -n aks-workbench --overwrite-existing
```

## Problem description

The cluster has a deployment named "db-check" in the default namespace that is intermittently failing connect to a database on a peered VNET.

Sample error logs:

```text
14/06/2024 18:39:37 Connection Failure: 1
14/06/2024 18:39:52 Connection Failure: 1
14/06/2024 18:40:07 Connection Failure: 1
14/06/2024 18:40:22 Connection Failure: 1
```

## Troubleshooting Workflow

```
Start
  → Identify the connectivity path (source, destination, hops)
  → Review health/performance of nodes and outbound appliances (SLB, NATGW)
  → Review health/performance of CoreDNS pods
  → Review security layer (Firewall, NSG, Network policies)
  → Capture traffic and review connectivity status
  → Develop hypothesis
  → Is issue external to AKS?
    Yes → Identify support groups → Collaborate → Action plan
    No → Action plan
  → Implement action plan and observe results
  → Resolved? Yes → Document findings. No → Escalation → restart
```

## Step-by-step troubleshooting

### 1. Identify the connectivity path

Collect baseline information for AKS networking connectivity issues:

| **Source** | **Protocol** | **Port** | **Network** | **Error** |
|---|---|---|---|---|
| Pod IP (192.168.x.x) | TCP | N/A | AKS Nodes VNET 172.16.0.0/24 | Connection failure |

| **Destination** | **Protocol** | **Port** | **Network** | **Error** |
|---|---|---|---|---|
| 10.0.0.4 / postgresdb1 | TCP | 5432 | db-vnet 10.0.0.0/16 peered with aks-vnet | None from server side |

AKS info: Azure CNI Overlay, STD LoadBalancer outbound, No UDR/FW, Calico (no NetPol), No custom DNS.

### 2. Review health and performance of nodes and outbound appliances

Use ASI, Applens, and Geneva actions to review nodes and pods compute resource usage. In this case no compute resource issues or IO throttling.

### 3. Review security layer

Using ASI and ASC, confirm no network policies, Firewall, or NSG issues for this connection.

### 4. Capture traffic

#### Using Dumpy (kubectl plugin)

Install Krew: https://krew.sigs.k8s.io/docs/user-guide/setup/install/

```bash
kubectl krew update; kubectl krew install dumpy
kubectl dumpy capture deploy db-check -n default --name db-cap1
kubectl dumpy get -n default
mkdir db-captures
kubectl dumpy export db-cap1 ./db-captures -n default
kubectl dumpy delete db-cap1
```

#### Pod capture analysis

Successful connection shows normal TCP handshake + TLS. Failed connection shows:

```text
ICMP 108 Destination unreachable (Port unreachable)
```

#### Node capture

```bash
# Using kubectl-node-shell or nsenter pod
tcpdump -i any port 5432 -w /var/tmp/node-cap1.pcap
# Collect: kubectl cp <nsenter_POD_NAME>:/var/tmp/node-cap1.pcap ./db-captures/node-cap1.pcap
```

Node capture shows SYN packets with no reply for failed connections.

#### Database server logs

Enable "Server logs" in portal for PostgreSQL. Only successful connections appear in server logs — no records for failed ones (traffic never reaches server).

### 5. Develop hypothesis

CIDR overlap analysis:
- Cluster nodes CIDR and pod CIDR: no overlap with database server CIDR
- **Service CIDR overlaps with database server subnet CIDR**
- A ClusterIP service with the same IP:port as the database can cause conflict

### 6-7. Collaborate with external teams

- PostgreSQL support: validate connections from client node IP
- Network support: review traffic captures, noting pod/service CIDRs are virtual (AKS-internal only)

### 8. Validate hypothesis

Check iptables on the node:

```bash
iptables-save | grep 10.0.0.4
# Output: -A KUBE-SERVICES -d 10.0.0.4/32 -p tcp -m comment --comment "kube-system/test-svc1:db-tcp has no endpoints" -j REJECT --reject-with icmp-port-unreachable
```

Check kube-audit logs for service creation:

```kusto
ControlPlaneEventsAll
| where ccpNamespace == "<cluster-id>"
| where PreciseTimeStamp >= ago(1d)
| extend log=parse_json(tostring(parse_json(properties).log))
| where category has "kube-audit"
| extend verb=log.verb
| where verb !in ('get', 'list', 'watch')
| where log contains "10.0.0.4"
| project PreciseTimeStamp, verb, object=log.requestURI, name=log.objectRef.name, user=log.user.username
| sort by PreciseTimeStamp desc
```

**Root cause confirmed**: A ClusterIP service (test-svc1) was created with IP 10.0.0.4 port 5432 — same as the PostgreSQL server. Since the service has no endpoints, iptables REJECTs the traffic with ICMP port-unreachable.

### Resolution

- Remove or change the conflicting ClusterIP service to use a non-overlapping IP
- General guidance: service CIDR must NOT overlap with peered VNets, on-premises networks, or external networks
- Reference: [IP address planning](https://learn.microsoft.com/en-us/azure/aks/azure-cni-overlay?tabs=kubectl#ip-address-planning)

## Clean up

```bash
az group delete -n aks-workbench-lab1-rg --no-wait -y
az group delete -n vnet-workbench-lab1-rg --no-wait -y
az group delete -n db-workbench-lab1-rg --no-wait -y
```
