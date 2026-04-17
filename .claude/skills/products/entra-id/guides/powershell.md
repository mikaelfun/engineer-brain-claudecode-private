# ENTRA-ID PowerShell Management — Quick Reference

**Entries**: 52 | **21V**: Partial (46/52)
**Last updated**: 2026-04-07
**Keywords**: powershell, msonline, connect-msolservice, mfa, new-msoldomain, subdomain

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/powershell.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | MSOnline (MSOL) PowerShell module commands fail. Engineers try Set-MsolDomainAuthentication for f... | MSOL module retired since May 2025. Must use Microsoft.Graph. 21V Mooncake ha... | Use Microsoft.Graph module. For 21V delegated sign-in, see User Delegated Sig... | 🟢 10.0 | OneNote |
| 2 📋 | AADDS replica DC creation takes 3+ days or fails repeatedly. ARM logs show VM delete operations r... | Networking issue between Azure China regions (e.g., China East 2 and China No... | Short-term: Manually reboot the affected VM during replicaCreate operation to... | 🟢 9.0 | OneNote |
| 3 📋 | After deploying a new Entra ID Connect server, objects outside the explicitly selected OUs are sy... | Product bug (ICM 21000000942261): When no domain/OU is selected during initia... | Workaround: 1) Reconfigure OU filtering to Mode A - explicitly select the dom... | 🟢 9.0 | OneNote |
| 4 📋 | AADLoginForWindows extension deployment shows success in portal/PowerShell but extension actually... | Deploying without mdmId config param causes VM agent to not parse settings pr... | Always include mdmId in deployment command even if empty: $SettingsString = @... | 🟢 8.5 | ADO Wiki |
| 5 📋 | 'Could not find the DNS record for this domain' error when trying to verify a custom domain in Mi... | DNS TXT or MX record not created correctly, or DNS propagation not complete (... | 1) Check DNS record via PowerShell: Resolve-DnsName -Name domain.com -Type TX... | 🟢 8.5 | ADO Wiki |
| 6 📋 | Identifier URI Protection Policy cannot be disabled via PowerShell script from Microsoft document... | PowerShell script includes unsupported properties in request payload (audienc... | Use Graph API query directly instead of the PowerShell script to disable the ... | 🟢 8.5 | ADO Wiki |
| 7 📋 | Identifier URI Protection Policy cannot be disabled via PowerShell; reports success but policy no... | Script includes unsupported null properties (audiences, federatedIdentityCred... | Use Graph API directly instead of the PowerShell script. | 🟢 8.5 | ADO Wiki |
| 8 📋 | Named Locations created via PowerShell or in the Preview Named Locations portal view do not appea... | Two distinct Named Locations views exist in the Azure AD Portal (Preview and ... | Access Named Locations in the Preview Named Locations view if they were creat... | 🟢 8.5 | ADO Wiki |
| 9 📋 | Error 'AADSTS50011: The reply URL specified in the request does not match the reply URLs configur... | Microsoft updated the reply URL list for Exchange Online PowerShell; older EX... | Uninstall old Exchange Online Management module and install version 2.0.4 or ... | 🟢 8.5 | ADO Wiki |
| 10 📋 | AADSTS50011 error when connecting to Exchange Online PowerShell: 'The reply URL specified in the ... | Microsoft updated the reply URLs list for Exchange Online PowerShell; older v... | Uninstall the old Exchange Online PowerShell module and install the latest ve... | 🟢 8.5 | ADO Wiki |
| 11 📋 | Get-MgUser fails with 400 BadRequest 'Number of included identifiers cannot exceed 1000' when fil... | When querying users with signInActivity filter, the reporting API is called f... | Use Invoke-MGGraphRequest with $top=500 and manual pagination instead of Get-... | 🟢 8.5 | ADO Wiki |
| 12 📋 | Get-MgUser -Filter on signInActivity/lastSignInDateTime returns 400 BadRequest error: 'Number of ... | When filtering users by sign-in activity, the reporting API is invoked first ... | Use Invoke-MGGraphRequest with -Uri 'https://graph.microsoft.com/v1.0/users?$... | 🟢 8.5 | ADO Wiki |
| 13 📋 | Access token wids claim contains role GUIDs; role ID b79fbf4d-3ef9-4689-8143-76b194e85509 returns... | The wids claim lists Azure AD built-in role template IDs. GUID b79fbf4d-3ef9-... | Use Get-MgDirectoryRoleTemplate for standard roles. For b79fbf4d-3ef9-4689-81... | 🟢 8.5 | ADO Wiki |
| 14 📋 | Bulk operation failed error when downloading Authentication Methods reports on large tenants | Bulk operations in Entra admin portal timeout on very large tenants due to sc... | Split records into smaller batches by filtering on group type or user name. O... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Bulk import does not work for restricted Administrative Units (AUs). Error: Insufficient privileg... | Bug - the bulk processor lacks permission to write to restricted AUs. Tracked... | Workaround: Use MgGraph PowerShell module with directory.write.restricted per... | 🟢 8.5 | ADO Wiki |
| 16 📋 | Running Disable-PassthroughAuthentication PowerShell cmdlet fails with error: Cannot process argu... | Bug in PassthroughAuthPSModule cmdlet where the exception argument is null du... | Workaround: Re-register the PTA agent first, then execute the steps to disabl... | 🟢 8.5 | ADO Wiki |
| 17 📋 | Disable-PassthroughAuthentication PowerShell cmdlet fails with error: Cannot process argument bec... | Bug in PassthroughAuthPSModule cmdlet when processing authentication response | Workaround: Register the PTA agent first, then execute the steps to disable P... | 🟢 8.5 | ADO Wiki |
| 18 📋 | User sessions and refresh tokens are not revoked when password expires. Users with expired passwo... | By design, Azure AD does not revoke existing refresh tokens when a password e... | Use Microsoft Graph PowerShell SDK to programmatically revoke refresh tokens ... | 🟢 8.5 | ADO Wiki |
| 19 📋 | Silent connector registration using PowerShell credential object fails with User authentication f... | Connector version 1.5.2864.0 sends credential-based registration request to /... | Install connector version 1.5.3437.0 or later. Workarounds: (1) register usin... | 🟢 8.5 | ADO Wiki |
| 20 📋 | MSOnline PowerShell cmdlets fail with 403 error and message 'MSOnline PowerShell is disallowed' d... | Microsoft performs planned temporary outage tests (3-8 hours each) as prepara... | Wait for the outage to end (typically 3-8 hours). For high-severity business ... | 🟢 8.5 | ADO Wiki |
| 21 📋 | PowerShell module import fails with error 'Running script is disabled on this system' when import... | PowerShell execution policy is set to Restricted or AllSigned, preventing mod... | Run 'Set-ExecutionPolicy -ExecutionPolicy Unrestricted' (or RemoteSigned) to ... | 🟢 8.5 | ADO Wiki |
| 22 📋 | MSOnline PowerShell module versions before 1.1.166.0 (pre-2017) experience disruptions, failures,... | Legacy MSOnline versions below 1.1.166.0 use deprecated RPS (Remote PowerShel... | Upgrade to the latest MSOnline version 1.1.183.81 from PowerShell Gallery (In... | 🟢 8.5 | ADO Wiki |
| 23 📋 | Newly added managed domain or federated-to-managed converted domain does not inherit the Password... | When a new domain is created or a federated domain is converted to managed, i... | Option 1: Disable and re-enable the Password Expiration Policy in M365 Admin ... | 🟢 8.5 | ADO Wiki |
| 24 📋 | Cannot restore deleted AD objects from the Configuration partition using Active Directory Adminis... | ADAC only manages domain partitions and cannot restore deleted objects from o... | Use PowerShell to restore objects from non-domain partitions: Get-ADObject -F... | 🟢 8.5 | ADO Wiki |
| 25 📋 | Network shares (e.g. winbuilds) cannot be accessed from an elevated PowerShell/CMD session with A... | Network shares are mapped to the standard user account, not the shadow admin ... | Access shares from an unelevated PowerShell/CMD session. Alternatively, use n... | 🟢 8.5 | ADO Wiki |
| 26 📋 | Certificate enrollment via CAWE (Certification Authority Web Enrollment) pages fails or is limite... | CAWE web pages rely on Active-X controls supported only by Internet Explorer ... | Use alternative enrollment methods: CertReq.exe for CSR submission (certreq -... | 🟢 8.5 | ADO Wiki |
| 27 📋 | Legacy LAPS UI shows blank/empty password when administrator tries to view local administrator pa... | The administrator running LAPS UI lacks extended rights (Read ms-MCS-AdmPwd p... | Use PowerShell to check permissions: Import-module AdmPwd.PS; Find-AdmPwdExte... | 🟢 8.5 | ADO Wiki |
| 28 📋 | MSOnline/AzureAD PowerShell license assignment cmdlets (Set-MsolUserLicense, Set-AzureADUserLicen... | Microsoft retired MSOL and AAD Graph license assignment APIs (write operation... | Migrate to Microsoft Graph PowerShell Set-MgUserLicense or Microsoft Graph AP... | 🟢 8.5 | ADO Wiki |
| 29 📋 | Need to connect to Microsoft Graph PowerShell from Az module in Azure China (Mooncake) | Az module and MgGraph module use different auth flows | Connect-AzAccount -Environment AzureChinaCloud, Get-AzAccessToken -ResourceUr... | 🟢 8.0 | OneNote |
| 30 📋 | Bulk enable MFA via MFA portal for more than 50 users partially fails — some users remain unenabl... | MFA portal bulk enable operation has a known limitation when processing large... | Use PowerShell script with Set-MsolUser -StrongAuthenticationRequirements to ... | 🟢 8.0 | OneNote |
| 31 📋 | Need to find and remove direct license assignments that conflict with group-based licensing in En... | Direct license assignments on users can conflict with or duplicate group-base... | Use the CleanupAADDirectLicenseAssignments.ps1 PowerShell script. Run with -W... | 🔵 7.5 | ADO Wiki |
| 32 📋 | Need to find and remove direct license assignments; migrate to group-based licensing | - | Use CleanupAADDirectLicenseAssignments.ps1. -WhatIf for report, -WhatIf -Save... | 🔵 7.5 | ADO Wiki |
| 33 📋 | Access token lifetime varies between 60-90 minutes instead of expected fixed 60 minutes | Since June 1, 2021, default AT lifetime jittered 60-90min (median 75min) to r... | Configure CTL policy via PowerShell to override randomness if consistent AT l... | 🔵 7.5 | ADO Wiki |
| 34 📋 | Azure Active Directory module for Windows PowerShell fails to open — console shows multiple text ... | .NET Framework 3.51 is not enabled on the computer | Enable .NET Framework 3.51 manually: Windows Server 2008 R2 → Server Manager ... | 🔵 7.5 | MS Learn |
| 35 📋 | Running AAD PowerShell cmdlet fails with 'The term <cmdlet name> is not recognized as the name of... | Azure Active Directory module for Windows PowerShell (MSOnline) is not instal... | Install the AAD module, launch via Start > Windows Azure Active Directory > m... | 🔵 7.5 | MS Learn |
| 36 📋 | New-MsolDomain command fails: Unable to add this domain. It is a subdomain and its authentication... | New-MSOLDomain tries to add subdomain as managed auth, but parent root domain... | Use New-MSOLFederatedDomain instead: Connect to Entra ID via PowerShell, run ... | 🔵 7.5 | MS Learn |
| 37 📋 | Connect-MsolService fails: Unable to authenticate your credentials. Make sure user name is in for... | Incorrect username format (john or contosojohn instead of john@contoso.com), ... | Use correct UPN format user@domain.com. If MFA: disable MFA for admin, use no... | 🔵 7.5 | MS Learn |
| 38 📋 | Connect-MsolService fails with Unable to authenticate your credentials error (0x80048862) | Incorrect username format (must be user@domain.com) or MFA enabled on account... | Use correct UPN format; if MFA enabled, disable MFA or use non-MFA admin acco... | 🔵 7.5 | MS Learn |
| 39 📋 | Cannot peer VNets across subscriptions associated with different Azure AD tenants via Azure Porta... | Azure Portal does not support VNet peering when virtual networks are in subsc... | Use PowerShell, CLI, or ARM Templates instead of Portal. PowerShell approach:... | 🔵 7.0 | ADO Wiki |
| 40 📋 | KeyVault renewal certificate admin was unable to see the new certificate and it was showing old c... | Missing Permission on Services Principle which is responsible for performing ... | Ran Jarvis Query targeting the Tenant ID and the Impacted      KeyVault. As w... | 🔵 7.0 | KB |
| ... | *12 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **powershell** related issues (7 entries) `[ado-wiki]`
2. Check **msonline** related issues (2 entries) `[onenote]`
3. Check **identifier-uri** related issues (2 entries) `[ado-wiki]`
4. Check **protection-policy** related issues (2 entries) `[ado-wiki]`
5. Check **aadsts50011** related issues (2 entries) `[ado-wiki]`
6. Check **reply-url** related issues (2 entries) `[ado-wiki]`
7. Check **exchange-online** related issues (2 entries) `[ado-wiki]`
8. Check **pta** related issues (2 entries) `[ado-wiki]`
