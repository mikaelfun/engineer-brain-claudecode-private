---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Upgrade-Undrainable Node Behavior Cordon"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Upgrade-Undrainable%20Node%20Behavior%20Cordon"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Upgrade Undrainable Node Behavior Cordon

[[_TOC_]]

## Overview

### Cordon Behavior

A node pool's undrainable node behavior is how the node behaves if it hits Pod Disruption Budget(PDB) error during an upgrade operation.

By default, node pools have a undrainableNodeBehavior 'Schedule', which is our currently node behavior when a node hits PDB error during upgrade. By this behavior, if a node is blocked by PDB error, then we may also delete its according surge node. So there will be no extra nodes retained no matter of upgrade is successful or not.

But with the new undrainableNodeBehavior 'Cordon', when nodes hit PBD error during upgrade, we allow surge nodes to be retained to replace the blocked nodes, and the blocked nodes will be unscheduled for pods
and marked with label "kubernetes.azure.com/upgrade-status:Quarantined". In this way, customers can manually schedule their pods to retained nodes, fix their PDB and reconcile the managed cluster or agentpool
back to succeeded state by their own.

### Cordon Behavior with maxBlockedNodes setting

When cx use undrainableNodeBehavior 'Cordon', they can use the maxBlockedNodes to choose the maximum nodes they would like to cordon during upgrade when there is PDB drain error. This value should be at least eqaul to maxSurge if specified.

This makes us surge several batches for customers if they use up all maxSurge nodes during upgrade because of pdb drain failure. E.g. CX has 3 nodes in their agentpool, and they specify maxBlockedNodes as 2 and maxSurge as 1 for Cordon behavior.

In this case, we will surge 1 node at first(maxSurge: 1), and the first node upgrade failed because of pdb drain failure. We have 1 more quota(maxBlockedNodes: 2 and 1 surge node has been retained for the first node, so 2 - 1 = 1), so we can surge 1 node again.

If the rest nodes can be upgraded successfully, then at last, we totally have 4 nodes, which are 3 original nodes(1 not upgraded, 2 upgraded) and 1 surge node(retained for the first failed node). The second surged node is removed.

This maxBlockedNodes now only supports 2025-03-02preview and newer preview API.

## Troubleshooting

- Check if there's a `undrainableNodeBehavior` set on any of the agent pools, either via

```sh
$ az aks show --name clusterName --resource-group resourceGroupName
...
      "upgradeSettings": {
        "drainTimeoutInMinutes": null,
        "maxSurge": null,
        "undrainableNodeBehavior": "Cordon"
      },
...
```

or by checking the `AgentPoolSnapshot` table (this will also provide insight into whether the setting was recently changed):

```sql
// undrainableNodeBehavior 0: Unspecified, 1: Schedule, 2: Cordon
AgentPoolSnapshot
| where id == "/subscriptions/<subscriptionId>/resourcegroups/<rgName>/providers/Microsoft.ContainerService/managedClusters/<clusterName>/agentPools/<apName>"
| sort by TIMESTAMP desc
| take 10
| extend apProperties = parse_json(log)
| extend undrainableNodeBehavior = apProperties.upgradeSettings.undrainableNodeBehavior
| project TIMESTAMP, RPTenant, upgradeSettings, undrainableNodeBehavior
```

Even though customers choose undrainableNodeBehavior 'Cordon', if there are other errors(e.g. reimage error) expect PDB error happens during upgrade or upgrade is succeeded,
this 'Cordon' behavior will not be triggered. So we should still see the exact same behavior as current upgrade behavior 'Schedule', that means we should not see more that original nodes if upgrade successfully.

- For one upgrade operation, if a node pool is configured with undrainableNodeBehavior 'Cordon', and one of the nodes is blocked by PDB, we can use the following
Kusto query to check whether it is replaced by one surge node.

```sql
AsyncContextActivity
| where TIMESTAMP > ago(10d)
| where msg contains "in VMSS is cordoned, and one surged VM will be used to replace it"
```

It is expected that customers will have more nodes in the agentpool than the original node count if there is PDB error during upgrade with 'Cordon' behavior. For example, the agentpool has 2 nodes, and maxSurge is 2, during
upgrade, one node is upgraded successfully and the other node is blocked. In this case, after the upgrade is failed, customer's agentpool will have 3 nodes, one is blocked,
and the other 2 are upgraded nodes.

Accordingly, if cx use `Cordon` behavior for their upgrade, we can check whether they use `maxBlockedNodes` for their agentpool as following.

```sql
AgentPoolSnapshot
| where TIMESTAMP > ago(7d)
| extend apProperties = parse_json(log)
| extend maxBlockedNodes = apProperties.upgradeSettings.maxBlockedNodes
| where maxBlockedNodes != "" and maxBlockedNodes != "0"
| project TIMESTAMP, RPTenant, upgradeSettings, maxBlockedNodes
```

As mentioned in the above, if maxBlockedNodes > maxSurge, multiple batches of surge nodes are expected.

If cx would like to opt out from maxBlockedNodes

- If they still specifies Cordon, they need to set maxBlockedNodes as maxSurge
- If they want to specifies Schedule upgrade behavior, they need to set maxBlockedNodes as 0.

## Customer Manual Intervention

Customers can do the following steps to check their nodes, reschedule and fix their PDB and reconcile back the managed cluster/agentpool back to succeeded state.

- Customers can list cordoned nodes using the following commands

`kubectl get nodes --show-labels=true`

And this will clearly show which nodes are cordoned with label "kubernetes.azure.com/upgrade-status:Quarantined"

![undrainable-cordon.png](/.attachments/undrainable-cordon-2dc49633-6ab6-426a-9de8-be22f051cf68.png)

- Customers can manually reschedule their pods to the new schedulable nodes.
- Customers can also fix their PDB issues on the blocked nodes(those are labeld with "kubernetes.azure.com/upgrade-status:Quarantined")
- Reconcile back the agentpool

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>