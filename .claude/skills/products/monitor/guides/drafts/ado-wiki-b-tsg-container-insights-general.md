---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/Troubleshooting Guides/Container Insights Configuration TSGs/TSG Container Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FContainer%20Insights%2FTroubleshooting%20Guides%2FContainer%20Insights%20Configuration%20TSGs%2FTSG%20Container%20Insights"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG Container Insights - General Troubleshooting

## Architecture
- ama-logs pod collects **Node level** logs (daemonset - one per node)
- ama-logs-rs pod collects **Cluster level** logs (replicaset - one per cluster)
- Fluent Bit tails logs for ContainerLog/ContainerLogV2 tables
- Fluentd collects data for other tables (ContainerInventory, KubeEvents, KubeNodeInventory, etc.)
- Container Insights collects stdout and stderr streams from workloads

## Preliminary Checks

### Determine Customer Issue Category
- Unable to onboard/offboard Container Insights
- Onboarded but no data in Log Analytics
- Too much data ingestion

### Check Container Insights in ASC/Portal
- Use Azure Support Center for initial data collection and investigation
- Use Azure Portal when troubleshooting with customer on call

### Other Checks
- Check [general limits & by-design FAQ](https://docs.microsoft.com/azure/azure-monitor/faq#container-insights)
- AKS service limits: engage AKS team for [quota issues](https://learn.microsoft.com/azure/aks/quotas-skus-regions#service-quotas-and-limits)
- If Insights page shows no data but LA workspace has data: check network isolation settings on LA workspace (public access for querying may be disabled)
- Windows node data not collected: check if port 10250 is open from the pod

## Onboard/Offboard Failure

### Check Agent Version
Verify [Container Insights Agent Version](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/611444/How-to-Disable-and-Enable-Container-Insights-Agent)

### Check Pod Status / Validate Onboarding
```bash
# Confirm CI enabled
az aks show -g RESOURCEGROUPNAME -n CLUSTERNAME

# Validate agent deployed
kubectl get ds ama-logs -n kube-system
kubectl get ds ama-logs-win -n kube-system  # Windows

# Check deployment status
kubectl get deployment ama-logs-rs -n kube-system
kubectl get deployment ama-logs-rs -n kube-system -o yaml

# Check all pods
kubectl get pods -n kube-system -o wide | grep ama-logs
```

### Check Networking Endpoints
Verify all required endpoints are reachable. If commands fail, customer may need to whitelist endpoints.

### Resolution
If latest version doesn't resolve: check pod status, gather logs via troubleshooting script. Can also delete and let pod redeploy:
```bash
kubectl delete pod PODNAME -n kube-system
```

## Not Seeing Data / Missing Logs
See [TSG No Data/Missing Logs](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/611452/TSG-No-Data-in-Log-Analytics-and-Missing-Logs-in-Container-Insights)

### Daily Cap Check
```kusto
_LogOperation | where TimeGenerated >= ago(7d) | search 'OverQuota'
```
If results returned, workspace is hitting daily cap. Also check the `Operation` table.

### ConfigMap Check
```bash
kubectl get configmaps container-azm-ms-agentconfig -o yaml -n kube-system
```

### Confirm ConfigMap Applied
```bash
kubectl get pods -n kube-system | grep ama-logs
kubectl logs PODNAME -n kube-system -c ama-logs
```

## Missing Metrics
- Platform metrics (not in 'insights.Container' namespace): owned by AKS team
- Only 'insights/container' namespace metrics are owned by Azure Monitor

## Live Logs Issues
- Private AKS Cluster: must be on same private network
- Data retained only for 5 minutes
- Charts don't support Pin to dashboard

### Live Logs Troubleshooting
```bash
kubectl top nodes
kubectl get nodes
kubectl get pods --all-namespaces
```
If commands work but live data doesn't display, capture HAR trace.

## Resources
- [Container Insights troubleshoot doc](https://docs.microsoft.com/azure/azure-monitor/containers/container-insights-troubleshoot)
- [Container Insights FAQ](https://docs.microsoft.com/azure/azure-monitor/faq#container-insights)
