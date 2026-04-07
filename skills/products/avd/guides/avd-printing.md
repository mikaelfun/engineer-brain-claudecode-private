# AVD AVD 打印重定向 - Quick Reference

**Entries**: 7 | **21V**: all applicable
**Keywords**: custom-image, default-device, dell-wyse, device-redirection, epic, feature-limitation, feature-on-demand, firmware
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Customer requests ability to selectively enable or disable RAW printing for spec... | Feature limitation: SmartRawPrinters RDP property does not support targeting ind... | Inform customer that RAW printing is a global toggle only. Options: (1) SmartRaw... | 🔵 7.5 | ADO Wiki |
| 2 📋 | Multiple TWAIN scanners attached to client endpoint; wrong or no scanner selecte... | No default TWAIN scanner configured on client device | Set default TWAIN scanner via client-side registry: `reg add "HKEY_LOCAL_MACHINE... | 🔵 7.5 | ADO Wiki |
| 3 📋 | TWAIN scanner redirection not working with high-level redirection in AVD | High-level TWAIN scanner redirections are incompatible with scanner redirections... | Use low-level USB redirection on Windows Clients (latency may be an issue). Alte... | 🔵 7.0 | ADO Wiki |
| 4 📋 | RAW printing not working or experiencing issues with RAW printing redirection in... | - | No additional troubleshooting specific to RAW printing is needed. Follow the sam... | 🔵 7.0 | ADO Wiki |
| 5 📋 | TWAIN scanner not working or not detected in AVD/W365 remote session | WIA (Windows Image Acquisition) driver selected instead of TWAIN driver, or scan... | 1. First validate scanner works E2E on local client using free TWAIN software (e... | 🔵 7.0 | ADO Wiki |
| 6 📋 | Fails to get the print job from AVD clients to Dell Wyse thin client. | Print job spooled from AVD but not reaching Dell Wyse device. | Update Dell Wyse firmware and client version to latest. | 🔵 6.5 | KB |
| 7 📋 | When installing language packs for Windows 10 multi-session AVD images, certain ... | The FoD cab packages listed in Microsoft documentation are not included in the s... | Download the missing FoD packages separately from the Features on Demand ISO (no... | 🔵 6.0 | OneNote |

## Quick Triage Path

1. Check: Feature limitation: SmartRawPrinters RDP property `[Source: ADO Wiki]`
2. Check: No default TWAIN scanner configured on client devi `[Source: ADO Wiki]`
3. Check: High-level TWAIN scanner redirections are incompat `[Source: ADO Wiki]`
4. Check: Unknown `[Source: ADO Wiki]`
5. Check: WIA (Windows Image Acquisition) driver selected in `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-printing.md#troubleshooting-flow)
