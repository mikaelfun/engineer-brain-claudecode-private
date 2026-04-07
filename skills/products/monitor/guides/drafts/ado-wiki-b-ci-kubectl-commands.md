---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/Concepts/Kubectl Commands for Container Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/Concepts/Kubectl%20Commands%20for%20Container%20Insights"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Kubectl Commands for Container Insights

## Common Commands

| Command | Purpose |
|--|--|
| `az aks get-credentials --resource-group RGNAME --name CLUSTERNAME` | Connect to AKS Cluster |
| `kubectl get pods -n kube-system -o wide` | Retrieve pods in kube-system namespace |
| `kubectl logs PODNAME -n kube-system` | Get logs from a pod |
| `kubectl describe pod PODNAME -n kube-system` | Pod details |
| `kubectl get node` | List nodes (VMSS Instances) |
| `kubectl get configmap container-azm-ms-agentconfig -n kube-system -o yaml` | Get CI ConfigMap (only if customized) |
| `kubectl get configmap ama-logs-rs-config -n kube-system -o yaml` | Get Replicaset Configmap |
| `kubectl get deployment ama-logs-rs -n kube-system -o yaml` | Replicaset deployment detail |
| `kubectl get cluster-info` | Basic cluster info |
| `kubectl exec -it PODNAME -n kube-system -c ama-logs -- /bin/bash` | Start session in pod |
| `kubectl apply configmap -f FILENAME.yaml` | Apply configmap |
| `kubectl get ds ama-logs -n kube-system -o wide` | Agent status |
| `kubectl describe nodes` | Node information |
| `kubectl delete deployment DEPLOYMENTNAME` | Delete deployment |
| `kubectl delete pod ama-logs-xxxx -n kube-system` | Delete/restart ama-logs pod |

## Log Collection Script
```bash
wget https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/scripts/troubleshoot/LogCollection/AgentLogCollection.sh && bash ./AgentLogCollection.sh
```

## Tips
- Append `> filename.txt` or `> filename.yaml` to save command output to file
- `kubectl exec` lets you navigate the pod filesystem for log files
- `kubectl get configmap` can pull current configmap; edit and re-apply with `kubectl apply`
- Check the log collector script for commonly used commands

## Resources
- [Kubectl CLI](https://kubernetes.io/docs/reference/kubectl/)
- [Kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Log Collector Script](https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/scripts/troubleshoot/LogCollection/AgentLogCollection.sh)
