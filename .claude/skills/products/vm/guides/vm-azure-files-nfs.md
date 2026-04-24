# VM Azure Files NFS — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 22 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Files NFS shares become inaccessible after VM reboot on RHEL. Mounts time out or hang with I/O | Storage account migration between clusters caused redirection mechanism failure. | Confirm storage migration via Xportal (Account > Basic Info: FinalizeMigrateComp | 🔵 7.5 | AW |
| 2 | After rebooting RHEL VM, df -h shows incorrect/same storage account name for all Azure Files NFS sha | NFS default sharecache behavior: without nosharecache mount option, a single cac | Edit /etc/fstab and add "nosharecache" option to each NFS mount entry. Example:  | 🔵 7.5 | AW |
| 3 | Azure Files NFS shares become inaccessible on RHEL after VM reboot, kernel logs show "nfs4_reclaim_o | Storage account live migration between clusters caused redirection mechanism fai | Check for storage account migration via Xportal/Jarvis/ASI. To prevent recurrenc | 🔵 7.5 | AW |
| 4 | Azure VM screenshot shows OS shutdown with Stopping services message; VM stuck and unresponsive to R | Windows shutdown process performing system maintenance (binary updates, role/fea | Check STOP_PENDING services: Get-Service / Where-Object {$_.Status -eq 'STOP_PEN | 🔵 7.5 | AW |
| 5 | Azure VM screenshot shows VM stuck on Hyper-V screen and not booting past the Hyper-V logo (Windows  | Multiple possible causes: (1) Windows bug check or guest OS issue preventing boo | Take multiple screenshots via ASC to confirm not reboot loop. Check ASC Insights | 🔵 7.5 | AW |
| 6 | Linux VM cannot be reached via SSH; serial console shows only Enter username: prompt due to GRUB sup | GRUB superuser password protection is enabled (set before VHD upload to Azure or | Attach OS disk to a rescue Linux VM. Mount at /rescue. Edit /rescue/boot/grub/gr | 🔵 7.5 | AW |
| 7 | Azure VM screenshot shows: This is not a bootable disk. Please insert a bootable floppy and press an | The OS boot process could not locate an active system partition - the system par | Cannot troubleshoot online (Guest OS not operational). Use OFFLINE approach: att | 🔵 7.5 | AW |
| 8 | Azure VM shows This is not a bootable disk error due to BCD corruption with missing reference to Win | BCD (Boot Configuration Data) corruption - missing reference in the BCD store to | OFFLINE approach: attach OS disk to rescue VM. Rebuild BCD store using standard  | 🔵 7.5 | AW |
| 9 | Azure VM in reboot loop; screenshots show boot process interrupted and restarting; Event ID 7007 Lev | A third-party service flagged as critical is failing to start, causing OS to res | Disable autoreboot first to see the actual bug check code/error. OFFLINE: attach | 🔵 7.5 | AW |
| 10 | Azure VM in reboot loop after OS change (KB update, application install, or new policy); or due to f | OS changes (KB/application installation or policy change) or file system corrupt | Disable autoreboot to see error. OFFLINE: check Event Logs, CBS.log, WindowsUpda | 🔵 7.5 | AW |
| 11 | Azure VM screenshot shows VMWare image customization is in progress message on every boot, delaying  | VMware Image Customization Initialization module is enabled on the VM (similar t | OFFLINE approach: attach OS disk to rescue VM. Disable VMware Customization modu | 🔵 7.5 | AW |
| 12 | NFS mount fails with mount.nfs: requested NFS version or transport protocol is not supported | Private endpoint setup is incorrect. DNS resolution for storage.privatelink.file | Run nslookup <storage>.file.core.windows.net and verify it resolves to correct p | 🔵 7.5 | AW |
| 13 | Accessing Azure file share via UNC path in Windows Explorer takes more than 5 minutes; same issue in | Windows with Client for NFS feature installed tries connecting via port 111 (sun | Remove Client for NFS feature from Windows (uncheck in Remove Features screen) a | 🔵 6.5 | AW |
| 14 | Accessing Azure Files through Explorer using UNC path takes more than 5 minutes. Applications (Excel | Windows with Client for NFS feature installed attempts to connect via port 111 ( | Remove the Client for NFS feature: open Remove Features screen, uncheck Client f | 🔵 6.5 | AW |
| 15 | After VM reboot on RHEL, df -h shows incorrect (same) storage account name for all NFS-mounted Azure | NFS sharecache sharing: without nosharecache mount option, all mounts to the sam | Edit /etc/fstab and add nosharecache option to each NFS mount entry (e.g., "nfs  | 🔵 6.5 | AW |
| 16 | SuSE NFS client VMs with newer kernels (e.g. 4.4.162-94.72) cannot connect to NFS server running old | Unknown bug in older SuSE kernel 4.4.138-94.39 on NFS server causes connectivity | Upgrade kernel on NFS server: sudo zypper update kernel-default. Ensure backup/s | 🔵 6.5 | AW |
| 17 | Error NfsFileShare is not supported for the account when creating NFS file shares in newly created s | Storage account created right after NFS feature enablement may land on stamp whe | Verify stamp via nslookup. If not NFS-supported, recreate storage account. | 🔵 6.5 | AW |
| 18 | Azure VM screenshot shows Windows setup error: The computer restarted unexpectedly or encountered an | First boot of a generalized (sysprepped) image fails to process the unattended a | Change support topic to: Product=Azure Virtual Machine Windows, Topic=Cannot cre | 🔵 6.5 | AW |
| 19 | NFS mount fails with mount.nfs: Remote I/O error | The file share is SMB type, not NFS. Customer is attempting to mount an SMB shar | Verify the share protocol in Azure Portal or ASC Resource Explorer (Files tab >  | 🔵 6.5 | AW |
| 20 | rsync to NFS Azure File Share fails with rsync: chown filename failed: Invalid argument (22). Occurs | NFS v4.1 on Azure Files only accepts numeric UID/GID. NFS v4 passes identities a | Disable ID mapping: echo 'options nfs nfs4_disable_idmapping=1' > /etc/modprobe. | 🔵 6.5 | AW |
| 21 | Azure Files NFS v4.1 shares mounted via public endpoint become inaccessible during storage hardware  | Storage hardware upgrade changes the public IP. NFS client caches the original I | Preferred: Switch to private endpoints (static private IP, transparent during mi | 🔵 6.5 | AW |
| 22 | SAP NFS server VMs (GlusterFS cluster on SUSE 12) experienced unexpected reboots/redeployments, caus | Platform-initiated VM reboot/redeploy during maintenance. Multiple NFS server no | Troubleshooting approach: 1) Check VM Dashboard in Geneva for nodeId/containerId | 🔵 6.5 | ON |

## 快速排查路径

1. **Azure Files NFS shares become inaccessible after VM reboot on RHEL. Mounts time **
   - 根因: Storage account migration between clusters caused redirection mechanism failure. Normally Azure Files traffic is redirec
   - 方案: Confirm storage migration via Xportal (Account > Basic Info: FinalizeMigrateCompleteTime, MigrationLastPrimaryStamp), Jarvis, or ASI (Storage Tools > 
   - `[🔵 7.5 | AW]`

2. **After rebooting RHEL VM, df -h shows incorrect/same storage account name for all**
   - 根因: NFS default sharecache behavior: without nosharecache mount option, a single cache is used for all mount points accessin
   - 方案: Edit /etc/fstab and add "nosharecache" option to each NFS mount entry. Example: <sa>.file.core.windows.net:/<sa>/<share> /mountpoint nfs defaults,nosh
   - `[🔵 7.5 | AW]`

3. **Azure Files NFS shares become inaccessible on RHEL after VM reboot, kernel logs **
   - 根因: Storage account live migration between clusters caused redirection mechanism failure. After DNS updates, internal networ
   - 方案: Check for storage account migration via Xportal/Jarvis/ASI. To prevent recurrence, open ICM to add account to do-not-migrate list. For immediate mitig
   - `[🔵 7.5 | AW]`

4. **Azure VM screenshot shows OS shutdown with Stopping services message; VM stuck a**
   - 根因: Windows shutdown process performing system maintenance (binary updates, role/feature changes). If interrupted, OS corrup
   - 方案: Check STOP_PENDING services: Get-Service | Where-Object {$_.Status -eq 'STOP_PENDING'}. Get PID via tasklist /svc. Take memory dump with procdump -s 5
   - `[🔵 7.5 | AW]`

5. **Azure VM screenshot shows VM stuck on Hyper-V screen and not booting past the Hy**
   - 根因: Multiple possible causes: (1) Windows bug check or guest OS issue preventing boot - identifiable via ASC screenshots and
   - 方案: Take multiple screenshots via ASC to confirm not reboot loop. Check ASC Insights for boot errors. Review serial console. For Windows: try nested virtu
   - `[🔵 7.5 | AW]`

