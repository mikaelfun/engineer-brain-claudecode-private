---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Analyzing journalctl logs for OOM kills"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Analyzing journalctl logs for OOM kills"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Analyzing journalctl logs for OOM killed containers due to memory resource limit

## Summary

Guidance on how to analyse journalctl logs for OOM Killed containers due to memory resource limit.

## Triggering a OOM kill due to cgroup memory limits

Simulate OOM kill with a stress deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stress
spec:
  replicas: 1
  selector:
    matchLabels:
      app: stress
  template:
    metadata:
      labels:
        app: stress
    spec:
      containers:
      - name: stress
        image: ubuntu
        imagePullPolicy: IfNotPresent
        command: ["/bin/bash"]
        args: ["-c", "apt-get update; apt-get install stress -y;stress --vm 1 --vm-bytes 100M"]
        resources:
          limits:
            memory: 123Mi
          requests:
            memory: 100Mi
```

## Decoding the OOM kill logs

### 1. Process identification

The first lines indicate the process name that triggered the OOM kill and its PID (in the pid root namespace):

```log
kernel: stress invoked oom-killer: gfp_mask=0xcc0(GFP_KERNEL), order=0, oom_score_adj=986
kernel: CPU: 0 PID: 13052 Comm: stress Not tainted 5.4.0-1040-azure #42~18.04.1-Ubuntu
```

Map between node PID and container PID:

```sh
lsns | grep stress | grep pid
ps -e -o pidns,pid,args | grep <namespace_id> | grep -v grep
cat /proc/<pid>/status | grep NSpid
```

### 2. OOM type identification

The call trace indicates cgroup OOM (not system-level OOM):

```log
kernel: oom_kill_process+0xe6/0x120
kernel: out_of_memory+0x109/0x510
kernel: mem_cgroup_out_of_memory+0xbb/0xd0
```

`mem_cgroup_out_of_memory` confirms container cgroup OOM.

### 3. Memory usage vs limit

```log
kernel: memory: usage 125952kB, limit 125952kB, failcnt 2397
```

125952kB / 1024 = 123Mi — matches the container memory limit.

### 4. Task state at OOM time

```log
kernel: Tasks state (memory values in pages):
kernel: [  pid  ]   uid  tgid total_vm      rss pgtables_bytes swapents oom_score_adj name
```

- RSS value = number of 4kB memory pages being used
- Sum RSS of all tasks × 4kB = total memory usage at OOM time
- pause container has oom_score_adj of -998 (never killed by OOM)

### 5. OOM kill constraint

```log
kernel: oom-kill:constraint=CONSTRAINT_MEMCG,...
```

`CONSTRAINT_MEMCG` confirms cgroup memory limit triggered the kill. The process with highest memory consumption (for same oom_score_adj) is chosen to be killed.

### 6. Kubelet and container runtime response

```log
kubelet: Got sys oom event: &{11207 stress ...}
containerd: shim reaped
kubelet: SyncLoop (PLEG): ... Type:"ContainerDied" ...
```

Shows the kernel OOM kill being picked up by kubelet and container being removed by PLEG. ContainerID matches the cpuset in the kernel oom-kill line.
