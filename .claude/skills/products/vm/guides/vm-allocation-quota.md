# VM 分配与配额 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 19 | **21V**: 16/19
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VM creation fails due to offer restriction in China East 2 and China North 2 regions; new subscripti | Since March 2nd 2022, newly created subscriptions no longer have EA default 350- | Raise 21V Commerce case to request quota. Urgent: field team to BG PMM. RDQuota# | 🟢 9 | ON |
| 2 | VMSS creation fails with 'Allocation failed. We do not have sufficient capacity' when deploying Serv | The failed VMSS had an invalid/inaccessible DSMS certificate URL (SSLCertificate | Compare VMSS deployment templates between successful and failed resources. Verif | 🟢 8 | ON |
| 3 | SAP customer cannot create VM with specified subscription and region in Azure China | Insufficient VM quota in the target subscription/region | Advise customer to submit a commerce/quota increase case for the specific VM SKU | 🟢 8 | ON |
| 4 | VMSS/AKS node pool creation fails with allocation failure error despite sufficient SKU capacity show | The target compute cluster is not onboarded to AzSM (Azure Smart Allocation). Wh | 1) Verify allocation failure via VMApiQosEvent Kusto. 2) Get activityId and chec | 🟢 8 | ON |
| 5 | Cannot resize CVM or change security properties — errors: 'Cannot resize a VM with confidential comp | CVM securityEncryptionType and SecurityType are immutable after creation. CVM SK | Cannot change security properties or resize across CVM/non-CVM families. Must de | 🔵 7.5 | AW |
| 6 | APIPA address. DHCP enabled but no IP. Fabric discovery failure. | NmProgramming or Network Allocation incomplete. | Check ASC IsNmProgrammingComplete. NetVMA for TOR. Engage Network team. | 🔵 7.5 | AW |
| 7 | Azure subscription restricted from creating specific VM sizes in certain regions; quota request reje | New subscriptions may have offer restrictions limiting available VM SKUs or core | Request to move unused quota cores from an older subscription (with available un | 🔵 7.5 | ON |
| 8 | VMSS scale-out fails: OperationNotAllowed/QuotaExceededWithPortalLink | Regional vCPU quota exceeded | Submit quota increase at https://aka.ms/ProdportalCRP | 🔵 7 | ON |
| 9 | az vm list-vm-resize-option shows incorrect resize targets for diskless Dv4/Ev4 VMs, listing older g | CLI bug in az vm list-vm-resize-option returns wrong resize options; actual resi | Ignore misleading CLI output; diskless VMs can only resize to other diskless SKU | 🔵 6.5 | AW |
| 10 | Error 'Cannot resize a VM of size X with CPU Architecture Arm64 to a VM of size Y with CPU Architect | Azure does not support resizing between different CPU architectures; Arm64 and x | Arm64 VMs can only be resized to other Arm64 VM sizes (suffix 'p'); to switch to | 🔵 6.5 | AW |
| 11 | Error: 'Cannot resize a VM of size X with CPU Architecture Arm64 to a VM of size Y with CPU Architec | Customer attempted to resize an Arm64 VM (sizes with 'p' suffix) to an x86/x64 V | Arm64 VMs can only be resized to other Arm64 VM sizes (sizes with 'p' suffix). S | 🔵 6.5 | AW |
| 12 | 客户新订阅无法在 Korea South 区域部署 VM（Compute），收到配额或权限拒绝错误 | Korea South 区域已实施 Offer Restrictions 模型（2022年2月起）：为将新部署引导至 Korea Central（具备3个AZ） | 客户需通过 Azure Portal 提交 Korea South 区域的配额增加请求以申请 allow list：https://docs.microsoft | 🔵 6.5 | AW |
| 13 | 客户使用 DCsv2-series VM 遇到容量不足（2025年7月后）或面临 2026年6月30日退役 | DCsv2-series 将于 2026-06-30 退役；2025-07-01 起开始实施容量限制，可能导致 allocation failure | 在 2026-06-30 前迁移：(1) 继续 Intel SGX 路径 → DCdsv3（性能更高、内存更大）；(2) lift-and-shift → DC | 🔵 6.5 | AW |
| 14 | Genomics workflow submission fails with error when customer already has 20 workflows running concurr | Microsoft Genomics enforces a quota of 20 concurrent workflows per Genomics acco | Wait for existing workflows to complete before resubmitting; both the concurrent | 🔵 6.5 | AW |
| 15 | Azure VM start or resize fails with allocation failure error. Stopped VM cannot be restarted, or exi | Original cluster hosting the VM does not have free space or does not support the | For start failure: stop all VMs in the availability set → restart each VM (relea | 🔵 6.5 | ML |
| 16 | Cannot resize VM to a different size family — VM size family not visible when resizing | Running VMs are deployed to physical server clusters with specific hardware. Res | For Resource Manager VMs: stop all VMs in the availability set before changing t | 🔵 6.5 | ML |
| 17 | Capacity Reservation creation fails - VM size unsupported | Not all VM sizes supported with Capacity Reservation | Check supported VM sizes at Capacity Reservation limitations docs. Use a support | 🟡 4.5 | ML |
| 18 | Capacity Reservation creation fails with insufficient quota | Subscription lacks quota for the requested VM size | Request quota increase via Azure portal or try different VM size/location/quanti | 🟡 4.5 | ML |
| 19 | Cannot delete Capacity Reservation or Group | VMs or VMSS still associated to the reservation. Group requires all member reser | Disassociate all VMs/VMSS, delete individual reservations, then delete the Group | 🟡 4.5 | ML |

## 快速排查路径

1. **VM creation fails due to offer restriction in China East 2 and China North 2 reg**
   - 根因: Since March 2nd 2022, newly created subscriptions no longer have EA default 350-core compute quota for CE2/CN2. Old subs
   - 方案: Raise 21V Commerce case to request quota. Urgent: field team to BG PMM. RDQuota# submitted by 21V. Commerce hours: 09:00-18:00 weekdays. Ref: https://
   - `[🟢 9 | ON]`

2. **VMSS creation fails with 'Allocation failed. We do not have sufficient capacity'**
   - 根因: The failed VMSS had an invalid/inaccessible DSMS certificate URL (SSLCertificate.pfx with trailing space) in its dsmsCon
   - 方案: Compare VMSS deployment templates between successful and failed resources. Verify all certificate URLs in dsmsConfiguration are valid, accessible, and
   - `[🟢 8 | ON]`

3. **SAP customer cannot create VM with specified subscription and region in Azure Ch**
   - 根因: Insufficient VM quota in the target subscription/region
   - 方案: Advise customer to submit a commerce/quota increase case for the specific VM SKU and region needed.
   - `[🟢 8 | ON]`

4. **VMSS/AKS node pool creation fails with allocation failure error despite sufficie**
   - 根因: The target compute cluster is not onboarded to AzSM (Azure Smart Allocation). When Fabric.AllocationServiceMode != 6 the
   - 方案: 1) Verify allocation failure via VMApiQosEvent Kusto. 2) Get activityId and check ComputeAllocationActivity for failing tenantName. 3) Confirm not AzS
   - `[🟢 8 | ON]`

5. **Cannot resize CVM or change security properties — errors: 'Cannot resize a VM wi**
   - 根因: CVM securityEncryptionType and SecurityType are immutable after creation. CVM SKUs are exclusive to CVM families and can
   - 方案: Cannot change security properties or resize across CVM/non-CVM families. Must delete the VM (keeping disks) and recreate with desired settings. For re
   - `[🔵 7.5 | AW]`

