---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Link/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Link/Setup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Prerequisites

Windows 365 Link devices require some settings to facilitate a smooth deployment process.
https://learn.microsoft.com/en-us/windows-365/link/requirements

**Entra ID Device Joining Permissions:**
Users who will use Windows 365 Link devices must have permission to join devices to Entra ID. While it is recommended to allow All Users, a selected group of Preview Users can be used. Link devices are Entra ID Joined only and can connect to CPCs that are Entra ID Joined or Hybrid Joined.

**Automatic Enrollment in Intune:**
For the devices to be managed by Intune, automatic enrollment must be enabled. Windows 365 Link devices can optionally use the Intune corporate identifier enrollment feature to pre-upload serial number, manufacturer, model to ensure only trusted devices go through enrollment.

**Registration of Personally Owned Windows Devices:**
Initially these devices are identified as "personally owned" until Intune Automatic Enrollment completes. If a device restriction blocks "personally owned" devices, a selected group of Preview Users could be Allowed or use a Device Enrollment Manager to join the devices before giving them to users.

**Cloud PC Single Sign-on Configuration:**
Windows 365 Link devices must use Single Sign-On when connecting to Cloud PCs, so any CPCs being used from these devices must have SSO enabled. If not currently enabled, it can be activated through the assigned Provisioning Policy or by provisioning a new Cloud PC with SSO on.

**MFA Requirement for Device Registration:**
If Conditional Access policies are in place requiring MFA for Windows 365 Cloud PCs, an additional policy may be needed for the User Action of "Register or join devices". This will cause devices to prompt for MFA during sign-in providing the needed claim to SSO to the Cloud PC.

---

# Initial Setup Flow

1. Connect a monitor, USB keyboard, and USB mouse (recommended) to the device.
2. Connect the power adaptor to the power port and then into a power outlet.
3. Power on the device.
4. On the **Let's connect you to a network** page, select a network > **Next**.
5. On the **Let's set things up for your work or school** page, type your work or school e-mail > **Next**
6. Authenticate your account as requested (FIDO2 security key, Passkey, Microsoft Authenticator app, etc.).
   - **Authentication and Join** phase happens in Entra - interactive Auth with Device Registration service.
   - **Enrollment** phase happens in Intune - device enrolled as "personally owned".
   - **W365 Infra Connection** phase - non-interactive authentication with AVD Gateway and Broker services.
   - **Cloud PC Connection** - uses RDP Reverse Connect transport. Cloud PC must be SSO enabled.
7. You're connected to your Cloud PC.

---

# Login Flow

1. Power on the Windows 365 Link.
2. On the **Sign in** screen, provide sign-in credentials with org-configured method.
3. Authenticate your account.
   - **W365 Infra Connection** - non-interactive auth with AVD Gateway and Broker.
   - **Cloud PC Connection** - RDP Reverse Connect transport, SSO required.
4. You're connected to your Cloud PC.

---

# Local Quick Settings

| Control | Description |
| --- | --- |
| Wi-Fi | View and manage Wi-Fi connection. |
| Bluetooth | View and manage Bluetooth devices (only after authentication, not in OOBE). |
| Accessibility | Magnifier, Contrast themes, Narrator, On-screen keyboard, Sticky keys, Filter keys. |
| Language | Choose display language. |
| Display | Change scale, set two monitor arrangement. |
| Privacy and Security | Location, Camera, microphone settings (not in OOBE). |
| Power button | Power management options. |
