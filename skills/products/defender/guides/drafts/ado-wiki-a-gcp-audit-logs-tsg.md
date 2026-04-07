---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/[Product Knowledge] - GKE (Google Kubernetes Engine) connector/[TSG] - GCP Audit Logs"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2F%5BProduct%20Knowledge%5D%20-%20GKE%20(Google%20Kubernetes%20Engine)%20connector%2F%5BTSG%5D%20-%20GCP%20Audit%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GCP Audit Logs

## Overview

MDC periodically scans customers' Google Cloud Platform (GCP) environments for existing and newly created Google Kubernetes Engine (GKE) clusters.

If the audit logs auto-provisioning flag is enabled on the GCP connector, MDC automatically creates the necessary resources in the customer's environment for each detected cluster.

## Alert is not produced

**Ensure that the customer has enabled the Containers plan on their connector and that the audit logs auto-provisioning flag is also enabled.** Changes may take approximately 1 hour to take effect for existing connectors or up to 6 hours for newly created connectors.

Use the following Kusto query to verify if MDC is receiving data from a specific GKE cluster:

```kql
cluster('romeeus.eastus').database("ProdRawEvents").K8S_KubeAudit
| union cluster('romeuksouth.uksouth').database("ProdRawEvents").K8S_KubeAudit
| where ingestion_time() > ago(1h)
| where AzureResourceId has "securityConnectors"
| where AzureResourceId contains "gcp-clusters"
| where AzureResourceId contains "<customers-gke-cluster-name>"
```

* If the cluster cannot be located, open a support ticket with the IcM group "Defender CSPM/Defenders - CRIs".
* Otherwise, if we don't receive data, continue with the provisioning status check below.

## Check Provisioning Status

```kql
cluster('mdcentitystoreprodus.centralus').database("DiscoveryGcp").Ext_Container_Cluster_ProvisioningStatus
| union cluster('mdcentitystoreprodeu.westeurope').database("DiscoveryGcp").Ext_Container_Cluster_ProvisioningStatus
| where ingestion_time() > ago(18h)
| where ComponentName == ""
| where RecordNativeCloudUniqueIdentifier contains "<customers-gke-cluster-name>"
```

Additionally, check the status of the most recent pipeline provisioning for permission denials or quota limitations.

## Is GKE Cluster Discovered

If the cluster cannot be found in the above queries, check the entity store:

```kql
cluster('mdcentitystoreprodus.centralus').database("DiscoveryGcp").Container_Cluster
| union cluster('mdcentitystoreprodeu.westeurope').database("DiscoveryGcp").Container_Cluster
| where ingestion_time() > ago(18h)
| extend Identifier = tostring(RecordIdentifierInfo["RecordNativeCloudUniqueIdentifier"])
| where Identifier contains "<customers-gke-cluster-name>"
```

* Not found there → open support ticket to IcM group "Defenders - CRIs"
* Found there → open support ticket to IcM group "RomeDetection/CustomerSupport"

## TSG Queries

### Get trace errors with related operations

```kql
let Lookback = 1h;
let ClusterName = "sf-detection-prod-cus";
cluster('Rome').database('DetectionLogs').ServiceFabricIfxTraceEvent
| where env_time > ago(Lookback)
| where applicationName == "fabric:/MultiCloudK8sOnboardingApp"
| where clusterName == ClusterName
| where serviceName == "fabric:/MultiCloudK8sOnboardingApp/GcpK8sOnboardingService"
| parse env_cv with "##" rootOperationId "_" *
| join kind=inner
    (
    cluster('Rome').database('DetectionLogs').ServiceFabricDynamicOE
    | where env_time > ago(Lookback)
    | where applicationName == "fabric:/MultiCloudK8sOnboardingApp"
    | where clusterName == ClusterName
    | where serviceName == "fabric:/MultiCloudK8sOnboardingApp/GcpK8sOnboardingService"
    ) on rootOperationId
| project env_time, rootOperationId, message, operationName, customData, durationMs
```

### Get Security Connector

```kql
let KustoCluster = "Ascentitystoreprdus";
let projectNumber = "<projectId>";
cluster(KustoCluster).database('DiscoveryGcp').Internal_GcpSecurityConnector
| where RecordProviderInfo.HierarchyIdentifier == projectNumber
| summarize arg_max(TimeStamp, *)
| mv-expand offering=Record['offerings']
| extend IsContainersBundleEnabled = offering.offeringType == "DefenderForContainersGcp"
| where IsContainersBundleEnabled
| extend additionalData = offering.additionalData
| project IsContainersBundleEnabled,
    IsAuditLogsAutoProvisioned = additionalData.AuditLogsAutoProvisioningFlag,
    IsDefenderAgentAutoProvisoned = additionalData.DefenderAgentAutoProvisioningFlag,
    IsPolicyAutoProvisioned = additionalData.PolicyAgentAutoProvisioningFlag, offering, Record
```

### Get Latest Audit Logs Provisioning Status

```kql
let KustoCluster = "ascentitystoreprdus";
let TargetProjectNumber = "<projectId>";
let TargetGcpClusterName = "<GKEClusterName>";
let LookUpTime = 1d;
cluster(KustoCluster).database('DiscoveryGcp').Ext_Container_Cluster_ProvisioningStatus
| where TimeStamp > ago(LookUpTime)
| where ComponentName == "AuditLog"
| parse RecordNativeCloudUniqueIdentifier with "//container.googleapis.com/projects/" ProjectNumber "/" * "/clusters/" ClusterName
| where TargetProjectNumber == ProjectNumber and TargetGcpClusterName == ClusterName
| where ProvisioningStatus != 'InProgress'
| summarize arg_max(TimeStamp, *)
```

### Get Cluster Events Count in K8SKubeAudit

```kql
let KustoDB = "ProdRawEvents";
let LookUpTime = 1d;
let TargetGcpClusterName = "<GKEClusterName>";
let TargetProjectNumber = "<projectId>";
cluster('Rome').database(KustoDB).K8S_KubeAudit
| where Timestamp > ago(LookUpTime)
| where AzureResourceId contains "/gcp-"
| extend CloudResourceId = DataPipelineMetadata.CloudResourceId
| where CloudResourceId startswith "//container.googleapis.com"
| parse CloudResourceId with "//container.googleapis.com/projects/" ProjectNumber "/" * "/clusters/" ClusterName
| where ProjectNumber == TargetProjectNumber and ClusterName == TargetGcpClusterName
| summarize NumOfEventsRecieved=count()
```

### Get Cluster Alerts Count (Selector + Published)

```kql
// Alerts reaching selector
let TargetGcpProjectId = "<projectId>";
let TargetGcpProjectNumber = "<projectNumber>";
let TargetClusterName = "<clusterName>";
let LookUpTime = 7d;
let KustoDB = 'ProdAlerts';
cluster('Rome').database(KustoDB).SelectorAlerts
| where ingestion_time() > ago(LookUpTime)
| where CompromisedEntity startswith "gcp-clusters-"
| mv-expand entity = Entities
| where (entity.ProjectId == TargetGcpProjectId or entity.ProjectId == TargetGcpProjectNumber)
    and entity.ResourceName == TargetClusterName
| extend IsAlertFiltered = Metadata['AlertSelector.ShouldBePublished'] =~ 'False'
| summarize TotalNumOfAlertsRecieved = count(), NumOfAlertsFiltered = countif(IsAlertFiltered)
```
