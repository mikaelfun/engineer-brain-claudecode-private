---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Operation Abort"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOperation%20Abort"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Operation Aborts

## Overview

AKS supports aborting a long running operation, allowing you to take back control and run another operation seamlessly. This design is supported using the Azure REST API or the Azure CLI.

The abort operation supports the following scenarios:

- If a long running operation is stuck or suspected to be in a bad state or failing, the operation can be aborted provided it's the last running operation on the Managed Cluster or agent pool.
- An operation that was triggered in error can be aborted as long as the operation doesn't reach a terminal state first.

## Abort operation TSG

### Expected behavior

Nodes/clusters that have already been upgraded before the abort will have an upgraded config. The abort stops the operation so that the rest of the clusters/nodes are not upgraded or any ongoing upgrades (provisioning state upgrading) are also aborted. The abort essentially cancels the context so the ongoing operation fails to complete due to context having been canceled.

**Rollback is not intended as part of the Abort operation.**

### Considerations

- Abort can be run at managed cluster or agent pool level.
- Abort can only be run on the latest operation ID running on managed cluster or agent pool.
- A successful error code indicates the abort request has passed sync side validations and is in the queue.
- Async side success is still a best effort scenario.

### Validations / potential causes for errors

- Abort is not applicable for Delete operations.
- If provisioning state reaches terminal state before Abort request is accepted, Abort will be rejected.
- Abort cannot be run on an ongoing Abort.
- "Operation Not supported" indicates a toggle has disabled abort, possibly due to a breaking change.

### Verifying abort was successful

1. Provisioning state on MC/AP should be 'Canceled' - Run GET on MC/AP to verify. Should update within seconds.
2. Operation status of last running operation ID should be in 'Canceling' status.
3. Track logs through:
   - `AsyncContextActivity` (before context cancellation)
   - `AsyncContextlessActivity` (after context cancellation)

Successful cancel log: `"Operation: %s, finished with status: %s, with error: %s"`

## References

- https://docs.microsoft.com/en-us/azure/aks/manage-abort-operations?tabs=azure-cli
