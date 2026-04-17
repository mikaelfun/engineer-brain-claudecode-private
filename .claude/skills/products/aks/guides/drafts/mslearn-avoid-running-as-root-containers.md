# Security Best Practice: Don't Run as Root in Containers (AKS)

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/avoid-running-as-root-in-containers

## Summary

Running containers as root increases the attack surface. Always configure `securityContext` to run as non-root user.

## Configuration

Set `securityContext` in Pod/Deployment/DaemonSet/StatefulSet/ReplicaSet/Job/CronJob YAML:

```yaml
securityContext:
  runAsNonRoot: true    # Prevents container from running as root
  runAsUser: 1000       # Any non-zero UID
```

### Key Points

- `runAsNonRoot` (Optional): If true, container operates without root privileges. Default is **false**.
- `runAsUser` (Optional): If set to anything other than 0 (root), the container runs as that user ID.
- If `securityContext` is omitted entirely, the pod runs as **root** by default.

## Applies To

- Pod
- Deployment
- DaemonSet
- StatefulSet
- ReplicaSet
- ReplicationController
- Job
- CronJob

## Reference

- [Kubernetes docs: Configure a security context for a pod or container](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)
