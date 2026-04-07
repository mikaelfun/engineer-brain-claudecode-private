# AVD W365 通用管理 - Issue Details

**Entries**: 10 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. Windows 365 Power Platform connector action or trigger fails with HTTP 401 Unauthorized
- **ID**: `avd-ado-wiki-242`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: User not properly authenticated, authentication token expired, or invalid credentials/connection for the Windows 365 connector
- **Solution**: 1. Verify user is signed in with valid credentials. 2. Refresh authentication token or re-authenticate. 3. Re-establish the connector connection. 4. Ensure connection uses the correct identity/account
- **Tags**: w365, power-platform, connector, 401, unauthorized

### 2. Windows 365 Power Platform connector action fails with HTTP 403 Forbidden - access denied executing ...
- **ID**: `avd-ado-wiki-243`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: User lacks CloudPC.ReadWrite.All permission or has insufficient role assignments in Azure AD/Entra ID
- **Solution**: 1. Verify user's Entra ID role assignments. 2. Check CloudPC.ReadWrite.All permission: Azure Portal → Enterprise Applications → Windows 365 → API Permissions. 3. Assign Global Administrator, Cloud PC Administrator, or custom role with CloudPC.ReadWrite.All. 4. Allow up to 15 minutes for permission propagation
- **Tags**: w365, power-platform, connector, 403, permissions, CloudPC.ReadWrite.All

### 3. Windows 365 Power Platform connector trigger fails with HTTP 403 Forbidden - access denied configuri...
- **ID**: `avd-ado-wiki-244`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: User lacks Microsoft.CloudPC/Webhooks/Create and Microsoft.CloudPC/Webhooks/Delete permissions; custom role missing webhook permissions
- **Solution**: 1. Verify user's role and permissions. 2. For Global Admin/Cloud PC Admin: permissions should be default - verify role is active and not expired. 3. For custom roles: review role definition, ensure Microsoft.CloudPC/Webhooks/Create and Webhooks/Delete are included. 4. Allow up to 15 minutes for permission propagation
- **Tags**: w365, power-platform, connector, 403, triggers, webhook-permissions

### 4. HTTP 403 Forbidden when executing Windows 365 Power Platform connector actions
- **ID**: `avd-ado-wiki-247`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: User lacks CloudPC.ReadWrite.All permission or insufficient role assignments
- **Solution**: 1) Verify Azure AD/Entra ID role assignments. 2) Check CloudPC.ReadWrite.All permission via Azure Portal > Enterprise Applications > Windows 365. 3) Assign Global Admin, Cloud PC Admin, or custom role with CloudPC.ReadWrite.All. 4) Wait up to 15 min for propagation.
- **Tags**: power-platform, connector, permissions, http-403, w365

### 5. HTTP 403 Forbidden error when executing Windows 365 Power Platform connector actions - access denied...
- **ID**: `avd-ado-wiki-254`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: User lacks CloudPC.ReadWrite.All permission or has insufficient role assignments in Azure AD/Entra ID
- **Solution**: 1) Verify user Azure AD/Entra ID role assignments. 2) Check CloudPC.ReadWrite.All permission via Azure Portal > Enterprise Applications > Windows 365 > API Permissions. 3) Assign Global Administrator, Cloud PC Administrator, or custom role with CloudPC.ReadWrite.All. 4) Allow up to 15 minutes for permission propagation.
- **Tags**: w365, power-platform, connector, HTTP-403, permissions, CloudPC.ReadWrite.All

### 6. UES Automatic Cleanup - customer reports missing user storage/profile data after cleanup ran unexpec...
- **ID**: `avd-ado-wiki-278`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Cleanup ran on unattached storage that exceeded the configured inactivity threshold (days), or forced deletion triggered after storage quota exceeded for prolonged period
- **Solution**: 1) Confirm cleanup is enabled on the policy. 2) Verify inactivity threshold and conditional flags. 3) Check if storage was unattached longer than configured threshold. 4) Validate whether forced deletion occurred due to prolonged exceeded usage. 5) Confirm customer acknowledged permanent deletion behavior. Note: cleanup runs every 24 hours, only deletes unattached storage.
- **Tags**: ues, automatic-cleanup, storage-deletion, profile-loss, windows-365

### 7. UES Automatic Cleanup not occurring when expected - unattached storage not being cleaned up despite ...
- **ID**: `avd-ado-wiki-279`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Cleanup toggle may be disabled, storage may still be attached, conditional 'only when exceeded' flag blocking cleanup, or policy storage not being evaluated daily
- **Solution**: 1) Verify cleanup toggle is enabled in policy. 2) Confirm storage is unattached. 3) Validate whether conditional 'only when exceeded' flag is blocking cleanup. 4) Confirm policy storage is being evaluated daily.
- **Tags**: ues, automatic-cleanup, cleanup-not-running, policy-config, windows-365

### 8. Specific subcategory not showing data in Windows 365 Admin Highlights/Insights
- **ID**: `avd-ado-wiki-233`
- **Source**: ADO Wiki | **Score**: 🔵 7.0
- **Root Cause**: Subcategory not enabled in EnabledHighlightSubcategories configuration, subcategory mapping missing in code, or DFE report not configured for the subcategory
- **Solution**: Check if subcategory is in EnabledHighlightSubcategories config. Verify subcategory mapping exists in code. Check DFE report availability for that subcategory. Also check if permission check is failing for the specific subcategory.
- **Tags**: admin-highlights, subcategory, configuration, DFE, w365

### 9. W365 app displays custom connection monitor UI error or status messages to the end user
- **ID**: `avd-ado-wiki-0841`
- **Source**: ADO Wiki | **Score**: 🔵 7.0
- **Root Cause**: W365 app has its own custom connection monitor UI messages separate from standard AVD. AVD sends connection status to CPC, which W365 app then takes and displays using its own UI layer
- **Solution**: CPC engineer should create an incident with CPC PG to investigate. If CPC determines it is not a CPC issue, transfer the incident to AVD PG
- **Tags**: w365, connection-monitor, cpc-escalation

### 10. Cloud PC stuck in endless reboot loop with 'DSC is restarting...' dialog. Event 1074 shows DSC-initi...
- **ID**: `avd-ado-wiki-a-r14-006`
- **Source**: ADO Wiki | **Score**: 🔵 6.0
- **Root Cause**: InstallLanguage.ps1 DSC script caught in reboot loop caused by customer ASR (Attack Surface Reduction) policies blocking DISM execution.
- **Solution**: For new machines: switch ASR policies to Audit mode. For existing machines: login during ~5 min window between reboots and run: Remove-DSCConfiguration -Stage Pending,Current,Previous -Verbose. Bug: https://microsoft.visualstudio.com/OS/_workitems/edit/44514277
- **Tags**: dsc, reboot-loop, asr, dism, w365
