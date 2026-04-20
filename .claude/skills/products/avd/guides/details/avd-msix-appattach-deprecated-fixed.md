# AVD AVD MSIX App Attach - deprecated-fixed - Comprehensive Troubleshooting Guide

**Entries**: 5 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| MSIX App Attach: after user logs off a Full Desktop session while also... | Logging off the Full Desktop session triggers a deregistration of MSIX... | Log off all user sessions from the AVD portal after logging off the Fu... |
| x64 MSIX App Attach packages expanded to CIM image fail to open from s... | CIMFs driver bug affecting x64 MSIX packages when using CIM image form... | Deploy MSIX packages as VHD(x) image instead of CIM format. Issue was ... |
| Session host crashes with BSOD when mounting certain MSIX App Attach p... | Bug in CIMFs driver causing crash during MSIX CIM image mounting | Issue was fixed by CIMfs team and backported. Update session host OS t... |
| MSIX App Attach packages with multiple entry points launch the wrong e... | UI publishing flow bug where all entry points in a multi-entry-point M... | Issue was fixed in AVD service update (circa June 2021). Upgrade to la... |
| MSIX App Attach packages intermittently fail to register when user has... | Registration race condition when multiple MSIX packages across differe... | Issue was fixed in AVD service update (completed 2021). Ensure session... |

### Phase 2: Detailed Investigation

#### Entry 1: MSIX App Attach: after user logs off a Full Desktop session ...
> Source: ADO Wiki | ID: avd-ado-wiki-155 | Score: 7.0

**Symptom**: MSIX App Attach: after user logs off a Full Desktop session while also having a Remote App session, attempting to relaunch the Remote App causes File Explorer to open instead of the expected application

**Root Cause**: Logging off the Full Desktop session triggers a deregistration of MSIX packages, which breaks the Remote App session registration for the same user

**Solution**: Log off all user sessions from the AVD portal after logging off the Full Desktop, then relaunch the Remote App

> 21V Mooncake: Applicable

#### Entry 2: x64 MSIX App Attach packages expanded to CIM image fail to o...
> Source: ADO Wiki | ID: avd-ado-wiki-157 | Score: 7.0

**Symptom**: x64 MSIX App Attach packages expanded to CIM image fail to open from start menu with error INVALID_PARAMETER 0xc000000d; x86 versions and VHD(x) images are not affected

**Root Cause**: CIMFs driver bug affecting x64 MSIX packages when using CIM image format for App Attach

**Solution**: Deploy MSIX packages as VHD(x) image instead of CIM format. Issue was fixed in Windows updates circa August 2022

> 21V Mooncake: Applicable

#### Entry 3: Session host crashes with BSOD when mounting certain MSIX Ap...
> Source: ADO Wiki | ID: avd-ado-wiki-160 | Score: 7.0

**Symptom**: Session host crashes with BSOD when mounting certain MSIX App Attach packages in CIM format via CIMFs driver

**Root Cause**: Bug in CIMFs driver causing crash during MSIX CIM image mounting

**Solution**: Issue was fixed by CIMfs team and backported. Update session host OS to latest patches (circa 2021)

> 21V Mooncake: Applicable

#### Entry 4: MSIX App Attach packages with multiple entry points launch t...
> Source: ADO Wiki | ID: avd-ado-wiki-158 | Score: 7.0

**Symptom**: MSIX App Attach packages with multiple entry points launch the wrong executable - all applications from the package launch the last exe defined in AppxManifest regardless of which app icon was clicked

**Root Cause**: UI publishing flow bug where all entry points in a multi-entry-point MSIX package incorrectly reference the last executable file defined in the AppxManifest, despite showing correct names and icons

**Solution**: Issue was fixed in AVD service update (circa June 2021). Upgrade to latest AVD agent version

> 21V Mooncake: Applicable

#### Entry 5: MSIX App Attach packages intermittently fail to register whe...
> Source: ADO Wiki | ID: avd-ado-wiki-161 | Score: 7.0

**Symptom**: MSIX App Attach packages intermittently fail to register when user has multiple applications assigned across separate application groups, with Register operation errors logged in event viewer

**Root Cause**: Registration race condition when multiple MSIX packages across different application groups are staged simultaneously during user logon

**Solution**: Issue was fixed in AVD service update (completed 2021). Ensure session hosts are running latest AVD agent version

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
