---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender CSPM/[TSG] - Agentless Secret Scanning"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20CSPM/%5BTSG%5D%20-%20Agentless%20Secret%20Scanning"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Secret Scanning on Deployment Templates (ARM and Multi-cloud)

## Overview

Secret scanning in ARM and multi-cloud deployments identifies sensitive information within cloud infrastructure components. The control plane secret scanning pipeline consists of:

1. **Azure Discovery Service / Multi-Cloud Discovery Service**: Collects payloads of resources to scan, ingested into EntityStore.
2. **Control Plane Data Analysis (CPDA)**: Backend service running the secret scanning engine on collected payloads.
3. **DiskScanningResultProcessor (DSRP)**: Collects scan results and reports them to Assessments Modeller and CloudMap for recommendations and security graph.

**Scanning scope differences:**
- **Azure**: Only template parameters, outputs, and tags are scanned (NOT the ARM template content itself).
- **AWS**: Template content along with outputs, tags, and parameters are ALL scanned.

## Prerequisites

- **Azure Control Plane Secret Scanning**: Defender CSPM must be enabled.
- **AWS Control Plane Secret Scanning**: MDC CSPM Reader role permissions including `cloudformation:DescribeStacks` and `cloudformation:GetTemplate`.
- Supported secret types: [Defender for Cloud documentation](https://learn.microsoft.com/en-us/azure/defender-for-cloud/sensitive-info-types)

## TSG - Disk Scanning Service

### 1. Check if disk scanning is enabled for a subscription

```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').DiskScanningVmScanners
| where SubscriptionId == "{subscriptionId}"
| take 1
```

### 2. Check if there are eligible machines for scanning

```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricServiceOE
| where env_time > ago(1d)
| where applicationName endswith "DiskScanningApp"
| where operationName endswith "RunState"
| extend Data = todynamic(customData)
| where customData has "{subscriptionId}"
| distinct tostring(Data.VmsCount), env_cloud_deploymentUnit
```

### 3. Determine if scan results were sent to Disk Scanning Results Processor

```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricServiceOE
| where env_time > ago(1d)
| where operationName == "IfxSchemaOps.ApiRoutingScanResultProcessor_ProcessAsync"
| extend Data = todynamic(customData)
| where Data.ScannerIdentifier == "Secrets"
| where Data.ScannedResourceId =~ "{resourceID}"
| project env_time, customData, resultDescription
```

## TSG - Disk Scanning Results Processor Service

### 1. Find out how many secrets were discovered on a machine and how many were validated

```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricServiceOE
| where env_time > ago(1d)
| where applicationName == "fabric:/DiskScanningResultsProcessorApp"
| where operationName contains "SecretResourcesDataEnrichmentHandler_HandleScanResultAsync"
| extend MachineAzureUniqueId = tostring(todynamic(customData).ResourceAzureUniqueId)
| project env_time, MachineAzureUniqueId, customData
| where MachineAzureUniqueId =~ "{resourceID}"
```

### 2. Confirm if the machine was processed successfully

```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricTraceEvent
| where env_time > ago(2d)
| where message contains "{machineId}"
| where message contains "ScanType=SecretScanResults"
| project env_time, message, applicationName, serviceName
| sort by env_time desc
```

## Deep Dive (SAW machine / AME account)

Secrets findings results are injected to the Cloud Map and not available in ARG or in Corp clusters. To view the last results of the findings, query the Cloud Map.

**Get permissions**: [Research follower cluster - Overview](https://dev.azure.com/msazure/One/_wiki/wikis/Rome%20Orion%20Wiki/697878/Research-follower-cluster)

**Example queries** (run on each region):

- `cluster('cusornekgresearchprod.centralus').database('CloudMapV2')`
- `cluster('weuornekgresearchprod.westeurope').database('CloudMapV2')`

```kusto
GetEdgesV2AllTenantsAllScopes
| where Label == "contains"
| where SourceNodeLabel == "microsoft.compute/virtualmachines"
| where SourceNodeEntityIds has "{machineId}"
```

## Related Resources

- [Disk scanner dashboard](https://dataexplorer.azure.com/dashboards/019e2364-bb9e-4a45-9335-aa6396d7f8d9)
- [Secrets dashboard](https://dataexplorer.azure.com/dashboards/186bd8fe-0de7-4cdc-b73c-65ac49265bb8)
