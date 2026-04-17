---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/Troubleshooting Guides/Container Insights Configuration TSGs/TSG Container Insights Missing Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FContainer%20Insights%2FTroubleshooting%20Guides%2FContainer%20Insights%20Configuration%20TSGs%2FTSG%20Container%20Insights%20Missing%20Logs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG Container Insights Missing Logs

## Scenario
Customer reports that all or partial Container Insights data is not visible in their Log Analytics workspace.

## Information Needed
- Resource ID of the affected AKS cluster

## Step 1: Determine Authentication Method
Check if using **Managed Identity** or **Legacy Authentication**:
- [How to check auth method](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1477183/HT-Check-if-Container-Insights-is-Using-Managed-Identity-or-Legacy-Authentication)

## Step 2: Review Configuration

### Managed Identity
Verify DCR is correctly associated with the AKS resource. DCR name prefix: `MSCI-XXXXXXX`.
- [Check DCR and DCR Association](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1477185/Check-DCR-and-DCR-Association-for-AKS-Cluster)

Key sections to verify in DCR:
- **Data Source**: Check `extensions` section for `ContainerInsightsExtension` settings (interval, namespaceFilteringMode, enableContainerLogV2)
- **Destination**: Check `logAnalytics` section for correct workspaceResourceId
- **Data Flows**: Check streams and destinations mapping

Also review ConfigMap (takes precedence over DCR):
```bash
kubectl get configmap ama-logs-rs-config -n kube-system -o yaml
```

### Legacy Authentication
No DCR present. Review ConfigMap:
```bash
kubectl get configmap ama-logs-rs-config -n kube-system -o yaml
kubectl get configmap container-azm-ms-agentconfig -n kube-system -o yaml
```

## Step 3: Determine Which Tables Are Missing
```kusto
search "<ResourceID>"
| summarize max(TimeGenerated) by $table
```

### Tables per Configuration Group
| Grouping | Tables |
|----------|--------|
| All (Default) | All standard container insights tables |
| Performance | Perf, InsightsMetrics |
| Logs and events | ContainerLog/ContainerLogV2, KubeEvents, KubePodInventory |
| Workloads/Deployments/HPAs | InsightsMetrics, KubePodInventory, KubeEvents, ContainerInventory, ContainerNodeInventory, KubeNodeInventory, KubeServices |
| Persistent Volumes | InsightsMetrics, KubePVInventory |

## Step 4: Validate Pod Status
Check ama-logs pod status and health.

## Step 5: Large Cluster Scenarios
In large clusters with many ama-log pods, gaps in Kube tables may appear.
- [TSG Missing Data in Kube Tables on Large Clusters](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1885470/TSG-Missing-Data-in-Kube-Tables-on-Large-Clusters)

## Step 6: Check Log Files
Review Container Insights agent logs for errors.

## Step 7: Check Network Connectivity
If communication issues found in mdsd files:
- [Check Network Connectivity](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/913124/Check-Network-Connectivity-for-Container-Insights)

## Step 8: Collect Logs
Ask customer to collect Container Insights logs using the automated tool:
- [How to collect logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/614028/How-to-collect-logs-for-Container-Insights)
