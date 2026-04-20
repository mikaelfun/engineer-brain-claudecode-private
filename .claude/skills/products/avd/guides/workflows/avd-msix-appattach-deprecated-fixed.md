# AVD MSIX App Attach - deprecated-fixed — Troubleshooting Workflow

**Scenario Count**: 5
**Generated**: 2026-04-18

---

## Scenario 1: MSIX App Attach: after user logs off a Full Desktop session ...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Log off all user sessions from the AVD portal after logging off the Full Desktop, then relaunch the Remote App

**Root Cause**: Logging off the Full Desktop session triggers a deregistration of MSIX packages, which breaks the Remote App session registration for the same user

## Scenario 2: x64 MSIX App Attach packages expanded to CIM image fail to o...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Deploy MSIX packages as VHD(x) image instead of CIM format. Issue was fixed in Windows updates circa August 2022

**Root Cause**: CIMFs driver bug affecting x64 MSIX packages when using CIM image format for App Attach

## Scenario 3: Session host crashes with BSOD when mounting certain MSIX Ap...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Issue was fixed by CIMfs team and backported. Update session host OS to latest patches (circa 2021)

**Root Cause**: Bug in CIMFs driver causing crash during MSIX CIM image mounting

## Scenario 4: MSIX App Attach packages with multiple entry points launch t...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Issue was fixed in AVD service update (circa June 2021). Upgrade to latest AVD agent version

**Root Cause**: UI publishing flow bug where all entry points in a multi-entry-point MSIX package incorrectly reference the last executable file defined in the AppxManifest, despite showing correct names and icons

## Scenario 5: MSIX App Attach packages intermittently fail to register whe...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Issue was fixed in AVD service update (completed 2021). Ensure session hosts are running latest AVD agent version

**Root Cause**: Registration race condition when multiple MSIX packages across different application groups are staged simultaneously during user logon
