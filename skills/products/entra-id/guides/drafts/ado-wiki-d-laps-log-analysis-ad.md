---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Windows LAPS - LAPSv2/Windows LAPS - Storing Password - Active Directory/Log Analysis - Source Active Directory"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20LAPS/Windows%20LAPS%20-%20LAPSv2/Windows%20LAPS%20-%20Storing%20Password%20-%20Active%20Directory/Log%20Analysis%20-%20Source%20Active%20Directory"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/774714&Instance=774714&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/774714&Instance=774714&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a detailed log analysis of two scenarios involving the Windows Local Administrator Password Solution (LAPS) configuration. The scenarios include a client machine backing up passwords to Active Directory and an admin-initiated password reset. 


[[_TOC_]]

**Note**: The logs are collected in our test environment and this is not customer data. Our domain is called Contoso.com with the user: John.

# Log analysis

## Scenario 1: Client machine configured to back up the password to Active Directory

### GPO or Intune Configuration
Set to: Configure password backup directory
Backup Directory: Active Directory

### Logs Collection Scenario
When a client machine is performing the sync to Active Directory.

### Phase 1
LAPS Core Engine called the "StaticApplyPolicyAsync" and this would have a unique OperationID for the current processing of the async operation.

```
[3] 038C.0E20::12/01/22-04:11:45.7115527 [LAPS] rpcserver_cxx88 s_ProcessCurrentPolicy() - s_ProcessCurrentPolicy called
[3] 038C.0E20::12/01/22-04:11:45.7115531 [LAPS] rpcserver_cxx94 s_ProcessCurrentPolicy() - Calling LapsCore::StaticApplyPolicyAsync
[3] 038C.0E20::12/01/22-04:11:45.7115585 [LAPS] lapscore_cxx2370 LapsCore::QueueBackgroundRequest() - LapsCore::QueueBackgroundRequest called
[3] 038C.0E20::12/01/22-04:11:45.7115699 [LAPS] requesttracker_cxx706 LapsRequestTracker::AddNewRequest() - Added new request _cRequests:0x9(9) cOperationIdTableElements:0x9(9) cRequestIdTableElements:0x0(0)
[3] 038C.0E20::12/01/22-04:11:45.7115703 [LAPS] requesttracker_cxx115 LapsRequestTracker::AddPendingRequest() - Successfully added operation to request tracker operationId:fc3a99ee-165b-474d-9fc1-0828622617d2 requestId:NULL
[3] 038C.0E20::12/01/22-04:11:45.7115899 [LAPS] lapscore_cxx2479 LapsCore::QueueBackgroundRequest() - LapsCore::QueueBackgroundRequest returning hr:0x0
[3] 038C.0E20::12/01/22-04:11:45.7115903 [LAPS] rpcserver_cxx105 s_ProcessCurrentPolicy() - LapsCore::StaticApplyPolicyAsync succeeded
```

### Phase 2
Windows-LAPS GPO Manager, which is part of the Core Engine, performed the following tasks:
1. Started the ExternalApply Policy.
2. Queried the legacy LAPS configuration: Software\Microsoft\Policies\LAPS, which failed (as we did not have legacy LAPS configured).
3. Queried the Windows-LAPS GPO configuration: Software\Microsoft\Windows\CurrentVersion\Policies\LAPS and found value in the registry.
4. Found a LAPS setting underneath Software\Microsoft\Windows\CurrentVersion\Policies\LAPS.

```
[3] 038C.0E20::12/01/22-04:11:45.7115992 [LAPS] lapscore_cxx2097 LapsCore::DoCoreProcessing() - Starting requestType:ExternalApplyPolicy
[3] 038C.0E20::12/01/22-04:11:45.7115998 [LAPS] requesttracker_cxx182 LapsCore::DoCoreProcessing() - Successfully marked operation as Started operationId:fc3a99ee-165b-474d-9fc1-0828622617d2 requestId:NULL
[0] 038C.0E20::12/01/22-04:11:45.7130946 [LAPS] gpomanager_cxx96 GPOManager::StaticQuery() - Starting
[0] 038C.0E20::12/01/22-04:11:45.7130955 [LAPS] gpomanager_cxx111 GPOManager::StaticQuery() - Querying policy key Software\Microsoft\Policies\LAPS
[0] 038C.0E20::12/01/22-04:11:45.7131060 [LAPS] gpoconfigbase_cxx510 GPOConfigBase::QuerySettingsHelper() - Failed to open policy key Software\Microsoft\Policies\LAPS lResult:0x2
[0] 038C.0E20::12/01/22-04:11:45.7131064 [LAPS] gpomanager_cxx125 GPOManager::StaticQuery() - pGPOConfig->QuerySettings returned file-not-found on policy key Software\Microsoft\Policies\LAPS
[0] 038C.0E20::12/01/22-04:11:45.7131067 [LAPS] gpomanager_cxx111 GPOManager::StaticQuery() - Querying policy key Software\Microsoft\Windows\CurrentVersion\Policies\LAPS
[3] 038C.0E20::12/01/22-04:11:45.7132739 [LAPS] gpoconfigbase_cxx538 GPOConfigBase::QuerySettingsHelper() - LoadSettingOrDefault(BackupDirectory) found value in registry
[3] 038C.0E20::12/01/22-04:11:45.7132792 [LAPS] gpoconfigbase_cxx538 GPOConfigBase::QuerySettingsHelper() - LoadSettingOrDefault(PasswordAgeDays) found value in registry
[3] 038C.0E20::12/01/22-04:11:45.7132924 [LAPS] gpoconfigbase_cxx538 GPOConfigBase::QuerySettingsHelper() - LoadSettingOrDefault(PasswordComplexity) found value in registry
[3] 038C.0E20::12/01/22-04:11:45.7132960 [LAPS] gpoconfigbase_cxx538 GPOConfigBase::QuerySettingsHelper() - LoadSettingOrDefault(PasswordLength) found value in registry
[3] 038C.0E20::12/01/22-04:11:45.7133180 [LAPS] gpoconfigbase_cxx538 GPOConfigBase::QuerySettingsHelper() - LoadSettingOrDefault(AdministratorAccountName) found value in registry
[3] 038C.0E20::12/01/22-04:11:45.7133235 [LAPS] gpoconfigbase_cxx546 GPOConfigBase::QuerySettingsHelper() - LoadSettingOrDefault(PasswordExpirationProtectionEnabled) did not find value in registry
[3] 038C.0E20::12/01/22-04:11:45.7133273 [LAPS] gpoconfigbase_cxx546 GPOConfigBase::QuerySettingsHelper() - LoadSettingOrDefault(ADPasswordEncryptionEnabled) did not find value in registry
[3] 038C.0E20::12/01/22-04:11:45.7133313 [LAPS] gpoconfigbase_cxx546 GPOConfigBase::QuerySettingsHelper() - LoadSettingOrDefault(ADPasswordEncryptionPrincipal) did not find value in registry
[3] 038C.0E20::12/01/22-04:11:45.7133349 [LAPS] gpoconfigbase_cxx546 GPOConfigBase::QuerySettingsHelper() - LoadSettingOrDefault(ADEncryptedPasswordHistorySize) did not find value in registry
[3] 038C.0E20::12/01/22-04:11:45.7133383 [LAPS] gpoconfigbase_cxx546 GPOConfigBase::QuerySettingsHelper() - LoadSettingOrDefault(ADBackupDSRMPassword) did not find value in registry
[3] 038C.0E20::12/01/22-04:11:45.7133419 [LAPS] gpoconfigbase_cxx546 GPOConfigBase::QuerySettingsHelper() - LoadSettingOrDefault(PostAuthenticationResetDelay) did not find value in registry
[3] 038C.0E20::12/01/22-04:11:45.7133454 [LAPS] gpoconfigbase_cxx546 GPOConfigBase::QuerySettingsHelper() - LoadSettingOrDefault(PostAuthenticationActions) did not find value in registry
[3] 038C.0E20::12/01/22-04:11:45.7133681 [LAPS] gpomanager_cxx150 GPOManager::StaticQuery() - pGPOConfig->QuerySettings found at least one setting for policy key Software\Microsoft\Windows\CurrentVersion\Policies\LAPS
[3] 038C.0E20::12/01/22-04:11:45.7133685 [LAPS] gpomanager_cxx271 GPOManager::StaticQuery() - Returning hr:0x0
```

### Phase 3
LAPS Core Engine performs the following phases once it identifies the registry configuration:
1. Verifies the client machine state: if it is Active Directory joined, if it is running on a Domain Controller (DC), or if the client is Azure Active Directory (AzureAD) joined.
2. Verifies the GPO configuration (registry configuration) and lists the configured values.

```
[3] 038C.0E20::12/01/22-04:11:45.7135129 [LAPS] lapscore_cxx2126 LapsCore::DoCoreProcessing() - Machine state: fADJoined:1 fRunningOnDC:0 fAADJoined:0 fWPJoined:0 pszTenantId:NULL pszDeviceId:NULL
[3] 038C.0E20::12/01/22-04:11:45.7135134 [LAPS] lapscore_cxx2137 LapsCore::DoCoreProcessing() - Tracing GPO config:
[3] 038C.0E20::12/01/22-04:11:45.7135140 [LAPS] gpoconfig_cxx359 GPOConfig::TraceState() - GPOConfig: _PolicySource:GPO _BackupDirectory:AD _dwPwdAgeDays:2 _dwPwdComplexity:4 _dwPwdLength:14 _pszAdminName:admin _fPwdExpirationProtectionRequired:TRUE _fADPasswordEncryptionEnabled:TRUE _pszADPasswordEncryptionPrincipal:NULL _dwADEncryptedPasswordHistorySize:0x0 _fADBackupDSRMPassword:FALSE _dwPostAuthResetDelay:24 _dwPostAuthActions:3
```

### Phase 4
LAPS Core Engine detected from the configuration that the passwords need to be updated to Active Directory, which starts a Domain Controller discovery process and discovers a DC.

```
[3] 038C.0E20::12/01/22-04:11:45.7135177 [LAPS] lapscore_cxx2225 LapsCore::DoCoreProcessing() - Calling DoADCoreProcessing
[3] 038C.0E20::12/01/22-04:11:45.7135190 [LAPS] lapscore_cxx5761 LapsCore::ClearPostAuthActionIfNeeded() - No pending postauth to check
[3] 038C.0E20::12/01/22-04:11:45.7135908 [LAPS] lapscore_cxx1200 LapsCore::DoLDAPBind() - Calling LdapComputer::StaticCreate
[3] 038C.0E20::12/01/22-04:11:45.7135914 [LAPS] ldapcomputer_cxx4174 LdapComputer::StaticCreate() - Got computer object DN pszComputerDN:NULL
[3] 038C.0E20::12/01/22-04:11:45.7135916 [LAPS] ldapcomputer_cxx4180 LdapComputer::StaticCreate() - Calling DsrGetDcNameEx2
[3] 038C.0E20::12/01/22-04:11:45.7138181 [LAPS] ldapcomputer_cxx4206 LdapComputer::StaticCreate() - DsrGetDcNameEx2 succeeded pDCInfo->DomainControllerName:\\OnPremDC.contoso.com pDCInfo->DomainControllerAddress:\\10.0.0.2 pDCInfo->DomainControllerAddressType:1 pDCInfo->DomainName:contoso.com pDCInfo->DnsForestName:contoso.com pDCInfo->Flags:0xe003f1fd pDCInfo->DcSiteName:Default-First-Site-Name pDCInfo->ClientSiteName:Default-First-Site-Name
```

### Phase 5
LAPS Core Engine performs the following tasks:
1. Performs LDAP Bind using the machine context (authenticates using machine credentials).
2. Searches for the client machine using LDAP protocol with an LDAP search.
3. Queries information for the following attributes:
   - msLaps-EncryptedPasswordHistory
   - msLaps-EncryptedDSRMPassword
   - msLaps-EncryptedDSRMPasswordHistory
   - msLaps-LapsPasswordExpirationTime
   - msLaps-LapsEncryptedPassword

```
[3] 038C.0E20::12/01/22-04:11:45.7138791 [LAPS] ldapcomputer_cxx1325 LdapComputer::CreateLDAPConnection() - Calling ldap_bind_s
[3] 038C.0E20::12/01/22-04:11:45.7201682 [LAPS] ldapcomputer_cxx1350 LdapComputer::CreateLDAPConnection() - ldap_bind_s succeeded
[3] 038C.0E20::12/01/22-04:11:45.7206571 [LAPS] ldapcomputer_cxx3272 LdapComputer::CacheRootDseState() - Got root DSE data defaultNamingContext:'DC=contoso,DC=com' configurationNamingContext:'CN=Configuration,DC=contoso,DC=com' schemaNamingContext:'CN=Schema,CN=Configuration,DC=contoso,DC=com' dnsHostName:'DCA.contoso.com'
[3] 038C.0E20::12/01/22-04:11:45.7212162 [LAPS] ldapcomputer_cxx3153 LdapComputer::CacheDomainNCState() - Got domain NC data _dwDomainFunctionalLevel:7
[3] 038C.0E20::12/01/22-04:11:45.7212204 [LAPS] ldapcomputer_cxx1431 LdapComputer::QueryCurrentComputerDN() - Doing LDAP search for computer object _pszDefaultNamingContext:DC=contoso,DC=com szSearchFilter:(samAccountName=OnPremClient$)
[3] 038C.0E20::12/01/22-04:11:45.7224014 [LAPS] ldapcomputer_cxx714 LdapComputer::CopyEncryptedPasswordHistoryAttribute() - Optional attribute not found in result set pszAttributeName:msLaps-EncryptedPasswordHistory
[3] 038C.0E20::12/01/22-04:11:45.7224035 [LAPS] ldapcomputer_cxx836 LdapComputer::CopyEncryptedPasswordAttribute() - Optional attribute not found in result set pszAttributeName:msLaps-EncryptedDSRMPassword
[3] 038C.0E20::12/01/22-04:11:45.7224053 [LAPS] ldapcomputer_cxx714 LdapComputer::CopyEncryptedPasswordHistoryAttribute() - Optional attribute not found in result set pszAttributeName:msLaps-EncryptedDSRMPasswordHistory
[3] 038C.0E20::12/01/22-04:11:45.7224067 [LAPS] ldapcomputer_cxx169 LdapComputer::LoadStateFromAD() - Skipping LoadLegacyStateFromAD because legacy LAPS schema is not present
[3] 038C.0E20::12/01/22-04:11:45.7224076 [LAPS] ldapcomputer_cxx4038 LdapComputer::TraceState() - LdapComputer state: _PwdExpirationLegacy:0x0 _PwdExpiration:0x1d9070fa4a1faad _EncryptedPassword present:True _cEncryptedPasswordHistory:0x0 _EncryptedDSRMPassword present:False _cEncryptedDSRMPasswordHistory:0x0 _pszComputerDN:CN=OnPremClient,OU=NewLpas,DC=contoso,DC=com _pszDC:DCA.contoso.com _pszDnsHostName:DCA.contoso.com _dwDomainFunctionalLevel:7
```

### Phase 6
LAPS Core Engine has the information about the local admin account and it would now validate if it can find the admin account configured via MDP/GPO. In the example below, we configured the name admin to be managed, hence it is calling locally to find out if the account exists and also identify the local RID (relative identifier) of the account.  
```
[3] 038C.0E20::12/01/22-04:11:45.7224112 [LAPS] lapscore_cxx1770 LapsCore::DoADCoreProcessing() - Calling LocalAdminAccount::StaticCreate
[3] 038C.0E20::12/01/22-04:11:45.7224119 [LAPS] localadminaccount_cxx405 LocalAdminAccount::StaticCreate() - Starting
[3] 038C.0E20::12/01/22-04:11:45.7224122 [LAPS] localadminaccount_cxx422 LocalAdminAccount::StaticCreate() - Account name specified - searching by name
[3] 038C.0E20::12/01/22-04:11:45.7224125 [LAPS] localadminaccount_cxx938 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Starting
[3] 038C.0E20::12/01/22-04:11:45.7224293 [LAPS] localadminaccount_cxx998 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Looking up caller-specified account name pszAccountName:HelpdeskAdmins
[3] 038C.0E20::12/01/22-04:11:45.7224299 [LAPS] localadminaccount_cxx663 LocalAdminAccount::StaticLookupAccountInDomain() - Starting pszAccountName:HelpdeskAdmins
[3] 038C.0E20::12/01/22-04:11:45.7226027 [LAPS] localadminaccount_cxx1016 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Found account name in local acct domain pszAccountName:HelpdeskAdmins dwAccountRidLocal:0x3e9
```

### Phase 7
LAPS Core Engine performs the following phases:
1. Checks if the Active Directory password needs to be updated by comparing the current time on the local machine to the Active Directory attribute on Client1 Machine (msDS-LapsPasswordExpirationTime).
2. In the example below, there is no need to update the password because:
   - **Reason 1:** The configured account or managed account on the GPO/MDM on the local machine and configured account in Active Directory matched.
   - **Reason 2:** There is no change in the policy source (e.g., previously GPO was managing it and now it's MDM or vice versa).
   - **Reason 3:** The password is still not expired.

**Local Time:** 12/01/2022-04:11:45.705 (UTC: 12/01/2022-12:11:45.705)  
**Expiry Time:** 12/03/2022-04:06:15.212 (UTC: 12/03/2022-12:06:15.212)

```
[3] 038C.0E20::12/01/22-04:11:45.7226779 [LAPS] lapscore_cxx1364 LapsCore::CheckADPasswordUpdateFactors() - Starting
[3] 038C.0E20::12/01/22-04:11:45.7226791 [LAPS] lapscore_cxx7498 TraceTimestamp() - *pullNow: Local: 12/01/2022-04:11:45.705 (UTC: 12/01/2022-12:11:45.705)
[3] 038C.0E20::12/01/22-04:11:45.7226797 [LAPS] lapscore_cxx1382 LapsCore::CheckADPasswordUpdateFactors() - dwLastAccountRidUpdated:0x3e9(1001) dwLocalAdminAccountRid:0x3e9(1001)
[3] 038C.0E20::12/01/22-04:11:45.7226800 [LAPS] lapscore_cxx1424 LapsCore::CheckADPasswordUpdateFactors() - dwLastAccountRidUpdated and dwLocalAdminAccountRid are the same - dwLastAccountRidUpdated:0x3e9(1001) dwLocalAdminAccountRid:0x3e9(1001)
[3] 038C.0E20::12/01/22-04:11:45.7226808 [LAPS] lapscore_cxx1451 LapsCore::CheckADPasswordUpdateFactors() - Managed account name is the same - no update required pszAccount:admin pRegistryState->AdministratorAccountName():HelpdeskAdmins
[3] 038C.0E20::12/01/22-04:11:45.7226814 [LAPS] lapscore_cxx1478 LapsCore::CheckADPasswordUpdateFactors() - PolicySource same as before - no update needed; currentLapsPolicySource:2(GPO) lastLapsPolicySource:2(GPO)
[3] 038C.0E20::12/01/22-04:11:45.7226817 [LAPS] lapscore_cxx1507 LapsCore::CheckADPasswordUpdateFactors() - Current DSRM mode same as before
[3] 038C.0E20::12/01/22-04:11:45.7226822 [LAPS] lapscore_cxx7498 TraceTimestamp() - ullLdapPwdExpirationTimestamp: Local: 12/03/2022-04:06:15.212 (UTC: 12/03/2022-12:06:15.212)
[3] 038C.0E20::12/01/22-04:11:45.7226827 [LAPS] lapscore_cxx1546 LapsCore::CheckADPasswordUpdateFactors() - Current password is still good (not yet expired)
[3] 038C.0E20::12/01/22-04:11:45.7226830 [LAPS] lapscore_cxx1577 LapsCore::CheckADPasswordUpdateFactors() - No need to update password due to PwdExpirationProtectionEnabled policy lDaysToChange:0x2(2) PasswordAgeDays:0x2(2)
[3] 038C.0E20::12/01/22-04:11:45.7229009 [LAPS] ldapcomputer_cxx1696 LdapComputer::BuildAndValidatePolicyEncryptionTarget() - Encryption target principal not specified in policy - defaulted to DomainAdmins
[3] 038C.0E20::12/01/22-04:11:45.7229030 [LAPS] ldapcomputer_cxx1791 LdapComputer::BuildAndValidatePolicyEncryptionTarget() - Encryption principal sid:S-1-5-21-1694629803-330140810-444329382-512
[3] 038C.0E20::12/01/22-04:11:45.7229041 [LAPS] lapscore_cxx1659 LapsCore::CheckADPasswordUpdateFactors() - Encryption targets are the same - no update required pszEncryptionTargetSid:S-1-5-21-1694629803-330140810-444329382-512 pszLastEncryptionTargetSid:S-1-5-21-1694629803-330140810-444329382-512
[3] 038C.0E20::12/01/22-04:11:45.7229045 [LAPS] lapscore_cxx1677 LapsCore::CheckADPasswordUpdateFactors() - Returning *pulPasswordUpdateFactors:0x0
[3] 038C.0E20::12/01/22-04:11:45.7229048 [LAPS] lapscore_cxx1838 LapsCore::DoADCoreProcessing() - CheckADPasswordUpdateFactors returned ulPasswordUpdateFactors:0x0
[3] 038C.0E20::12/01/22-04:11:45.7229081 [LAPS] lapscore_cxx1874 LapsCore::DoADCoreProcessing() - fPasswordUpdateRequired is FALSE - exiting
[3] 038C.0E20::12/01/22-04:11:45.7231006 [LAPS] lapscore_cxx2030 LapsCore::DoADCoreProcessing() - Returning hr:0x0
[3] 038C.0E20::12/01/22-04:11:45.7231012 [LAPS] lapscore_cxx2233 LapsCore::DoCoreProcessing() - DoADCoreProcessing returned hr:0x0
[3] 038C.0E20::12/01/22-04:11:45.7231027 [LAPS] requesttracker_cxx265 LapsCore::DoCoreProcessing() - Successfully marked operation as Completed operationId:fc3a99ee-165b-474d-9fc1-0828622617d2 requestId:NULL hrOutcome:0x0
[3] 038C.0E20::12/01/22-04:11:45.7231058 [LAPS] operations_cxx82 LapsBackgroundOperation::DoWork() - _pLapsCore->DoCoreProcessing returned _hrResult:0x0
```

## Scenario 2: Admin requests a password change by executing a Reset-LapsPassword command

### Log Analysis
The phases mentioned above from Phase 1 to Phase 7 are identical, and there is a change in the last phase.

### Phase 8
LAPS Core reviews the parameter sent via the Reset-LapsPassword and resets the password. Below you will find that the reset was done due to an admin request.

```
0] 038C.03F8::12/01/22-04:32:39.8504044 [LAPS] lapscore_cxx1838 LapsCore::DoADCoreProcessing() - CheckADPasswordUpdateFactors returned ulPasswordUpdateFactors:0x0
[0] 038C.03F8::12/01/22-04:32:39.8504047 [LAPS] lapscore_cxx1846 LapsCore::DoADCoreProcessing() - Forcing password reset due to admin request ulPasswordUpdateFactors:0x0
[0] 038C.03F8::12/01/22-04:32:39.8504049 [LAPS] lapscore_cxx1887 LapsCore::DoADCoreProcessing() - fPasswordUpdateRequired is TRUE - starting password update process
[0] 038C.03F8::12/01/22-04:32:39.8504051 [LAPS] lapscore_cxx1894 LapsCore::DoADCoreProcessing() - LocalAdminAccount::CreateNewValidatedPassword
[1] 038C.03F8::12/01/22-04:32:39.8510417 [LAPS] lapscore_cxx1913 LapsCore::DoADCoreProcessing() - Calling pLdapComputer->UpdateNewPassword
[1] 038C.03F8::12/01/22-04:32:39.8510424 [LAPS] ldapcomputer_cxx3036 LdapComputer::UpdateNewPassword() - Updating AD state using modern LAPS policies
```

### Phase 9
LAPS Core performs the following phases:
1. Resets the local admin account (HelpdeskAdmins) using the Set Password API.
2. Sends an LDAP Modify request with the new password and sets the expiry time.   
```
[1] 038C.03F8::12/01/22-04:32:39.8512376 [LAPS] ncrypthelpers_cxx359 EncryptBufferNCrypt() - Starting cbData:0x72
[2] 038C.03F8::12/01/22-04:32:39.8607839 [LAPS] ncrypthelpers_cxx240 EncryptOrDecrypt() - NCryptStreamOpenToProtect succeeded
[2] 038C.03F8::12/01/22-04:32:39.8607901 [LAPS] ncrypthelpers_cxx312 EncryptOrDecrypt() - NCryptStreamUpdate succeeded
[2] 038C.03F8::12/01/22-04:32:39.8607941 [LAPS] ncrypthelpers_cxx384 EncryptBufferNCrypt() - Succeeded - *pcbEncryptedData:0x4d2
[2] 038C.03F8::12/01/22-04:32:39.8608027 [LAPS] ldapcomputer_cxx2886 LdapComputer::UpdateNewPasswordHelper() - Calling ldap_modify_ext_sW with new password and expiry timestamp
[2] 038C.03F8::12/01/22-04:32:39.8683015 [LAPS] ldapcomputer_cxx2907 LdapComputer::UpdateNewPasswordHelper() - ldap_modify_ext_sW succeeded
[2] 038C.03F8::12/01/22-04:32:39.8683094 [LAPS] lapscore_cxx1969 LapsCore::DoADCoreProcessing() - Calling ResetLocalAdminAccountPassword
[2] 038C.03F8::12/01/22-04:32:39.8683099 [LAPS] lapscore_cxx2836 LapsCore::ResetLocalAdminAccountPassword() - Starting - setting _dwPasswordModThreadId from 0x0 to 0x3f8
[2] 038C.03F8::12/01/22-04:32:39.8683107 [LAPS] localadminaccount_cxx56 LapsCore::ResetLocalAdminAccountPassword() - Calling SamISetPasswordForeignUser2 to set new password _pszFullyQualifiedAccountName:CLIENT\admin
[2] 038C.03F8::12/01/22-04:32:39.8684968 [LAPS] lapsext_cxx155 LAPSExtAcceptPasswordModification() - Starting
[2] 038C.03F8::12/01/22-04:32:39.8684974 [LAPS] lapscore_cxx3360 LapsCore::AcceptPasswordModification() - AcceptPasswordModification for account AccountName:admin AccountRid:0x3e9(1001)
[2] 038C.03F8::12/01/22-04:32:39.8684990 [LAPS] gpoconfig_cxx359 GPOConfig::TraceState() - GPOConfig: _PolicySource:GPO _BackupDirectory:AD _dwPwdAgeDays:2 _dwPwdComplexity:4 _dwPwdLength:14 _pszAdminName:admin _fPwdExpirationProtectionRequired:TRUE _fADPasswordEncryptionEnabled:TRUE _pszADPasswordEncryptionPrincipal:NULL _dwADEncryptedPasswordHistorySize:0x0 _fADBackupDSRMPassword:FALSE _dwPostAuthResetDelay:24 _dwPostAuthActions:3
[2] 038C.03F8::12/01/22-04:32:39.8686063 [LAPS] registrystate_cxx1594 RegistryState::CheckIfLegacyLapsInstalled() - Got file-not-found on legacy LAPS CSE regkey: Software\Microsoft\Windows NT\CurrentVersion\Winlogon\GPExtensions\{D76B9641-3288-4f75-942D-087DE603E3EA}
[2] 038C.03F8::12/01/22-04:32:39.8686181 [LAPS] lapscore_cxx3450 LapsCore::AcceptPasswordModification() - Allowing (own) password update of managed account currentThreadId:0x3f8 AccountRid:0x3e9(1001)
[2] 038C.03F8::12/01/22-04:32:39.8686199 [LAPS] lapsext_cxx163 LAPSExtAcceptPasswordModification() - Returning fResult:0x1
[2] 038C.03F8::12/01/22-04:32:39.9053025 [LAPS] localadminaccount_cxx79 LapsCore::ResetLocalAdminAccountPassword() - SamISetPasswordForeignUser2 succeeded
[2] 038C.03F8::12/01/22-04:32:39.9053030 [LAPS] lapscore_cxx2861 LapsCore::ResetLocalAdminAccountPassword() - Returning hr:0x0
[2] 038C.03F8::12/01/22-04:32:39.9055629 [LAPS] lapscore_cxx3002 LapsCore::UpdateRegistryStateOnSuccessfulADUpdate() - Updated all registry state after successful AD password update
[2] 038C.03F8::12/01/22-04:32:39.9058735 [LAPS] lapscore_cxx2030 LapsCore::DoADCoreProcessing() - Returning hr:0x0
[2] 038C.03F8::12/01/22-04:32:39.9058740 [LAPS] lapscore_cxx2233 LapsCore::DoCoreProcessing() - DoADCoreProcessing returned hr:0x0
[2] 038C.03F8::12/01/22-04:32:39.9058756 [LAPS] requesttracker_cxx265 LapsCore::DoCoreProcessing() - Successfully marked operation as Completed operationId:f905ac2c-4307-46e5-9dee-3d8fa1a741da requestId:NULL hrOutcome:0x0
[2] 038C.03F8::12/01/22-04:32:39.9058788 [LAPS] operations_cxx82 LapsBackgroundOperation::DoWork() - _pLapsCore->DoCoreProcessing returned _hrResult:0x0
```



# Need additional help or have feedback?

| **Learn more about the Windows LAPS** | **If you need more help, email DSPOD DL** | **To provide feedback to this workshop** |
|---|---|---|
| **Visit** the [Windows LAPS documentation](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overv) | **Email** DSPOD DL | **Provide feedback** to this workshop |
