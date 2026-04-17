---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Autopilot/Autopilot v2 Device Preparation (AP-DP)"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAutopilot%2FAutopilot%20v2%20Device%20Preparation%20(AP-DP)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Autopilot v2 Device Preparation (AP-DP) Troubleshooting Guide

## About Autopilot Device Preparation
Autopilot device preparation is a new profile that allows admins to deploy Windows 11 devices with a simpler and more consistent user experience, especially for government customers. It also provides near real-time reporting and troubleshooting information in Intune.
- It does not require device registration or enrollment status page.
- It supports user-driven deployment for Microsoft Azure AD joined devices only.
- It limits the number of apps and scripts that can be delivered during OOBE to 10 each.
- It uses a device security group to determine the configuration that gets applied to the device.

## How Autopilot Device Prep Works

**Configuration**
1. Create the Autopilot device preparation policy/profile:
    - Create a device security group with the Intune Provisioning Client configured as the group owner.
    - Configure the Deployment Settings, such as mode, type, etc.
    - Configure OOBE settings, such as minutes before showing install error, custom error messages, etc.
    - Select the managed apps to include (up to 10 max). These are delivered during OOBE. App types supported are LOB, Win32, Store/WinGet.
    - Select the scripts you want to include. PowerShell only and a max of 10.
    - Specify Scope tags (optional)
    - Specify the user group assigned/targeted.
2. Assign your apps to the security group.

**User Experience**
1. A user from the assigned user group logs in with their credentials.
2. Apps and scripts defined in the profile are delivered to the device.
3. The device is added as a member of the device security group specified in the AP-DP profile.
4. User gets to desktop and other associated apps or settings are applied.

## Prerequisites
- Windows 11 version 23H2 with KB5035942 or later, or Windows 11 version 22H2 with KB5035942 or later.
- Microsoft Entra ID. Only Microsoft Entra join is supported.
- Targeted devices must **not** be registered or added as a Windows Autopilot device. If a device is registered, the Windows Autopilot profile takes precedence.
- Have device security group with Intune Provisioning Client configured as group owner
- RBAC permissions:
  - Device configuration permissions for configuring/managing policies
  - Enrollment programs > Enrollment time device membership assignment
  - Organization > Read for accessing reports

## Not Supported
- Enrollment status page
- Registration (will be replaced with device association)
- Apps that require Managed installer policy (coming later, supported since 2603)
- Dynamic grouping during OOBE provisioning
- Custom compliance scripts during OOBE provisioning (coming later)

## Autopilot vs Autopilot Device Prep Comparison

|  |Autopilot|Autopilot device prep|
|--|--|--|
|Supported modes|Multiple scenarios|User-driven only|
|Join type|Entra joined or Hybrid|Entra joined only|
|Registration required|Yes|None|
|Apps during OOBE|Any number|Up to 10 selected (LOB, Win32, WinGet) + 10 PS scripts|
|Reporting|Not real-time, AP registered only|Near real-time, more data, more accurate|

## Best Practices
- Have device security group with Intune Provisioning Client configured as group owner
- Policy and apps assigned to the device security group
- 1 device security group needs to be added to the Device preparation policy
- Dynamic and nested groups not supported

## Troubleshooting Steps

1. Ensure prerequisites are met (Windows 11 version, enrollment type, device security group, RBAC permissions)
2. Review the device preparation profile settings (apps/scripts selection, timeout value, custom error message)
3. Monitor device provisioning status in the new deployment report (near real-time)
4. Collect diagnostics logs from the device or remotely from Intune

### Kusto Diagnostic Queries

**Check AP-DP Eligibility:**
```kql
let deviceId = "<IntuneDeviceId>";
let lookback = ago(7d);
CheckAutopilotV2EligibilityForDevice(lookback, deviceId)
```
Eligibility criteria:
1. OS version supports AutopilotV2
2. Device is not pre-registered with Autopilot service (no ZTD ID)
3. Entra ID joined enrollment type
4. User-based enrollment
5. Device is enrolling during OOBE
6. Device preparation profile is properly configured with a device group

**Check Which Profile Was Applied:**
```kql
let deviceId = "<IntuneDeviceId>";
let lookback = ago(7d);
GetDevicePrepProfileAppliedToDevice(lookback, deviceId)
```

**Check Profile Assignments for Effective Group (run from Assist 365 Kusto Explorer):**
```kql
let currentTenantId = '<AccountId>';
let effectiveGroupId = "<EGM ID from above query>";
let GetDevicePrepProfileAssignmentsForEG = (effectiveGroupId: string) {
    cluster('qrybkradxus01pe.westus2.kusto.windows.net').database('qrybkradxglobaldb').SortedECStore_Snapshot
    | where EffectiveGroupId == effectiveGroupId
    | union cluster('qrybkradxeu01pe.northeurope.kusto.windows.net').database('qrybkradxglobaldb').SortedECStore_Snapshot
    | where EffectiveGroupId == effectiveGroupId
    | where PolicyType == 36
    | where AccountId == currentTenantId
    | project ScaleUnitName, AccountId, SortedPolicyConfigurations
};
GetDevicePrepProfileAssignmentsForEG(effectiveGroupId)
```

## Scoping Questions
- Is this a new Autopilot deployment?
- What type of Autopilot deployment is being used?
- Is there an error message generated? If yes, exact text and when it appears?
- Is this happening on a physical device or a virtual machine?
- What is the UPN of the affected user?
- What device, model, OS Version, serial number is impacted?
- Was the deployment working before? If so, when did the problem start and what changed?
- What is the name of the affected Autopilot deployment profile and targeted group?

**NOTE**: Every time a device needs to be re-enrolled with Autopilot it must be reset using Intune Wipe (not VM revert).

## Support Boundaries
- AAD Device objects/dynamic groups issues → consult AAD Account management team
- Generic OOBE/setup issues before Tenant login → consult Windows Devices and Deployment (D&D) team
- Authentication issues during enrollment → consult AAD Authentication team

## Known Issues
1. **Device stuck at 100% during OOBE** — Manual restart needed. Fix in progress.
2. **AppID f1346770 displays as "Intune Autopilot ConfidentialClient"** — Cosmetic only, same AppID is correct.
3. **User reaches desktop without apps** — Conflict between AP-DP User account type (Standard user) and Entra ID Local admin settings (Selected/None). Workaround: set AP-DP to Administrator or set Entra ID to All.
4. **Managed installer conflict** — Prior to 2603 service release, managed installer policy conflicted with app installs during AP-DP. Fixed in 2603+.
5. **Dependency/supersedence shown as "Dependent"** — Known reporting display issue.
6. **App uninstall intent shows "Installed"** — Known reporting display issue when uninstall completes successfully.

## Engineering TSG Reference
- https://eng.ms/docs/microsoft-security/management/intune/microsoft-intune/intune/services/autopilot/scenarios/apv2
- Access: https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1525635/Access-to-Engineering-Wiki
