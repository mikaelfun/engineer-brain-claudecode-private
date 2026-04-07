---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AGIC/[TSG] AGIC Troubleshooting AGIC Pod Not Healthy"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20AGIC%20Pod%20Not%20Healthy"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AGIC: Troubleshooting AGIC Pod Not Healthy

## Step 1: Describe the AGIC Pod

```bash
kubectl describe pod -l app=ingress-appgw -n kube-system
```

CSS: Use Jarvis Action → CustomerCluster - Run kubectl describe.

Check:
- **Pod status**: Should be "Running"
- **Container state**: Should be "Running" (check last state and exit code)
- **Pod conditions**: All should be "True"
- **Events**: Last event should be "Started container ingress-appgw-container"

## Step 2: Check AGIC Pod Logs

```bash
kubectl logs -f -l app=ingress-appgw -n kube-system
```

For CrashLoopBackOff, check previous container logs:
```bash
kubectl logs -p -f -l app=ingress-appgw -n kube-system
```

CSS: Jarvis Action → CustomerCluster - Get pods log.

Look for:
- AGIC error codes (ref: AzureNetworking wiki/218967)
- AGIC/AppGW integration issues (see integration guide)

## Common Issues

### AGIC Pod Pending

Pod stuck in Pending = Kubernetes Scheduler cannot assign to a node (usually insufficient resources).

Check `kubectl describe` events for scheduler messages.
Ref: https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/#example-debugging-pending-pods

### AGIC Pod Crashing/Unhealthy

If assigned to node but not Running:
1. Check last container exit code (common codes: https://komodor.com/learn/exit-codes-in-containers-and-kubernetes-the-complete-guide/)
2. Check pod logs for error/warning messages
3. Check integration issues (ARM connectivity, auth, AppGW state)
