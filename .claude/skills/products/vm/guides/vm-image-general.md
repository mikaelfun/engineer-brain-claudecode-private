# VM 镜像通用问题 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 32 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Terraform VM deployment from 3rd-party marketplace image in Mooncake fails with 500 InternalServerEr | Terraform plan block triggers ARM to call storeapi.azure.com (public Azure servi | Remove the plan block from terraform azurerm_virtual_machine resource arguments. | 🟢 8 | ON |
| 2 | Azure VM shows This is not a bootable disk error due to BCD corruption with missing reference to Win | BCD (Boot Configuration Data) corruption - missing reference in the BCD store to | OFFLINE approach: attach OS disk to rescue VM. Rebuild BCD store using standard  | 🔵 7.5 | AW |
| 3 | VM screenshot shows BOOTMGR image is corrupt. The system cannot boot. | BCD store is corrupted or inaccessible, usually after an unexpected VM restart c | Offline troubleshooting: stop/deallocate VM, snapshot OS disk, attach to rescue  | 🔵 7.5 | AW |
| 4 | Azure VM in reboot loop after OS change (KB update, application install, or new policy); or due to f | OS changes (KB/application installation or policy change) or file system corrupt | Disable autoreboot to see error. OFFLINE: check Event Logs, CBS.log, WindowsUpda | 🔵 7.5 | AW |
| 5 | Azure VM screenshot shows OS shutdown with Stopping services message; VM stuck and unresponsive to R | Windows shutdown process performing system maintenance (binary updates, role/fea | Check STOP_PENDING services: Get-Service / Where-Object {$_.Status -eq 'STOP_PEN | 🔵 7.5 | AW |
| 6 | Image version creation fails with InternalOperationError: Replication failed in this region due to C | Mismatch in security type between the image definition and the source image. The | Recreate the image definition with the correct security type set to Trusted Laun | 🔵 7.5 | AW |
| 7 | Azure VM screenshot shows: This is not a bootable disk. Please insert a bootable floppy and press an | The OS boot process could not locate an active system partition - the system par | Cannot troubleshoot online (Guest OS not operational). Use OFFLINE approach: att | 🔵 7.5 | AW |
| 8 | Azure VM screenshot shows VMWare image customization is in progress message on every boot, delaying  | VMware Image Customization Initialization module is enabled on the VM (similar t | OFFLINE approach: attach OS disk to rescue VM. Disable VMware Customization modu | 🔵 7.5 | AW |
| 9 | Azure VM screenshot shows VM stuck on Hyper-V screen and not booting past the Hyper-V logo (Windows  | Multiple possible causes: (1) Windows bug check or guest OS issue preventing boo | Take multiple screenshots via ASC to confirm not reboot loop. Check ASC Insights | 🔵 7.5 | AW |
| 10 | Azure VM in reboot loop; screenshots show boot process interrupted and restarting; Event ID 7007 Lev | A third-party service flagged as critical is failing to start, causing OS to res | Disable autoreboot first to see the actual bug check code/error. OFFLINE: attach | 🔵 7.5 | AW |
| 11 | Linux VM cannot be reached via SSH; serial console shows only Enter username: prompt due to GRUB sup | GRUB superuser password protection is enabled (set before VHD upload to Azure or | Attach OS disk to a rescue Linux VM. Mount at /rescue. Edit /rescue/boot/grub/gr | 🔵 7.5 | AW |
| 12 | VM resize from retiring D/Ds/Dv2/Dsv2/Ls series to v6 series fails due to OS incompatibility — v6 re | v6 VM series has strict prerequisites: NVMe interface (requires supported OS), G | 1) Check OS compatibility at https://learn.microsoft.com/en-us/azure/virtual-mac | 🔵 7.0 | AW |
| 13 | Deployment of v6/v7 series VMs (Dasv6, Easv6, Fasv6, Dasv7, Easv7, Fasv7, Dpsv6, Dsv6, Dlsv6, Esv6)  | All v6 and v7 series VMs require Generation 2 IaaS VM images with NVMe tag; Gen1 | Use a Gen2 OS image tagged with NVMe support. Check NVMe-compatible images at ht | 🔵 7.0 | AW |
| 14 | DCsv3 or DCdsv3 confidential VM deployment fails — only Gen2 images supported, Gen1 images rejected | DCsv3 and DCdsv3 series VMs only support Generation 2 VM images. Attempting to d | Use a Gen2 OS image (Ubuntu 18.04/20.04 LTS or Windows Server 2019 Datacenter).  | 🔵 7.0 | AW |
| 15 | Cannot create Image Definition - 400 Bad Request: entity name invalid per validation rule; must matc | Image Definition name contains invalid characters. Only uppercase/lowercase lett | Rename using only allowed characters. Must not start with underscore/non-word ch | 🔵 6.5 | AW |
| 16 | Image version replication fails with CannotReplicateImageVersion error: Cannot replicate Image Versi | The source image (managed image/snapshot/VHD) used to create the image version w | Keep the source image around if you need to add new replication regions in the f | 🔵 6.5 | AW |
| 17 | Docker image pulls from Docker Hub fail with rate limiting errors (HTTP 429) on Azure VMs; anonymous | Docker Hub rate limits container pull requests; Azure partner agreement with Doc | Authenticate Docker pulls with a Docker account, use Azure Container Registry (A | 🔵 6.5 | AW |
| 18 | Questions about RHUI support scope, ICM template, and Azure China RHUI repos for RedHat images | RHUI in Azure China uses the same repos and documentation as public Azure; RHUI  | 1) Use same RHUI docs as public Azure: https://learn.microsoft.com/en-us/azure/v | 🔵 6.5 | ON |
| 19 | Error: 'Subscription is not registered with the feature Microsoft.Compute/Architecture. Please regis | Customer's subscription is not enrolled in the 'Architecture' AFEC flag required | Register the subscription to the 'Architecture' AFEC flag. Submit an onboarding  | 🔵 6.5 | AW |
| 20 | Cannot delete Azure Image Builder template - OperationNotAllowed: DELETE not allowed in provisioning | Image Template stuck in creating provisioning state. DELETE blocked. | Wait for provisioning to finish. If stuck indefinitely, contact AIB support for  | 🔵 6.5 | AW |
| 21 | NFS mount fails with mount.nfs: Remote I/O error | The file share is SMB type, not NFS. Customer is attempting to mount an SMB shar | Verify the share protocol in Azure Portal or ASC Resource Explorer (Files tab >  | 🔵 6.5 | AW |
| 22 | Cannot delete Azure Image Builder template - IdentityError 404: user assigned managed identity was d | User Assigned Managed Identity deleted before being disassociated from Image Bui | If identity still associated: az image builder identity remove. If already delet | 🔵 6.5 | AW |
| 23 | Error 'Subscription X is not registered with the feature Microsoft.Compute/Architecture. Please regi | Customer's subscription is not registered to the 'Architecture' AFEC flag requir | Register the subscription to the 'Architecture' AFEC flag; use the onboarding li | 🔵 6.5 | AW |
| 24 | Computer name of Azure VM using specialized disk is blank in portal/PowerShell/CLI. OS profile prope | When creating a VM from an existing or specialized disk, the OSProfile settings  | This is a known Azure platform limitation. The VM name provided during resource  | 🔵 6.5 | ML |
| 25 | Error: 'Cannot create a VM of size X because this VM size only supports a CPU Architecture of Arm64, | CPU architecture mismatch: an Arm64 VM size (suffix 'p', e.g. Standard_D2ps_v5)  | Ensure architecture compatibility: select Arm64 OS images for Arm64 VM sizes (si | 🔵 6.5 | AW |
| 26 | Using Gen 1 VM image with NVMe-capable v6 VM series (Dasv6/Easv6/Fasv6 etc.) fails with error: The s | NVMe is only supported on Gen 2 VMs. There are no plans to support NVMe on Gen 1 | Convert Gen 1 VM image to Gen 2 or create a new Gen 2 VM. See https://learn.micr | 🔵 6.5 | AW |
| 27 | Error 'Cannot create a VM of size X because this VM size only supports a CPU Architecture of Arm64,  | The selected VM size CPU architecture (Arm64 vs x64/x86) does not match the arch | Use Arm64 images/disks with Arm64 VM sizes (sizes with 'p' suffix, e.g. Standard | 🔵 6.5 | AW |
| 28 | Confidential VM (DCasv5/DCadsv5/ECasv5/ECadsv5) deployment fails with 'Creation of VMs with Confiden | CVM requires specific AMD SEV-SNP clusters only available in certain regions, an | Deploy in a CVM-supported region and use an image tagged with ConfidentialVMSupp | 🔵 6.0 | AW |
| 29 | Deployment of DCsv3 or DCdsv3 VM fails when using Gen1 image; only Gen2 images are supported for thi | DCsv3 and DCdsv3 series VMs require Gen2 images due to confidential computing (S | Use a Gen2 OS image (Ubuntu Server 18.04/20.04 LTS or Windows Server 2019 Datace | 🔵 6.0 | AW |
| 30 | Need contact for IaaS image publisher to escalate 1st party or 3rd party Azure marketplace image iss |  | Mooncake IaaS image publisher contacts (2018, verify currency): Windows Server:  | 🔵 6 | ON |
| 31 | FX-series VM deployment fails or Availability Zone option is missing; zero quota error when attempti | FX VM has zero default quota, supports Gen2 images only, is available in limited | Request quota via Azure Support ticket before deployment; use Gen2 VM image only | 🔵 6.0 | AW |
| 32 | AWS image imported to Azure: Gen1 VM created from the image works fine, but Gen2 VM created from the | The image captured from AWS was a Gen1 image. Using it directly for Gen2 VM depl | Capture a proper Gen2 image from AWS (ensure UEFI boot support) before importing | 🔵 5.5 | ON |

## 快速排查路径

1. **Terraform VM deployment from 3rd-party marketplace image in Mooncake fails with **
   - 根因: Terraform plan block triggers ARM to call storeapi.azure.com (public Azure service) which is not reachable from Mooncake
   - 方案: Remove the plan block from terraform azurerm_virtual_machine resource arguments. The plan block is used by public Azure for 3rd-party marketplace imag
   - `[🟢 8 | ON]`

2. **Azure VM shows This is not a bootable disk error due to BCD corruption with miss**
   - 根因: BCD (Boot Configuration Data) corruption - missing reference in the BCD store to locate the Windows partition. Can occur
   - 方案: OFFLINE approach: attach OS disk to rescue VM. Rebuild BCD store using standard BCD repair commands (bootrec /rebuildbcd, bcdedit). For new VMs migrat
   - `[🔵 7.5 | AW]`

3. **VM screenshot shows BOOTMGR image is corrupt. The system cannot boot.**
   - 根因: BCD store is corrupted or inaccessible, usually after an unexpected VM restart caused by Azure Platform issue.
   - 方案: Offline troubleshooting: stop/deallocate VM, snapshot OS disk, attach to rescue VM, rebuild BCD using bcdedit commands. For Gen1: bcdedit /store <Boot
   - `[🔵 7.5 | AW]`

4. **Azure VM in reboot loop after OS change (KB update, application install, or new **
   - 根因: OS changes (KB/application installation or policy change) or file system corruption causing boot failure loop. Corruptio
   - 方案: Disable autoreboot to see error. OFFLINE: check Event Logs, CBS.log, WindowsUpdate.log for changes. Uninstall problematic KB update if identified. Res
   - `[🔵 7.5 | AW]`

5. **Azure VM screenshot shows OS shutdown with Stopping services message; VM stuck a**
   - 根因: Windows shutdown process performing system maintenance (binary updates, role/feature changes). If interrupted, OS corrup
   - 方案: Check STOP_PENDING services: Get-Service | Where-Object {$_.Status -eq 'STOP_PENDING'}. Get PID via tasklist /svc. Take memory dump with procdump -s 5
   - `[🔵 7.5 | AW]`

