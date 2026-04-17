---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] Kusto Helpers"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20Kusto%20Helpers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Kusto Helpers

[[_TOC_]]

Kusto Helpers are Jarvis Dashboards created by PG with predefined Kusto queries for easy troubleshooting. The first step to use them is to find out if the Container Group was deployed to a K8s cluster (legacy ACI implementation, rare) or to Atlas (new Windows-Service-Fabric based implementation of ACI).

## Determine K8s vs Atlas deployment

In order to find whether a ContainerGroup deployment instance is on k8 or Atlas you just need to go to the second table in Kusto Helper titled **SubscriptionDeployments**, find the **SubscriptionDeploymentStart** that took place on the time of your incident and look at the **clusterId** column:

- If the cluster id looks like `caas-prod-westus2-linux-55` → **K8s** deployment
- If the cluster id looks like `caas-prod-westus2-atlas-azurecontainerinstance-13015978-0561-4f4c-bf5a-87b779ecd009` → **Atlas** deployment

Alternatively, use the `Find out of ACI runs on K8s or Atlas` query in Kusto Repo ACI.

Before using: set your Jarvis profile to use **UTC time** instead of local machine time.

## Kusto Helper

[Kusto Helper | Jarvis](https://jarvis-west.dc.ad.msft.net/dashboard/ACC/Kusto%2520Helper)

### Key Tables

#### Http Incoming
See incoming requests. Useful columns: `correlationId`, `activityId`.

#### SubscriptionDeployments
Most commonly needed table. Shows all operations on the ContainerGroup (start/stop/nodeassigned/deleted). Contains `clusterId`, `clusterDeploymentName`, and full CG metadata (cpu, containers, restartPolicy, features, vnet, etc).

#### SubscriptionDeploymentEvents
Container Group events. **Important caveats:**
- `TIMESTAMP` column = when control plane logged the event, NOT when it happened
- Use `firstTimeStamp` and `lastTimestamp` for actual event timing
- Polling-based (not streamed), so same event may appear multiple times
- Use `clusterDeploymentName` or `clusterId` to filter to specific instance

#### Job Traces and Errors
Traces and errors from jobs. Filter by `correlationId` or `activityId`.

#### Traces and Errors
Traces and errors from non-job classes (HTTP controllers). Use `correlationId` to find cluster selector logs and 500 error exceptions.

#### Http Outgoing
HTTP calls ACI control plane sends out (to clusters, Azure, Atlas, etc).

## Atlas Kusto Helper

[Atlas Kusto Helper | Jarvis](https://jarvis-west.dc.ad.msft.net/dashboard/AzureSeabreeze/Seabreeze/Atlas%2520Kusto%2520Helper)

Similar to Kusto Helper but for Atlas layer. Start with AppName parameter.

### Key Tables

#### Application Deployments
App deployment entries with terminal status (Succeeded/Failed). Contains `clusterId`, `Tenant`, `PreciseTimeStamp`, and full `resourceId` for SbzExplorer.

#### Atlas RP Traces
Atlas control plane traces. ActivityIds format: `|7a290331-4d61235d8e8894dc.` SubActivity: `|7a290331-4d61235d8e8894dc.a1b1c615_`.

#### Http Requests
Similar to ACI's, uses `activityId` (not guid format) for correlation.

#### Execution Cluster Traces
SF traces from the cluster. Fill in `clusterId` and short timespan (~30 mins). Key **TraceTaskName** values:
- `Hosting` - ContainerD interactions, container exits, download/start errors
- `CRM` - PLB operations / container moves
- `CM` - SF control plane issues during application create

#### ContainerD Traces
ContainerD runtime traces. Filter by `clusterId` + optional Node + `ContainerDFilter` (containerId, podId, or TraceId).

## Direct Links from DfM

Direct links to Kusto Helpers with prepopulated metadata can be found in `Tools` menu in DfM quick launch toolbar.

## Owner and Contributors

**Owner:** Kenneth Gonzalez Pineda <kegonzal@microsoft.com>
