---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] Container taking long time to provision failing"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Container%20taking%20long%20time%20to%20provision%20failing"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Container taking long time to provision failing

Start with the AppName in Atlas Kusto Helper. Set the Time start to what you see in PreciseTimestamp and end time to 30 mins after the start.

If you see the appStatus as succeeded note that means the app succeeded deployment in your 30 minute window.

Put in the clusterId into the filter and set TraceTaskName to "Hosting" and go all the way down to the execution cluster traces.

## Hosting

Here you will see the Hosting traces. Look for any errors during a activation (errors like servicePackageHealth with errors not always error level). Regular hosting activation looks like:

```txt
PodName=SF-SP-00eec4fe-082c-412e-8ff8-1147a48e1797-132624791068855413
OnRunPodSandbox: AppName=fabric:/caas-098598e7ef6e4c32ae3c1ef2569a3999
Container SF-SP-00eec4fe-082c-412e-8ff8-1147a48e1797-132624791068855413
ContainerName=sf-6381-aa3280c2-99fd-4da5-bf03-f2456a9e933d_00eec4fe-082c-412e-8ff8-1147a48e1797
OnContainerCreated: AppName=fabric:/caas-098598e7ef6e4c32ae3c1ef2569a3999
OnContainerStarted: AppName=fabric:/caas-098598e7ef6e4c32ae3c1ef2569a3999
```

Note that there is only 1 pod for each ContainerGroup but if there are multiple containers you would need to see the Container traces for all the containers.

If you aren't seeing these events for all containers check to see if there are any init containers (eg the azure file mount or secret volume mount) that are failing with non-zero exit codes (**EventName: ApplicationContainerInstanceExited**). There is a bug in containerd packages before 105, where the exit code was not being set correctly causing the activation to get stuck in a Never restartPolicy.

You can also check to make sure the create/start is not running into any issues.

If you see some of the events but then they stop, this is due to a known containerd issue that is caused by it not handling restarting and reattaching correctly.

### ContainerD

If you see any containerD related errors you can use the containerid to start filtering the containerd logs and continuing the investigation there.

### CM/PLB/CRM

If you are not seeing any Hosting traces at all that means the app is not getting to any node at all. Looks for CM trace task name to see if app creation succeeded. IF so start looking at PLB and CRM task names (the single instance name from CM traces (eg: **SingleInstance_10**) can be used in the **TraceMessageFilter** as sometimes the app name is not logged. See if there is unplaced replica happening, this will be due to fragmentation issues and incorrect cluster selection.

### Gateway

If all of the above looks fine and the containers started and are running this is not an application issue. Start looking at the Gateway as we have seen issues there as well. Put in the Gateway actorkey (resourceId of it) in the AppName filter to look at the gateway traces on the RP. If you get to Deploying state but never to Running state this is likely due to a known issue that is fixed since our April release (the open method is crashing due to unhandled SF exceptions). Other gateway issues could be if it can't get a public ip or dns name, this will appear in the RP traces as an error.

## Investigation Flow Summary

1. **Atlas Kusto Helper** → check appStatus for caas-xxx name
2. **Hosting traces** → look for OnRunPodSandbox / OnContainerCreated / OnContainerStarted for all containers
   - Missing events → check init container exit codes (ApplicationContainerInstanceExited)
   - Partial events → containerd restart/reattach bug
3. **ContainerD logs** → if ContainerD errors found, filter by containerId
4. **CM/PLB/CRM traces** → if no Hosting traces at all → check placement (unplaced replica, fragmentation)
5. **Gateway traces** → if containers running but never reach Running state → check Gateway actorkey on RP

## Contributor

[Migrated from PG Onenote] by <kegonzal@microsoft.com>

## Owner and Contributors

**Owner:** Kenneth Gonzalez Pineda <kegonzal@microsoft.com>
