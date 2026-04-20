# AVD AVD Session Host Update (SHU) - Comprehensive Troubleshooting Guide

**Entries**: 6 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, MS Learn

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Session Host Update (SHU) fails with error ImageHyperVGenerationDoesNo... | HyperV generation mismatch between the selected update image (Gen2/V2)... | Select an image that matches the HyperV generation of the existing VMs... |
| Session Host Update fails with DeniedAccessToCustomerResource / Author... | The AVD service principal used by Session Host Update is missing requi... | Restore the required RBAC permissions on the custom role: ensure 'Micr... |
| Session Host Update fails with UnableToAccessKeyvaultSecret_1024: 'Una... | The AVD SHU service principal lacks the 'Get' permission on Key Vault ... | In the Key Vault access policy or RBAC assignment for the AVD SHU serv... |
| Session Host Update fails with MigrationMayExceedCapacityLimit_1024: '... | The subscription's vCPU quota (Total Regional or SKU family) is insuff... | Increase the vCPU quota for the affected subscription and region via A... |
| During Session Host Update, the portal displays 'update is pausing' st... | SHU waits for active user sessions to drain before fully transitioning... | This is expected behavior. The update will eventually transition to fu... |
| Session host update fails and rollback fails - host unavailable | Image/SKU mismatch, agent failure, resource locks, or resource modific... | Check errors; retry or cancel; remove DSC extension from image; check ... |

### Phase 2: Detailed Investigation

#### Entry 1: Session Host Update (SHU) fails with error ImageHyperVGenera...
> Source: ADO Wiki | ID: avd-ado-wiki-0832 | Score: 8.0

**Symptom**: Session Host Update (SHU) fails with error ImageHyperVGenerationDoesNotMatchExistingVms_1024: 'Image requires a HyperV generation V2 incompatible with the HyperV generation V1 associated with existing VMs in the Host Pool.' Customer attempts to update session hosts using a Gen2 gallery image but the host pool was originally deployed with Gen1 VMs.

**Root Cause**: HyperV generation mismatch between the selected update image (Gen2/V2) and the existing session host VMs (Gen1/V1). AVD Session Host Update cannot change the VM generation in-place.

**Solution**: Select an image that matches the HyperV generation of the existing VMs in the host pool. If existing VMs are Gen1, use a Gen1 image for the update. To migrate from Gen1 to Gen2, the host pool must be recreated with new Gen2 VMs rather than using in-place session host update.

> 21V Mooncake: Applicable

#### Entry 2: Session Host Update fails with DeniedAccessToCustomerResourc...
> Source: ADO Wiki | ID: avd-ado-wiki-0833 | Score: 8.0

**Symptom**: Session Host Update fails with DeniedAccessToCustomerResource / AuthorizationFailed: 'The client does not have virtualMachines/write or disks/write permission.' Update reaches UpdateFailed state with faultCode DeniedAccessToCustomerResource.

**Root Cause**: The AVD service principal used by Session Host Update is missing required RBAC permissions. Specifically, 'Microsoft.Compute/virtualMachines/write' and/or 'Microsoft.Compute/disks/write' were removed from the custom role assigned to the AVD SHU service principal (appid: 9cdead84-a844-4324-93f2-b2e6bb768d07).

**Solution**: Restore the required RBAC permissions on the custom role: ensure 'Microsoft.Compute/virtualMachines/write' and 'Microsoft.Compute/disks/write' are included. Verify the AVD SHU service principal (oid: fccec22d-e6c5-4844-8ef1-1838c8b7cb8b) has the correct role assignment on the resource group containing the host pool.

> 21V Mooncake: Applicable

#### Entry 3: Session Host Update fails with UnableToAccessKeyvaultSecret_...
> Source: ADO Wiki | ID: avd-ado-wiki-0834 | Score: 8.0

**Symptom**: Session Host Update fails with UnableToAccessKeyvaultSecret_1024: 'Unable to access Keyvault Secret for secret VM-Local-Administrator-Password. Keyvault request failed with Status 403 Forbidden, ForbiddenByPolicy - does not have secrets get permission on key vault.'

**Root Cause**: The AVD SHU service principal lacks the 'Get' permission on Key Vault secrets. Only 'List' was enabled under Secret Management Operations; 'Get' was unchecked. The service principal (appid: 9cdead84-a844-4324-93f2-b2e6bb768d07) cannot retrieve the VM local admin password secret required for the update.

**Solution**: In the Key Vault access policy or RBAC assignment for the AVD SHU service principal, enable both 'Get' AND 'List' under Secret Management Operations. 'Get' is required to read the VM-Local-Administrator-Password secret during Session Host Update.

> 21V Mooncake: Applicable

#### Entry 4: Session Host Update fails with MigrationMayExceedCapacityLim...
> Source: ADO Wiki | ID: avd-ado-wiki-0835 | Score: 8.0

**Symptom**: Session Host Update fails with MigrationMayExceedCapacityLimit_1024: 'Resources created during the update process may cause subscription limits to be exceeded for Total Regional vCPUs or StandardBSFamily vCPUs.' Update is blocked before new VMs are deployed.

**Root Cause**: The subscription's vCPU quota (Total Regional or SKU family) is insufficient to accommodate the temporary additional VMs created during Session Host Update. SHU creates new VMs before deleting old ones, requiring headroom above current usage.

**Solution**: Increase the vCPU quota for the affected subscription and region via Azure portal (Subscriptions > Usage + quotas > Request increase), or delete unused compute resources to free capacity. Ensure the quota limit exceeds projected usage by at least the number of VMs being updated simultaneously (maxVMsUnavailableDuringUpdate).

> 21V Mooncake: Applicable

#### Entry 5: During Session Host Update, the portal displays 'update is p...
> Source: ADO Wiki | ID: avd-ado-wiki-0836 | Score: 7.0

**Symptom**: During Session Host Update, the portal displays 'update is pausing' status for 40+ minutes with no apparent progress. Customer believes the operation is stuck or hung.

**Root Cause**: SHU waits for active user sessions to drain before fully transitioning to paused state. The 'update is pausing' status persists while session hosts are in drain mode, which can take extended time depending on session activity and drain timeout settings.

**Solution**: This is expected behavior. The update will eventually transition to fully paused once all active sessions have disconnected or drained. Advise customer to wait for the operation to complete. If stuck for several hours with no session activity, retry or cancel and re-initiate the update.

> 21V Mooncake: Applicable

#### Entry 6: Session host update fails and rollback fails - host unavaila...
> Source: MS Learn | ID: avd-mslearn-055 | Score: 6.0

**Symptom**: Session host update fails and rollback fails - host unavailable

**Root Cause**: Image/SKU mismatch, agent failure, resource locks, or resource modifications during update

**Solution**: Check errors; retry or cancel; remove DSC extension from image; check activity logs

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
