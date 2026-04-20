# ENTRA-ID Kerberos Auth & Delegation — Detailed Troubleshooting Guide

**Entries**: 119 | **Drafts fused**: 49 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-kerberos-action-plan-templates.md, ado-wiki-a-kerberos-constrained-delegation-kcd-s4u2proxy.md, ado-wiki-a-kerberos-delegation-in-general.md, ado-wiki-a-kerberos-protocol-transition-s4u2self.md, ado-wiki-a-kerberos-resource-based-constrained-delegation.md, ado-wiki-a-kerberos-unconstrained-delegation.md, ado-wiki-a-kerberos-user-to-user-authentication-u2u.md, ado-wiki-b-configure-gmsa-kerberos-delegation.md, ado-wiki-b-kerberos-forest-trust.md, ado-wiki-b-kerberos-klist-features.md
**Generated**: 2026-04-07

---

## Phase 1: Azure Files
> 9 related entries

### Azure Files storage account AD DS join script runs successfully but FSLogix/Kerberos authentication fails afterward when accessing Azure Files shares.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Join-AzStorageAccount script parameters silently accept wrong values: 1) EncryptionType must be exact string like 'AES256', not template format '<AES256|RC4|AES256,RC4>'. 2) SamAccountName must be 'domain\computerName' without trailing '$' sign. Script completes without errors even with wrong parameters but Kerberos auth fails at runtime.

**Solution**: Re-run Join-AzStorageAccount with correct parameters: $EncryptionType = 'AES256' (exact string). $SamAccountName = 'domain\computerName' (no trailing $). After fixing, verify AD object was created correctly and test access.

---

### Error 0x51f running 'klist get' for Azure SQL MI or Azure File Share. Fiddler tool installed on system.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Fiddler installs proxy config that interferes with Kerberos KDC proxy communication.

**Solution**: Uninstall Fiddler and delete registry keys under HKLM\SYSTEM\CurrentControlSet\Services\iphlpsvc\Parameters\ProxyMgr (and ControlSet001/002).

---

### Error 0x51f mounting Azure File Share with per-user MFA Enforce enabled on user account.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Per-user MFA 'Enforce' mode blocks Kerberos ticket acquisition for Azure File Share. No workaround for Enforce mode.

**Solution**: Disable per-user MFA 'Enforce' option. Use Conditional Access policies for MFA instead.

---

### Error 0x51f with 'ProxyHelperClientGetProxyForUrl failed: 1753' in Kerberos ETL. WinHTTP or IP Helper service not running.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: WinHTTP Web Proxy Auto-Discovery Service (WinHttpAutoProxySvc) or IP Helper service (iphlpsvc) stopped/disabled.

**Solution**: Ensure WinHttpAutoProxySvc and iphlpsvc services are running.

---

### After rotating Azure AD Kerberos trust key (Set-AzureAdKerberosServer -RotateServerKey), Azure File Share access via referral tickets breaks for ~2...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Entra ID activates new keys after 24h by default, causing mismatch and Kerberos ticket decryption failures (0xc000009a, KRB_AP_ERR_MODIFIED).

**Solution**: Delete trust and recreate: Remove-AzureADKerberosServerTrustedDomainObject then Set-AzureAdKerberosServer -SetupCloudTrust. Avoid rotation until fix released.

---

### Azure File Share mount fails with error 50076 'multi-factor authentication required' when CA policy targets Storage SPN.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Conditional Access policy applied to Azure Storage Service Principal (SPN) requires MFA which cannot be satisfied during Kerberos ticket acquisition.

**Solution**: Exclude Azure Storage SPN from the Conditional Access policy.

---

### Azure File Share mount fails with AADSTS50105 when 'Assignment required' enabled on Storage Service Principal in Enterprise Apps.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SP used by AAD only for Kerberos ticket issuance, not Azure Files authorization. Enabling assignment required blocks ticket issuance.

**Solution**: Disable 'Assignment required' on Storage Account SP. Use VNet ACLs, RBAC, file ACLs for access control.

---

### Azure Files AD DS authentication fails with Kerberos encryption type mismatch; storage account SPN ticket cannot be obtained; Get-ADUser shows msDS...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AES 256 encryption type was configured on the AD DS storage account object after initial creation, but the storage account password was not rotated to generate new keys aligned with the updated encryption type

**Solution**: Follow MS docs to (1) enable AES 256 encryption on the AD DS storage account and (2) update/rotate the password for the AD DS storage account identity. Verify with Get-ADUser that msDS-SupportedEncryptionTypes=16 (AES256). Ref: https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-ad-ds-enable#enable-aes-256-encryption-recommended

---

### Azure File Share access lost after 10+ hours on Entra ID Joined device (e.g., FSLogix VHD in AVD). Error 0xc000018b.
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Expiring cloud TGT triggers inappropriate Kerberos referral. Applies when both Cloud TGT + on-prem TGT present, Entra ID Joined with cloud trust.

**Solution**: Workaround: set up Kerberos incoming trust. Check internal wiki for official resolution.

---

## Phase 2: Seamless Sso
> 9 related entries

### Seamless SSO fails after enabling via AAD Connect wizard; AADSTS81004 Kerberos authentication failed; AZUREADSSOACCT computer account missing in on...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: AZUREADSSOACCT computer account not created in on-premises AD when enabling Seamless SSO

**Solution**: Reset SSO feature using Azure AD PowerShell (5-step process per MS docs). Verify AZUREADSSOACCT computer account appears in computer OU

---

### Seamless SSO fails in IE; Fiddler shows Frame returned code 105 IFrame Running in un-trusted zone Integrated Windows Authentication failed
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: IE setting Allow status bar updates via script is disabled in Local Intranet zone, blocking Seamless SSO iframe processing

**Solution**: Enable Allow status bar updates via script in Internet Options > Local Intranet > Custom Level

---

### Seamless SSO AES ticket processing long latency - user on domain-joined machine gets password prompt instead of DSSO, requires 4-5 retries
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Windows SSPI API used for AES Kerberos ticket decryption introduces latency; sso request response does not arrive within the 10s timeout

**Solution**: Workaround: switch AZUREADSSOACC to RC4 encryption type and roll over Kerberos keys. Permanent fix requires moving from SSPI API to Kerberos.Net.

---

### Users cannot benefit from Seamless SSO after Kerberos key rolled over more than once
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Entra stores only current and previous Kerberos key; rolling over more than once invalidates TGS tickets issued with older key

**Solution**: Wait up to 10 hours for TGS to renew, or flush Kerberos cache with klist purge on affected machines (no admin rights required)

---

### Seamless SSO flow takes longer than 10 seconds causing password dialog in Edge/Chrome with outbound web proxy when internal DNS cannot resolve publ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Browser attempts DNS resolution for autologon.microsoftazuread-sso.com before sending Kerberos ticket; DNS delays from Suffix Search List and blocked root hints exceed 10s SSO timeout

**Solution**: Create an empty forward lookup zone named autologon.microsoftazuread-sso.com on the internal DNS server to speed up name resolution

---

### Internal error during DesktopSsoNumOfDomains process when enabling Seamless SSO or rolling over Kerberos keys for multiple forests
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Seamless SSO policy has 25600 character limit in Entra ID; standard Kerberos rollover doubles info stored per domain suffix which can exceed the limit

**Solution**: Options: (1) Remove unused domain suffixes, (2) Use Hybrid Entra Join, (3) Setup forest trust and enable SSO for one forest only, (4) Disable and re-enable SSO (acts as rollover, may disrupt up to 10 hours). Verify policy size via ASC Tenant Policy.

---

### Update-AzureADSSOForest fails with TargetInvocationException during Kerberos key rollover; network trace shows SAMR SamrConnect5 rejected with Stat...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Domain Controller has RestrictRemoteSam policy/registry key set blocking SAM Remote Protocol connection needed by NetUserSetInfo/SetPassword during key rollover

**Solution**: Remove RestrictRemoteSam registry key from DCs: Remove-ItemProperty -Path HKLM:\System\CurrentControlSet\Control\Lsa -Name restrictremotesam. Check GPresult for domain GPO applying this setting. Reboot DCs after removal.

---

### Update-AzureADSSOForest/Enable-AzureADSSOForest fails with permission error after Granting full control to account admins step when run by delegate...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Without -PreserveCustomPermissionsOnDesktopSsoAccount switch the cmdlet removes inherited permissions from AZUREADSSOACC and grants full control to enterprise admin; delegated admins lack permissions

**Solution**: Re-run with -PreserveCustomPermissionsOnDesktopSsoAccount switch: Update-AzureADSSOForest -OnPremCredentials $creds -PreserveCustomPermissionsOnDesktopSsoAccount

---

### Seamless SSO fails in IE. Fiddler shows 'Frame returned code 105 with message IFrame: Running in an un-trusted zone. Integrated Windows Authenticat...
**Score**: 🔵 7.0 | **Source**: OneNote

**Root Cause**: IE setting 'Allow status bar updates via script' is disabled under Internet Options > Local Intranet > Custom Level. Seamless SSO requires this setting to check/change status bar during SSO IFrame flow.

**Solution**: Enable 'Allow status bar updates via script' in IE: Internet Options > Security > Local Intranet > Custom Level > Scripting > 'Allow status bar updates via script' > Enable.

---

## Phase 3: Azure Fileshare
> 7 related entries

### Error 0x51f when running klist get MSSQLSvc/<name>.database.windows.net:1433. Kerberos ticket acquisition fails for Azure SQL MI or Azure Fileshare.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Fiddler tool installs a proxy configuration that interferes with Kerberos KDC proxy connections.

**Solution**: Uninstall Fiddler. Delete registry keys related to Fiddler under HKLM\SYSTEM\CurrentControlSet\Services\iphlpsvc\Parameters\ProxyMgr (and all ControlSet copies).

---

### Error 0x51f accessing Azure File Shares. Kerberos.etl shows failed to open connection to kdc proxy: 0x2ee5 (ERROR_INTERNET_INVALID_URL).
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: KDC proxy server URL in Group Policy missing required space at end of /kerberos before the closing slash, or contains invisible characters/typos.

**Solution**: Ensure URL format has a space after /kerberos in the KDC proxy URL value. Validate URL for invisible characters. Reference: Azure SQL MI incoming trust-based flow docs.

---

### Error 0x51f mounting Azure Fileshare via net use. klist shows Error calling API LsaCallAuthenticationPackage substatus 0x51f. Message: The password...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User account has per-user MFA set to Enforce. Azure AD Kerberos-based authentication does not support per-user MFA Enforce.

**Solution**: Disable the per-user MFA Enforce option. No workaround available with Enforce enabled.

---

### Error 0x51f accessing Azure resources. Kerberos.etl shows ProxyHelperClientGetProxyForUrl failed: 1753. cloud_debug shows KDC proxy present in cach...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: WinHTTP Web Proxy Auto-Discovery Service (WinHttpAutoProxySvc) or IP Helper service (iphlpsvc) is not running.

**Solution**: Ensure WinHTTP Web Proxy Auto-Discovery Service and IP Helper service are set to Running state.

---

### Customer can access Azure MI or Azure Fileshare on-prem but authentication fails when connected over Always VPN.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: VPN client stores credentials in Credential Manager. Cached RAS credentials interfere with Kerberos authentication.

**Solution**: Remove cached RAS credentials. See internal KB 3682d54a for methods to disable cached credentials.

---

### Error mounting Azure Fileshare: Account restrictions preventing this user from signing in. ASC shows errorCode 50076: must use multi-factor authent...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Conditional Access policy applied to Azure Storage Service Principal Name blocks Kerberos auth which cannot satisfy MFA requirement.

**Solution**: Exclude the SPN of the Storage account from the Conditional Access policy.

---

### Error accessing Azure FileShare after enabling Assignment required under Azure Fileshare Service Principal. Sign-in error 50105 AADSTS50105: user b...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Azure Fileshare SP is used by AAD to issue Kerberos tickets, not for direct authorization. Enabling assignment required blocks ticket issuance.

**Solution**: Do not enable Assignment required on the Azure Fileshare Service Principal. Use VNet ACLs, RBAC, and file-level ACLs for authorization instead.

---

## Phase 4: Setup
> 6 related entries

### Set-AzureAdKerberosServer fails: 'missing required properties. Property: UserAccount.SecondaryKrbTgtNumber Value:0'.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: $domainCred lacks sufficient privileges. Must be Domain Admins (root domain) AND Enterprise Admins (forest).

**Solution**: Ensure $domainCred is member of Domain Admins in root domain AND Enterprise Admins for the forest.

---

### Set-AzureADKerberosServer fails: 'The user has insufficient access rights' when creating AzureADKerberos object.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Account lacks SeEnableDelegationPrivilege on DCs, needed to set TRUSTED_TO_AUTH_FOR_DELEGATION. GPO may override default.

**Solution**: Check gpresult for 'Enable computer and user accounts to be trusted for delegation' policy. Add builtin\Administrators to winning GPO.

---

### Set-AzureAdKerberosServer fails: 'Strong authentication is required for this operation' (DirectoryOperationException). Root domain DC requires LDAP...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Mismatch: ldapserverintegrity=2 on root DC vs ldapClientIntegrity=0 on client. DC requires signed LDAP binds.

**Solution**: Set LdapClientIntegrity=2 on client registry (HKLM\System\CurrentControlSet\Services\LDAP). Configure GPO: Network security > LDAP client signing > Require signing.

---

### Set-AzureAdKerberosServer fails on Windows Server 2025: '2.2.10.6 Primary:Kerberos-Newer-Keys. ServiceCredentials MUST be zero'.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug in AzureADHybridAuthenticationManagement module versions older than 2.4.71.0 on Windows Server 2025.

**Solution**: Update to AzureADHybridAuthenticationManagement module v2.4.71.0+ from PowerShell Gallery.

---

### 'Could not load file or assembly Microsoft.Online.PasswordSynchronization.Rpc.dll' when using AzureADHybridAuthenticationManagement module.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: VC++ 2013 Runtime (x64) not installed. Module auto-install fails due to deprecated -Path parameter in newer VcRedist module.

**Solution**: Update to AzureADHybridAuthenticationManagement v2.4.71.0. Or manually install VC++ 2013 x64 Runtime.

---

### Set-AzureAdKerberosServer fails: 'Collision setting top level names on trust KERBEROS.MICROSOFTONLINE.COM'.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: 'windows.net' top-level name already in Name Suffix Routing of another AD trust, conflicting with Azure AD Kerberos trust.

**Solution**: Open AD Domains And Trusts > check trust properties > Name Suffix Routing > remove entry containing 'windows.net' from conflicting trust.

---

## Phase 5: Set Azureadkerberosserver
> 6 related entries

### Set-AzureAdKerberosServer fails: Azure AD Kerberos Server object in Active Directory is missing required properties. Property: UserAccount.Secondar...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The domain credential used is not a member of both Domain Admins group in Root domain AND Enterprise Admins group for the forest.

**Solution**: Use a credential that is member of Domain Admins in Root domain AND Enterprise Admins for the forest.

---

### Set-AzureADKerberosServer fails: Failed to create Azure AD Kerberos Server: Error sending directory request: The user has insufficient access right...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Account lacks SeEnableDelegationPrivilege on DCs, required to set TRUSTED_TO_AUTH_FOR_DELEGATION on the AzureADKerberos object.

**Solution**: Run gpresult /h on DC. Check Enable computer and user accounts to be trusted for delegation policy includes builtin\Administrators. If missing, edit Default Domain Controller Policy to add the group. Run gpupdate /force.

---

### Set-AzureAdKerberosServer fails: Failed to connect to domain: Strong authentication is required for this operation. LDAP response: server requires ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Discrepancy between ldapserverintegrity=2 on root domain DC and LdapClientIntegrity=0 on the client machine.

**Solution**: Set LdapClientIntegrity=2 on client via Group Policy: Computer Configuration > Windows Settings > Security Settings > Local Policies > Security Options > Network security: LDAP client signing requirements = Require signing.

---

### Set-AzureADKerberosServer fails: Collision setting top level names on trust KERBEROS.MICROSOFTONLINE.COM.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Another forest trust already has windows.net in its Name Suffix Routing list, colliding with the KERBEROS.MICROSOFTONLINE.COM trust TopLevelNames.

**Solution**: Open Active Directory Domains and Trusts > domain properties > Trust tab > check Name Suffix Routing for each trust > remove the entry that includes windows.net.

---

### Set-AzureADKerberosServer fails: Could not load file or assembly Microsoft.Online.PasswordSynchronization.Rpc.dll. Missing VC Redist 2012/2013.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AzureADHybridAuthenticationManagement module install script uses deprecated -Path parameter in VcRedist module, causing silent VC Redist install failure.

**Solution**: Upgrade to AzureADHybridAuthenticationManagement v2.4.71.0, or manually install VC Redist 2013 x64 from official download page.

---

### Set-AzureADKerberosServer fails on Windows Server 2025: ArgumentOutOfRangeException Primary:Kerberos-Newer-Keys ServiceCredentials MUST be zero. Fa...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known issue in AzureADHybridAuthenticationManagement modules older than v2.4.71.0 when running against Windows Server 2025 DCs.

**Solution**: Upgrade to AzureADHybridAuthenticationManagement v2.4.71.0 which contains the fix. See ADO work item 3090723.

---

## Phase 6: Adfs
> 5 related entries

### All O365 Basic Auth clients unable to access email. Modern Auth and OWA work fine. ADFS external auth fails on usernamemixed endpoint.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: ADFS Extranet Lockout depends on PDC. When PDC unavailable, lockout blocks all external Basic Auth. Debug logs show AccountLockoutPolicy errors.

**Solution**: Disable Extranet Lockout: Set-AdfsProperties -EnableExtranetLockout $false. Fix PDC/Kerberos. Diagnostic: test IDP-initiated page internally vs externally.

---

### ADFS Smart Lockout PowerShell cmdlets return 401 Unauthorized error on ADFS 4.0 (Windows Server 2016). ESL works but management cmdlets fail.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Duplicate SPN registered on two different AD accounts. ADFS internal REST API calls /adfs/users/ endpoint. Kerberos auth fails due to duplicate SPN, falling back to NTLM which is denied.

**Solution**: Check for duplicate SPNs using setspn -Q. Remove the duplicate SPN registration from the incorrect account. After removing duplicate, ADFS management cmdlets work correctly.

---

### Kerberos authentication fails with KDC_ERR_ETYPE_NOTSUPP error in ADFS environment. Network trace shows AS Request followed by KRB_ERROR - KDC_ERR_...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Encryption type mismatch between client, ADFS service account, and domain controller. Group Policy "Network security: Configure encryption types allowed for Kerberos" is misconfigured, or ADFS service account in AD does not have AES encryption support enabled (msDS-SupportedEncryptionTypes).

**Solution**: Ensure GPO encryption type settings match across all servers. For standard accounts: enable "This account supports Kerberos AES 128/256 bit encryption" in AD account properties. For gMSA accounts: verify msDS-SupportedEncryptionTypes attribute is populated via Attribute Editor in ADUC Advanced Features view.

---

### gMSA password retrieval fails. Netlogon.log shows [MSA] NetpGMSAAddWrapper failed 0xc0000719 with message Supported encryption types did not match.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: msDS-SupportedEncryptionTypes attribute on the ADFS server computer account does not match the gMSA account encryption types in Active Directory.

**Solution**: Review msDS-SupportedEncryptionTypes attribute on both the ADFS server computer object and the gMSA account in AD. Ensure encryption types match. Reference: https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/decrypting-the-selection-of-supported-kerberos-encryption-types/ba-p/1628797

---

### Get-AdfsAccountActivity throws Exception of type Microsoft.IdentityServer.User.UserActivityRestServiceException was thrown when querying ESL accoun...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Misconfigured ADFS ServicePrincipalName (SPN) registration breaking Kerberos authentication on the ADFS REST API endpoint used by ESL management cmdlets.

**Solution**: Verify that HOST SPN (HOST/<ADFSFarmName>) or explicit HTTP SPN (HTTP/<ADFSFarmName>) are only registered on the ADFS service account. Check for and remove any duplicate SPN registered on different accounts in Active Directory using setspn -X.

---

## Phase 7: App Proxy
> 5 related entries

### Application Proxy or Web Application Proxy Kerberos Constrained Delegation (KCD) SSO fails after installing November 9, 2021 Windows Update on Doma...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: November 9, 2021 Windows Update (KB5007206/KB5007192/KB5007247/KB5007260/KB5007236/KB5007263) introduced a Kerberos S4U regression (ICM 271547888) that breaks S4u2self evidence ticket authentication used by App Proxy/WAP for KCD.

**Solution**: Install Out-of-Band hotfix released Nov 15, 2021 (see https://docs.microsoft.com/windows/release-health/windows-message-center#2750). Target DCs in AD Sites where App Proxy Connector/WAP servers are located (use nltest /dsgetsite to identify). For Azure AD DS, PG deployed backend fix automatically. Alternative (not recommended): uninstall the problematic KB from affected DCs. Kdcsvc Event 35-38 warnings on DC are normal after hotfix and can be ignored. Case closure RC: CID App Int and Dev > Micr

---

### Kerberos SSO via Microsoft Entra Application Proxy fails after applying July 2019 Windows security updates in cross-forest scenarios where unconstr...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: July 2019 security update (KB4490425) blocks TGT delegation for unconstrained delegation across forest, external, and quarantined trusts. Active Directory domain controllers intentionally reject tickets with unconstrained delegation over these trust types.

**Solution**: Reconfigure from Kerberos Unconstrained Delegation to Resource Based Kerberos Constrained Delegation. Use Set-ADUser or Set-ADComputer with -PrincipalsAllowedToDelegateToAccount pointing to the connector server computer object. Requirements: 2-way forest trust, at least one Windows Server 2012+ DC in each domain, proper name suffix routing on trust.

---

### Kerberos authentication fails when accessing application published via App Proxy running on third-party web server (Linux/Unix). Browser shows Kerb...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SPNEGO (Simple and Protected GSSAPI Negotiation Mechanism) is not enabled by default on the App Proxy Connector. Third-party web servers (Linux/Unix) require SPNEGO for Kerberos authentication.

**Solution**: Enable SPNEGO on the connector by setting registry key: REG ADD HKLM\SOFTWARE\Microsoft\Microsoft AAD App Proxy Connector /v UseSpnegoAuthentication /t REG_DWORD /d 1. Then restart connector service: net stop WAPCSvc && net start WAPCSvc. Must be done on each connector server.

---

### Kerberos with SPNEGO authentication fails after upgrading connector to rebranded Microsoft Entra private network connector. Registry key UseSpnegoA...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The rebranded connector reads registry from HKLM\SOFTWARE\Microsoft\Microsoft Entra private network connector but the UseSpnegoAuthentication key was set under the old path HKLM\SOFTWARE\Microsoft\Microsoft AAD App Proxy Connector.

**Solution**: Also create the registry key under the old path: REG ADD HKLM\SOFTWARE\Microsoft\Microsoft AAD App Proxy Connector /v UseSpnegoAuthentication /t REG_DWORD /d 1, then restart: net stop WAPCSvc && net start WAPCSvc. Issue under investigation by PG.

---

### Application Proxy KCD (Kerberos Constrained Delegation) single sign-on fails. Data collector script shows connector server computer object has inco...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Connector AD computer account delegation is not configured correctly - 'Trust this computer for delegation to specified services only' with 'Use any authentication protocol' is not selected, or the SPN for delegation does not match the SPN configured in the Application Proxy app IWA SSO settings.

**Solution**: Open AD Users and Computers (dsa.msc) > locate connector computer object > Properties > Delegation tab > select 'Trust this computer for delegation to specified services only' and 'Use any authentication protocol' > add the SPN. Verify msds-allowedtodelegateto contains the SPN matching the App Proxy IWA SSO configuration. useraccountcontrol must be 16781312.

---

## Phase 8: Rc4
> 5 related entries

### Kerberos authentication failures for legacy applications after installing November 2022 (11B.22) updates - apps relying on RC4 session keys can no ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: RC4 session key usage deprecated and moved to unsupported in 11B.22. RC4 ticket encryption still supported, but session keys now require AES. Platforms not supporting AES (pre-Windows Server 2008) fail.

**Solution**: 1) RC4 ticket encryption still works if msds-SupportedEncryptionTypes configured correctly. 2) For legacy apps unable to use AES, contact stillneedrc4@microsoft.com. 3) Long-term: upgrade legacy applications to support AES.

---

### Kerberos authentication failures on domain controllers after mid-2026 update - RC4 disabled by default on KDC role for Windows Server 2008+, servic...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CVE-2026-20833 changes DC KDC defaults to only allow AES-SHA1. RC4 disabled by default via RC4DefaultDisablementPhase registry key. Legacy RC4-dependent authentication breaks unless explicitly configured.

**Solution**: 1) Before update: detect RC4 usage via 'Beyond RC4 for Windows authentication' blog. 2) Migrate service accounts/apps to AES-SHA1. 3) If needed, explicitly configure RC4 via RC4DefaultDisablementPhase registry. Refer to KB for CVE-2026-20833.

---

### Azure Files SMB mount fails with Access Denied after Kerberos RC4 enforcement update (April 2026). Storage account configured via AzFilesHybrid ver...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Older Azure Files deployments were hard-coded to use RC4-HMAC for Kerberos authentication. After enforcement, KDC refuses RC4 tickets.

**Solution**: Route to Azure Files/Storage team. Update the storage account encryption to AES-256 via Azure portal or PowerShell. Directory Services cannot fix this via AD configuration changes.

---

### Linux/NAS/SAN file share authentication fails after Kerberos RC4 enforcement. Keytab generated with only RC4 encryption types. krb5.conf restricts ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Keytab files on Linux/NAS/SAN were generated containing only RC4 encryption types, which are blocked after DC enforcement update.

**Solution**: 1) Verify computer object msDS-SupportedEncryptionTypes includes AES (0x18/24 decimal) 2) Regenerate keytab on Linux/NAS to include AES keys 3) Upgrade Samba to 4.24+ which defaults to AES. Route to Networking team.

---

### Application fails with KDC_ERR_ETYPE_NOSUPP (0x12) after Kerberos RC4 enforcement. Users see repeated credential prompts or sudden spike in NTLM fa...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Client application only supports RC4 but KDC enforces AES-only. No common encryption type for session. Silent Kerberos failure causes NTLM fallback or infinite credential prompt loop.

**Solution**: Identify the RC4-dependent client/application. Update to support AES encryption. If legacy app, contact vendor for update. Check KDCSVC Event 203/204 on DCs to confirm RC4 block. Avoid NTLM fallback as it introduces relay attack risk.

---

## Phase 9: Application Proxy
> 3 related entries

### Kerberos Constrained Delegation (KCD) fails for Microsoft Entra Application Proxy published application with KDC_ERR_C_PRINCIPAL_UNKNOWN error visi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The S4U2Self request requires access to the TokenGroupsGlobalAndUniversal user-constructed attribute, which requires specific AD permissions. The Proxy connector computer account lacks these permissions.

**Solution**: Add the Application Proxy connector computer account as a member of the Active Directory Built-in Group: Windows Authorization Access Group. This grants the necessary permissions for S4U2Self requests.

---

### User accessing app published via Microsoft Entra Application Proxy with Integrated Windows Authentication (IWA) SSO gets Forbidden error: This corp...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Backend web server responds with HTTP 401 because it does not accept Kerberos authentication via KCD. The www-Authenticate headers show NTLM only (no Negotiate/Kerberos). The App Proxy connector obtained a Kerberos ticket but backend rejected it. HTTP 401 is converted to HTTP 403 by App Proxy to prevent browser auth popup since the connector (not the browser) authenticates to the backend

**Solution**: Verify backend Kerberos config via Kusto - check www-Auth headers in CopyBackendResponseHeaders trace. If www-Auth lacks Negotiate/Kerberos: (1) Configure backend app for Kerberos auth, (2) For IIS: enable Windows Auth with Negotiate, disable Extended Protection, set useAppPoolCredentials=True if service account, (3) For SPNEGO/Linux: enable UseSpnegoAuthentication on connector, (4) Try On-premises SAM account name as logon identity, (5) Ensure single service account per published app. After cha

---

### KDC_ERR_S_PRINCIPAL_UNKNOWN error in Kerberos network trace when using Integrated Windows Authentication (IWA) / Kerberos Constrained Delegation (K...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Service Account for the published web application does not have the correct HTTP Service Principal Name (SPN) registered in Active Directory. When the App Proxy connector requests a Kerberos service ticket via KCD, the KDC cannot locate the target SPN.

**Solution**: Register the correct HTTP SPN on the Service Account using the setspn command: setspn -s http/webapp.domain.com serviceAccountName. Verify registration with setspn -l serviceAccountName. The SPN must match the Internal Application SPN configured in the App Proxy enterprise application SSO settings.

---

## Phase 10: Kdc_Err_Policy
> 3 related entries

### User gets 'Your account is configured to prevent you from using this PC' when logging on interactively. Security Event 4768 on DC shows Result Code...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User account has Log On To workstation restrictions configured (userWorkstations attribute in AD). The user is attempting to log on from a workstation not listed in the allowed workstations. KDC performs logon restriction check during AS_REQ processing and denies the TGT.

**Solution**: Check user object Log On To settings in ADUC (Account tab). Verify userWorkstations attribute via Get-ADUser -Properties userWorkstations. Either add the target workstation to the allowed list or remove the restriction. Note: uses NetBIOS computer names. Key differentiator: KDC_ERR_POLICY (0xC) at AS_REQ phase with SubStatus 0xC0000070.

---

### Kerberos constrained delegation (S4U2Proxy) fails with KDC_ERR_POLICY (0xC) and substatus STATUS_CROSSREALM_DELEGATION_FAILURE (0xC000040B) when at...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Traditional Kerberos Constrained Delegation (KCD) does not support cross-domain delegation. The msDS-AllowedToDelegateTo list contains SPNs from another domain, which the KDC rejects.

**Solution**: Use Resource-Based Constrained Delegation (RBCD) instead of traditional KCD for cross-domain scenarios. Configure msDS-AllowedToActOnBehalfOfOtherIdentity on the target service account. Ensure service accounts for S4U2Proxy are from the same realm/domain as the KDC.

---

### Kerberos TGS request fails with KDC_ERR_POLICY (0xC) and substatus STATUS_AUTHENTICATION_FIREWALL_FAILED (0xC0000413) when authenticating across a ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Selective Authentication is configured on the forest trust and the requesting user does not have the Allowed to Authenticate permission on the target computer or service account. May also occur for Krbtgt requests if client realm is passed in flat (NetBIOS) name format.

**Solution**: Grant Allowed to Authenticate permission to the user or group on the target computer/service when Selective Authentication is enabled. If the issue involves Krbtgt requests with flat name format, investigate client realm name resolution (see KB 2959395). Verify trust configuration in AD Domains and Trusts.

---

## Phase 11: Pac
> 3 related entries

### Slow Kerberos authentication or intermittent authentication failures to services running under a domain service account (not LocalSystem/NetworkSer...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PAC (Privilege Attribute Certificate) verification requires the service host to contact a DC via Netlogon RPC to validate PAC SIDs before generating the access token. Services not running as LocalSystem/NetworkService/LocalService and without TCB privilege trigger this validation. If DC is slow/unreachable or MaxConcurrentApi limit is exhausted, authentication stalls.

**Solution**: 1) Ensure DC connectivity from service host. 2) Tune MaxConcurrentApi (default 150 on WS2008+, 10 on WS2003). 3) Since WS2008/Vista, PAC verification is off by default. For WS2003 SP2, disable via ValidateKdcPacSignature=0 (note: does not apply to IIS). 4) Monitor using Netlogon debug logging (KB 109626) and performance counters.

---

### Setting ValidateKdcPacSignature=0 registry value does not disable PAC validation for IIS-hosted applications. Authentication to IIS remains slow du...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ValidateKdcPacSignature registry key only disables PAC validation for services running as a Windows service accepting security contexts with default credentials. IIS is a worker process, not a service, so this registry key does not apply to IIS application pools.

**Solution**: For IIS, PAC validation cannot be disabled via ValidateKdcPacSignature. Consider running the IIS application pool identity as LocalSystem or NetworkService (which has TCB privilege and skips PAC validation). Alternatively, ensure DC connectivity is fast to minimize PAC verification latency.

---

### Kerberos authentication failures after installing Windows security updates: KB5020805 (11b.22, KrbtgtFullPacSignature) or KB5037754 (4b.24, PacSign...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Security updates introduced new PAC signature validation mechanisms. KrbtgtFullPacSignature (since 11b.22) and PacSignatureValidationLevel (since April 2024) enforce stricter PAC validation. If not all DCs are updated before enforcement mode is enabled, Kerberos authentication breaks due to PAC signature mismatch.

**Solution**: Follow phased deployment: 1) Install updates on ALL DCs before enabling enforcement. 2) For KrbtgtFullPacSignature, see KB5020805 guidance. 3) For PacSignatureValidationLevel, see KB5037754 guidance. 4) Monitor Kerberos event logs during transition period. 5) Ensure all DCs are at the same patch level before moving to enforcement.

---

## Phase 12: Pac Hardening
> 3 related entries

### Kerberos authentication fails for services using S4u2self protocol transition (KCD) after installing November 2021 (11B.21) updates on domain contr...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: 11B.21 PAC hardening adds new PAC Requestor buffer and PAC Attributes to TGTs. Kerberos tickets acquired via S4u2self before the patch lack the new PAC attributes, causing signature validation failure when used as evidence tickets for protocol transition to delegate to backend services.

**Solution**: Install hotfix KB5008611 on affected domain controllers. For CEP/CES failures (error 0x303d0013), see KB5008693. For Remote EFS encryption failures, see KB5008695. Ensure all DCs in the environment are patched to avoid inconsistent PAC validation behavior.

---

### Kerberos authentication fails between domain controllers after October 2022 enforcement update when some DCs have not installed November 2021 (11B....
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: October 2022 update transitions all DCs into Enforcement phase, deprecating PacRequestorEnforcement registry key. DCs without the November 2021 update or with PacRequestorEnforcement=0 become incompatible, as enforcement requires all DCs to support new PAC attributes.

**Solution**: Ensure all domain controllers have at least the November 2021 update installed AND the July 2022 update. Remove PacRequestorEnforcement=0 setting if present. Compatible states: DCs with Oct 2022+ update, or DCs with Nov 2021+ and Jul 2022+ updates with PacRequestorEnforcement=1 or 2.

---

### Cluster CNO/VCO password change operations fail after installing 11B.21 PAC hardening updates on domain controllers. ICM 283154839.
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: 11B.21 Kerberos PAC hardening changes break certain password change operations for cluster Computer Name Objects (CNO) and Virtual Computer Objects (VCO) due to new PAC validation requirements during password change flows.

**Solution**: Apply the fix referenced in the internal KB article for ICM 283154839. See: Servicing: 11B.21: PAC hardening changes affect certain password change operations such as cluster CNO/VCO password changes.

---

## Phase 13: Rds Aad Auth
> 2 related entries

### Repeated Windows login prompt when RDP to HAADJ target machine via RDS AAD Auth - cannot sign in
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Kerberos Server Object missing for user on-prem domain, or domain controller unreachable from target machine. On-prem TGT required for HAADJ login cannot be obtained.

**Solution**: 1. Verify Kerberos Server Object exists: run Set-AzureAdKerberosServer for each on-prem domain. 2. Check network connectivity from target to DC. 3. Capture network trace (Netmon.etl) and Kerberos trace (Kerberos.etl) from target machine Auth logs to confirm TGT exchange.

---

### Repeated AAD login prompt (not Windows prompt) when RDP to HAADJ target via RDS AAD Auth - KDC_ERR_TGT_REVOKED in network trace
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User account is member of Domain Admins group or local admin group. By design, domain admin/local admin connections are denied when using RDS AAD Auth.

**Solution**: If customer needs Domain Admin login, change default Password Replication Policy for AzureADKerberos computer object per MS docs: configure-single-sign-on#allow-active-directory-domain-administrator-accounts-to-connect.

---

## Phase 14: Kdc_Err_C_Principal_Unknown
> 2 related entries

### Kerberos AS-REQ or TGS-REQ fails with KDC_ERR_C_PRINCIPAL_UNKNOWN (0x6) - KDC cannot find the client principal. Visible in Kerberos.etl as KerbGetA...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The User Principal Name (UPN) supplied in the Kerberos request does not match any account in Active Directory. This may be a UPN routing issue when using a generic/custom UPN suffix that is not properly configured for routing in the forest.

**Solution**: Verify the UPN is correctly set on the target account in AD. Try using the explicit UPN registered on the account. If using a generic/custom UPN suffix, test with the implicit UPN (sAMAccountName@AD-FQDN) to isolate UPN routing issues. Check UPN suffix routing in AD Domains and Trusts.

---

### S4U2Self request fails with KDC_ERR_C_PRINCIPAL_UNKNOWN (0x6) when an application performs access checks via group memberships using the TokenGroup...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The service account performing the S4U2Self request lacks permissions to read the TokenGroupsGlobalAndUniversal constructed attribute on the user object in Active Directory.

**Solution**: Grant the service account read access to the TokenGroupsGlobalAndUniversal attribute on user objects in AD. Verify permissions using dsacls or ADSIEdit on the user object.

---

## Phase 15: Rc4 Deprecation
> 2 related entries

### Kerberos authentication fails after April/July 2026 Patch Tuesday for accounts with msDS-SupportedEncryptionTypes attribute NULL/Not Set. KDC Event...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CVE-2026-20833 RC4 deprecation enforcement phases changed KDC default behavior. April 2026 Soft Enforcement makes AES the default for accounts with NULL msDS-SupportedEncryptionTypes. Accounts that never had a password reset since pre-Server 2008 era lack AES hashes in AD, so KDC cannot issue AES tickets to them.

**Solution**: Reset the affected service/computer account password to regenerate AES keys in AD. Alternatively, explicitly set msDS-SupportedEncryptionTypes to include AES (0x18 = AES128+AES256). Verify with Get-ADUser/Get-ADComputer -Properties msDS-SupportedEncryptionTypes. Use List-AccountKeys.ps1 and Get-KerbEncryptionUsage.ps1 from Microsoft Kerberos-Crypto GitHub repo to audit at-risk accounts. Check registry RC4DefaultDisablementPhase (1=Audit, 2=Enforcement) on DCs.

---

### Non-Windows device (NAS, Linux server, printer, legacy Java app) fails Kerberos authentication after RC4 deprecation enforcement. AS_REQ only adver...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Non-Windows devices often use hard-coded keytabs or legacy Kerberos libraries (e.g., old Java versions, MIT krb5) that only support RC4-HMAC. After April 2026 enforcement, KDC rejects RC4-only requests from these clients.

**Solution**: Regenerate the keytab with AES encryption support (ktpass or ktutil with AES256). Update firmware/OS/Kerberos library on the device to support AES. For Java apps, ensure JCE Unlimited Strength policy is installed and krb5.conf includes AES enctypes. Verify client AS_REQ advertises AES ETypes in network trace.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Files storage account AD DS join script runs successfully but FSLogix/K... | Join-AzStorageAccount script parameters silently accept w... | Re-run Join-AzStorageAccount with correct parameters: $En... | 🟢 9.0 | OneNote |
| 2 | All O365 Basic Auth clients unable to access email. Modern Auth and OWA work ... | ADFS Extranet Lockout depends on PDC. When PDC unavailabl... | Disable Extranet Lockout: Set-AdfsProperties -EnableExtra... | 🟢 9.0 | OneNote |
| 3 | ADFS Smart Lockout PowerShell cmdlets return 401 Unauthorized error on ADFS 4... | Duplicate SPN registered on two different AD accounts. AD... | Check for duplicate SPNs using setspn -Q. Remove the dupl... | 🟢 9.0 | OneNote |
| 4 | AADJ device cannot SSO to on-prem share folder after initial join. Only works... | By design, AADJ device needs reboot after initial setup t... | Reboot the AADJ device after initial join. By-design beha... | 🟢 9.0 | OneNote |
| 5 | Seamless SSO fails after enabling via AAD Connect wizard; AADSTS81004 Kerbero... | AZUREADSSOACCT computer account not created in on-premise... | Reset SSO feature using Azure AD PowerShell (5-step proce... | 🟢 9.0 | OneNote |
| 6 | Seamless SSO fails in IE; Fiddler shows Frame returned code 105 IFrame Runnin... | IE setting Allow status bar updates via script is disable... | Enable Allow status bar updates via script in Internet Op... | 🟢 9.0 | OneNote |
| 7 | Repeated Windows login prompt when RDP to HAADJ target machine via RDS AAD Au... | Kerberos Server Object missing for user on-prem domain, o... | 1. Verify Kerberos Server Object exists: run Set-AzureAdK... | 🟢 8.5 | ADO Wiki |
| 8 | Repeated AAD login prompt (not Windows prompt) when RDP to HAADJ target via R... | User account is member of Domain Admins group or local ad... | If customer needs Domain Admin login, change default Pass... | 🟢 8.5 | ADO Wiki |
| 9 | Kerberos authentication fails with KDC_ERR_ETYPE_NOTSUPP error in ADFS enviro... | Encryption type mismatch between client, ADFS service acc... | Ensure GPO encryption type settings match across all serv... | 🟢 8.5 | ADO Wiki |
| 10 | gMSA password retrieval fails. Netlogon.log shows [MSA] NetpGMSAAddWrapper fa... | msDS-SupportedEncryptionTypes attribute on the ADFS serve... | Review msDS-SupportedEncryptionTypes attribute on both th... | 🟢 8.5 | ADO Wiki |
| 11 | Error 0x51f running 'klist get' for Azure SQL MI or Azure File Share. Fiddler... | Fiddler installs proxy config that interferes with Kerber... | Uninstall Fiddler and delete registry keys under HKLM\SYS... | 🟢 8.5 | ADO Wiki |
| 12 | Error 0x51f / 0x2ee5 (ERROR_INTERNET_INVALID_URL) with KDC proxy for Azure AD... | Missing space at end of Kerberos URL in KDC proxy GPO, or... | Verify KDC proxy URL format: must have space after '/kerb... | 🟢 8.5 | ADO Wiki |
| 13 | Error 0x51f mounting Azure File Share with per-user MFA Enforce enabled on us... | Per-user MFA 'Enforce' mode blocks Kerberos ticket acquis... | Disable per-user MFA 'Enforce' option. Use Conditional Ac... | 🟢 8.5 | ADO Wiki |
| 14 | Error 0x51f with 'ProxyHelperClientGetProxyForUrl failed: 1753' in Kerberos E... | WinHTTP Web Proxy Auto-Discovery Service (WinHttpAutoProx... | Ensure WinHttpAutoProxySvc and iphlpsvc services are runn... | 🟢 8.5 | ADO Wiki |
| 15 | After rotating Azure AD Kerberos trust key (Set-AzureAdKerberosServer -Rotate... | Entra ID activates new keys after 24h by default, causing... | Delete trust and recreate: Remove-AzureADKerberosServerTr... | 🟢 8.5 | ADO Wiki |
| 16 | Set-AzureAdKerberosServer fails: 'missing required properties. Property: User... | $domainCred lacks sufficient privileges. Must be Domain A... | Ensure $domainCred is member of Domain Admins in root dom... | 🟢 8.5 | ADO Wiki |
| 17 | Set-AzureADKerberosServer fails: 'The user has insufficient access rights' wh... | Account lacks SeEnableDelegationPrivilege on DCs, needed ... | Check gpresult for 'Enable computer and user accounts to ... | 🟢 8.5 | ADO Wiki |
| 18 | Set-AzureAdKerberosServer fails: 'Strong authentication is required for this ... | Mismatch: ldapserverintegrity=2 on root DC vs ldapClientI... | Set LdapClientIntegrity=2 on client registry (HKLM\System... | 🟢 8.5 | ADO Wiki |
| 19 | Azure File Share mount fails with error 50076 'multi-factor authentication re... | Conditional Access policy applied to Azure Storage Servic... | Exclude Azure Storage SPN from the Conditional Access pol... | 🟢 8.5 | ADO Wiki |
| 20 | Azure File Share mount fails with AADSTS50105 when 'Assignment required' enab... | SP used by AAD only for Kerberos ticket issuance, not Azu... | Disable 'Assignment required' on Storage Account SP. Use ... | 🟢 8.5 | ADO Wiki |
| 21 | Set-AzureAdKerberosServer fails on Windows Server 2025: '2.2.10.6 Primary:Ker... | Bug in AzureADHybridAuthenticationManagement module versi... | Update to AzureADHybridAuthenticationManagement module v2... | 🟢 8.5 | ADO Wiki |
| 22 | 'Could not load file or assembly Microsoft.Online.PasswordSynchronization.Rpc... | VC++ 2013 Runtime (x64) not installed. Module auto-instal... | Update to AzureADHybridAuthenticationManagement v2.4.71.0... | 🟢 8.5 | ADO Wiki |
| 23 | Set-AzureAdKerberosServer fails: 'Collision setting top level names on trust ... | 'windows.net' top-level name already in Name Suffix Routi... | Open AD Domains And Trusts > check trust properties > Nam... | 🟢 8.5 | ADO Wiki |
| 24 | Error 0x51f when running klist get MSSQLSvc/<name>.database.windows.net:1433.... | Fiddler tool installs a proxy configuration that interfer... | Uninstall Fiddler. Delete registry keys related to Fiddle... | 🟢 8.5 | ADO Wiki |
| 25 | Error 0x51f accessing Azure File Shares. Kerberos.etl shows failed to open co... | KDC proxy server URL in Group Policy missing required spa... | Ensure URL format has a space after /kerberos in the KDC ... | 🟢 8.5 | ADO Wiki |
| 26 | Error 0x51f mounting Azure Fileshare via net use. klist shows Error calling A... | User account has per-user MFA set to Enforce. Azure AD Ke... | Disable the per-user MFA Enforce option. No workaround av... | 🟢 8.5 | ADO Wiki |
| 27 | Error 0x51f accessing Azure resources. Kerberos.etl shows ProxyHelperClientGe... | WinHTTP Web Proxy Auto-Discovery Service (WinHttpAutoProx... | Ensure WinHTTP Web Proxy Auto-Discovery Service and IP He... | 🟢 8.5 | ADO Wiki |
| 28 | Customer can access Azure MI or Azure Fileshare on-prem but authentication fa... | VPN client stores credentials in Credential Manager. Cach... | Remove cached RAS credentials. See internal KB 3682d54a f... | 🟢 8.5 | ADO Wiki |
| 29 | Set-AzureAdKerberosServer fails: Azure AD Kerberos Server object in Active Di... | The domain credential used is not a member of both Domain... | Use a credential that is member of Domain Admins in Root ... | 🟢 8.5 | ADO Wiki |
| 30 | Set-AzureADKerberosServer fails: Failed to create Azure AD Kerberos Server: E... | Account lacks SeEnableDelegationPrivilege on DCs, require... | Run gpresult /h on DC. Check Enable computer and user acc... | 🟢 8.5 | ADO Wiki |


---

## Incremental Update (2026-04-18) - +1 entries from contentidea-kb

### Seamless SSO doesn't work as expected. Users get prompted for Password during sign in.
**Score**: 🟢 8.0 | **Source**: ContentIdea KB | **ID**: entra-id-3664

**Root Cause**: After we hit login.microsoftonline.com, Azure AD detects that the tenant is enabled for seamless SSO and redirects the user as below. User gets Unauthorized challenged from Autologon Endpoint.  User fetches Kerberos ticket 1:48:14 PM x/xx/xxxx             3528        36.4694666                      ...

**Solution**: Searched for the correlationID in the response in Kusto to get further details.//Get all PerRequestTableIfx events associated with the CorrelationId cited in the client-side error to get a Summary viewlet start = datetime(xxxx-xx-xx 08:26:00Z);let end = datetime(xxxx-xx-xx08:28:00Z);find in (cluster...

