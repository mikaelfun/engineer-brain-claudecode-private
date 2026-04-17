# AVD W365 通用管理 - Quick Reference

**Entries**: 10 | **21V**: partial
**Keywords**: 401, 403, admin-highlights, asr, automatic-cleanup, cleanup-not-running, cloudpc.readwrite.all, configuration
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Windows 365 Power Platform connector action or trigger fails with HTTP 401 Unaut... | User not properly authenticated, authentication token expired, or invalid creden... | 1. Verify user is signed in with valid credentials. 2. Refresh authentication to... | 🔵 7.5 | ADO Wiki |
| 2 | Windows 365 Power Platform connector action fails with HTTP 403 Forbidden - acce... | User lacks CloudPC.ReadWrite.All permission or has insufficient role assignments... | 1. Verify user's Entra ID role assignments. 2. Check CloudPC.ReadWrite.All permi... | 🔵 7.5 | ADO Wiki |
| 3 | Windows 365 Power Platform connector trigger fails with HTTP 403 Forbidden - acc... | User lacks Microsoft.CloudPC/Webhooks/Create and Microsoft.CloudPC/Webhooks/Dele... | 1. Verify user's role and permissions. 2. For Global Admin/Cloud PC Admin: permi... | 🔵 7.5 | ADO Wiki |
| 4 | HTTP 403 Forbidden when executing Windows 365 Power Platform connector actions | User lacks CloudPC.ReadWrite.All permission or insufficient role assignments | 1) Verify Azure AD/Entra ID role assignments. 2) Check CloudPC.ReadWrite.All per... | 🔵 7.5 | ADO Wiki |
| 5 | HTTP 403 Forbidden error when executing Windows 365 Power Platform connector act... | User lacks CloudPC.ReadWrite.All permission or has insufficient role assignments... | 1) Verify user Azure AD/Entra ID role assignments. 2) Check CloudPC.ReadWrite.Al... | 🔵 7.5 | ADO Wiki |
| 6 | UES Automatic Cleanup - customer reports missing user storage/profile data after... | Cleanup ran on unattached storage that exceeded the configured inactivity thresh... | 1) Confirm cleanup is enabled on the policy. 2) Verify inactivity threshold and ... | 🔵 7.5 | ADO Wiki |
| 7 | UES Automatic Cleanup not occurring when expected - unattached storage not being... | Cleanup toggle may be disabled, storage may still be attached, conditional 'only... | 1) Verify cleanup toggle is enabled in policy. 2) Confirm storage is unattached.... | 🔵 7.5 | ADO Wiki |
| 8 | Specific subcategory not showing data in Windows 365 Admin Highlights/Insights | Subcategory not enabled in EnabledHighlightSubcategories configuration, subcateg... | Check if subcategory is in EnabledHighlightSubcategories config. Verify subcateg... | 🔵 7.0 | ADO Wiki |
| 9 | W365 app displays custom connection monitor UI error or status messages to the e... | W365 app has its own custom connection monitor UI messages separate from standar... | CPC engineer should create an incident with CPC PG to investigate. If CPC determ... | 🔵 7.0 | ADO Wiki |
| 10 | Cloud PC stuck in endless reboot loop with 'DSC is restarting...' dialog. Event ... | InstallLanguage.ps1 DSC script caught in reboot loop caused by customer ASR (Att... | For new machines: switch ASR policies to Audit mode. For existing machines: logi... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: User not properly authenticated, authentication to `[Source: ADO Wiki]`
2. Check: User lacks CloudPC.ReadWrite.All permission or has `[Source: ADO Wiki]`
3. Check: User lacks Microsoft.CloudPC/Webhooks/Create and M `[Source: ADO Wiki]`
4. Check: User lacks CloudPC.ReadWrite.All permission or ins `[Source: ADO Wiki]`
5. Check: Cleanup ran on unattached storage that exceeded th `[Source: ADO Wiki]`
