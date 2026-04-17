---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Tools and Processes/AON Kusto Repo/NC Kusto Repo"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FTools%20and%20Processes%2FAON%20Kusto%20Repo%2FNC%20Kusto%20Repo"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Created by: Ralf Tseng/Andrei Ivanuta**
**<<<WIP>>>**
[[_TOC_]]

# Description

This page contains KQL queries for Nexus Network Cloud (NC)
Refer to the tables to find complete data and records for Network Cloud (NC) resources. Each table schema is documented [here](https://eng.ms/docs/cloud-ai-platform/azure-edge-platform-aep/aep-edge/linux-edge-large/afoi-network-cloud/network-cloud-team-docs/doc/observability/overview) under **Data** > **Active Schemas**

# How to access it

1. Prepare the followings:
   - SAW Device
   - Youbikey with PME account configured
2. Open browser on SAW to https://ncprod-hub.eastus.kusto.windows.net/

3. NC databases are scattered on different regional clusters and the above link will lead you to a **Hub Cluster** which can forward the query to all clusters. 

   Hence, when you do the query, please use the following query against Entity groups: **<font color="2768F5"> NetworkCloudEG</font>**. 

 ```k
macro-expand isfuzzy=true NetworkCloudEG as X (
         X.<Table Name>
        | Query
  )
 ```
    
  _NetworkCloudAllEnvsEG will include the database for the deployment in the labs_

**Others:** You are not able to see what tables are available in the Entity Groups but you can follow [AON Kusto Repo - Overview](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2325970/AON-Kusto-Repo?anchor=hub-kusto-clusters.) to get that information.






# Single table query
Below are the queries executed on a per-table basis

##BareMetalMachineCrData
This table provides the view of Baremetal Machine (BMM) CR state. It is useful for investigating what occured to the BMM during process like BMM replace.

### BMM status
Query to check overall BMM statuses and conditions. 
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
 X.BareMetalMachineCrData
  | where ['time'] > ago (7d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
 | where clusterID contains " {ClusterName}"
 | where bmhMachineName =="{BMMName}"
 | extend conditions = parse_json(extract_json("$.conditions", status))
 | extend cordonStatus = tostring(extract_json("$.cordonStatus", status))
 | extend readyState = extract_json("$.readyState", status)
 | extend detailedStatus = extract_json("$.detailedStatus", status)
 | extend detailedStatusMessage = extract_json("$.detailedStatusMessage", status)
 | extend kubernetesVersion = extract_json("$.kubernetesVersion", status)
 | extend machineClusterVersion = extract_json("$.machineClusterVersion", status)
 | extend powerState = extract_json("$.powerState", status)
 | extend provisioningStatus = parse_json(extract_json("$.provisioningStatus",status))
)
| order by ['time'] asc
| project ['time'] , ['BMM Name']=name,readyState,detailedStatus,detailedStatusMessage,provisioningStatus, cordonStatus,powerState, machineClusterVersion, conditions//,status,crData,labels, annotations// Status, crData,labels,annotation can be used for advanced data analyses
```

###Check the BMM replace progress. 
Query will show at which stage the replace action halted. 
```k
macro-expand isfuzzy=true force_remote=true NetworkCloudEG as X (
  X.BareMetalMachineCrData
  | where TIMESTAMP >= datetime(2025-12-01T00:00:00) // Insert time right before BMM replace action triggered
  | where bmhMachineName == "{BMMName}" // Insert BMM name
  | extend status_json = parse_json(status)
| extend status_json = parse_json(status)
| mv-expand actionState = status_json.actionStates
| extend                       // Extend the status to gain more granularity
  actionType = actionState.actionType,
  correlationId = actionState.correlationId,
  startTime = actionState.startTime,
  endTime = actionState.endTime,
  status = actionState.status,
  message = tostring(actionState.message),
  stepStates = actionState.stepStates
| mv-expand stepState = stepStates
| extend        // Extend the stepStates field to include each individual step of BMM replace action
  stepName = stepState.stepName,
  stepStatus = stepState.status,
  stepStartTime = stepState.startTime,
  stepEndTime = stepState.endTime,
  stepMessage = tostring(stepState.message)
)
| project
  ['time'],
  actionType,
  correlationId,
  startTime,
  endTime,
  status,
  message,
  stepName,
  stepStatus,
  stepStartTime,
  stepEndTime,
  stepMessage
```


## ClusterCRMetadata <wip>
### Management Bundle Update History
Use this query to track condition updates

```k
let ClusterName = 'stg02-if6otjruu5ov4';
macro-expand isfuzzy=true NetworkCloudEG as X (
X.ClusterCRMetadata
| where clusterManagerName contains "staging"
| where Metadata contains " {ClusterName}"
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| extend status = parse_json(tostring(Status))
| project TIMESTAMP, ClusterName, actionStates = status.actionStates, conditions = status.conditions, managementBundleUpdateHistory = status.internalMetadata.managementBundleUpdateHistory
)
```

##ClusterManagerTraces
This table provides logs for the cluster-operator and its controllers involved in Cluster deployment, upgrade, hardware validation, and other customer operations


###Verify the result of Hardware validation report
If the hardware validation is failed, you can find the records via this query.
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.ClusterManagerTraces
| where TIMESTAMP > ago (7d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| where originalRecord contains "{BMMName}"
| where message contains "validationOutcome is fail" // To filter out the particular HWV contained failed checks. 
//| where message contains "summarytest" // To filter out ALL HWV results.
| project TIMESTAMP, message
)
```

### CMBU correlation IDs
Use this query to find correlation IDs
```k 
macro-expand isfuzzy=true NetworkCloudEG as X (
X.ClusterManagerTraces
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| where * contains "clusterManagementBundleUpdate-"
| where clusterManagerName contains "{ClusterMangerName}"//Filter for specific CM Name
| where clusterName contains "{ClusterName}"//Filter for specific Cluster Name
)
| project ['time'], correlationID,clusterManagerName, clusterName, message
```

### CMBU Phases
Use this query to track CMBU trough different stages. Each phase is logged with`Phase X: <starting/finishing> <phase_name>`and can be queried.

```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.ClusterManagerTraces
| where TIMESTAMP > ago (7d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| where * contains "{ClusterName}"
| where caller contains "cluster_controller_cluster_update"
| where message contains "Phase"
| project TIMESTAMP, message, caller, ContainerImage, originalRecord
)
```

### CMBU Cluster extension version in logs 
This query allows to check for the new cluster images being used. 
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.ClusterManagerTraces
| where TIMESTAMP > ago (7d) // (datetime({startDate})..datetime({endDate})) //datetime format YYYY-MM-DD HH:MM:ss
| where * contains "{ClusterName}"
| where caller contains "main"
| where message contains "Operator's Parameters"
| project TIMESTAMP, message, caller, ContainerImage, originalRecord
)
```

### Successfully installed extension versions in logs

```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.ClusterManagerTraces
| where TIMESTAMP > ago (7d) // (datetime({startDate})..datetime({endDate})) //datetime format YYYY-MM-DD HH:MM:ss
| where * contains "{ClusterName}"
| where message contains "successfully updated"
| where caller contains "cluster_controller_cluster_update"
| project TIMESTAMP, message, caller, ContainerImage, originalRecord
)
```



## CmbuCRMetadata  Contains Cluster Manager Bundle Upgrade resource data 

### CMBU concurrency status
Use this query to review CMBU concurrency status
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.CmbuCRMetadata
| where clusterManagerName contains "{ClusterManagerName}"
//| where * contains "{ClusterName}" //Filter for specific clusters.
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| project TIMESTAMP, clusterManagerName, CurrentVersion, DesiredVersion, ReadinessStatus, UpdateCounters, UpdateStartTime
)
```





##CustomerKubernetesContainers 
It has on-prem container logs that are made available to customer.
Logs are sent to the CustomerKubernetesContainers log event stream based on substrings in the K8s namespace, pod name or container name. The following subsections list the relevant substrings used for matching.
Namespaces sent to CustomerKubernetesContainers
*   calico-apiserver
*   calico-system

Pod names sent to CustomerKubernetesContainers
*   accelerated-bridge-cni
*   coredns
*   etcd
*   local-path--provisioner
*   multus
*   natterizer
*   ntp
*   routerizer
*   sriov
*   tigera

Container names sent to CustomerKubernetesContainers
*   mechanizer

## DataVolumeCrData
Contains CRdata for NAKS nodes and NexusVMs volumes

###Check DataVolumes controlled by CDI operator
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.DataVolumeCrData
| where ['time'] > ago (30d) // (datetime({startDate})..datetime({endDate})) //datetime format YYYY-MM-DD HH:MM:ss
| where name contains "{DataVolume}"
| extend Controller = parse_json(originalRecord).controller//Controler that is generating this trace. Helpful to narrow down where in the call flow there is an issue
| extend ControllerKind = parse_json(originalRecord).controllerKind
| extend host = parse_json(originalRecord).kubeEvent.source.host
| project ['time'], Controller,ControllerKind, name,creationTimestamp,status,annotations,crData
)
| order by ['time'] asc
```
##IDRACLogs
Contains DELL server IDRAC logs. 

### Check for BMM hardware errors (memory, CPU, interface, power supply)

```k
macro-expand isfuzzy=true NetworkCloudEG as X (
let HWFailureTerms = dynamic([
  "memory","cpu","nic","network","link","link down","network link is",
  "power","psu","power supply","fan","voltage","thermal","overheat","temperature",
  "disk","drive","hdd","ssd","raid","controller",
  "ecc","dimm","pcie","smart","degraded","error","failure"
]);
X.IDRACLogs
| where ['time'] > ago (30d) // (datetime({startDate})..datetime({endDate})) //datetime format YYYY-MM-DD HH:MM:ss
//| where clusterName == "{ClusterName}"
| where message contains "{BMM Node}"
| where message contains "SystemHealth"
| extend parse_message = tostring(parse_json(message).Message)
| extend Impacted_Node = tostring(parse_json(message).Node)
// Hardware failure OR filter across known components/terms
| where parse_message has_any (HWFailureTerms) or message has_any (HWFailureTerms)
)
| order by ['time'] desc
|project ['time'],Impacted_Node, parse_message, Original_message=message
```


##KubernetesEvents 
This table includes logs from[nc-kube-events](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_git/nc-kube-events).
This table records Kubernetes event logs for all undercloud resources, organized by Custom Resource (CR) kind. It is useful for tracing the sequence of events associated with any CR CRUD operation in the undercloud.


### Basic KubernetesEvents query. 
Standard query to start the investigation. 
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.KubernetesEvents
| where ['time'] > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
//| where clusterID contains "{undercloud cluster name/ID}"//Helpful filter to isolate the resource and avoid any CR name duplicate
| where * contains "{resourceName}" // A CR can be recreated multiple times with the same name. Each instance gets an 8character suffix, so filtering by name+suffix yields events for that particular instance only.
| extend host = parse_json(originalRecord).kubeEvent.source.host
| project ['time'], ['kind'], clusterName, name, reason, type, message, host, originalRecord
)
| order by ['time'] asc
```

### Check KubernetesEvents for Pod Disruption Budget blocking drain during upgrade

```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.KubernetesEvents
| where ['time'] > ago (30d) // (datetime({startDate})..datetime({endDate})) //datetime format YYYY-MM-DD HH:MM:ss
| where * contains "{NAKS BBane}"
| extend host = parse_json(originalRecord).kubeEvent.source.host
| where type != "Normal"
| where originalRecord contains "PodDisruptionBudget" or originalRecord contains "drain" or originalRecord contains "cordon" or originalRecord contains "evict"
| project ['time'], ['kind'], clusterName, name, reason, type, message, host, originalRecord
)
| order by ['time'] asc
```

###Validate NAKS is deleted
Confirm you can find the message like **"Cluster {NAKS Name-suffix} has been deleted**". If not, the deletion might not be completed successfully on under cloud. 

```k
macro-expand isfuzzy=true NetworkCloudEG as X(
X.KubernetesEvents 
| where ['time'] > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| where * contains "{NAKS Name}"
| where message contains "deleted"
|extendhost=parse_json(originalRecord).kubeEvent.source.host
|project['time'],['kind'],host,name,reason,message
)
```

##KubernetesContainers
This table catches all for logs coming from K8s containers not otherwise sent to an event stream. Unlike [CustomerKubernetesContainers](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2331175/NC-Kusto-Repo?anchor=customerkubernetescontainers-(wip)), it has container logs not made available to customer.

### Undercloud Arc agent 
Check KubernetesContainers for nc-aks-proxy and Arc agent errors
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.KubernetesContainers
| where ['time'] > ago (2d) // (datetime({startDate})..datetime({endDate})) //datetime format YYYY-MM-DD HH:MM:ss
| where clusterID contains "{ClusterName}"
| where originalRecord contains "nc-aks-proxy" or originalRecord contains "azure-arc"
| where originalRecord contains "error" or originalRecord contains "fail" or originalRecord contains "timeout"
| project ['time'], Node,PodName,ContainerName, Role, originalRecord
)
| order by ['time'] asc
```

### CDI operator and Importer logs
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.KubernetesContainers
| where ['time'] > ago (5d) // (datetime({startDate})..datetime({endDate})) //datetime format YYYY-MM-DD HH:MM:ss
| where clusterID contains "{ClusterName}"
| where ContainerImage contains"cdi" or ContainerImage contains "importer"
| where * contains "{Naks/Node/NexusVM name}"
| project ['time'], Node,PodName,ContainerName, Role, originalRecord
)
| order by ['time'] asc
```


###Validate whether the request was rejected by webhook and the reason of rejection
```k
macro-expandisfuzzy=trueNetworkCloudEGasX(
X.KubernetesContainers
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| where clusterID contains "{Nexus Cluster Name}"
| where originalRecord contains "rejected by webhook"
|projectTIMESTAMP,Node,Role,originalRecord
)
```

### Undercloud container controllers error
This query catches all errors for logs coming from K8s containers not otherwise sent to an event stream for dedicated tables. This query can be used as a starting point but requires addition filtering inputs.
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.KubernetesContainers 
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| where clusterName contains "{clusterName}" 
| extend orecord = parse_json(originalRecord) 
| where orecord.level contains "error" 
)
```


### Extension deploy job
The extension deployment job describes failures the extension faces to deploy the pods.
```k
macro-expand isfuzzy=true NetworkCloudEG as X ( 
X.KubernetesContainers 
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| where clusterName contains '<clusterName>' 
| where PodName contains "nc-platform-<underlay|cluster>-extension-deployment-job" 
| project TIMESTAMP, originalRecord 
)
```


### Cluster 1P extension installation
Failures for CMBU deploy of Azure Monitor, Defender, and Policy extensions.
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.KubernetesContainers 
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| where * contains "azure-monitor" or * contains "azure-defender" or * contains "azure-policy" 
| where * contains "{cluster_name}" 
| extend orecord = parse_json(originalRecord) 
| where orecord.level contains "error" 
| project TIMESTAMP, ContainerName, message = orecord.message, originalRecord 
)
```


###Validate NAKS is deleted
```k
macro-expandisfuzzy=trueNetworkCloudEGasX(
X.KubernetesContainers
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| where * contains "{NAKS Name}"
| where originalRecord contains "  Cluster has been deleted, disconnecting"
|projectTIMESTAMP,Node,Role,originalRecord
)
```
##LinuxAsmSyslog
This table contains logs from syslog from the BMM directly. We can use this table to identify whether the BMM was shutdown manually and identify its health.

###BMM shutdown event
```k
macro-expandisfuzzy=trueNetworkCloudEGasX(
X.LinuxAsmSyslog
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
|whereBMServerNamecontains"{BMMName}"
| where message contains "shutdown"
|projectTIMESTAMP,host,severity,ident,facility,message
)
```
### List potential hardware issue on BMM
```k
macro-expandisfuzzy=trueNetworkCloudEGasX(
X.LinuxAsmSyslog
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
|whereBMServerNamecontains"{BMMName}"
| where (message has "Hardware Error" or message has "mce") or severity == "err"
|projectTIMESTAMP,host,severity,ident,facility,message
)
```
### Identify the NTP syncup issue (NTP Leap alerts)
```k
macro-expandisfuzzy=trueNetworkCloudEGasX(
X.LinuxAsmSyslog
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
|whereBMServerNamecontains"{BMMName}"
|wheremessagecontains"nomajority"
|projectTIMESTAMP,host,severity,ident,facility,message
)
```

##MachineCrData
Contains CAPI machineCRs for NAKS nodes

###Query to check MachineCR for NAKS nodes
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.MachineCrData
| where ['time'] > ago (30d) // (datetime({startDate})..datetime({endDate})) //datetime format YYYY-MM-DD HH:MM:ss
| where name contains "{NAKS or Machine Name}"
| extend Controller = parse_json(originalRecord).controller//Controler that is generating this trace. Helpful to narrow down where in the call flow there is an issue
| extend host = parse_json(originalRecord).kubeEvent.source.host
| project ['time'], Controller,ControllerKind, name,creationTimestamp,status,annotations,crData
)
| order by ['time'] asc
```

##MachineDeploymentCrData
Contains CAPI Machine Deployment Cr data for NAKS nodes

###Query to check MachineDeploymentCrData for NAKS nodes
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.MachineDeploymentCrData
| where ['time'] > ago (30d) // (datetime({startDate})..datetime({endDate})) //datetime format YYYY-MM-DD HH:MM:ss
| where name contains "{NAKS or MachineDeployment Name}"
| extend Controller = parse_json(originalRecord).controller//Controler that is generating this trace. Helpful to narrow down where in the call flow there is an issue
| extend host = parse_json(originalRecord).kubeEvent.source.host
| project ['time'], Controller, name,creationTimestamp,status,annotations,crData, originalRecord
| where status contains "fail"
)
| order by ['time'] asc
```

##NexusAKSControlPlaneProxy
This table includes logs from nc-aks-cp-proxy. This is a tinyproxy deployed on the NASK CNI used to communicate with the NAKS CP nodes. 

###Check CNI ControlPlane proxy connectivity
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.NexusAKSControlPlaneProxy
| where ['time'] > ago(3d)//between (datetime(2025-07-16 09:29:39.000) .. datetime(2025-07-16T14:39:56.2773798))
| where clusterID contains "{undercloud cluster name}"
| where PodName contains "{CNI name}"
//| project ['time'], PodName, event,flow, ipaddress, port, originalRecord,PodKubernetesAnnotations
)
| order by ['time'] desc
```

##NexusAKSOperatorTraces
The NexusAKSOperatorTraces table includes logs from NAKS Cluster Operator ([nc-aks-operator](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_git/nc-aks?path=/nc-aks-operator)).

### Undercloud NAKS operator traces query
Logs for NAKS operator. Can help you isolate the issue to a specific controler.  
```k 
macro-expand isfuzzy=true NetworkCloudEG as X (
X.NexusAKSOperatorTraces
| where ['time'] > ago(3d)//between (datetime(2025-07-16 09:29:39.000) .. datetime(2025-07-16T14:39:56.2773798))
| extend Controller = parse_json(originalRecord).controller//Controller that is generating this trace. Helpful to narrow down where in the call flow there is an issue
//Where correlationID =="{correlationID}" //You can use the correlation ID to get an exact undercloud timestamp, but don't rely on it exclusively other operations may not include a correlation ID, and relevant logs could be missed.
| where * contains "{NAKS name}"
//| where * contains "failed"
//| where error !="null"
|project correlationID, ['time'],resourceID, Controller,message, error, originalRecord
)
```

### Nexus AKS Operator webhook validation
```k
macro-expand isfuzzy=true NetworkCloudEG as X
(
X.NexusAKSOperatorTraces
| where ['time'] > ago(3d)//between (datetime(2025-07-16 09:29:39.000) .. datetime(2025-07-16T14:39:56.2773798))
| where * contains "{NAKS name}"
| where error contains "admission webhook"
| where error contains "vkubernetescluster.kb.io"
| extend Controller = parse_json(originalRecord).controller//Controler that is generating this trace. Helpful to narrow down where in the call flow there is an issue
| extend ControllerKind = parse_json(originalRecord).controllerKind
|project correlationID, ['time'],caller, Controller,ControllerKind, message, error, originalRecord, subscriptionID, clusterID
)
| sort by ['time'] desc

```

##OnPremBMCloudInitLogs
The OnPremBMCloudInitLogs table includes logs about the bare metal machine bootstrap (rsyslog).

You can check use the following query to investigate the information during firmware update or replace action. 
```k
macro-expandisfuzzy=trueNetworkCloudEGasX(  
X.OnPremBMCloudInitLogs
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss  
|whereBMNodeNamecontains"{BMMName}"  
|whereclusterManagerName=="clusterManagerName"  
//|wheremessagecontains"ironic"  
//|wheremessagecontains"disk"  
|projectTIMESTAMP,BMNodeName,message,source  
)
```

###Define whether BMM has completed firmware upgrade
If BMM has outdated firmware version, it could take longer time to complete the RT upgrade. If you are investigating a long BMM RT upgrade case, you may use the following query to see whether BMM has firmware upgrade completed recently. 

The logs is `The server firmware is up to date`

```k
macro-expandisfuzzy=trueNetworkCloudEGasX(  
X.OnPremBMCloudInitLogs  
| where TIMESTAMP > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss  
|whereBMNodeNamecontains"{BMMName}"  
|wheresourcecontains"firmware"   
|projectTIMESTAMP,BMNodeName,message  
)
```

## PlatformOperatorTraces
This table contains logs form Platform Operator controllers. This is a good place to start for any BMM lifecycle, L2/L3 Network, CSN or any other cluster level resource investigation.

### BMM lifecycle
Starting query for BMM lifecycle controllers
```k 
macro-expand isfuzzy=true NetworkCloudEG as X
(
X.PlatformOperatorTraces
 | where TIMESTAMP > ago (1d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss  
 | extend Controller = parse_json(originalRecord).controller//Controler that is generating this trace. Helpful to narrow down where in the call flow there is an issue
 | where * contains "{BMMName}" // Insert BMM name
)
|project correlationID, ['time'],Controller, message, error, originalRecord
```

### BMM certificate rotation failure
Using the following query to define whether there is a certificate rotation failure
```k 
let vClusterID = "{ClusterID}";
let bmmid = "{BMM ID}";
let splitArray = split(bmmid, "/");
let bmmName = splitArray[array_length(splitArray) - 1];
macro-expand isfuzzy=true NetworkCloudEG as X (
X.PlatformOperatorTraces
| where logger == 'controllers/BareMetalMachine'
| where clusterID == vClusterID
| where TIMESTAMP > ago (1d) // (datetime({startDate})..datetime({endDate})) //datetime format YYYY-MM-DD HH:MM:ss 
| extend o = parse_json(originalRecord)
| extend bmm = tostring(o.name)
| where bmm == bmmName
| where message contains "certificate"
| project ['time'], message, error, level, originalRecord
| order by ['time'] asc
)
```


## Resources
This table contains Azure Resource Notification (ARN) data collected for AON resources. It includes resource types such as Microsoft.NetworkCloud (NC RP), Microsoft.HybridCompute (ARC for Servers RP), and Microsoft.Kubernetes (ARC for K8s). For more details see [Azure Resource Notification doc](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-cloud-native-and-management-platform/control-plane-bburns/azure-resource-notifications/azure-resource-notifications/home/getting-started)
[Kusto Tables and Views | Network Cloud Team Docs](https://eng.ms/docs/cloud-ai-platform/azure-edge-platform-aep/aep-edge/linux-edge-large/afoi-network-cloud/network-cloud-team-docs/doc/observability/kusto/tables-views)
The events are composed based on resourcetype plus /write or /delete. This table contains all the recorded events for NC RP


To list all recorded eventypes run this query:
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
 X.Resources
 | where eventTime > ago(30d)
 | project eventType
)
| distinct eventType
```


### Network Cloud resource types.

```k

macro-expand isfuzzy=true NetworkCloudEG as X (
 X.Resources
 | where eventTime >= ago(30d)
 | project eventTime, armResource
 | extend resourceType =tostring(parse_json(armResource).type)
 | where resourceType !=""
)
| distinct resourceType
| sort by resourceType asc
```

###BMM historical status 
This query helps you to list the historical status of a BMM device. 

```k
macro-expandisfuzzy=trueNetworkCloudEGasX(  
X.Resources  
|whereeventTime>ago(30d)//between(datetime(2026-02-0204:28:05.003)..now())  
|whereresourceId=="{BMM ResourceID}"    
//|whereresourceIdcontains"{BMMName}"//ThiscanworkifResourceIDisnotavailable  
|extendparsedArm=parse_json(armResource)  
|extendprovisioningState=tostring(parsedArm.properties.provisioningState)  
|extenddetailedStatus=tostring(parsedArm.properties.detailedStatus)  
|extenddetailedStatusMessage=tostring(parsedArm.properties.detailedStatusMessage)  
|extendpowerState=tostring(parsedArm.properties.powerState)  
|extendmachineClusterVersion=tostring(parsedArm.properties.machineClusterVersion)  
|extendcordonStatus=tostring(parsedArm.properties.cordonStatus)  
|extendreadyState=tostring(parsedArm.properties.readyState)  
|whereisnotempty(provisioningState)  
|projecteventTime,provisioningState,readyState,detailedStatus,detailedStatusMessage,powerState,cordonStatus,machineClusterVersion,resourceId,armResource  
)
```

###Cluster-wide usage of IPs, VLANs, and peer ASNs.
This query helps detect collisions involving IPs, VLANs, and peer ASNs across the cluster. 

```k
macro-expand isfuzzy=true force_remote=true NetworkFabricEG as X (
X.ResourcesSnapshot
| where eventTime >= ago(10d)// between (datetime(2026-02-02 04:28:05.003)..now())
| where resourceId contains "{SubscriptionID}" 
| where deleted == "False"
| where statusCode == "OK"
| where eventType contains "microsoft.managednetworkfabric/l3isolationdomains/internalnetworks"
| extend parsedArm = parse_json(armResource)
| extend fabricASN = parsedArm.properties.bgpConfiguration.fabricASN
| extend peerASN = parsedArm.properties.bgpConfiguration.peerASN
| extend ipv4ListenRangePrefixes = parsedArm.properties.bgpConfiguration.ipv4ListenRangePrefixes[0]
| extend ipv6ListenRangePrefixes = parsedArm.properties.bgpConfiguration.ipv6ListenRangePrefixes[0]
| extend vlanID = parsedArm.properties.vlanId
| extend connectedIpv4Subnets = parsedArm.properties.connectedIPv4Subnets[0].prefix
| extend connectedIpv6Subnets = parsedArm.properties.connectedIPv6Subnets[0].prefix
| extend InternalNetworkName = parsedArm.name
)| order by eventTime desc
| project InternalNetworkName,vlanID,connectedIpv4Subnets,connectedIpv6Subnets, peerASN,fabricASN,ipv4ListenRangePrefixes,ipv6ListenRangePrefixes
```



### NAKS resources events
Historical NAKS ARM resource write/delete events with provisioningState, detailedStatus and detailedStatusMessage. 
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.Resources
| where eventTime > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| where eventType startswith "Microsoft.NetworkCloud/kubernetesClusters"
| where resourceId == "{ResourceID}" 
// | where resourceId contains "{ResourceName}" // This can work if ResourceID is not available 
| extend subscriptionid = ParseSubscriptionId(resourceId)
| extend resourceName = armResource.name
| extend clusterId = armResource.properties.clusterId
| extend clusterName=split(clusterId, '/', 8)[0]
| extend resourceType=split(eventType, '/', 1)[0]
| extend createdAt = armResource.systemData.createdAt
| extend provisioningState = armResource.properties.provisioningState
| extend detailedStatus = armResource.properties.detailedStatus
| extend detailedStatusMessage = armResource.properties.detailedStatusMessage
| project eventTime,correlationId,eventType, resourceName, resourceType, provisioningState, detailedStatus, detailedStatusMessage, clusterName, armResource
)
| sort by eventTime asc
//| where detailedStatus != "" // To filter only for events that has a detailed status
```

### Check agent pool provisioning state from ARM snapshots
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.Resources
| where eventTime > ago (30d) // (datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss
| where eventType == "Microsoft.NetworkCloud/kubernetesClusters/agentPools/"
| where resourceId contains "<NAKS_NAME>"
| extend agentPoolName = armResource.name
| extend provisioningState = armResource.properties.provisioningState
| project agentPoolName, provisioningState,
  vmSkuName = armResource.properties.vmSkuName,
  nodeCount = armResource.properties.['count'], armResource
)
```


### Nexus Cluster resource events
Historical Cluster ARM resource write/delete events with provisioningState, detailedStatus, detailedStatusMessage and versions.
```k
macro-expandisfuzzy=trueNetworkCloudEGasX(  
X.Resources  
|whereeventTime>ago(30d)//(datetime({startDate})..datetime({endDate}))//datetimeformatYYYY-MM-DDHH:MM:ss  
| where resourceId == "{Cluster ID}" 
//|whereresourceIdcontains"{ResourceName}"//ThiscanworkifResourceIDisnotavailable  
|extendsubscriptionid=ParseSubscriptionId(resourceId)  
|extendresourceName=armResource.name  
|extendclusterId=armResource.properties.clusterId  
|extendclusterName=split(clusterId,'/',8)[0]  
|extendresourceType=split(eventType,'/',1)[0]  
|extendparsedArm=parse_json(armResource)  
|extendcreatedAt=armResource.systemData.createdAt  
|extendprovisioningState=armResource.properties.provisioningState  
|extenddetailedStatus=armResource.properties.detailedStatus  
|extenddetailedStatusMessage=armResource.properties.detailedStatusMessage  
|extendclusterVersion=tostring(armResource.properties.clusterVersion),afoManagementVersion=tostring(armResource.properties.internalMetadata.afoManagementVersion)  
|whereisnotempty(clusterVersion)  
|projecteventTime,correlationId,eventType,resourceName,resourceType,provisioningState,detailedStatus,detailedStatusMessage,clusterName,clusterVersion,afoManagementVersion,armResource  
)  
|sortbyeventTimeasc
```

### Display BMM readiness state chronologically
Given a time range, below query will show the readiness state of a BMM over time. 
1 : readyState = True
0 : readyState = False
```k
let['SubscriptionId']="{SubscriptionID}";
let['ARMID']=''; //leave this blank
let['BMMName']="{BMMName}";
let['ClusterName']="{CluserName}";
letendTime=datetime(2025-06-24T03:25:43Z); //insert end date time
letstartTime=datetime(2025-06-04T03:25:43Z); //insert start date time
let['BQ-NC_timeseries']=(){
macro-expandisfuzzy=trueNetworkCloudEGasX(
X.Resources
//|wheredeleted=="False"//Tomakesurewearenotlistingresourcesthathavealreadybeendeleted
|wherestatusCode=="OK"//Tolistonlyresourceswherethecreationrequestwasprocessedsuccessfully
|wherearmResource.idcontains['SubscriptionId']
|parsetostring(armResource.properties.clusterId)with*"/providers/Microsoft.NetworkCloud/clusters/"clusterName
)
};
['BQ-NC_timeseries']
|whereeventTimebetween(['startTime']..['endTime'])
|whereeventType=="Microsoft.NetworkCloud/bareMetalMachines/write"
|wherecase(
['ARMID']=="",clusterName==['ClusterName']andarmResource.name==['BMMName'],
tolower(tostring(armResource.id))==tolower(['ARMID'])
)
| extend provisioning_state = iff(tostring(armResource.properties.provisioningState) == "Succeeded", 1, 0)
|extendready_state=iff(tostring(armResource.properties.readyState)=="True",1,0)
| project eventTime, provisioning_state, ready_state
```

##VMOrchestration
Contains container logs for NAKS relatd undercloud pods: virt-launcher, virt-handler, virt-controller, virt-operator and virt-api 

###Query to check a VMI
```k
macro-expand isfuzzy=true NetworkCloudEG as X (
X.VMOrchestration
| where ['time'] >=ago(30d)// between (datetime(2026-01-26 16:07:40.022) .. now())
//| where * contains "{NAKS, VMI or virt-launcher name}" //Decide based on the investigation requirements
| project ['time'], Node,PodName, ContainerName,ContainerImage, message, severity,PodKubernetesLabels, onbehalfAnnotations, originalRecord
)
| order by ['time'] asc
```


#Multi table queries
<<<WIP>>>