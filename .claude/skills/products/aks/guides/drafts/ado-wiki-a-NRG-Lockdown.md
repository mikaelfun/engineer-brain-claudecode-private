---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/NRG Lockdown"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNRG%20Lockdown"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Node Resource Group Lockdown

[[_TOC_]]

## Overview

NRG-Lockdown is a feature which restricts available permissions on the managed node resource group. It puts a deny assignment on the node resource group to block modification, similar to what ARO does.

There are three current levels of restriction:

- ReadOnly (publicly accessible in preview)
- Restricted (this restriction level is used by all fleet clusters. Only accessible via internal private preview)
- Unrestricted (default restriction level with no restrictions applied. Feature is off in this state)

In all states AKS' first party SP, and other management identities (cluster MSI/SP, and any addon ids that require permissions on the NRG) should have access to the cluster unrestricted.

## Potential issues (see sections below)

- Operation unexpectedly blocked
- Operation that should get blocked is allowed
- Cluster failing with "`A hash conflict was encountered for the deny Assignment ID. Please use a new Guid.`"

### Operation unexpectedly blocked

First answer the following questions:

- Is this a customer Op?
- Should this call actually be getting allowed?
- Is this a fleet cluster?

#### `yes`, `yes`, `yes`

The only way to get access is to use the admin rest endpoint to temporarily lift the deny assignment on the NRG: <https://portal.microsoftgeneva.com/D1A601D1?genevatraceguid=1180adc9-afb5-49f5-9334-082aa3881657>

#### `yes`, `yes`, `no`

The customer should be able to get access by switching cluster to `Unrestricted`.

If the request to update the cluster restriction level to `Unrestricted` is blocked/failing, than the admin rest endpoint can be used to gain access by temporarily lifting the deny assignment: <https://portal.microsoftgeneva.com/D1A601D1?genevatraceguid=1180adc9-afb5-49f5-9334-082aa3881657>

#### `*`, `no`, `*`

Why is there an issue if the blocked op shouldn't be getting allowed anyways?

#### `no`, `yes`, `*`

Is this a missing addon, or other management op? If so it might be currently missed within the NRG-Lockdown deny assignment template for exempt ids.

### Operation that should get blocked is allowed

First answer the following questions:

- Is there a deny assignment on the NRG?
- Is the cluster's provisioning state Succeeded?
- Is this a fleet cluster?
- Is the operation triggering a modify policy?

#### `no`, `no`, `*`, `no`

Attempt reconciling the cluster to a Succeeded provisions state.

Is the operation that should get blocked is still allowed? If yes, follow this TSG section again with this new state to find the correct solution. Otherwise, you're done!

#### `no`, `yes`, `*`, `no`

Is the cluster's restriction level `Unrestricted`?

- `yes`: Is this a Fleet cluster? If so, this should never occur. Otherwise, the customer should be able to get the deny assignment back by switching cluster to `ReadOnly`.
- `no`: This means the deny assignment was removed by the admin rest endpoint by a previous oncall engineer. To get this cluster back to its expected state run a reconcile on the cluster.

#### `yes`, `*`, `no`, `no`

If its a non `*/read` operation than there is an issue with with RBAC's auth system as only `*/read` operations should be getting allowed. Contact the RBAC team for further investigation/assistance.

#### `yes`, `*`, `yes`, `no`

Since fleet clusters use the restriction level `Restricted` it allows for some operations that we would actually prefer were blocked in a perfect world. Is this allowed operation using one of the the permissions that are actually allowed (the `NotActions` list of the deny assignment, or its a data action)?

If its not in the `NotActions`, nor is a data action than there is an issue with RBAC and their auth system as its allowing something unexpected that it shouldn't be. Contact the RBAC team for further investigation/assistance.

#### `*`, `*`, `*`, `yes`

This is a feature gap within RBAC deny assignments, and the policy team's handling of identities within requests.

If a modify policy is triggered for a request it will modify the original request using the original ids of the request for RBAC permissions validation. This interaction causes any modify policy to slip past the deny assignment if triggered on requests using an exempt id (first party SP, cluster id, or exempt addon ids)

This is a feature gap, and so there is nothing we can currently do about this.

### Cluster failing with `A hash conflict was encountered for the deny Assignment ID. Please use a new Guid.`

Sadly this is a issue within the RBAC dependency which we have little to no control over.

To fix this the customer must create a cluster with a new NRG name. This can be done by directly specifying the NRG name in the API, or changing the cluster name/resource group of the cluster to cause a different NRG name generation if not specified.

## Misc useful information

### NRG-Lockdown Dashboard

The following dashboard is a good location to start looking for any widespread issues, and/or finding base queries to monitor `NRG-Lockdown`: <https://dataexplorer.azure.com/dashboards/a8be48d9-36cf-42f6-985d-657050ac0c47?p-_startTime=24hours&p-_endTime=now&p-_error_startTime=7days&p-_error_endTime=now#7871b9d8-8812-4eb5-a2b2-680ba678725f>

### Removing the NRG-Lockdown deny assignment

Use the following geneva action to temporarily lift the deny assignment created by NRG-Lockdown on the managed NRG: <https://portal.microsoftgeneva.com/D1A601D1?genevatraceguid=1180adc9-afb5-49f5-9334-082aa3881657>

Executing this will remove the deny assignment until another reconciler occurs. This can be done at the same time as another ongoing operation.

## References

- [Public Docs](https://learn.microsoft.com/en-us/azure/aks/cluster-configuration#fully-managed-resource-group-preview)
