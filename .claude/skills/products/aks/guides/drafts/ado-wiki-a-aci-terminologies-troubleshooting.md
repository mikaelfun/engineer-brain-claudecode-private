---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/ACI Terminologies for Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FACI%20Terminologies%20for%20Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ACI Terminologies for Troubleshooting

[[_TOC_]]

## Purpose  

We created this document to familiarize the ACI Support team with some of the commonly used terminologies related to Azure Container Instances (ACI) used during the investigation of issues related to containers deployed in the ACI Platform.  

## Container Group Name (CG Name)  

A container group is a collection of containers that get scheduled on the same host machine. The containers in a container group share a lifecycle, resources, local network, and storage volumes. It's similar in concept to a pod in Kubernetes.

How to get the Container Group Name: customer should provide the complete resource URI for the Container Group from the portal.

## Cluster Deployment Name (caas name)  

Cluster deployment refers to the active instance of a Container Group. There is only one active instance at a time. Execution cluster logs require the cluster deployment name (e.g., caas-xxx) as a reference.

### Using Kusto Helper  

Open [Kusto Helper](https://portal.microsoftgeneva.com/dashboard/ACC/Kusto%20Helper) and update SubscriptionId, resourceGroup and containerGroup values. Get the corresponding cluster Deployment name from 'subscription Deployments' widget (task 0 must match).

### Using Kusto Query

```sql
let BT = datetime(2023-04-14);let ET = datetime(2023-07-16);
let resURI = '/subscriptions/<<sub id>>/resourcegroups/<<rg name>>/providers/Microsoft.ContainerInstance/containerGroups/<<cg name>>';
cluster('accprod').database("accprod").SubscriptionDeployments
|where PreciseTimeStamp between (BT ..ET)
|where subscriptionId =~ split(resURI, "/")[2] and resourceGroup =~ split(resURI, "/")[4] and containerGroup =~ split(resURI, "/")[8]
|project PreciseTimeStamp,TaskName,clusterDeploymentName,containers,features,restartPolicy,ipAddress
```

> Tip: Choose the correct cluster deployment name matching the customer's reported timestamp. Name shown as caas-xxxx.

## Execution Cluster (Service Fabric Cluster) ID  

ACI RP leverages the Atlas platform. Each regional Atlas platform comprises hundreds of Service Fabric Clusters (execution clusters).

### From Atlas Helper

Open [Atlas Kusto Helper](https://portal.microsoftgeneva.com/s/7892D386) and update the cluster deployment name under 'AppName'. Check the clusterId under the Application Deployments widget.

### From Kusto Query

```sql
let caasname ='caas-8344afa1f75f452b8b179eea74439e5f';
let BT = datetime(2023-07-14);let ET = datetime(2023-07-15);
cluster('sflogs').database('telemetry').ApplicationDeploymentStartedEvent 
|where PreciseTimeStamp between (BT .. ET)
| join kind=leftouter (cluster('sflogs').database('telemetry').ApplicationProvisioningTerminalEvent | where PreciseTimeStamp between (BT .. ET)) on resourceId, Tenant
| where resourceId has caasname
| project PreciseTimeStamp, Tenant,appStatus, poolId , clusterId, resourceId
```

## Single Instance Name

The corresponding running application in the execution cluster is called Single Instance.

### From Kusto Query

```sql
let caasname= 'caas-8344afa1f75f452b8b179eea74439e5f'; let poolname = '/pools/aci/clusters/60120f48a7cc48caa3586c1c4fc6b096-p-0';
let BT = datetime(2023-07-14);let ET = datetime(2023-07-15);
cluster('sflogs').database('telemetry').SbzExecSFEvent
|where PreciseTimeStamp between (BT .. ET)
| where TaskName == "Hosting"
| where Message has caasname
| parse EventMessage with stuff "Entity={ Id=" SingleInstanceName ",ApplicationName=fabric:/" appName ",InstanceId=" instanceid
| where appName =~ caasname
| where SingleInstanceName !contains "servicePkg"
| distinct SingleInstanceName
```

## ACI Features Acronyms (Key)

- **BYOVNet**: Bring Your Own VNet deployment
- **Atlas**: Service Fabric based ACI platform
- **JobContainerGroup**: Container with restart policy Never/OnFailure
- **LogUploader**: Log Analytics workspace integration via Key
- **ManagedIdentity**: MSI for container identity
- **AzureFileVolume**: Azure Files volume mount
- **BigContainerGroups**: CGs with >16GB memory (subscription-enabled)
- **Confidential**: Confidential containers feature
- **DNSNameLabel**: Custom DNS name for public CG
- **EmptyDirVolume**: Ephemeral in-memory volume
- **GPU**: K8S-based (preview only)
- **InitContainers**: Initialization containers
- **L1VH**: Bare metal VM child resource hosting
- **MultiProtocols**: TCP and UDP enabled
- **Spot**: Spot/preemptible containers
- **UDP**: UDP protocol support
