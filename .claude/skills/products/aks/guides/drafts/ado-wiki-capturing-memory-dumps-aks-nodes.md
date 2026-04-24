---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Capturing Memory Dumps on AKS Nodes"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FLinux%2FCapturing%20Memory%20Dumps%20on%20AKS%20Nodes"
importDate: "2026-04-24"
type: guide-draft
---

# How to Capture Container and Memory Dumps on AKS Linux Nodes

## Prerequisites
- AKS cluster running a supported version
- SSH access to the AKS node

## Step 1: SSH into the AKS node
Options:
1. https://docs.microsoft.com/en-us/azure/aks/node-access
2. kubectl-exec tool: https://github.com/mohatb/kubectl-exec

## Step 2: Identify the container process


## Step 3: Generate core dump with gdb


## Step 4: Copy core file for analysis
The core file is generated in the current working directory.
