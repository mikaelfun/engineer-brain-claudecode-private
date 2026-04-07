# AVD W365 Link 设备 - windows-365-link - Issue Details

**Entries**: 11 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. Windows 365 Link device displays time zone as PST by default out of the box regardless of actual loc...
- **ID**: `avd-ado-wiki-120`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: NXT devices default to PST time zone due to privacy restrictions - the OS determines time zone based on BIOS time which defaults to PST
- **Solution**: Create Intune configuration policy: Devices > Configuration > New Policy > Windows 10 and later > Settings catalog. Search for Privacy, set Let Apps Access Location to Force Allow. Assign to Windows 365 Link devices using a device filter. Device will update timezone after receiving the policy.
- **Tags**: windows-365-link, timezone, intune, privacy-policy, location

### 2. After installing Windows 365 Link CPC security update (Oct 14, 2025 KB5066835), USB devices (keyboar...
- **ID**: `avd-ado-wiki-128`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: NXT OS security update KB5066835 (released Oct 14, 2025) broke USB device support in WinRE environment while devices continue to work normally in the Windows operating system
- **Solution**: Use Intune remote wipe instead of local WinRE recovery. If device is already stuck in WinRE, escalate for replacement device via PCA Commercial queue. Fix delivered in November 11, 2025 KB update from NXT OS team.
- **Tags**: windows-365-link, winre, usb, keyboard, mouse, recovery, KB5066835

### 3. Windows 365 Link shows error Something went wrong - An authentication issue occurred where an intera...
- **ID**: `avd-ado-wiki-132`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Authentication flow fails to display interactive window on Windows 365 Link device
- **Solution**: Follow documented troubleshooting at https://learn.microsoft.com/en-us/troubleshoot/windows-365/connection-error-interactive-window-not-shown
- **Tags**: windows-365-link, authentication, connection-error

### 4. Windows 365 Link keyboard language reverts back to English after device goes to sleep
- **ID**: `avd-ado-wiki-133`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Known bug in Windows 365 Link firmware prior to 4B update causing keyboard language reset on wake
- **Solution**: Workaround: Go to Quick Settings > About this device > Check for updates. Install and restart to apply 4B update which contains the fix
- **Tags**: windows-365-link, keyboard, language, sleep

### 5. Windows 365 Link OS update fails with error 0x80073712 and CbsPackageServicingFailure2 in Applicatio...
- **ID**: `avd-ado-wiki-134`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Wrong Language Pack loaded on Windows 365 Link device causes update package staging failure
- **Solution**: Perform a remote wipe of the Windows 365 Link device via Microsoft Admin Center using Intune Wipe method. Important: Save BitLocker recovery key before reset
- **Tags**: windows-365-link, os-update, language-pack, 0x80073712

### 6. Windows 365 Link preview device fails to reset/wipe and becomes unusable (versions older than 2B 261...
- **ID**: `avd-ado-wiki-135`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Known bug in Windows Recovery on preview image versions prior to 2B 26100.3194
- **Solution**: Do NOT reset/wipe devices on versions older than 2B 26100.3194. Update to 2B or later first. If already bricked, return device for replacement
- **Tags**: windows-365-link, preview, reset, wipe, recovery

### 7. Windows 365 Link preview device not automatically checking for updates overnight
- **ID**: `avd-ado-wiki-136`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Known bug in preview image prior to 2B 26100.3194 that was not waking the device to check for updates
- **Solution**: Configure Intune Settings Catalog Policy with aggressive update check settings: Configure Deadline For Feature Updates=0, Configure Deadline Grace Period=1, Configure Deadline Grace Period For Feature Updates=1, Quality Update Deadline Period=0. Use Intune Filter for OS SKU WCPC. Fixed in 2B 26100.3194
- **Tags**: windows-365-link, preview, updates, intune-policy

### 8. Windows 365 Link shows Securing your remote connection for ~2 minutes then returns to sign-in screen...
- **ID**: `avd-ado-wiki-137`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Known bug in preview image prior to 1B 26100.2894 preventing Legal Notice display on Windows 365 Link connection
- **Solution**: Remove Legal Notice/Login Message from Cloud PC as workaround. Fixed in 1B 26100.2894 or later
- **Tags**: windows-365-link, preview, legal-notice, connection

### 9. Windows 365 Link shows Your clock is behind error, Advanced button does not work, and Update date an...
- **ID**: `avd-ado-wiki-138`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Device screen timeout causes clock sync issue; manual time update not supported on Windows 365 Link
- **Solution**: Configure Intune Settings Catalog policy: Search for video and display settings, set Turn off the display (plugged in) value in seconds. Assign to Windows 365 Link devices using device filter
- **Tags**: windows-365-link, clock, time, intune-policy, screen-timeout

### 10. Windows 365 Link device fails to join Entra ID during OOBE setup
- **ID**: `avd-ado-wiki-216`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Users do not have permission to join devices to Entra ID. W365 Link devices are Entra ID Joined only.
- **Solution**: In Entra ID > Devices > Device Settings, ensure target users (or All Users) have permission to join devices. See: https://learn.microsoft.com/en-us/entra/identity/devices/manage-device-identities#configure-device-settings
- **Tags**: windows-365-link, entra-id, device-join, oobe

### 11. Windows 365 Link device not enrolling in Intune management after Entra ID join
- **ID**: `avd-ado-wiki-217`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Automatic MDM enrollment is not enabled in Entra ID for the target users.
- **Solution**: Enable automatic enrollment in Intune: Entra ID > Mobility (MDM and MAM) > Microsoft Intune > set MDM user scope to All or a selected group. See: https://learn.microsoft.com/en-us/mem/intune/enrollment/quickstart-setup-auto-enrollment
- **Tags**: windows-365-link, intune, mdm, auto-enrollment
