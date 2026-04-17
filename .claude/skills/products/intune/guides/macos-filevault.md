# INTUNE macOS FileVault 加密 — 排查速查

**来源数**: 2 | **21V**: 全部适用
**条目数**: 6 | **最后更新**: 2026-04-17

## 快速排查路径

1. **macOS FileVault profile is installed via Intune but FileVault is not enabled on the device. Kusto DeviceManagementProvider shows iOSPlugin: FileVault payload is installed but FileVault is not enabl...**
   → Ensure device meets prerequisites. Check Kusto DeviceManagementProvider with device ID and look for iOSPlugin messages. Verify FileVault profile is correctly targeted in device channel (not user ch... `[onenote, 🟢 9.5]`

2. **macOS FileVault is enabled by the user before Intune enrollment or before FileVault policy is deployed. Intune reports error: FileVault is enabled but not via a FileVault payload. Report an error a...**
   → 1. Deploy a FileVault policy to the device from Intune (it will not decrypt/re-encrypt, just enables Intune to assume management). 2. Direct the device user to upload their existing personal recove... `[onenote, 🟢 9.5]`

3. **macOS FileVault policy deployed via Intune shows FileVault payload is installed but FileVault is not enabled. Kusto logs show error code -2016341107 (FileVaultNotEnabled). CommandResult did not con...**
   → 1. Ensure the user logs out and logs back in (or restarts) after the FileVault profile is installed - macOS requires a logout to present the FileVault enablement dialog. 2. Verify prerequisites are... `[onenote, 🟢 9.5]`

4. **Endpoint Protection Device Configuration profile for macOS fails with&nbsp;Profile State Summary of Error without further details.**
   → To work around this issue, either set&nbsp;Number of times allowed to bypass&nbsp;to a value or set Disable prompt at sign out&nbsp;to Not configured. `[contentidea-kb, 🔵 7.5]`

5. **When deploying FileVault policy to macOS device, IT admins cannot see the recovery key in the Admin portal:**
   → To resolve this problem:Manually disable Filevault and restart the device to make the Intune deployed FileVault policy take effect.Manually upload the recovery key in the Company Portal website. `[contentidea-kb, 🔵 7.5]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | macOS FileVault profile is installed via Intune but FileVault is not enabled on the device. Kusto... | FileVault prerequisites are not met on the device, or the FileVault payload was deployed but the ... | Ensure device meets prerequisites. Check Kusto DeviceManagementProvider with device ID and look f... | 🟢 9.5 | onenote: MCVKB/Intune/Mac/MacOS FileVault trou... |
| 2 | macOS FileVault is enabled by the user before Intune enrollment or before FileVault policy is dep... | FileVault was already enabled by the end user (not via MDM payload). Intune cannot manage the rec... | 1. Deploy a FileVault policy to the device from Intune (it will not decrypt/re-encrypt, just enab... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 3 | macOS FileVault policy deployed via Intune shows FileVault payload is installed but FileVault is ... | The FileVault MDM profile was successfully installed on the device, but the actual FileVault disk... | 1. Ensure the user logs out and logs back in (or restarts) after the FileVault profile is install... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 4 | Endpoint Protection Device Configuration profile for macOS fails with&nbsp;Profile State Summary ... | This is a known issue and will occur if FileVault encryption for macOS is configured in the polic... | To work around this issue, either set&nbsp;Number of times allowed to bypass&nbsp;to a value or s... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4515836) |
| 5 | When deploying FileVault policy to macOS device, IT admins cannot see the recovery key in the Adm... | This is caused because the device has already enabled&nbsp;FileVault&nbsp;before enrolling to Int... | To resolve this problem:Manually disable Filevault and restart the device to make the Intune depl... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4614075) |
| 6 | Microsoft Defender for Endpoint on macOS offers protection against phishing and unsafe network co... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5032651) |
