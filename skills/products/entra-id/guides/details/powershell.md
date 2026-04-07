# ENTRA-ID PowerShell Management — Detailed Troubleshooting Guide

**Entries**: 52 | **Drafts fused**: 8 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-aad-roles-csv-export-powershell.md, ado-wiki-c-applications-experience-powershell-mg-graph-examples.md, ado-wiki-c-repadmin-powershell-forest-replication-health.md, ado-wiki-d-copilot-powershell-script-assistance.md, ado-wiki-f-azure-ad-administrative-units-powershell.md, ado-wiki-f-powershell-modules-deprecation-retirement.md, ado-wiki-f-powershell-tips-and-tricks.md, onenote-ca-block-powershell-non-gui-appids.md
**Generated**: 2026-04-07

---

## Phase 1: Msonline
> 4 related entries

### MSOnline PowerShell cmdlets fail with 403 error and message 'MSOnline PowerShell is disallowed' during scheduled temporary outage tests (scream tes...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft performs planned temporary outage tests (3-8 hours each) as preparation for MSOnline retirement starting April 2025. During these windows, all MSOnline cmdlets are blocked with 403 responses. S500 and sovereign cloud customers had separate test schedules starting February 2025.

**Solution**: Wait for the outage to end (typically 3-8 hours). For high-severity business impact, file an ICM to AAD Distributed Directory Services / Programmability Infra team and email aadgraphandlegacypsr@microsoft.com. Long-term: migrate all scripts to Microsoft Graph PowerShell SDK or Microsoft Entra PowerShell before April 2025 retirement date.

---

### MSOnline PowerShell module versions before 1.1.166.0 (pre-2017) experience disruptions, failures, or authentication errors after June 30, 2024
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Legacy MSOnline versions below 1.1.166.0 use deprecated RPS (Remote PowerShell) authentication with certificates that expired and cannot be renewed. These old versions cannot be maintained by Microsoft.

**Solution**: Upgrade to the latest MSOnline version 1.1.183.81 from PowerShell Gallery (Install-Module MSOnline -Force) as interim fix. Check installed version with Get-InstalledModule MSOnline. Plan full migration to Microsoft Graph PowerShell SDK before MSOnline retirement in April 2025.

---

### Azure Active Directory module for Windows PowerShell fails to open — console shows multiple text errors that module packages couldn't be loaded
**Score**: 🔵 7.5 | **Source**: MS Learn

**Root Cause**: .NET Framework 3.51 is not enabled on the computer

**Solution**: Enable .NET Framework 3.51 manually: Windows Server 2008 R2 → Server Manager > Features > Add Features > .NET Framework 3.51; Windows 7 → Programs and Features > Turn Windows features on or off > check .NET Framework 3.51

---

### Running AAD PowerShell cmdlet fails with 'The term <cmdlet name> is not recognized as the name of a cmdlet' — e.g. Connect-MsolService not recognized
**Score**: 🔵 7.5 | **Source**: MS Learn

**Root Cause**: Azure Active Directory module for Windows PowerShell (MSOnline) is not installed or not loaded correctly

**Solution**: Install the AAD module, launch via Start > Windows Azure Active Directory > module shortcut; verify MSOnline module presence with Get-Module; if missing, run Import-Module MSOnline after connecting to Exchange Online via remote PowerShell

---

## Phase 2: Connect Msolservice
> 4 related entries

### Connect-MsolService fails: Unable to authenticate your credentials. Make sure user name is in format <username>@<domain>
**Score**: 🔵 7.5 | **Source**: MS Learn

**Root Cause**: Incorrect username format (john or contosojohn instead of john@contoso.com), or account enabled for Entra MFA which legacy Azure AD PowerShell does not support

**Solution**: Use correct UPN format user@domain.com. If MFA: disable MFA for admin, use non-MFA admin, or migrate to Graph PowerShell SDK with modern auth

---

### Connect-MsolService fails with Unable to authenticate your credentials error (0x80048862)
**Score**: 🔵 7.5 | **Source**: MS Learn

**Root Cause**: Incorrect username format (must be user@domain.com) or MFA enabled on account which MSOnline module does not support

**Solution**: Use correct UPN format; if MFA enabled, disable MFA or use non-MFA admin account or migrate to Microsoft Graph PowerShell SDK

---

### Connect-MSOLService cmdlet fails with errors: MicrosoftOnlineException / Access Denied / The user name or password is incorrect - cannot connect to...
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: Multiple possible causes: module version issues, permission problems, or credential errors. MSOnline module deprecated since March 2024

**Solution**: Refer to specific KB articles per error type: KB2887306 for Exception, KB2887685 for Access Denied, KB2887705 for username/password error. Recommended: migrate to Microsoft Graph PowerShell SDK

---

### Connect-MsolService fails with 'Unable to authenticate your credentials. Make sure that your user name is in the format: <username>@<domain>.'
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: Either incorrect username format (must be user@domain, not domain\user) or the admin account has MFA enabled which is not supported by MSOnline PowerShell module.

**Solution**: Use UPN format (user@domain.com) for username. If MFA is enabled, either disable MFA for the account or use a different admin account without MFA. Consider migrating to Microsoft Graph PowerShell SDK.

---

## Phase 3: Identifier Uri
> 2 related entries

### Identifier URI Protection Policy cannot be disabled via PowerShell script from Microsoft documentation; script reports success but policy not updated
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PowerShell script includes unsupported properties in request payload (audiences: null, federatedIdentityCredentials: null, trustedSubjectNameAndIssuers: null)

**Solution**: Use Graph API query directly instead of the PowerShell script to disable the policy.

---

### Identifier URI Protection Policy cannot be disabled via PowerShell; reports success but policy not updated
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Script includes unsupported null properties (audiences, federatedIdentityCredentials, trustedSubjectNameAndIssuers)

**Solution**: Use Graph API directly instead of the PowerShell script.

---

## Phase 4: Aadsts50011
> 2 related entries

### Error 'AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application' when connecting to Exchang...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft updated the reply URL list for Exchange Online PowerShell; older EXO PowerShell module versions (pre-2.0.4) reference outdated reply URLs that no longer match the registered application configuration

**Solution**: Uninstall old Exchange Online Management module and install version 2.0.4 or later: Install-Module -Name ExchangeOnlineManagement -MinimumVersion '2.0.4'. Note: this is an EXO module issue, not an AAD configuration issue.

---

### AADSTS50011 error when connecting to Exchange Online PowerShell: 'The reply URL specified in the request does not match the reply URLs configured f...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft updated the reply URLs list for Exchange Online PowerShell; older versions of the ExchangeOnlineManagement module use outdated reply URLs that no longer match the registered application URLs in Azure AD

**Solution**: Uninstall the old Exchange Online PowerShell module and install the latest version (minimum 2.0.4): Install-Module -Name ExchangeOnlineManagement -MinimumVersion '2.0.4'

---

## Phase 5: Group Based Licensing
> 2 related entries

### Need to find and remove direct license assignments that conflict with group-based licensing in Entra ID
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Direct license assignments on users can conflict with or duplicate group-based license assignments, making license management difficult.

**Solution**: Use the CleanupAADDirectLicenseAssignments.ps1 PowerShell script. Run with -WhatIf for report only, -WhatIf -SaveReport to export CSV, or without flags to remove direct assignments.

---

### Need to find and remove direct license assignments; migrate to group-based licensing
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Solution**: Use CleanupAADDirectLicenseAssignments.ps1. -WhatIf for report, -WhatIf -SaveReport for CSV, no flags to remove. Download from ADO wiki.

---

## Phase 6: Pta
> 2 related entries

### Running Disable-PassthroughAuthentication PowerShell cmdlet fails with error: Cannot process argument because the value of argument exception is nu...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug in PassthroughAuthPSModule cmdlet where the exception argument is null during disable operation (ICM-527131499, ongoing)

**Solution**: Workaround: Re-register the PTA agent first, then execute the steps to disable PTA. Alternatively, use Azure Portal or Graph API to disable PTA

---

### Disable-PassthroughAuthentication PowerShell cmdlet fails with error: Cannot process argument because the value of argument exception is null (PSAr...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug in PassthroughAuthPSModule cmdlet when processing authentication response

**Solution**: Workaround: Register the PTA agent first, then execute the steps to disable PTA. See ICM 527131499

---

## Phase 7: Msgraph
> 1 related entries

### Need to connect to Microsoft Graph PowerShell from Az module in Azure China (Mooncake)
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: Az module and MgGraph module use different auth flows

**Solution**: Connect-AzAccount -Environment AzureChinaCloud, Get-AzAccessToken -ResourceUrl microsoftgraph.chinacloudapi.cn, ConvertTo-SecureString, Connect-MgGraph -AccessToken -Environment china

---

## Phase 8: Aadds
> 1 related entries

### AADDS replica DC creation takes 3+ days or fails repeatedly. ARM logs show VM delete operations repeating every hour. Jarvis logs show PSRemoting a...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Networking issue between Azure China regions (e.g., China East 2 and China North 3) causes RemotePowerShell connection drops during DC promotion. AADDS PG confirmed they cannot get root cause as they cannot reproduce in lab. Both successful and failed promotion events show PSRemoting errors, but some succeed after retries.

**Solution**: Short-term: Manually reboot the affected VM during replicaCreate operation to unblock DC promotion. Long-term: PG is developing a remediator to automatically reboot the affected VM. Check ARM Kusto (armmcadx.chinaeast2.kusto.chinacloudapi.cn/armmc) EventServiceEntries for VM delete patterns. Check Jarvis for DC promotion success/failure correlation IDs. Reference ICM: 446491273.

---

## Phase 9: Mfa
> 1 related entries

### Bulk enable MFA via MFA portal for more than 50 users partially fails — some users remain unenabled but the portal reports all operations successful.
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: MFA portal bulk enable operation has a known limitation when processing large batches (>50 users), silently failing to enable MFA for some users without reporting errors.

**Solution**: Use PowerShell script with Set-MsolUser -StrongAuthenticationRequirements to bulk enable MFA. After execution, verify each user's status with Get-MsolUser checking StrongAuthenticationRequirements.State. Export results to CSV and retry users with empty State values.

---

## Phase 10: Aadc
> 1 related entries

### After deploying a new Entra ID Connect server, objects outside the explicitly selected OUs are synchronized to Entra ID, causing large-scale uninte...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Product bug (ICM 21000000942261): When no domain/OU is selected during initial AADC config, domain root DN is written into BOTH ContainerInclusionList and ContainerExclusionList. When OUs are later selected, domain root DN remains in inclusion list. Sync engine prioritizes inclusion, so entire domain syncs.

**Solution**: Workaround: 1) Reconfigure OU filtering to Mode A - explicitly select the domain, then uncheck unwanted OUs. This rewrites inclusion/exclusion lists correctly. 2) After corrected, safely switch back to Mode B (OU selection without domain). Verify with Get-ADSyncConnector PowerShell checking ContainerInclusionList/ContainerExclusionList.

---

## Phase 11: Msol
> 1 related entries

### MSOnline (MSOL) PowerShell module commands fail. Engineers try Set-MsolDomainAuthentication for federation.
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: MSOL module retired since May 2025. Must use Microsoft.Graph. 21V Mooncake has different delegated sign-in process.

**Solution**: Use Microsoft.Graph module. For 21V delegated sign-in, see User Delegated Sign-In guide. Use Set-MgDomainFederationConfiguration for federation.

---

## Phase 12: Vm Extension
> 1 related entries

### AADLoginForWindows extension deployment shows success in portal/PowerShell but extension actually failed (false positive status)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Deploying without mdmId config param causes VM agent to not parse settings properly; status services rely on exit code instead of status file

**Solution**: Always include mdmId in deployment command even if empty: $SettingsString = @{mdmId = ...} and pass via -Settings parameter

---

## Phase 13: Domain Verification
> 1 related entries

### 'Could not find the DNS record for this domain' error when trying to verify a custom domain in Microsoft Entra ID / Office 365
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: DNS TXT or MX record not created correctly, or DNS propagation not complete (up to 72 hours for global propagation).

**Solution**: 1) Check DNS record via PowerShell: Resolve-DnsName -Name domain.com -Type TXT (or MX). 2) Verify expected verification record in ASC Tenant Explorer > Domains > Registration tab. 3) Or use nslookup: Set type=txt, then enter domain name. 4) If record exists but verification still fails, wait up to 72 hours for DNS propagation. Reference: https://support.microsoft.com/help/2515404

---

## Phase 14: Conditional Access
> 1 related entries

### Named Locations created via PowerShell or in the Preview Named Locations portal view do not appear in the Classic Named Locations view, and vice ve...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Two distinct Named Locations views exist in the Azure AD Portal (Preview and Classic). Named Locations created in the Preview view or via PowerShell only appear in the Preview Named Locations view; those created in Classic view only appear in Classic view.

**Solution**: Access Named Locations in the Preview Named Locations view if they were created via PowerShell or Preview portal. This is expected behavior due to two parallel UX implementations. Reference: https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/location-condition#api-support-and-powershell

---

## Phase 15: Get Mguser
> 1 related entries

### Get-MgUser fails with 400 BadRequest 'Number of included identifiers cannot exceed 1000' when filtering users by lastSignInDateTime
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When querying users with signInActivity filter, the reporting API is called first. The reporting API incorrectly pages the response generating more than 1000 results to MSODS, which returns 400. PG is aware but no fix timeline.

**Solution**: Use Invoke-MGGraphRequest with $top=500 and manual pagination instead of Get-MgUser filter: `Invoke-MGGraphRequest -Uri 'https://graph.microsoft.com/v1.0/users?$select=userPrincipalName,displayName,signInActivity&$top=500' -Headers @{ConsistencyLevel='eventual'}` then paginate via @odata.nextLink

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | MSOnline (MSOL) PowerShell module commands fail. Engineers try Set-MsolDomain... | MSOL module retired since May 2025. Must use Microsoft.Gr... | Use Microsoft.Graph module. For 21V delegated sign-in, se... | 🟢 10.0 | OneNote |
| 2 | AADDS replica DC creation takes 3+ days or fails repeatedly. ARM logs show VM... | Networking issue between Azure China regions (e.g., China... | Short-term: Manually reboot the affected VM during replic... | 🟢 9.0 | OneNote |
| 3 | After deploying a new Entra ID Connect server, objects outside the explicitly... | Product bug (ICM 21000000942261): When no domain/OU is se... | Workaround: 1) Reconfigure OU filtering to Mode A - expli... | 🟢 9.0 | OneNote |
| 4 | AADLoginForWindows extension deployment shows success in portal/PowerShell bu... | Deploying without mdmId config param causes VM agent to n... | Always include mdmId in deployment command even if empty:... | 🟢 8.5 | ADO Wiki |
| 5 | 'Could not find the DNS record for this domain' error when trying to verify a... | DNS TXT or MX record not created correctly, or DNS propag... | 1) Check DNS record via PowerShell: Resolve-DnsName -Name... | 🟢 8.5 | ADO Wiki |
| 6 | Identifier URI Protection Policy cannot be disabled via PowerShell script fro... | PowerShell script includes unsupported properties in requ... | Use Graph API query directly instead of the PowerShell sc... | 🟢 8.5 | ADO Wiki |
| 7 | Identifier URI Protection Policy cannot be disabled via PowerShell; reports s... | Script includes unsupported null properties (audiences, f... | Use Graph API directly instead of the PowerShell script. | 🟢 8.5 | ADO Wiki |
| 8 | Named Locations created via PowerShell or in the Preview Named Locations port... | Two distinct Named Locations views exist in the Azure AD ... | Access Named Locations in the Preview Named Locations vie... | 🟢 8.5 | ADO Wiki |
| 9 | Error 'AADSTS50011: The reply URL specified in the request does not match the... | Microsoft updated the reply URL list for Exchange Online ... | Uninstall old Exchange Online Management module and insta... | 🟢 8.5 | ADO Wiki |
| 10 | AADSTS50011 error when connecting to Exchange Online PowerShell: 'The reply U... | Microsoft updated the reply URLs list for Exchange Online... | Uninstall the old Exchange Online PowerShell module and i... | 🟢 8.5 | ADO Wiki |
| 11 | Get-MgUser fails with 400 BadRequest 'Number of included identifiers cannot e... | When querying users with signInActivity filter, the repor... | Use Invoke-MGGraphRequest with $top=500 and manual pagina... | 🟢 8.5 | ADO Wiki |
| 12 | Get-MgUser -Filter on signInActivity/lastSignInDateTime returns 400 BadReques... | When filtering users by sign-in activity, the reporting A... | Use Invoke-MGGraphRequest with -Uri 'https://graph.micros... | 🟢 8.5 | ADO Wiki |
| 13 | Access token wids claim contains role GUIDs; role ID b79fbf4d-3ef9-4689-8143-... | The wids claim lists Azure AD built-in role template IDs.... | Use Get-MgDirectoryRoleTemplate for standard roles. For b... | 🟢 8.5 | ADO Wiki |
| 14 | Bulk operation failed error when downloading Authentication Methods reports o... | Bulk operations in Entra admin portal timeout on very lar... | Split records into smaller batches by filtering on group ... | 🟢 8.5 | ADO Wiki |
| 15 | Bulk import does not work for restricted Administrative Units (AUs). Error: I... | Bug - the bulk processor lacks permission to write to res... | Workaround: Use MgGraph PowerShell module with directory.... | 🟢 8.5 | ADO Wiki |
| 16 | Running Disable-PassthroughAuthentication PowerShell cmdlet fails with error:... | Bug in PassthroughAuthPSModule cmdlet where the exception... | Workaround: Re-register the PTA agent first, then execute... | 🟢 8.5 | ADO Wiki |
| 17 | Disable-PassthroughAuthentication PowerShell cmdlet fails with error: Cannot ... | Bug in PassthroughAuthPSModule cmdlet when processing aut... | Workaround: Register the PTA agent first, then execute th... | 🟢 8.5 | ADO Wiki |
| 18 | User sessions and refresh tokens are not revoked when password expires. Users... | By design, Azure AD does not revoke existing refresh toke... | Use Microsoft Graph PowerShell SDK to programmatically re... | 🟢 8.5 | ADO Wiki |
| 19 | Silent connector registration using PowerShell credential object fails with U... | Connector version 1.5.2864.0 sends credential-based regis... | Install connector version 1.5.3437.0 or later. Workaround... | 🟢 8.5 | ADO Wiki |
| 20 | MSOnline PowerShell cmdlets fail with 403 error and message 'MSOnline PowerSh... | Microsoft performs planned temporary outage tests (3-8 ho... | Wait for the outage to end (typically 3-8 hours). For hig... | 🟢 8.5 | ADO Wiki |
| 21 | PowerShell module import fails with error 'Running script is disabled on this... | PowerShell execution policy is set to Restricted or AllSi... | Run 'Set-ExecutionPolicy -ExecutionPolicy Unrestricted' (... | 🟢 8.5 | ADO Wiki |
| 22 | MSOnline PowerShell module versions before 1.1.166.0 (pre-2017) experience di... | Legacy MSOnline versions below 1.1.166.0 use deprecated R... | Upgrade to the latest MSOnline version 1.1.183.81 from Po... | 🟢 8.5 | ADO Wiki |
| 23 | Newly added managed domain or federated-to-managed converted domain does not ... | When a new domain is created or a federated domain is con... | Option 1: Disable and re-enable the Password Expiration P... | 🟢 8.5 | ADO Wiki |
| 24 | Cannot restore deleted AD objects from the Configuration partition using Acti... | ADAC only manages domain partitions and cannot restore de... | Use PowerShell to restore objects from non-domain partiti... | 🟢 8.5 | ADO Wiki |
| 25 | Network shares (e.g. winbuilds) cannot be accessed from an elevated PowerShel... | Network shares are mapped to the standard user account, n... | Access shares from an unelevated PowerShell/CMD session. ... | 🟢 8.5 | ADO Wiki |
| 26 | Certificate enrollment via CAWE (Certification Authority Web Enrollment) page... | CAWE web pages rely on Active-X controls supported only b... | Use alternative enrollment methods: CertReq.exe for CSR s... | 🟢 8.5 | ADO Wiki |
| 27 | Legacy LAPS UI shows blank/empty password when administrator tries to view lo... | The administrator running LAPS UI lacks extended rights (... | Use PowerShell to check permissions: Import-module AdmPwd... | 🟢 8.5 | ADO Wiki |
| 28 | MSOnline/AzureAD PowerShell license assignment cmdlets (Set-MsolUserLicense, ... | Microsoft retired MSOL and AAD Graph license assignment A... | Migrate to Microsoft Graph PowerShell Set-MgUserLicense o... | 🟢 8.5 | ADO Wiki |
| 29 | Need to connect to Microsoft Graph PowerShell from Az module in Azure China (... | Az module and MgGraph module use different auth flows | Connect-AzAccount -Environment AzureChinaCloud, Get-AzAcc... | 🟢 8.0 | OneNote |
| 30 | Bulk enable MFA via MFA portal for more than 50 users partially fails — some ... | MFA portal bulk enable operation has a known limitation w... | Use PowerShell script with Set-MsolUser -StrongAuthentica... | 🟢 8.0 | OneNote |
