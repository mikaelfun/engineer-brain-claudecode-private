---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Cluster Management/Microsoft.Flux Extension Installation TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FMicrosoft.Flux%20Extension%20Installation%20TSG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Extension Installation TSG

[[_TOC_]]

## Generic Extension Installation Failures

### Authentication with the Dataplane is Failing

There may be some issue in the authentication with the dataplane inside the `config-agent` that is causing all other calls to fail. Check the pod logs of the `config-agent` to look for the following log lines

> **Note:** You won't be able to use Kusto to find auth issues because this cluster will not even be able to push logs to the dataplane.

```bash
# If you see lines here, it means that the cluster was not able to retrieve an auth token
kubectl logs -n azure-arc config-agent-xxx -c config-agent --since 1d | grep "In clusterIdentityCRDInteraction status not populated"

# Logs here indicate the reason that the status is not populated is because we are unable to get the certificate from HIS and reflects some issue with HIS/identity
kubectl logs -n azure-arc clusteridentityoperator-xxx -c manager --since 1d | grep "Failed to get certificate from HIS with error"
```

```bash
# Looks for 401/403 lines here to indicate that the token we are using to communicate is not valid
kubectl logs -n azure-arc config-agent-xxx -c config-agent --since 1d | grep "GET configurations returned response code"
```

Some issues related to auth may reflect that the cluster identity no longer exists in Azure. Validate that the `connectedCluster` resource still exists in ARM with

```bash
az connectedk8s show -g <resource-group> -n <cluster-name>
```

If this returns a 404, recommend that the customer re-onboard to Azure with

```bash
az connectedk8s connect -g <resource-group> -n <cluster-name>
```

If not and the identity exists, there is some service issue and a CRI will need to be opened

### ExtensionConfig CRD Doesn't Exist

You can validate this by performing and looking for `extensionconfigs.clusterconfig.azure.com`

```bash
kubectl get crds
```

If you do not see this CRD on the cluster, recommend that the customer upgrade the cluster to re-install the ExtensionConfig CRD

```bash
az connectedk8s upgrade -g <resource-group> -n <cluster-name>
```

### Other Issues with Config Agent Apply of Extension Config

If there is not an auth issue in the `config-agent`, there is most likely some other issue with the parsing of some parameters when attempting to apply the `extensionconfig` to the cluster.

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] > ago(2d)
| where ArmId =~ "{armId}"
| where AgentName == "ConfigAgent"
| where LogLevel =~ "error"
```

```bash
kubectl logs -n azure-arc config-agent-xxx -c config-agent --since 1d
```

#### Extension Heartbeat

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1d)
| where Message contains "PostStatus Success"
| parse Message with "PostStatus Success" * "configName=extension:" name "," * "configKind=" type "," * "extensionType=" extensionType "," * "releaseTrain=" releaseTrain "," * "version=" extensionVersion "," *  "autoUpdate=" autoUpdate "," * "state=" installState 
| project type, extensionType, releaseTrain, extensionVersion, autoUpdate, installState, ArmId, Location, name
| where type == "Extension"
| summarize pingcount=count() by ArmId, name, extensionType, extensionVersion, Location, autoUpdate
```

### Extension API calls

#### Logs by extension instance name or ArmId

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1h)
| where Location == "{eastus2euap}"
| where RequestPath contains "extensions/<replaceyourinstancename>" or ArmId contains "yourclustername"
```

#### Logs by ARM CorrelationId or ClientRequestId

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1h)
| where Location == "{eastus2euap}"
| where CorrelationId == "{correlation_id}"  or ClientRequestId == "operation client request Id"
```

#### Table for all exceptions

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1h)
| where Location == "{eastus2euap}"
| where Message contains "{some_message}"
| where ClientRequestId  == "{client_Id}"
```

#### Finding ReleaseTrain based on ArmId

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where Message contains "ClusterConfigService.CreateExtensionDetails" and Message contains "{extensionType}"
| where RequestPath contains "{armId}"
```

### Agent Logs

#### Extension operator logs by extensionType

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1d)
| where AgentName contains "{openservicemesh}"
```

#### Extension operator logs by ArmId

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1d)
| where ArmId contains "{Arm_id}"
```

#### Failed extensions logs

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1d)
| where LogLevel =~ "Error" and AgentName contains "Appservice"
```

#### Successfully installed extensions by type

```bash
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1d)
| where Message contains "{Successfully installed the extension}" and Message contains "cassandradatacentersoperator"
```

**Note:** CorrelationID column can be used to query all related logs both Agent Side and Azure Services

### Partner TSGs

- [OSM Team TSGs](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/121602/TSG-OSM-Arc)

> **Note:** If unable to resolve issues, escalate to Microsoft.KubernetesConfiguration Team
