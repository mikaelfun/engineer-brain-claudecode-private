---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Prometheus/How-To/Collect Managed Prometheus Logs from AKS Clusters"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Managed%20Prometheus/How-To/Collect%20Managed%20Prometheus%20Logs%20from%20AKS%20Clusters"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Collect Managed Prometheus Logs from AKS Clusters

## Overview

This script is an alternative to the log collection script at https://github.com/Azure/prometheus-collector/blob/main/internal/scripts/troubleshoot/README.md

**Prerequisites:**
- Customer must be able to use kubectl for the affected cluster
- Script has a dependency on jq

## Log Collection Script

```bash
#!/bin/bash

# TroubleshootError.sh
# Classifies the error type for AKS cluster related to Managed Prometheus

debuglogsDir="debuglogs"
if [ ! -d "$debuglogsDir" ]; then
    mkdir "$debuglogsDir"
fi

# Check jq dependency
if ! [ -x "$(command -v jq)" ]; then
    echo '"Please install jq and rerun the troubleshooting script".' >&2
    exit 1
fi

# Check ama-metrics replicaset pod
echo "Check whether the ama-metrics replicaset pod running correctly ..."
rsPod=$(kubectl get deployments ama-metrics -n kube-system -o json)
if [ -z "$rsPod" ]; then
    echo "ama-metrics replicaset pod not scheduled or failed to scheduled."
    exit 1
fi

rsPodStatus=$(echo $rsPod | jq '.status')
availableReplicas=$(echo $rsPodStatus | jq '.availableReplicas')
readyReplicas=$(echo $rsPodStatus | jq '.readyReplicas')
replicas=$(echo $rsPodStatus | jq '.replicas')

if [ $availableReplicas -ne 1 ] || [ $readyReplicas -ne 1 ] || [ $replicas -ne 1 ]; then
    echo "ama-metrics replicaset pod not scheduled or failed to scheduled."
    echo "Available: $availableReplicas, Ready: $readyReplicas, Total: $replicas"
    echo $rsPod | jq
    amaMetricsRsPod=$(kubectl get pods -n kube-system -l rsName=ama-metrics -o json)
    echo "status:" $(echo $amaMetricsRsPod | jq '.items[0].status.conditions')
    exit 1
fi

amaMetricsRsPod=$(kubectl get pods -n kube-system -l rsName=ama-metrics -o json)
podName=$(echo $amaMetricsRsPod | jq -r '.items[0].metadata.name')

# Collect replicaset pod logs
kubectl cp kube-system/$podName:/MetricsExtensionConsoleDebugLog.log -c prometheus-collector ./$debuglogsDir/MetricsExtensionConsoleDebugLog_${podName}.log
kubectl cp kube-system/$podName:/opt/microsoft/linuxmonagent/mdsd.qos -c prometheus-collector ./$debuglogsDir/mdsd_qos_${podName}.log
kubectl cp kube-system/$podName:/opt/microsoft/linuxmonagent/mdsd.info -c prometheus-collector ./$debuglogsDir/mdsd_info_${podName}.log
kubectl cp kube-system/$podName:/opt/microsoft/linuxmonagent/mdsd.warn -c prometheus-collector ./$debuglogsDir/mdsd_warn_${podName}.log
kubectl cp kube-system/$podName:/opt/microsoft/linuxmonagent/mdsd.err -c prometheus-collector ./$debuglogsDir/mdsd_err_${podName}.log

kubectl logs $podName -n kube-system -c prometheus-collector > $debuglogsDir/${podName}_promcollector.log
kubectl logs $podName -n kube-system -c addon-token-adapter > $debuglogsDir/${podName}_addontokenadapter.log

echo "ama-metrics replicaset pod running OK."

# Check ama-metrics-node daemonset
echo "Checking whether the ama-metrics-node linux daemonset pod running correctly ..."
ds=$(kubectl get ds -n kube-system --field-selector metadata.name=ama-metrics-node -o json)
dsItems=$(echo $ds | jq '.items | length')

if [ "$dsItems" -ne 1 ]; then
    echo "ama-metrics daemonset pod not scheduled or failed to schedule."
    exit 1
fi

dsStatus=$(echo $ds | jq '.items[0].status')
currentNumberScheduled=$(echo $dsStatus | jq '.currentNumberScheduled')
desiredNumberScheduled=$(echo $dsStatus | jq '.desiredNumberScheduled')
numberAvailable=$(echo $dsStatus | jq '.numberAvailable')
numberReady=$(echo $dsStatus | jq '.numberReady')

if [ "$currentNumberScheduled" -ne "$desiredNumberScheduled" ] || [ "$numberAvailable" -ne "$currentNumberScheduled" ] || [ "$numberAvailable" -ne "$numberReady" ]; then
    echo "ama-metrics daemonset pod not scheduled or failed to schedule."
    exit 1
fi

echo "ama-metrics daemonset pod running OK."

# Collect daemonset pod logs (max 15 pods)
iterationCount=0
maxIterations=15
podNames=$(kubectl get pods -n kube-system -l dsName=ama-metrics-node -o jsonpath='{.items[*].metadata.name}')

for podName in $podNames; do
    if [ "$iterationCount" -ge "$maxIterations" ]; then
        echo "Maximum iteration count reached ($maxIterations). Exiting loop."
        break
    fi

    kubectl cp kube-system/$podName:/MetricsExtensionConsoleDebugLog.log ./$debuglogsDir/MetricsExtensionConsoleDebugLog_${podName}.log
    kubectl cp kube-system/$podName:/opt/microsoft/linuxmonagent/mdsd.qos -c prometheus-collector ./$debuglogsDir/mdsd_qos_${podName}.log
    kubectl cp kube-system/$podName:/opt/microsoft/linuxmonagent/mdsd.info -c prometheus-collector ./$debuglogsDir/mdsd_info_${podName}.log
    kubectl cp kube-system/$podName:/opt/microsoft/linuxmonagent/mdsd.warn -c prometheus-collector ./$debuglogsDir/mdsd_warn_${podName}.log
    kubectl cp kube-system/$podName:/opt/microsoft/linuxmonagent/mdsd.err -c prometheus-collector ./$debuglogsDir/mdsd_err_${podName}.log

    kubectl logs $podName -n kube-system -c prometheus-collector > $debuglogsDir/${podName}_promcollector.log
    kubectl logs $podName -n kube-system -c addon-token-adapter > $debuglogsDir/${podName}_addontokenadapter.log

    ((iterationCount++))
done

# Zip logs
zipFileName="PROMETHEUS_DEBUGLOGS_$(date +%Y%m%d%H%M%S)_$(hostname)_$(whoami)_$(uuidgen | cut -c1-8)"
tar -czvf $zipFileName.tar.gz $debuglogsDir
echo "Contents of debuglogs directory zipped to $zipFileName."
```

## Key Log Files Collected

| Log File | Source Container | Purpose |
|----------|-----------------|---------|
| MetricsExtensionConsoleDebugLog.log | prometheus-collector | Metrics extension debug output |
| mdsd.qos | prometheus-collector | MDSD quality of service logs |
| mdsd.info | prometheus-collector | MDSD info level logs |
| mdsd.warn | prometheus-collector | MDSD warning level logs |
| mdsd.err | prometheus-collector | MDSD error level logs |
| promcollector.log | prometheus-collector | Prometheus collector container logs |
| addontokenadapter.log | addon-token-adapter | Token adapter container logs |

## Resources

- https://github.com/Azure/prometheus-collector/blob/main/internal/scripts/troubleshoot/README.md
