---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/Service Healing_How It Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FService%20Healing_How%20It%20Works"
importDate: "2026-04-06"
type: troubleshooting-guide
tags:
  - cw.How-It-Works
  - cw.Reviewed-07-2025
---

[[_TOC_]]

# **Service Healing**

Service healing is an auto-recovery mechanism that allows the movement of compute resources, such as Virtual Machines (VMs) or Virtual Machine Scale Sets (VMSS) instances, to a different host to improve their availability.

This healing process is enabled and available across all different VM sizes and offerings, across all regions and datacenters.

Service Healing can be triggered:

* Using the API (example of customer triggering the redeploy)
    > API is directly asking for a SH.
    > Hardware Decomm will be different here as they will be reaching out to a tool from the Holmes team to trigger the jobs for SH.

* When a fault occurs on the host or the container.
    > Anvil/CM (Container Manager) will have the health information and the faulting info. Then it will contact Holmes to understand whether for the failed role instance we should go for SH (Service Healing) or LM (Live Migration).
    > If LM is not an option, Holmes will reach out to the Service Healing Manager that, depending on the type of tenant, will send the request through FC SH or AzSM SH.

**Flow:**
```
Fault → Anvil/CM → Holmes → [SH or LM?]
  If SH → FC SH Manager → [AzSM tenant?]
    No  → FC SH
    Yes → AzSM SH
API → AzSM SH / FC SH directly
```

## **Control Plane Stacks for Service Healing**

Currently, each control plane stack has individual implementation:
 * AzSM SH (Azure SM Service Healing)
 * FC SH (Fabric Service Healing)
 * AzCim SH

**Note:** Focus is on AzSM and FC implementations.

FC Service Health Manager (SHM) decides if we will have AzSM SH or FC SH. SHM takes into consideration if the tenant name associated with the container is or is not an AzSM tenant.

**Sequence:**
- FCServiceHealthManager runs every 10 seconds, separating faulted containers into FC and AzSM categories
- If container belongs to FC → FC Service Healing triggered
- If container belongs to AzSM → AzSMNotifier called → AzServiceHealthManager processes the migration

Currently, the majority of Service Healing types are AzSM SH.

## **Service Healing Trigger Types**

Depending on the reason for the auto recovery, different Service Healing exists:
 * **CustomerInitiatedMigration** — Customer initiated a Redeploy operation or performed self-placed maintenance
 * **UnhealthyNode** — Node is marked as Unhealthy/Human Investigate
 * **Container** — Container is in a faulted state
 * **FshWithDeadlineOnUnallocatableNode** — Service Healing after unallocatable policy times out
 * **TargetPoolMismatch** — Same cluster Service Healing (specifically for Planned Maintenance / Hardware Decomm)
 * **ClusterEvacuation** — Cross-cluster SH (specifically for Planned Maintenance / Hardware Decomm)

### Container Service Healing

When a container is faulted, Anvil/CM will try to recover the container by rebooting initially. If after that the container is still in a failed state, Anvil/CM raises a fault scope of service manager. Then FC SHM receives that fault and decides whether to trigger service healing.

### Decommission Service Healing - Planned Maintenance Hardware Decomm

Decommission offloads clusters/machine pools in a cluster when the datacenter needs to perform hardware updates or replace older machines. Holmes triggers the request of type ClusterEvacuation or TargetPoolMismatch.

For more information: [Hardware Decommissioning_Planned Maint](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496013/)

## **Service Healing Steps**

### **Fabric Service Healing Steps (Ordered by Expected Execution):**

```
Start → SelectContainerStep → ReevaluateContainerStep
  → (HealPrepareAndWait) → ReallocateContainerStep
  → IsolateContainerStep → StartContainerMigrationStep
  → WaitForMigrationCompletionStep → (HealRestoreAndWait) → back to SelectContainerStep
```

* **ContainersSelected** — Pick of the SH Job
* **ContainersReevaluated** — Check if fault still exists; cancel job if no longer faulted
* **ContainerReallocated** — Send allocation request to allocator
* **ContainerIsolationCompleted** — Isolation of source container
* **ContainerMigrationRoleInstanceStateDisconnecting** — Disconnection of source container
* **ContainerMigrationRoleInstanceStateConnecting** — Connection of destination container
* **CheckForMigrationCompletionPending** — Checks quorum (CheckForMigrationCompletionQuorumStateChange)
* **FinalizedContainerMigrationRequest** — Finalize and cleanup

### **AzSM Service Healing Steps (Ordered by Expected Execution):**

1. **ContainerMigrationUnknownState** → Reevaluate with FC
2. Check AzHealthStoreService: is SH Enabled?
3. **WaitingForContainerMigrationApprovalStep** — Check if AZ level SH enabled, if tenant is AzPEEnabled
4. **WaitingForAzPEInProgressNotificationStep** — Notify AzPE if enabled; wait for approval
5. **ContainerReallocationStep** — Setup allocation restrictions, send request to AzAllocator
6. **ContainerAllocationAndSvdPartitioningStep** — Wait for allocation, send result to Fabric
7. **WaitingForFcPersistancStep** — Wait for FC persistence; rollback if failed, commit if succeeded
8. **ContainerAllocationCommitStep** — Commit allocation to AzAllocator
9. **RoleInstanceDisconnectAndContainerIsolateStep** — Send FRIC, disconnect role instance
10. **WaitingForSourceContainerIsolationStep** — ⚠️ If delay here, review stop/destroy on source container
11. **RoleInstanceConnectStep** — Connect role instance to destination container, send RNM notification
12. **WaitingForTargetContainerHealthStateStep** — Wait for confirmation container is healthy
13. **WaitingForAzPECompletedNotificationStep** — Notify AzPE that SH completed
14. **ContainerMigrationCleanupStep** — Complete SH and cleanup

## ASI

Validate service healing on VM Availability or Unexpected Restart workflow page.

- [ASI: EEE RDOS - VM Availability](https://asi.azure.ms/services/EEE%20RDOS/pages/VM%20Availability?) — Fabric/Tenant Tab → Service Healing section
- Check `ServiceHealingTenantStatusEtwTable` under the Fabric/Tenant tab
- For Unexpected Restart WF page: Service Healing tab has a dedicated view

## Kusto Queries

### AzSM

```kusto
// Check if SH was triggered
cluster("accp.centralus.kusto.windows.net").database("AZSM").AzSMServiceHealingTriggerEvents
| where PreciseTimeStamp between (datetime({StartTime})..datetime({EndTime}))
| where tenantName =~ "{tenantName}" and roleInstanceNames contains "{VMName}"
| project PreciseTimeStamp, Tenant, triggerType, migrationRequestDetails, JobId
```

```kusto
// Check result of SH
cluster("accp.centralus.kusto.windows.net").database("AZSM").AzSMServiceHealingResultEvents
| where PreciseTimeStamp between (datetime({StartTime})..datetime({EndTime}))
| where JobId has_any (jobids)
| extend StartTime = datetime_add('millisecond', -totalDurationInMilliSeconds, PreciseTimeStamp)
| project StartTime, PreciseTimeStamp, totalDurationInMilliSeconds, result, failureReason, triggerType, JobId
```

> **Note:** For full Kusto queries reference and additional context, see the full wiki page at the sourceUrl above.
