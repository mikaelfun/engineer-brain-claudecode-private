# AVD AVD Windows App 客户端 - 杂项 - Comprehensive Troubleshooting Guide

**Entries**: 10 | **Drafts fused**: 13 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-entra-auth-urls-windows-app.md, ado-wiki-avd-client-traces.md, ado-wiki-b-switching-to-unified-client.md, ado-wiki-b-unified-client-architecture-notes.md, ado-wiki-b-unified-client-setup-guides.md, ado-wiki-b-unified-windows-app.md, ado-wiki-rdp-connection-flow-msrdc-mstsc.md, ado-wiki-windows-app-branding-scoping-questions.md, ado-wiki-windows-app-branding-setup-guide.md, ado-wiki-windows-app-branding-troubleshooting.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, KB, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Remote Desktop client (MSI and Store versions) end of suppor... | Microsoft is retiring Remote Desktop client in favor of Wind... | Migrate to Windows App. For Mooncake: MSI version will conti... |
| The customer is experiencing issues with the Azure Virtual D... | Client      Type and Version Discrepancies:&nbsp;The discrep... | Clarify      Client Type and Version Reporting:      Use    ... |
| Azure Virtual Desktop (AVD) and Cloud PC (CPC) connections v... | For Windows App version 2.0.420.0 and below, MSRDC not sendi... | Pull request (PR) for adding correct error message with sess... |
| After updating a Windows App, the following error prevents i... | This issue occurs when the Microsoft Account Sign-in Assista... | Follow these steps to resolve the issue by setting the start... |
| Windows app is crashing when starting up on specific machine... | Taking a dump of the Windows App shows an issue to open the ... | a) Ensure to put back the correct settings for the user envi... |
| Abstract  An issue was observed in which copy-and-paste func... | - | In Windows App (Web) version 2.0.03267.1373, disabling the K... |
| A user tries to sign in on Windows App. The following error ... | The client network does not allow all required URLs. Require... | Allow all required URLs as described in the following docume... |
| Non persistent VDI environment accessing internet based remo... | Actual cause was not determined but appears to be problem wi... | Utilized Windows App to connect to AVD VDI which resolved re... |

### Phase 2: Detailed Investigation

#### Entra Authentication Discovered URLs for Windows App
> Source: [ado-wiki-a-entra-auth-urls-windows-app.md](guides/drafts/ado-wiki-a-entra-auth-urls-windows-app.md)

The following URLs/endpoints are used during Windows App authentication flow. These are important for network allowlisting and proxy configuration.

#### AVD Client Traces Collection
> Source: [ado-wiki-avd-client-traces.md](guides/drafts/ado-wiki-avd-client-traces.md)

> Note: The following steps are for AVD Web Client https://client.wvd.microsoft.com/arm/webclient/, NOT IWP https://windows365.microsoft.com/

#### Switching to Unified Client — How Each Client Transitions
> Source: [ado-wiki-b-switching-to-unified-client.md](guides/drafts/ado-wiki-b-switching-to-unified-client.md)

> ⚠️ **Deprecated**: See the [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Clie

#### Unified Client Engineering Notes
> Source: [ado-wiki-b-unified-client-architecture-notes.md](guides/drafts/ado-wiki-b-unified-client-architecture-notes.md)

> ⚠️ **Deprecated**: See the [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Clie

#### Unified Client Setup Guides (Deprecated/Historical)
> Source: [ado-wiki-b-unified-client-setup-guides.md](guides/drafts/ado-wiki-b-unified-client-setup-guides.md)

> ⚠️ **Deprecated**: See the [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Clie

#### Overview
> Source: [ado-wiki-b-unified-windows-app.md](guides/drafts/ado-wiki-b-unified-windows-app.md)

> ⚠️ **Deprecated**: See the [Windows App (Unified Client) documentation](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1240862/Windows-App-(Unified-Clie

#### MSRDC
> Source: [ado-wiki-rdp-connection-flow-msrdc-mstsc.md](guides/drafts/ado-wiki-rdp-connection-flow-msrdc-mstsc.md)

**Step 0**: ... irrelevant. We don't use P2P certificates in AVD scenario. This is controlled by 'fUseAadP2PCertificate' setting in the RDP listener config. For AVD it is always set to 0.

#### Windows App Branding - Scoping Questions
> Source: [ado-wiki-windows-app-branding-scoping-questions.md](guides/drafts/ado-wiki-windows-app-branding-scoping-questions.md)

- Branding policy in Intune (W365) or Azure Portal (AVD)?

#### Windows App Branding - Setup Guide
> Source: [ado-wiki-windows-app-branding-setup-guide.md](guides/drafts/ado-wiki-windows-app-branding-setup-guide.md)

## Admin - Windows 365 (Intune)

#### Windows App Branding - Troubleshooting
> Source: [ado-wiki-windows-app-branding-troubleshooting.md](guides/drafts/ado-wiki-windows-app-branding-troubleshooting.md)

1. Confirm affected user and platform

#### Windows App (Unified Client) — Data Collection Guide
> Source: [ado-wiki-windows-app-data-collection.md](guides/drafts/ado-wiki-windows-app-data-collection.md)

> Note: This content originated from deprecated Mobius documentation. The current Windows App documentation is at the [Windows App (Unified Client)](https://dev.azure.com/Supportability/WindowsVirtual

#### Windows App Support Updates for Government Clouds
> Source: [ado-wiki-windows-app-gov-cloud-support.md](guides/drafts/ado-wiki-windows-app-gov-cloud-support.md)

## 1. GCC: W365 Portal (IWP) Deprecated -> Windows App

#### Windows App Migration Guide for Mooncake
> Source: [onenote-avd-windows-app-migration.md](guides/drafts/onenote-avd-windows-app-migration.md)

> Source: OneNote - Mooncake POD Support Notebook / AVD / Feature Verification / Windows App replacement

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Remote Desktop client (MSI and Store versions) end of support timeline for Moonc... | Microsoft is retiring Remote Desktop client in favor of Windows App. Store versi... | Migrate to Windows App. For Mooncake: MSI version will continue to be supported ... | 🟢 10.0 | OneNote |
| 2 | The customer is experiencing issues with the Azure Virtual Desktop (AVD) client ... | Client      Type and Version Discrepancies:&nbsp;The discrepancies in the client... | Clarify      Client Type and Version Reporting:      Use       the provided Kust... | 🔵 6.5 | KB |
| 3 | Azure Virtual Desktop (AVD) and Cloud PC (CPC) connections via Windows App would... | For Windows App version 2.0.420.0 and below, MSRDC not sending the correct disco... | Pull request (PR) for adding correct error message with session lock (including ... | 🔵 6.5 | KB |
| 4 | After updating a Windows App, the following error prevents it from launching:Err... | This issue occurs when the Microsoft Account Sign-in Assistant service (`wlidsvc... | Follow these steps to resolve the issue by setting the startup type of the servi... | 🔵 6.5 | KB |
| 5 | Windows app is crashing when starting up on specific machine. The user experienc... | Taking a dump of the Windows App shows an issue to open the Health Check log on ... | a) Ensure to put back the correct settings for the user environment variable TEM... | 🔵 6.5 | KB |
| 6 | Abstract  An issue was observed in which copy-and-paste functionality fails when... | - | In Windows App (Web) version 2.0.03267.1373, disabling the Keyboard shortcuts op... | 🔵 6.5 | KB |
| 7 | A user tries to sign in on Windows App. The following error message appears.&quo... | The client network does not allow all required URLs. Required FQDNs and endpoint... | Allow all required URLs as described in the following document. Required FQDNs a... | 🔵 6.5 | KB |
| 8 | Non persistent VDI environment accessing internet based remote management consol... | Actual cause was not determined but appears to be problem with using RDP method ... | Utilized Windows App to connect to AVD VDI which resolved recognizing keystrokes... | 🔵 6.5 | KB |
| 9 | Users might experience the following symptoms while using the&nbsp;Windows App i... | This issue happens due to a code defect in the UDP transport handler of the Wind... | The issue can be temporarily mitigated by disabling tracing, which is done by ad... | 🔵 6.5 | KB |
| 10 | Windows key remains held in local session after pressing Ctrl+Win+L for live cap... | Known Windows limitation: when using Win key, certain key combinations are locke... | Release L or Win key before the Ctrl key when pressing Ctrl+Win+L; alternatively... | 🔵 6.5 | MS Learn |
