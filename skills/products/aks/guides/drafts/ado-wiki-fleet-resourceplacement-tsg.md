---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS Fleet Manager/TSG/ResourcePlacement"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FResourcePlacement"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ResourcePlacement in AKS Fleet

[[_TOC_]]

## Overview

- [Concepts](https://github.com/kubefleet-dev/website/blob/main/content/en/docs/concepts/rp.md)
- [How-to](https://github.com/kubefleet-dev/website/blob/main/content/en/docs/how-tos/rp.md)
- [Public Troubleshooting Guide](https://github.com/kubefleet-dev/website/blob/main/content/en/docs/troubleshooting/ResourcePlacement.md)
- [PG Troubleshooting Guide](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/aks-troubleshooting-guide/900840/fleet.LowRPCompletedStatusPercentage)

The `ResourcePlacement` (RP) is a **namespace-scoped API** that enables dynamic selection and multi-cluster propagation of namespace-scoped resources. It provides fine-grained control over how specific resources within a namespace are distributed across member clusters in a fleet.

- **Namespace-scoped**: Both the ResourcePlacement object and the resources it manages exist within the same namespace
- **Selective**: Can target specific resources by type, name, or labels rather than entire namespaces
- **Declarative**: Uses the same placement patterns as ClusterResourcePlacement for consistent behavior
- **Complementary**: Works alongside ClusterResourcePlacement to provide complete multi-cluster resource management

### Current Setup

ResourcePlacement is a namespace-scoped custom resource that manages the placement of namespace-scoped resources.

- API: <https://github.com/kubefleet-dev/kubefleet/blob/main/apis/placement/v1beta1/clusterresourceplacement_types.go#L1626-L1641>
- CRD: <https://github.com/kubefleet-dev/kubefleet/blob/main/config/crd/bases/placement.kubernetes-fleet.io_resourceplacements.yaml>

#### Key Characteristics

ResourcePlacement consists of three core components:

- **Resource Selectors**: Define which namespace-scoped resources to include (ConfigMaps, Secrets, Deployments, Services, etc.)
- **Placement Policy**: Determine target clusters using PickAll, PickFixed, or PickN strategies
- **Rollout Strategy**: Control how changes propagate across selected clusters

#### Lifecycle and Controller Flow

The lifecycle of RP is managed by the unified placement controller (same controller that manages CRP):

1. **Resource Selection & Snapshotting**: The placement controller identifies resources matching selectors and creates `ResourceSnapshot` objects in the same namespace
2. **Policy Evaluation & Snapshotting**: Placement policies are captured in `SchedulingPolicySnapshot` objects (also namespace-scoped)
3. **Multi-Cluster Scheduling**: The scheduler processes policy snapshots to determine target clusters
4. **Resource Binding**: Selected clusters are bound via `ResourceBinding` objects (namespace-scoped)
5. **Rollout Execution**: The rollout controller applies resources according to the rollout strategy
6. **Override Processing**: Environment-specific customizations via `ResourceOverride` objects
7. **Work Generation**: Individual `Work` objects are created in member cluster namespaces
8. **Cluster Application**: Work controllers on member clusters apply the resources locally

### Key Differences from ClusterResourcePlacement

| Aspect | ResourcePlacement (RP) | ClusterResourcePlacement (CRP) |
|--------|------------------------|--------------------------------|
| **Scope** | Namespace-scoped resources only | Cluster-scoped resources (especially namespaces) |
| **API Resource Scope** | Namespace-scoped API object | Cluster-scoped API object |
| **Selection Boundary** | Limited to resources within the same namespace as the RP | Can select any cluster-scoped resource |
| **Status Access** | Direct access via namespace permissions | Requires cluster-scoped access (or use ClusterResourcePlacementStatus) |
| **Snapshots** | `ResourceSnapshot` (namespaced) | `ClusterResourceSnapshot` (cluster-scoped) |
| **Bindings** | `ResourceBinding` (namespaced) | `ClusterResourceBinding` (cluster-scoped) |
| **Typical Use Cases** | AI/ML Jobs, individual workloads, specific ConfigMaps/Secrets | Application bundles, entire namespaces, cluster-wide policies |
| **Team Ownership** | Can be managed by namespace owners/developers | Typically managed by platform operators |

### Similarities with ClusterResourcePlacement

Both RP and CRP share the same core concepts:

- **Placement Policies**: Same three placement types (PickAll, PickFixed, PickN) with identical scheduling logic
- **Resource Selection**: Both support selection by group/version/kind, name, and label selectors
- **Rollout Strategy**: Identical rolling update mechanisms for zero-downtime deployments
- **Scheduling Framework**: Use the same multi-cluster scheduler
- **Override Support**: Both integrate with override mechanisms (ResourceOverride vs ClusterResourceOverride)
- **Status Reporting**: Similar status structures and condition types
- **Tolerations**: Same taints and tolerations mechanism
- **Unified Controller**: Both are managed by the same placement controller in the codebase

### Namespace Prerequisites

**Important**: ResourcePlacement can only place namespace-scoped resources to clusters that already have the target namespace.

#### Typical Workflow

1. **Platform Admin**: Uses ClusterResourcePlacement to deploy namespaces across the fleet
2. **Application Teams**: Use ResourcePlacement to manage specific resources within those namespaces

### Validation

ResourcePlacement validation is handled by the validating webhook:

- Resource selectors must only select namespace-scoped resources
- Resource selectors must target resources in the same namespace as the RP
- Placement policy cannot be removed once set (immutable after creation)
- Label selectors, cluster names, and other policy fields are validated

## Queries for Logs / How to Debug

### Azure Internal Resources

#### Kusto Clusters and Databases

| Resource | Cluster | Database | Purpose |
|----------|---------|----------|----------|
| Fleet Agent Logs (e.g. FleetAgentEvents) | akshuba.centralus | AKSccplogs | Hub/Member agent logs |
| Metrics (e.g. FleetWorkloadPlacementStatusLastTimestampSeconds) | akshuba.centralus | AKSCCPMetrics | Fleet metrics and alerts |

### Kusto Queries

#### Basic ResourcePlacement Status Query

```kusto
let _endTime = now();
let _region = '<CCP-REGION>';
let _lookback = _endTime - 1h;
let rpName = '<RP-NAME>';
let rpNamespace = '<NAMESPACE>';
let _ccpNamespace = '<CCPNamespace>';
FleetAgentEvents
| where PreciseTimeStamp between (_lookback .. _endTime)
| where container == "fleet-hub-agent"
| where RPTenant == _region
| where Environment in ("prod", "staging")
| where namespace == _ccpNamespace
| where msg contains strcat("placement=\"", rpNamespace, "/", rpName, "\"") and msg contains "status="
| project PreciseTimeStamp, container_image, level, msg, line, file
```

#### Check Uncompleted ResourcePlacements (Regional)

```kusto
let _endTime = now();
let _region = '<CCP-REGION>';
let _lookback = _endTime - 1h;
FleetWorkloadPlacementStatusLastTimestampSeconds
| where Timestamp between (_lookback .. _endTime)
| where RPTenant == _region
| where Environment in ("prod", "staging")
| extend logEmitDateTime = unixtime_seconds_todatetime(Value)
| extend ccpnamespace = tostring(Labels.cluster_id)
| extend namespace = tostring(Labels.namespace)
| extend rpName = tostring(Labels.name)
| extend generation = toint(Labels.generation)
| extend condition = tostring(Labels.conditionType)
| extend status = tostring(Labels.status)
| extend reason = tostring(Labels.reason)
| project Timestamp, logEmitDateTime, ccpnamespace, namespace, rpName, generation, condition, status, reason, Cloud, Environment, RPTenant
| summarize arg_max(logEmitDateTime, *) by rpName, namespace, ccpnamespace, Cloud, Environment, RPTenant
| extend isCompleted = iff(condition == "Completed", true, false)
| where isCompleted == false
| where namespace != ""
```

#### Check Uncompleted ResourcePlacements (Specific Hub)

```kusto
let _endTime = now();
let _region = '<CCP-REGION>';
let _ccpNamespace = '<CCP-NAMESPACE>';
let _lookback = _endTime - 1h;
FleetWorkloadPlacementStatusLastTimestampSeconds
| where Timestamp between (_lookback .. _endTime)
| where RPTenant == _region
| where Environment in ("prod", "staging")
| extend logEmitDateTime = unixtime_seconds_todatetime(Value)
| extend ccpnamespace = tostring(Labels.cluster_id)
| extend namespace = tostring(Labels.namespace)
| extend rpName = tostring(Labels.name)
| extend generation = toint(Labels.generation)
| extend condition = tostring(Labels.conditionType)
| extend status = tostring(Labels.status)
| extend reason = tostring(Labels.reason)
| where ccpnamespace == _ccpNamespace
| project Timestamp, logEmitDateTime, ccpnamespace, namespace, rpName, generation, condition, status, reason, Cloud, Environment, RPTenant
| summarize arg_max(logEmitDateTime, *) by rpName, namespace, ccpnamespace, Cloud, Environment, RPTenant
| extend isCompleted = iff(condition == "Completed", true, false)
| where isCompleted == false
| where namespace != ""
```

### Common Debugging Scenarios

#### 1. Check ResourcePlacement Status

```bash
kubectl get rp <rp-name> -n <namespace>
kubectl describe rp <rp-name> -n <namespace>
```

#### 2. Find Latest ResourceSnapshot

```bash
kubectl get resourcesnapshot -n <namespace> -l kubernetes-fleet.io/is-latest-snapshot=true,kubernetes-fleet.io/parent-CRP=<rp-name>
```

#### 3. Find Latest SchedulingPolicySnapshot

```bash
kubectl get schedulingpolicysnapshot -n <namespace> -l kubernetes-fleet.io/is-latest-snapshot=true,kubernetes-fleet.io/parent-CRP=<rp-name>
```

#### 4. List All ResourceBindings

```bash
kubectl get resourcebinding -n <namespace> -l kubernetes-fleet.io/parent-CRP=<rp-name>
```

#### 5. Find Work Objects

```bash
kubectl get work -n fleet-member-<cluster-name> -l kubernetes-fleet.io/parent-CRP=<rp-name>
```

## Troubleshooting Guide

### Complete Progress of ResourcePlacement

The progression of ResourcePlacement status conditions:

1. **ResourcePlacementScheduled**: Indicates resources have been scheduled for placement
2. **ResourcePlacementRolloutStarted**: Indicates rollout process has begun
3. **ResourcePlacementOverridden**: Indicates resource overrides have been applied
4. **ResourcePlacementWorkSynchronized**: Indicates work objects have been synchronized
5. **ResourcePlacementApplied**: Indicates resources have been applied
6. **ResourcePlacementAvailable**: Indicates resources are available
7. **ResourcePlacementDiffReported**: Indicates diff reporting completed (ReportDiff strategy)

#### Condition Status Values

- **nil**: The previous condition has completed and the current condition has not yet started
- **Unknown**: The current condition is in progress
- **True**: The condition completed successfully
- **False**: The condition failed to complete successfully

#### Apply Strategy Progression

**Report Diff Apply Strategy**:
```
[Scheduled] -> [RolloutStarted] -> [Overridden] -> [WorkSynchronized] -> [DiffReported]
```

**Client & Server Side Apply Strategy**:
```
[Scheduled] -> [RolloutStarted] -> [Overridden] -> [WorkSynchronized] -> [Applied] -> [Available]
```

### Common Issues

#### Resources Not Selected
- Verify resource selectors target namespace-scoped resources only
- Check that resources exist in the same namespace as the RP
- Verify label selectors match actual resource labels

#### Namespace Not Found on Member Clusters
- Ensure CRP has created the namespace on target clusters first
- Use `kubectl get ns <namespace>` on member clusters to verify

#### Placement Not Progressing
- Check RP status conditions for specific failure reasons
- Verify member clusters are healthy and connected
- Check for taints on clusters that might prevent scheduling
- Use Kusto queries to check recent RP status updates
- Review FleetAgentEvents for controller errors
- Check if RP is stuck due to staged update runs or external controllers

### Low RP Completed Status Percentage Alert

When receiving this alert (triggered when <20% of RPs are completed in 30 minutes):

**Step 1**: Identify Affected RPs — Use regional/cluster-specific Kusto queries

**Step 2**: Check for User Errors — InvalidResourceSelector, RolloutControlledByExternalController

**Step 3**: Review Agent Logs — FleetAgentEvents

**Step 4**: Check for Staged Updates — Unknown state during staged rollouts is expected

**Step 5**: Verify Not a Recent Agent Release

**Step 6**: Escalate if Needed — Contact SIG Multi-Cluster On-Duty Teams Channel

### Common Azure-Internal Issues

1. **Hub Cluster API Server Unavailable** — Check hub cluster health in ASI
2. **Member Agent Down** — Check MemberAgentDownAlert
3. **High Work Queue Depth** — Check HighWorkQueueDepth alert
4. **Snapshot Job Issues** — Check HighSnapshotJobDurationAlert
5. **Stuck Staged Update Runs** — Check HighStuckClusterStagedUpdateRunAlert

## Best Practices

1. **Namespace First**: Always ensure namespaces are deployed via CRP before creating RPs
2. **Monitor Dependencies**: Ensure namespace-level CRPs are healthy before deploying RPs
3. **Coordinate Policies**: Align CRP and RP placement policies to avoid conflicts
4. **Team Boundaries**: Use CRP for platform-managed resources, RP for application-managed resources
5. **Resource Scope**: Only select namespace-scoped resources; use CRP for cluster-scoped resources
