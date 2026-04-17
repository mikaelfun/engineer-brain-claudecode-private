---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/Troubleshooting Guides/Container Insights Configuration TSGs/TSG Container Insights Multi-Tenancy Logging Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FContainer%20Insights%2FTroubleshooting%20Guides%2FContainer%20Insights%20Configuration%20TSGs%2FTSG%20Container%20Insights%20Multi-Tenancy%20Logging%20Issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG Container Insights Multi-Tenancy Logging Issues

## Overview
Multi-tenancy logging allows the Container Insights agent to multi-home ContainerLogV2 data to different Log Analytics Workspaces based on namespace filtering in DCRs.

## Documentation
- [Multitenant managed logging in Container Insights (Preview)](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-multitenant)

## Troubleshooting Steps

### Step 1: Verify High Log Scale feature
```bash
kubectl get po -n kube-system | grep ama-logs
kubectl logs ama-logs-xxxxx -n kube-system -c ama-logs | grep high
# Expected: "Using config map value: enabled = true for high log scale config"
```

### Step 2: Verify ContainerLogV2 schema enabled
```bash
kubectl exec -it ama-logs-xxxxx -n kube-system -c ama-logs -- bash
env | grep AZMON_CONTAINER_LOG_SCHEMA_VERSION
# Expected: AZMON_CONTAINER_LOG_SCHEMA_VERSION=v2

# Check if enabled through DCR
grep -r "enableContainerLogV2" /etc/mdsd.d/config-cache/configchunks/
```

### Step 3: Verify multi-tenancy enabled
```bash
kubectl logs ama-logs-xxxxx -n kube-system -c ama-logs | grep multi_tenancy
# Expected: "config::INFO: Using config map setting multi_tenancy enabled: true..."
```

### Step 4: Verify DCRs and DCEs
```bash
az account set -s <clustersubscriptionId>
az monitor data-collection-rule association list-by-resource --resource "<clusterResourceId>"

# For each dataCollectionRuleId, check DCE association
az monitor data-collection-rule show --ids <dataCollectionRuleId>
```
Verify both `ContainerInsightsExtension` and `ContainerLogV2Extension` DCRs are associated.

### Step 5: Check if agent downloaded all DCRs
```bash
kubectl exec -it ama-logs-xxxxx -n kube-system -c ama-logs -- bash
grep -r "ContainerLogV2Extension" /etc/mdsd.d/config-cache/configchunks

# If no DCRs downloaded, check for network/firewall issues
cat /var/opt/Microsoft/linuxmonagent/log/mdsd.err
```

### Step 6: Check fluent-bit logs for errors
```bash
kubectl exec -it ama-logs-xxxxx -n kube-system -c ama-logs -- bash
cat /var/opt/Microsoft/docker-cimprov/log/fluent-bit-out-oms-runtime.log
```

## Known Issues
- Associating more than 30 ContainerLogV2 DCRs can cause data loss
