# AVD AVD MSIX App Attach - deprecated-fixed - Quick Reference

**Entries**: 5 | **21V**: all applicable
**Keywords**: application-group, appxmanifest, bsod, cimfs, crash, deprecated-fixed, deregistration, image-format, intermittent, msix-app-attach, multi-entry-point, multi-session, register, remote-app, vhdx
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | MSIX App Attach: after user logs off a Full Desktop session while also having a ... | Logging off the Full Desktop session triggers a deregistration of MSIX packages,... | Log off all user sessions from the AVD portal after logging off the Full Desktop... | 🔵 7.0 | ADO Wiki |
| 2 📋 | x64 MSIX App Attach packages expanded to CIM image fail to open from start menu ... | CIMFs driver bug affecting x64 MSIX packages when using CIM image format for App... | Deploy MSIX packages as VHD(x) image instead of CIM format. Issue was fixed in W... | 🔵 7.0 | ADO Wiki |
| 3 📋 | Session host crashes with BSOD when mounting certain MSIX App Attach packages in... | Bug in CIMFs driver causing crash during MSIX CIM image mounting | Issue was fixed by CIMfs team and backported. Update session host OS to latest p... | 🔵 7.0 | ADO Wiki |
| 4 📋 | MSIX App Attach packages with multiple entry points launch the wrong executable ... | UI publishing flow bug where all entry points in a multi-entry-point MSIX packag... | Issue was fixed in AVD service update (circa June 2021). Upgrade to latest AVD a... | 🔵 7.0 | ADO Wiki |
| 5 📋 | MSIX App Attach packages intermittently fail to register when user has multiple ... | Registration race condition when multiple MSIX packages across different applica... | Issue was fixed in AVD service update (completed 2021). Ensure session hosts are... | 🔵 7.0 | ADO Wiki |

## Quick Triage Path

1. Check: Logging off the Full Desktop session triggers a deregistrati... `[Source: ADO Wiki]`
2. Check: CIMFs driver bug affecting x64 MSIX packages when using CIM ... `[Source: ADO Wiki]`
3. Check: Bug in CIMFs driver causing crash during MSIX CIM image moun... `[Source: ADO Wiki]`
4. Check: UI publishing flow bug where all entry points in a multi-ent... `[Source: ADO Wiki]`
5. Check: Registration race condition when multiple MSIX packages acro... `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-msix-appattach-deprecated-fixed.md#troubleshooting-flow)