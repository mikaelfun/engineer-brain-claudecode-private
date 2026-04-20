# W365 通用管理 — Troubleshooting Workflow

**Scenario Count**: 12
**Generated**: 2026-04-18

---

## Scenario 1: Windows 365 Power Platform connector action or trigger fails...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1
- Verify user is signed in with valid credentials
- 2
- Refresh authentication token or re-authenticate
- 3
- Re-establish the connector connection
- 4
- Ensure connection uses the correct identity/account

**Root Cause**: User not properly authenticated, authentication token expired, or invalid credentials/connection for the Windows 365 connector

## Scenario 2: Windows 365 Power Platform connector action fails with HTTP ...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1
- Verify user's Entra ID role assignments
- 2
- Check CloudPC.ReadWrite.All permission: Azure Portal → Enterprise Applications → Windows 365 → API Permissions
- 3
- Assign Global Administrator, Cloud PC Administrator, or custom role with CloudPC.ReadWrite.All
- 4
- Allow up to 15 minutes for permission propagation

**Root Cause**: User lacks CloudPC.ReadWrite.All permission or has insufficient role assignments in Azure AD/Entra ID

## Scenario 3: Windows 365 Power Platform connector trigger fails with HTTP...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1
- Verify user's role and permissions
- 2
- For Global Admin/Cloud PC Admin: permissions should be default - verify role is active and not expired
- 3
- For custom roles: review role definition, ensure Microsoft.CloudPC/Webhooks/Create and Webhooks/Delete are included
- 4
- Allow up to 15 minutes for permission propagation

**Root Cause**: User lacks Microsoft.CloudPC/Webhooks/Create and Microsoft.CloudPC/Webhooks/Delete permissions; custom role missing webhook permissions

## Scenario 4: HTTP 403 Forbidden when executing Windows 365 Power Platform...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Verify Azure AD/Entra ID role assignments
- 2) Check CloudPC.ReadWrite.All permission via Azure Portal > Enterprise Applications > Windows 365
- 3) Assign Global Admin, Cloud PC Admin, or custom role with CloudPC.ReadWrite.All
- 4) Wait up to 15 min for propagation.

**Root Cause**: User lacks CloudPC.ReadWrite.All permission or insufficient role assignments

## Scenario 5: HTTP 403 Forbidden error when executing Windows 365 Power Pl...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Verify user Azure AD/Entra ID role assignments
- 2) Check CloudPC.ReadWrite.All permission via Azure Portal > Enterprise Applications > Windows 365 > API Permissions
- 3) Assign Global Administrator, Cloud PC Administrator, or custom role with CloudPC.ReadWrite.All
- 4) Allow up to 15 minutes for permission propagation.

**Root Cause**: User lacks CloudPC.ReadWrite.All permission or has insufficient role assignments in Azure AD/Entra ID

## Scenario 6: UES Automatic Cleanup - customer reports missing user storag...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Confirm cleanup is enabled on the policy
- 2) Verify inactivity threshold and conditional flags
- 3) Check if storage was unattached longer than configured threshold
- 4) Validate whether forced deletion occurred due to prolonged exceeded usage
- 5) Confirm customer acknowledged permanent deletion behavior
- Note: cleanup runs every 24 hours, only deletes unattached storage.

**Root Cause**: Cleanup ran on unattached storage that exceeded the configured inactivity threshold (days), or forced deletion triggered after storage quota exceeded for prolonged period

## Scenario 7: UES Automatic Cleanup not occurring when expected - unattach...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Verify cleanup toggle is enabled in policy
- 2) Confirm storage is unattached
- 3) Validate whether conditional 'only when exceeded' flag is blocking cleanup
- 4) Confirm policy storage is being evaluated daily.

**Root Cause**: Cleanup toggle may be disabled, storage may still be attached, conditional 'only when exceeded' flag blocking cleanup, or policy storage not being evaluated daily

## Scenario 8: Windows 365 or AVD user cannot sign in - authentication fail...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Collect HAR traces (Chrome F12 or Fiddler). Find correlation ID from login.microsoftonline.com/common/oauth2/v2.0/token request. Look up in ASC Tenant Explorer. Key AppIDs: Web=3b511579, WinClient=c76612c2, RDClient=a85cf173, VM Sign-in=372140e0.

**Root Cause**: Authentication flow involves multiple Azure AD enterprise apps (different AppIDs for Web Client vs Windows Client vs RD Client). Failure can occur at any stage.

## Scenario 9: Specific subcategory not showing data in Windows 365 Admin H...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Check if subcategory is in EnabledHighlightSubcategories config. Verify subcategory mapping exists in code. Check DFE report availability for that subcategory. Also check if permission check is failing for the specific subcategory.

**Root Cause**: Subcategory not enabled in EnabledHighlightSubcategories configuration, subcategory mapping missing in code, or DFE report not configured for the subcategory

## Scenario 10: W365 app displays custom connection monitor UI error or stat...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- CPC engineer should create an incident with CPC PG to investigate. If CPC determines it is not a CPC issue, transfer the incident to AVD PG

**Root Cause**: W365 app has its own custom connection monitor UI messages separate from standard AVD. AVD sends connection status to CPC, which W365 app then takes and displays using its own UI layer

## Scenario 11: W365 Cloud PC session connects to wrong feed URL (e.g., subs...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Create an incident with CPC PG to investigate the URI construction issue. If CPC confirms it is not their issue, transfer to AVD PG

**Root Cause**: CPC app incorrectly constructs the .avd file URI, causing msrdcw.exe to subscribe to the wrong feed URL. AVD host app uses .avd file launch mechanism (similar to URI launcher) and depends on CPC correctly constructing the URI

## Scenario 12: Cloud PC stuck in endless reboot loop with 'DSC is restartin...
> Source: ADO Wiki | Applicable: ❓

### Troubleshooting Steps
- For new machines: switch ASR policies to Audit mode. For existing machines: login during ~5 min window between reboots and run: Remove-DSCConfiguration -Stage Pending,Current,Previous -Verbose. Bug: https://microsoft.visualstudio.com/OS/_workitems/edit/44514277

**Root Cause**: InstallLanguage.ps1 DSC script caught in reboot loop caused by customer ASR (Attack Surface Reduction) policies blocking DISM execution.
