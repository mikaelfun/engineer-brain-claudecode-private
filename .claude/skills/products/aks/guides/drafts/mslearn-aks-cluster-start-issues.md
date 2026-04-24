---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-aks-cluster-start-issues"
importDate: "2026-04-21"
type: guide-draft
---

# Basic Troubleshooting of AKS Cluster Startup Issues

Multi-step diagnostic guide for AKS cluster startup failures.

## Step 1: View errors from Azure CLI
Run `az aks start --resource-group <rg> --name <cluster>` and examine the output error messages. Errors often contain links to specific troubleshooting articles.

## Step 2: View error details in Azure Portal
Navigate to Activity Log > find "Start Managed Cluster" operation > expand failed suboperations > review JSON error details.

## Step 3: View Cluster Insights
Use Diagnose and solve problems > Cluster insights in Azure Portal for automated analysis.

## Step 4: View MC_ Resource Group
Check VMSS status in MC_ resource group. Failed VMSS shows ProvisioningState/failed with VMExtensionProvisioningError and exit status codes.

## Step 5: kubectl commands
- `kubectl get nodes` - check if nodes are reporting
- `kubectl get pods -n kube-system` - check system pod status
- `kubectl describe pod <pod> -n kube-system` - check events for scheduling failures ("no nodes available to schedule pods")
