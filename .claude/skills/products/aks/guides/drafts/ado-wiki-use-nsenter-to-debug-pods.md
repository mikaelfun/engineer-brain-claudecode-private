---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Use nsenter to debug pods"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FUse%20nsenter%20to%20debug%20pods"
importDate: "2026-04-24"
type: guide-draft
---

# Use nsenter to debug pods on AKS nodes

## Prerequisites
- Access to AKS nodes (via node-shell, WSL, or node debugger)
- kubectl configured for the target cluster

## Step 1: Access the AKS node
```bash
kubectl get nodes
kubectl node-shell <node-name>
```

## Step 2: Find the target pod and container
```bash
crictl pods --namespace default
crictl ps | grep <pod-name>
```

## Step 3: Get container PID
```bash
crictl inspect <container-id> | grep -i 'pid'
# Use the first PID value returned
```

## Step 4: Debug with nsenter

### Check container IP address
```bash
nsenter -t <PID> -n ip a
```

### Check DNS configuration
```bash
nsenter -t <PID> -p -r cat /etc/resolv.conf
```

### Capture network traffic
```bash
nsenter -t <PID> -n tcpdump
```

## References
- [Debugging Kubernetes nodes with crictl](https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/)
- [AKS Node Access](https://learn.microsoft.com/en-us/azure/aks/node-access)
- [kubectl-node-shell](https://github.com/kvaps/kubectl-node-shell)
