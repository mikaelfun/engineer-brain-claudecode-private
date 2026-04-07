# AVD W365 Link 设备 - windows-365-link - Quick Reference

**Entries**: 11 | **21V**: all applicable
**Keywords**: 0x80073712, authentication, auto-enrollment, clock, connection, connection-error, device-join, entra-id
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Windows 365 Link device displays time zone as PST by default out of the box rega... | NXT devices default to PST time zone due to privacy restrictions - the OS determ... | Create Intune configuration policy: Devices > Configuration > New Policy > Windo... | 🔵 7.5 | ADO Wiki |
| 2 | After installing Windows 365 Link CPC security update (Oct 14, 2025 KB5066835), ... | NXT OS security update KB5066835 (released Oct 14, 2025) broke USB device suppor... | Use Intune remote wipe instead of local WinRE recovery. If device is already stu... | 🔵 7.5 | ADO Wiki |
| 3 | Windows 365 Link shows error Something went wrong - An authentication issue occu... | Authentication flow fails to display interactive window on Windows 365 Link devi... | Follow documented troubleshooting at https://learn.microsoft.com/en-us/troublesh... | 🔵 7.5 | ADO Wiki |
| 4 | Windows 365 Link keyboard language reverts back to English after device goes to ... | Known bug in Windows 365 Link firmware prior to 4B update causing keyboard langu... | Workaround: Go to Quick Settings > About this device > Check for updates. Instal... | 🔵 7.5 | ADO Wiki |
| 5 | Windows 365 Link OS update fails with error 0x80073712 and CbsPackageServicingFa... | Wrong Language Pack loaded on Windows 365 Link device causes update package stag... | Perform a remote wipe of the Windows 365 Link device via Microsoft Admin Center ... | 🔵 7.5 | ADO Wiki |
| 6 | Windows 365 Link preview device fails to reset/wipe and becomes unusable (versio... | Known bug in Windows Recovery on preview image versions prior to 2B 26100.3194 | Do NOT reset/wipe devices on versions older than 2B 26100.3194. Update to 2B or ... | 🔵 7.5 | ADO Wiki |
| 7 | Windows 365 Link preview device not automatically checking for updates overnight | Known bug in preview image prior to 2B 26100.3194 that was not waking the device... | Configure Intune Settings Catalog Policy with aggressive update check settings: ... | 🔵 7.5 | ADO Wiki |
| 8 | Windows 365 Link shows Securing your remote connection for ~2 minutes then retur... | Known bug in preview image prior to 1B 26100.2894 preventing Legal Notice displa... | Remove Legal Notice/Login Message from Cloud PC as workaround. Fixed in 1B 26100... | 🔵 7.5 | ADO Wiki |
| 9 | Windows 365 Link shows Your clock is behind error, Advanced button does not work... | Device screen timeout causes clock sync issue; manual time update not supported ... | Configure Intune Settings Catalog policy: Search for video and display settings,... | 🔵 7.5 | ADO Wiki |
| 10 | Windows 365 Link device fails to join Entra ID during OOBE setup | Users do not have permission to join devices to Entra ID. W365 Link devices are ... | In Entra ID > Devices > Device Settings, ensure target users (or All Users) have... | 🔵 7.5 | ADO Wiki |
| 11 | Windows 365 Link device not enrolling in Intune management after Entra ID join | Automatic MDM enrollment is not enabled in Entra ID for the target users. | Enable automatic enrollment in Intune: Entra ID > Mobility (MDM and MAM) > Micro... | 🔵 7.5 | ADO Wiki |

## Quick Triage Path

1. Check: NXT devices default to PST time zone due to privac `[Source: ADO Wiki]`
2. Check: NXT OS security update KB5066835 (released Oct 14, `[Source: ADO Wiki]`
3. Check: Authentication flow fails to display interactive w `[Source: ADO Wiki]`
4. Check: Known bug in Windows 365 Link firmware prior to 4B `[Source: ADO Wiki]`
5. Check: Wrong Language Pack loaded on Windows 365 Link dev `[Source: ADO Wiki]`
