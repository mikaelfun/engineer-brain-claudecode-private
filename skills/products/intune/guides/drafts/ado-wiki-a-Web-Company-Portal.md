---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/AdminUI/Web Company Portal"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAdminUI%2FWeb%20Company%20Portal"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# About the Company Portal Website

The Company Portal website (https://portal.manage.microsoft.com) is a web-based self-service portal for end users managed by Microsoft Intune. It allows users to remotely manage their work apps and enrolled personal devices from any device with a web browser - the device does not need to be enrolled.

> **NOTE**: The Company Portal website is **not** the Intune Admin Center (`intune.microsoft.com`). The Company Portal website is the end-user-facing portal; the Intune Admin Center is the IT admin console.

The Company Portal website is also used as part of the Company Portal app experience on iOS/iPadOS.

## Available End-User Actions

Once signed in, users can perform the following actions:

1. Check status - Initiate a status check to verify or regain access to organizational resources.
2. View and manage work apps - Search, filter, and install available work apps.
3. Store recovery key (macOS) - Store and rotate the FileVault key for an encrypted Mac.
4. Get recovery key (macOS) - Retrieve the stored FileVault key.
5. Get recovery key (Windows) - Retrieve the stored BitLocker key.
6. Remotely lock a device - Lock a lost or stolen device.
7. Rename a device - Change the display name shown in Company Portal.
8. Remove a device - Remove and unenroll a personal device.
9. Reset a device password - Reset a forgotten password or passcode.
10. Reset device to factory settings - Restore a device to out-of-box state.

> **WARNING**: Not all actions are available on every operating system and device type. For example, passcode reset does not work on personal Android devices with a work profile running Android 8.0+.

## Device Compliance Status

End users can view the compliance status of their devices on the **Devices** page:

| Status | Meaning |
|--------|---------|
| Can access company resources | Device is compliant |
| Checking access | Compliance is being evaluated |
| Can't access company resources | Device is non-compliant; user must take action |

## Configuring the Company Portal Website

No separate configuration required - available by default. Admins customize branding and behavior from:
**Tenant Administration** > **Customization** in the Intune admin center.

Customizations apply across all Company Portal surfaces - website, apps (Windows, iOS, Android, macOS), and the Intune app on Android.

## Scoping Questions

When troubleshooting Company Portal website issues, gather the following:

1. What browser and browser version is the user using?
2. Is the user able to sign in, or does the issue occur before/during/after authentication?
3. Is the device enrolled in Intune? Is it a personal or corporate device?
4. What specific action is the user trying to perform?
5. What error message (if any) is displayed?
6. Is the issue reproducible in an InPrivate/Incognito browser session?
7. Is the issue specific to one user, or does it affect multiple users?
8. What platform/OS is the device running?

## FAQ

**Q: What is the difference between the Company Portal website and the Intune Admin Center?**
A: The Company Portal website (`portal.manage.microsoft.com`) is the end-user self-service portal. The Intune Admin Center (`intune.microsoft.com`) is the IT administrator console.

**Q: Does the device need to be enrolled to use the Company Portal website?**
A: No. Users can sign in from any device with a browser. However, they will only see enrolled devices and apps assigned to them.

**Q: Can the user rename their device on the Company Portal website?**
A: Yes. The rename only changes the display name in Company Portal - it does not change the device name or management name visible in the Intune Admin Center.

**Q: Why can't the user see the Remove or Reset button?**
A: The admin may have hidden these actions for corporate devices via **Tenant Administration** > **Customization**. Check the customization settings.

**Q: Which browsers are supported?**
A: The Company Portal website supports modern browsers including Microsoft Edge, Google Chrome, Safari, and Firefox.
