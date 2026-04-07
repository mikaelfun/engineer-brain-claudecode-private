# AVD W365 Link 设备 - 杂项 - Quick Reference

**Entries**: 13 | **21V**: all applicable
**Keywords**: 4b-update, cloud-pc, conditional-access, configuration, consent-prompt, device-registration, device-restriction, display
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Windows 365 Link device shows error An authentication issue occurred where an in... | Conditional Access policies enforcing MFA are applied to Cloud PC resources but ... | Create a Conditional Access policy in Entra admin center targeting Register or j... | 🔵 7.5 | ADO Wiki |
| 2 📋 | Windows 365 Link device shows 'An authentication issue occurred where an interac... | Conditional Access policy enforcing MFA on cloud resources (Windows 365, Graph) ... | Create a Conditional Access policy enforcing MFA on the user action 'Register or... | 🔵 7.5 | ADO Wiki |
| 3 📋 | Windows 365 Link device shows error Your Cloud PC does not support Entra ID sing... | Windows 365 Link requires Entra ID SSO to be enabled on the Cloud PC provisionin... | 1) Enable SSO in the provisioning policy for the Cloud PCs. 2) For Hybrid Entra ... | 🔵 7.5 | ADO Wiki |
| 4 📋 | Windows 365 Link device experiences multiple reboots after installing 4B update | Security baseline provisioning package included in 4B applies new policies at fi... | This is expected behavior by design. The device will restart at most twice durin... | 🔵 7.5 | ADO Wiki |
| 5 📋 | Windows 365 Link device stuck in recovery mode after Intune reset - WinRE boot l... | Starting NXT OS preview build 26100.2161 (24-10D), Intune reset drops the device... | Issue resolved in NXT OS build 26100.3194 (25-2B) for GA customers. For preview ... | 🔵 7.5 | ADO Wiki |
| 6 📋 | Windows 365 Link device enrollment fails with 'The Mobile Device Management (MDM... | Device platform restriction policy blocks personally owned devices, which preven... | Create a higher-priority Windows enrollment restriction policy: Intune admin cen... | 🔵 7.5 | ADO Wiki |
| 7 📋 | Windows 365 Link fails to connect to Cloud PC with error: Failed to open a Micro... | Windows 365 Link cannot display the Entra ID SSO consent prompt that is required... | Suppress SSO consent prompt by: 1) Create dynamic device group for all Cloud PCs... | 🔵 7.5 | ADO Wiki |
| 8 📋 | Windows 365 Link device displays time zone in PST by default; incorrect time zon... | NXT OS determines time zone from BIOS time and defaults to PST due to privacy re... | Create Intune Settings Catalog policy: Privacy → 'Let Apps Access Location' = 'F... | 🔵 7.5 | ADO Wiki |
| 9 📋 | Windows 365 Link device reboots unexpectedly during workday after OS update | Intune update ring deadline expired (+ grace period ended), or Auto reboot befor... | Review and adjust Intune Update Ring: set appropriate deadline days, grace perio... | 🔵 7.5 | ADO Wiki |
| 10 📋 | Windows 365 Link display settings (duplicate/extend/rearrange/resolution/scale/o... | Cloud PC OS not updated to required build version (26100.4333 for 24H2 or 22621.... | Update NXT Cloud PC to build 26100.4333 (24H2) or 22621.5469 (23H2) or later. If... | 🔵 7.5 | ADO Wiki |
| 11 📋 | After installing WindowsCPC security update KB5066835 (October 14, 2025), USB de... | The October 2025 security update (KB5066835) introduced a regression that breaks... | 1) Use Intune remote wipe to reset the device instead of WinRE recovery. 2) If t... | 🔵 7.5 | ADO Wiki |
| 12 📋 | Windows 365 Link device cannot connect to Cloud PC, SSO fails | Cloud PC provisioning policy does not have SSO enabled. W365 Link devices requir... | Enable SSO in the Cloud PC provisioning policy: Intune > Devices > Windows 365 >... | 🔵 7.5 | ADO Wiki |
| 13 📋 | Windows 365 Link user prompted for MFA repeatedly or MFA claim missing when conn... | Conditional Access policy requires MFA for W365 Cloud PCs but no policy exists f... | Create a Conditional Access policy targeting User Action Register or join device... | 🔵 7.5 | ADO Wiki |

## Quick Triage Path

1. Check: Conditional Access policies enforcing MFA are appl `[Source: ADO Wiki]`
2. Check: Conditional Access policy enforcing MFA on cloud r `[Source: ADO Wiki]`
3. Check: Windows 365 Link requires Entra ID SSO to be enabl `[Source: ADO Wiki]`
4. Check: Security baseline provisioning package included in `[Source: ADO Wiki]`
5. Check: Starting NXT OS preview build 26100.2161 (24-10D), `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-link-device-misc.md#troubleshooting-flow)
