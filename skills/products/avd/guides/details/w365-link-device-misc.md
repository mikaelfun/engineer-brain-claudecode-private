# AVD W365 Link 设备 - 杂项 - Comprehensive Troubleshooting Guide

**Entries**: 13 | **Drafts fused**: 11 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-w365-link-bug-handling-process.md, ado-wiki-w365-link-collaboration-routing.md, ado-wiki-w365-link-hardware-issues.md, ado-wiki-w365-link-manually-trigger-updates.md, ado-wiki-w365-link-nfc-readers.md, ado-wiki-w365-link-peripherals.md, ado-wiki-w365-link-prerequisites.md, ado-wiki-w365-link-screen-timeout.md, ado-wiki-w365-link-setup-guide.md, ado-wiki-w365-link-update-behavior.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Windows 365 Link device shows error An authentication issue ... | Conditional Access policies enforcing MFA are applied to Clo... | Create a Conditional Access policy in Entra admin center tar... |
| Windows 365 Link device shows 'An authentication issue occur... | Conditional Access policy enforcing MFA on cloud resources (... | Create a Conditional Access policy enforcing MFA on the user... |
| Windows 365 Link device shows error Your Cloud PC does not s... | Windows 365 Link requires Entra ID SSO to be enabled on the ... | 1) Enable SSO in the provisioning policy for the Cloud PCs. ... |
| Windows 365 Link device experiences multiple reboots after i... | Security baseline provisioning package included in 4B applie... | This is expected behavior by design. The device will restart... |
| Windows 365 Link device stuck in recovery mode after Intune ... | Starting NXT OS preview build 26100.2161 (24-10D), Intune re... | Issue resolved in NXT OS build 26100.3194 (25-2B) for GA cus... |
| Windows 365 Link device enrollment fails with 'The Mobile De... | Device platform restriction policy blocks personally owned d... | Create a higher-priority Windows enrollment restriction poli... |
| Windows 365 Link fails to connect to Cloud PC with error: Fa... | Windows 365 Link cannot display the Entra ID SSO consent pro... | Suppress SSO consent prompt by: 1) Create dynamic device gro... |
| Windows 365 Link device displays time zone in PST by default... | NXT OS determines time zone from BIOS time and defaults to P... | Create Intune Settings Catalog policy: Privacy → 'Let Apps A... |

### Phase 2: Detailed Investigation

#### Windows 365 Link Bug Handling Process
> Source: [ado-wiki-w365-link-bug-handling-process.md](guides/drafts/ado-wiki-w365-link-bug-handling-process.md)

When an ICM is submitted for a Windows 365 Link issue and the Dev team determines it is a Bug, follow this process:

#### Windows 365 Link - Collaboration Routing
> Source: [ado-wiki-w365-link-collaboration-routing.md](guides/drafts/ado-wiki-w365-link-collaboration-routing.md)

**Hardware**: Escalate ICM to SaaF CloudPC Service/ CxE Support Escalations

#### Windows 365 Link Hardware Issues & Peripheral Escalation
> Source: [ado-wiki-w365-link-hardware-issues.md](guides/drafts/ado-wiki-w365-link-hardware-issues.md)

For peripheral issues (Keyboard, Mouse, Monitors, Bluetooth, Cables, and Inputs):

#### How to Manually Trigger Updates on Windows 365 Link
> Source: [ado-wiki-w365-link-manually-trigger-updates.md](guides/drafts/ado-wiki-w365-link-manually-trigger-updates.md)

You can manually trigger updates from the login screen by clicking on "Quick Settings" in the bottom right corner. Click the "i" in the circle icon and you should see a "Check for updates" button.

#### **Support for NFC readers**
> Source: [ado-wiki-w365-link-nfc-readers.md](guides/drafts/ado-wiki-w365-link-nfc-readers.md)

Windows 365 Link NXT OS Build **26100.3476 (25-3B)** (Tentative) will include the ability for users to take advantage of NFC Readers. Using a USB-C NFC reader, the Windows 365 Link device can be integ

#### ado-wiki-w365-link-peripherals.md
> Source: [ado-wiki-w365-link-peripherals.md](guides/drafts/ado-wiki-w365-link-peripherals.md)

[Docs W365 Link Device Test Peripherals](https://review.learn.microsoft.com/en-us/windows-365/link/tested-peripherals-windows-365-link?branch=release-win365-linkga)

#### ado-wiki-w365-link-prerequisites.md
> Source: [ado-wiki-w365-link-prerequisites.md](guides/drafts/ado-wiki-w365-link-prerequisites.md)

Windows 365 Link devices require some settings to facilitate a smooth deployment process. Docs: https://learn.microsoft.com/en-us/windows-365/link/requirements

#### Change Windows 365 Link Screen Timeout Setting via Intune
> Source: [ado-wiki-w365-link-screen-timeout.md](guides/drafts/ado-wiki-w365-link-screen-timeout.md)

Uses the same Power Policy CSP as other Windows devices:

#### Prerequisites
> Source: [ado-wiki-w365-link-setup-guide.md](guides/drafts/ado-wiki-w365-link-setup-guide.md)

Windows 365 Link devices require some settings to facilitate a smooth deployment process.

#### TL;DR
> Source: [ado-wiki-w365-link-update-behavior.md](guides/drafts/ado-wiki-w365-link-update-behavior.md)

* Link devices update via the same Windows Update services as Windows 11. When powered on, they periodically check, silently download updates, and install at the next reboot or at 3:00 AM (local time)

#### Windows 365 Link - Where Things Happen (OOBE Flow)
> Source: [ado-wiki-w365-link-where-things-happen.md](guides/drafts/ado-wiki-w365-link-where-things-happen.md)

## Out of Box Experience (OOBE)

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Windows 365 Link device shows error An authentication issue occurred where an in... | Conditional Access policies enforcing MFA are applied to Cloud PC resources but ... | Create a Conditional Access policy in Entra admin center targeting Register or j... | 🔵 7.5 | ADO Wiki |
| 2 | Windows 365 Link device shows 'An authentication issue occurred where an interac... | Conditional Access policy enforcing MFA on cloud resources (Windows 365, Graph) ... | Create a Conditional Access policy enforcing MFA on the user action 'Register or... | 🔵 7.5 | ADO Wiki |
| 3 | Windows 365 Link device shows error Your Cloud PC does not support Entra ID sing... | Windows 365 Link requires Entra ID SSO to be enabled on the Cloud PC provisionin... | 1) Enable SSO in the provisioning policy for the Cloud PCs. 2) For Hybrid Entra ... | 🔵 7.5 | ADO Wiki |
| 4 | Windows 365 Link device experiences multiple reboots after installing 4B update | Security baseline provisioning package included in 4B applies new policies at fi... | This is expected behavior by design. The device will restart at most twice durin... | 🔵 7.5 | ADO Wiki |
| 5 | Windows 365 Link device stuck in recovery mode after Intune reset - WinRE boot l... | Starting NXT OS preview build 26100.2161 (24-10D), Intune reset drops the device... | Issue resolved in NXT OS build 26100.3194 (25-2B) for GA customers. For preview ... | 🔵 7.5 | ADO Wiki |
| 6 | Windows 365 Link device enrollment fails with 'The Mobile Device Management (MDM... | Device platform restriction policy blocks personally owned devices, which preven... | Create a higher-priority Windows enrollment restriction policy: Intune admin cen... | 🔵 7.5 | ADO Wiki |
| 7 | Windows 365 Link fails to connect to Cloud PC with error: Failed to open a Micro... | Windows 365 Link cannot display the Entra ID SSO consent prompt that is required... | Suppress SSO consent prompt by: 1) Create dynamic device group for all Cloud PCs... | 🔵 7.5 | ADO Wiki |
| 8 | Windows 365 Link device displays time zone in PST by default; incorrect time zon... | NXT OS determines time zone from BIOS time and defaults to PST due to privacy re... | Create Intune Settings Catalog policy: Privacy → 'Let Apps Access Location' = 'F... | 🔵 7.5 | ADO Wiki |
| 9 | Windows 365 Link device reboots unexpectedly during workday after OS update | Intune update ring deadline expired (+ grace period ended), or Auto reboot befor... | Review and adjust Intune Update Ring: set appropriate deadline days, grace perio... | 🔵 7.5 | ADO Wiki |
| 10 | Windows 365 Link display settings (duplicate/extend/rearrange/resolution/scale/o... | Cloud PC OS not updated to required build version (26100.4333 for 24H2 or 22621.... | Update NXT Cloud PC to build 26100.4333 (24H2) or 22621.5469 (23H2) or later. If... | 🔵 7.5 | ADO Wiki |
| 11 | After installing WindowsCPC security update KB5066835 (October 14, 2025), USB de... | The October 2025 security update (KB5066835) introduced a regression that breaks... | 1) Use Intune remote wipe to reset the device instead of WinRE recovery. 2) If t... | 🔵 7.5 | ADO Wiki |
| 12 | Windows 365 Link device cannot connect to Cloud PC, SSO fails | Cloud PC provisioning policy does not have SSO enabled. W365 Link devices requir... | Enable SSO in the Cloud PC provisioning policy: Intune > Devices > Windows 365 >... | 🔵 7.5 | ADO Wiki |
| 13 | Windows 365 Link user prompted for MFA repeatedly or MFA claim missing when conn... | Conditional Access policy requires MFA for W365 Cloud PCs but no policy exists f... | Create a Conditional Access policy targeting User Action Register or join device... | 🔵 7.5 | ADO Wiki |
