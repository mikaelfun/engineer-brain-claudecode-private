# AVD AVD Windows App 客户端 - 杂项 - Quick Reference

**Entries**: 12 | **21V**: mixed
**Keywords**: auto-update, client-configuration, contentidea-kb, crash, ctrl+win+l, eol, firewall, go.microsoft.com, keyboard, live-captions, migration, mooncake, msi, msrdc, proxy
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Remote Desktop client (MSI and Store versions) end of support timeline for Moonc... | Microsoft is retiring Remote Desktop client in favor of Windows App. Store versi... | Migrate to Windows App. For Mooncake: MSI version will continue to be supported ... | 🟢 8.5 | OneNote |
| 2 📋 | Windows App (Unified client) crashes or closes by itself with no errors - either... | Critical URLs required by Windows App are blocked by proxy/VPN/firewall: go.micr... | 1) Collect Windows App logs from C:Users{username}AppDataLocalTempDiagOutputDirW... | 🟢 8.0 | ADO Wiki |
| 3 📋 | Need to configure auto-update settings for MSI-based Remote Desktop Client (MSRD... |  | Configuration of Auto Updates for the MSI Desktop Client - see ADO wiki page (sc... | 🔵 7.0 | ADO Wiki |
| 4 📋 | The customer is experiencing issues with the Azure Virtual Desktop (AVD) client ... | Client      Type and Version Discrepancies:&nbsp;The discrepancies in the client... | Clarify      Client Type and Version Reporting:      Use       the provided Kust... | 🔵 6.5 | ContentIdea |
| 5 📋 | Azure Virtual Desktop (AVD) and Cloud PC (CPC) connections via Windows App would... | For Windows App version 2.0.420.0 and below, MSRDC not sending the correct disco... | Pull request (PR) for adding correct error message with session lock (including ... | 🔵 6.5 | ContentIdea |
| 6 📋 | After updating a Windows App, the following error prevents it from launching:Err... | This issue occurs when the Microsoft Account Sign-in Assistant service (`wlidsvc... | Follow these steps to resolve the issue by setting the startup type of the servi... | 🔵 6.5 | ContentIdea |
| 7 📋 | Windows app is crashing when starting up on specific machine. The user experienc... | Taking a dump of the Windows App shows an issue to open the Health Check log on ... | a) Ensure to put back the correct settings for the user environment variable TEM... | 🔵 6.5 | ContentIdea |
| 8 📋 | Abstract  An issue was observed in which copy-and-paste functionality fails when... |  | In Windows App (Web) version 2.0.03267.1373, disabling the Keyboard shortcuts op... | 🔵 6.5 | ContentIdea |
| 9 📋 | A user tries to sign in on Windows App. The following error message appears.&quo... | The client network does not allow all required URLs. Required FQDNs and endpoint... | Allow all required URLs as described in the following document. Required FQDNs a... | 🔵 6.5 | ContentIdea |
| 10 📋 | Non persistent VDI environment accessing internet based remote management consol... | Actual cause was not determined but appears to be problem with using RDP method ... | Utilized Windows App to connect to AVD VDI which resolved recognizing keystrokes... | 🔵 6.5 | ContentIdea |
| 11 📋 | Users might experience the following symptoms while using the&nbsp;Windows App i... | This issue happens due to a code defect in the UDP transport handler of the Wind... | The issue can be temporarily mitigated by disabling tracing, which is done by ad... | 🔵 6.5 | ContentIdea |
| 12 📋 | Windows key remains held in local session after pressing Ctrl+Win+L for live cap... | Known Windows limitation: when using Win key, certain key combinations are locke... | Release L or Win key before the Ctrl key when pressing Ctrl+Win+L; alternatively... | 🟡 4.5 | MS Learn |

## Quick Triage Path

1. Check: Microsoft is retiring Remote Desktop client in favor of Wind... `[Source: OneNote]`
2. Check: Critical URLs required by Windows App are blocked by proxy/V... `[Source: ADO Wiki]`
3. Check:  `[Source: ADO Wiki]`
4. Check: Client      Type and Version Discrepancies:&nbsp;The discrep... `[Source: ContentIdea]`
5. Check: For Windows App version 2.0.420.0 and below, MSRDC not sendi... `[Source: ContentIdea]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-windows-app-misc.md#troubleshooting-flow)