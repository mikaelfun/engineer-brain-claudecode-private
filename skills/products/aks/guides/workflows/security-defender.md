# AKS Microsoft Defender — 排查工作流

**来源草稿**: ado-wiki-tcpdump-using-sidecar-containers.md, mslearn-avoid-running-as-root-containers.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Tcpdump using sidecar containers
> 来源: ado-wiki-tcpdump-using-sidecar-containers.md | 适用: 适用范围未明确

### 排查步骤

#### Tcpdump using sidecar containers

#### Summary

The purpose of this method is to get network captures from pods experiencing intermittent connectivity problems. The patch method will add a sidecar to the deployment on which the problem is present. This sidecar will be running and collecting logs from the pod as the problem gets reproduced.

#### Problem

Customers sometimes cannot install TCP dump on pods, and in this situation one of the things we can do is to run tcpdump as a sidecar container and get the logs. This will need customer to redeploy the pod or node. However this is useful to intermittent issues and the logs here get rotated so we can capture for a longer period of time.

#### Tcpdump as sidecar

1. Create a yaml file called patch.yaml:

   ```yaml
   spec:
     template:
       spec:
         containers:
         - name: tcpdump
           image: docker.io/corfr/tcpdump
           args: ["-C", "100", "-W", "20", "-v", "-w", "/data/dump" ]
   ```

2. Execute the patch command: `kubectl patch deployment <deploymentName> --patch-file patch.yaml`

3. Verify the tcpdump container is added with `kubectl describe pod <podName>`

4. Reproduce the issue to capture.

5. Exec into the container and check dump files:
   ```sh
   kubectl exec -it <podName> -c tcpdump -- sh
   cd /data
   ls
   # rename dump file: mv dump00 dump00.pcap
   ```

6. Copy the file to local machine:
   ```sh
   kubectl cp <podNameSpace/podName>:/data/dump00.pcap -c tcpdump ./dump.pcap
   ```

#### Standalone test pod (nginx + tcpdump sidecar)

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: nginx
  name: nginx
  namespace: default
spec:
  containers:
  - image: nginx
    imagePullPolicy: Always
    name: nginx
  - name: tcpdump
    image: docker.io/corfr/tcpdump
    args: ["-C", "100", "-W", "20", "-v", "-w", "/data/dump" ]
```

Multiple files created of size 100MB depending on the length of time it runs. After 20 files the dump will rotate. Use filtering commands from tcpdump reference and add those filters to args.

#### References

- https://medium.com/@xxradar/how-to-tcpdump-effectively-in-kubernetes-part-1-a1546b683d2f

---

## Scenario 2: Security Best Practice: Don't Run as Root in Containers (AKS)
> 来源: mslearn-avoid-running-as-root-containers.md | 适用: 适用范围未明确

### 排查步骤

#### Security Best Practice: Don't Run as Root in Containers (AKS)

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/avoid-running-as-root-in-containers

#### Summary

Running containers as root increases the attack surface. Always configure `securityContext` to run as non-root user.

#### Configuration

Set `securityContext` in Pod/Deployment/DaemonSet/StatefulSet/ReplicaSet/Job/CronJob YAML:

```yaml
securityContext:
  runAsNonRoot: true    # Prevents container from running as root
  runAsUser: 1000       # Any non-zero UID
```

##### Key Points

- `runAsNonRoot` (Optional): If true, container operates without root privileges. Default is **false**.
- `runAsUser` (Optional): If set to anything other than 0 (root), the container runs as that user ID.
- If `securityContext` is omitted entirely, the pod runs as **root** by default.

#### Applies To

- Pod
- Deployment
- DaemonSet
- StatefulSet
- ReplicaSet
- ReplicationController
- Job
- CronJob

#### Reference

- [Kubernetes docs: Configure a security context for a pod or container](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)

---
