# AKS CNI 与 Overlay 网络 — cni-overlay — 排查工作流

**来源草稿**: ado-wiki-a-NAP-FAQs.md, ado-wiki-b-Node-Autoprovision-Karpenter.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: NAP FAQ's
> 来源: ado-wiki-a-NAP-FAQs.md | 适用: 适用范围未明确

### 排查步骤

#### NAP FAQ's


#### Summary

Node AutoProvisioning (NAP) in AKS automatically provisions and manages nodes based on pending pod requirements, eliminating the need to manually manage multiple node pools. It dynamically selects appropriate VM sizes and scales nodes as demand changes, using an AKSmanaged implementation of Karpenter. This TSG provides FAQs to explain NAP behavior in realworld scenarios, including disruptions, consolidation, upgrades, networking, and common configuration questions.

##### Is Node upgrade channel setting respected or ignored by NAP?

NAP does not strictly honor the node OS upgrade channel. By default, NAP nodes automatically pick up new VM images when they become available. You can influence the schedule by configuring [AKS-managed node operating system (OS) upgrade schedule maintenance window](https://learn.microsoft.com/en-us/azure/aks/node-auto-provisioning-upgrade-image#node-os-upgrade-maintenance-windows-for-nap) to control when new images are picked up and applied to your NAP nodes or [use Karpenter Node Disruption Budgets and Pod Disruption Budgets](https://learn.microsoft.com/en-us/azure/aks/node-auto-provisioning-upgrade-image#karpenter-node-disruption-budgets-and-pod-disruption-budgets-for-nap) to control how and when disruption occurs during upgrades. However, if a NAP node image is older than 90 days, AKS forcibly upgrades it to the latest image, bypassing any configured maintenance window or upgrade channel. As a result, the node OS upgrade channel acts as guidance, not a strict control, for NAP-managed nodes.

##### If aksManagedNodeOSUpgradeSchedule is scheduled far ahead, will Kubernetes version upgrades still trigger node upgrades (such as moving from 1.32 to 1.33)?

Yes. Setting aksManagedNodeOSUpgradeSchedule far in the future does not block Kubernetes version upgrades. aksManagedNodeOSUpgradeSchedule only controls node OS image patching (security/image updates). Kubernetes version upgrades (e.g., 1.32  1.33) are independent of this schedule. Scheduling can be fine-tuned by applying two separate sets of [maintenance windows](https://learn.microsoft.com/en-us/azure/aks/planned-maintenance?tabs=azure-cli)- aksManagedAutoUpgradeSchedule for the cluster [autoupgrade](https://learn.microsoft.com/en-us/azure/aks/auto-upgrade-cluster?tabs=azure-cli) channel and aksManagedNodeOSUpgradeSchedule for the node OS autoupgrade channel.

##### The documentation states 'NAP forces the latest image version to be picked up if the existing node image version is older than 90 days.' Does this overrule Pod Disruption Budgets? Will workloads be forcibly interrupted in case the node image is older than 90 days?

The upgrade mechanism and decision criteria are specific to NAP/Karpenter and are evaluated by NAP's drift logic. NAP respects Karpenter Node Disruption Budgets and Pod Disruption Budgets. Based on the documentation, the 90 day rule overrides the timing controls and workloads would still be protected by correctly configured PDB's.

##### What specific configuration changes does Azure recommend reducing underutilized replace events while still controlling cost?

Here are some of the recommended approaches:

- Adjust [consolidation](https://karpenter.sh/preview/concepts/disruption/#consolidation) settings by modifying the "consolidateAfter" parameter, or changing the policy from the default "WhenEmptyOrUnderutilized" to "WhenEmpty"
- One or more of the [disruption controls](https://karpenter.sh/docs/concepts/disruption/#controls) may be applicable: NodePool disruption budgets, PDBs, "karpenter.sh/do-not-disrupt" annotation on workloads or nodes.
- In the near future we will also support [static capacity](https://karpenter.sh/docs/concepts/nodepools/#specreplicas), which is not considered for consolidation.
Best practice is to design workloads with sufficient redundancy and constraints to tolerate disruptions and communicate tolerances to Kubernetes and NAP using the settings above. General recommendation is to make workloads more tolerant of disruptions, rather than trying to minimize the disruptions.

##### In scenarios where the VM sizes differ but have comparable pricing, does NAP make node placement decisions based on cost, and what pricing data source does it rely on?

Yes, node provisioning is code-driven and relies on public pricing APIs. These APIs currently don't reflect customer-specific pricing, we are looking for options to improve this. In the near future we will also support [NodeOverlay](https://karpenter.sh/preview/concepts/nodeoverlays/), which lets one specify custom VM SKU settings (as considered by NAP), including price; this can be used as an "escape hatch" until we have access to better pricing APIs.

##### Are there any pod requests or actual usage thresholds that NAP considers when evaluating underutilization?

No specific thresholds are applied. If workloads be relocated, or a cheaper VM SKU can replace the existing node, with consolidation policy set to "WhenEmptyOrUnderutilized", NAP will consider node for consolidation (deletion or replacement) once "consolidateAfter" has passed - subject to additional controls mentioned above.

##### Does Azure capacity signals allocation failures / predicted scarcity influence version selection?

Yes, for allocation failures, reactive - NAP will take VM SKUs (maybe +zone) out of consideration temporarily, based on certain allocation failures. It does not yet use capacity signals eagerly, but this is coming soon; we do have APIs we can use for this and have a good place to plug them in.

---

## Scenario 2: Node Autoprovision (Karpenter)
> 来源: ado-wiki-b-Node-Autoprovision-Karpenter.md | 适用: 适用范围未明确

### 排查步骤

#### Node Autoprovision (Karpenter)

#### Overview

Node Autoprovision is based on a project called [Karpenter](https://karpenter.sh/). Karpenter is a Kubernetes node provisioner / cluster auto-scaler tool, which, unlike the classic Cluster Autoscaler, does not use node groups/pools. Similar to CAS, Karpenter watches for unschedulable pending pods as a signal to scale out the cluster; unlike CAS it looks at all of the resource requirements of those pods and launches the best fit compute resource. Similar to CAS, Karpenter removes the unused capacity as needed; unlike CAS it can also look for opportunities to reschedule/consolidate workloads to reduce infrastructure costs.

#### NAP/Karpenter Architecture Overview

Karpenter (NAP) Preview (ports, MSI usage, secrets, nodebootstrapping endpoints).
Reference: [Karpenter Preview](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/629717/Karpenter-(NAP))

#### NAP FirstResponse Checklist

Check if Cluster Autoscaler is still enabled (NAP & CA cannot run together).

- Confirm networking mode:
  - Only Azure CNI overlay + Cilium supported at present.
  - No Kubenet support.
- Confirm OS Support:
  - Only Ubuntu nodepools supported.
- Confirm Outbound Connectivity:
  - Karpenter requires VM image pulls, ARM VM list operations, pricing API calls.
  - If network egress is firewalled, ensure that the necessary endpoints for VM image pulls and ARM operations are accessible.

#### Karpenter controller logs

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

#### Karpenter Scaling Stuck

There are a couple of scenarios where karpenter fails to scale, some of which are by design.

##### InsufficientCapacityError

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

##### Stuck Provisioning on Same Instance Type

If Karpenter hits an unsupported SKU, exclude it from the NodePool:

```yaml
- key: node.kubernetes.io/instance-type
  operator: NotIn
  values: [Standard_D2_v5]
```

#### NodeClaim Initialization Failures Across Regions

- Check async_context_activity for VMExtensionProvisioningError loops
- Verify CRP health when multiple regions experience initialization failures
- Cross-reference known Sev1s if NodeClaims fail across regions

#### SelfHosted Karpenter Using Unsupported VHDs

- Community Gallery VHDs are unsupported - redirect customer to AKS VHDs only
- Use `kubectl describe node` to verify node image origin
- AKS release page: https://releases.aks.azure.com/

#### Consolidation Failures

- Customers often misinterpret consolidation messages as errors
- Verify via KarpenterEvents table
- Reproduce scenario in isolated cluster using inflation deployment

---
