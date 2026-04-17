---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Networking/Outbound Connectivity/Troubleshoot SNAT Port exhaustion"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FTroubleshoot%20SNAT%20Port%20exhaustion"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting SNAT Port Exhaustion

[[_TOC_]]

## Overview

This document guides through finding the high-connection generating Pods to mitigate heavy outbound connections causing SNAT port exhaustion.

**Note:** If locating SNAT port exhaustion on AKS nodes running Kubernetes-jobs, follow the procedure only when jobs are actively running on the nodes.

## Step 1: Identify SNAT Exhaustion via Azure Portal

1. Locate the default kubernetes load balancer in the AKS cluster's resource group
2. Use load balancer metrics portal to identify nodes experiencing SNAT port exhaustion: [Check SNAT port usage and allocation](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-standard-diagnostics#how-do-i-check-my-snat-port-usage-and-allocation)

Reference: [SNAT ports and allocation per VM](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-outbound-connections#what-are-snat-ports)

## Step 2: Identify AKS Node Name

```bash
kubectl get nodes -o wide | grep <node IP>
```

## Step 3: TCPTracer - Find Heavy Connections

**Note:** bcc-tools are pre-installed on Linux AKS nodes. Use node-shell tool to access.

Install node-shell:
```bash
curl -LO https://github.com/kvaps/kubectl-node-shell/raw/master/kubectl-node_shell
chmod +x ./kubectl-node_shell
sudo mv ./kubectl-node_shell /usr/local/bin/kubectl-node_shell
```

SSH to node and run tcptracer:
```bash
kubectl node-shell <node name>
cd /usr/share/bcc/tools
python3 tcptracer -t4v
```

Sort output to find top connections:
```bash
python3 tcptracer -t4v > log
head -n +2 log | tail -n 1 | awk '{print "Count",$6,$10}'; awk '{print $6,$10}' log | sort | uniq -c | sort -nrk 1 | column -t
```

## Step 4: LSNS - Map NETNS to PID

```bash
lsns -t net
```

Note the NETNS with most connections from tcptracer output, find corresponding PID.

## Step 5: PSTree - Map PID to Container

```bash
pstree -aps <PID>
```

Look for the containerd-shim process and its container ID.

## Step 6: CRICTL - Map Container to Pod

```bash
crictl ps -a
```

Use first 5 characters of containerd id from pstree to find the POD ID and pod name.

## Step 7: Verify with Netstat

```bash
# List all pods on the node
kubectl get pods --all-namespaces -o wide --field-selector spec.nodeName=<nodename>

# Exec into the identified pod
kubectl exec -it <pod name> -n <namespace> /bin/bash

# For Linux - install and run netstat
apt update && apt install net-tools
netstat -ptn | grep -i established

# For Windows
kubectl exec -it <windows pod name> -- cmd.exe
netstat -aon | find /i "established"
```

Count only ESTABLISHED connections to **public IP addresses** (ignore private IPs). The pod with most public IP connections is causing SNAT exhaustion.

## Remediation

Work with application developers to tune the application using recommendations from:
https://learn.microsoft.com/en-us/azure/load-balancer/troubleshoot-outbound-connection#design-connection-efficient-applications
