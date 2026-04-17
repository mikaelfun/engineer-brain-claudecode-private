# AVD AVD MSIX App Attach - deprecated-fixed - Quick Reference

**Entries**: 3 | **21V**: all applicable
**Keywords**: bsod, cimfs, crash, deprecated-fixed, deregistration, image-format, msix-app-attach, multi-session
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | MSIX App Attach: after user logs off a Full Desktop session while also having a ... | Logging off the Full Desktop session triggers a deregistration of MSIX packages,... | Log off all user sessions from the AVD portal after logging off the Full Desktop... | 🔵 7.0 | ADO Wiki |
| 2 | x64 MSIX App Attach packages expanded to CIM image fail to open from start menu ... | CIMFs driver bug affecting x64 MSIX packages when using CIM image format for App... | Deploy MSIX packages as VHD(x) image instead of CIM format. Issue was fixed in W... | 🔵 7.0 | ADO Wiki |
| 3 | Session host crashes with BSOD when mounting certain MSIX App Attach packages in... | Bug in CIMFs driver causing crash during MSIX CIM image mounting | Issue was fixed by CIMfs team and backported. Update session host OS to latest p... | 🔵 7.0 | ADO Wiki |

## Quick Triage Path

1. Check: Logging off the Full Desktop session triggers a de `[Source: ADO Wiki]`
2. Check: CIMFs driver bug affecting x64 MSIX packages when `[Source: ADO Wiki]`
3. Check: Bug in CIMFs driver causing crash during MSIX CIM `[Source: ADO Wiki]`
