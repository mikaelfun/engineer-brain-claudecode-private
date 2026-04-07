---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Microsoft Entra Registered/Shared Device Mode for Android and iOS Devices"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Window%20Devices/Microsoft%20Entra%20Registered/Shared%20Device%20Mode%20for%20Android%20and%20iOS%20Devices"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Shared Device Mode for Android and iOS Devices

## Feature Overview

Frontline workers (retail associates, flight crew, field service workers) use shared mobile devices. Shared Device Mode (SDM) allows admins to configure an Android or iOS device so multiple employees can share it. Employees sign in, access data, sign out — ready for next user.

SDM provides Microsoft identity backed management. Requires:
- Developers write single-account apps with `"shared_device_mode_supported": true` in app config
- Device admins put device into shared mode via Microsoft Authenticator app (requires **Cloud Device Administrator** role)

## Enlightened Applications (Android)

| App | Support Queue | SAP |
|-----|-----|-----|
| Microsoft Teams | Teams Clients | Teams\Teams\Teams Clients\Mobile |
| Managed Home Screen | Microsoft Intune | Azure\Microsoft Intune\App Configprofiles - Android\ManagedApps |
| Outlook Mobile | Outlook mobile | Office Products/Outlook/Outlook for Microsoft 365 for mobile |
| Microsoft Edge | Edge for Android | Browser\Microsoft Edge\Edge for Android\Security and Privacy\Authentication |
| Power Apps | Power Apps | Dynamics\Power Apps\Sign-in Issues |
| Yammer | Yammer | Office Products\Yammer\Apps and Integrations\Android |
| Intune Company Portal | Microsoft Intune | Azure\Microsoft Intune\App Configprofiles - Android\ManagedApps |

> **iOS**: Currently no apps support SDM besides Microsoft Authenticator. Customers can create their own SDM apps.

## Limitations

- Conditional Access is **not supported** with manually enabled Shared Device Mode.
- Only works on Corporate-owned dedicated devices (manually enabled or via Intune).

## Case Routing

| Scenario | Queue | SAP |
|-----|-----|-----|
| Manually Enabled SDM | Azure AD Device Registration | Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Access Issues |
| Enable SDM via Intune | Microsoft Intune | Azure\Microsoft Intune\App Configprofiles - Android\ManagedApps |
| 3rd Party app fails (others work) | 3rd Party Vendor | Contact vendor |
| Specific Microsoft app fails (others work) | App-specific queue | See table above |

## Troubleshooting

1. Collect Authenticator app logs: user submits via **Submit Feedback / Incident ID** in Authenticator. Engineer accesses logs in **ASC > Sign-Ins > Authenticator App Logs** using the Incident ID (or via Powerlift).

2. Reproduce with video/screenshot to identify which step fails.

3. Key log checks from CloudExtension/Intune logs:
   - **AadSharedDeviceRegistrationToken** — if always empty `{"value":"","iv":"","key":""}` → Intune service or Google issue
   - Search for **WpjLogger** → `RemediateWpjStateHandler Starting WPJ workflow`
   - Search **WorkplaceJoinApiResult** for join result

4. If one SDM app fails but others work → isolate to that app's team

### Data to Collect

- MDM solution in use
- IDP being used
- Launcher (if applicable)
- Client OS version
- Mobile Logs (Authenticator Incident ID)
- Screenshots/screen recording of issue

## ICM Escalation

- **Owning Service**: Cloud Identity AuthN Client
- **Owning Team**: Cloud Identity AuthN MSAL Android
- **Template**: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=4432r2

## References

- SDM for Android: https://docs.microsoft.com/en-us/azure/active-directory/develop/shared-device-mode
- Tutorial (Android): https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-shared-device-mode
- SDM for iOS: https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-ios-shared-devices
- Intune Android kiosk: https://learn.microsoft.com/en-us/mem/intune/enrollment/android-kiosk-enroll
