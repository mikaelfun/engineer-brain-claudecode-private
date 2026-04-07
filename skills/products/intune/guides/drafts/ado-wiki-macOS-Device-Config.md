---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Features Restrictions and Custom/macOS"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FmacOS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# macOS Device Configuration

## Overview

Device Configuration for macOS is enabling or disabling settings and features on macOS devices being used for work.

### Configuration Methods
1. **Settings catalog** — first-party (MAU/Defender/Edge/Office) + Apple Profile-Specific Payload Keys
2. **Templates** — Custom, Device features, Device restrictions, Endpoint protection, Extensions, Preference file
3. **Custom profiles** — .xml or .mobileconfig files created via Apple Configurator 2

### Custom Profile Workflow
1. Download Apple Configurator 2
2. Create profile, select payload (verify macOS compatibility via Apple Configuration Profile Reference)
3. Export .mobileconfig file
4. Test locally on target Mac first
5. Upload to Intune: Devices > macOS > Configuration profiles > Create > Templates > Custom
6. Assign to groups

## Known Issues

**Scenario 1**: Custom profile (DLP/TCC) assigned to user group fails:
- Error: `NSPOSIXErrorDomain Code=1 "Operation not permitted" — The profile must be a system profile. User profiles are not supported.`
- **Fix**: Assign to device group instead of user group

**Scenario 2**: Script upload shows garbled Unicode characters:
- Cause: File saved with Unicode/UTF-16 encoding
- **Fix**: Re-save with ANSI encoding in Notepad

## Scoping Questions
1. Did this policy ever work or show as succeeded?
2. Are all targeted users/devices impacted, or only a few?
3. What is the policy's goal?
4. If deployed through Apple Configurator directly, does it work?
5. User/device info: UPN, User ID, Intune Device ID, Azure Device/Object ID, Serial Number, OS Version, Model, Enrollment Type
6. Is user licensed for Intune?
7. BYOD or Corporate? Supervised?
8. Policy name and ID?
9. Assigned to user or device group? Exclude assignments?
10. Does device show restriction in Remote Management Profile?
11. Collect device logs while forcing sync

## Support Boundaries
- Intune delivers config to device; if device fails to apply → OS/Apple issue
- Custom XML creation is customer's responsibility
- Many macOS settings require supervised device (ADE or Apple Configurator)

## Troubleshooting Steps
1. Collect: UPN, User ID, Intune Device ID, Azure Device/Object IDs, Serial, OS Version, Enrollment Type, Policy Name/ID
2. Validate enrollment type via Assist365 or Kusto
3. Check if device is supervised (required for many restrictions):
   ```kusto
   DeviceManagementProvider
   | where ActivityId == "IntuneDeviceID"
   | where message contains "supervised" or message contains "Enrollmenttype"
   | where env_time between (datetime(YYYY-MM-DD 00:00)..datetime(YYYY-MM-DD 23:59))
   | project env_time, message
   ```
4. Confirm profile visible in System Settings > Privacy & Security > Profiles
5. Validate policy targeting and compliance via Kusto:
   ```kusto
   DeviceManagementProvider
   | where deviceId == "IntuneDeviceID"
   | where TaskName == "DeviceManagementProviderCIReportDataEvent"
   | where applicablilityState == "Applicable"
   | project env_time, name, reportComplianceState, typeAndCategory, EventMessage, deviceId
   ```
   Or new query:
   ```kusto
   HighLevelCheckin(deviceIdentifier="IntuneDeviceID", startTime=datetime(...), endTime=datetime(...))
   | where PolicyApplicability == "Applicable"
   | project env_time, PolicyName, PolicyId, PolicyCompliance, PolicyType, EventMessage, PolicyVer
   ```
6. If policy missing → validate group assignments (include/exclude)
7. For Error policies, check individual settings:
   ```kusto
   IntuneEvent
   | where ActivityId == "IntuneDeviceId"
   | where ApplicationName startswith "DeviceCheckin_"
   | project env_time, Col1
   ```

### Custom Profile Troubleshooting
1. Analyze the .xml/.mobileconfig file
2. Test locally on Mac device first
3. Collect ODC logs: `curl -L https://aka.ms/IntuneMacODC -o IntuneMacODC.sh && sudo ./IntuneMacODC.sh`

## Log Files Reference

| File | Purpose |
|------|---------|
| syslog_Intune.log | Equivalent to Console Logs (most important) |
| IntuneProfiles.txt | Profiles delivered with Intune profile ID |
| Profiles_list.xml | Profiles delivered with content |
| QueryDeviceInformation.txt | Activation lock, CPU, supervision, SW Update |
| mdatp_health.txt | Defender policies via MDM |
| QuerySecurityInfo.txt | Security policies via MDM (Firewall) |
| pkgutil_pkgs.txt / pkgutil_info.txt | MDM deployed apps |
| SSOExtension logs | macOS SSO extension / Platform SSO |

## FAQ
- **Check-in frequency**: Every 15 min for 1 hour after enrollment, then every 8 hours
- **Custom policy conflicts**: Apple applies conflicting settings randomly; Intune only delivers
- **BYOD showing supervised**: macOS 11+ user-approved devices automatically supervised by Intune
- **Variables in .mobileconfig**: Use `{{serialnumber}}`, `{{deviceid}}` — case sensitive
