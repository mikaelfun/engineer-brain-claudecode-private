---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/Archived Content/Overview/Prerequisites"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FArchived%20Content%2FOverview%2FPrerequisites"
importDate: "2026-04-05"
type: troubleshooting-guide
---

Windows 365 Link devices require some settings to facilitate a smooth deployment process. Docs: https://learn.microsoft.com/en-us/windows-365/link/requirements

- **Entra ID Device Joining Permissions:** The users who will use Windows 365 Link devices must have permission to join devices to Entra ID. While it is recommended to allow All Users to do so, a selected group of Preview Users can be used. Link devices are Entra ID Joined only and can connect to CPCs that are Entra ID Joined or Hybrid Joined.
  https://learn.microsoft.com/en-us/entra/identity/devices/manage-device-identities#configure-device-settings

- **Automatic Enrollment in Intune:** For the devices to be managed by Intune, automatic enrollment must be enabled. While it is recommended to allow All Users to do so, a selected group of Preview Users can be used.
  https://learn.microsoft.com/en-us/mem/intune/enrollment/quickstart-setup-auto-enrollment

- **Registration of Personally Owned Windows Devices:** Initially these devices are identified as "personally owned" until Intune Automatic Enrollment completes. If a device restriction was made to block "personally owned" devices, a selected group of Preview Users could be Allowed or use a Device Enrollment Manager to join the devices before giving them to users.
  https://learn.microsoft.com/en-us/mem/intune/enrollment/enrollment-restrictions-set#personally-owned-devices

- **Cloud PC Single Sign-on Configuration:** Windows 365 Link devices **must** use Single Sign-On when connecting to Cloud PCs, so any CPCs that are being used from these devices must have SSO enabled. If not currently enabled, it can be activated through the assigned Provisioning Policy or by provisioning a new Cloud PC with SSO on.
  https://learn.microsoft.com/en-us/windows-365/enterprise/edit-provisioning-policy

- **MFA Requirement for Device Registration:** If Conditional Access policies are in place requiring MFA for Windows 365 Cloud PCs, an additional policy may be needed for the User Action of "Register or join devices". This will cause devices to prompt for MFA during sign-in providing the needed claim to SSO to the Cloud PC.
  https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps#user-actions
