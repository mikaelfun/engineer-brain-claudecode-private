# AKS Cluster Startup Troubleshooting Guide

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-aks-cluster-start-issues)

## Diagnostic Flow

### 1. Azure CLI Output
- `az aks start` error output contains error code and message
- Common: `VMExtensionProvisioningError` with exit status=50 (outbound connectivity)

### 2. Azure Portal — Activity Log
- Filter by Operation name: "Start Managed Cluster"
- Expand failed entries → check suboperations
- JSON tab for detailed error info

### 3. Cluster Insights
- Diagnose and solve problems → Cluster insights

### 4. MC_ Resource Group
- Check VMSS provisioning status
- Failed → check Code column (e.g., `ProvisioningState/failed/VMExtensionProvisioningError`)

### 5. kubectl Commands
```bash
az aks get-credentials --resource-group <RG> --name <cluster>
kubectl get nodes
kubectl get pods -n kube-system
kubectl describe pod <pod-name> -n kube-system
```

## Notes
- Startup flow is similar to creation but for stopped clusters
- Most common failure: outbound connectivity issues during node bootstrap
- Same VM extension error codes apply as cluster creation
