# AVD AVD USB 与外设重定向 - Quick Reference

**Entries**: 16 | **21V**: all applicable
**Keywords**: audio-redirection, audiomode, authorization, bluetooth, camera, click, contentidea-kb, context-based-redirection, disconnect, drive-redirection, epic, file-copy, gpo, hid, host-pool
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | USB camera/imaging device cannot be redirected to AVD session host running Windo... | On Windows Server OS, the RDSH (Remote Desktop Session Host) role must be instal... | 1) Install RDSH role on server (requires reboot). 2) On client: enable GPO 'Allo... | 🟢 8.5 | OneNote |
| 2 📋 | USB redirection cannot be disabled on Windows 365 Cloud PC when using Context Ba... | Known product limitation - USB redirection control via authentication context is... | Use alternative methods to restrict USB redirection on Windows 365 Cloud PC (e.g... | 🟢 8.0 | ADO Wiki |
| 3 📋 | Copying files in Remote Desktop Web Client redirected virtual drive fails on the... | Bug: WriteFile operation fails due to a denied access error. File is opened and ... | Workaround: Retry the file copy operation a second time. The second attempt shou... | 🟢 8.0 | ADO Wiki |
| 4 📋 | Virtual drive redirection does not work in AVD web client. Accessing \\tsclient ... | Bug: Any audiomode RDP property setting different than 0 (e.g., audiomode:i:1 or... | Set the RDP property audiomode:i:0 (Play sounds on the local computer) to re-ena... | 🟢 8.0 | ADO Wiki |
| 5 📋 | Copying files in Remote Desktop Web Client redirected virtual drive fails the fi... | Bug in Web Client virtual drive redirection. File is opened and closed repeatedl... | Workaround: perform a second copy attempt if the first one fails. Bug fix pendin... | 🟢 8.0 | ADO Wiki |
| 6 📋 | Virtual drive redirection does not work in Web Client. Accessing \\tsclient show... | Bug: Setting audiomode to any value other than 0 (e.g., 1 or 2) disables virtual... | Enable audio redirection by setting audiomode:i:0 ('Play sounds on the local com... | 🟢 8.0 | ADO Wiki |
| 7 📋 | Mouse pairs successfully but cursor does not move inside remote session - Blueto... | Bluetooth permission denied or revoked for Windows App, commonly after OS upgrad... | Navigate to iOS Privacy/Bluetooth settings, confirm Windows App has Bluetooth ac... | 🟢 8.0 | ADO Wiki |
| 8 📋 | Mouse disconnects randomly during Windows App session on iOS | Bluetooth power management, low mouse battery, or iOS background restrictions ki... | Check mouse battery level, keep Windows App in foreground during testing, re-pai... | 🟢 8.0 | ADO Wiki |
| 9 📋 | Relative Mouse feature not functioning in AVD session - mouse does not behave as... | RDP property `AllowRelativeMouseMode:i:1` not added to Host Pool | In ASC, go to Host Pool > RDP Properties > confirm/add `AllowRelativeMouseMode:i... | 🟢 8.0 | ADO Wiki |
| 10 📋 | Low-level device redirection not available for Linux Thin Clients in AVD | Microsoft Linux SDK does not support low-level device redirection for Linux Thin... | Use FabulaTech Device Redirector as workaround. Microsoft planned to add support... | 🔵 7.0 | ADO Wiki |
| 11 📋 | Cursor moves but clicks or scrolling do not work in Windows App on iOS | Mouse profile not fully supported, partial HID compatibility, or custom mouse bu... | Test basic inputs (left-click, right-click, scroll wheel), confirm whether issue... | 🔵 7.0 | ADO Wiki |
| 12 📋 | AVD session hosts Bugcheck 0xA IRQL_NOT_LESS_OR_EQUAL from Desktop Client. USB r... | USB redirection of Intel Wireless Bluetooth driver accessing invalid memory. | Downgrade to Intel Wireless Bluetooth driver version 21.110.0.3. | 🔵 6.5 | ContentIdea |
| 13 📋 | User gets 'Reconnecting' page when connecting from AVD desktop client, with&nbsp... | Disabling 'Do not allow supported Plug and Play device redirection' policy will ... | Do not redirect the Intel Wireless Bluetooth on the AVD session:Peripheral and r... | 🔵 6.5 | ContentIdea |
| 14 📋 | Users local Microsoft Teams calls disconnect shortly (within ~1020 seconds) afte... | Competing Teams media stacks (local machine vs. VDIoptimized Teams) contend for ... | Resolution 1  Disable Teams HID Manager (low risk, reversible) Mitigates device ... | 🔵 6.5 | ContentIdea |
| 15 📋 | By default RDP setting created to WVD resource will have drive redirection setti... | RDP file at C:\Users\Username\AppData\Local\rdclientwpf\GUID contains drivestore... | Spring 2020 update: Use PowerShell Update-AzWvdHostPool -ResourceGroupName <RG> ... | 🔵 6.5 | ContentIdea |
| 16 📋 | Need to disable local drive visibility on WVD RD Client. | Drive redirection is enabled by default and needs GPO configuration to block. | Configure GPO: Computer Configuration\Policies\Administrative Templates\Windows ... | 🔵 6.5 | ContentIdea |

## Quick Triage Path

1. Check: On Windows Server OS, the RDSH (Remote Desktop Session Host)... `[Source: OneNote]`
2. Check: Known product limitation - USB redirection control via authe... `[Source: ADO Wiki]`
3. Check: Bug: WriteFile operation fails due to a denied access error.... `[Source: ADO Wiki]`
4. Check: Bug: Any audiomode RDP property setting different than 0 (e.... `[Source: ADO Wiki]`
5. Check: Bug in Web Client virtual drive redirection. File is opened ... `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-usb-peripheral.md#troubleshooting-flow)