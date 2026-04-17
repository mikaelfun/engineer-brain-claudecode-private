# INTUNE BitLocker 加密管理 — 已知问题详情

**条目数**: 22 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: BitLocker recovery key not visible in Azure AD/Intune portal despite Intune BitLocker policy applied; key only escrowed to on-premises AD
**Solution**: Use PowerShell script to manually escrow recovery keys to AAD (e.g. Invoke-EscrowBitlockerToAAD from GitHub). Check FVE registry and GPSearch to confirm applied backup policy. Deploy batch migration from MBAM to MEM as needed
`[Source: onenote, Score: 9.5]`

### Step 2: After BitLocker key rotation or manual key deletion, old recovery key still visible in Azure AD portal (Windows 10)
**Solution**: For Windows 11 22H2+: Intune Key Rotation button removes old key within minutes. For Windows 10: old keys remain in AAD by design - inform customer this is expected behavior
`[Source: onenote, Score: 9.5]`

### Step 3: BitLocker key rotation initiated from Intune portal fails with error
**Solution**: Configure Endpoint Protection profile: enable BitLocker encryption, set 'Client-driven recovery password rotation', ensure 'Save BitLocker recovery info to AAD' is enabled. For VMs, unmount ISO before enabling encryption
`[Source: onenote, Score: 9.5]`

### Step 4: Windows 10 设备执行 Wipe 后无法重启，设备变砖
**Solution**: 1. 避免选择断电继续擦除选项；2. 对 BitLocker 加密设备同样适用；3. 已变砖的设备需使用可启动媒介重新安装 Windows
`[Source: ado-wiki, Score: 9.0]`

### Step 5: User sees 'Recovery key could not be retrieved' when trying to access BitLocker recovery key from Company Portal website
**Solution**: In Entra ID > Devices > Device settings, change the BitLocker key restriction setting to 'No' to allow users to recover their own keys. Alternatively, an admin can retrieve the key on behalf of the user.
`[Source: ado-wiki, Score: 9.0]`

### Step 6: BitLocker silent encryption fails with Event ID 851: 'Group Policy settings for BitLocker startup options are in conflict and cannot be applied'
**Solution**: Change 'Configure TPM startup PIN' to either 'Allow' or 'Do not allow'. Same applies to 'Configure TPM startup key' and 'Configure TPM startup key and PIN'. Check BitLocker Management event log (Microsoft-Windows-BitLocker/BitLocker Management) for error details.
`[Source: ado-wiki, Score: 9.0]`

### Step 7: This article explains how to setup an Endpoint Protection policy to enable Windows Encryption (Bitlocker) on a device that does not have a TPM chip...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 8: We document the requirements for automatic device encryption here:https://docs.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-b...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | BitLocker recovery key not visible in Azure AD/Intune portal despite Intune B... | If BitLocker was enabled and recovery key already uploaded to on-premises AD ... | Use PowerShell script to manually escrow recovery keys to AAD (e.g. Invoke-Es... | 9.5 | onenote |
| 2 | After BitLocker key rotation or manual key deletion, old recovery key still v... | Windows 10 22H2 does not remove old recovery keys from AAD after local deleti... | For Windows 11 22H2+: Intune Key Rotation button removes old key within minut... | 9.5 | onenote |
| 3 | BitLocker key rotation initiated from Intune portal fails with error | Missing 'Save BitLocker recovery information to Azure Active Directory' setti... | Configure Endpoint Protection profile: enable BitLocker encryption, set 'Clie... | 9.5 | onenote |
| 4 | Windows 10 设备执行 Wipe 后无法重启，设备变砖 | 选择了 Wipe device and continue to wipe even if devices lose power 选项，可能导致部分 Win... | 1. 避免选择断电继续擦除选项；2. 对 BitLocker 加密设备同样适用；3. 已变砖的设备需使用可启动媒介重新安装 Windows | 9.0 | ado-wiki |
| 5 | User sees 'Recovery key could not be retrieved' when trying to access BitLock... | Entra ID device setting 'Restrict non-admin users from recovering BitLocker k... | In Entra ID > Devices > Device settings, change the BitLocker key restriction... | 9.0 | ado-wiki |
| 6 | BitLocker silent encryption fails with Event ID 851: 'Group Policy settings f... | 'Configure TPM startup PIN' (or 'Configure TPM startup key'/'Configure TPM st... | Change 'Configure TPM startup PIN' to either 'Allow' or 'Do not allow'. Same ... | 9.0 | ado-wiki |
| 7 | This article explains how to setup an Endpoint Protection policy to enable Wi... |  |  | 7.5 | contentidea-kb |
| 8 | We document the requirements for automatic device encryption here:https://doc... |  |  | 7.5 | contentidea-kb |
| 9 | Use Intune Endpoint Protection settings to configure&nbsp;Client-driven recov... |  |  | 7.5 | contentidea-kb |
| 10 | Customer receives the following error when attempting to implement silent enc... | A bug in the BIOS firmware of the device causes TPM to not be detected during... | To resolve this issue, review msinfo32 report to verify BIOS version, then up... | 7.5 | contentidea-kb |
| 11 | When following the steps in the docs article here&nbsp;to use Windows Configu... | This can occur when User may join devices to Azure AD is set to&nbsp;None in ... | To resolve this issue, change the Users may join Devices to Azure AD setting ... | 7.5 | contentidea-kb |
| 12 | A remote wipe sent from Intune fails and causes the OS to report &quot;no cha... | This can occur if WinRE files are missing.&nbsp; | There is a .ps1 script here&nbsp;that should be utilized to unblock customers... | 7.5 | contentidea-kb |
| 13 | When in “Shared experiences” under “Accounts” users see ” Some of your accoun... | This can occur if the device limit has been exceeded for the user in either A... | To resolve this problem, increase the device limit in AAD and/or Intune, or r... | 7.5 | contentidea-kb |
| 14 | Customer reports that they have created an Intune RBAC role which is properly... | Bitlocker recovery keys are an Azure AD object, not Intune object, so you wou... | The permissions needed are documented here (BitLockerKey.ReadBasic.All, BitLo... | 7.5 | contentidea-kb |
| 15 | Automatic device encryption is failing for the reason &quot;PCR7 binding is n... | From the OS point of view, in the absence of PCR 7 binding, any other signatu... | Windows is secure regardless of using TPM profile 0, 2, 4, 11 or profile 7, 1... | 7.5 | contentidea-kb |
| 16 | The&nbsp;One Data Collector&nbsp;is a support script to enable the collection... |  |  | 7.5 | contentidea-kb |
| 17 | Device registration fails 0x80280036. TPM FIPS mode. | TPM has FIPS mode enabled, not supported for Azure device registration. | Disable FIPS mode on TPM. | 6.5 | mslearn |
| 18 | Hybrid AAD join fails 0x80090016 Keyset does not exist. | Windows is not TPM owner. TPM init failed. | Clear TPM via Windows Security. Disable BitLocker first. Restart. | 6.5 | mslearn |
| 19 | Windows 10 device cannot restart after Intune remote Wipe action | Wipe device and continue to wipe even if devices lose power option selected w... | Use bootable media to reinstall Windows 10. For BitLocker encrypted devices s... | 6.5 | mslearn |
| 20 | BitLocker silent encryption fails with conflicting Group Policy settings erro... | Conflicting TPM startup settings: configuring TPM startup PIN or startup key ... | Set Compatible TPM startup PIN and Compatible TPM startup key to Blocked in B... | 6.5 | mslearn |
| 21 | BitLocker silent encryption fails: TPM is not available / A compatible Truste... | TPM chip is missing, disabled in BIOS, or unhealthy. TPM is required for sile... | Verify TPM via TPM.msc or Get-Tpm cmdlet. If disabled, enable in BIOS. For TP... | 6.5 | mslearn |
| 22 | We document the requirements for automatic device encryption here: https://do... |  |  | 3.0 | contentidea-kb |
