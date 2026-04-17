---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] How to find the VM id for a given ACI CG"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20How%20to%20find%20the%20VM%20id%20for%20a%20given%20ACI%20CG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG How to find the VM id for a given ACI CG

1. Get the clusterId
2. Search for the cluster on Seabreeze Explorer.
3. Click on Open SFX in Seabreeze Explorer
4. Search for the CAAS/APP id and in the left pane, drill all the way down and see if you can find the dev\_\<number\> node. Say \_dev_4
5. Then, you should be able to find \_dev_4 under nodes on left pane and in it's config, you can find the VM id.

## Alternative way with Kusto queries

1. This query will give you the application name used in service fabric for the container group deployed by the customer:

   ```kql
   cluster('accprod').database('accprod').SubscriptionDeployments
   | where TIMESTAMP >= ago(10d)
   | where TaskName contains "Succeeded"
   | where subscriptionId contains "{sub_ID}"
   | where resourceGroup contains "{rg_Name}"
   | where containerGroup contains "{cg_Name}"
   | project clusterDeploymentName
   ```

2. Grab that customer deployment name and find the clusterID on which the application is deployed:

   ```kql
   cluster('atlaslogscp.eastus').database('telemetry').ApplicationDeploymentStartedEvent 
   | where TIMESTAMP >= ago(10d)
   | where resourceId contains "{caas-xxxxx}"
   | project resourceId, clusterId
   ```

3. Once you know the cluster ID get the node on which the app is:

   ```kql
   cluster('atlaslogsamericas.eastus').database('telemetry').SbzExecSFEvent
   | where TIMESTAMP >= datetime(2022-12-09 13:45:44.426)
   | where AtlasRegion contains "WARP-Prod-AM"
   | where Role contains "d31962eb34dc434c8e098cfd8cbf48c2-p-0"
   | where TaskName contains "Hosting"
   | where Message contains "caas-xxxxxxxx"
   | distinct Role, RoleInstance
   ```

4. Substitute the clusterid and roleinstance below to get the VMID

   ```kql
   cluster("rdos.kusto.windows.net").database("rdos").GuestAgentGenericLogs
   where TIMESTAMP > ago(6h)
   | where ResourceGroupName contains "{rg_Name}"
   | where RoleInstanceName == "\_Dev_1"
   | distinct VMId
   ```

## Finding ClusterId

1. Find the Cluster Deployment Id / App Id.
2. Use it to get the ClusterId like the following:  

   ```kql
   cluster('atlaslogscp.eastus').database('telemetry').ApplicationDeploymentStartedEvent
   | where TIMESTAMP >= ago(2d)
   | where Tenant contains "WARP-Prod-BL"
   | where resourceId contains "caas-xxxxxxxxx"
   ```

## Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Kenneth Gonzalez Pineda <kegonzal@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
- Aritoki Takada <atakada@microsoft.com>
- pkc <pkc@microsoft.com>
