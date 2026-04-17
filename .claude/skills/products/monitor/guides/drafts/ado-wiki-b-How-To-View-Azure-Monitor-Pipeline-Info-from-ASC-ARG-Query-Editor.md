---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Monitor Pipeline/How-To/How To View Azure Monitor Pipeline Info from ASC ARG Query Editor"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FMonitor%20Pipeline%2FHow-To%2FHow%20To%20View%20Azure%20Monitor%20Pipeline%20Info%20from%20ASC%20ARG%20Query%20Editor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How To View Azure Monitor Pipeline Info from ASC ARG Query Editor

## Overview

Here is a way to query Azure Resource Graph to gather information about the Azure Edge Pipeline Resource and related resources. This method will work in Azure Support Center as well as your own subscription after setting up a lab for Azure Monitor Pipeline.

## Process

Navigate to the subscription level in ASC and go to the *ARG Query Editor* tab.

## Combined Query

Using the Combined Query will allow you to run one query to get all the associated resources and some valuable information about the pipeline group resource.

**Notes:** This will only successfully run in ASC if all the resources are in the **Same Subscription**. If this query does not return any results you will need to use the separate query method below.

```kql
resources
| where type =~ "microsoft.monitor/pipelinegroups"
| project extendedLocation, properties, PipelineResourceId = id, Pipelinelocation = location
| extend pipelines=properties.service.pipelines, exporters = properties.exporters, routes = properties.networkingConfigurations[0].routes
| mv-expand pipelines, exporters, routes
| extend PipelineName=pipelines.name, Stream = exporters.azureMonitorWorkspaceLogs.api.stream, DCR = tostring(exporters.azureMonitorWorkspaceLogs.api.dataCollectionRule), dataCollectionEndpointUrl = tostring(exporters.azureMonitorWorkspaceLogs.api.dataCollectionEndpointUrl), extendedLocation = tostring(extendedLocation.name)
| project-away  properties, pipelines, exporters
| join kind=inner   (
    resources
    | where type contains "microsoft.insights/datacollectionrules"
    | extend DCR = tostring(properties.immutableId)
    | project DCRResourceId = id, DCR, DCRProperties = properties, DCRLocation = location)
    on DCR
| join kind=inner   (
    resources
    | where type contains "microsoft.insights/datacollectionendpoints"
    | project DCEResourceId = ['id'], dataCollectionEndpointUrl = tostring(properties.logsIngestion.endpoint), DCELocation = location, DCEpublicNetworkAccess = properties.networkAcls.publicNetworkAccess)
    on dataCollectionEndpointUrl
| join kind=inner   (
    resources
    | where type =~ "Microsoft.ExtendedLocation/customLocations"
    | project id, namespace = properties.namespace, hostResourceId = tolower(tostring(properties.hostResourceId))
    )
    on $left.extendedLocation == $right.id
| join kind= inner    (
    kubernetesconfigurationresources
    | where type =~ "microsoft.kubernetesconfiguration/extensions"
    | where properties.ExtensionType =~ "microsoft.monitor.pipelinecontroller"
    | project ClusterId = tolower(tostring(split(id, "/providers/Microsoft.KubernetesConfiguration/Extensions/")[0])), PrincipalId =identity.PrincipalId
    )
    on $left.hostResourceId == $right.ClusterId
| extend dataFlows = DCRProperties.dataFlows
| mv-expand dataFlows
| where dataFlows contains Stream
| extend DCRtransform = dataFlows.transformKql, outputTable = split(dataFlows.outputStream, "Custom-")[1], DCRdestinations = DCRProperties.destinations.logAnalytics
| project PipelineResourceId, Pipelinelocation, DCRResourceId, DCRLocation, DCEResourceId, DCELocation, DCEpublicNetworkAccess, DCRdestinations, outputTable, DCRtransform, routes, namespace, ClusterId, PrincipalId
```

### Result columns

| Column Name | Description |
|--|--|
| PipelineResourceId | Resource Id of the Pipeline Resource |
| Pipelinelocation | Region of the Pipeline Resource |
| DCRResourceId | Data Collection Rule Resource Id |
| DCRLocation | Region of the Data Collection Rule |
| DCRdestinations | Data Collection Rule Destinations (e.g., Log Analytics Workspace) |
| DCRtransform | The KQL Transformation from the Data Collection Rule |
| DCEResourceId | Data Collection Endpoint Resource Id |
| DCELocation | Region of Data Collection Endpoint |
| DCEpublicNetworkAccess | Does the Data Collection Endpoint allow for Public Access |
| outputTable | The destination table in the log analytics workspace |
| routes | The port that the cluster is expecting data on |
| namespace | The namespace for the Pipeline Extension on the Kubernetes Cluster |
| ClusterId | Resource Id of the Cluster hosting the custom namespace |
| PrincipalId | The Object Id of the Extension running on the Kubernetes cluster |

## Separate Queries

### Azure Edge Pipeline Resource

```kql
resources
| where type =~ "microsoft.monitor/pipelinegroups"
```

### Data Collection Rule

```kql
// get the immutableId from the properties of the Azure Edge Pipeline Resource
// Format: dcr-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
resources
| where type contains "microsoft.insights/datacollectionrules"
| where properties.immutableId =~ "<immutableId>"
```

### Data Collection Endpoint

```kql
// get the dataCollectionEndpointUrl from the properties of the Azure Edge Pipeline Resource
// Format: https://aep-azmon-pipeline-REGION-XXXXXXXXXXX-XXXX.REGION-1.ingest.monitor.azure.com
resources
| where type contains "microsoft.insights/datacollectionendpoints"
| where properties.logsIngestion.endpoint =~ "<dataCollectionEndpointUrl>"
```

### Custom Location and Cluster information

```kql
resources
| where type =~ "microsoft.kubernetes/connectedclusters"
| extend id = tolower(id)
| join kind=inner (
    kubernetesconfigurationresources
    | where type =~ "microsoft.kubernetesconfiguration/extensions"
    | where properties.ExtensionType =~ "microsoft.monitor.pipelinecontroller"
    | project ClusterId = tolower(tostring(split(id, "/providers/Microsoft.KubernetesConfiguration/Extensions/")[0])), ExtensionPrincipalId = identity.PrincipalId, ExtensionProperties = properties
    )
    on $left.id == $right.ClusterId
```

## Resources
- [Edge Pipeline Configuration](https://learn.microsoft.com/azure/azure-monitor/essentials/edge-pipeline-configure?tabs=Portal)
