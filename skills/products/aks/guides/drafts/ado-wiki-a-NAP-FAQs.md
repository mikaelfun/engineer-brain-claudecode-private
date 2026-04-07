---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/NAP FAQs"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNAP%20FAQs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# NAP FAQ's

[[_TOC_]]

## Summary

Node AutoProvisioning (NAP) in AKS automatically provisions and manages nodes based on pending pod requirements, eliminating the need to manually manage multiple node pools. It dynamically selects appropriate VM sizes and scales nodes as demand changes, using an AKSmanaged implementation of Karpenter. This TSG provides FAQs to explain NAP behavior in realworld scenarios, including disruptions, consolidation, upgrades, networking, and common configuration questions.

### Is Node upgrade channel setting respected or ignored by NAP?

NAP does not strictly honor the node OS upgrade channel. By default, NAP nodes automatically pick up new VM images when they become available. You can influence the schedule by configuring [AKS-managed node operating system (OS) upgrade schedule maintenance window](https://learn.microsoft.com/en-us/azure/aks/node-auto-provisioning-upgrade-image#node-os-upgrade-maintenance-windows-for-nap) to control when new images are picked up and applied to your NAP nodes or [use Karpenter Node Disruption Budgets and Pod Disruption Budgets](https://learn.microsoft.com/en-us/azure/aks/node-auto-provisioning-upgrade-image#karpenter-node-disruption-budgets-and-pod-disruption-budgets-for-nap) to control how and when disruption occurs during upgrades. However, if a NAP node image is older than 90 days, AKS forcibly upgrades it to the latest image, bypassing any configured maintenance window or upgrade channel. As a result, the node OS upgrade channel acts as guidance, not a strict control, for NAP-managed nodes.

### If aksManagedNodeOSUpgradeSchedule is scheduled far ahead, will Kubernetes version upgrades still trigger node upgrades (such as moving from 1.32 to 1.33)?

Yes. Setting aksManagedNodeOSUpgradeSchedule far in the future does not block Kubernetes version upgrades. aksManagedNodeOSUpgradeSchedule only controls node OS image patching (security/image updates). Kubernetes version upgrades (e.g., 1.32  1.33) are independent of this schedule. Scheduling can be fine-tuned by applying two separate sets of [maintenance windows](https://learn.microsoft.com/en-us/azure/aks/planned-maintenance?tabs=azure-cli)- aksManagedAutoUpgradeSchedule for the cluster [autoupgrade](https://learn.microsoft.com/en-us/azure/aks/auto-upgrade-cluster?tabs=azure-cli) channel and aksManagedNodeOSUpgradeSchedule for the node OS autoupgrade channel.

### The documentation states 'NAP forces the latest image version to be picked up if the existing node image version is older than 90 days.' Does this overrule Pod Disruption Budgets? Will workloads be forcibly interrupted in case the node image is older than 90 days?

The upgrade mechanism and decision criteria are specific to NAP/Karpenter and are evaluated by NAP's drift logic. NAP respects Karpenter Node Disruption Budgets and Pod Disruption Budgets. Based on the documentation, the 90 day rule overrides the timing controls and workloads would still be protected by correctly configured PDB's.

### What specific configuration changes does Azure recommend reducing underutilized replace events while still controlling cost?

Here are some of the recommended approaches:

- Adjust [consolidation](https://karpenter.sh/preview/concepts/disruption/#consolidation) settings by modifying the "consolidateAfter" parameter, or changing the policy from the default "WhenEmptyOrUnderutilized" to "WhenEmpty"
- One or more of the [disruption controls](https://karpenter.sh/docs/concepts/disruption/#controls) may be applicable: NodePool disruption budgets, PDBs, "karpenter.sh/do-not-disrupt" annotation on workloads or nodes.
- In the near future we will also support [static capacity](https://karpenter.sh/docs/concepts/nodepools/#specreplicas), which is not considered for consolidation.
Best practice is to design workloads with sufficient redundancy and constraints to tolerate disruptions and communicate tolerances to Kubernetes and NAP using the settings above. General recommendation is to make workloads more tolerant of disruptions, rather than trying to minimize the disruptions.

### In scenarios where the VM sizes differ but have comparable pricing, does NAP make node placement decisions based on cost, and what pricing data source does it rely on?

Yes, node provisioning is code-driven and relies on public pricing APIs. These APIs currently don't reflect customer-specific pricing, we are looking for options to improve this. In the near future we will also support [NodeOverlay](https://karpenter.sh/preview/concepts/nodeoverlays/), which lets one specify custom VM SKU settings (as considered by NAP), including price; this can be used as an "escape hatch" until we have access to better pricing APIs.

### Are there any pod requests or actual usage thresholds that NAP considers when evaluating underutilization?

No specific thresholds are applied. If workloads be relocated, or a cheaper VM SKU can replace the existing node, with consolidation policy set to "WhenEmptyOrUnderutilized", NAP will consider node for consolidation (deletion or replacement) once "consolidateAfter" has passed - subject to additional controls mentioned above.

### Does Azure capacity signals allocation failures / predicted scarcity influence version selection?

Yes, for allocation failures, reactive - NAP will take VM SKUs (maybe +zone) out of consideration temporarily, based on certain allocation failures. It does not yet use capacity signals eagerly, but this is coming soon; we do have APIs we can use for this and have a good place to plug them in.
