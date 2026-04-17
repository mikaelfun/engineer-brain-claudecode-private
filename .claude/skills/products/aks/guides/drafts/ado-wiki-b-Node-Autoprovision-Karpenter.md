---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Node Autoprovision (Karpenter)"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Node Autoprovision (Karpenter)

## Overview

Node Autoprovision is based on a project called [Karpenter](https://karpenter.sh/). Karpenter is a Kubernetes node provisioner / cluster auto-scaler tool, which, unlike the classic Cluster Autoscaler, does not use node groups/pools. Similar to CAS, Karpenter watches for unschedulable pending pods as a signal to scale out the cluster; unlike CAS it looks at all of the resource requirements of those pods and launches the best fit compute resource. Similar to CAS, Karpenter removes the unused capacity as needed; unlike CAS it can also look for opportunities to reschedule/consolidate workloads to reduce infrastructure costs.

## NAP/Karpenter Architecture Overview

Karpenter (NAP) Preview (ports, MSI usage, secrets, nodebootstrapping endpoints).
Reference: [Karpenter Preview](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/629717/Karpenter-(NAP))

## NAP FirstResponse Checklist

Check if Cluster Autoscaler is still enabled (NAP & CA cannot run together).

- Confirm networking mode:
  - Only Azure CNI overlay + Cilium supported at present.
  - No Kubenet support.
- Confirm OS Support:
  - Only Ubuntu nodepools supported.
- Confirm Outbound Connectivity:
  - Karpenter requires VM image pulls, ARM VM list operations, pricing API calls.
  - If network egress is firewalled, ensure that the necessary endpoints for VM image pulls and ARM operations are accessible.

## Karpenter controller logs

In some scenarios, it might not be possible to retrieve the logs for the karpenter controller using overlay in ASI or Jarvis.
In such situation, you could check the KarpenterEvents table.

```kusto
let ccpNS = "ccp_namespace";
let startTime = datetime(2024-07-26 08:00:00);
let endTime = datetime(2024-07-26 14:00:00);
cluster('aks').database('AKSprod').KarpenterEvents
| where PreciseTimeStamp between (startTime ..endTime )
| where namespace == ccpNS
| project PreciseTimeStamp,namespace,level,log
```

## Karpenter Scaling Stuck

There are a couple of scenarios where karpenter fails to scale, some of which are by design.

### InsufficientCapacityError

Check the KubeSystemEvents table for an event with reason `InsufficientCapacityError`.

```kusto
let _kind = 'NodeClaim';
let _reason = 'InsufficientCapacityError';
let _cluster_id = "{cluster_id}";
KubeSystemEvents
| where isempty(_cluster_id) or cluster_id == _cluster_id
| where isempty(_reason) or reason == _reason
| where isempty(_kind) or kind == _kind
| project PreciseTimeStamp, kind, name, reason, message, reportingController, cluster_id
```

Two main classes:

1. **TotalRegionalCores Quota Exceeded** - Customer needs to submit quota increase request
2. **All Requested Instance Types Unavailable** - Expand nodepool SKU families or request per-VM quota

### Stuck Provisioning on Same Instance Type

If Karpenter hits an unsupported SKU, exclude it from the NodePool:

```yaml
- key: node.kubernetes.io/instance-type
  operator: NotIn
  values: [Standard_D2_v5]
```

## NodeClaim Initialization Failures Across Regions

- Check async_context_activity for VMExtensionProvisioningError loops
- Verify CRP health when multiple regions experience initialization failures
- Cross-reference known Sev1s if NodeClaims fail across regions

## SelfHosted Karpenter Using Unsupported VHDs

- Community Gallery VHDs are unsupported - redirect customer to AKS VHDs only
- Use `kubectl describe node` to verify node image origin
- AKS release page: https://releases.aks.azure.com/

## Consolidation Failures

- Customers often misinterpret consolidation messages as errors
- Verify via KarpenterEvents table
- Reproduce scenario in isolated cluster using inflation deployment
