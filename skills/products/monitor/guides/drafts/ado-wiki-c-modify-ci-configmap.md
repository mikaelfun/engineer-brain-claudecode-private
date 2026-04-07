---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/How-To/Modify the Container Insights ConfigMap"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/How-To/Modify%20the%20Container%20Insights%20ConfigMap"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Instructions
---

# Overview
The Container Insights Agent can utilize a ConfigMap to modify various values of the agent to influence collection of data. This could include namespaces to collect stdout/stderr information from, environment variable collection, enabling multiline logs, etc. In this article we'll describe how to modify and apply a ConfigMap for use with the Container Insights Agent as per the link in the resources section.

# Process

1. Download the [template ConfigMap file](https://raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/kubernetes/container-azm-ms-agentconfig.yaml) and save the text in a text editor. Visual Studio code has extensions for yaml files for syntax highlighting.

2. In this example we'll edit the value `[log_collection_settings.env_var` which by default is true, this is the section in the ConfigMap:
```
       [log_collection_settings.env_var]
          # In the absense of this configmap, default value for enabled is true
          enabled = true
```

3. Change the value for enabled to false and then save the ConfigMap as `container-azm-ms-agentconfig.yaml`, this is important to ensure we're applying it to the Container Insights Agent.

4. For this part you'll want to connect to your AKS Cluster. This can be done in a few ways either via Azure Cloud Shell, a local shell logged into Azure, etc. For this example we'll use the Azure Cloud Shell. From your AKS Cluster click on the Connect button on the Overview blade and it will provide directions on how to login and connect:
![image.png](/.attachments/image-af95d925-ff49-43ac-a80a-c0d796a4f9ef.png)

5. Once connected upload your `container-azm-ms-agentconfig.yaml` to the Azure Cloud Shell:
![image.png](/.attachments/image-feabe465-3df0-486f-afb2-f02c135c8d47.png)

6. To apply your changes run the command `kubectl apply -f container-azm-ms-agentconfig.yaml`, this will update the configurations you specified in the ConfigMap and then the agent will perform a rolling restart to acquire the configuration.

7. To validate that the ConfigMap has been applied and the values you placed in there are applied you can run `kubectl get configmap container-azm-ms-agentconfig -n kube-system -o yaml`

# Resources
[Configure Container Insights ConfigMap](https://learn.microsoft.com/azure/azure-monitor/containers/container-insights-data-collection-configmap)
[Kubernetes | ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)