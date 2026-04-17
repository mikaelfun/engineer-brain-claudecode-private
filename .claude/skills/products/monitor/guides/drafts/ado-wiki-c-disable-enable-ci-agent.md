---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/How-To/How to Disable and Enable Container Insights Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/How-To/How%20to%20Disable%20and%20Enable%20Container%20Insights%20Agent"
importDate: "2026-04-06"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
---
This article will go over how to disable and then enable the Container Insights agent on supported clusters. One thing to note is that if the customer wishes to change the Log Analytics Workspace, they want to send data to the main method is disabling and then enabling the agent again targeted at the new workspace. 

# Disable/Uninstall Container Insights Agent
---
For disabling the agent the main method is via the Azure CLI.
## AKS Cluster
Replace the info after parameters '-n' and '-g' with the required information:
`az aks disable-addons -a monitoring -n MyExistingManagedCluster -g MyExistingManagedClusterRG`

## Arc-Enabled Cluster
Replace the info after parameters '--cluster-name' and '--resource-group' with the required information:
`az k8s-extension delete --name azuremonitor-containers --cluster-name <cluster-name> --resource-group <cluster-resource-group> --cluster-type connectedClusters`

- **If there are issues in disabling Container Insights**, in that the 'az aks disable-addons' Azure CLI command works but the pods are not deleted, follow this procedure for removal:
  - Check for existing deployments: `kubectl get deployment -n kube-system`
  - Check for existing ama-logs pods: `kubectl get pods -n kube-system | grep ama-logs`
- If the deployment or pods exist you can use the following commands to delete them
  - Delete deployment: `kubectl delete deployment DEPLOYMENTNAME`
  - Delete ama-logs pod: `kubectl get pods -n kube-system --no-headers=true | awk '/ama-logs/{print $1}' | xargs kubectl delete -n kube-system pod`

# Enable/Install Container Insights Agent
---
For enabling the agent this can be done via the Portal UI or via Azure CLI, please see the information listed below as well as in the resources section of this Wiki for more information:

## AKS Cluster
Azure CLI methods, replace parameters with the appropriate information:
```
### Use default Log Analytics workspace
az aks enable-addons --addon monitoring --name <cluster-name> --resource-group <cluster-resource-group-name>

### Use existing Log Analytics workspace
az aks enable-addons --addon monitoring --name <cluster-name> --resource-group <cluster-resource-group-name> --workspace-resource-id <workspace-resource-id>

### Private Cluster with Existing Log Analytics Workspace
az aks enable-addons --addon monitoring --name <cluster-name> --resource-group <cluster-resource-group-name> --workspace-resource-id <workspace-resource-id> --ampls-resource-id "<azure-monitor-private-link-scope-resource-id>"

### Enable with Legacy Authentication (UseAADAuth = False)
az aks enable-addons --addon monitoring --name <cluster-name> --resource-group <cluster-resource-group-name> --workspace-resource-id <workspace-resource-id> --enable-msi-auth-for-monitoring false
```
## Arc-Enabled Cluster
Azure CLI methods, replace parameters with the appropriate information:
```
### Use default Log Analytics workspace
az k8s-extension create --name azuremonitor-containers --cluster-name <cluster-name> --resource-group <resource-group> --cluster-type connectedClusters --extension-type Microsoft.AzureMonitor.Containers

### Use existing Log Analytics workspace
az k8s-extension create --name azuremonitor-containers --cluster-name <cluster-name> --resource-group <resource-group> --cluster-type connectedClusters --extension-type Microsoft.AzureMonitor.Containers --configuration-settings logAnalyticsWorkspaceResourceID=<workspace-resource-id>

### Use managed identity authentication (default as k8s-extension version 1.43.0)
az k8s-extension create --name azuremonitor-containers --cluster-name <cluster-name> --resource-group <resource-group> --cluster-type connectedClusters --extension-type Microsoft.AzureMonitor.Containers --configuration-settings amalogs.useAADAuth=true

### Use advanced configuration settings
az k8s-extension create --name azuremonitor-containers --cluster-name <cluster-name> --resource-group <resource-group> --cluster-type connectedClusters --extension-type Microsoft.AzureMonitor.Containers --configuration-settings  amalogs.resources.daemonset.limits.cpu=150m amalogs.resources.daemonset.limits.memory=600Mi amalogs.resources.deployment.limits.cpu=1 amalogs.resources.deployment.limits.memory=750Mi

### With custom mount path for container stdout & stderr logs
### Custom mount path not required for Azure Stack Edge version > 2318. Custom mount path must be /home/data/docker for Azure Stack Edge cluster with version <= 2318
az k8s-extension create --name azuremonitor-containers --cluster-name <cluster-name> --resource-group <resource-group> --cluster-type connectedClusters --extension-type Microsoft.AzureMonitor.Containers --configuration-settings amalogs.logsettings.custommountpath=<customMountPath>
```
**Note**: After enabling you can expect up to 15 minutes to start seeing all data.

# Resources
---
- [Enable Container Insights](https://learn.microsoft.com/azure/azure-monitor/containers/kubernetes-monitoring-enable?tabs=cli#enable-container-insights)
- [Disable Container Insights](https://learn.microsoft.com/azure/azure-monitor/containers/kubernetes-monitoring-disable#disable-container-insights)