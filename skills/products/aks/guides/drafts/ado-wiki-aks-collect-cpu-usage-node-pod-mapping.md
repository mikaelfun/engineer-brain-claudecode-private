---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Monitoring/Collect the CPU usage on Node and find the mapping relations"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FCollect%20the%20CPU%20usage%20on%20Node%20and%20find%20the%20mapping%20relations"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Collect the CPU usage on Node and find the mapping relations

## Summary

This guide provides multiple methods for collecting and analyzing CPU usage on AKS nodes, with techniques to map CPU consumption to specific pods/containers.

## Method 1: Collect Perf metrics from Log Analytics (Container Insights)

**Prerequisites**: Container Insights enabled on the AKS cluster.

1. In ASC, find the relevant LA workspace of the AKS cluster
2. Navigate to LA workspace → "Query Customer Data"
3. Use KQL to collect Perf metrics:

```kql
let clusterName = "<clusterName>";
let podName = "<podName>";
let namespaceName = "<namespaceName>";
let splictDeli = strcat(clusterName,"/");
KubePodInventory
| where ClusterId contains clusterName
| where Name contains podName and Namespace contains namespaceName
| extend container = tostring(split(ContainerName, "/")[1])
| distinct Name, container, ContainerName
| join
(
    Perf
    | where ObjectName == "K8SContainer" and CounterName contains "cpuUsageNanoCores"
    | extend ContainerName = tostring(split(InstanceName, splictDeli)[1])
    | extend millicore = CounterValue/1000000
)
on ContainerName
| summarize percentile(millicore, 95) by container, bin(TimeGenerated, 1m)
| sort by TimeGenerated asc
//| render timechart
```

**Note**: This method is helpful when analyzing deleted pods (Insights UI only shows existing containers).

## Method 2: Collect Perf metrics via script on specific node

Use the `podMetricsInNode.sh` script to collect real-time CPU/Memory metrics per pod on a specific node.

Script: https://raw.githubusercontent.com/SnoWolfT/code/main/podMetricsInNode.sh

## Method 3: Privileged debug pod + collect_cpu.sh

For detailed per-process CPU mapping on a node:

1. Deploy a privileged debug pod using a YAML manifest:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: debugger-<nodeName>
  labels:
    func: troubleshoot
    debug: node
spec:
  containers:
  - name: debugger
    image: mcr.microsoft.com/dotnet/runtime-deps:6.0
    stdin: true
    securityContext:
      privileged: true
    volumeMounts:
    - name: host-root-volume
      mountPath: /host
  volumes:
  - name: host-root-volume
    hostPath:
      path: /
  hostNetwork: true
  hostPID: true
  restartPolicy: Always
  nodeName: <nodeName>
```

2. Apply: `sed "s/<nodeName>/aks-userpool-xxx/g" debug.yaml | kubectl apply -f -`
3. Access node: `chroot /host && bash`
4. Create `collect_cpu.sh` script:

```bash
#!/bin/bash
DATE=`date +"%m%d_%H"`
(echo "++++++++++++++++++++++++++++";date;ps -eo pcpu,pmem,pid,pidns,comm,user,uid --forest | awk 'NR==1 {printf "hostname/podName\t";print $0} NR>1 {cmd="nsenter -t "$3" -u hostname 2>/dev/null"; cmd|getline output; close(cmd); printf "%s\t%s\n", output, $0}';echo "========CPU cores Usage:";mpstat -P ALL 2 1|grep Average) >> /tmp/collect_cpu_${DATE}
```

5. Schedule with crontab: `* * * * * /tmp/collect_cpu.sh`
6. Results show hostname/podName mapped to CPU/memory per process

**Key feature**: Uses `nsenter -t <PID> -u hostname` to map process PIDs to pod names.
