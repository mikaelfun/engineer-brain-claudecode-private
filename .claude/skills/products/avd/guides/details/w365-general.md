# AVD W365 通用管理 - Comprehensive Troubleshooting Guide

**Entries**: 12 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Windows 365 Power Platform connector action or trigger fails with HTTP... | User not properly authenticated, authentication token expired, or inva... | 1. Verify user is signed in with valid credentials. 2. Refresh authent... |
| Windows 365 Power Platform connector action fails with HTTP 403 Forbid... | User lacks CloudPC.ReadWrite.All permission or has insufficient role a... | 1. Verify user's Entra ID role assignments. 2. Check CloudPC.ReadWrite... |
| Windows 365 Power Platform connector trigger fails with HTTP 403 Forbi... | User lacks Microsoft.CloudPC/Webhooks/Create and Microsoft.CloudPC/Web... | 1. Verify user's role and permissions. 2. For Global Admin/Cloud PC Ad... |
| HTTP 403 Forbidden when executing Windows 365 Power Platform connector... | User lacks CloudPC.ReadWrite.All permission or insufficient role assig... | 1) Verify Azure AD/Entra ID role assignments. 2) Check CloudPC.ReadWri... |
| HTTP 403 Forbidden error when executing Windows 365 Power Platform con... | User lacks CloudPC.ReadWrite.All permission or has insufficient role a... | 1) Verify user Azure AD/Entra ID role assignments. 2) Check CloudPC.Re... |
| UES Automatic Cleanup - customer reports missing user storage/profile ... | Cleanup ran on unattached storage that exceeded the configured inactiv... | 1) Confirm cleanup is enabled on the policy. 2) Verify inactivity thre... |
| UES Automatic Cleanup not occurring when expected - unattached storage... | Cleanup toggle may be disabled, storage may still be attached, conditi... | 1) Verify cleanup toggle is enabled in policy. 2) Confirm storage is u... |
| Windows 365 or AVD user cannot sign in - authentication failure during... | Authentication flow involves multiple Azure AD enterprise apps (differ... | Collect HAR traces (Chrome F12 or Fiddler). Find correlation ID from l... |
| Specific subcategory not showing data in Windows 365 Admin Highlights/... | Subcategory not enabled in EnabledHighlightSubcategories configuration... | Check if subcategory is in EnabledHighlightSubcategories config. Verif... |
| W365 app displays custom connection monitor UI error or status message... | W365 app has its own custom connection monitor UI messages separate fr... | CPC engineer should create an incident with CPC PG to investigate. If ... |
| W365 Cloud PC session connects to wrong feed URL (e.g., subscribes to ... | CPC app incorrectly constructs the .avd file URI, causing msrdcw.exe t... | Create an incident with CPC PG to investigate the URI construction iss... |
| Cloud PC stuck in endless reboot loop with 'DSC is restarting...' dial... | InstallLanguage.ps1 DSC script caught in reboot loop caused by custome... | For new machines: switch ASR policies to Audit mode. For existing mach... |

### Phase 2: Detailed Investigation

#### Entry 1: Windows 365 Power Platform connector action or trigger fails...
> Source: ADO Wiki | ID: avd-ado-wiki-242 | Score: 8.0

**Symptom**: Windows 365 Power Platform connector action or trigger fails with HTTP 401 Unauthorized

**Root Cause**: User not properly authenticated, authentication token expired, or invalid credentials/connection for the Windows 365 connector

**Solution**: 1. Verify user is signed in with valid credentials. 2. Refresh authentication token or re-authenticate. 3. Re-establish the connector connection. 4. Ensure connection uses the correct identity/account

> 21V Mooncake: Applicable

#### Entry 2: Windows 365 Power Platform connector action fails with HTTP ...
> Source: ADO Wiki | ID: avd-ado-wiki-243 | Score: 8.0

**Symptom**: Windows 365 Power Platform connector action fails with HTTP 403 Forbidden - access denied executing connector actions

**Root Cause**: User lacks CloudPC.ReadWrite.All permission or has insufficient role assignments in Azure AD/Entra ID

**Solution**: 1. Verify user's Entra ID role assignments. 2. Check CloudPC.ReadWrite.All permission: Azure Portal → Enterprise Applications → Windows 365 → API Permissions. 3. Assign Global Administrator, Cloud PC Administrator, or custom role with CloudPC.ReadWrite.All. 4. Allow up to 15 minutes for permission propagation

> 21V Mooncake: Applicable

#### Entry 3: Windows 365 Power Platform connector trigger fails with HTTP...
> Source: ADO Wiki | ID: avd-ado-wiki-244 | Score: 8.0

**Symptom**: Windows 365 Power Platform connector trigger fails with HTTP 403 Forbidden - access denied configuring or using triggers

**Root Cause**: User lacks Microsoft.CloudPC/Webhooks/Create and Microsoft.CloudPC/Webhooks/Delete permissions; custom role missing webhook permissions

**Solution**: 1. Verify user's role and permissions. 2. For Global Admin/Cloud PC Admin: permissions should be default - verify role is active and not expired. 3. For custom roles: review role definition, ensure Microsoft.CloudPC/Webhooks/Create and Webhooks/Delete are included. 4. Allow up to 15 minutes for permission propagation

> 21V Mooncake: Applicable

#### Entry 4: HTTP 403 Forbidden when executing Windows 365 Power Platform...
> Source: ADO Wiki | ID: avd-ado-wiki-247 | Score: 8.0

**Symptom**: HTTP 403 Forbidden when executing Windows 365 Power Platform connector actions

**Root Cause**: User lacks CloudPC.ReadWrite.All permission or insufficient role assignments

**Solution**: 1) Verify Azure AD/Entra ID role assignments. 2) Check CloudPC.ReadWrite.All permission via Azure Portal > Enterprise Applications > Windows 365. 3) Assign Global Admin, Cloud PC Admin, or custom role with CloudPC.ReadWrite.All. 4) Wait up to 15 min for propagation.

> 21V Mooncake: Applicable

#### Entry 5: HTTP 403 Forbidden error when executing Windows 365 Power Pl...
> Source: ADO Wiki | ID: avd-ado-wiki-254 | Score: 8.0

**Symptom**: HTTP 403 Forbidden error when executing Windows 365 Power Platform connector actions - access denied on CloudPC operations

**Root Cause**: User lacks CloudPC.ReadWrite.All permission or has insufficient role assignments in Azure AD/Entra ID

**Solution**: 1) Verify user Azure AD/Entra ID role assignments. 2) Check CloudPC.ReadWrite.All permission via Azure Portal > Enterprise Applications > Windows 365 > API Permissions. 3) Assign Global Administrator, Cloud PC Administrator, or custom role with CloudPC.ReadWrite.All. 4) Allow up to 15 minutes for permission propagation.

> 21V Mooncake: Applicable

#### Entry 6: UES Automatic Cleanup - customer reports missing user storag...
> Source: ADO Wiki | ID: avd-ado-wiki-278 | Score: 8.0

**Symptom**: UES Automatic Cleanup - customer reports missing user storage/profile data after cleanup ran unexpectedly

**Root Cause**: Cleanup ran on unattached storage that exceeded the configured inactivity threshold (days), or forced deletion triggered after storage quota exceeded for prolonged period

**Solution**: 1) Confirm cleanup is enabled on the policy. 2) Verify inactivity threshold and conditional flags. 3) Check if storage was unattached longer than configured threshold. 4) Validate whether forced deletion occurred due to prolonged exceeded usage. 5) Confirm customer acknowledged permanent deletion behavior. Note: cleanup runs every 24 hours, only deletes unattached storage.

> 21V Mooncake: Applicable

#### Entry 7: UES Automatic Cleanup not occurring when expected - unattach...
> Source: ADO Wiki | ID: avd-ado-wiki-279 | Score: 8.0

**Symptom**: UES Automatic Cleanup not occurring when expected - unattached storage not being cleaned up despite cleanup being enabled

**Root Cause**: Cleanup toggle may be disabled, storage may still be attached, conditional 'only when exceeded' flag blocking cleanup, or policy storage not being evaluated daily

**Solution**: 1) Verify cleanup toggle is enabled in policy. 2) Confirm storage is unattached. 3) Validate whether conditional 'only when exceeded' flag is blocking cleanup. 4) Confirm policy storage is being evaluated daily.

> 21V Mooncake: Applicable

#### Entry 8: Windows 365 or AVD user cannot sign in - authentication fail...
> Source: ADO Wiki | ID: avd-ado-wiki-320 | Score: 8.0

**Symptom**: Windows 365 or AVD user cannot sign in - authentication failure during Cloud PC connection

**Root Cause**: Authentication flow involves multiple Azure AD enterprise apps (different AppIDs for Web Client vs Windows Client vs RD Client). Failure can occur at any stage.

**Solution**: Collect HAR traces (Chrome F12 or Fiddler). Find correlation ID from login.microsoftonline.com/common/oauth2/v2.0/token request. Look up in ASC Tenant Explorer. Key AppIDs: Web=3b511579, WinClient=c76612c2, RDClient=a85cf173, VM Sign-in=372140e0.

> 21V Mooncake: Applicable

#### Entry 9: Specific subcategory not showing data in Windows 365 Admin H...
> Source: ADO Wiki | ID: avd-ado-wiki-233 | Score: 7.0

**Symptom**: Specific subcategory not showing data in Windows 365 Admin Highlights/Insights

**Root Cause**: Subcategory not enabled in EnabledHighlightSubcategories configuration, subcategory mapping missing in code, or DFE report not configured for the subcategory

**Solution**: Check if subcategory is in EnabledHighlightSubcategories config. Verify subcategory mapping exists in code. Check DFE report availability for that subcategory. Also check if permission check is failing for the specific subcategory.

> 21V Mooncake: Applicable

#### Entry 10: W365 app displays custom connection monitor UI error or stat...
> Source: ADO Wiki | ID: avd-ado-wiki-0841 | Score: 7.0

**Symptom**: W365 app displays custom connection monitor UI error or status messages to the end user

**Root Cause**: W365 app has its own custom connection monitor UI messages separate from standard AVD. AVD sends connection status to CPC, which W365 app then takes and displays using its own UI layer

**Solution**: CPC engineer should create an incident with CPC PG to investigate. If CPC determines it is not a CPC issue, transfer the incident to AVD PG

> 21V Mooncake: Applicable

#### Entry 11: W365 Cloud PC session connects to wrong feed URL (e.g., subs...
> Source: ADO Wiki | ID: avd-ado-wiki-0842 | Score: 7.0

**Symptom**: W365 Cloud PC session connects to wrong feed URL (e.g., subscribes to PROD feed instead of GOV feed)

**Root Cause**: CPC app incorrectly constructs the .avd file URI, causing msrdcw.exe to subscribe to the wrong feed URL. AVD host app uses .avd file launch mechanism (similar to URI launcher) and depends on CPC correctly constructing the URI

**Solution**: Create an incident with CPC PG to investigate the URI construction issue. If CPC confirms it is not their issue, transfer to AVD PG

> 21V Mooncake: Applicable

#### Entry 12: Cloud PC stuck in endless reboot loop with 'DSC is restartin...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r14-006 | Score: 6.0

**Symptom**: Cloud PC stuck in endless reboot loop with 'DSC is restarting...' dialog. Event 1074 shows DSC-initiated restart (Reason Code 0x80040001). Get-DscConfigurationStatus shows reboot pending.

**Root Cause**: InstallLanguage.ps1 DSC script caught in reboot loop caused by customer ASR (Attack Surface Reduction) policies blocking DISM execution.

**Solution**: For new machines: switch ASR policies to Audit mode. For existing machines: login during ~5 min window between reboots and run: Remove-DSCConfiguration -Stage Pending,Current,Previous -Verbose. Bug: https://microsoft.visualstudio.com/OS/_workitems/edit/44514277

> 21V Mooncake: Not verified

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
