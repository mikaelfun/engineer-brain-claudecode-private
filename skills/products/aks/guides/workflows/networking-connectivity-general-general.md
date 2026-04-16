# AKS 网络连通性通用 — general — 排查工作流

**来源草稿**: ado-wiki-a-container-debug-tools.md, ado-wiki-a-kubelet-serving-cert-rotation.md, ado-wiki-analyzing-journalctl-logs-for-oom-kills.md, ado-wiki-use-nsenter-to-debug-pods.md
**Kusto 引用**: arm-crp-tracking.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: TSG Container Debug Tools
> 来源: ado-wiki-a-container-debug-tools.md | 适用: 适用范围未明确

### 排查步骤

#### TSG Container Debug Tools

Often we see customers running into issues with Container, those issues aren't ACI related but in the application. We can recommend debug tools to help them investigate.

- [Set up liveness probe on container instance - Azure Container Instances | Microsoft Docs](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-liveness-probe)
- Sending std out/err logs to log analytics: [Collect & analyze resource logs - Azure Container Instances | Microsoft Docs](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-log-analytics)
- Instrumenting application with application insights TSG: [Application Insights API for custom events and metrics - Azure Monitor | Microsoft Docs](https://docs.microsoft.com/en-us/azure/azure-monitor/app/api-custom-events-metrics)
- Adding ping/keep alive command and then exercising into the container: [Troubleshoot common issues - Azure Container Instances | Microsoft Docs](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-troubleshooting#container-continually-exits-and-restarts-no-long-running-process)
- [Update container group - Azure Container Instances | Microsoft Docs](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-update)

#### Owner and Contributors

**Owner:** Kenneth Gonzalez Pineda <kegonzal@microsoft.com>

---

## Scenario 2: Troubleshooting Flow
> 来源: ado-wiki-a-kubelet-serving-cert-rotation.md | 适用: 适用范围未明确

### 排查步骤

1. **Check node labels** for `kubernetes.azure.com/kubelet-serving-ca=cluster`
2. **Verify CSR status**: `kubectl get csr` - look for pending/denied CSRs
3. **Check kubelet-serving-csr-approver** pods in CCP
4. **Verify kube-controller-manager** signing controller is functioning
5. **Check kubelet PKI directory** on the node for certificate files

---

## Scenario 3: Analyzing journalctl logs for OOM killed containers due to memory resource limit
> 来源: ado-wiki-analyzing-journalctl-logs-for-oom-kills.md | 适用: 适用范围未明确

### 排查步骤

#### Analyzing journalctl logs for OOM killed containers due to memory resource limit

#### Summary

Guidance on how to analyse journalctl logs for OOM Killed containers due to memory resource limit.

#### Triggering a OOM kill due to cgroup memory limits

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

#### Decoding the OOM kill logs

##### 1. Process identification

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

##### 2. OOM type identification

The call trace indicates cgroup OOM (not system-level OOM):

```log
kernel: oom_kill_process+0xe6/0x120
kernel: out_of_memory+0x109/0x510
kernel: mem_cgroup_out_of_memory+0xbb/0xd0
```

`mem_cgroup_out_of_memory` confirms container cgroup OOM.

##### 3. Memory usage vs limit

```log
kernel: memory: usage 125952kB, limit 125952kB, failcnt 2397
```

125952kB / 1024 = 123Mi — matches the container memory limit.

##### 4. Task state at OOM time

```log
kernel: Tasks state (memory values in pages):
kernel: [  pid  ]   uid  tgid total_vm      rss pgtables_bytes swapents oom_score_adj name
```

- RSS value = number of 4kB memory pages being used
- Sum RSS of all tasks × 4kB = total memory usage at OOM time
- pause container has oom_score_adj of -998 (never killed by OOM)

##### 5. OOM kill constraint

```log
kernel: oom-kill:constraint=CONSTRAINT_MEMCG,...
```

`CONSTRAINT_MEMCG` confirms cgroup memory limit triggered the kill. The process with highest memory consumption (for same oom_score_adj) is chosen to be killed.

##### 6. Kubelet and container runtime response

```log
kubelet: Got sys oom event: &{11207 stress ...}
containerd: shim reaped
kubelet: SyncLoop (PLEG): ... Type:"ContainerDied" ...
```

Shows the kernel OOM kill being picked up by kubelet and container being removed by PLEG. ContainerID matches the cpuset in the kernel oom-kill line.

---

## Scenario 4: Use nsenter to debug pods
> 来源: ado-wiki-use-nsenter-to-debug-pods.md | 适用: 适用范围未明确

### 排查步骤

#### Use nsenter to debug pods

Author: jtenciocoto

#### Introduction

Sometimes we need to troubleshoot issues directly on AKS nodes and pods. We can make use of tools such as crictl and nsenter to perform a variety of tests.

For a detailed guide on crictl you can refer to this document:

- [Debugging Kubernetes nodes with crictl | Kubernetes](https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/)

The focus on this TSG will be using nstenter to perform tests from the container's namespaces.

#### Prerequisites

We must have access to the AKS nodes as all the tools needed are already present on them.
There are a few ways to get access to the AKS nodes, in this case I will be using node-shell and WSL. One more option is to use node debugger as per own public docs.

- <https://learn.microsoft.com/en-us/azure/aks/node-access>
- [kvaps/kubectl-node-shell: Exec into node via kubectl (github.com)](https://github.com/kvaps/kubectl-node-shell)
- [Install WSL | Microsoft Learn](https://learn.microsoft.com/en-us/windows/wsl/install)

First step is to list the nodes on your cluster.

```sh
kubectl get nodes
NAME                                STATUS   ROLES   AGE   VERSION
aks-agentpool-15332109-vmss000003   Ready    agent   8h    v1.25.6
akswinaks000003                     Ready    agent   8h    v1.25.6
```

Then, log into the node hosting the pod you want to debug.

```bash
kubectl node-shell aks-agentpool-15332109-vmss000003
```

#### Using crictl

Inside the node you have crictl at your disposal to check the pods running on the cluster.

```bash
crictl pods --namespace default
```

Get the container ID from the target pod:

```bash
crictl ps | grep <pod-name>
```

Inspect the container to get the PID:

```bash
crictl inspect <container-id> | grep -i 'pid'
```

The PID we need will be always the first value.

#### Leveraging nsenter

Use the PID to step into the container namespace:

**Check the container's IP address:**

```bash
nsenter -t <PID> -n ip a
```

**Check DNS configuration:**

```bash
nsenter -t <PID> -p -r cat /etc/resolv.conf
```

**Take a network capture:**

```bash
nsenter -t <PID> -n tcpdump
```

#### Conclusion

Both crictl and nsenter opens a new world of possibilities to further troubleshoot problems directly from the pod, and most of the times you will not have to install any additional software.

---

## 附录: Kusto 诊断查询

### 来源: arm-crp-tracking.md

# ARM 和 CRP 请求追踪查询

## 用途

追踪 ARM 请求进入 AKS RP 以及 AKS RP 调用 CRP 的请求链路。用于诊断计算资源操作问题。

---

## 查询 1: 查询 ARM 入站请求

### 用途
查看从 ARM 进入 AKS RP 的请求。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').IncomingRequestTrace
| where PreciseTimeStamp > ago(2d)
| where subscriptionID has '{subscription}'
| where correlationID has "{correlationId}"
| where httpMethod notcontains "GET"
| where operationName notcontains "unknown"
| project PreciseTimeStamp, operationName, suboperationName, targetURI, correlationID,
         operationID, region, msg, durationInMilliseconds, userAgent
```

---

## 查询 2: 查询 CRP 出站请求

### 用途
查看 AKS RP 调用 CRP 的请求（VMSS 操作）。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').OutgoingRequestTrace
| where TIMESTAMP >= ago(2d)
| where subscriptionID has '{subscription}'
| where correlationID contains "{correlationId}"
| where targetURI contains "vmss"
| extend provider = substring(targetURI, 95, strlen(targetURI))
| project PreciseTimeStamp, serviceRequestID, correlationID, provider, operationName,
         suboperationName, targetURI, statusCode, log
```

---

## 查询 3: 按时间范围查询出站请求

### 用途
查看特定时间范围内的所有出站请求。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').OutgoingRequestTrace
| where PreciseTimeStamp >= datetime({startDate}) and PreciseTimeStamp <= datetime({endDate})
| where subscriptionID has '{subscription}'
| where operationName !contains "GetManagedClusterHandler.GET"
| project PreciseTimeStamp, operationID, correlationID, operationName, suboperationName,
         targetURI, statusCode, durationInMilliseconds
```

---

## 查询 4: 查询 ARM EventServiceEntries

### 用途
查询 ARM 事件服务入口记录。

### 查询语句

```kql
cluster('https://armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where subscriptionId == "{subscription}"
| where resourceUri contains "{cluster}"
| where TIMESTAMP > ago(2d)
// | where status == "Failed"
| project PreciseTimeStamp, status, operationName, correlationId, properties
```

---

## 查询 5: 追踪完整请求链路

### 用途
使用 correlationID 追踪完整的请求链路。

### 查询语句

```kql
// Step 1: 查询 ARM 入站
let armIn = cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').IncomingRequestTrace
| where PreciseTimeStamp > ago(2d)
| where correlationID has "{correlationId}"
| project PreciseTimeStamp, Source="ARM_Incoming", operationName, operationID, targetURI, userAgent;
// Step 2: 查询 CRP 出站
let crpOut = cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').OutgoingRequestTrace
| where TIMESTAMP >= ago(2d)
| where correlationID contains "{correlationId}"
| project PreciseTimeStamp, Source="CRP_Outgoing", operationName, serviceRequestID, targetURI, statusCode;
// Step 3: 合并
armIn
| project PreciseTimeStamp, Source, operationName, ID=operationID, targetURI, Info=userAgent
| union (crpOut | project PreciseTimeStamp, Source, operationName, ID=serviceRequestID, targetURI, Info=tostring(statusCode))
| sort by PreciseTimeStamp asc
```

---

## 查询 6: 获取 serviceRequestID 用于 CRP 追踪

### 用途
获取 serviceRequestID 用于在 CRP 日志中进一步追踪。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').OutgoingRequestTrace
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionID has '{subscription}'
| where correlationID contains "{correlationId}"
| where targetURI contains "Microsoft.Compute"
| project PreciseTimeStamp, serviceRequestID, targetURI, statusCode
| take 10
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| correlationID | ARM 关联 ID，用于跨服务追踪 |
| operationID | AKS RP 操作 ID |
| serviceRequestID | CRP 服务请求 ID，用于追踪到 CRP 日志 |
| targetURI | 目标 URI |
| statusCode | HTTP 状态码 |

## 使用 serviceRequestID 追踪到 CRP

获取 `serviceRequestID` 后，可在 CRP 日志中追踪：

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP > ago(2d)
| where activityId == "{serviceRequestID}"
| project PreciseTimeStamp, message, traceLevel
```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照

---
