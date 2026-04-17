# AVD AVD 打印重定向 - Comprehensive Troubleshooting Guide

**Entries**: 7 | **Drafts fused**: 4 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-twain-faq.md, ado-wiki-a-twain-setup-guide.md, ado-wiki-b-printer-redirection-on-avd-from-print-server.md, ado-wiki-b-raw-printing-setup-guide.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: OneNote, KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Customer requests ability to selectively enable or disable R... | Feature limitation: SmartRawPrinters RDP property does not s... | Inform customer that RAW printing is a global toggle only. O... |
| Multiple TWAIN scanners attached to client endpoint; wrong o... | No default TWAIN scanner configured on client device | Set default TWAIN scanner via client-side registry: `reg add... |
| TWAIN scanner redirection not working with high-level redire... | High-level TWAIN scanner redirections are incompatible with ... | Use low-level USB redirection on Windows Clients (latency ma... |
| RAW printing not working or experiencing issues with RAW pri... | - | No additional troubleshooting specific to RAW printing is ne... |
| TWAIN scanner not working or not detected in AVD/W365 remote... | WIA (Windows Image Acquisition) driver selected instead of T... | 1. First validate scanner works E2E on local client using fr... |
| Fails to get the print job from AVD clients to Dell Wyse thi... | Print job spooled from AVD but not reaching Dell Wyse device... | Update Dell Wyse firmware and client version to latest. |
| When installing language packs for Windows 10 multi-session ... | The FoD cab packages listed in Microsoft documentation are n... | Download the missing FoD packages separately from the Featur... |

### Phase 2: Detailed Investigation

#### FAQ
> Source: [ado-wiki-a-twain-faq.md](guides/drafts/ado-wiki-a-twain-faq.md)

| 1. What happens if you have an all in 1 device (printer + TWAIN scanner)?<br> |

#### ado-wiki-a-twain-setup-guide.md
> Source: [ado-wiki-a-twain-setup-guide.md](guides/drafts/ado-wiki-a-twain-setup-guide.md)

Before configuring TWAIN, you need to ensure the following:

#### Printer Redirection on AVD from a Print Server
> Source: [ado-wiki-b-printer-redirection-on-avd-from-print-server.md](guides/drafts/ado-wiki-b-printer-redirection-on-avd-from-print-server.md)

To redirect printers from a Print Server on an Azure Virtual Desktop Environment, you need:

#### RAW Printing Support — Setup Guide
> Source: [ado-wiki-b-raw-printing-setup-guide.md](guides/drafts/ado-wiki-b-raw-printing-setup-guide.md)

By default, this feature is **off**. To enable it, follow the instructions below.

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Customer requests ability to selectively enable or disable RAW printing for spec... | Feature limitation: SmartRawPrinters RDP property does not support targeting ind... | Inform customer that RAW printing is a global toggle only. Options: (1) SmartRaw... | 🔵 7.5 | ADO Wiki |
| 2 | Multiple TWAIN scanners attached to client endpoint; wrong or no scanner selecte... | No default TWAIN scanner configured on client device | Set default TWAIN scanner via client-side registry: `reg add "HKEY_LOCAL_MACHINE... | 🔵 7.5 | ADO Wiki |
| 3 | TWAIN scanner redirection not working with high-level redirection in AVD | High-level TWAIN scanner redirections are incompatible with scanner redirections... | Use low-level USB redirection on Windows Clients (latency may be an issue). Alte... | 🔵 7.0 | ADO Wiki |
| 4 | RAW printing not working or experiencing issues with RAW printing redirection in... | - | No additional troubleshooting specific to RAW printing is needed. Follow the sam... | 🔵 7.0 | ADO Wiki |
| 5 | TWAIN scanner not working or not detected in AVD/W365 remote session | WIA (Windows Image Acquisition) driver selected instead of TWAIN driver, or scan... | 1. First validate scanner works E2E on local client using free TWAIN software (e... | 🔵 7.0 | ADO Wiki |
| 6 | Fails to get the print job from AVD clients to Dell Wyse thin client. | Print job spooled from AVD but not reaching Dell Wyse device. | Update Dell Wyse firmware and client version to latest. | 🔵 6.5 | KB |
| 7 | When installing language packs for Windows 10 multi-session AVD images, certain ... | The FoD cab packages listed in Microsoft documentation are not included in the s... | Download the missing FoD packages separately from the Features on Demand ISO (no... | 🔵 6.0 | OneNote |
