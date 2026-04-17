# Pod CrashLoopBackOff Troubleshooting Guide

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/pod-stuck-crashloopbackoff-mode)

## Common Causes

1. **Application failure** — app crashes due to misconfigurations, missing dependencies, or incorrect env vars
2. **Incorrect resource limits** — CPU/memory limits set too low, container gets OOM-killed
3. **Missing/misconfigured ConfigMaps/Secrets** — app relies on config not present in cluster
4. **Image pull issues** — corrupted image or incorrect tag
5. **Init containers failing** — one or more init containers fail
6. **Liveness/Readiness probe failures** — misconfigured probes cause Kubernetes to restart container
7. **Application dependencies not ready** — databases, message queues, APIs not yet available
8. **Networking issues** — network misconfigurations prevent communication
9. **Invalid commands or arguments** — incorrect ENTRYPOINT, command, or args

## Diagnostic Commands

| Action | Command |
|--------|---------|
| Debug pod | `kubectl describe pod <pod-name>` |
| Check replication controllers | `kubectl describe replicationcontroller <name>` |
| Read termination message | `kubectl get pod <pod-name> --output=yaml` |
| Examine logs | `kubectl logs <pod-name>` |
| Previous container logs | `kubectl logs <pod-name> --previous` |

## Key Notes

- A pod can also CrashLoopBackOff if it completes immediately (exit code 0) but restartPolicy is Always
- Example: busybox image with no command runs, exits, restarts in loop
- Check exit codes in `kubectl describe pod` output to distinguish between crash and completion
