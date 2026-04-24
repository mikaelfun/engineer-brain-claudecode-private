# VM 机密 VM (CVM) — 排查速查

**来源数**: 3 (AW, KB, ML) | **条目**: 6 | **21V**: 5/6
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | CVM deployment fails with 'Required parameter for Confidential VMs is missing (null)' or 'should hav | Confidential VM requires managedDisk.securityProfile.securityEncryptionType to b | 1) Set securityEncryptionType to DiskWithVMGuestState or VMGuestStateOnly. 2) Fo | 🔵 7.5 | AW |
| 2 | Whenever Import-SCLibraryPhysicalResource operation is performed on clustered library share or SOFS  | Its Bug 119830 . I tested on both VMM 2012 R2 and VMM 2016. For some reason on c | It will be fixed on VMM 2016 UR5 and CB2. But if its VMM 2012 R2 then try the be | 🔵 7 | KB |
| 3 | CVM disk creation fails: 'OS type must be specified for Trusted VM and Confidential VM disks' | When creating managed disks for Trusted Launch or Confidential VMs, the osType p | Specify the osType (Windows or Linux) in the managed disk creation template/API  | 🔵 6.5 | AW |
| 4 | Customer deploys Nested Confidential VM (DCas_cc_v5/DCads_cc_v5/ECas_cc_v5/ECads_cc_v5) outside AKS  | Nested CVM confidential computing features (SEV-SNP attestation, memory encrypti | Inform customer that Azure does not provide troubleshoot guidance or incident su | 🔵 6.5 | AW |
| 5 | Error "Hyper-V cannot be installed because virtualization support is not enabled in the BIOS" when t | Trusted Launch VMs do not support nested virtualization. The hypervisor is not e | 1) Change VM security type to Standard (not Trusted Launch). 2) If hypervisor no | 🔵 6.5 | ML |
| 6 | Cannot deploy DCasv6/ECasv6 Confidential VM — SKU not available or deployment rejected during gated  | DCasv6 and ECasv6 CVM series are in gated public preview; subscription must be e | Customer must fill out the preview sign-up form: https://forms.microsoft.com/pag | 🔵 6.0 | AW |

## 快速排查路径

1. **CVM deployment fails with 'Required parameter for Confidential VMs is missing (n**
   - 根因: Confidential VM requires managedDisk.securityProfile.securityEncryptionType to be set. DiskWithVMGuestState mode additio
   - 方案: 1) Set securityEncryptionType to DiskWithVMGuestState or VMGuestStateOnly. 2) For DiskWithVMGuestState: set both secureBootEnabled and vtpmEnabled to 
   - `[🔵 7.5 | AW]`

2. **Whenever Import-SCLibraryPhysicalResource operation is performed on clustered li**
   - 根因: Its Bug 119830 . I tested on both VMM 2012 R2 and VMM 2016. For some reason on cluster nodes the application is unable t
   - 方案: It will be fixed on VMM 2016 UR5 and CB2. But if its VMM 2012 R2 then try the below workaround. So, on SOFS cluster nodes, I ran below command to manu
   - `[🔵 7 | KB]`

3. **CVM disk creation fails: 'OS type must be specified for Trusted VM and Confident**
   - 根因: When creating managed disks for Trusted Launch or Confidential VMs, the osType property must be explicitly set in the di
   - 方案: Specify the osType (Windows or Linux) in the managed disk creation template/API call. This is required for all Trusted VM and CVM disk operations.
   - `[🔵 6.5 | AW]`

4. **Customer deploys Nested Confidential VM (DCas_cc_v5/DCads_cc_v5/ECas_cc_v5/ECads**
   - 根因: Nested CVM confidential computing features (SEV-SNP attestation, memory encryption via nested child VMs) are only suppor
   - 方案: Inform customer that Azure does not provide troubleshoot guidance or incident support for Nested CVMs deployed outside AKS. For confidential computing
   - `[🔵 6.5 | AW]`

5. **Error "Hyper-V cannot be installed because virtualization support is not enabled**
   - 根因: Trusted Launch VMs do not support nested virtualization. The hypervisor is not enabled in the BCDEdit configuration when
   - 方案: 1) Change VM security type to Standard (not Trusted Launch). 2) If hypervisor not enabled, run: bcdedit /set hypervisorlaunchtype auto && Restart-Comp
   - `[🔵 6.5 | ML]`

