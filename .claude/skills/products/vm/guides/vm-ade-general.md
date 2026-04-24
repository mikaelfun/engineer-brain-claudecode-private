# VM ADE 通用问题 — 排查速查

**来源数**: 4 (AW, KB, ML, ON) | **条目**: 48 | **21V**: 47/48
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot RDP/SSH to Azure VM. OS is fully loaded at CAD screen but VM is unreachable. ASC Stateful Tes | NSG security rules are blocking inbound RDP/SSH traffic. Either no Allow rule ex | For standard NSG: Review Effective Security Rules and add/modify a customer-defi | 🔵 7.5 | AW |
| 2 | AKS VMSS node fails to provision; vmssCSE (Custom Script Extension) reports failure with exit code ( | AKS uses CSE to install Kubernetes components on VMSS nodes. Exit codes indicate | 1) ASC → VM → Extensions → expand failed CSE → Status Message for error code. 2) | 🔵 7.5 | AW |
| 3 | Cannot delete Image Builder template - UAMI deleted before removal from config; identity blade greye | UAMI deleted before removal from template. Template in provisioningState=Failed, | (1) Recreate deleted identity exact same name/RG. (2) Create temp identity. (3)  | 🔵 7.5 | AW |
| 4 | VM connectivity degraded: slow connection, random disconnections, black screen over RDP, or VM compl | Misconfigured User Defined Routes (UDR) causing network loops, or traffic routed | Check UDR via ASC Resource Explorer -> VM -> Virtual Network -> Subnet -> Route  | 🔵 7.5 | AW |
| 5 | Customer resource is not shown in the Azure Advisor blade, or a banner message at the top indicates  | The user lacks the required RBAC role (Owner, Contributor, or Reader) for the im | Check Role Assignments in Access Control (IAM) for the subscription/resource gro | 🔵 7.5 | AW |
| 6 | Azure VM displays "A disk read error occurred. Press Ctrl+Alt+Del to restart" - VM cannot boot | The OS disk structure is corrupted and unreadable, preventing the boot loader fr | Stop/deallocate and start the VM. If persists, attach OS disk to rescue VM (offl | 🔵 7.5 | AW |
| 7 | Cannot RDP to Azure VM. OS loaded and waiting for credentials. No VIP/DIP connectivity. Event ID 704 | Message Queuing (MSMQ) service is taking too long to start or hung, blocking the | ONLINE: sc config msmq start=demand (set to manual). Check for other services in | 🔵 7.5 | AW |
| 8 | Cannot RDP to Azure VM. OS loaded at CAD screen. Red cross/yellow bang on network card icon or no ic | Network stack is corrupted - the system cannot properly process the network inte | ONLINE: Mitigation 1: netsh winhttp reset proxy + powercfg /setactive SCHEME_MIN | 🔵 7.5 | AW |
| 9 | BEK volume does not appear on rescue VM after attaching ADE encrypted disk. Cannot find BEK file to  | The encrypted disk was attached after VM creation. BEK volume is only provisione | Must attach the encrypted disk DURING rescue VM creation (in the Disks blade of  | 🔵 7.5 | AW |
| 10 | Genomics workflow fails with 'Error reading an input file'; workflow log (standardoutput.log) shows  | Input genomics file (FASTQ, BAM, or SAM) is corrupted or invalid | 1) Retrieve log archive from output container (file named *.<workflow-ID>.logs.z | 🔵 7.5 | AW |
| 11 | Microsoft engineer submits Customer Lockbox access request via ASC but customer never receives notif | Customer has PIM (Privileged Identity Management) enabled but the eligible role  | 1. Customer must activate their PIM eligible Subscription Owner or Global Admin  | 🔵 7.5 | AW |
| 12 | Commvault backup jobs fail on ADE-encrypted VMs reporting ADE extension in failed state: 'Encryption | After VM reboot, the guest agent starts ~90 seconds after container starts and t | 1) Have Commvault query Extension InstanceView API instead of ProvisioningState  | 🔵 7.5 | AW |
| 13 | VM Application deployment fails during archive extraction: 'Expand-Archive: The path <AppName>.zip e | The VM Application extension does not always preserve the original file extensio | Update the install command to rename the file before extraction: powershell -Exe | 🔵 7.5 | AW |
| 14 | Cannot RDP to Azure VM that belongs to Microsoft Corp Domain (internal MSFT employee). OS is fully l | AD Group Policy is blocking all connections except from specific network subnets | Verify AD policy by checking registry keys under HKLM\SOFTWARE\Policies\Microsof | 🔵 7.5 | AW |
| 15 | Azure VM backup snapshot unexpectedly deleted without user action; customer receives email alert abo | Subscription was upgraded from VM Backup Stack V1 to V2. In V2, snapshots are re | Check Kusto BCMBackupStats table for the subscription: query 'IsInstantRPEnabled | 🔵 7.5 | ON |
| 16 | Cannot RDP to Azure VM. OS is fully loaded at CAD screen. No inbound connections possible. Brief con | McAfee VirusScan Enterprise software is blocking all inbound connections due to  | ONLINE: 1) Stop/disable McAfee services via sc stop/sc config start=disabled. 2) | 🔵 7.5 | AW |
| 17 | Disabling ADE via CLI fails with InvalidParameter typeHandlerVersion even with correct command synta | ADE was previously enabled using a custom/non-standard VM extension name (e.g. A | List VM extensions (az vm extension list) to find non-standard ADE extension nam | 🔵 7.5 | AW |
| 18 | Encrypted VM fails to boot with DiskEncryptionKeySecretRetrievalFailed. Azure Activity Log shows: Er | The Key Vault or disk encryption secret is no longer accessible to ADE. Causes:  | Check KV state: az keyvault list-deleted, recover if soft-deleted (az keyvault r | 🔵 7.5 | AW |
| 19 | Black screen after entering RDP credentials; user profile does not finish loading; VM has network co | Winlogon cannot complete logon and policy processing; a process or thread is dea | Collect a memory dump while the VM is in the failing state and analyze it to ide | 🔵 7.5 | AW |
| 20 | NVIDIA GPU driver disappears periodically on NVads_A10_v5 VM; nvidia-smi fails with 'NVIDIA_SMI has  | Ubuntu automatic kernel upgrade (via apt-daily-upgrade.timer) installs new kerne | Disable Ubuntu automatic kernel upgrade timers: sudo systemctl stop/disable apt- | 🔵 7 | ON |
| 21 | Non-ChinaEast2 VMs cannot onboard Update Management (AUMv1) from the Azure portal (Add Azure VM page | Update Management backend (Automation Account + Log Analytics workspace) is only | Associate the non-CE2 machine to a Log Analytics workspace in ChinaEast2 linked  | 🔵 7 | ON |
| 22 | VM storage IO slow, application performance degraded (e.g. SQL Server), high latency on all disks | VM-level throttling causes dependent blocking: one disk excessive IO triggers VM | Prevent VM level throttling: ensure total cached disk throughput < VM cached max | 🔵 7 | ON |
| 23 | SCVMM refresher StorageProviderCacheSync job is failing on SCVMM 2016 The following error is logged: | The WMIPrvSE process with the StorageWMI provider loaded crashes because too muc | Increase the WMI quota ôMemoryPerHostö. The quota ôMemoryAllHostsö will also hav | 🔵 7 | KB |
| 24 | Azure VM crashes with bugcheck 0x00000019 (BAD_POOL_HEADER). VM screenshot shows BAD_POOL_HEADER sto | Pool is already corrupted at the time of the current request. This may or may no | OFFLINE troubleshooting required: Backup OS disk, create rescue VM via OSDisk Sw | 🔵 6.5 | AW |
| 25 | Azure Advisor recommendation "Enable Accelerated Logs for improved performance" for MySQL Flexible S | Known bug in recommendation logic: recommendation is not cleared after accelerat | If accelerated logs are already enabled on the server, customer can safely ignor | 🔵 6.5 | AW |
| 26 | Azure VM network connectivity lost; NSI service hung (Event 7022), dependency failure (Event 7001),  | NSI service disabled, hung, or account mismatch. Core networking service failure | Serial Console: sc query/start NSI. If disabled: sc config NSI start=auto. Fix d | 🔵 6.5 | ML |
| 27 | Azure VM crashes with bugcheck 0x000000CE (DRIVER_UNLOADED_WITHOUT_CANCELLING_PENDING_OPERATIONS). V | A driver failed to cancel lookaside lists, DPCs, worker threads, or other pendin | OFFLINE troubleshooting required: Backup OS disk, create rescue VM, collect and  | 🔵 6.5 | AW |
| 28 | ADE operation fails with error: Cannot update encryption properties for disk because it already has  | Existing incremental restore points on the source disk prevent ADE from updating | Delete the incremental restore point(s): go to Restore Points in portal, find th | 🔵 6.5 | AW |
| 29 | Custom image deployment fails with provisioning timeout (generalized uploaded as specialized) or pro | Mismatch between actual OS state (generalized/specialized) and the setting used  | Upload: Use Add-AzVhd with correct setting matching OS state. Run sysprep before | 🔵 6.5 | ML |
| 30 | Azure VM displays "A disk read error occurred" - boot partition deactivated | The partition holding the boot configuration data (BCD) is not set as active, so | Offline fix: attach OS disk to rescue VM, open diskpart, select the BCD/boot par | 🔵 6.5 | AW |
| 31 | RDP connection hangs on 'Configuring remote session' when connecting to Azure VM; OS is fully loaded | The server is unable to reach the RD license server or the license server inform | Configure RD Licensing on the server: ONLINE via Serial Console using RD License | 🔵 6.5 | AW |
| 32 | Azure VM screenshot shows 'Please wait for the Local Session Manager' - OS hangs waiting for Local S | Local Session Manager service is stuck during startup. Root cause depends on mem | Use online hang scenario troubleshooting: backup OS disk, collect memory dump vi | 🔵 6.5 | AW |
| 33 | Azure Disk Encryption fails with connection forcibly closed by remote host. waagent.log shows UriNot | Proxy service or stateful packet inspection (firewall/IPS) on the VM is blocking | Test encryption from a VM on a different network (not behind the corporate proxy | 🔵 6.5 | AW |
| 34 | After removing ADE extension, platform cannot report encryption status or provision VM properly | ADE extension was removed (Remove-AzVMDiskEncryptionExtension) before disk encry | Always run Disable-AzVMDiskEncryption first to unencrypt the disk, then Remove-A | 🔵 6.5 | AW |
| 35 | After removing ADE extension, Azure portal shows incorrect encryption status and VM provisioning fai | ADE decryption commands executed in wrong order: Remove-AzVMDiskEncryptionExtens | Always follow correct sequence: 1) Disable-AzVMDiskEncryption -ResourceGroupName | 🔵 6.5 | AW |
| 36 | 客户询问 Azure VM 是否受 LogoFAIL 固件漏洞（UEFI boot loader firmware vulnerability）影响 | LogoFAIL 漏洞需攻击者预先获得 OS 完整控制权（admin/root 级别）才可利用；大多数 Azure 裸金属机器不使用 boot loader 镜 | Azure VM 不受 LogoFAIL 影响。使用 Surface 等硬件设备的客户需联系硬件厂商获取固件更新。建议遵循 Zero Trust 安全模型（ht | 🔵 6.5 | AW |
| 37 | Black screen on RDP that disconnects after about 1 minute; VM shows high resource/performance usage; | VM is experiencing a performance spike or virtual memory exhaustion due to appli | Identify resource-heavy processes via Task Manager or Get-Process. Reduce memory | 🔵 6.5 | AW |
| 38 | Azure VM BSOD with Stop Error 0x00000067 CONFIG_INITIALIZATION_FAILED - VM cannot boot, blue screen  | IMC (Initial Machine Configuration) reference is set in the Boot Loader (bcdedit | Offline fix: attach OS disk to rescue VM, open elevated CMD, run bcdedit /store  | 🔵 6.5 | AW |
| 39 | Azure VM OS fully loaded but cannot connect; DNS Client (DNSCache) service not running; Event ID 702 | DNS Client (DNSCache) service is not running due to: service disabled, crashing/ | Diagnose via sc query DNSCACHE: if disabled set sc config DNSCACHE start=auto an | 🔵 6.5 | AW |
| 40 | RDP shows black screen then disconnects; explorer.exe crashes with Application Error Event ID 1000 ( | Explorer.exe process crashes due to TwinUI.dll fault, preventing the desktop she | Run SFC /scannow and DISM /online /cleanup-image /restorehealth to repair the co | 🔵 6.5 | AW |
| 41 | When attempting to upgrade to SCVMM 2016 from SCVMM 2012 R2, you are presented with a dialog that in | During upgrade we check the Database version in the tbl_GlobalSetting table. The | To upgrade from 2012R2 to 2016, you can modify the setting in the database with  | 🔵 6 | KB |
| 42 | While trying to deploy a virtual machine (VM) using System Center 2016 Virtual Machine Manager (SCVM | This issue can be caused when the virtual disk for the VM is mounted during the  | In our case the customer did not need the registry key that was created as symbo | 🔵 6 | KB |
| 43 | VM deployment fails with InvalidVhd error — uploaded VHD not supported, disk expected to have cookie | The VHD does not comply with the 1 MB alignment (offset) requirement. Supported  | Resize the disk to comply with 1 MB alignment: Windows use Resize-VHD PowerShell | 🔵 5.5 | ML |
| 44 | Red Hat 9 custom image VM boots into emergency mode; pvs shows 'Devices file PVID last seen on /dev/ | RHEL 9 enables system.devices file feature by default (LVM2 device cache). When  | 1) Add use_devicesfile=0 in /etc/lvm/lvm.conf (within devices {} section) to dis | 🔵 5.5 | ON |
| 45 | Provisioning timeout or failure when deploying VM from custom image — generalized image uploaded/cap | Mismatch between the OS type (generalized vs specialized) and the upload/capture | Upload: Use Add-AzVhd with correct generalized/specialized setting (run sysprep  | 🔵 5.5 | ML |
| 46 | Error when trying to upgrade/resize Azure VM to a size with more than 64 vCPUs (e.g., Standard_F72s_ | The guest operating system running on the VM does not support more than 64 vCPUs | Use a supported guest OS that supports >64 vCPUs: Windows Server 2016, Ubuntu 16 | 🔵 5.5 | ML |
| 47 | VM Inspector 403 DiskInspectForbiddenError | Missing Disk Backup Reader role on managed OS disk | Get Owner access, run VM Inspector to consent Disk Backup Reader role assignment | 🔵 5.5 | ML |
| 48 | Cannot enable Azure Disk Encryption. Error: extension version 2.2 is not supported. StatusCode 409 C | Set-AzVMDiskEncryptionExtension without AAD params uses extension v2.2 not regis | Method 1: Use AAD parameters (-AadClientID, -AadClientSecret). Method 2: Registe | 🟡 4.5 | ML |

## 快速排查路径

1. **Cannot RDP/SSH to Azure VM. OS is fully loaded at CAD screen but VM is unreachab**
   - 根因: NSG security rules are blocking inbound RDP/SSH traffic. Either no Allow rule exists for port 3389/22 (default DenyAllIn
   - 方案: For standard NSG: Review Effective Security Rules and add/modify a customer-defined security rule to allow inbound RDP/SSH traffic. For AVNM rule: Con
   - `[🔵 7.5 | AW]`

2. **AKS VMSS node fails to provision; vmssCSE (Custom Script Extension) reports fail**
   - 根因: AKS uses CSE to install Kubernetes components on VMSS nodes. Exit codes indicate specific failures: ERR_OUTBOUND_CONN_FA
   - 方案: 1) ASC → VM → Extensions → expand failed CSE → Status Message for error code. 2) Cross-reference exit code: https://github.com/Azure/acs-engine/blob/m
   - `[🔵 7.5 | AW]`

3. **Cannot delete Image Builder template - UAMI deleted before removal from config; **
   - 根因: UAMI deleted before removal from template. Template in provisioningState=Failed, immutable. AIB requires existing UAMI i
   - 方案: (1) Recreate deleted identity exact same name/RG. (2) Create temp identity. (3) body.json: old identity=null, new identity={}. (4) az rest --method pa
   - `[🔵 7.5 | AW]`

4. **VM connectivity degraded: slow connection, random disconnections, black screen o**
   - 根因: Misconfigured User Defined Routes (UDR) causing network loops, or traffic routed to virtual appliances/firewalls with im
   - 方案: Check UDR via ASC Resource Explorer -> VM -> Virtual Network -> Subnet -> Route Table. Verify next hop type and destination for routes covering the VM
   - `[🔵 7.5 | AW]`

5. **Customer resource is not shown in the Azure Advisor blade, or a banner message a**
   - 根因: The user lacks the required RBAC role (Owner, Contributor, or Reader) for the impacted resources at Subscription, Resour
   - 方案: Check Role Assignments in Access Control (IAM) for the subscription/resource group. Customer needs someone with assignment permissions to grant Owner,
   - `[🔵 7.5 | AW]`

