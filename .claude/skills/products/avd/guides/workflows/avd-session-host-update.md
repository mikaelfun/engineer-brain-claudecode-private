# AVD Session Host Update (SHU) — Troubleshooting Workflow

**Scenario Count**: 6
**Generated**: 2026-04-18

---

## Scenario 1: Session Host Update (SHU) fails with error ImageHyperVGenera...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Select an image that matches the HyperV generation of the existing VMs in the host pool. If existing VMs are Gen1, use a Gen1 image for the update. To migrate from Gen1 to Gen2, the host pool must be recreated with new Gen2 VMs rather than using in-place session host update.

**Root Cause**: HyperV generation mismatch between the selected update image (Gen2/V2) and the existing session host VMs (Gen1/V1). AVD Session Host Update cannot change the VM generation in-place.

## Scenario 2: Session Host Update fails with DeniedAccessToCustomerResourc...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Restore the required RBAC permissions on the custom role: ensure 'Microsoft.Compute/virtualMachines/write' and 'Microsoft.Compute/disks/write' are included. Verify the AVD SHU service principal (oid: fccec22d-e6c5-4844-8ef1-1838c8b7cb8b) has the correct role assignment on the resource group containing the host pool.

**Root Cause**: The AVD service principal used by Session Host Update is missing required RBAC permissions. Specifically, 'Microsoft.Compute/virtualMachines/write' and/or 'Microsoft.Compute/disks/write' were removed from the custom role assigned to the AVD SHU service principal (appid: 9cdead84-a844-4324-93f2-b2e6bb768d07).

## Scenario 3: Session Host Update fails with UnableToAccessKeyvaultSecret_...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- In the Key Vault access policy or RBAC assignment for the AVD SHU service principal, enable both 'Get' AND 'List' under Secret Management Operations. 'Get' is required to read the VM-Local-Administrator-Password secret during Session Host Update.

**Root Cause**: The AVD SHU service principal lacks the 'Get' permission on Key Vault secrets. Only 'List' was enabled under Secret Management Operations; 'Get' was unchecked. The service principal (appid: 9cdead84-a844-4324-93f2-b2e6bb768d07) cannot retrieve the VM local admin password secret required for the update.

## Scenario 4: Session Host Update fails with MigrationMayExceedCapacityLim...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Increase the vCPU quota for the affected subscription and region via Azure portal (Subscriptions > Usage + quotas > Request increase), or delete unused compute resources to free capacity. Ensure the quota limit exceeds projected usage by at least the number of VMs being updated simultaneously (maxVMsUnavailableDuringUpdate).

**Root Cause**: The subscription's vCPU quota (Total Regional or SKU family) is insufficient to accommodate the temporary additional VMs created during Session Host Update. SHU creates new VMs before deleting old ones, requiring headroom above current usage.

## Scenario 5: During Session Host Update, the portal displays 'update is p...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- This is expected behavior. The update will eventually transition to fully paused once all active sessions have disconnected or drained. Advise customer to wait for the operation to complete. If stuck for several hours with no session activity, retry or cancel and re-initiate the update.

**Root Cause**: SHU waits for active user sessions to drain before fully transitioning to paused state. The 'update is pausing' status persists while session hosts are in drain mode, which can take extended time depending on session activity and drain timeout settings.

## Scenario 6: Session host update fails and rollback fails - host unavaila...
> Source: MS Learn | Applicable: ✅

### Troubleshooting Steps
- Check errors; retry or cancel; remove DSC extension from image; check activity logs

**Root Cause**: Image/SKU mismatch, agent failure, resource locks, or resource modifications during update
