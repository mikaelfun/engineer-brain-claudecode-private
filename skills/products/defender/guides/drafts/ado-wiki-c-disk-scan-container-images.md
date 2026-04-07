---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/[Troubleshooting Guide] - Azure Container Registry (ACR) vulnerability assessment (VA)/[Technical Knowledge] - Disk Scan of Container Images"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2F%5BTroubleshooting%20Guide%5D%20-%20Azure%20Container%20Registry%20(ACR)%20vulnerability%20assessment%20(VA)%2F%5BTechnical%20Knowledge%5D%20-%20Disk%20Scan%20of%20Container%20Images"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Disk Scan of Container Images

## Overview
Disk Scan enables customers to get vulnerability status for images located on K8s cluster nodes, without requiring images to be in a supported registry (ACR/ECR/GAR).

Integration of two MDC services:
1. **Disk Scan Platform** (MDC Guardians team) - Scans VMs and VMSS once daily
2. **Phoenix** (MDC Protector team) - Scans container images using AXON scanner for vulnerability reports

Results provided via Container Runtime Visibility recommendations.

## Architecture

### 1) Pricing Configuration
- Toggle: "Agentless scanning for machines" under Defender CSPM and Containers bundles
- Triggers daily disk scan of VMs and VMSS (AKS runs on VMSS)

#### Query Toggle Status (KQL)
```kusto
let SubscriptionId = "<SubscriptionId>";
Environments
| where TimeStamp > ago(1d) and Level == "Subscription" and EnvironmentName == "Azure"
| where HierarchyId == SubscriptionId
| summarize arg_max(TimeStamp, *) by HierarchyId
| mv-expand Plans
| where Plans contains "Container" or Plans contains "CloudPosture"
| extend AgentlessVmScanning_IsEnabled = tostring(Plans.Extensions.AgentlessVmScanning.IsEnabled)
| extend BundleName = tostring(Plans.Bundle), SubPlan = tostring(Plans.SubPlan)
| project SubscriptionId = HierarchyId, BundleName, SubPlan, AgentlessVmScanning_IsEnabled
```
Cluster: `mdcentitystoreprodus.centralus.kusto.windows.net/MDCGlobalData`

### 2) Disk Scan Platform
- Scans every 24h
- Each AKS pool backed by VMSS; each node (VMSS instance) scanned separately
- K8s Node Images Scanner components:
  1. **Image Discovery** - Identify container images on node disk
  2. **Images Scan Orchestration** - Orchestrate Axon scan, produce SBOM
  3. **Publisher** - Send results to Phoenix

#### Query K8s Node Scan Stats
```kusto
let SubscriptionId_Value = "<SubscriptionId>";
Phoenix_DiskScan_K8sNodes_LifeCycleEvents
| where GeneratedTimestamp > ago(1d)
| where SubscriptionId == SubscriptionId_Value
| extend K8sClusterName = tostring(K8sClusterContext.K8sClusterName),
         K8sClusterPoolName = tostring(K8sClusterContext.K8sClusterPoolName)
| project TenantId, SubscriptionId, K8sClusterName, K8sClusterPoolName,
          ImageDiscoveryContext, ImageScanContext, TimestampContext, K8sNodeId
```
Cluster: `romeeus.eastus.kusto.windows.net/ProdRawEvents`

### 3) Phoenix Service
- **Disk Scan Result Processor** - Filters invalid/non-AKS results, forwards valid to Router
- **Disk Scan Router** - Decides if TVM API re-evaluation needed (1h cooldown per image)
- **Assessor** - Evaluates Axon results via TVM API, ingests to Kusto + CloudMap V2

#### Query Specific Image Scan
```kusto
let ImageId_Value = "<ImageId>";
let SubscriptionId_Value = "<SubscriptionId>";
Phoenix_DiskScan_Images_LifeCycleEvents
| where GeneratedTimestamp > ago(1d)
| where SubscriptionId == SubscriptionId_Value and ImageId == ImageId_Value
| extend IsDropped = tostring(ImageScanResultsRouteDetails.AxonScanner.IsDropped),
         IsSuccess = tobool(ImageScanResultsRouteDetails.AxonScanner.IsSuccess),
         K8sClusterName = tostring(K8sClusterContext.K8sClusterName)
| project TenantId, SubscriptionId, ScanId, K8sClusterName, ImageId,
          ImageScanResultsRouteDetails, IsDropped, IsSuccess, TimestampContext
```

#### Query Image Evaluation Results
```kusto
let ScanId_Value = "<ScanId>";
let SubscriptionId_Value = "<SubscriptionId>";
let RegistryHost_Value = "<RegistryHost>";
Phoenix_Assessments_LifeCycleEvents
| where GeneratedTimestamp > ago(7d)
| where EventId == ScanId_Value
| where Component == "Assessor" and LifeCycleEvent in ("AssessSuccessfullyDone", "AssessmentEmpty")
| extend RegistryHost = tostring(ArtifactContext.RegistryHost),
         SubscriptionId = tostring(UserContext.SubscriptionId)
| where SubscriptionId == SubscriptionId_Value and RegistryHost == RegistryHost_Value
| summarize arg_max(GeneratedTimestamp, *)
| project GeneratedTimestamp, EventId, Component, LifeCycleEvent, ArtifactContext, AdditionalData
```

## Known Limitations
1. **Windows nodes**: Do not store container images on disk - not scanned
2. **Ephemeral OS**: No visibility into images on disk - not scanned
3. **Auto-scale AKS**: Nodes may be down at scan time - partial/no results
