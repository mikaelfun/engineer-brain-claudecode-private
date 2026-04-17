# AVD AVD MSIX App Attach - deprecated-fixed - Issue Details

**Entries**: 3 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. MSIX App Attach: after user logs off a Full Desktop session while also having a Remote App session, ...
- **ID**: `avd-ado-wiki-155`
- **Source**: ADO Wiki | **Score**: 🔵 7.0
- **Root Cause**: Logging off the Full Desktop session triggers a deregistration of MSIX packages, which breaks the Remote App session registration for the same user
- **Solution**: Log off all user sessions from the AVD portal after logging off the Full Desktop, then relaunch the Remote App
- **Tags**: msix-app-attach, remote-app, deregistration, multi-session, deprecated-fixed

### 2. x64 MSIX App Attach packages expanded to CIM image fail to open from start menu with error INVALID_P...
- **ID**: `avd-ado-wiki-157`
- **Source**: ADO Wiki | **Score**: 🔵 7.0
- **Root Cause**: CIMFs driver bug affecting x64 MSIX packages when using CIM image format for App Attach
- **Solution**: Deploy MSIX packages as VHD(x) image instead of CIM format. Issue was fixed in Windows updates circa August 2022
- **Tags**: msix-app-attach, cimfs, x64, vhdx, image-format, deprecated-fixed

### 3. Session host crashes with BSOD when mounting certain MSIX App Attach packages in CIM format via CIMF...
- **ID**: `avd-ado-wiki-160`
- **Source**: ADO Wiki | **Score**: 🔵 7.0
- **Root Cause**: Bug in CIMFs driver causing crash during MSIX CIM image mounting
- **Solution**: Issue was fixed by CIMfs team and backported. Update session host OS to latest patches (circa 2021)
- **Tags**: msix-app-attach, cimfs, bsod, crash, deprecated-fixed
