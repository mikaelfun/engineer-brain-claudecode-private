---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Monitoring/Disable Environment Variables Globally on AKS"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FDisable%20Environment%20Variables%20Globally%20on%20AKS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Disable Environment Variables Globally on AKS

Azure Monitor for containers collects stdout, stderr, and environmental variables from container workloads deployed to managed Kubernetes clusters from the containerized agent. You can configure agent data collection settings by creating a custom Kubernetes ConfigMaps to control this experience.

## Steps

1. **Download the ConfigMap file**:
   https://github.com/microsoft/OMS-docker/blob/ci_feature_prod/Kubernetes/container-azm-ms-agentconfig.yaml

2. **Modify the setting** — change:
   ```yaml
   [log_collection_settings.env_var]
     enabled = true
   ```
   to:
   ```yaml
   [log_collection_settings.env_var]
     enabled = false
   ```

3. **Apply the ConfigMap**:
   ```bash
   kubectl apply -f <FileName>
   ```

4. **Restart the OMS agent pods** to pick up the new config:
   ```bash
   kubectl delete pods -n kube-system -l component=oms-agent
   ```

5. **Verify** by running a Log Analytics query:
   ```kusto
   ContainerInventory
   | where TimeGenerated > ago(15m)
   | summarize count() by EnvironmentVar
   ```
   Go to AKS Cluster → Logs and run the query.

## Disable for a Single Container

To disable environment variables on one container only, follow:
https://docs.microsoft.com/bs-latn-ba/azure/azure-monitor/insights/container-insights-manage-agent#how-to-disable-environment-variable-collection-on-a-container

## References

- https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-agent-config

## Point of Contact

Ammar AbdlQader (amabdlqa@microsoft.com)
