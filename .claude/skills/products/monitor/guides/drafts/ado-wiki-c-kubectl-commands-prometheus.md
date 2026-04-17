---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Prometheus/Concepts/Helpful Kubectl Commands for Managed Prometheus"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Managed%20Prometheus/Concepts/Helpful%20Kubectl%20Commands%20for%20Managed%20Prometheus"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Helpful Kubectl Commands for Managed Prometheus

## Overview

When working with Managed Prometheus, you will be working with AKS Clusters and other types of configurations. Below are helpful Kubectl CLI commands for data collection and general troubleshooting.

## Command Reference

| Command | Purpose |
|--|--|
| az aks get-credentials --resource-group RGNAME --name CLUSTERNAME | Connect to AKS Cluster |
| kubectl get pods -n kube-system -o wide \| grep ama-metrics | Retrieve ama-metrics pods in kube-system namespace |
| kubectl logs PODNAME -n kube-system | Get logs from a pod in kube-system namespace |
| kubectl describe pod PODNAME -n kube-system | Provide details about pod in kube-system namespace |
| kubectl get node | Provide nodes (VMSS Instances) of AKS Cluster |
| kubectl get deployment ama-metrics -n kube-system -o yaml | Get deployment detail of ama-metrics replicaset |
| kubectl get deployment ama-metrics-ksm -n kube-system -o yaml | Get deployment detail of ama-metrics replicaset |
| kubectl get ds ama-metrics-node -n kube-system -o wide | Get status of ama-metrics-node daemonset |
| kubectl get rs AMAMETRICSPODNAME -n kube-system -o wide | Get status of ama-metrics-* replicaset |
| kubectl exec -it PODNAME -n kube-system -- /bin/bash | Start session in a pod (navigate filesystem for info) |
| kubectl apply configmap -f FILENAME.yaml | Apply a configmap for Azure Managed Prometheus |
| kubectl describe nodes | Get information related to nodes on the cluster |
| kubectl get secret aad-msi-auth-token -n kube-system --template={{.data.token}} \| base64 --decode \| grep expires_on | Get Expiry date of the Identity used by addon-token-adapter container |

## Tips

- Append `> Logs.txt` or `> Logs.yaml` to commands to save output for further analysis.
- `kubectl exec` lets you start a session in the pod to navigate the file system for log files.

## Resources

- [Kubectl CLI](https://kubernetes.io/docs/reference/kubectl/)
- [Kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
