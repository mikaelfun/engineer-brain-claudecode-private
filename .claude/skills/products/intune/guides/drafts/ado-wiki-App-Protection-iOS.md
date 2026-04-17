---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Protection/iOS"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Protection%2FiOS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# App Protection Policy for iOS

App protection policies (Mobile Application Management) can apply to apps running on devices that may or may not be managed by Intune.

Policy settings are enforced only when using apps in the work context. When end users use the app to do a personal task, they aren't affected by these policies.

Note that when you create a new file it is considered a personal file.

## Architecture

[App Protection Policy Flow](https://internal.evergreen.microsoft.com/en-us/topic/7264e239-951f-8fbd-24e9-152cc696a486)

## App Experience on iOS

### Device fingerprint or face IDs
Intune app protection policies allow control over app access to only the Intune licensed user. One of the ways to control access to the app is to require either Apple's Touch ID or Face ID on supported devices. Intune implements a behavior where if there is any change to the device's biometric database, Intune prompts the user for a PIN when the next inactivity timeout value is met. Changes to biometric data include the addition or removal of a fingerprint, or face. If the Intune user does not have a PIN set, they are led to set up an Intune PIN.

### iOS Share Extension
You can use the iOS/iPadOS share extension to open work or school data in unmanaged apps, even with the data transfer policy set to managed apps only or no apps. Intune app protection policy cannot control the iOS/iPadOS share extension without managing the device. Therefore, Intune encrypts "corporate" data before it is shared outside the app.

### Universal Links Support
By default, Intune app protection policies will prevent access to unauthorized application content. Users can disable an app's Universal Links by visiting them in Safari and selecting Open in New Tab or Open. To re-enable, the end user would need to do an Open in <app name> in Safari after long pressing a corresponding link.

Internal article: https://microsoftapc.sharepoint.com/teams/IntuneMAMUniversalLinks2

### Multiple Access Settings Precedence
Intune app protection policies for access will be applied in a specific order: a wipe takes precedence, followed by a block, then a dismissible warning. Intune SDK version requirement takes precedence over app version requirement, followed by iOS/iPadOS operating system version requirement.

## Prerequisites
1. User must have a Microsoft Entra ID (Azure AD) account.
2. User must have an Intune license assigned.
3. User must sign in into the app with work account targeted by app protection policy.
4. Authenticator is required when there is app based conditional access policy.
5. Device should have access to Intune required endpoints. [(Network endpoints)](https://learn.microsoft.com/en-us/mem/intune/fundamentals/intune-endpoints)
6. Targeted app must be integrated with Intune App SDK. See [Intune App SDK for iOS](https://learn.microsoft.com/en-us/mem/intune/developer/app-sdk-ios-phase1)
7. For third-party EMM: configure user UPN settings:
    - key = IntuneMAMUPN, value = username@company.com
    - key = IntuneMAMOID, value = {{userid}}
    - **IntuneMAMOID** is only required for Intune.

## Scoping Questions

1. What is the UPN of the Azure AD account?
   - Does this UPN have an Intune license?
2. What is the affected OS platform (iOS 15.0+)?
   - Start date? Previous changes? Number of impacted users/devices?
3. Device state: Managed (enrolled with Intune), Unmanaged (MAM-WE), or MAM-WE on third-party MDM?
   - Collect device Serial Number or Intune deviceId
4. Is this impacting all apps or a specific app?
   - Store app or custom LOB using SDK?
   - LOB: SDK integration or Wrapper tool? SDK version?
   - If Outlook: Exchange Server type (O365 vs Exchange On-Prem Hybrid)?
5. What behavior or error message is reported?
   - Steps to reproduce? Expected behavior? Exact error message?

## Troubleshooting

### Collect Initial Data
1. UPN or Work/School account of affected user
2. Which policy setting isn't applied? Is any policy applied?
3. User experience - installed and started targeted app?
4. When did problem start? Has app protection ever worked?
5. Which platform (Android or iOS)?
6. How many users/devices affected?
7. Using Intune or third-party EMM?
8. All managed apps or only specific apps affected?
9. Collect App Protection logs
10. Verify prerequisites

### Log Collection
- MAM logs: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-app-protection-policy-deployment#step-6-collect-device-data-with-microsoft-edge
- Outlook Logs: https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/outlook-for-ios-and-android/outlook-for-ios-and-android-faq
- MAM diagnostic report on iOS: https://www.youtube.com/watch?v=VKCuroZUON8
- Company Portal logs: https://www.youtube.com/watch?v=_z3XszE1SP0
- Xcode logs: https://learn.microsoft.com/en-us/mem/intune/user-help/retrieve-ios-app-logs

### Key Troubleshooting Articles
- [Troubleshooting app protection policy deployment](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-app-protection-policy-deployment)
- [Troubleshooting user issues](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-mam)
- [Troubleshooting data transfer between apps](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-data-transfer)
- [Troubleshoot cut, copy, paste](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-cut-copy-paste)
- [Data transfer exemptions](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-data-transfer-exemptions)
- [Common data transfer scenarios](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/data-transfer-scenarios)
- [APP delivery timing](https://learn.microsoft.com/en-us/mem/intune/apps/app-protection-policy-delivery)
- [Review client app protection logs](https://learn.microsoft.com/en-us/mem/intune/apps/app-protection-policy-settings-log)

## Scenarios
- Set up and validate APP for managed iOS devices: https://support.microsoft.com/en-US/help/4482726
- Deploy APP based on device management state: https://internal.evergreen.microsoft.com/en-US/help/4461231
- Enable APP with Office mobile preview app: https://internal.evergreen.microsoft.com/en-US/help/4534332
- Adobe Acrobat for Intune setup: Intune Deployments - Acrobat Reader Mobile Enterprise Deployment
- Prevent saving from OneDrive to Dropbox/Google Drive/Box: https://internal.evergreen.microsoft.com/en-us/help/3157987
- Mobile Threat Defense for unenrolled devices: https://internal.evergreen.microsoft.com/en-us/help/4531379

## Known Issues
See extracted break/fix entries in known-issues-ado-wiki.jsonl (intune-ado-wiki-069 through intune-ado-wiki-078).
