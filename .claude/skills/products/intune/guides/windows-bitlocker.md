# INTUNE BitLocker 加密管理 — 排查速查

**来源数**: 4 | **21V**: 部分 (16/22)
**条目数**: 22 | **最后更新**: 2026-04-17

## 快速排查路径

1. **BitLocker recovery key not visible in Azure AD/Intune portal despite Intune BitLocker policy applied; key only escrowed to on-premises AD**
   → Use PowerShell script to manually escrow recovery keys to AAD (e.g. Invoke-EscrowBitlockerToAAD from GitHub). Check FVE registry and GPSearch to confirm applied backup policy. Deploy batch migratio... `[onenote, 🟢 9.5]`

2. **After BitLocker key rotation or manual key deletion, old recovery key still visible in Azure AD portal (Windows 10)**
   → For Windows 11 22H2+: Intune Key Rotation button removes old key within minutes. For Windows 10: old keys remain in AAD by design - inform customer this is expected behavior `[onenote, 🟢 9.5]`

3. **BitLocker key rotation initiated from Intune portal fails with error**
   → Configure Endpoint Protection profile: enable BitLocker encryption, set 'Client-driven recovery password rotation', ensure 'Save BitLocker recovery info to AAD' is enabled. For VMs, unmount ISO bef... `[onenote, 🟢 9.5]`

4. **Windows 10 设备执行 Wipe 后无法重启，设备变砖**
   → 1. 避免选择断电继续擦除选项；2. 对 BitLocker 加密设备同样适用；3. 已变砖的设备需使用可启动媒介重新安装 Windows `[ado-wiki, 🟢 9.0]`

5. **User sees 'Recovery key could not be retrieved' when trying to access BitLocker recovery key from Company Portal website**
   → In Entra ID > Devices > Device settings, change the BitLocker key restriction setting to 'No' to allow users to recover their own keys. Alternatively, an admin can retrieve the key on behalf of the... `[ado-wiki, 🟢 9.0]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | BitLocker recovery key not visible in Azure AD/Intune portal despite Intune BitLocker policy appl... | If BitLocker was enabled and recovery key already uploaded to on-premises AD before Intune policy... | Use PowerShell script to manually escrow recovery keys to AAD (e.g. Invoke-EscrowBitlockerToAAD f... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 2 | After BitLocker key rotation or manual key deletion, old recovery key still visible in Azure AD p... | Windows 10 22H2 does not remove old recovery keys from AAD after local deletion. Windows 11 22H2+... | For Windows 11 22H2+: Intune Key Rotation button removes old key within minutes. For Windows 10: ... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 3 | BitLocker key rotation initiated from Intune portal fails with error | Missing 'Save BitLocker recovery information to Azure Active Directory' setting in Endpoint Prote... | Configure Endpoint Protection profile: enable BitLocker encryption, set 'Client-driven recovery p... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 4 | Windows 10 设备执行 Wipe 后无法重启，设备变砖 | 选择了 Wipe device and continue to wipe even if devices lose power 选项，可能导致部分 Windows 10 设备无法启动；或 Win... | 1. 避免选择断电继续擦除选项；2. 对 BitLocker 加密设备同样适用；3. 已变砖的设备需使用可启动媒介重新安装 Windows | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Actions) |
| 5 | User sees 'Recovery key could not be retrieved' when trying to access BitLocker recovery key from... | Entra ID device setting 'Restrict non-admin users from recovering BitLocker keys' is set to 'Yes' | In Entra ID > Devices > Device settings, change the BitLocker key restriction setting to 'No' to ... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FBitlocker%20Recovery%20Key) |
| 6 | BitLocker silent encryption fails with Event ID 851: 'Group Policy settings for BitLocker startup... | 'Configure TPM startup PIN' (or 'Configure TPM startup key'/'Configure TPM startup key and PIN') ... | Change 'Configure TPM startup PIN' to either 'Allow' or 'Do not allow'. Same applies to 'Configur... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FTroubleshooting%20Common%20Bitlocker%20Issues) |
| 7 | This article explains how to setup an Endpoint Protection policy to enable Windows Encryption (Bi... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4339155) |
| 8 | We document the requirements for automatic device encryption here:https://docs.microsoft.com/en-u... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4502023) |
| 9 | Use Intune Endpoint Protection settings to configure&nbsp;Client-driven recovery password rotatio... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4531503) |
| 10 | Customer receives the following error when attempting to implement silent encryption:&nbsp;Error:... | A bug in the BIOS firmware of the device causes TPM to not be detected during startup. | To resolve this issue, review msinfo32 report to verify BIOS version, then update it to the lates... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4592160) |
| 11 | When following the steps in the docs article here&nbsp;to use Windows Configuration Designer (WCD... | This can occur when User may join devices to Azure AD is set to&nbsp;None in the the AAD portal u... | To resolve this issue, change the Users may join Devices to Azure AD setting to All or to Selecte... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4637369) |
| 12 | A remote wipe sent from Intune fails and causes the OS to report &quot;no changes were made&quot;. | This can occur if WinRE files are missing.&nbsp; | There is a .ps1 script here&nbsp;that should be utilized to unblock customers on this until the o... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4642303) |
| 13 | When in “Shared experiences” under “Accounts” users see ” Some of your accounts require attention... | This can occur if the device limit has been exceeded for the user in either Azure AD or Intune. | To resolve this problem, increase the device limit in AAD and/or Intune, or remove any stale devi... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5013224) |
| 14 | Customer reports that they have created an Intune RBAC role which is properly set and targeted to... | Bitlocker recovery keys are an Azure AD object, not Intune object, so you would need an AAD role ... | The permissions needed are documented here (BitLockerKey.ReadBasic.All, BitLockerKey.Read.All): h... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5025698) |
| 15 | Automatic device encryption is failing for the reason &quot;PCR7 binding is not supported&quot; o... | From the OS point of view, in the absence of PCR 7 binding, any other signature present on boot c... | Windows is secure regardless of using TPM profile 0, 2, 4, 11 or profile 7, 11.  This is an expec... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5027036) |
| 16 | The&nbsp;One Data Collector&nbsp;is a support script to enable the collection of logs, registry d... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5028604) |
| 17 | Device registration fails 0x80280036. TPM FIPS mode. | TPM has FIPS mode enabled, not supported for Azure device registration. | Disable FIPS mode on TPM. | 🔵 6.5 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/comanage-configmgr/troubleshoot-co-management-auto-enrolling) |
| 18 | Hybrid AAD join fails 0x80090016 Keyset does not exist. | Windows is not TPM owner. TPM init failed. | Clear TPM via Windows Security. Disable BitLocker first. Restart. | 🔵 6.5 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/comanage-configmgr/troubleshoot-co-management-auto-enrolling) |
| 19 | Windows 10 device cannot restart after Intune remote Wipe action | Wipe device and continue to wipe even if devices lose power option selected with Windows installa... | Use bootable media to reinstall Windows 10. For BitLocker encrypted devices same resolution. | 🔵 6.5 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-management/troubleshoot-device-actions) |
| 20 | BitLocker silent encryption fails with conflicting Group Policy settings error in BitLocker-API e... | Conflicting TPM startup settings: configuring TPM startup PIN or startup key to Allowed while req... | Set Compatible TPM startup PIN and Compatible TPM startup key to Blocked in BitLocker policy when... | 🔵 6.5 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-protection/troubleshoot-bitlocker-policies) |
| 21 | BitLocker silent encryption fails: TPM is not available / A compatible Trusted Platform Module Se... | TPM chip is missing, disabled in BIOS, or unhealthy. TPM is required for silent encryption | Verify TPM via TPM.msc or Get-Tpm cmdlet. If disabled, enable in BIOS. For TPM 2.0, ensure UEFI B... | 🔵 6.5 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-protection/troubleshoot-bitlocker-policies) |
| 22 | We document the requirements for automatic device encryption here: https://docs.microsoft.com/en-... |  |  | 🟡 3.0 | contentidea-kb |

> 本 topic 有排查工作流 → [排查工作流](workflows/windows-bitlocker.md)
> → [已知问题详情](details/windows-bitlocker.md)
