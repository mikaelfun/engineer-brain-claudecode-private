# AVD AVD USB 与外设重定向 - Quick Reference

**Entries**: 11 | **21V**: all applicable
**Keywords**: audiomode, camera, cipher, citrix, click, connectivity, context-based-redirection, epic
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Low-level device redirection not available for Linux Thin Clients in AVD | Microsoft Linux SDK does not support low-level device redirection for Linux Thin... | Use FabulaTech Device Redirector as workaround. Microsoft planned to add support... | 🟢 8.0 | ADO Wiki |
| 2 📋 | USB redirection cannot be disabled on Windows 365 Cloud PC when using Context Ba... | Known product limitation - USB redirection control via authentication context is... | Use alternative methods to restrict USB redirection on Windows 365 Cloud PC (e.g... | 🟢 8.0 | ADO Wiki |
| 3 📋 | USB camera/imaging device cannot be redirected to AVD session host running Windo... | On Windows Server OS, the RDSH (Remote Desktop Session Host) role must be instal... | 1) Install RDSH role on server (requires reboot). 2) On client: enable GPO 'Allo... | 🟢 8.0 | OneNote |
| 4 📋 | Copying files in Remote Desktop Web Client redirected virtual drive fails on the... | Bug: WriteFile operation fails due to a denied access error. File is opened and ... | Workaround: Retry the file copy operation a second time. The second attempt shou... | 🔵 7.5 | ADO Wiki |
| 5 📋 | Virtual drive redirection does not work in AVD web client. Accessing \\tsclient ... | Bug: Any audiomode RDP property setting different than 0 (e.g., audiomode:i:1 or... | Set the RDP property audiomode:i:0 (Play sounds on the local computer) to re-ena... | 🔵 7.5 | ADO Wiki |
| 6 📋 | Cannot connect to Cloud PCs using Citrix after reboot; machine shows unregistere... | After reboot, network profile does not switch to Domain Authenticated and remain... | Check Microsoft-Windows-NetworkProfile-Operational.evtx to compare reboot timest... | 🔵 7.5 | ADO Wiki |
| 7 📋 | Cannot connect to Cloud PC via RDP desktop client with error "Local Security Aut... | Customer modified TLS ciphers in registry, removing RSAE-PSS cipher suites. This... | Add back the following TLS ciphers to HKLM\SYSTEM\CurrentControlSet\Control\Cryp... | 🔵 7.5 | ADO Wiki |
| 8 📋 | Cursor moves but clicks or scrolling do not work in Windows App on iOS | Mouse profile not fully supported, partial HID compatibility, or custom mouse bu... | Test basic inputs (left-click, right-click, scroll wheel), confirm whether issue... | 🔵 7.0 | ADO Wiki |
| 9 📋 | AVD session hosts Bugcheck 0xA IRQL_NOT_LESS_OR_EQUAL from Desktop Client. USB r... | USB redirection of Intel Wireless Bluetooth driver accessing invalid memory. | Downgrade to Intel Wireless Bluetooth driver version 21.110.0.3. | 🔵 6.5 | KB |
| 10 📋 | User gets 'Reconnecting' page when connecting from AVD desktop client, with&nbsp... | Disabling 'Do not allow supported Plug and Play device redirection' policy will ... | Do not redirect the Intel Wireless Bluetooth on the AVD session:Peripheral and r... | 🔵 6.5 | KB |
| 11 📋 | Users local Microsoft Teams calls disconnect shortly (within ~1020 seconds) afte... | Competing Teams media stacks (local machine vs. VDIoptimized Teams) contend for ... | Resolution 1  Disable Teams HID Manager (low risk, reversible) Mitigates device ... | 🔵 6.5 | KB |

## Quick Triage Path

1. Check: Microsoft Linux SDK does not support low-level dev `[Source: ADO Wiki]`
2. Check: Known product limitation - USB redirection control `[Source: ADO Wiki]`
3. Check: On Windows Server OS, the RDSH (Remote Desktop Ses `[Source: OneNote]`
4. Check: Bug: WriteFile operation fails due to a denied acc `[Source: ADO Wiki]`
5. Check: Bug: Any audiomode RDP property setting different `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-usb-peripheral.md#troubleshooting-flow)
