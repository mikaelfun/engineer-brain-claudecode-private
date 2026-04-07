---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Government/Downgrade from GCC to FedRAMP"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FWindows%20365%20Government%2FDowngrade%20from%20GCC%20to%20FedRAMP"
importDate: "2026-04-05"
type: troubleshooting-guide
---

An existing Windows 365 Government for GCC customer who chooses to transition to Windows 365 Enterprise for FedRAMP will need to make several decisions prior to making the transitions as it will affect end-user experiences and administrators actions.

## The Considerations

Until we build a way to do a CPC move between Sovereign and Public Clouds, for all intents and purposes, when the offering transitions are made, CPCs provisioned with GCC licenses will be deleted. There's also a 72+ hours period after the GCC offering/licenses deletions are initiated, for those offerings to be completely out of a customer tenant. Meaning the FedRAMP offerings cannot be purchased nor activated until this time has elapsed. This is a construct of the Commerce system and cannot be subverted.

In order to successfully switch a tenant from GCC to FedRAMP, the customer should wait until all GCC license are deprovisioned before purchasing the new FedRAMP license.

## Consideration 1: When to initiate licenses deletion

For customers who have purchased the GCC licenses as a Volume License, a Commerce Support Ticket will need to be opened and queued, to initiate the deletion of the existing licenses for the GCC offering. Because of mutual exclusivity, until the licenses are completely deleted from the tenant, customers will not be able to begin the purchasing process of the FedRAMP licenses for the same tenant.

The deletion process takes at least 72 hours from the time of initiating the deletion, at which point Cloud PCs themselves will go into a Grace Period of 7 days. These times run concurrently, so decision makers should be considerate of potential end-user down times affected by how quickly purchasing gets processed.

## Consideration 2: Purchasing FedRAMP licenses against a different tenant

It is possible to make a purchase of the FedRAMP licenses without waiting for the deletion of the GCC licenses from a tenant, as long as that purchase is made against a different tenant in the same contract. The mutual exclusivity of the 2 offerings are at a tenant level.

**WARNING:** What that means, is that even if the purchase can be made, the activation/consumption of the licenses will still have to wait on the deletion of the previous (GCC) licenses to have completed.

## Confirm the customer tenant is ready to consume FedRAMP activation

After 72 hours have elapsed, the customer tenant should begin to finalize the GCC license getting removed from the tenant. For the customer, this should either look like the previous GCC licenses are greyed out or for them to be deleted completely when looking at "Your Products" under the M365 Admin Center.

### Additional check in Intune Console

Windows 365 blade will no longer show the message that Azure Government subscription is necessary and will show the Commercial message that they can try Windows 365 with Trials.

## Activate the FedRAMP licenses

When the customer activates the licenses against the tenant, the Windows 365 Enterprise for FedRAMP offerings should show up in Admin Center and in Entra to be able to assign to users. At the same time, in the backend the Windows 365 service should immediately onboard to the Commercial backend. Provided that the licenses show as deprovisioned, and furthermore that the Windows 365 service has offboarded from the GCP backend, the tenant is ready to consume the FedRAMP licenses.

## Kusto Queries

These queries need to be ran from a SAW device using PME account.

### Tenant GCC offboard validation

```kusto
CloudPCEvent
| where env_time >= ago(30d)
| where ServiceName =="AADSyncDaemonFunction"
| where AccountId =="<TenantId>"
| where EventUniqueName =="TryParseOrganization" or EventUniqueName == "TryParseSubscribedPlan" or EventUniqueName == "ParseDirectoryContext"
| project env_time, env_cloud_environment, env_cloud_name, ApplicationName, ComponentName, EventUniqueName, Col1, Col2 , Col3 , Col4, Message,ActivityId, AccountId,ContextId , UserId, PayLoadId
```

- env_cloud_name = GCP01 → still in GCC
- env_cloud_name = PRNA01 or PRNA02 → FedRAMP

### Tenant FedRAMP onboard validation

```kusto
CloudPCEvent
| where env_time >= ago(30d)
| where ApplicationName == "tn"
| where EventUniqueName == "PublishEventAsync"
| where Col1 == "Event publish succeed: Tenant.Onboard"
| where AccountId == "<TenantId>"
| project env_time, env_cloud_name, AccountId, Col1
```

```kusto
CloudPCEvent
| where env_time >= ago(30d)
| where ApplicationName == "LocationServiceFunction"
| where Col1 == "Tenant is soft deleted successfully."
| where AccountId == "<TenantId>"
| project env_time, env_cloud_name, AccountId, Col1
```
