# INTUNE macOS FileVault 加密 — 已知问题详情

**条目数**: 6 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: macOS FileVault profile is installed via Intune but FileVault is not enabled on the device. Kusto DeviceManagementProvider shows iOSPlugin: FileVau...
**Solution**: Ensure device meets prerequisites. Check Kusto DeviceManagementProvider with device ID and look for iOSPlugin messages. Verify FileVault profile is correctly targeted in device channel (not user channel). Properties like PersonalRecoveryKeyHelpMessage and PersonalRecoveryKeyRotationInMonths are only supported in device channel sessions.
`[Source: onenote, Score: 9.5]`

### Step 2: macOS FileVault is enabled by the user before Intune enrollment or before FileVault policy is deployed. Intune reports error: FileVault is enabled ...
**Solution**: 1. Deploy a FileVault policy to the device from Intune (it will not decrypt/re-encrypt, just enables Intune to assume management). 2. Direct the device user to upload their existing personal recovery key to Intune via Company Portal or the prompted workflow. 3. Once the key is validated, Intune assumes management and generates a new recovery key. 4. Communicate to users via IT channels since Intune does not auto-alert users to upload their key.
`[Source: onenote, Score: 9.5]`

### Step 3: macOS FileVault policy deployed via Intune shows FileVault payload is installed but FileVault is not enabled. Kusto logs show error code -201634110...
**Solution**: 1. Ensure the user logs out and logs back in (or restarts) after the FileVault profile is installed - macOS requires a logout to present the FileVault enablement dialog. 2. Verify prerequisites are met (device must have a SecureToken-enabled user). 3. Check Kusto with iOSPlugin filter for FileVault-related messages to confirm profile installation status. 4. If the user never sees the prompt, check if the profile is stuck - review Console logs for sysextd/mdmclient entries.
`[Source: onenote, Score: 9.5]`

### Step 4: Endpoint Protection Device Configuration profile for macOS fails with&nbsp;Profile State Summary of Error without further details.
**Solution**: To work around this issue, either set&nbsp;Number of times allowed to bypass&nbsp;to a value or set Disable prompt at sign out&nbsp;to Not configured.
`[Source: contentidea-kb, Score: 7.5]`

### Step 5: When deploying FileVault policy to macOS device, IT admins cannot see the recovery key in the Admin portal:
**Solution**: To resolve this problem:Manually disable Filevault and restart the device to make the Intune deployed FileVault policy take effect.Manually upload the recovery key in the Company Portal website.
`[Source: contentidea-kb, Score: 7.5]`

### Step 6: Microsoft Defender for Endpoint on macOS offers protection against phishing and unsafe network connections from websites, emails, and apps. This ar...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | macOS FileVault profile is installed via Intune but FileVault is not enabled ... | FileVault prerequisites are not met on the device, or the FileVault payload w... | Ensure device meets prerequisites. Check Kusto DeviceManagementProvider with ... | 9.5 | onenote |
| 2 | macOS FileVault is enabled by the user before Intune enrollment or before Fil... | FileVault was already enabled by the end user (not via MDM payload). Intune c... | 1. Deploy a FileVault policy to the device from Intune (it will not decrypt/r... | 9.5 | onenote |
| 3 | macOS FileVault policy deployed via Intune shows FileVault payload is install... | The FileVault MDM profile was successfully installed on the device, but the a... | 1. Ensure the user logs out and logs back in (or restarts) after the FileVaul... | 9.5 | onenote |
| 4 | Endpoint Protection Device Configuration profile for macOS fails with&nbsp;Pr... | This is a known issue and will occur if FileVault encryption for macOS is con... | To work around this issue, either set&nbsp;Number of times allowed to bypass&... | 7.5 | contentidea-kb |
| 5 | When deploying FileVault policy to macOS device, IT admins cannot see the rec... | This is caused because the device has already enabled&nbsp;FileVault&nbsp;bef... | To resolve this problem:Manually disable Filevault and restart the device to ... | 7.5 | contentidea-kb |
| 6 | Microsoft Defender for Endpoint on macOS offers protection against phishing a... |  |  | 7.5 | contentidea-kb |
