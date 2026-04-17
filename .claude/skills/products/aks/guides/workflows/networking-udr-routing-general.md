# AKS UDR 与路由 — general — 排查工作流

**来源草稿**: ado-wiki-a-Multiple-Standard-Load-Balancers.md, ado-wiki-b-fleet-automated-deployments.md, ado-wiki-fleet-resourceplacement-tsg.md
**Kusto 引用**: 无
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Multiple Standard Load Balancers
> 来源: ado-wiki-a-Multiple-Standard-Load-Balancers.md | 适用: 适用范围未明确

### 排查步骤

#### Multiple Standard Load Balancers


#### Overview

AKS currently configures only a single Standard Load Balancer and a single Internal Load Balancer (if required) per cluster. This imposes a number of limits on AKS clusters based on Azure Load Balancer limits, the largest being based on the 300 rules per NIC limitation.

Any IP:port combination in a _frontEndIPConfiguration_ that maps to a member of a backend pool counts as one of the 300 rules for that node. This limits any AKS cluster to a maximum of 300 LoadBalancer service IP:port combinations.

This feature allows the customer to use more than one SLB on a cluster. This is really only useful on very large clusters, where the customer is hitting the limit on the number of LB services you can have on a single SLB.

#### Supported command examples

```bash
az aks create --load-balancer-backend-pool-type nodeIP
az aks loadbalancer add/update --cluster-name <cluster_name> -g <resource_group> --name <lb_name> --primary-agent-pool-name <nodepool_name> --allow-service-placement true
az aks loadbalancer add/update --service-namespace-selector "a In b c,d=e,f NotIn g h,i Exists,j DoesNotExist"
az aks loadbalancer delete --cluster-name -g --name <lb_name>
az aks loadbalancer show
az aks loadbalancer list
```

#### Supported service annotation

```yaml
service.beta.kubernetes.io/azure-load-balancer-configurations: "lb1,lb2"
```

#### High-level design

##### Load Balancer management

User can create, update and delete a load balancer configuration through `az aks loadbalancer` commands. The first load balancer configuration must have a name of `kubernetes`. Once the first kubernetes configuration is created, the multi-slb mode is on. To turn off the feature and use legacy single-slb mode, just remove all load balancer configurations. An azure standard load balancer resource will be lazily created when there is an lb-typed service asking for one.

##### Node selection rules

When nodes are created, each node will be evaluated to see what load balancer it should be placed into. Valid placement targets will be determined as follows (rules match from top to bottom, first match wins):

- If this node is in an agent pool that is selected as a primary agent pool for a load balancer, that load balancer will be the only potential placement target.
- If the nodeSelectors on any load balancer configurations match this node, then all load balancer configurations that match it will be potential placement targets.
- If no nodeSelectors on any load balancer configurations match this node, then all load balancers that do not have any nodeSelectors will be potential placement targets.
After the list of potential placement targets has been calculated, the node should be placed into the kubernetes backend pool of the load balancer with the fewest number.

##### Service selection rules

Users can select a specific load balancer configuration by passing a comma-separated list of configuration names in the annotation `service.beta.kubernetes.io/azure-load-balancer-configurations`.

1. Start with the list of all load balancer configurations.
2. Perform the following steps in parallel:
  2a. Generate the list of configurations listed in the service annotation; if empty, use entire list.
  2b. Generate the list of configurations with a namespaceSelector matching the service's namespace; if no matches, use all with empty namespaceSelector.
  2c. Generate the list of configurations with a labelSelector matching the service; if no matches, use all with empty labelSelector.
3. Calculate the intersection of 2a, 2b, 2c.
4. Select the load balancer with the fewest number of rules.

##### ExternalTrafficPolicy Local services

For local services, each one will have a dedicated backend pool named after service.uid. Only nodes hosting service's endpoints are added to the dedicated pool.

##### Outbound traffic

This feature does not change any outbound traffic logic. If outbound type is loadBalancer, all traffic will go through the `kubernetes` load balancer from its outbound backend pool.

#### Known issues

##### Mismatch of operation finish times between aks-rp and cloud-controller-manager

After making changes to a load balancer configuration by `az aks loadbalancer` commands, the aks operation will return successfully after updating the hcp and cloud provider configuration secret. However, cloud-controller-manager still needs some time to reload. To prevent this issue, monitor kubernetes event `EnsuredLoadBalancer` which marks the finish of cloud provider's restart before performing operations related to the new change.

---

## Scenario 2: Fleet Automated Deployments
> 来源: ado-wiki-b-fleet-automated-deployments.md | 适用: 适用范围未明确

### 排查步骤

#### Fleet Automated Deployments

#### Overview

Automated Deployments to AKS Fleet Manager can be performed just like deployments to a single AKS cluster.

Please refer to the [Automated Deployments wiki page](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Feature-Specific/Automated-Deployments) for specific info and troubleshooting, as it will be the same as on AKS clusters.

#### Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
**Contributors:**

---

## Scenario 3: Troubleshooting Flow
> 来源: ado-wiki-fleet-resourceplacement-tsg.md | 适用: 适用范围未明确

### 排查步骤

##### Complete Progress of ResourcePlacement

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

##### Common Issues

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

##### Low RP Completed Status Percentage Alert

When receiving this alert (triggered when <20% of RPs are completed in 30 minutes):

**Step 1**: Identify Affected RPs — Use regional/cluster-specific Kusto queries

**Step 2**: Check for User Errors — InvalidResourceSelector, RolloutControlledByExternalController

**Step 3**: Review Agent Logs — FleetAgentEvents

**Step 4**: Check for Staged Updates — Unknown state during staged rollouts is expected

**Step 5**: Verify Not a Recent Agent Release

**Step 6**: Escalate if Needed — Contact SIG Multi-Cluster On-Duty Teams Channel

##### Common Azure-Internal Issues

1. **Hub Cluster API Server Unavailable** — Check hub cluster health in ASI
2. **Member Agent Down** — Check MemberAgentDownAlert
3. **High Work Queue Depth** — Check HighWorkQueueDepth alert
4. **Snapshot Job Issues** — Check HighSnapshotJobDurationAlert
5. **Stuck Staged Update Runs** — Check HighStuckClusterStagedUpdateRunAlert

---
