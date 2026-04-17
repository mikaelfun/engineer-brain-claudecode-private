# AVD W365 Link 设备 - 杂项 — 排查工作流

**来源草稿**: ado-wiki-w365-link-bug-handling-process.md, ado-wiki-w365-link-collaboration-routing.md, ado-wiki-w365-link-hardware-issues.md, ado-wiki-w365-link-manually-trigger-updates.md, ado-wiki-w365-link-nfc-readers.md, ado-wiki-w365-link-peripherals.md, ado-wiki-w365-link-prerequisites.md, ado-wiki-w365-link-screen-timeout.md, ado-wiki-w365-link-setup-guide.md, ado-wiki-w365-link-update-behavior.md, ado-wiki-w365-link-where-things-happen.md
**Kusto 引用**: (无)
**场景数**: 30
**生成日期**: 2026-04-07

---

## Scenario 1: Windows 365 Link Bug Handling Process
> 来源: ado-wiki-w365-link-bug-handling-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
When an ICM is submitted for a Windows 365 Link issue and the Dev team determines it is a Bug, follow this process:

## Scenario 2: Preview Devices
> 来源: ado-wiki-w365-link-bug-handling-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - The bug will be listed in the ICM. Note the bug in your case.
   - Tell the customer their issue has been identified as a bug and the dev team will be working on it.
   - They can follow Preview Office hours for updates on the bug.
   - You can then close your case.
   - We do not commit to a time frame for any bugs.

## Scenario 3: GA Devices
> 来源: ado-wiki-w365-link-bug-handling-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - The bug will be listed in the ICM. Note the bug in your case.
   - Tell the customer their issue has been identified as a bug and the dev team will be working on it.
   - They can check "What's new" section of the Windows 365 Link online docs to learn when a fix will be released.
   - You can then close your case.
**Important:** We do not commit to a time frame for any bugs. Even if you see a date in the ICM, this is just an approximation and should not be shared with the customers unless the developer has specifically said to tell the customer a release date. If there is no date indicated, please do not reach out to the developer for a date commitment.

## Scenario 4: Windows 365 Link - Collaboration Routing
> 来源: ado-wiki-w365-link-collaboration-routing.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Hardware**: Escalate ICM to SaaF CloudPC Service/ CxE Support Escalations
**Entra device registration issues:**
Azure / Microsoft Entra Directories, Domains, and Objects / Devices / Configuring Windows Azure AD join
   - [Join Windows 365 Link to Microsoft Entra](https://learn.microsoft.com/en-us/windows-365/link/join-microsoft-entra)
**Intune enrollment issues:**
Azure / Microsoft Intune / Enroll Device - Windows
   - [Automatically enroll Windows 365 Link in Intune](https://learn.microsoft.com/en-us/windows-365/link/intune-automatic-enrollment)
**Conditional access config and auth issues:**
Azure / Microsoft Entra Sign-in and Multifactor Authentication / Conditional Access
   - [Conditional Access policies for Windows 365 Link](https://learn.microsoft.com/en-us/windows-365/link/conditional-access-policies-synchronize)

## Scenario 5: Peripherals
> 来源: ado-wiki-w365-link-hardware-issues.md | 适用: \u901a\u7528 \u2705

### 排查步骤
For peripheral issues (Keyboard, Mouse, Monitors, Bluetooth, Cables, and Inputs):
   - Get information details on the peripheral: Make, model, type
   - For cables: picture of the ends of the cords
   - Details of what has worked and not worked
**Raise a collaboration to:**
   - "PCA Commercial" team
   - **SAP**: Microsoft Accessories
   - **Queue**: MSaaS Microsoft PC Accessories

## Scenario 6: Hardware (Device Not Working)
> 来源: ado-wiki-w365-link-hardware-issues.md | 适用: \u901a\u7528 \u2705

### 排查步骤
If the Link device itself is not working or not booting up:
   - Describe in detail what is not working (does not turn on, lights do not come on, ports don't work, etc.)
**Raise a collaboration to:**
   - "PCA Commercial" team
   - **SAP**: Microsoft Accessories\Windows 365 Link Hardware
   - **Queue**: MSaaS Microsoft PC Accessories
**Include ALL the following information:**
   - Device Serial number
   - Tenant ID
   - Customer Company name
   - Shipping Address
   - Who it should go to
   - Phone number

## Scenario 7: Warranty Information
> 来源: ado-wiki-w365-link-hardware-issues.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Include ALL the following information:**
   - Device Serial number
   - Customer Company name

## Scenario 8: SaaF Escalation
> 来源: ado-wiki-w365-link-hardware-issues.md | 适用: \u901a\u7528 \u2705

### 排查步骤
If the PCA Commercial team reports that they believe the issue is a bug, raise an ICM to the NXT OS team with as much detail as possible (what is not working, troubleshooting done, report from the PCA Commercial team).

## Scenario 9: **Support for NFC readers**
> 来源: ado-wiki-w365-link-nfc-readers.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Windows 365 Link NXT OS Build **26100.3476 (25-3B)** (Tentative) will include the ability for users to take advantage of NFC Readers. Using a USB-C NFC reader, the Windows 365 Link device can be integrated with NFC FIDO2 cards as supported by Azure AD. For users in clean room environments, or where ID Badges contain FIDO technology, this method can enable a "Tap & PIN" experience for Windows 365 Link Sign on. This feature enables a faster sign-in experience for users.

## Scenario 10: **USB NFC reader support**
> 来源: ado-wiki-w365-link-nfc-readers.md | 适用: \u901a\u7528 \u2705

### 排查步骤
USB-CCID (Chip Card Interface Device) compatible NFC FIDO2 readers with USB base class "0B" and subclass "00" are supported. Refer to [Microsoft Class Drivers for USB CCID Smart Cards](https://learn.microsoft.com/en-us/previous-versions/windows/hardware/design/dn653571(v=vs.85)) for details on Microsoft class driver for USB CCID devices. There are two ways to determine if your NFC reader is compatible with Windows 365 Link. You may refer to the documentation provided by the reader's manufacturer. Or, you may use the Device Manager on your PC, as follows:
1. Plug in the USB NFC reader to a Windows PC.
2. In Device Manager, locate the reader device and right click on it and select Properties.
3. In Details tab, select "Compatible Ids" properties and check if "USB\Class_0b&SubClass_00" is in the list.
**Note**
If a USB NFC reader works on Windows Desktop with the inbox CCID driver, that same reader is expected to be compatible with the Windows 365 Link. If the reader requires a third-party driver (either from Windows Update or through manual driver installation), the reader isn't compatible with Windows 365 Link.
Whether you sign into a device you used before or a new device, follow these steps to sign in with an NFC reader:
1. From the "Other User" screen, enter the FIDO Key / Tap the NFC Key against the reader.
2. Enter the FIDO PIN.
3. Press the button on the FIDO Key / Tap the NFC Key against the reader again.
4. The Device logs in.
a. Note: if the user is new to the device, the Single Biometric Disclosure Screen is displayed.
5. Start Menu then appears.
**Note**
NFC reader support for the Windows 365 Link only supports NFC CTAP for FIDO2 login. There's no plan to provide the same level of Smartcard WinRT API support as on Windows Desktop. This decision is due to variations across Smartcard WinRT APIs. In addition, the SCard API used for Windows 365 Link has less functionality compared to the Desktop versions and some reader types and features may not be supported.

## Scenario 11: Windows 365 Link devices require some settings to facilitate a smooth deployment process. Docs: https://learn.microsoft.com/en-us/windows-365/link/requirements
> 来源: ado-wiki-w365-link-prerequisites.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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

## Scenario 12: Change Windows 365 Link Screen Timeout Setting via Intune
> 来源: ado-wiki-w365-link-screen-timeout.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Uses the same Power Policy CSP as other Windows devices:
[Power Policy CSP | Microsoft Learn](https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-power#displayofftimeoutpluggedin)

## Scenario 13: Steps to Create Intune Policy
> 来源: ado-wiki-w365-link-screen-timeout.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Create a new configuration policy: Devices → Configuration → Create → New Policy
2. Platform: Windows 10 and later
3. Profile type: Settings catalog
4. Name: Windows 365 Screen Timeout (or preferred name)
5. Description: a description of your choosing
6. Configuration settings: Search for "video and display settings" and choose "Turn off the display (plugged in)". Set the value (in seconds) before the display turns off.
7. Assignment: Target only Windows 365 Link devices using "add all devices" with an Include filter using the Windows 365 device filter.
8. Review and Create: click Create to create the policy

## Scenario 14: Prerequisites
> 来源: ado-wiki-w365-link-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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

## Scenario 15: Initial Setup Flow
> 来源: ado-wiki-w365-link-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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

## Scenario 16: Login Flow
> 来源: ado-wiki-w365-link-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Power on the Windows 365 Link.
2. On the **Sign in** screen, provide sign-in credentials with org-configured method.
3. Authenticate your account.
   - **W365 Infra Connection** - non-interactive auth with AVD Gateway and Broker.
   - **Cloud PC Connection** - RDP Reverse Connect transport, SSO required.
4. You're connected to your Cloud PC.
---

## Scenario 17: Local Quick Settings
> 来源: ado-wiki-w365-link-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Control | Description |
| --- | --- |
| Wi-Fi | View and manage Wi-Fi connection. |
| Bluetooth | View and manage Bluetooth devices (only after authentication, not in OOBE). |
| Accessibility | Magnifier, Contrast themes, Narrator, On-screen keyboard, Sticky keys, Filter keys. |
| Language | Choose display language. |
| Display | Change scale, set two monitor arrangement. |
| Privacy and Security | Location, Camera, microphone settings (not in OOBE). |
| Power button | Power management options. |

## Scenario 18: TL;DR
> 来源: ado-wiki-w365-link-update-behavior.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   * Link devices update via the same Windows Update services as Windows 11. When powered on, they periodically check, silently download updates, and install at the next reboot or at 3:00 AM (local time) when the device isn't in use. Driver/firmware updates are applied at reboot and, when possible, combined with OS updates into one reboot.
   * Customer-configured Intune policies (update rings, deadlines, grace period, active hours, autoreboot-beforedeadline) govern restart timing and can override defaults, which is why reboots can occur during the day when a deadline is reached.
---

## Scenario 19: How updates work on Link
> 来源: ado-wiki-w365-link-update-behavior.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **Detection & Download** - Devices periodically check Windows Update. If powered on, they silently download available updates.
2. **Install window** - Installation occurs on next reboot or at 3:00 AM (scheduled maintenance) if the device is powered on but isn't in use. If driver/firmware and OS updates arrive together, Link attempts to consolidate into a single reboot.
3. **Restarts are policy-driven** - Actual reboot timing follows Intune update policy (deadlines, grace period, active hours, and the Auto reboot before deadline switch). When a deadline passes, a forced reboot can occur even during the day if policies allow it.
4. **Manual update** - Users may manually check and install latest updates from the logon screen.
---

## Scenario 20: Defaults vs. customer policy
> 来源: ado-wiki-w365-link-update-behavior.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Link devices have a default 3:00 AM maintenance behavior that checks and installs updates if the device is running but it is not in use. However, customers can configure their own update ring policies (deadlines, grace period, active hours). Devices follow the configured policy, not the illustrative defaults.
Key Intune controls affecting restarts:
   * **Use deadline settings** — Set deadline (days) for quality/feature updates and a grace period. When the deadline expires, restart becomes mandatory.
   * **Auto reboot before deadline** — If Yes, a device that is outside active hours may auto-restart before the deadline once install is complete; if No, it will wait until deadline + grace before forcing a restart.
   * **Active hours** — Windows doesn't auto-restart during these hours; set appropriately for the customer's workday.
**NOTE:** Starting with 25'9B the defaults very likely would have been:
   - Feature Update Deadline: 2 days
   - Feature Update Grace: 5 days
   - Quality Update Deadline: 2 days
   - Quality Update Grace: 5 days
The net result is a max 7 days before a device is forced to reboot to apply an update. These settings can all be overridden by their own Intune Policies.
---

## Scenario 21: 3:00 AM scheduled check — what it does (and doesn't)
> 来源: ado-wiki-w365-link-update-behavior.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   * **What it does**: A scheduled task checks for updates around 3:00 AM (local time) and installs during that maintenance window only if conditions/policy permit (device on, not in use, not blocked by active hours).
   * **What it doesn't do by itself**: It doesn't force a reboot unless a deadline has passed or policy explicitly allows a pre-deadline restart. Device must be powered on at that time for the check to occur.
---

## Scenario 22: Diagnostics — verify which policies actually applied
> 来源: ado-wiki-w365-link-update-behavior.md | 适用: \u901a\u7528 \u2705

### 排查步骤
When customers see unexpected reboot timing, confirm effective policy on the device.

## Scenario 23: Option A — Collect Intune Diagnostic Logs
> 来源: ado-wiki-w365-link-update-behavior.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   * Collect Intune diagnostic logs for the Link device and analyze which Windows Update Policies are coming down to the Link device.

## Scenario 24: Option B — Cross-check Intune
> 来源: ado-wiki-w365-link-update-behavior.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   * In the Intune admin center, review the Update rings assigned to the Link device/device group and verify Use deadline settings, Grace period, Active hours, and Auto reboot before deadline. Differences from expected defaults commonly explain daytime restarts.
---

## Scenario 25: Troubleshooting workflow
> 来源: ado-wiki-w365-link-update-behavior.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Confirm device power/maintenance window. Was the device on at 3:00 AM (local time)? If not, the maintenance check didn't run.
2. Collect Intune Diagnostic logs and note Update CSP values (deadline, grace, active hours, AllowAutoUpdate). Create Collab with Intune team if needed.
3. Compare with Intune policy actually targeted to the device (ring priority, scope tags, device filters). Customer policy overrides defaults.
4. Look for daytime reboots near a passed deadline or when Auto reboot before deadline = Yes and the device was outside active hours.
5. Document outcome and align settings: adjust deadlines, grace period, and active hours to match the business window; avoid surprises.
---

## Scenario 26: FAQ
> 来源: ado-wiki-w365-link-update-behavior.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Q1. Why did my Link device reboot in the middle of the workday?**
A deadline likely expired (and grace period ended), or Auto reboot before deadline allowed an out-of-hours restart earlier than expected; both are customer policy choices.
**Q2. Does the device always install updates at exactly 3:00 AM (local time)?**
It checks around 3:00 AM (local time) and installs when policy allows. Reboot happens at next reboot or when policy requires it (deadline), not simply because it is 3:00 AM. Device must be powered on.
**Q3. How does the system determine "when the device isn't in use"?**
The task that runs at 3:00 AM (local time) checks if there is an active connection to a Cloud PC.
---

## Scenario 27: What to capture from customers (for escalations)
> 来源: ado-wiki-w365-link-update-behavior.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   * Intune Diagnostic Logs from the Link device and (if relevant) the Cloud PC.
   * Screenshots or export of the Intune Update Ring assigned to the device (deadline, grace, active hours, auto reboot before deadline).
   * Exact local time and timezone when the reboot occurred, and whether the device was on at 3:00 AM (local time).
---

## Scenario 28: References
> 来源: ado-wiki-w365-link-update-behavior.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   * [Windows 365 Link — Update behavior & control](https://learn.microsoft.com/en-us/windows-365/link/update-behavior-control)
   * [Manage device restarts after updates](https://learn.microsoft.com/en-us/windows/deployment/update/waas-restart)
   * [Manage Windows 365 Link devices with Intune](https://learn.microsoft.com/en-us/windows-365/link/device-management-overview)
   * [Collect diagnostics from an Intune managed device](https://learn.microsoft.com/en-us/intune/intune-service/remote-actions/collect-diagnostics)

## Scenario 29: 1. Authenticate & Join (Entra)
> 来源: ado-wiki-w365-link-where-things-happen.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Interactive Auth with Device Registration
   - Service obtains Token for user
   - Conditional Access evaluation

## Scenario 30: 3. Connect to W365 Infrastructure (Entra)
> 来源: ado-wiki-w365-link-where-things-happen.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Non-interactive auth with Gateway and Broker services
   - Reuses login token
