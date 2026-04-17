---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Connecting to AKS nodes with SSH helper pod"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FConnecting%20to%20AKS%20nodes%20with%20SSH%20helper%20pod"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Connecting to AKS Nodes through a Helper Pod

## Summary and Goals

This kubectl plugin script deploys a helper pod that facilitates a remote connection to another Node/Pod through SSH Private Key. It deploys a default nginx pod, installs OpenSSH, uploads the private key from local, and executes SSH connectivity.

## Prerequisites

- A **bash** instance
- A working AKS cluster with **kubectl** configured
- AKS cluster installed with `--generate-ssh-key`
- Private key (`id_rsa`) available locally

## Implementation

```bash
#!/bin/bash

# Define the name of the SSH Pod
sshpod="sshpod2"
ssh_key="./id_rsa"
pod_image="nginx"

if [[ $# -ne 1 ]]; then
  echo "Usage: kubectl ssh_nodeshell <node-name>"
else
  # Getting the IP Address of the Node
  nodeIP=$(kubectl get node $1 -o wide | awk '{print $6}' | tail -n +2)
  echo "Connecting to $nodeIP"
  echo "Creating SSH Host Pod"
  kubectl run $sshpod --image=$pod_image
  echo "Waiting for Pod to be deployed"
  sleep 5
  kubectl exec -it $sshpod -- apt update
  echo "Install OpenSSH"
  kubectl exec -it $sshpod -- apt install ssh -y
  kubectl cp $ssh_key $sshpod:/tmp
  kubectl exec -it $sshpod -- ssh -o "StrictHostKeyChecking no" -i /tmp/id_rsa azureuser@$nodeIP
  echo "Done"
fi
```

Usage:
```bash
kubectl-sshnode <nodeName>
```

## Involved Components

- nginx Pod
- OpenSSH
- SSH Private Key
