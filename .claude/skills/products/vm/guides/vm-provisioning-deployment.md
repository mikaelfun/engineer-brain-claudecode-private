# VM VM 部署与预配 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 16 | **21V**: 12/16
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VM fails to start/redeploy/reapply with 'Provisioning failed with Internal execution error' (Provisi | CRP calls Madari Service during VM lifecycle operations when IsEnabledForNodeBas | 1. Query VMAllocationInfo.IsEnabledForNodeBasedCrashConsistentRestorePoint via K | 🔵 7.5 | AW |
| 2 | ACSS Create deployment fails with ARMTemplateDeploymentFailed/AuthorizationFailed. The user-assigned | The user-assigned managed identity provided by customer does not have the necess | Update the user-assigned managed identity to use the correct roles (e.g. Azure C | 🔵 7.5 | AW |
| 3 | ACSS deployment fails with ResourceNotPermittedOnDelegatedSubnet error. NIC cannot be created in sub | The appsubnet or dbsubnet used for ACSS deployment has a delegation setup to ext | Remove the delegation from the subnet. Query delegation: az network vnet subnet  | 🔵 7.5 | AW |
| 4 | VM deployment or resize fails with AllocationFailed or SkuNotAvailable error. | Insufficient cluster capacity in the target region/zone, or the requested VM siz | 1) Try a different VM size; 2) Try a different region or availability zone; 3) D | 🔵 7 | ON |
| 5 | PaaS solutions fail to deploy on diskless Dv4, Dsv4, Ev4, and Esv4 VMs; IaaS workloads unaffected | Known platform issue with PaaS on diskless (no local temp disk) v4 series VMs | Use disk VMs (Ddv4, Ddsv4, Edv4, Edsv4) instead for PaaS workloads until the iss | 🔵 6.5 | AW |
| 6 | VM or resource creation in Azure Public MEC (Edge Zone) fails; deployment error or resource not foun | Resources in Azure Public MEC require the 'extendedLocation' property (type: Edg | Add extendedLocation to every resource in the ARM template: {"type": "EdgeZone", | 🔵 6.5 | AW |
| 7 | Azure VM is stuck in Failed state in the Azure portal — VM status shows Failed and cannot be changed | The last operation run on the VM failed after its input was accepted, leaving th | Run the Reapply command: Portal: VM > Support + troubleshooting > Redeploy + rea | 🔵 6.5 | ML |
| 8 | VM deployment fails with InvalidVhd error: VHD footer cookie is not conectix. | VHD does not comply with 1MB alignment (size must be 1MB*N), has unallocated spa | Windows: Resize-VHD (Hyper-V role required), convert to fixed-size VHD. Linux: q | 🔵 6.5 | ML |
| 9 | VM deployment fails with cluster cannot support the requested VM size — AllocationFailed or Overcons | The hardware cluster backing the availability set or region does not have capaci | 1) Retry with a smaller VM size. 2) Stop all VMs in the availability set, then c | 🔵 6.5 | ML |
| 10 | Cannot deploy VM or VMSS with Capacity Reservation — deployment fails due to unsupported constraints | Multiple possible causes: (1) Using unsupported features with capacity reservati | Verify constraints are supported. Explicitly add capacity reservation as a VM/VM | 🔵 6.5 | ML |
| 11 | Msv2/Mdsv2 series VM quota approved but portal still cannot create the VM (e.g. Standard_M208s_v2).  | PG backend configuration was not updated after quota approval. The quota was gra | Engage PG via ICM to perform backend configuration update. After PG updates the  | 🔵 6.5 | ON |
| 12 | VMSS has failed instances that cannot be deleted or modified via portal/CLI. az vmss delete-instance | Specific VM instances stuck in inconsistent state: some return InstanceIdsListIn | 1) Query CRP ApiQosEvent to identify which instances return BadRequest/errors. 2 | 🔵 6 | ON |
| 13 | Azure VM stop/start/restart/redeploy fails with error: 'An unexpected error occurred while processin | Problem allocating or updating network resources during VM lifecycle operation. | Reapply the VM state: navigate to VM → Help → Redeploy + reapply → select Reappl | 🔵 5.5 | ML |
| 14 | Cannot deploy VM or VMSS (Uniform) with Capacity Reservation. Deployment fails or reservation is not | Multiple possible causes: (1) Unsupported constraints — Proximity Placement Grou | Remove unsupported constraints (PPG, UltraSSD, Spot, Dedicated Host, Availabilit | 🔵 5.5 | ML |
| 15 | Capacity Reservation creation fails with insufficient capacity error | Azure does not have capacity for the requested VM size + location + quantity com | Wait and retry later, or try different VM size/location/quantity. Creation is al | 🟡 4.5 | ML |
| 16 | Capacity Reservation enters Failed provisioning state | System error or quantity increase action caused Failed state | Use Application Change Analysis to find previous sku.capacity value, then modify | 🟡 4.5 | ML |

## 快速排查路径

1. **VM fails to start/redeploy/reapply with 'Provisioning failed with Internal execu**
   - 根因: CRP calls Madari Service during VM lifecycle operations when IsEnabledForNodeBasedCrashConsistentRestorePoint flag is se
   - 方案: 1. Query VMAllocationInfo.IsEnabledForNodeBasedCrashConsistentRestorePoint via Kusto (azcrpbi cluster, bi_allprod database) to confirm flag state and 
   - `[🔵 7.5 | AW]`

2. **ACSS Create deployment fails with ARMTemplateDeploymentFailed/AuthorizationFaile**
   - 根因: The user-assigned managed identity provided by customer does not have the necessary permissions to deploy a SAP workload
   - 方案: Update the user-assigned managed identity to use the correct roles (e.g. Azure Center for SAP solutions administrator) over the subscription. Customer
   - `[🔵 7.5 | AW]`

3. **ACSS deployment fails with ResourceNotPermittedOnDelegatedSubnet error. NIC cann**
   - 根因: The appsubnet or dbsubnet used for ACSS deployment has a delegation setup to external services. IP configuration cannot 
   - 方案: Remove the delegation from the subnet. Query delegation: az network vnet subnet show --query delegations. Remove: az network vnet subnet update --remo
   - `[🔵 7.5 | AW]`

4. **VM deployment or resize fails with AllocationFailed or SkuNotAvailable error.**
   - 根因: Insufficient cluster capacity in the target region/zone, or the requested VM size is not available in that location.
   - 方案: 1) Try a different VM size; 2) Try a different region or availability zone; 3) Deallocate existing VMs in the allocation group first; 4) Refer to allo
   - `[🔵 7 | ON]`

5. **PaaS solutions fail to deploy on diskless Dv4, Dsv4, Ev4, and Esv4 VMs; IaaS wor**
   - 根因: Known platform issue with PaaS on diskless (no local temp disk) v4 series VMs
   - 方案: Use disk VMs (Ddv4, Ddsv4, Edv4, Edsv4) instead for PaaS workloads until the issue is resolved
   - `[🔵 6.5 | AW]`

