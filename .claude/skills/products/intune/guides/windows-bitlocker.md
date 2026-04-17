# Intune BitLocker 加密管理 — 排查速查

**来源数**: 3 | **21V**: 部分适用
**条目数**: 13 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | USB drive access fails with 'Please Insert a Disk Into USB Drive' error after removing Intune USB... | StorageCardDisabled registry key (set to 1) persists under HKLM\SOFTWARE\Micr... | Remove the StorageCardDisabled value from HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\StorageS... | 🟢 9.0 | OneNote |
| 2 | BitLocker recovery key not visible in Azure AD/Intune portal despite Intune BitLocker policy appl... | If BitLocker was enabled and recovery key already uploaded to on-premises AD ... | Use PowerShell script to manually escrow recovery keys to AAD (e.g. Invoke-EscrowBitlockerToAAD f... | 🟢 9.0 | OneNote |
| 3 | After BitLocker key rotation or manual key deletion, old recovery key still visible in Azure AD p... | Windows 10 22H2 does not remove old recovery keys from AAD after local deleti... | For Windows 11 22H2+: Intune Key Rotation button removes old key within minutes. For Windows 10: ... | 🟢 9.0 | OneNote |
| 4 | macOS FileVault policy deployed via Intune shows FileVault payload is installed but FileVault is ... | The FileVault MDM profile was successfully installed on the device, but the a... | 1. Ensure the user logs out and logs back in (or restarts) after the FileVault profile is install... | 🟢 9.0 | OneNote |
| 5 | Windows 10 设备执行 Wipe 后无法重启，设备变砖 | 选择了 Wipe device and continue to wipe even if devices lose power 选项，可能导致部分 Win... | 1. 避免选择断电继续擦除选项；2. 对 BitLocker 加密设备同样适用；3. 已变砖的设备需使用可启动媒介重新安装 Windows | 🟢 8.5 | ADO Wiki |
| 6 | User sees 'Recovery key could not be retrieved' when trying to access BitLocker recovery key from... | Entra ID device setting 'Restrict non-admin users from recovering BitLocker k... | In Entra ID > Devices > Device settings, change the BitLocker key restriction setting to 'No' to ... | 🟢 8.5 | ADO Wiki |
| 7 | BitLocker silent encryption fails with Event ID 851: 'Group Policy settings for BitLocker startup... | 'Configure TPM startup PIN' (or 'Configure TPM startup key'/'Configure TPM st... | Change 'Configure TPM startup PIN' to either 'Allow' or 'Do not allow'. Same applies to 'Configur... | 🟢 8.5 | ADO Wiki |
| 8 | BitLocker recovery key not escrowed to Azure AD; only saved to local Active Directory on Hybrid A... | During Hybrid Azure AD joined Autopilot provisioning with BitLocker policy as... | 1) Assign BitLocker policy to user group instead of device group (may still fail if hybrid Azure ... | 🟢 8.5 | ADO Wiki |
| 9 | Intune Disk Encryption (BitLocker) policy shows Error status for devices in Endpoint Security por... | BitLocker CSP FixedDrivesRecoveryOptions setting does not have a real Not Con... | Change Recovery key file creation under FixedDrivesRecoveryOptions from Not Configured to an expl... | 🟢 8.0 | OneNote |
| 10 | Hybrid AAD join fails 0x80090016 Keyset does not exist. | Windows is not TPM owner. TPM init failed. | Clear TPM via Windows Security. Disable BitLocker first. Restart. | 🔵 6.5 | MS Learn |
| 11 | Windows 10 device cannot restart after Intune remote Wipe action | Wipe device and continue to wipe even if devices lose power option selected w... | Use bootable media to reinstall Windows 10. For BitLocker encrypted devices same resolution. | 🔵 6.5 | MS Learn |
| 12 | BitLocker silent encryption fails with conflicting Group Policy settings error in BitLocker-API e... | Conflicting TPM startup settings: configuring TPM startup PIN or startup key ... | Set Compatible TPM startup PIN and Compatible TPM startup key to Blocked in BitLocker policy when... | 🔵 6.5 | MS Learn |
| 13 | BitLocker silent encryption fails: TPM is not available / A compatible Trusted Platform Module Se... | TPM chip is missing, disabled in BIOS, or unhealthy. TPM is required for sile... | Verify TPM via TPM.msc or Get-Tpm cmdlet. If disabled, enable in BIOS. For TPM 2.0, ensure UEFI B... | 🔵 6.5 | MS Learn |

## 快速排查路径
1. Remove the StorageCardDisabled value from HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\StorageSense\Parameters and reboot. If issue persists, collec `[来源: OneNote]`
2. Use PowerShell script to manually escrow recovery keys to AAD (e.g. Invoke-EscrowBitlockerToAAD from GitHub). Check FVE registry and GPSearch to confi `[来源: OneNote]`
3. For Windows 11 22H2+: Intune Key Rotation button removes old key within minutes. For Windows 10: old keys remain in AAD by design - inform customer th `[来源: OneNote]`
4. 1. Ensure the user logs out and logs back in (or restarts) after the FileVault profile is installed - macOS requires a logout to present the FileVault `[来源: OneNote]`
5. 1. 避免选择断电继续擦除选项；2. 对 BitLocker 加密设备同样适用；3. 已变砖的设备需使用可启动媒介重新安装 Windows `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/windows-bitlocker.md#排查流程)
