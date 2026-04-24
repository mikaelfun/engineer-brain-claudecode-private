# VM ADE 双通道迁移至单通道 — 排查速查

**来源数**: 1 (AW) | **条目**: 9 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot attach ADE Dual Pass encrypted managed disk as a data disk to rescue VM. Azure Portal shows e | Dual Pass encrypted managed disks have encryption settings metadata that prevent | Clear encryption settings before attaching. PowerShell (Az): $disk = Get-AzDisk  | 🔵 7.5 | AW |
| 2 | Need to migrate VM from Dual Pass ADE (with AAD/Service Principal) to Single Pass ADE (without AAD) |  | Use Set-AzVMDiskEncryptionExtension -ResourceGroupName $RG -VMName $VM -Migrate. | 🔵 7.5 | AW |
| 3 | Need to determine if a VM uses Dual Pass or Single Pass Azure Disk Encryption (ADE) |  | Check ADE extension version in VM Extensions blade: Windows - version 1.x = Dual | 🔵 7.5 | AW |
| 4 | Customer needs to migrate VM from ADE Dual Pass (with AAD) to Single Pass (without AAD) encryption.  |  | Use PowerShell: Set-AzVMDiskEncryptionExtension -ResourceGroupName RG -VMName VM | 🔵 7.5 | AW |
| 5 | Enabling ADE on a VM with SSE+CMK (Server-Side Encryption with Customer-Managed Keys) configured fai | SSE+CMK is incompatible with ADE. Disks that are part of an Encryption Set for S | Create a copy of the disk(s) without encryption settings to remove encryption me | 🔵 6.5 | AW |
| 6 | Applying SSE+CMK to a disk previously encrypted with ADE fails with error: Disk cannot have both Azu | Managed disks currently or previously encrypted using ADE cannot be encrypted us | Create a copy of the disk(s) without encryption settings to remove the UDE flag, | 🔵 6.5 | AW |
| 7 | Cannot enable Encryption at Host on a VM that currently or ever had Azure Disk Encryption (ADE) enab | ADE and Encryption at Host are mutually exclusive by design. The restriction app | To migrate from ADE to Encryption at Host: 1) Follow ADE-to-SSE+CMK migration st | 🔵 6.5 | AW |
| 8 | Azure Disk Encryption (ADE) fails or is not available on Dsv6/Dlsv6/Esv6 series VMs | Dsv6/Dlsv6/Esv6 series does not support Azure Disk Encryption (ADE); also does n | Use server-side encryption (SSE) with customer-managed keys instead of ADE for D | 🔵 6.0 | AW |
| 9 | Attaching data disk or updating VM fails with "User encryption settings in the VM model are not supp | VM was previously encrypted with Dual Pass ADE. After disabling Dual Pass and re | Clear encryption settings via PowerShell (only after confirming: DP fully disabl | 🟡 4.0 | AW |

## 快速排查路径

1. **Cannot attach ADE Dual Pass encrypted managed disk as a data disk to rescue VM. **
   - 根因: Dual Pass encrypted managed disks have encryption settings metadata that prevents them from being attached as data disks
   - 方案: Clear encryption settings before attaching. PowerShell (Az): $disk = Get-AzDisk -ResourceGroupName $rgName -DiskName $diskName; $disk.EncryptionSettin
   - `[🔵 7.5 | AW]`

2. **Need to migrate VM from Dual Pass ADE (with AAD/Service Principal) to Single Pas**
   - 方案: Use Set-AzVMDiskEncryptionExtension -ResourceGroupName $RG -VMName $VM -Migrate. Requires Azure PowerShell Az module >=5.9.0. VM will be rebooted duri
   - `[🔵 7.5 | AW]`

3. **Need to determine if a VM uses Dual Pass or Single Pass Azure Disk Encryption (A**
   - 方案: Check ADE extension version in VM Extensions blade: Windows - version 1.x = Dual Pass, version 2.x = Single Pass. Linux - version 0.x = Dual Pass, ver
   - `[🔵 7.5 | AW]`

4. **Customer needs to migrate VM from ADE Dual Pass (with AAD) to Single Pass (witho**
   - 方案: Use PowerShell: Set-AzVMDiskEncryptionExtension -ResourceGroupName RG -VMName VM -Migrate. Requires Az module >= 5.9.0. Confirm with Y when prompted. 
   - `[🔵 7.5 | AW]`

5. **Enabling ADE on a VM with SSE+CMK (Server-Side Encryption with Customer-Managed **
   - 根因: SSE+CMK is incompatible with ADE. Disks that are part of an Encryption Set for SSE+CMK cannot be encrypted using ADE. Th
   - 方案: Create a copy of the disk(s) without encryption settings to remove encryption metadata, then apply ADE to the new disk. Steps: 1) Remove SSE+CMK encry
   - `[🔵 6.5 | AW]`

