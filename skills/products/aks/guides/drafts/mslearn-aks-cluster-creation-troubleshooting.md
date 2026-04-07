# AKS Cluster Creation Troubleshooting Guide

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-aks-cluster-creation-issues)

## Diagnostic Flow

### 1. Azure CLI Output
- Error code and message shown directly in `az aks create` output
- Example: `ControlPlaneAddOnsNotReady` — system pods not running

### 2. Azure Portal — Activity Log
- Filter by Operation name: "Create or Update Managed Cluster"
- Check suboperations for failures (policy actions, resource creation)
- JSON tab provides most detailed error info

### 3. Cluster Insights (if cluster visible in portal)
- Kubernetes services → select cluster → Diagnose and solve problems → Cluster insights

### 4. MC_ Resource Group
- Check VMSS status in MC_ resource group
- Failed status → select to view error details (Status, Level, Code, Message)
- Common: `VMExtensionProvisioningError` with exit status codes

### 5. kubectl Commands (if cluster accessible)
```bash
az aks get-credentials --resource-group <RG> --name <cluster>
kubectl get nodes
kubectl get pods -n kube-system
kubectl describe pod <pod-name> -n kube-system
```

## Common Error Patterns
- `ControlPlaneAddOnsNotReady` — system pods (coredns, konnectivity, metrics-server) not running
- `VMExtensionProvisioningError` exit status=50 — outbound connectivity failure
- Policy action failures — Azure Policy blocking resource creation
- No nodes available to schedule pods
