---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/How-To/How to get Container Insights Details from ASC & Azure Portal"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/How-To/How%20to%20get%20Container%20Insights%20Details%20from%20ASC%20%26%20Azure%20Portal"
importDate: "2026-04-06"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

::: template /.templates/Note-ASCGetPermissions.md
:::

[[_TOC_]]
# Instructions For ASC
---
In this section we'll retrieve information from Azure support Center. Useful for FQR investigation and investigation outside of customer call.

:::template /.templates/AzMon-OpenASCFromSupportRequest.md
:::

:::template /.templates/ASC-NavigateToResourceExplorer.md
:::

3. Navigate to your desired Azure resource using the left-hand navigation menu. If you have this sorted by Resource Provider, AKS Clusters are located under 'Microsoft.ContainerService/managedClusters'
[How to navigate to a resource in Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-navigate-to-a-resource-in-Azure-Support-Center)

4. The main tab for the AKS Cluster is the 'Managed Cluster' tab which contains a lot of information related to the Cluster as well as agent information:
![image.png](/.attachments/image-5951d61d-7a53-49f5-887b-bc36c6d7d61b.png)

- The '**LogAnalyticsWorkspace**' link when clicked will automatically load the ASC page for the Log Analytics Workspace the AKS Cluster is connected to, which will verify that the agent is setup on this cluster.

- The '**Properties**' tab has general cluster info such as the Resource ID, Region, AKS Version, etc.

    - Note: You can check the AKS version and match it up to [this doc](https://learn.microsoft.com/azure/aks/supported-kubernetes-versions?tabs=azure-cli) to verify that the AKS Cluster is on supported version. If it isn't the customer will need to update.

- The '**Addon Profiles**' section has the info related to the addon agents on the cluster which includes Container Insights:
![image.png](/.attachments/image-bc11f11d-c53e-49e7-967c-ea7d6102cc77.png)
    - The highlighted fields will show if it's enabled (if the entries are missing, Container Insights isn't enabled), the workspace it's connected to and whether the addon is using a Managed Identity.

- The '**Identity**' tab will show the info related to the Managed Identity that the agent is utilizing.
- The '**Private Link Profile**' will show if the cluster is a private cluster or not.

## Investigating Log Analytics Workspace
In this section we'll look at the linked Log Analytics Workspace.

- From the above section, you can click on the '**LogAnalyticsWorkspace**' link which will open a new tab for ASC with the Workspace.

- Some important things to check and obtain would be the resource information as well as seeing if there is a daily cap enabled:
![image.png](/.attachments/image-7654a3a7-3628-43a8-94c2-69ac8c5615c4.png)
    - In some instances, the customer might see data intermittently, in which case if a daily cap is set it's possible that they are meeting the daily cap which will cause this.
        - Note: If using the Free tier of the Log Analytics Workspace the cap is set to 500MB
    - Another good check is seeing if 'Public Network Access For Query' is Enabled/Disabled. If it's disabled and the customer issue is that no data is showing up on the Insights page, this would be expected **unless** the customer is on a machine that is in the same network as the AMPLS setup on the Workspace.

- If you click on the '**Agent Report**' tab this will show all the machines that are sending Heartbeats to the Workspace along with agent version (which will be AMA version for Container Insights) and the Solutions:
![image.png](/.attachments/image-ed382198-7c2e-411f-ade1-586ee886cd29.png)
    - In this example the machine name is my VMSS Instance where the AKS cluster is hosted on. It'll show it's using the latest AMA agent (which should indicate we're not using an old agent) and shows that the Container Insights solution is applied to it along with last Heartbeat.
    - If the time for the last Heartbeat is longer than 15 minutes ago, this may indicate some sort of issue sending data to the Workspace (possibly networking configuration).

- From the '**Solutions**' tab you can see the various tables that have data in them, the solutions on the workspace as well as the install date and when the last record was sent to the table:
![image.png](/.attachments/image-a11c4e8f-0afd-4015-adfa-abcd7d8faeab.png)
    - In this example I'm showing a couple of the Container Insights tables which show the solution was installed on 6/8/2023, the table such as ContainerLog and the last time data was sent to it. This can be helpful if the customer isn't seeing data in a particular table, and you can see when it last sent which might give a point in time when the issue started.

- From the 'Query Customer Data' tab you can run kusto queries on the Workspace, which is where we can do some investigative work for cases where ingestion is too high or just discovery queries to ensure the Container Insights agent is sending data to the Workspace:
![image.png](/.attachments/image-4b475338-0aaa-4819-bbfe-41324d107b4c.png)

- Some sample queries:
```
//Get last timestamp where cluster wrote to tables
search 'CLUSTERNAME'
| summarize max(TimeGenerated) by $table
```
```
//Get performance counters sent to workspace
InsightsMetrics
| where _ResourceId has 'CLUSTERNAMEORID'
| summarize max(TimeGenerated) by Name
```
```
//Get Kube events for ama-logs pods in case there are issues with the pods themselves that they are reporting
KubeEvents
| where _ResourceId has 'CLUSTERNAMEORID'
| where Namespace has 'kube-system'
| where Name has 'ama-logs'
| sort by TimeGenerated desc
```
```
//Get ama-logs pod info, useful to get ama-logs and ama-logs-rs info on whether they are running or not
//The ContainerName column shows the various containers running under ama-logs pod such as 'addon-token-adapter' for authentication and 'ama-logs' for agent
KubePodInventory
| where _ResourceId has 'CLUSTERORID'
| where Name has 'ama-logs'
| project TimeGenerated, ClusterId, Name, ContainerID, ContainerName, PodStatus
| sort by TimeGenerated asc
```

# Instructions for Portal
---
In this section we'll go through the portal UI to get information about the cluster.

