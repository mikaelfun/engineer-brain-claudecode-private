---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Protection/Android"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Protection%2FAndroid"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# App protection policy for Android

App protection policies (Mobile Application Management) can apply to apps running on devices that may or may not be managed by Intune.

Policy settings are enforced only when using apps in the work context. When end users use the app to do a personal task, they aren't affected by these policies.

## Architecture

### Interaction with Android OS

The Intune App SDK requires changes to an app's source code to enable app management policies. This is done through the replacement of the android base classes with equivalent managed classes, referred to with the prefix MAM. The SDK classes live between the Android base class and the app's own derived version of that class.

### Interaction with the Company Portal

The Intune App SDK for Android relies on the presence of the Company Portal app on the device for enabling MAM policies. When the Company Portal app is not present, the behavior of the MAM enabled app will not be altered. When the Company Portal is installed and has policy for the user, the SDK entry points are initialized asynchronously.

## FAQ

1. **Why is the Company Portal app needed?** Much of app protection functionality is built into the Company Portal app. Device enrollment is not required even though the Company Portal app is always required. For MAM-WE, the end user just needs to have the Company Portal app installed.

2. **Multiple access settings order**: Block takes precedence, then dismissible warning. App version requirement > Android OS version > Android patch version.

3. **SafetyNet Attestation**: Google Play service determination reported at interval determined by Intune service. If no data, access allowed depending on other checks. **SafetyNet API is deprecated → replaced by Play Integrity API.**

4. **Verify Apps API**: User needs to go to Google Play Store > My apps & games > last app scan > Play Protect menu > toggle "Scan device for security threats" to on.

5. **SafetyNet check values**: 'Check basic integrity' - general device integrity (rooted/emulator/tampered fail). 'Check basic integrity & certified devices' - additionally requires Google certification.

6. **Manual device integrity check**: Sign-in Google account > Play Store > Settings > About > tap Play Store version 7x > Settings > General > Developer options > Play Integrity > Check integrity.

7. **SafetyNet vs jailbroken/rooted setting**: SafetyNet requires online. 'Jailbroken/rooted' works offline. Both recommended for layered approach.

8. **Dedicated devices**: APP not supported on Android Enterprise dedicated devices without Shared device mode. Supported with Shared device mode and AOSP userless devices with Shared device mode.

9. **Microsoft Teams Android devices**: Teams on Microsoft Teams Android devices does NOT support APP. Create exclusion group for Teams device users.

## Prerequisites

1. User must have a Microsoft Entra ID account
2. User must have an Intune license assigned
3. User must sign in with work account targeted by app protection policy
4. Company Portal app required for Android
5. Device must have access to Intune required endpoints
6. Targeted app must be integrated with Intune App SDK

## Scoping Questions

1. What is the UPN? Does it have an Intune license?
2. Affected OS platform? When did problem start? How many users/devices impacted?
3. Device state: Managed, Unmanaged (MAM-WE), or MAM-WE on third-party MDM?
4. All apps or specific app? Store app or LOB? SDK or Wrapper? SDK version?
5. Behavior or error message? Steps to reproduce?

## Troubleshooting Steps

- Review public troubleshooter: [Troubleshooting app protection policy deployment](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-app-protection-policy-deployment)
- Recommend device updates
- Try reproducing in test tenant
- Narrow down to specific models/devices
- Document UPN and email of affected users
- Collect OMADM and Company Portal logs via PowerLift
- Review Company Portal log for 'MAM Service sign in succeeded'
- Review App protection policy settings logs
- Review App Protection logs on device

## Known Issues

- KB 3153257: Phone number in meeting shows "no available apps"
- KB 4022831: App Protection can Save As PDF when policy is set to No
- KB 4490475: Android MAM policy not restricting data transfer to Google Maps
- ICM 56976609: Rooted Android devices can access MAM policy database files to bypass policy
- ICM 57208740: MAM WE Root detection can be bypassed on certain Android ROMs
