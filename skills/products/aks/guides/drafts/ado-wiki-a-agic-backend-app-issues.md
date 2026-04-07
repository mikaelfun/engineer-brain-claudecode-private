---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AGIC/[TSG] AGIC Troubleshooting Backend Application Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20Backend%20Application%20Issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Backend Application Issues (AGIC)

> Note: Microsoft does not support development issues affecting AKS workloads (per AKS support policy). CSS drives investigation to the point where it is clear the issue is with the application itself.

## Check Application Pod State

```bash
kubectl get pod <POD_NAME> -n <NAMESPACE> -o wide
```

Check:
- **READY**: all containers ready (e.g. "1/1")
- **STATUS**: should be "RUNNING"
- **RESTARTS**: stable number (high/increasing = instability)

## Describe the Application Pod

```bash
kubectl describe pod <POD_NAME> -n <NAMESPACE>
```

Check: Pod status, Container state (+ last state/exit code), Pod conditions, Events.

## Check Application Pod Logs

```bash
kubectl logs <POD_NAME> -n <NAMESPACE>
# For CrashLoopBackOff:
kubectl logs -p -f <POD_NAME> -n <NAMESPACE>
```

> CSS tools (Jarvis) cannot access customer application pod logs due to data privacy policies.

## Exec into Container

```bash
kubectl exec -it <POD_NAME> -n <NAMESPACE> -- /bin/bash
```

Useful for:
- Checking additional log files not visible in stdout/stderr
- Installing troubleshooting tools (strace, VisualVM, etc.)

## Common Issues

### Pod in Pending Status
- Insufficient resources preventing scheduling
- Check `kubectl describe` for scheduler events
- Ref: https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/#example-debugging-pending-pods

### Pod Crashing or Unhealthy
- Check container exit codes
- Check pod logs for errors
- Common exit codes reference: https://komodor.com/learn/exit-codes-in-containers-and-kubernetes-the-complete-guide/
