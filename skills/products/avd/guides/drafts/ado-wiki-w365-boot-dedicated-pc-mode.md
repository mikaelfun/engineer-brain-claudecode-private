---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Boot/Dedicated PC mode on Windows 365 Boot"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Boot/Dedicated%20PC%20mode%20on%20Windows%20365%20Boot"
importDate: "2026-04-05"
type: reference-guide
---

Windows365 Boot can be deployed on either Shared PC mode or Dedicated PC mode.

When deployed on Dedicated PC mode, the owner of the Boot device gets an enhanced user experience (e.g. they can use Windows Hello for Business for authentication, their user profile name and picture are saved locally, etc.). You can find info about this enhanced experience in the documentation below.

[CloudDesktop CSP | Microsoft Learn](https://learn.microsoft.com/en-us/windows/client-management/mdm/clouddesktop-csp#deviceboottocloudpcenhanced)

> Enable Boot to Cloud Dedicated Mode (Cloud only): Dedicated mode allows user to sign-in on the device using various authentication mechanism configured by their organization (For ex. PIN, Biometrics etc). This mode preserves user personalization, including their profile picture and username in local machine, and facilitates fast account switching.

## Important Clarification: Multi-user access

**Dedicated PC mode does NOT prevent other users from accessing the device** ([documentation](https://learn.microsoft.com/en-us/windows-365/enterprise/windows-365-boot-overview#dedicated-pc-scenario) may be misleading).

Dedicated PC mode is intended for a single user, but multiple users are still able to use the same Boot device to access their own different Cloud PCs, and you can switch between users the same way you'd do on a standard Windows machine.

The only difference: any user other than the device owner (usually the primary user visible in Intune portal) will **not** get the enhanced experience - they won't be able to authenticate with WHfB, etc.
