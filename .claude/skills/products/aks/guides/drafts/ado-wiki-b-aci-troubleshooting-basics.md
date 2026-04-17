---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] Troubleshooting Basics"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Troubleshooting%20Basics"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Basics

[[_TOC_]]

[Kusto Helper \| Jarvis (msft.net)](https://jarvis-west.dc.ad.msft.net/dashboard/ACC/Kusto%2520Helper)

In order to find whether a ContainerGroup deployment instance is on k8 or Atlas you just need to go to the second table in Kusto Helper titled **SubscriptionDeployments,** find the **SubscriptionDeploymentStart** that took place on the time of your incident (or before if you are investigating something that went wrong last) and look at the **clusterId** column of it.

If the cluster id looks like "**caas-prod-westus2-linux-55**" then the deployment is on **K8**, this will be the name of the cluster in our backend, and the node column to it's right will be the name of the node that the deployment is running on.

If the cluster id looks like "**caas-prod-westus2-atlas-azurecontainerinstance-13015978-0561-4f4c-bf5a-87b779ecd009**" then this is an **Atlas** deployed container group.

For **K8** deployments, most of the things you will need are in the kusto helper dashboard. For **Atlas** based deployments you will need to move on over to the [Atlas Kusto Helper \| Jarvis (msft.net)](https://jarvis-west.dc.ad.msft.net/dashboard/AzureSeabreeze/Seabreeze/Atlas%2520Kusto%2520Helper) in addition to the Kusto Helper dashboard.

## Kusto Helper

[Kusto Helper \| Jarvis (msft.net)](https://jarvis-west.dc.ad.msft.net/dashboard/ACC/Kusto%2520Helper)

Kusto helper dashboard is basically a bunch of very common kusto queries that we used to run in dashboard form.

Usually when investigating something you will start with 1 piece of information (like containerGroupName or correlationId) and plug it in the parameter filters at the top. Then as you investigate more and more you will get other pieces to plug in (like an activityId)

Here are the important tables that it has:

### Http Incoming

This is for seeing what the requests that came in were. Useful columns are correlationId and activityId. You can either grab them from an incoming request to follow through the traces in the other tables or grab from other tables to filter the incoming request to find the corresponding http request.

### SubscriptionDeployments

This is probably the most commonly needed table. Here you will find all operations that the ContainerGroup underwent, like start/stop/nodeassigned/deleted. Here you will find the clusterId column and clusterDeploymentName to be helpful. For **Atlas** deployments the **clusterDeploymentName** will be the Atlas resources' name. You will also find all kinds of metadata about the ContainerGroup here, like cpu, containers, restartPolicy, features, vnet, etc.

### SubscriptionDeploymentEvents

Here you will find the events that the ContainerGroup has on it. There are few tricky things about the way these events are presented.

The **TIMESTAMP** column is not when the event happened, but when our control plane created a log of this event.

The **firstTimeStamp** and **lastTimestamp** columns (same if event **count** is 1) will be corresponding to when the events actually happened.

The control plane does not stream the events from the backend into here, it is polling based. So you will see the same events multiple times (one for each poll), and there could be events that have happened that don't show up here, since we only poll during in progress operations like a deployment.

We log events that came from all incarnations of the containerGroup, so if the user uses the Stop/Start feature you will see a lot of events here since they are from all instances. You can use the **clusterDeploymentName** or **clusterId** columns to filter for the instance you want.

### Job Traces and Errors

These will be the traces and errors that are logged in our jobs. You filter these by **correlationId** or **activityId** to correlate with the other pieces. For example you can find consistency job logs from a deployment by using the correlationId seen on its SubscriptionDeploymentStart task seen in the SubscriptionDeployments table from above.

### Traces and Errors

Here you will find traces and errors that are logged in in our non job classes, like http controllers. You can use the **correlationId** of an httpIncoming request to see cluster selector logs and flighting computation. You can also investigate a 500 error code reponse to the http request by finding the exception logged here.

### Http Outgoing

This is similar to http incoming, but instead is the http calls that ACI control plane is sending out (to clusters, azure, Atlas, etc.)

## Atlas Kusto Helper

[Atlas Kusto Helper \| Jarvis (msft.net)](https://jarvis-west.dc.ad.msft.net/dashboard/AzureSeabreeze/Seabreeze/Atlas%2520Kusto%2520Helper)

Atlas Kusto Helper is similar to Kusto helper, but for Atlas instead of ACI RP. Similar to when investigating in Kusto helper, you will start with 1 piece of information (usually AppName) and plug it in the parameter filters at the top. Then you can find the clusterId deployment time, and Tenant which will get you logs from Atlas control plane and execution clusters.

Here are the tables that it has:

### Application Deployments

This will contain an entry for the app deployments that happen and their terminal status (Succeeded of Failed). You can grab the clusterId, Tenant, and optionally the PreciseTimeStamp for futher investigation. You also will have the full resourceId of the app which can be used in SbzExplorer to get to full exec cluster traces (History button).

### Atlas RP Traces

This will contain the Atlas control plane traces. Here you can find container json dumps from the application to see when things started to come up, or you can look at any failures that may have happened. You can find an **activityId** column which can be used to filter down to an activity. ActivityIds are in the form "**\|7a290331-4d61235d8e8894dc.**" and subActivity Ids will be denoted by items appended after a period like "\|7a290331-4d61235d8e8894dc**.a1b1c615\_**".

### Http Requests

This will be similar to ACI's, but instead of the correlationId and activityId in the guid format, there is only activityId in the above format to correlate with traces.

### Execution Cluster Traces

This will be the sf traces that we emit from the cluster. Fill in the **clusterId** and a short timespan (~30 mins) in order for this to load fast enough. Also fill in the **TraceTaskName**. For the task name "**Hosting**" is the most commonly needed when investigating, it will have all ContainerD interactions (eg find containerId and podId in OPodStarted and OnContainerCreated), container exits (**ApplicationContainerInstanceExited**), download/start errors, etc. You can also use the "**CRM**" task name to see plb operations to see if there are any moves. "**CM**" is another useful one to diagnose SF control plane issues during application create. For Hosting traces you can note the Node to know what node the instance was on.

### ContainerD Traces

These will be the containerD runtime traces. You can filter them once you put in clusterId (Node found in Exec cluster traces above are optional but makes query faster) and also a **ContainerDFilter** in the form of **containerId** or **podId** or **TraceId** (found in other containerd logged events).

## Contributor

[Migrated from PG Onenote] by <kegonzal@microsoft.com>

## Owner and Contributors

**Owner:** Kenneth Gonzalez Pineda <kegonzal@microsoft.com>
