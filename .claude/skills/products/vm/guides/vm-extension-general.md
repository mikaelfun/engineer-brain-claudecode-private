# VM 扩展通用问题 — 排查速查

**来源数**: 4 (AW, KB, ML, ON) | **条目**: 56 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Palo Alto firewall VM fails to convert from unmanaged disk to managed disk; extensions (OMSAgentForL | Azure VM extensions are not in the support matrix for Palo Alto OS. Extension op | 1) Attempt extension removal: az vm extension delete -g <RG> --vm-name <VM> -n < | 🟢 8 | ON |
| 2 | VM operation (extension install, VM start, resize) takes exactly 90 minutes to complete; subsequent  | An extension is stuck in 'Transitioning' state, hitting the 90-minute timeout. T | 1) Check ASC Resource Explorer → Operations tab for 90-min timing. 2) Use Kusto: | 🔵 7.5 | AW |
| 3 | VM using legacy ADE Dual Pass (with AAD) encryption needs migration to current Single Pass (without  | ADE Dual Pass (with AAD) is deprecated legacy version that relies on Azure AD fo | Run Set-AzVMDiskEncryptionExtension -ResourceGroupName <rg> -VMName <vm> -Migrat | 🔵 7.5 | AW |
| 4 | Need to migrate VM from Dual Pass ADE (with AAD/Service Principal) to Single Pass ADE (without AAD) |  | Use Set-AzVMDiskEncryptionExtension -ResourceGroupName $RG -VMName $VM -Migrate. | 🔵 7.5 | AW |
| 5 | Extension installation fails with error: 'Current sequence number, 0, is not greater than the sequen | VM Extensions use sequence numbers to detect configuration changes. When the sam | 1. Modify some extension settings so the handler detects changes and assigns a n | 🔵 7.5 | AW |
| 6 | Azure Performance Diagnostics (PerfInsights) extension fails with VMExtensionProvisioningError. Hand | FIPS mode is enabled on the VM (registry key HKLM\System\CurrentControlSet\Contr | 1) Check FIPS status: REGEDIT > HKLM\System\CurrentControlSet\Control\Lsa\FipsAl | 🔵 7.5 | AW |
| 7 | VM extension deployment fails with 'RequestDisallowedByPolicy: Resource <ExtensionName> was disallow | Azure Policy assignment 'Only approved VM extensions should be installed' (polic | Navigate to Azure Portal > Policy > Assignments > find the policy > Edit assignm | 🔵 7.5 | AW |
| 8 | Customer wants to remove the legacy fixEmulatedIO extension (deployed for Spectre mitigation) from t | The fixEmulatedIO extension was deployed by Microsoft to mitigate the Spectre se | Remove via PowerShell: Get-AzVMExtension -ResourceGroupName <RG> -VMName <VM> -N | 🔵 7.5 | AW |
| 9 | VM deployment or extension installation fails with error 'Resource was disallowed by policy' / 'Requ | An Azure Policy assignment ('Only approved VM extensions should be installed') i | 1) Navigate to Azure Portal > Policy > Assignments > find the policy. 2) Click ' | 🔵 7.5 | AW |
| 10 | Customer wants to remove the legacy fixEmulatedIO extension (deployed for Spectre security mitigatio | The fixEmulatedIO extension was deployed by Microsoft on customer's behalf durin | Remove via Azure Cloud Shell PowerShell: Get-AzVMExtension -ResourceGroupName <R | 🔵 7.5 | AW |
| 11 | VM deployment or extension installation fails with RequestDisallowedByPolicy error: Resource was dis | An Azure Policy assignment restricts which VM extensions can be installed. The e | 1. Navigate to Azure Portal > Policy > Assignments. 2. Search for the blocking p | 🔵 7.5 | AW |
| 12 | Customer wants to remove the fixEmulatedIO extension (Spectre security mitigation) from their VM. Ex | The fixEmulatedIO extension was deployed by Microsoft to mitigate the Spectre se | 1. Try PowerShell: Get-AzVMExtension -ResourceGroupName {rg} -VMName {vm} -Name  | 🔵 7.5 | AW |
| 13 | VM extension deployment fails with 'Publisher and type are not supported for OS type', 'The specifie | Extension is incompatible with the VM's operating system — using a Linux extensi | Use the correct OS-specific extension version. Windows: Microsoft.Compute.Custom | 🔵 7.5 | AW |
| 14 | VMSnapshotForLinux (Azure Backup) extension fails with 'ManagedRPCreationFailedInCrpButExtensionSucc | The VMSnapshotLinux extension's pre_check() calls getpwuid() which triggers LDAP | Configure pre/post backup scripts to stop and start the LDAP service (e.g., lsas | 🔵 7.5 | AW |
| 15 | OpenSSH extension (Microsoft.Azure.OpenSSH.WindowsOpenSSH) fails to install on Windows Server with e | OpenSSH on Windows Server 2016 is not supported by CSS. For Windows Server 2019+ | For Server 2016: not supported — direct customer to GitHub issues (https://githu | 🔵 7.5 | AW |
| 16 | System error 5 'Access is denied' when accessing Azure File Share with identity-based auth due to mi | User missing either share-level RBAC permissions (SMB Reader/Contributor/Elevate | 1) Verify RBAC via ASC Resource Explorer at storage account/file share level. 2) | 🔵 7.5 | AW |
| 17 | Access denied (0xc0000022) when mounting Azure File Share - XDS log shows 'Account does not list SMB | Client attempting to connect with SMB version not in storage account allowed SMB | Configure client SMB version via registry: HKLM\SYSTEM\CurrentControlSet\Service | 🔵 7.5 | AW |
| 18 | Access denied when mounting Azure File Share with Kerberos - wrong encryption type (e.g. RC4 when on | Kerberos ticket encrypted with unsupported encryption type for the storage accou | Use correct encryption type or allow required type at storage account level. See | 🔵 7.5 | AW |
| 19 | Extension installation fails on Windows VM with error 'The specified executable is not a valid appli | Customer is attempting to install a Linux-specific extension on a Windows VM. Li | Use the correct Windows-equivalent extension. For Custom Script: use Microsoft.C | 🔵 7.5 | AW |
| 20 | Extension installation fails on Linux VM with 'Non-zero exit code: 127' or 'No such file or director | Customer is attempting to install a Windows-specific extension on a Linux VM. Wi | Use the correct Linux-equivalent extension. For Custom Script: use Microsoft.Azu | 🔵 7.5 | AW |
| 21 | Old extension files accumulate on Linux VM under /var/lib/waagent, consuming disk space | Windows Azure Linux Agent (WALA) versions prior to 2.2.44 do not properly clean  | Update WALA agent to version 2.2.44 or later. In this version, cleanup is handle | 🔵 7.5 | AW |
| 22 | OpenSSH extension (Microsoft.Azure.OpenSSH.WindowsOpenSSH) fails to install on Windows VM with exit  | OpenSSH on Windows Server 2016 is not supported by CSS. Only Windows Server 2019 | For Windows Server 2016: OpenSSH is not supported, direct customer to GitHub iss | 🔵 7.5 | AW |
| 23 | Azure VM created from NetApp CVO (Cloud Volumes ONTAP) image shows notification about unsupported VM | Cloud Volumes ONTAP uses customized FreeBSD derivative, not Linux. Azure VM exte | Remove all extensions via PowerShell: Invoke-AzRestMethod PUT with empty resourc | 🔵 7.5 | AW |
| 24 | VMAppExtension deletion fails with error: Operation 'PUT Extension' is not allowed on VM extension ' | The VMApps extension is stuck in a failed/transitioning state in the ARM cache.  | 1) Remove failed extension via Remove-AzVMExtension. 2) If persists, use REST AP | 🔵 7.5 | AW |
| 25 | Azure VM extensions fail or trigger BlueXP notifications on VMs created from NetApp Cloud Volumes ON | Cloud Volumes ONTAP uses customized FreeBSD-based ONTAP OS (not Linux). Azure VM | Remove all extensions using PowerShell Invoke-AzRestMethod PUT with empty resour | 🔵 7.5 | AW |
| 26 | VM fails to start or extension install fails with error 'No version found in the artifact repository | Extension and/or version specified by customer is incorrect, or in rare cases an | Remove the extension: Remove-AzVMExtension -ResourceGroupName <RG> -VMName <VM>  | 🔵 7.5 | AW |
| 27 | VM fails to start or extension install fails with 'No version found in the artifact repository that  | Extension and/or version specified by customer is incorrect, or the extension wa | 1) Remove the extension: Remove-AzVMExtension -ResourceGroupName <RG> -VMName <V | 🔵 7.5 | AW |
| 28 | Black screen after entering RDP credentials; user profile does not finish loading; VM has network co | Winlogon cannot complete logon and policy processing; a process or thread is dea | Collect a memory dump while the VM is in the failing state and analyze it to ide | 🔵 7.5 | AW |
| 29 | Black screen on both VM console screenshot and RDP session; Desktop Window Manager (dwm.exe) crashes | OS file corruption affecting the GUI subsystem, specifically dwm.exe; related to | Apply KB3137061 fix. For file corruption, run SFC /scannow and DISM /online /cle | 🔵 7.5 | AW |
| 30 | ACSS SAP system discovery or registration fails with error code AzureVMIsNotInSupportedProvisioningS | The SAP central instance was deleted. ACSS cannot find any SAP central instances | Delete the VIS and re-register the SAP system. Use Kusto queries on waasservices | 🔵 7.5 | AW |
| 31 | ACSS workloads extension installation fails on SAP VM with error indicating extension cannot communi | SAP VM vNet/firewall is not configured to allow connectivity to the managed reso | Configure vNet following https://learn.microsoft.com/en-us/azure/center-sap-solu | 🔵 7.5 | AW |
| 32 | Azure VM backup fails with error: 'Extension installation failed due to a COM+ error. Please restart | Two causes: (1) IaaS VM provider service (required for backup) is missing from t | Step 1: Check if IaaS VM provider service exists; if not, add required registry  | 🔵 7.5 | ON |
| 33 | Many Linux Azure Market Place images contain an Azure Linux Agent, this is responsible for completin | When will the updates take place? Please see this page for details on images bei | What do you need to do? If you deploy these Azure Market Place images, there is  | 🔵 7 | KB |
| 34 | VM extension installation fails with error: Current sequence number, 0, is not greater than the sequ | VM Extensions use sequence numbers to detect config changes. If re-run with same | Modify settings so handler assigns new sequence number, or use PowerShell -Force | 🔵 7 | ON |
| 35 | Extension installation fails with error code 1007: the system cannot find the file specified. | COMSPEC environment variable changed from cmd.exe to another executable (e.g. Ja | Reset COMSPEC to c:\windows\system32\cmd.exe. Reboot VM. | 🔵 7 | ON |
| 36 | Extension fails: The remote certificate is invalid according to the validation procedure. Could not  | Missing Baltimore CyberTrust Root cert, or cert chain broken by 3rd party SSL in | Install Baltimore CyberTrust Root cert from cacert.omniroot.com/bc2025.crt and r | 🔵 7 | ON |
| 37 | Linux VM extension fails with non-zero exit code 126. All extensions fail to execute. | /var partition mounted with noexec flag in /etc/fstab, blocking script execution | Check /etc/fstab for noexec on /var. Remount: mount -o remount,exec /var | 🔵 7 | ON |
| 38 | VM operations (start, extension install, update) take exactly 90 minutes to complete | An extension is stuck in 'Transitioning' state and hitting the 90-minute timeout | 1) Check ASC Resource Explorer Operations tab for 90-min operations 2) Query CRP | 🔵 6.5 | AW |
| 39 | Publishing image to Azure Compute Gallery fails with SubscriptionNotRegistered error: 'Cannot specif | The subscription is not enabled/registered for the specific target region. The M | Create a collaboration task and engage the Quota Team (SAP: Azure/Service and su | 🔵 6.5 | AW |
| 40 | After removing ADE extension, platform cannot report encryption status or provision VM properly | ADE extension was removed (Remove-AzVMDiskEncryptionExtension) before disk encry | Always run Disable-AzVMDiskEncryption first to unencrypt the disk, then Remove-A | 🔵 6.5 | AW |
| 41 | VM extension installation fails with Current sequence number, 0, is not greater than the sequence nu | VM Extensions use sequence numbers to detect configuration changes. When reinsta | Option 1: Modify extension settings so the handler assigns a new sequence number | 🔵 6.5 | AW |
| 42 | Access Denied error when trying to mount Azure File Share using storage account key (NTLMv2 authenti | Storage account SMB security settings restrict authentication methods (e.g., onl | Check and adjust SMB security settings: PowerShell Update-AzStorageFileServicePr | 🔵 6.5 | AW |
| 43 | Azure Diagnostic Extension fails with error 'Failed to generate a unique diagnostics storage account | The storage account used for boot diagnostics has Storage Account Firewall enabl | Navigate to the boot diagnostics storage account > Firewall and Virtual Networks | 🔵 6.5 | AW |
| 44 | Customer expects VM to leave the domain after removing or deleting JsonADDomainExtension, but VM rem | The JsonADDomainExtension performs a one-time Active Directory domain join. Remo | Domain membership must be explicitly removed at the OS level (System Properties  | 🔵 6.5 | AW |
| 45 | VMSnapshotForLinux extension fails with ManagedRPCreationFailedInCrpButExtensionSucceeded. CRP shows | The VMSnapshotLinux extension calls getpwuid() during pre-checks which triggers  | Configure Azure Backup pre/post scripts to stop and start the LDAP service aroun | 🔵 6.5 | AW |
| 46 | Error 'Operation PUT Extension is not allowed on VM extension VMAppExtension since it is marked for  | VMApps extension stuck in 'marked for deletion' state, CRP cannot proceed with P | Use REST API Virtual_Machine_Update (PATCH) to clear applicationProfile.galleryA | 🔵 6.5 | AW |
| 47 | VM fails to start or extension install fails with 'No version found in the artifact repository' or ' | Extension publisher/type/version specified incorrectly, or extension was acciden | Remove the extension: Remove-AzVMExtension -ResourceGroupName <RG> -VMName <VM>  | 🔵 6.5 | AW |
| 48 | ACSS WorkloadsExtensionLinux needs to be uninstalled and re-registered on all VMs when ACSS registra | Workloads extension state is corrupted or outdated, requiring clean reinstall an | For each VM: go to VM > Extensions + Applications > click WorkloadExtensionLinux | 🔵 6.5 | AW |
| 49 | AIB start build fails sporadically with RedHat 9.x image when customizer step runs sudo dnf update - | Package manager access conflict between dnf update and VM configuration/extensio | Wrap dnf update in a background command with delay: ( sleep 5m && sudo dnf updat | 🔵 6.5 | AW |
| 50 | 32-bit Windows OS on Azure VM only shows 1GB of available memory; remaining memory appears as reserv | Azure platform imposes a memory address space limitation on VMs running 32-bit o | Migrate to 64-bit operating system version. Note: only Specialized VHDs are supp | 🔵 6.5 | ML |
| 51 | Multiple 'Windows Azure CRP Certificate Generator' certificates accumulate in VM certificate store a | Each VM stop/start cycle on a new host issues a new transport certificate for ex | 1) Delete old certificates manually (keep only latest). VM agent re-creates if n | 🔵 6.5 | ML |
| 52 | VM extension fails with FailedToDecryptProtectedSettings. Errors include: 'Keyset does not exist', ' | Transport certificate used to decrypt extension protected settings is missing, e | 1) Delete 'Windows Azure CRP Certificate Generator' cert from Certificates snap- | 🔵 6.5 | ML |
| 53 | VM extension fails with Error Code 51 'Unsupported OS'. Extension cannot run on the current operatin | The VM's operating system is not supported by the specific extension. Windows VM | 1) Check individual extension documentation for OS support matrix. 2) Upgrade OS | 🔵 6.5 | ML |
| 54 | Windows VM backup fails at snapshot operation with error ExtensionFailedTimeoutVMNetworkUnresponsive | TLS version mismatch: Azure Storage requires TLS 1.1 or 1.2, but Windows .NET ap | Add SchUseStrongCrypto DWORD value=1 under all .NET Framework registry paths for | 🔵 6.5 | ON |
| 55 | Customer requests quota increase for Elastic SAN (e.g., maximum number of Elastic SANs per subscript |  | File ICM to ElasticSANRP team with title "Quota Increase for Customer Subscripti | 🔵 5.5 | AW |
| 56 | ADE enable fails with "Failed to configure bitlocker as expected. Exception: SaveExternalKeyToFile f | GPO or registry setting FDVDenyWriteAccess=1 (Deny write access to removable dri | Set registry FDVDenyWriteAccess to 0: reg add "HKLM\SYSTEM\CurrentControlSet\Pol | 🔵 5.0 | AW |

## 快速排查路径

1. **Palo Alto firewall VM fails to convert from unmanaged disk to managed disk; exte**
   - 根因: Azure VM extensions are not in the support matrix for Palo Alto OS. Extension operations (install/remove) are expected t
   - 方案: 1) Attempt extension removal: az vm extension delete -g <RG> --vm-name <VM> -n <ExtensionName> — success not guaranteed on Palo Alto OS. 2) Follow Pal
   - `[🟢 8 | ON]`

2. **VM operation (extension install, VM start, resize) takes exactly 90 minutes to c**
   - 根因: An extension is stuck in 'Transitioning' state, hitting the 90-minute timeout. This blocks all subsequent extension oper
   - 方案: 1) Check ASC Resource Explorer → Operations tab for 90-min timing. 2) Use Kusto: cluster('azcrp').database('crp_allprod').ContextActivity | where acti
   - `[🔵 7.5 | AW]`

3. **VM using legacy ADE Dual Pass (with AAD) encryption needs migration to current S**
   - 根因: ADE Dual Pass (with AAD) is deprecated legacy version that relies on Azure AD for authentication
   - 方案: Run Set-AzVMDiskEncryptionExtension -ResourceGroupName <rg> -VMName <vm> -Migrate (requires Az module >= 5.9.0). VM will reboot during migration. Veri
   - `[🔵 7.5 | AW]`

4. **Need to migrate VM from Dual Pass ADE (with AAD/Service Principal) to Single Pas**
   - 方案: Use Set-AzVMDiskEncryptionExtension -ResourceGroupName $RG -VMName $VM -Migrate. Requires Azure PowerShell Az module >=5.9.0. VM will be rebooted duri
   - `[🔵 7.5 | AW]`

5. **Extension installation fails with error: 'Current sequence number, 0, is not gre**
   - 根因: VM Extensions use sequence numbers to detect configuration changes. When the same extension is run with identical settin
   - 方案: 1. Modify some extension settings so the handler detects changes and assigns a new sequence number. 2. Or use PowerShell with -ForceRerun parameter: S
   - `[🔵 7.5 | AW]`

