---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/AKS Per Node PublicIP Use Examples"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAKS%20Per%20Node%20PublicIP%20Use%20Examples"
importDate: "2026-04-05"
type: how-to-guide
---

# Working example for using the per node public IP feature for access to a container

Recently we released a feature that allows for each node in an AKS cluster to get assigned a unique public IP. This doc covers two use examples: NodePort service and hostNetwork with node selector.

## Pre-requisite

Requires an AKS cluster or nodepool created with `--enable-node-public-ip`:

- Cluster: `az aks create -g MyResourceGroup -n MyCluster -l eastus --enable-node-public-ip`
- Node pool: `az aks nodepool add -g MyResourceGroup --cluster-name MyCluster -n nodepool1 --enable-node-public-ip`

If created with the feature, `kubectl get nodes -o wide` shows public IPs in the "External-IP" column.
If the feature is added to a new nodepool on an existing cluster, use `az vmss list-instance-public-ips` instead.

## Example 1 — NodePort Service

1. Deploy app with a `type: NodePort` Service
2. Check which node the pod runs on, the node's public IP, and the assigned NodePort
3. Modify the AKS NSG: restrict Source to your IP, Destination to cluster subnet, Destination port = NodePort
4. Access app via `http://<node-public-ip>:<nodeport>`

## Example 2 — hostNetwork + nodeSelector

1. Deploy with `hostNetwork: true` and `nodeSelector` targeting a specific node
2. Pod listens directly on the node's network interface (port 80)
3. Open NSG for port 80 to the node's public IP
4. Access via `http://<node-public-ip>:80`

Key: hostNetwork pods can communicate with all pods on all nodes without NAT.

Both examples require NSG rules to allow inbound traffic to the node's public IP.
