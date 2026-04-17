# Purview 跨云 / 跨租户 MIP 标签 -- Quick Reference

**Entries**: 5 | **21V**: partial | **Confidence**: high
**Last updated**: 2026-04-07

## Symptom Lookup
| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Cross-cloud MIP label decryption fails - bearer token missing verified_primary_email claim | Account in home tenant has no valid email address (no proxyAddress). Without ver... | Ensure user account in home tenant has valid email set as proxyAddress. Verify access token contains... | 🔵 7.5 | MCVKB/21.4 [MIP] _ Cross-Cloud Label.md |
| 2 📋 | Cross-cloud encrypted file fails to open on some devices - works on newer Office but not older build... | Office versions before 2402 use MSIPC (legacy RMS engine) which may not handle c... | Check HTTP headers to determine MSIPC vs MIP SDK. Check HKCU\Software\Microsoft\Office\16.0\Common\D... | 🔵 7.5 | MCVKB/21.4 [MIP] _ Cross-Cloud Label.md |
| 3 📋 | Cross-tenant MIP label access fails - no access token for aadrm.com, Entra cross-tenant outbound set... | Entra ID cross-tenant access settings block outbound to Azure RMS resource (AppI... | Configure Entra ID cross-tenant access settings: add outbound access rule allowing Azure Rights Mana... | 🔵 7.5 | MCVKB/21.4 [MIP] _ Cross-Cloud Label.md |
| 4 📋 | Cross-cloud labeling (Purview) only supports offline Word/Excel/PowerPoint files - email (all Outloo... | Cross-cloud labeling is in Public Preview with limited scope. Email messages are... | Only offline encrypted Word, Excel, PowerPoint files are supported. Prerequisites: 1) Bidirectional ... | 🔵 7.5 | MCVKB/cross-cloud labeling.md |
| 5 📋 | External user with Entra ID guest account gets error 'selected user account does not exist in the te... | MIP Viewer may not properly authenticate external guest user. Requires Adobe Acr... | 1) Install Adobe Acrobat DC with MIP extension. 2) When error appears, select Back to continue openi... | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/sensitivity-labels/known-issues-ip-client) |

## Quick Troubleshooting Path

1. Ensure user account in home tenant has valid email set as proxyAddress. Verify access token contains verified_primary_email claim. Account must be ema... `[source: onenote]`
2. Check HTTP headers to determine MSIPC vs MIP SDK. Check HKCU\Software\Microsoft\Office\16.0\Common\DRM -> PreferredRmsPackage (1=MSIPC, 2=MIPSDK). Cle... `[source: onenote]`
3. Configure Entra ID cross-tenant access settings: add outbound access rule allowing Azure Rights Management Services (AppId: 00000012-0000-0000-c000-00... `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Full troubleshooting workflow](details/cross-cloud-mip.md#troubleshooting-workflow)