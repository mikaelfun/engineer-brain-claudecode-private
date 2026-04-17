---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Tools and Processes/AON Kusto Repo/NNF Kusto Repo"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FTools%20and%20Processes%2FAON%20Kusto%20Repo%2FNNF%20Kusto%20Repo"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Created by: Ralf Tseng/Andrei Ivanuta**
**<<<WIP>>>**
[[_TOC_]]

# Description

This page contains KQL queries for Nexus Network Fabric (NF) 

You can check the tables for everything related to NF resources: Network Fabric, NPB, L2D/L3D, CE, and so on. 

# How to access it
1. Prepare the followings:
   - SAW Device
   - Youbikey with PME account configured

2. Open browser on SAW to **[https://nf-prod-hub.eastus.kusto.windows.net/](https://nf-prod-hub.eastus.kusto.windows.net/)** 

3. NC databases are scattered on different regional clusters and the above link will lead you to a hub which connected to all clusters. 

   Hence, when you do the query, please use the following query against Entity groups: **<font color="2768F5"> Global </font>**. 

```k
macro-expand isfuzzy=true NetworkFabricEG as X (
X.<Table Name>
| Query
)
 ```
**Others:** You are not able to see what tables are available in the Entity Groups but you can follow [AON Kusto Repo - Overview](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2325970/AON-Kusto-Repo?anchor=hub-kusto-clusters.) to get that information.


# Single table query
Below are the queries executed on a per-table basis

##Resources
This table contains Azure Resource Notification (ARN) data collected for AON resources. It includes resource types such as Microsoft.NetworkFabric (NF RP). Please note that this resource table might not contain the information if there are no action applied on the resource so using Geneva action > Get Resource Details might be a good alternative to acquire the information. 
The events are composed based on resourcetype plus /write or /delete. This table contains all the recorded events for NNF RP

### Network Fabric resource types. 

```k
macro-expand isfuzzy=true NetworkFabricEG as X (
? ??X.Resources
? ??| where ?eventTime >= ago(30d)
? ??| project eventTime, armResource
? ??| extend resourceType =tostring(parse_json(armResource).type)
? ??| where resourceType !=""
)
| distinct resourceType
| sort by resourceType asc
```


### Network Fabric resources events
Historical Network Fabric ARM resource events with provisioningState,configurationState,?and administrativeState

```k
macro-expand isfuzzy=true NetworkFabricEG as X (
X.Resources  
| where eventTime ?> ago (30d) // (datetime({startDate})..datetime({endDate}))?//datetime?format?YYYY-MM-DD?HH:MM:ss
| where resourceId == "{Network Fabric ID}"
|?extend?parsedArm?=?parse_json(armResource)  
|?extend?provisioningState?=?tostring(parsedArm.properties.provisioningState)  
|?extend?configurationState?=?tostring(parsedArm.properties.configurationState)  
|?extend?administrativeState?=?tostring(parsedArm.properties.administrativeState)  
|?where?isnotempty(?provisioningState) 
) 
|?project?eventTime,eventType,?provisioningState,configurationState,?administrativeState,?armResource
````

##NfaDeviceStateChanges
This table contains the records of Network Device state. Logs state transitions and system messages from NFA devices


### Network Device State History records
Historical Network Fabric ARM resource events with provisioningState,configurationState,?and administrativeState

```k
macro-expand isfuzzy=true NetworkFabricEG as X ( 
X.NfaDeviceStateChanges  
| where PreciseTimeStamp ?> ago (30d) // (datetime({startDate})..datetime({endDate}))?//datetime?format?YYYY-MM-DD?HH:MM:ss
| where resourceId == "{Network Device ID}" ///subscriptions/{Sub ID}/resourceGroups/{RG Name}/providers/Microsoft.ManagedNetworkFabric/NetworkDevices/{Network Device Name}
| project PreciseTimeStamp,value,TIMESTAMP,deviceId,properties
)
````


#Multi table queries
### NNF RP tables 
Gather all events/traces/errors and HTTP/request records related to a particular NNF resource (or a specific correlationId) across multiple tables for troubleshooting and timelines.

```K
macro-expand isfuzzy=true NetworkFabricEG as X (
union X.Traces ,X.Span, X.Errors, X.APIValidationErrors,X.HttpIncomingRequests
| where PreciseTimeStamp ?> ago (30d) // (datetime({startDate})..datetime({endDate}))?//datetime?format?YYYY-MM-DD?HH:MM:ss
| where * contains "{resourceName}"//if correlation ID is not available
//| where correlationId == "{correlationId}" // If available
)| project PreciseTimeStamp ,env_name , correlationId,ActivityId, operationName,message