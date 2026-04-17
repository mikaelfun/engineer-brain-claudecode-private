# AVD AVD Intune 管理 - Quick Reference

**Entries**: 5 | **21V**: partial
**Keywords**: context-based-redirection, custom-script-extension, drive-redirection, hotfix-pending, intune, known-limitation, local-admin, onedrive
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | User Settings local admin policy not applied - user is not local admin on Cloud ... | CustomScriptExtension failed to download or execute the local admin PS1 script. ... | 1) Check C:\Packages\Plugins\Microsoft.Compute.CustomScriptExtension\1.10.15\Run... | 🔵 7.5 | ADO Wiki |
| 2 | Drive redirection cannot be disabled when using Context Based Redirection authen... | Known product limitation - drive redirection is not yet controllable via authent... | Wait for hotfix from product team. As a workaround, use other methods (e.g., Int... | 🔵 7.5 | ADO Wiki |
| 3 | The Office Apps were not deploying from the Intune Portal. | The Co-Management configuration was not referencing Intune for the App Package d... | The SCCM co-management setting was directed to the Intune portal for Office appl... | 🔵 6.5 | KB |
| 4 | There were no group policy or Intune policies were blocking the Audio redirectio... | We noticed below service was disabled by image hardening.          UmRdpService&... | Enabled &amp; started service:&nbsp;Remote Desktop Services UserMode Port Redire... | 🔵 6.5 | KB |
| 5 | SharePoint site auto-sync configured via Intune policy takes 8+ hours to appear ... | OneDrive sync timing behavior (not a Windows 365 issue) - the Timerautomount reg... | Set registry key HKCU\Software\Microsoft\OneDrive\Accounts\Business1\Timerautomo... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: CustomScriptExtension failed to download or execut `[Source: ADO Wiki]`
2. Check: Known product limitation - drive redirection is no `[Source: ADO Wiki]`
3. Check: The Co-Management configuration was not referencin `[Source: KB]`
4. Check: We noticed below service was disabled by image har `[Source: KB]`
5. Check: OneDrive sync timing behavior (not a Windows 365 i `[Source: ADO Wiki]`
