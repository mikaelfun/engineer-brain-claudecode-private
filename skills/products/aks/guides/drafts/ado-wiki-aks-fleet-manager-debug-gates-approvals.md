---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS Fleet Manager/TSG/Debug Gates and Approvals"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS%20Fleet%20Manager/TSG/Debug%20Gates%20and%20Approvals"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to debug Gates/Approvals in Fleet update runs

## Background

Fleet allows customers to configure approvals before and after the updates in their update runs. These approvals are modelled by Gate resources, which link to the update runs they are gating.

Reference: [Public doc](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/update-strategies-gates-approvals) | [Gate APIs](https://learn.microsoft.com/en-us/rest/api/fleet/gates/get?view=rest-fleet-2025-04-01-preview&tabs=HTTP)

## RBAC permissions

To approve a gate means calling the `PATCH Gate` API, changing the `state` to `Completed`. This uses standard ARM RBAC. There is no new built-in role for approving. It has been added to the **Azure Kubernetes Fleet Manager Contributor Role** so existing users should be able to approve with no additional role assignments.

## Logs

Gate logs are in the standard Fleet tables, e.g. FleetAPIQoSEvents.

### Find recent gate approvals

```kql
FleetAPIQoSEvents
| where TIMESTAMP > ago(1d)
| where operationName == "PatchGate"
| project-reorder TIMESTAMP, resourceId, httpStatus
```

## Debugging: Customer approved a gate, but the update run is still pending

Because gates and update runs are separate resources, approving the gate and updating the matching update run status happen separately. The latter is done asynchronously via a GateDoneEvent message that goes via ServiceBus.

**Common cause**: Customer's code queries the update run *immediately* after sending the approval. They need to wait a second or so before the update run is changed.

### Check async handling logs

```kql
FleetAsyncContextActivityEvents
| where TIMESTAMP > ago(1d)
| where messageType == "GateDoneEvent"
| project-reorder TIMESTAMP, msg
```

Errors on the async side are not reported to the customer, but should show what's going wrong when updating the update run.

## ARN integration

Customers can build automation for approvals using ARN/ARG integration to publish customer-facing events to EventGrid SystemTopics. The customer can then route events to Azure Functions or other EventGrid destinations for healthchecks, and if they look good, approve the update run by calling `PATCH Gate` API.

Reference: [ARN Event Schema](https://learn.microsoft.com/en-us/azure/event-grid/event-schema-resource-notifications)
