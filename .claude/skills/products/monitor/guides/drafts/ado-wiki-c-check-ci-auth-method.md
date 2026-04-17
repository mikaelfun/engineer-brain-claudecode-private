---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/How-To/HT: Check if Container Insights is Using Managed Identity or Legacy Authentication"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/How-To/HT%3A%20Check%20if%20Container%20Insights%20is%20Using%20Managed%20Identity%20or%20Legacy%20Authentication"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Instructions
---

# Overview
The Container Insights Agent can authenticate to Azure in two primary ways, certificate based (legacy) authentication and Managed Identity authentication. The main difference is when using legacy authentication it uses certificates to authenticate (much like legacy Linux OMS Agent) to send data to Log Analytics and with Managed Identity authentication it uses the clusters managed identity to authenticate to Azure.

With Managed Identity authentication we also introduce the AMA concept of Data Collection Rules being used to acquire the agent configuration as well whereas legacy authentication does not use Data Collection Rules in its setup. This article will show you how to identify which identity the agent is using. 

**Note:** Managed Identity is only available for AKS Clusters as well as Arc-Enabled Kubernetes Clusters with the exception of _Azure RedHat Openshift_. ARO must use legacy authentication.

# Process
## Azure Portal
1. Navigate to your AKS Cluster Overview page and then select JSON View:
![image.png](/.attachments/image-39322bdb-0f68-467c-9ce1-bc1b0982ac72.png)

2. Find the section of the JSON called `addonProfiles` and locate the `omsagent` section, note that while Container Insights does use AMA this is still called omsagent for the time being:
![image.png](/.attachments/image-2f0f4a30-7c9d-42ea-804d-db7b03f4575c.png)

3. In the screenshot above you see the value `useAADAuth`, if this value states false or isn't present in the JSON this means the agent is using legacy authentication. To update you can use the link in the resources section. If it says true, then the agent is using Managed Identity authentication.

## Azure Support Center
1. In ASC, navigate to your AKS Cluster and find the `Addon Profiles` section:
![image.png](/.attachments/image-8625930b-bb6f-4abf-9258-127a68c8f1ac.png)

2. In the above screenshot there is a section called 'Omsagent Config Use AADAuth', if this value states false or isn't present this means the agent is using legacy authentication. To update you can use the link in the resources section. If it says true, then the agent is using Managed Identity authentication.

## Azure Resource Graph
```
resources
| where id has 'RESOURCEIDORNAMEOFCLUSTER'
| where type =~ "microsoft.containerservice/managedclusters"
| extend addonProfiles = parse_json(tolower(tostring(properties.addonProfiles))) 
| project id, name, type, location, identity, MonitoringAddonEnabled = tostring(addonProfiles.omsagent.enabled), LogAnalyticsWorkspace=tostring(addonProfiles.omsagent.config.loganalyticsworkspaceresourceid),  useAADAuth = tostring(addonProfiles.omsagent.config.useaadauth), enablePrivateCluster = tostring(properties.apiServerAccessProfile.enablePrivateCluster)
```
Explanation of data output:
- Column `MonitoringAddonEnabled` result will tell you if Container Insights is enabled or not via a true/false flag.
- Column `LogAnalyticsWorkspace` will give you the Resource ID of the Log Analytics Workspace it's supposed to be sending data to.
- Column `useAADAuth' result will tell you if the Container Insights agent is using Managed Identity or not via a true/false flag.
- Column 'enablePrivateCluster' will tell you if the AKS Cluster is private or not, which will come into play later.

# Resources
[Container Insights Authentication](https://learn.microsoft.com/azure/azure-monitor/containers/container-insights-authentication?tabs=portal-azure-monitor)