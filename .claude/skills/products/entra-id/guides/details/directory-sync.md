# ENTRA-ID Directory Sync (Connect/Cloud Sync/PTA) — Detailed Troubleshooting Guide

**Entries**: 223 | **Drafts fused**: 30 | **Kusto queries**: 1
**Draft sources**: ado-wiki-a-entra-connect-admin-actions-auditing.md, ado-wiki-a-entra-connect-sync-on-premise-lab-setup.md, ado-wiki-a-failover-aad-connect-servers.md, ado-wiki-a-migration-connect-sync-to-cloud-sync.md, ado-wiki-b-aad-connect-architecture-troubleshooting.md, ado-wiki-b-migrating-phs-entra-connect-to-cloud-sync.md, ado-wiki-b-phs-troubleshooting-cloud-sync.md, ado-wiki-b-remove-unwanted-ad-domains-cloud-sync.md, ado-wiki-c-entra-connect-performance-issues.md, ado-wiki-c-rpc-errors-affecting-aadconnect.md
**Kusto references**: aad-connect-sync.md
**Generated**: 2026-04-07

---

## Phase 1: Aad Connect
> 33 related entries

### AAD Connect export fails with Insufficient access rights for Exchange hybrid writeback attributes
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: MSOL connector account missing Write Property on Exchange attrs for user/iNetOrgPerson/group/contact

**Solution**: Grant permissions using dsacls for proxyAddresses, msExch* attrs on all object types.

---

### After AAD Connect upgrade, export fails error 8344 Insufficient rights for multiple users
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: New version needs additional writeback permissions not yet granted to sync account

**Solution**: Use Delegate Control wizard to grant Read+Write All Properties for Contact/Group/iNetOrgPerson/User. For PHS also add Replicate Directory Changes.

---

### Need to remove on-premises AD connector from AAD Connect
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Customer no longer needs to sync a specific AD forest/domain

**Solution**: SSM > Connectors > Delete. Stops sync, removes connector space and all sync rules. Metaverse objects cleared on next Delta sync.

---

### AAD Connect export slow with 503 Server Unavailable errors. Application log shows ServerDownException and EndpointNotFoundException for adminwebser...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Two network issues: (1) Proxy not allowing *.partner.microsoftonline.cn traffic; (2) WAN backbone (msn.net) routing loop causing connectivity failure to AAD provisioning endpoint.

**Solution**: 1. Open *.partner.microsoftonline.cn on proxy; 2. Fix backbone routing loop. Verify with Invoke-WebRequest -Uri https://adminwebservice.partner.microsoftonline.cn/ProvisioningService.svc

---

### AAD Connect export extremely slow with delays between export iterations (e.g. Iteration 70 to 71 takes ~2 hours). No 503 errors but export batches ...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: AAD Connect using Named Pipes protocol to connect to external SQL server, and SQL Server compatibility level set to 2008 instead of 2016.

**Solution**: 1. Disable Named Pipes in SQL Server configuration (3 settings); 2. Change SQL 2016 compatibility level from 2008 to 2016; 3. Reboot SQL server or restart DB services.

---

### AAD Connect Delta Synchronization takes ~3 hours even with no object updates. Huge number of disconnectors visible in connector space.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: DEV AAD Connect server configured with PROD AAD tenant. Objects from PROD AAD not linkable to DEV on-prem AD creating massive disconnectors. TCP ZeroWindow observed. Unsupported multi-sync-server topology.

**Solution**: Correct AAD Connect config to point to the correct AAD tenant. Troubleshooting: check disconnector count, verify topology, capture network trace (netsh trace) for TCP ZeroWindow.

---

### Azure AD Sync scheduler is not working. Synchronization does not run automatically.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: SyncCycleEnabled is set to False in the ADSync scheduler configuration.

**Solution**: Run Set-ADSyncScheduler -SyncCycleEnabled $True. Verify with Get-ADSyncScheduler. Check Synchronization Service Manager Operations tab.

---

### LargeObject error during AAD Connect export: The provisioned object is too large. Other attribute changes for the same object also blocked.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Azure AD enforces max 15 certificate values on userCertificate attribute. Objects with >15 values trigger LargeObject error.

**Solution**: Options: 1. Upgrade AADC to 1.1.524.0+ (OOB rules skip >15 certs); 2. Outbound sync rule exporting NULL for >15 certs; 3. Remove expired certs from on-prem AD; 4. Exclude userCertificate (not recommended).

---

### AAD Connect synchronization stopped working with connectivity/authentication failure errors.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: MFA was enabled for the AAD Connect sync service account, blocking non-interactive authentication.

**Solution**: Disable MFA for the synchronization service account in Azure AD / Entra ID portal.

---

### SMTP proxy address with unverified domain suffix not visible in O365 portal for migrated mailbox users. Address in shadowProxyAddresses but not in ...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: ProxyCal filters unverified domain addresses when user has Exchange license and MSExchRemoteRecipientType is not NULL (set to 4 after mailbox migration).

**Solution**: Workaround: Delete MSExchRemoteRecipientType value in on-prem AD using ADSIEDIT. Permanent fix: Verify the domain in Azure AD.

---

## Phase 2: Cloud Sync
> 32 related entries

### Cloud Sync Provisioning Agent MSI installation fails with error during package installation. Service AADConnectProvisioningAgent cannot start. Or w...
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: Local Security Policy Log on as a service does not have NT Service\ALL SERVICES listed. During installation the service logon credentials are set to NT SERVICE\AADConnectProvisioningAgent which requires this permission

**Solution**: Open secpol.msc > Local Policies > User Rights Assignment > Log on as a service. Add NT Service\ALL SERVICES. Note: this setting may be controlled by Group Policy (GPO), in which case modify the GPO. Do not use Domain Admin credentials as a workaround

---

### Cloud Sync provisioning job goes into quarantine with HybridIdentityServiceNoActiveAgents and GatewayTimeout. Agent bootstrap fails with The maximu...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Agent bootstrap response from Azure exceeds the default 65536 byte message size limit due to redundant Service Bus endpoints in the control channel response. Agent cannot process the oversized response and enters repeated bootstrap retry loop

**Solution**: Update agent to latest version - PG has fixed this by removing redundant Service Bus endpoints from the control channel response. Ensure agent build is current

---

### Cloud Sync test connection fails with GatewayTimeout and NoActiveConnector. Agent verbose trace shows The remote name could not be resolved for Ser...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: DNS resolution failure on the Cloud Sync agent server - unable to resolve Azure Service Bus hostnames required for agent connectivity

**Solution**: Update DNS settings on the agent server to ensure it can resolve Azure Service Bus endpoints (*.servicebus.windows.net). Verify firewall/proxy allows DNS resolution for Azure endpoints

---

### Cloud Sync agent wizard fails with Failed changing Windows service credentials to gMSA. System event log shows EventID 7038 indicating incorrect pa...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The gMSA account is not properly registered as a managed account on the server. The managed account status is set to False preventing proper credential management by the system

**Solution**: Run sc.exe qmanagedaccount aadconnectprovisioningagent to verify status. If False, run sc.exe managedaccount aadconnectprovisioningagent true to fix. Then complete the wizard again

---

### Cloud Sync agent installation fails with DirectoryServicesCOMException (0x80072030): There is no such object on the server. Error occurs during gMS...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Managed Service Accounts container is missing from the domain. This can happen if the container was never created or was deleted. The container is required for gMSA creation

**Solution**: Verify the Managed Service Account container exists in the domain using dsa.msc. If missing, collaborate with Windows Directory Services team to restore/create the container using ADPrep /Domainprep. Ensure AD schema is updated to Windows Server 2012 level

---

### Cloud Sync agent installation fails with DirectoryServicesCOMException (0x80072030): There is no such object on the server. Managed Service Account...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The OtherWellKnownObjects attribute on the domain root has orphan metadata pointing to a deleted Managed Service Accounts container (contains DEL: and CN=Deleted Objects in the DN). The WellKnown GUID 1EB93889E40C45DF9F0C64D23BBB6237 lookup fails

**Solution**: Check OtherWellKnownObjects using PowerShell: Get-ADObject (Get-ADRootDSE).DefaultNamingContext -Properties otherwellKnownObjects. If the value contains DEL: or Deleted Objects, collaborate with Windows Directory Services team to fix the orphan metadata

---

### Cloud Sync agent configuration fails with Unable to create gMSA because KDS may not be running on domain controller. Netlogon EventID 9001/9002 pre...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Kerberos encryption type mismatch between the server SupportedEncryptionTypes registry setting and the gMSA account msDS-SupportedEncryptionTypes attribute. Server and gMSA account do not share a common encryption type

**Solution**: 1) Check server encryption types: reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters. 2) Check gMSA msDS-SupportedEncryptionTypes in dsa.msc. 3) Align: Set-ADServiceAccount -Identity provAgentgMSA -KerberosEncryptionType AES128,AES256. 4) Reboot agent server and reinstall

---

### Cloud Sync Provisioning Agent installation fails at final configuration with The remote server returned an error: (401) Unauthorized. Agent registr...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Azure AD account used for installation either does not have the Hybrid Admin role assigned or the account is disabled in Entra ID

**Solution**: 1) Verify the AAD account has at least Hybrid Admin role. 2) Ensure account is not disabled. 3) Uninstall and reinstall the agent. 4) Verify agent shows active in portal and test connection succeeds

---

### Cloud Sync agent installation fails with Unable to install service account provAgentgMSA$ after 6 retries when using Create gMSA option in the wizard
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: A gMSA named provAgentgMSA already exists in a different AD domain (child or tree domain). Known PG bug (Bug 1527424) - agent setup fails on parent domain if gMSA already exists in child domain

**Solution**: Use custom gMSA option instead of Create gMSA. Create a custom gMSA with a different name following Microsoft docs steps (Create gMSA account with PowerShell), then select Use custom gMSA during wizard setup

---

### Cloud Sync Provisioning Agent service fails to start during installation with Verify that you have sufficient privileges to start system services. ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Credential Manager service startup mode is set to Disabled. The provisioning agent depends on Credential Manager to retrieve password vault of the gMSA service account. When disabled PasswordVault.RetrieveAll() throws an unhandled exception crashing the service

**Solution**: Set the Credential Manager service startup type back to Manual (default). Then re-run the Cloud Sync agent installation

---

## Phase 3: Entra Connect
> 30 related entries

### Entra Connect in-place upgrade or fresh install fails: The directory synchronization state of the directory is invalid
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MSOnline retirement causes DirectorySynchronizationStatus=Other. Connect wizard depends on MSOnline for tenant auth.

**Solution**: Use MS Graph PowerShell: Connect-MgGraph then Update-MgOrganization -OrganizationId tenantId -BodyParameter @{onPremisesSyncEnabled=true}. Resets DirSyncEnabledStatus. Retry install.

---

### Entra Connect cannot switch Staging mode via wizard after MSOnline PowerShell retirement
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Older Entra Connect versions (<2.4.18.0) depend on MSOnline for wizard operations, fails after retirement

**Solution**: Install ADSyncTools module: Install-Module ADSyncTools; Import-Module ADSyncTools; Enable-ADSyncToolsStagingMode. Then upgrade Entra Connect to latest version.

---

### Entra Connect export fails with error type/code 114, no UPN shown, a new unique GUID, and detail message: This synchronization operation, Delete, i...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Entra Connect is trying to delete a restored user or object that was moved to an un-synced OU or Lost+Found. The object was previously soft-deleted and restored from Entra ID Recycle Bin or had ImmutableID cleared, resulting in DirSyncEnabled=False.

**Solution**: 1) Move the cloud account to Azure Recycle Bin via Delete User. 2) Run Start-ADSyncSyncCycle -PolicyType Delta. 3) Confirm deletion successful. 4) Restore user from Recycle Bin. 5) Run another delta sync to confirm error is resolved.

---

### Export to Azure AD fails with ExceededAllowedLength error for Directory Extension attributes (e.g., extension_*_userCertificate). Error message: th...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Directory Extensions feature is limited to 250 characters per extended attribute. Large attributes like UserCertificate or thumbnailPhoto easily exceed this limit. Removing the extension via Wizard does not clear pending exports because the sync engine loses control over the excluded attribute and abandoned values persist.

**Solution**: 1) Re-add problematic attributes in Directory Extensions wizard page. 2) Clone the Inbound sync rule 'In from AD - User DirectoryExtension' with lower precedence (e.g., 50). 3) Set FlowType=Expression and Source=AuthoritativeNull to null out values. 4) Run full sync cycle. 5) Confirm null export. 6) Delete cloned rule, re-enable original. 7) Remove problematic attributes from Directory Extensions in wizard. 8) Run another full sync cycle.

---

### ProxyAddresses confirmed in on-premises AD and visible in ShadowProxyAddresses in Azure AD, but the address does not appear in the final Azure AD P...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ProxyCalc sanitizes (removes) SMTP ProxyAddresses with non-verified domain suffixes when the user has Exchange service plans (excluding MyAnalytics/Bookings/PremiumEncryption), is an Exchange Shared Resource recipient type (CloudMsExchRecipientDisplayType = 0/2/7/8/10/15/16/17/18/1073741824/1073741840), or has MSExchRemoteRecipientType set. Alternatively, the address may contain invalid characters.

**Solution**: Add and verify the domain suffix as a verified domain on the tenant. Check if user has Exchange service plans triggering sanitization via ASC Graph: GET /users/{upn}?$select=assignedPlans. For invalid characters, review ProxyAddress format. Use a test account in lab to isolate which service plan triggers sanitization by assigning one plan at a time.

---

### User on-premises UPN has a custom domain suffix but after synchronizing to Azure AD the UPN suffix is replaced with the tenant initial domain (.onm...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ProxyCalc checks if the UPN suffix from ShadowUserPrincipalName is a verified domain on the tenant. If the suffix is not verified, ProxyCalc replaces it with the tenant initial domain. If ShadowUserPrincipalName is absent, ProxyCalc falls back to primary SMTP from ShadowProxyAddresses, then MailNickname + initial domain (with 4 random digits if UPN already exists).

**Solution**: Add and verify the custom domain suffix as a verified domain on the Azure AD tenant. After adding the verified domain, a tenant-wide background task will re-run ProxyCalc for all objects to recalculate UPN values.

---

### After removing a synchronized user from Entra Connect sync scope and restoring from Entra ID Recycle Bin, the object shows DirSyncEnabled=False and...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Removing an object from sync scope and recovering from Recycle Bin does not transfer Source of Authority (SoA) to the cloud. The object retains all synchronized Shadow attributes because it can be reconnected. A disconnected synced object has DirSyncEnabled=False but onPremisesLastSyncDateTime still has a value (unlike a true cloud-only object where both are null). The only supported method to transfer SoA is disabling DirSync on the entire tenant.

**Solution**: Never disable DirSync as a troubleshooting step (only for permanent migration). Identify disconnected objects by checking onPremisesLastSyncDateTime (not null = disconnected synced object). For hard-matching to a new on-prem object, use ADSyncTools Set-ADSyncToolsMsDsConsistencyGuid to write Entra ID ImmutableId into ms-DS-ConsistencyGuid attribute. Do not manually restore soft-deleted synced objects to convert SoA.

---

### Entra Connect export fails with ProxyAddress conflict error. Connect Health shows Duplicate Attribute Error but may not display Existing Object pro...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: An existing object in Entra ID (user, group, contact, or Mail-Enabled Public Folder/MEPF) holds the same ProxyAddress as the incoming synced object. MEPF objects are particularly problematic because they cannot be queried via standard Graph APIs and can only be found using ADSyncTools via DirSync Webservice (AdminWebService).

**Solution**: Identify conflicting object: for users/groups/contacts use Get-MgUser/Get-MgGroup/Get-MgContact with proxyAddresses filter. For MEPF, use Get-ADSyncToolsAadObject -SyncObjectType PublicFolder. Remove conflicts: users via Remove-MgUser, contacts via Remove-MgBetaContact (Graph v1.0 cannot delete OrgContact), groups via Remove-MgGroup, MEPF via Remove-ADSyncToolsAadPublicFolders -SourceAnchor. For bulk MEPF removal, use Export-ADSyncToolsAadPublicFolders to CSV then Remove-ADSyncToolsAadPublicFold

---

### MailNickname in Azure AD does not update after changing the primary SMTP address or other source properties of a synced group or user in on-premise...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ProxyCalc only generates MailNickname from fallback properties (ShadowProxyAddresses primary SMTP prefix, UPN prefix, or CN) during initial object provisioning when no explicit MailNickname is provided from on-premises. Once set, changing these fallback source properties does not trigger MailNickname recalculation.

**Solution**: Explicitly set the MailNickname (Alias) attribute in on-premises AD to the desired value and sync. ProxyCalc uses the explicit on-premises MailNickname value directly without recalculation. For groups, the same logic applies: set MailNickname explicitly rather than relying on derived values.

---

### Azure AD Connect staging server wizard fails with 'An error occurred retrieving the Active Directory schema' and 'GetPrincipalBySamAccountName: Pri...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Group Writeback feature requires Exchange schema in AD forest. When Exchange schema is not detected (log: 'No forest has exchange schema present'), the wizard cannot resolve the MSOL connector account SamAccountName, causing NoMatchingPrincipalException during group writeback permission grant.

**Solution**: Uncheck the Group Writeback option in Azure AD Connect wizard configuration. Complete the wizard without group writeback enabled. Group Writeback requires Exchange Server 2016 CU15+ and Exchange hybrid prerequisites.

---

## Phase 4: Pta
> 28 related entries

### Some PTA users get smart-locked out by AAD while others sign in successfully; AADSTS50126 Invalid on-premise username or password; Auth Agent error...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Missing four attributes (including OnPremisesUserPrincipalName) in AAD for problematic accounts due to removed/disabled sync rule Out to AAD - User Join transformations

**Solution**: Verify sync rule Out to AAD - User Join in Synchronization Rule Editor includes all required attributes. Add back missing transformations and run full synchronization

---

### PTA agent version shown on Azure Portal is older than the version bundled in AAD Connect installer
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Web release of the PTA agent update takes longer than expected, causing version mismatch between AAD Connect bundled agent and Portal download

**Solution**: Customer can manually upgrade PTA agent using the installer at %ProgramFiles%\Microsoft Azure Active Directory Connect\SetupFiles\AADConnectAuthAgentSetup.exe

---

### PTA agent fails to authenticate users from a remote forest (not the forest where PTA agent is located) randomly or consistently in multi-forest env...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PTA agent passes domain name for logon user lookup but DNS resolution fails for remote forest domains. FQDN vs NetBIOS name mismatch causes DC locator failures (PBI 1007557)

**Solution**: If NetBIOS matches domain prefix (e.g. test for test.domain.com): add domain.com to DNS suffix search list on PTA server NIC. If NetBIOS differs (e.g. sub for test.domain.com): create SRV records _kerberos._tcp.dc._msdcs.sub.test.domain.com. A private PTA agent with fix is available via AVA channel

---

### Federated users using ROPC (Resource Owner Password Credentials) flow fail authentication after Oct 24, 2022 patch. Previously ROPC for federated u...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Security patch deployed Oct 24, 2022 globally blocks federated users from authenticating via PTA using ROPC flow to prevent attack vector (ICM-331256484, ICM-332025017)

**Solution**: Temp workaround 1: Enable direct ROPC via HRD policy (requires Password Hash Sync enabled). Temp workaround 2: Use PTA Staged Rollout for affected users (disable Staged Rollout as primary auth first). Correct solution: Apps must use proper auth flow instead of ROPC for federated users

---

### PTA authentication fails intermittently or consistently; users experience timeouts during sign-in via Pass-Through Authentication
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PTA has a fixed 7-second timeout for each ESTS call. Any delay between PTA agent and on-premises AD, or between PTA agent and Entra ID endpoint, will cause authentication failure if response exceeds 7 seconds

**Solution**: Ensure low latency between PTA agent server and domain controllers. Verify network path from PTA agent to Entra ID endpoints. Check for slow DC responses using event logs and Kusto PartnerTransactionSummaries table

---

### Federated users using ROPC (Resource Owner Password Credentials) flow fail authentication after October 24, 2022
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Security patch deployed globally blocked PTA authentication for federated users using ROPC flow to prevent attack vector

**Solution**: Option 1: Enable direct ROPC via Home Realm Discovery policy (requires PHS enabled). Option 2: Use PTA Staged Rollout for affected users (disable Staged Rollout as primary auth first). Correct fix: stop using ROPC for federated users, use proper auth flow

---

### PTA authentication fails intermittently with timeout; delay between PTA agent and on-premises AD or Entra ID endpoint causes authentication failure
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ESTS call timeout for PTA is 7 seconds; any delay between PTA agent and on-premises AD or from PTA agent to Entra ID endpoint exceeding this causes failure

**Solution**: Ensure low-latency network path between PTA agent server and domain controllers, and between PTA agent and Entra ID endpoints. Investigate network issues if auth times approach 7-second threshold

---

### Concern about Azure AD PTA security flaws reported by Secureworks allowing impersonation of PTA agent if attacker gains admin access to PTA server
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Attack requires attacker to already have administrative access to PTA agent server; vulnerability does not pose additional risk if hardening guidance is followed

**Solution**: Harden PTA agent server as if it were a domain controller per MS guidance. Monitor CAPI key access and key file operations. Compare on-prem AD and Azure AD sign-in logs for PTA logon event discrepancies. Ref: https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-pta-security-deep-dive

---

### PTA agent appears as inactive on the Azure portal. The Microsoft Azure AD Connect Authentication Agent connector status shows inactive under Azure ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The SSL client certificate used by the PTA agent has expired and could not be renewed automatically. The certificate is required for the agent to communicate with the Azure AD service via the bootstrap endpoint.

**Solution**: Verify SSL client certificate existence and validity in the local machine certificate store. Follow Microsoft docs to check Application Proxy trust certificate support. If the certificate is expired or missing, uninstall the PTA connector and reinstall it to generate a new certificate.

---

### PTA agent appears as inactive on the Azure portal. The connector cannot reach the bootstrap endpoint {TENANTID}.pta.bootstrap.his.msappproxy.net.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Network communication issue prevents the PTA agent from completing the periodic bootstrap call (every 10 minutes). Possible causes: TCP 80/443 blocked for outbound traffic, SSL inspection intercepting traffic, required Azure URLs not whitelisted, or DNS resolution failure for the bootstrap endpoint.

**Solution**: Verify: (1) TCP 80/443 are open outbound towards Azure endpoints. (2) SSL inspection is disabled for PTA agent traffic. (3) All URLs from the PTA Quick Start prerequisites are accessible. (4) DNS resolves {TENANTID}.pta.bootstrap.his.msappproxy.net (test with ping). If using proxy, ensure correct proxy configuration in AzureADConnectAuthenticationAgentService.exe.config.

---

## Phase 5: Break/Fix
> 17 related entries

### SymptomYou encounter a catastrophic upgrade failure at the point of here AAD Connect uninstalls DIRSYNC Note: AAD Connect doesn't touch the DirSync...
**Score**: 🔵 7.0 | **Source**: KB

**Solution**: If you took a snap-shot restore of your VM, you could restore it ORInstall on 2nd serverORUninstall / reinstall on same server using AzureADConnect.exe /migrate"In the "Import Settings Path" in the page below, type the  path containing the original configuration settings located in %programData%\AADConnectWarning: Do not touch / modify the XML file

---

### When clicking on Open with Explorer in a SharePoint document library, the error 'Access Denied' is received when authentication is handled by the A...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: When Azure Application Proxy is used for authentication, the cookie created for authentication is a session cookie.

**Solution**: Since Open in Explorer view (which relies on the WebClient service) requires persistent cookies, it will not function unless Azure App Proxy is set up for pass-through authentication.

---

### Microsoft is releasing this security advisory to inform customers that a new version of Azure Active Directory (AD) Connect is available that addre...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: The issue is addressed in the latest version (1.1.553.0) of Azure AD Connect by not allowing arbitrary password reset to on-premises AD privileged user accounts.

**Solution**: See https://technet.microsoft.com/library/security/4033453.aspxInstall the 1.1.553.0 version of AAD Connect

---

### Abstract The AAD Connect client supports auto-upgrading from older to newer versions of the identity sync client. The AAD Connect product group is ...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: In July 2017, the AAD Connect team expanded the scope of AAD Connect sync clients eligible for AutoUpgrade. However, the AAD Connect Upgrader binaries that are downloaded by the AutoUpgrade process took a DLL dependency from AAD Connect version 1.1.484 that causes the Upgrader to crash when trying to upgrade older versions of AAD Connect where the updated DLL is not present. Since the AutoUpgrade scope has been increased to include more AAD Connect configurations, AutoUpgrade fails for older ver

**Solution**: AAD Connect team already removed the latest version from AutoUpgrade so there�s no more instances of this issue and we are planning/testing a new AAD Connect version that will be pushed by AutoUpgrade and fix the issue for all broken customers. In the meanwhile, many customers may call Support to address this issue so here�s the steps required to mitigate the problem.Launch AAD Connect Wizard and click Upgrade � should only ask for the AAD credentials.After completing the Upgrade, Exit the Wizar

---

### AbstractThere is an issue that is causing Automatic Upgrade to not work correctly for Azure AD Connect servers with version 1.1.443.0 and below. Az...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: There is a problem in AAD Connect Upgrader that causes the process Microsoft.Azure.ActiveDirectory.Synchronization.Upgrader.exe to terminate due to an unhandled exception, leaving the auto-upgrade setup incomplete.

**Solution**: If the server is left in partially-upgraded state by Automatic Upgrade:Perform a manual, in-place upgrade on the server by starting the Azure AD Connect wizard and clicking Upgrade. For details on how to perform in-place upgrade, refer to this article.Once the Upgrade is complete, repeat the steps described earlier to confirm that the server is no longer in partially upgraded state.If you have previously enabled Password Synchronization feature and/or Password Writeback feature, verify that the 

---

### AbstractThis article explains mitigation steps and provides some best practices to create a custom Sync Rule in Synchronization Rules Editor when t...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: Normally, when adding a new custom Sync Rule by clicking in &quot;Add new rule&quot;, it's not mandatory to provide a Tag string, but due to a bug in AAD Connect 1.1.561, the Synchronization Rules Editor will throw the error shown above if Tag textbox is empty. The Tag is present on the first Sync Rule configuration page as shown below.This issue is limited to the Synchronization Rules Editor UI as PowerShell cmdlet 'New-ADSyncRule' works correctly without specifying a Tag.The fix for this bug h

**Solution**: There's two possible workarounds available for this issue:Create the new custom Sync Rule using Powershell New-ADSyncRule cmdletORType a custom Tag string on the first Sync Rule configuration page (Description).Best PracticeMicrosoft recommends you create this tag with a name that is unique to your company, identifies the purpose of the rule, and indicates a version. For example, a rule that performs custom filtering of users might be called: Contoso.CloudFilteredUser.001.WARNING: All rules star

---

### Abstract This article describes the symptoms when file &quot;C:\ProgramData\AADConnect\PersistedState.xml&quot; is missing or is corrupted. The Per...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: In the AAD Connect upgrade path, the PersistedState file is written over with a blank copy and subsequently filled with contents later on. However, if the application hits an unexpected error before the second write happens, the file will never be updated, and the server is left with a blank file. This behavior has been corrected in the August release of AAD Connect. There were also some instances where Customers deleted this file or folder by mistake.

**Solution**: In order to fix this issue, Customer should restore the file/folder from the latest server backup. If customer does not have a backup of the disk or if the backup is not up-to-date, follow the steps below to use to restore from a previous backup file:a) Go to the folder where the file exists, i.e. C:\ProgramData\AADConnect\, there should be backup file(s) named �Backup-PersistedState-[timestamp].xml�. e.g.: Backup-PersistedState-20170825-010641.xmlb) Please move off the corrupted PersistedState.

---

### Abstract  This article explains a common issue that is by design when User Writeback is still enabled  The User Writeback is a feature that allows ...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: This happens when UserWriteback feature is still enabled on
the customer�s Azure AD tenant. When this feature is present,
DirSyncWebServices will not process any soft-match/hard-match logic. Since users
are not �matched� together by DirSyncWebServices logic, the sync engine shows the
uniqueness exception error above. This is By
Design.

A customer can check if the tenant has this feature enabled on
the tenant by running the following command:

 

Get-MsolDirSyncFeatures | select DirSyncFeature,E

**Solution**: Firstly, we need to disable UserWriteback feature using AAD
Connect Wizard and then we can
go ahead and convert any existent �UserWriteback-users� in the cloud to normal cloud-only users from the back-end. New versions of AAD Connect will
automatically disable UserWriteback feature on the client side. 

WARNING: If this feature is no longer enabled on the client
then it�s safe to disable UserWriteback on the tenant too, but if it�s still
enabled we strongly recommend to backup any AD data associ

---

### AbstractThe following Azure AD Connect versions have 2 issues with the Change user sign-in task:1.1.557.01.1.558.01.1.561.01.1.614.0Both issues imp...
**Score**: 🔵 7.0 | **Source**: KB

**Solution**: Follow these steps to mitigate this issue on your tenant:Run Azure AD Connect and click View current configuration. Check if Password synchronization is enabled on your tenant.Disable the Password
synchronization feature:Run Azure AD Connect and click Configure.Choose the Customize
synchronization options task.On the Optional
features page, uncheck the Password
synchronization feature.Complete the wizard.Optionally, if
you want to clear password hashes already synchronized to Azure AD, follow
th

---

### WARNING: Please DO NOT, in any circumstances, manually edit the Registry to fix AAD connect installation issues, even if you get such instructions ...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: Unknown. Most
probable cause(s) are related with Windows Installer/MSI issues and not necessarily
caused by AAD Connect product itself.

**Solution**: In order to
fix this, we need to clean-up the inconsistency on the windows MSI database � product
code {7c4397b7-9008-4c23-8cda-3b3b8faf4312}
� referencing the Azure AD Sync Engine.
Please follow the resolution steps below in the same order as they appear.NOTE: This product code GUID values can vary depending on what is the inconsistent or stale Azure AD Sync Engine version.



ACTION PLAN #1 � Fix Windows Installer issues (if applicable)

 

There�s a
bad Windows hotfix KB3139923 that can cause

---

## Phase 6: Aadc
> 16 related entries

### Need to change AAD Connect synced domain UPN suffix (e.g. contoso.com to contoso.cn). No documentation for migrating domain UPN of existing synced ...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: AADC does not natively support changing domain suffix for already-synced objects. Custom sync rule only applies to new accounts.

**Solution**: 1) Add new verified domain. 2) If ADFS, add as federation domain. 3) For O365: add both domains in proxyAddress. 4) Custom AADC filter rule for new accounts. 5) For existing: Set-MsolUserPrincipalName. 6) Update proxyAddress. Only tested for AD users.

---

### AAD Connect V2 requires Windows Server 2016+. Customer needs to upgrade from V1 to V2 with new server.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: AADC V2 dropped support for Windows Server 2008R2/2012/2012R2.

**Solution**: 1) Export existing settings. 2) Install latest AADC on new server in staging mode, import settings. 3) Use AAD Connect Documenter to compare configs. 4) Switch new server to active, old to staging.

---

### Entra Connect 2.4.129.0: custom domain UPN admin cannot login AADC wizard in Mooncake. Error: Unable to determine Azure instance, defaulting to Wor...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Bug in 2.4.129.0 DomainSuffixMapping - does not recognize custom MOERA domain in Mooncake

**Solution**: Workaround: use user@*.partner.onmschina.cn to trigger login redirect to 21v, then sign in with admin. Fix pending PG

---

### AAD Connect Directory Extension 配置时无法选择 on-prem AD 中某些扩展属性类型（如 Case insensitive string），导致自定义属性无法从 on-prem 同步到 AAD
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Directory Extension 功能仅支持特定属性类型：Single-valued String (Unicode String)、Boolean、Integer、Binary 和 Multi-valued String、Binary。Case insensitive string 类型不被支持

**Solution**: 确保 on-prem AD 扩展属性为支持的类型（如 Unicode String）。同步后 AAD 中属性名称格式为 extension_{AppClientId}_attributeName，可通过 GME 查看 StringExtensionAttribute/BooleanExtensionAttribute 等。需更新 AADConnect 到最新版本

---

### AAD Connect v1.x stops syncing after Microsoft decommissioned v1 connectivity. Sync breaks without clear error for tenants not yet upgraded.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Microsoft deprecated AAD Connect v1.x (since Aug 2022) and began blocking v1.x connections to Admin Web Service (AWS/Azure AD) in rolling batches starting 2023/10/1. By Jan 2024 ~27% of tenants blocked, continuing rollout.

**Solution**: Upgrade to AAD Connect v2.x immediately. The decommission is rolling - some tenants may still work temporarily but will eventually be blocked. No fix for v1 - upgrade is the only path.

---

### AAD Connect v1.x stops syncing after retirement. Connection to Admin Web Service (AWS) blocked in rolling batches starting Oct 1, 2023. Sync breaks...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Microsoft deprecated AAD Connect v1.x (retired Aug 31, 2022) due to SQL Server 2012 EOL. Engineering blocks tenants in batches (~27% blocked by Dec 2023). V1.x cannot connect to Azure AD after block.

**Solution**: Upgrade to AAD Connect v2.x. Note: v2 requires Windows Server 2016+; cannot install on 2008R2/2012/2012R2 — must upgrade OS first or build new server. Consider Azure AD Cloud Sync as alternative. Include upgrade notice in all sync case closing emails.

---

### Cannot find AAD Connect download link. Old download locations deprecated.
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: AAD Connect download location changed to Entra admin center.

**Solution**: Download from: https://entra.microsoft.com/#view/Microsoft_AAD_Connect_Provisioning/AADConnectMenuBlade/~/GetStarted

---

### Multiple failures (AADC Health Agent install, Connect-MsolService, AADC wizard Azure AD connection) with NET.WebException / 'Could not create SSL/T...
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: Server missing .NET Framework TLS 1.2 strong crypto (SchUseStrongCrypto), cannot communicate with Azure AD endpoints that deprecated TLS 1.0/1.1

**Solution**: Set registry: Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\.NetFramework\v4.0.30319' -Name 'SchUseStrongCrypto' -Value '1' -Type DWord; also set Wow6432Node path

---

### General AAD Connect sync issues - objects not syncing to Azure AD as expected.
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: Common causes: object not in synced OU, outdated AADC version, object pending in connector space after OU changes without full sync.

**Solution**: General troubleshooting steps: 1) Check if object is in the synced OU. 2) Update AADC to latest version. 3) Use Preview for specific object in Metaverse. 4) If object not in Metaverse, check Connector Space by searching RDN='CN=...'. 5) After OU changes, run Full Sync. Logs: Application event log on AADC server + Fiddler on client if user-side symptom.

---

### Container Computers not visible in AAD Connect Wizard OU/domain filtering page, though it exists in AD
**Score**: 🔵 7.5 | **Source**: OneNote

**Root Cause**: Authenticated Users permissions on container changed - lacking Generic Read. LDAP query requires read permission

**Solution**: dsacls CN=Computers,DC=domain /G Authenticated Users:GR or Restore defaults in AD Users and Computers

---

## Phase 7: Password Hash Sync
> 8 related entries

### Password Hash Sync not syncing passwords after on-premises password change in Connect Sync. Passwords filtered because User must change password at...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Password changed in local AD with 'User must change password at next logon' enabled, causing temporary passwords to be filtered from PHS synchronization by default.

**Solution**: Enable 'Synchronize temporary passwords' feature in Entra Connect. See https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-password-hash-synchronization#synchronizing-temporary-passwords-and-force-password-change-on-next-logon

---

### Password Hash Synchronization (PHS) fails after switching Azure AD Connect from staging to active mode. Users cannot log in with new passwords. Eve...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: FIPS (Federal Information Processing Standards) policy enabled on the Azure AD Connect server blocks the encryption algorithm used by PHS, causing Event ID 667 and preventing password hash synchronization.

**Solution**: Disable FIPS enforcement in the Azure AD Connect config: 1) Navigate to %ProgramFiles%\Microsoft Azure AD Sync\Bin. 2) Open miiserver.exe.config. 3) Add <enforceFIPSPolicy enabled="false" /> under <runtime> in the <configuration> section. 4) Save and reboot the server. Verify PHS resumes by checking for Event IDs 656 and 657 in Event Viewer.

---

### PHS stops after several days; Event ID 611 Password synchronization failed for domain
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: RPC 8439 (Server 2003 DCs), RPC 8593 (domain rename), invalid FileTime, duplicate key, or RPC 8453 (missing replication permissions)

**Solution**: Update to latest Entra Connect; for RPC 8453 grant Replicating Directory Changes + All permissions to AD DS Connector Account

---

### Password hash synchronization stops working; Event ID 611 logged: Password synchronization failed for domain
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: Multiple known issues: RPC Error 8439 (Win2003 DC), RPC Error 8593 (domain rename), ArgumentOutOfRangeException, duplicate key, or RPC Error 8453 (AD DS Connector Account missing Replicating Directory Changes permissions)

**Solution**: Update to latest Entra Connect version; for RPC 8453 grant Replicating Directory Changes and Replicating Directory Changes All extended permissions to AD DS Connector Account

---

### Some users cannot sign in to M365/Entra/Intune; password appears not synced. 'User must change password at next logon' is checked on the AD account.
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: Password hash sync does not sync temporary passwords when 'User must change password at next logon' is selected, unless ForcePasswordChangeOnLogOn feature is enabled.

**Solution**: Clear the 'User must change password at next logon' checkbox, have the user change their password, or enable the ForcePasswordChangeOnLogOn feature in Entra Connect.

---

### Users can sign in with old password but not new password after directory sync or password sync was disabled and re-enabled.
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: Disabling and re-enabling directory/password sync may not trigger an immediate full password sync; old password hashes remain valid until new sync completes.

**Solution**: Re-enable password sync via Entra Connect wizard (Customize synchronization options), then run Start-ADSyncSyncCycle -PolicyType Initial to force a full password sync.

---

### Event ID 611 logged: Password synchronization failed for domain with RPC Error 8439 (distinguished name invalid) or RPC Error 8593 (different repli...
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: Windows Server 2003 domain controllers handle certain replication scenarios unexpectedly; or a domain rename is in progress causing epoch mismatch.

**Solution**: For RPC 8439: investigate Windows Server 2003 DC behavior. For RPC 8593/ArgumentOutOfRange/duplicate key errors: update to latest version of Entra Connect.

---

### Event ID 652/655 logged: 'Password Synchronization has not been activated for this company' during credential provisioning or ping.
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: Password sync feature is not enabled for the tenant, or Entra credentials were updated through FIM without re-running the configuration wizard.

**Solution**: Enable password sync via Entra Connect configuration wizard. If credentials were updated in FIM, re-run the Entra Connect wizard to refresh credentials.

---

## Phase 8: Connect Health
> 4 related entries

### Microsoft Entra Connect Health for Sync Services blade shows old server name instead of current name. Server was renamed before domain join but aft...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The MachineIdentity registry key (HKLM\SOFTWARE\Microsoft\Microsoft Online\Reporting\MonitoringAgent\MachineIdentity) stores a client-side generated GUID created during initial registration. The machine name at registration time is cached and does not update when server name changes

**Solution**: 1) Delete registry key: HKLM\SOFTWARE\Microsoft\Microsoft Online\Reporting\MonitoringAgent\MachineIdentity. 2) Re-register the Health agent and delete the old server entry from portal. This generates a new GUID with correct machine name. Note: changing server name after Entra Connect is installed is not supported

---

### Microsoft.Identity.AadConnect.Health.AadSync.Host.exe crashes (Application Error Event ID 1000). AAD Connect Health for Sync shows old or no inform...
**Score**: 🔵 7.0 | **Source**: OneNote

**Root Cause**: Version mismatch between Azure AD Connect Synchronization Service and Azure AD Connect Health for Sync agent. E.g., Sync Service 1.1.647.0+ requires Health Agent 3.0.103.0 or 3.0.129.0, not 3.0.68.0.

**Solution**: Method 1: Manually uninstall Health Agent and reinstall a compatible version per the compatibility table (Sync <=1.1.614.0 -> Health 3.0.127.0; Sync >=1.1.647.0 -> Health 3.0.129.0). Then register with Register-AzureADConnectHealthSyncAgent. Method 2: Upgrade AAD Connect to 1.1.649.0+ which upgrades both components.

---

### High CPU usage and slow performance from Microsoft.Online.Reporting.MonitoringAgent.Startup process on Entra Connect server
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: Connect Health for Sync monitoring agent incompatible with .NET Framework 4.7.2 or July 2018 .NET updates

**Solution**: Update Connect Health Agent to v3.1.7.0+ (for AD DS/AD FS); or install latest Entra Connect version (for sync); auto-upgrade will also resolve

---

### High CPU usage (up to 100%) on Microsoft Entra Connect Health for Sync server; Microsoft.Online.Reporting.MonitoringAgent.Startup process consuming...
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: June 2018 update for .NET Framework 4.7.2 causes incompatibility with the Connect Health for Sync monitoring agent

**Solution**: For AD DS/AD FS: install Connect Health agent version 3.1.7.0+. For Entra Connect: install the latest version of Microsoft Entra Connect

---

## Phase 9: Haadj
> 4 related entries

### HAADJ device stuck in pending registration with error 0x801c005a
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: cloudUserCertificate attribute excluded from AAD Connect sync scope

**Solution**: Include cloudUserCertificate in AAD Connect Azure AD Attributes wizard

---

### Windows 10 devices fail to complete Hybrid Azure AD Join in a targeted deployment; devices remain unjoined or stuck in pending state
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Three compounding issues: (1) user account missing Intune license, (2) GPO for SCP (Service Connection Point) and Intune auto-enrollment endpoints not configured, (3) devices not in an OU selected by Azure AD Connect for sync

**Solution**: 1. Apply Intune license to affected user accounts; 2. Create GPO with SCP client-side registry keys and Intune auto-enrollment GPO, assign to computer OUs; 3. Run gpupdate on devices to apply GPO; 4. In Azure AD Connect, select the OU containing target devices; 5. After first AAD Connect sync, devices appear as HAADJ (may be in pending state until user logs in)

---

### Devices in pending registration state with error 0x801c005a in 'dsregcmd /status' output during managed HAADJ flow
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The 'cloudUserCertificate' attribute was excluded from the sync scope in AAD Connect Azure AD Attributes wizard

**Solution**: In AAD Connect, ensure the 'cloudUserCertificate' attribute is NOT excluded from the Azure AD Attributes sync scope. Re-include it in the sync configuration.

---

### Hybrid Azure AD Join (HAADJ) not completing for Windows 10 devices; devices remain in Pending state or do not appear as Hybrid AAD Joined in Azure ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multiple root causes: (1) user account lacks Intune license if Intune enrollment intended; (2) no GPO configured for SCP (Service Connection Point) registry keys; (3) target devices are not in an OU selected for sync by Azure AD Connect

**Solution**: 1) Verify user has Intune license if Intune enrollment is required. 2) Create GPO with SCP registry keys and Intune auto-enrollment policy targeting all target computers; run gpupdate. 3) In AAD Connect, select the OU containing target devices and run a sync. 4) Devices will appear as HAADJ (pending state resolves after user logs in)

---

## Phase 10: Phs
> 3 related entries

### Expired Active Directory user accounts can still sign in to Azure AD and Office applications (Outlook, Teams) when the environment uses Password Ha...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The on-premises accountExpires attribute is NOT synchronized to Azure AD. In PHS, authentication occurs against Azure AD (not on-premises AD), so AD account expiration is invisible to Azure AD — the cloud account remains active even after the on-premises account expires.

**Solution**: Use a scheduled PowerShell script with Set-ADUser cmdlet to disable (not just expire) AD accounts when they expire. When removing the expiration, re-enable the account. For ADFS or PTA environments, authentication happens on-premises so expiration is enforced normally. Reference: https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-password-hash-synchronization#account-expiration

---

### Users with expired passwords are not prompted to change their password even after EnforceCloudPasswordPolicyForPasswordSyncedUsers is enabled. User...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Password expiration is only evaluated during interactive password-based sign-ins. If the user signed in via session cookie (Credential Type: Session Token), password expiration is not evaluated and user is not prompted to change their expired password.

**Solution**: 1) Check ASC Auth Troubleshooter Expert View > Credentials tab for Credential Type. If 'Session Token', it is not interactive auth. 2) Admin should revoke all refresh tokens: Revoke-MgUserSignInSession. 3) Force interactive sign-in via incognito browser to portal.azure.com with username/password. 4) Verify PasswordPolicies is Blank/None and LastPasswordChangeTimestamp exceeds domain PasswordValidityPeriodDays (default 90).

---

### Password Hash Synchronization (PHS) not working or taking very long after switching Azure AD Connect from staging to active mode. Users report pass...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When AAD Connect is in staging mode, PHS is disabled. Switching to active mode forces the PHS agent to catch up on ALL password updates since the last active time. Large environments can take hours or days. If no full sync was completed before staging, FromUsn=0 forces full PHS sync.

**Solution**: Wait for PHS catch-up to complete. Monitor via PHS verbose logs for FromUsn values. Expect Application event IDs 657 (Password Change Result) and 668 (Refetching change). Event 6948 context not initialized is normal until full PHS sync completes. New password updates may be delayed during catch-up.

---

## Phase 11: Seamless Sso
> 2 related entries

### Seamless SSO fails with AADSTS81011 Failed to find user by on prem sid; OnPremise security identifier missing in AAD
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Source anchor changed to adminDescription (non-default) which was null in ADUC, causing user mismatch between AD and AAD; objectSID not exported despite sync rule present

**Solution**: Fix source anchor configuration, ensure adminDescription has correct value, run delta sync to re-export objectSID to AAD

---

### DesktopSsoLookupUserBySidFailed - EvoSTS cannot locate user based on SID extracted from Kerberos ticket
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User On premises security ID attribute is empty in Entra ID because AAD Connect is not syncing the SID attribute from on-premises AD

**Solution**: Check if user has value in On premises security ID attribute. If empty troubleshoot why AAD Connect does not sync it - collaborate with AAD Connect Sync support.

---

## Phase 12: Entra Connect Sync
> 2 related entries

### Objects from newly added domain not syncing in Entra Connect Sync. Searching the Connector Space shows no users from the new domain. Run profile is...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When a new domain was added through the Entra Connect Sync wizard, no OUs or objects were selected, so the run profile did not include import/sync/export steps for the new domain partition.

**Solution**: 1) Suspend sync: Set-ADSyncScheduler -SyncCycleEnabled $false. 2) In ADDS Connector > Configure Run Profile, add New Step for the new domain partition for each run profile type: Full Import (Stage Only, batch=50, page=500, timeout=120), Delta Import (Stage Only), Full Synchronization (batch=0), Delta Synchronization, Export (batch=30), Specific Object Import (batch=50), Specific Object Export (batch=30). Do NOT create new run profiles - only add steps in existing ones. 3) Re-enable sync and run 

---

### Entra Connect Sync versions older than 2.5.3.0 will fail to authenticate with Microsoft Entra after September 30, 2026. Synchronization stops worki...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The original AWS application shares an Application ID with AAD Graph. As part of the Secure Future Initiative, Microsoft released a new AWS first party application (Microsoft Entra AD Synchronization Service, AppID: 6bf85cfa-ac8a-4be5-b5de-425a0d0dc016) and will deprecate the legacy one on September 30, 2026.

**Solution**: Upgrade Entra Connect Sync to version 2.5.3.0 or later. Ensure prerequisites are met: .NET Framework 4.7.2 installed, TLS 1.2 enabled. Optionally enable Auto-Upgrade feature to receive automatic updates. Public docs: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-upgrade-previous-version

---

## Phase 13: Aadconnect
> 2 related entries

### Entra Connect Sync export to Entra ID fails with 'An internal error has occurred' error containing a Tracking ID. No clear indication of which attr...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Entra Connect Sync is attempting to export an attribute value that is not supported or invalid in Entra ID. The specific invalid attribute is not surfaced in the error message directly.

**Solution**: 1) Use ASC > AADConnect Synchronization > DirSync WebServices logs, search by the Tracking ID from the error. 2) Confirm the immutableID matches the target user. 3) Extract the internalCorrelationID. 4) Query Kusto MSODS cluster: GlobalIfxUlsEvents table filtered by env_time range, internalCorrelationId, and immutableID to identify the unsupported attribute being exported.

---

### Azure AD Connect Wizard fails with Access Denied on Get-MsolUserRole command
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The tenant has blockMsolPowerShell enabled, or MSOL PowerShell module is retired and no longer functional. Older AAD Connect versions rely on MSOL cmdlets.

**Solution**: Update to the latest version of Entra Connect. MSOL is retired. See Breaking Change on Entra Connect Sync in version history documentation.

---

## Phase 14: Password Writeback
> 2 related entries

### After forced password change on first sign-in, user sees 'Your password was successfully updated, but our servers take a little time to catch up' w...
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: Timing issue with Pass-through Authentication (PTA): user signs in before password hash sync finishes syncing temporary password to Entra ID, causing password mismatch during writeback verification

**Solution**: Wait at least 2 minutes after on-premises password reset before signing in to allow password hash synchronization to sync the temporary password. This is expected behavior with PTA + forced password change

---

### User forced to change password on first sign-in sees a warning message 'our servers take a little time to catch up' after successfully setting the ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Timing issue when PTA (Pass-through Authentication) is used. After an admin resets the on-premises password with 'User must change password at next logon', PHS needs ~2 minutes to sync the temporary password to Azure AD. If the user signs in via PTA before PHS completes, the password change succeeds on-premises via writeback but fails cloud-side because Azure AD still has the old password hash.

**Solution**: After resetting a user's on-premises password with 'User must change password at next logon', wait at least 2 minutes for PHS to sync the temporary password to Azure AD before the user attempts to sign in and update the password. This is a timing issue with PTA + PHS coexistence.

---

## Phase 15: Msexchrecipienttypedetails
> 2 related entries

### User object missing from Entra connector in Azure AD Sync - only AD connector on Connectors tab, no error; msExchRecipientTypeDetails=2
**Score**: 🔵 7.5 | **Source**: MS Learn

**Root Cause**: msExchRecipientTypeDetails=2 (Linked Mailbox) causes sourceAnchor rule to set NULL; AADSync waits for master account from account forest

**Solution**: If not account-resource topology: change msExchRecipientTypeDetails from 2 to 1 in on-prem AD. If account-resource: ensure master account syncs first

---

### User object not synced to Entra ID; Entra connector missing in metaverse; msExchRecipientTypeDetails=2 (Linked Mailbox)
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: msExchRecipientTypeDetails=2 makes Entra Connect wait for master account from account forest before provisioning; without account-resource topology the object appears filtered

**Solution**: Change msExchRecipientTypeDetails from 2 to 1 in on-premises AD if not using account-resource forest topology; or ensure master account syncs first

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Synced user has unwanted secondary proxyAddress with 4 random digits in initi... | ProxyCalc generates UPN from MailNickname + Initial Domai... | Workaround using AutoReconcileProxyConflicts: 1) Pause AA... | 🟢 10.0 | OneNote |
| 2 | Cloud Sync Provisioning Agent MSI installation fails with error during packag... | Local Security Policy Log on as a service does not have N... | Open secpol.msc > Local Policies > User Rights Assignment... | 🟢 9.5 | ADO Wiki |
| 3 | Need to change AAD Connect synced domain UPN suffix (e.g. contoso.com to cont... | AADC does not natively support changing domain suffix for... | 1) Add new verified domain. 2) If ADFS, add as federation... | 🟢 9.0 | OneNote |
| 4 | AAD Connect V2 requires Windows Server 2016+. Customer needs to upgrade from ... | AADC V2 dropped support for Windows Server 2008R2/2012/20... | 1) Export existing settings. 2) Install latest AADC on ne... | 🟢 9.0 | OneNote |
| 5 | Entra Connect 2.4.129.0: custom domain UPN admin cannot login AADC wizard in ... | Bug in 2.4.129.0 DomainSuffixMapping - does not recognize... | Workaround: use user@*.partner.onmschina.cn to trigger lo... | 🟢 9.0 | OneNote |
| 6 | AAD Connect export fails with Insufficient access rights for Exchange hybrid ... | MSOL connector account missing Write Property on Exchange... | Grant permissions using dsacls for proxyAddresses, msExch... | 🟢 9.0 | OneNote |
| 7 | After AAD Connect upgrade, export fails error 8344 Insufficient rights for mu... | New version needs additional writeback permissions not ye... | Use Delegate Control wizard to grant Read+Write All Prope... | 🟢 9.0 | OneNote |
| 8 | Need to remove on-premises AD connector from AAD Connect | Customer no longer needs to sync a specific AD forest/domain | SSM > Connectors > Delete. Stops sync, removes connector ... | 🟢 9.0 | OneNote |
| 9 | Unexpected extension_{GUID}_extensionAttribute<N> on Azure AD users, need to ... | AAD Connect syncs extensionAttribute1-15 in two forms; Te... | Extract GUID from attr name, reformat, search as App ID i... | 🟢 9.0 | OneNote |
| 10 | AAD Connect Directory Extension 配置时无法选择 on-prem AD 中某些扩展属性类型（如 Case insensiti... | Directory Extension 功能仅支持特定属性类型：Single-valued String (Uni... | 确保 on-prem AD 扩展属性为支持的类型（如 Unicode String）。同步后 AAD 中属性名称格... | 🟢 9.0 | OneNote |
| 11 | AAD Connect export slow with 503 Server Unavailable errors. Application log s... | Two network issues: (1) Proxy not allowing *.partner.micr... | 1. Open *.partner.microsoftonline.cn on proxy; 2. Fix bac... | 🟢 9.0 | OneNote |
| 12 | AAD Connect export extremely slow with delays between export iterations (e.g.... | AAD Connect using Named Pipes protocol to connect to exte... | 1. Disable Named Pipes in SQL Server configuration (3 set... | 🟢 9.0 | OneNote |
| 13 | AAD Connect Delta Synchronization takes ~3 hours even with no object updates.... | DEV AAD Connect server configured with PROD AAD tenant. O... | Correct AAD Connect config to point to the correct AAD te... | 🟢 9.0 | OneNote |
| 14 | Azure AD Sync scheduler is not working. Synchronization does not run automati... | SyncCycleEnabled is set to False in the ADSync scheduler ... | Run Set-ADSyncScheduler -SyncCycleEnabled $True. Verify w... | 🟢 9.0 | OneNote |
| 15 | LargeObject error during AAD Connect export: The provisioned object is too la... | Azure AD enforces max 15 certificate values on userCertif... | Options: 1. Upgrade AADC to 1.1.524.0+ (OOB rules skip >1... | 🟢 9.0 | OneNote |
| 16 | AAD Connect synchronization stopped working with connectivity/authentication ... | MFA was enabled for the AAD Connect sync service account,... | Disable MFA for the synchronization service account in Az... | 🟢 9.0 | OneNote |
| 17 | SMTP proxy address with unverified domain suffix not visible in O365 portal f... | ProxyCal filters unverified domain addresses when user ha... | Workaround: Delete MSExchRemoteRecipientType value in on-... | 🟢 9.0 | OneNote |
| 18 | On-prem AD account with expired accountExpires attribute remains enabled in A... | AAD Connect does not sync accountExpires. Only UserAccoun... | Scheduled PowerShell script: Search-ADAccount -AccountExp... | 🟢 9.0 | OneNote |
| 19 | SMTP proxy address synced to shadowProxyAddresses but not in final proxyAddre... | Hidden/invisible bad characters in SMTP proxy address in ... | 1. Paste SMTP value into CMD to reveal hidden chars; 2. R... | 🟢 9.0 | OneNote |
| 20 | Mail attribute in Azure AD shows onmicrosoft.com value instead of correct on-... | EXO BackSync writes mail@tenant.onmicrosoft.com to AAD ma... | Manually re-sync: 1. Change on-prem primary SMTP to onmic... | 🟢 9.0 | OneNote |
| 21 | Some PTA users get smart-locked out by AAD while others sign in successfully;... | Missing four attributes (including OnPremisesUserPrincipa... | Verify sync rule Out to AAD - User Join in Synchronizatio... | 🟢 9.0 | OneNote |
| 22 | Seamless SSO fails with AADSTS81011 Failed to find user by on prem sid; OnPre... | Source anchor changed to adminDescription (non-default) w... | Fix source anchor configuration, ensure adminDescription ... | 🟢 9.0 | OneNote |
| 23 | AAD Connect v1.x stops syncing after Microsoft decommissioned v1 connectivity... | Microsoft deprecated AAD Connect v1.x (since Aug 2022) an... | Upgrade to AAD Connect v2.x immediately. The decommission... | 🟢 9.0 | OneNote |
| 24 | AAD Connect v1.x stops syncing after retirement. Connection to Admin Web Serv... | Microsoft deprecated AAD Connect v1.x (retired Aug 31, 20... | Upgrade to AAD Connect v2.x. Note: v2 requires Windows Se... | 🟢 9.0 | OneNote |
| 25 | Cloud-only user cannot log on to VM joined to AADDS managed domain after enab... | Cloud-only users need password hash synced to AADDS. Must... | Have cloud-only users change password after AADDS enabled... | 🟢 9.0 | OneNote |
| 26 | HAADJ device stuck in pending registration with error 0x801c005a | cloudUserCertificate attribute excluded from AAD Connect ... | Include cloudUserCertificate in AAD Connect Azure AD Attr... | 🟢 8.5 | ADO Wiki |
| 27 | AAD Connect sync errors after hybrid devices are soft-deleted — sync attempts... | Admin Web Service (AWS) may fail to detect soft-deleted o... | Verify soft delete restore logic is active for the tenant... | 🟢 8.5 | ADO Wiki |
| 28 | Entra Connect upgrade fails at 'Connect to Microsoft Entra' step with MSAL er... | PKCS registry key exists under HKLM\SYSTEM\CurrentControl... | 1) Back up the registry; 2) Delete the 'PKCS' key at HKLM... | 🟢 8.5 | ADO Wiki |
| 29 | Mobile phone attribute for an AAD user does not get updated via AD Connect sy... | When an admin uses MsOnline/AzureAD PowerShell or the use... | Use the BypassDirSyncOverrides feature (released Nov 2022... | 🟢 8.5 | ADO Wiki |
| 30 | AD Connect Sync Service not running after swing migration or new installation... | Group Writeback was previously enabled on the source serv... | Enable the Group Writeback feature on the new/migrated En... | 🟢 8.5 | ADO Wiki |
