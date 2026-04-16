# [AKS] Modifying Kernel Parameters / VMSS Configuration

**Source:** MCVKB/VM+SCIM/18.28  
**Type:** Workaround Guide  
**Product:** AKS (Mooncake)  
**Date:** 2022-01-18

## Constraints

- **AKS does not support direct VMSS template customization** for user-defined OS images
- **Modifying kernel config is not recommended** — changes may be reset during upgrade/cert-rotation (nodes are reimaged to "factory state")
- Reference: https://docs.azure.cn/zh-cn/aks/support-policies#user-customization-of-agent-nodes

## Workaround Options

### Option A: DaemonSet (Cluster-Wide)

Deploy a privileged DaemonSet that runs on every node and applies the kernel parameter change. New nodes added during scale-out or upgrade will also receive the change.

```yaml
# Example: sysctl via init container approach in DaemonSet
apiVersion: apps/v1
kind: DaemonSet
# ... (see reference links below)
```

**Pros:** Applies to all nodes automatically  
**Cons:** Harder to manage; unknown future side effects

### Option B: Init Container in Pod (Targeted)

Add a privileged init container to the specific workload pod that needs the kernel change:

```yaml
spec:
  initContainers:
  - name: init-sysctl
    image: busybox
    command:
    - sh
    - -c
    - echo 10000 > /proc/sys/net/core/somaxconn   # or: sysctl -w net.ipv4.tcp_retries2=5
    securityContext:
      privileged: true
  containers:
  - name: nginx
    image: nginx
```

**Pros:** Minimal blast radius — only affects this pod  
**Cons:** Requires modifying workload YAML; pods will restart

> **Recommendation:** Prefer **Option B** for minimal impact. Option A is harder to predict.

## Notes

- AKS does not support `unsafe sysctls` directly (requires privileged init container workaround)
- Always test in non-production before applying to production

## References

- DaemonSet init nodes: https://medium.com/@patnaikshekhar/initialize-your-aks-nodes-with-daemonsets-679fa81fd20e
- DaemonSet startup script: https://github.com/17media/k8s-startup-script/blob/master/daemonset.yaml
- Init container docs: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/
- Unsafe sysctls: https://kubernetes.io/docs/tasks/administer-cluster/sysctl-cluster/#enabling-unsafe-sysctls
