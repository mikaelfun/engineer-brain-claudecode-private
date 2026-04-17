# ENTRA-ID WHfB Deployment & Trust Models — Detailed Troubleshooting Guide

**Entries**: 189 | **Drafts fused**: 1 | **Kusto queries**: 0
**Draft sources**: ado-wiki-c-pki-ndes.md
**Generated**: 2026-04-07

---

## Phase 1: Whfb
> 145 related entries

### AADJ device cannot SSO to on-premise share folder with WHFB PIN. Works with username+password. Error: cannot find DC or domain not available.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: WHFB key trust or certificate trust not configured for hybrid deployment. SSO with PIN requires: WS2016+ DC, Kerberos certs on DCs, PKI with HTTP CRL, root cert on devices.

**Solution**: Configure WHFB key trust or cert trust. Requirements: 1) WS2016+ DC, 2) Kerberos certs with HTTP CRL on DCs, 3) Root cert deployed to devices. Verify with netmon trace.

---

### Kerberos auth fails with KDC_ERR_CLIENT_NAME_MISMATCH when AADJ user accesses on-prem share with WHFB PIN. KDC ETL shows user not found, LDAP query...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: msDS-KeyCredentialLink attribute empty in on-prem AD. Should be written back by AAD Connect. Common causes: Connect account lacks write permission or sync rule issue.

**Solution**: 1) Verify msDS-KeyCredentialLink exists for user in on-prem AD. 2) If empty, grant Connect account permission: add to Key Admins group or run dsacls. 3) Check AADConnect sync rules and operations.

---

### msDS-KeyCredentialLink in on-prem AD keeps being written back by AAD Connect sync after manual deletion. Customer cannot access original Windows de...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: AAD Connect sync rule 'Out to AD - User NGCKey' writes Azure AD searchableDeviceKey to on-prem msDS-KeyCredentialLink. Deleting on-prem only is restored by next sync cycle.

**Solution**: Delete source in Azure AD: 1) Verify WHfB via browser F12 checking windowsHelloForBusinessAuthenticationMethod. 2) DELETE via Graph API: https://microsoftgraph.chinacloudapi.cn/beta/users/<USERID>/authentication/windowsHelloForBusinessMethods/<methodID>. Works in 21Vianet despite docs saying unsupported.

---

### WHFB PIN provisioning appears on AAD Registered (workplace joined) device, which is undocumented. Official docs only mention AAD Joined devices sup...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: When a Win10 machine is registered in Azure AD, the system prompts WHFB provisioning. Users can skip initial prompt but can manually set WHFB PIN via Settings. Convenience PIN uses password auth backend and will be deprecated.

**Solution**: 1) WHFB on AAD Registered is by-design but not officially supported for accessing Azure resources. 2) To remove WHFB PIN: run 'certutil -deleteHelloContainer'. 3) Closing the WHFB blue window creates a convenience PIN instead (not recommended). 4) Supported deployment: AAD Joined devices for full WHFB.

---

### Federated user signed into local Windows client using WHfB certificate trust gets stuck in an infinite sign-in loop when connecting to AVD/RDP sess...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The user attempting to connect to the Azure Virtual Desktop has not been assigned the Azure RBAC role 'Virtual Machine Administrator Login' or 'Virtual Machine User Login' on the target VM or resource group.

**Solution**: Add the user to either the 'Virtual Machine Administrator Login' or 'Virtual Machine User Login' Azure RBAC role on the target VM, resource group, or subscription.

---

### After disabling Windows Hello for Business via GPO (Computer or User > Administrative Templates > Windows Components > Windows Hello for Business >...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Changing the GPO to Disabled only prevents new provisioning. It does not remove existing WHfB credentials (NGC container and biometric data) from machines that were previously configured.

**Solution**: 1. Set GPO 'Use Windows Hello for Business' to Disabled to prevent new enrollment. 2. On each configured machine, launch elevated cmd.exe and run: certutil -deleteHelloContainer (this deletes the NGC container and biometric data). 3. Restart the PC. Note: Run 'certutil -user -key -csp ngc' first to see what keys are in the container before deleting, as it may contain other keys.

---

### WHfB provisioning fails when migrating from Hybrid Azure AD joined Key Trust to Certificate Trust deployment. Event 362 in User Device Registration...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft Passport Authentication is not enabled in ADFS Global Authentication Policy. The Certificate Trust model requires ADFS to support OAuth JWT Bearer requests from WHfB, which needs the MicrosoftPassportAuthentication method enabled.

**Solution**: 1. Launch ADFS management console. 2. Browse to Services > Authentication Methods. 3. Click Edit under 'Primary Authentication Methods'. 4. Under Intranet, select 'Microsoft Passport Authentication'. 5. Save. Next time the user logs in, WHfB will provision a new certificate from the configured CA.

---

### After running ADPREP /DOMAINPREP for Windows Server 2016 AD schema upgrade, the Key Admins (RID 526) and Enterprise Key Admins (RID 527) security g...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The RID 526 and 527 cannot be resolved to friendly names until a Windows Server 2016 domain controller holds the PDC Emulator FSMO role. If the PDC role is still on a pre-2016 DC, name resolution fails.

**Solution**: Move the PDC Emulator FSMO role to a Windows Server 2016 Domain Controller: Move-ADDirectoryServerOperationMasterRole -Identity <2016DC> -OperationMasterRole PDCEmulator. Reference: https://support.microsoft.com/en-us/help/4033233

---

### Users migrated from one AD domain/forest to another domain/forest are unable to authenticate using WHfB PIN. The existing WHfB key pair is bound to...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: WHfB keys are bound to the user's original domain identity. After migration to a different domain/forest, the key pair no longer matches the new identity, causing authentication failure.

**Solution**: 1. Run 'certutil -deletehellocontainer' on the device (check existing keys first with 'certutil -user -key -csp ngc'). 2. If the device also migrated: run 'dsregcmd /leave'. 3. Migrate device and user to new domain. 4. Run 'dsregcmd /join' on the new domain. 5. Re-enroll in WHfB from lock screen using new UPN (avoid cached profile).

---

### Windows Hello for Business biometric data (fingerprint/facial recognition) is lost after Windows in-place upgrade (UIP). Users must re-enroll biome...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The biometric device (fingerprint reader or camera) has 'Allow the computer to turn off this device to save power' enabled in Device Manager power management settings. This causes biometric signatures to not survive the upgrade process.

**Solution**: Before performing the in-place upgrade, uncheck 'Allow the computer to turn off this device to save power' for both the Biometric fingerprint reader and Camera (facial recognition) devices in Device Manager. If the power management tab is not present, biometrics will survive the upgrade by default.

---

## Phase 2: Tenant Deletion
> 6 related entries

### CMAT shows tenant in Release state but tenant still exists in MSODS/AAD and is not deleted. Customer cannot complete self-service tenant deletion.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Orphaned subscriptions remain in MSODS directory that block tenant deletion even though commerce layer shows tenant as released. MSODS subscription objects with status != 3 (Deleted) prevent deletion.

**Solution**: Query MSODS for orphaned subscriptions using D2K Kusto (idsharedwus.westus cluster, d2kredacted database) or DS Explorer. Check SubscriptionStatus: 0=Enabled, 1=Warning, 2=Suspended, 3=Deleted. Any subscription NOT in status 3 blocks deletion. Use OMS Admin Console to fast deprovision after customer GA email authorization.

---

### CMAT shows blocking subscription in Disabled status but Immediate Cancellation is unavailable. Cannot fast deprovision subscription to unblock tena...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Modern commerce subscriptions (CST-managed) cannot be fast deprovisioned through CST. The subscription has not met its deprovision lifecycle date yet.

**Solution**: Use OMS/BOSG Admin Console as last resort. Prerequisites: 1) Verify CMAT cannot fast deprovision, 2) Escalate to ASMS TAs + Azure Commerce EEE team, 3) Verify subscription is in Disabled (not Active) status. Requires SAW + AME.GBL credentials.

---

### Tenant deletion blocked because CMAT shows a subscription in Disabled state but Immediate Cancellation is unavailable. Subscription has not reached...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Subscription is in Disabled status but has not completed lifecycle transition to Deleted/Deprovisioned. CMAT cannot fast-deprovision and modern commerce subscriptions in CST also cannot be fast-deprovisioned.

**Solution**: Use OMS/BOSG admin console to fast deprovision as LAST resort. Prerequisites: 1) Verify CMAT unable to fast deprovision; 2) Escalate to ASMS TAs + Azure Commerce EEE to confirm OMS needed; 3) Verify subscription in Disabled (not Active) status; 4) Requires TA/PTA access with SAW + AME.GBL account.

---

### Azure AD tenant deletion fails with 'Directory has one or more Azure subscriptions' or 'Directory has one or more subscriptions to Microsoft Online...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: A subscription became orphaned during its automatic cancellation lifecycle: SubscriptionStatus is Warning/Suspended/LockedOut/Deleted but NextLifeCycleDate is in the past and the Commerce API scheduled deletion never completed. The orphaned subscription in MSODS still blocks tenant deletion and can trigger tenant re-activation

**Solution**: 1) Use MSODS Explorer (or Kusto via 'Query Kusto for MSODS Subscriptions' wiki) to identify orphaned subscriptions (NextLifeCycleDate in past, SubscriptionStatus != Enabled). 2) Copy CommerceSubscriptionContext (GUID1/entitlements/GUID2), OcpSubscriptionId. 3) In OMS Tenant Console, reactivate sub-account if in Release state. 4) In OMS Subscription Console, search by Entitlement ID (GUID2), confirm OCP Status = Deprovisioned, then Re-Sync. 5) Verify subscription deleted in MSODS, then retry Vali

---

### Orphaned subscription in Tenant B from a circular subscription transfer (A to B back to A) blocks tenant deletion. Attributes show SubscriptionSusp...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Pre-2021 bug that left entitlements orphaned in MSODS whenever a subscription was circularly transferred (Tenant A -> B -> A). The commerce footprint in Tenant B is left orphaned in a suspended state. Performing a resync of the entitlement will not remove it

**Solution**: Escalate to Azure Commerce EEE team via ICM to queue 'Azure Commerce EEE/Triage (only for ASMS Team, Sev3/4, Business Hs Support)' requesting ACIS Action: 'Billing > Provisioning Management > Commerce - Delete Transition Source for Subscription'. Provide Entitlement/Subscription GUID and Commerce Account ID (SubAccount). After EE confirms deletion, if still appearing in MSODS check via BOSG -> Subscription console and verify SyncEntitlement failure

---

### NCE or modern Office 365 subscriptions cannot be immediately/fast deprovisioned; subscription remains active for 90 days after CustomerImmediateCan...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: As of 2025-02, modern/NCE Office subscriptions have a mandatory 90-day deprovision lifecycle by product policy; the CustomerImmediateCancellation option starts the lifecycle but does not bypass the 90-day wait

**Solution**: Raise ICM with the Recurrence team (see Escalation path section in billing account deletion wiki). Track product improvements: workitem 175292 (enabling customer_immediate_cancellation for Office products) and OSGS 56260657 (CST Enable NCE Subscription fast deprovision). In the interim, tenant deletion must wait for the 90-day deprovision period to complete

---

## Phase 3: Provisioning Agent
> 4 related entries

### Test connection fails after provisioning agent installation/upgrade with HybridSynchronizationActiveDirectoryCredentialValidationUnavailable
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Three causes: 1) Agent installed but GMSA wizard setup not completed. 2) Agent configured but Azure AD not receiving bootstrap signals. 3) Upgraded from non-GMSA agent (<v1.1.281.0) and GMSA setup failing.

**Solution**: Check 'View on-premises agents' link: active = rule out causes 1&2. Unhealthy/missing = reconfigure agent, verify bootstrap signals via Kusto. For upgraded agents: set registry to skip GMSA configuration and reconfigure.

---

### Installed provisioning agents not showing up in Azure Portal - only some agents visible
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Each agent sends bootstrap signals to Azure AD. If agent cannot send signals (service down/network issue), Azure AD removes it from the healthy agents list.

**Solution**: Check last bootstrap via Kusto: cluster('idsharedwus.kusto.windows.net').database('AADHIS') BootstrapRootOperationEvent where agentFeature == 'Sync Fabric' summarize arg_max(env_time,*) by connectorId. For network issues: configure proxy in AADConnectProvisioningAgent.exe.config. Reinstall/reconfigure unhealthy agents.

---

### Provisioning Agent registration fails with Timeout error during wizard setup
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Agent unable to connect to Hybrid Identity Service. HTTP proxy required for outbound communication.

**Solution**: Configure HTTP proxy in AADConnectProvisioningAgent.exe.config: add <system.net> section with <defaultProxy enabled='true'> and proxy address before closing </configuration> tag.

---

### Provisioning Agent registration fails with Security Error during wizard setup
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Agent cannot execute PowerShell registration scripts due to restrictive execution policies. Occurs when policy is set to Unrestricted.

**Solution**: Fix via gpedit.msc: Computer/User Configuration > Administrative Templates > Windows Components > Windows PowerShell > Turn on Script Execution = 'Allow local Scripts and remote signed scripts' or Undefined. Also check registry HKLM\SOFTWARE\Microsoft\PowerShell\1\ShellIds > ExecutionPolicy = AllSigned. Rerun wizard.

---

## Phase 4: Successfactors
> 3 related entries

### SuccessFactors to AD provisioning fails with 'Could not calculate the distinguished name' for new users without displayName populated
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Default CN mapping uses displayName from SuccessFactors. Many users do not populate displayName, relying on firstName/lastName instead, causing DN calculation failure.

**Solution**: Change CN attribute mapping from displayName to expression: Join(" ",[firstName],[lastName]). Also verify the default OU provided in app config is valid.

---

### SuccessFactors custom entity attributes (e.g. BadgeInfoNav) cannot be retrieved via JSONPath in provisioning attribute mappings
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Provisioning does not support expansion of custom entities (navigation entities) as every expansion is costly. Only entities documented in the integration reference are expanded.

**Solution**: Ask customer to: 1) Map desired attribute value to a custom property in userNav or employmentNav using SAP HRIS sync. 2) Then sync the custom attribute to AD/Entra ID via standard mapping.

---

### SuccessFactors Writeback fails with SuccessFactorsWritebackRequiredPropertiesMissing: Required property status is missing
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: In SuccessFactors, personIdExternal and userId may have different values. Default API call uses personIdExternal, causing failure when values differ.

**Solution**: Ask customer to incorporate userId attribute value during writeback as documented: https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/sap-successfactors-integration-reference#enabling-writeback-with-userid

---

## Phase 5: Hr Provisioning
> 3 related entries

### HR to AD provisioning fails with InsufficientAccessRights error (DSID-03150F94, problem 4003) for some users while working for most
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Two causes: 1) Target OU does not inherit domain-level permissions. 2) User belongs to protected AD group governed by AdminSDHolder - SDProp resets permissions every 60 minutes.

**Solution**: Cause 1: Enable inheritance on OU (AD Users & Computers > OU Properties > Security > Advanced > Enable Inheritance). Cause 2: Option 1: Remove user from protected group. Option 2: Modify AdminSDHolder permissions via DSACLS. Option 3: Grant Full Control to provAgentgMSA$. Option 4: Skip GMSA, use manual service account (temporary).

---

### HR to Azure AD provisioning fails with AzureActiveDirectoryCannotUpdateObjectsOriginatedInExternalService when updating extensionAttributes
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: extensionAttributes (1-15) in Azure AD can originate from on-prem Exchange, Exchange Online/M365 Admin Center, or Azure AD. Updates fail by design if attributes were originally set from Exchange sources.

**Solution**: Check if impacted users were originally created from external source. If yes: manually update extension attributes, OR create separate provisioning job that omits extension attributes mapping for affected users.

---

### Provision-on-demand shows 'Encountered Exception' with no details when testing HR provisioning for certain users
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Occurs when the user's manager is in scope of the provisioning job. This is a UX bug specific to provision-on-demand, not the backend sync. User is actually provisioned successfully.

**Solution**: Ignore the 'Encountered Exception' message. Verify actual provisioning status via Provisioning Logs / Audit Logs where user creation/update shows as successful.

---

## Phase 6: Hp Oneagent
> 2 related entries

### HP devices: RDP/Win365 auth error dictionary attack mitigation triggered, TPM Event ID 23/21
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: HP OneAgent consumes all TPM NV handles (up to 14), blocking WHfB and Entra registration

**Solution**: Run HP cleanup tool for orphaned NV handles, or uninstall/update OneAgent, or TPM Reset

---

### Windows devices running HP OneAgent experience RDP/Windows 365 Cloud PC authentication failures; TPM authorization errors (Event ID 23, 21); WHfB f...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: HP OneAgent consumed nearly all available TPM Non-Volatile (NV) Handles, preventing TPM from allocating handles for WHfB, Entra device registration, and TPM2_CC_Create operations. msedgewebview2.exe repeatedly creates TPM-backed keys, incrementing the lockout counter.

**Solution**: 1. Run HP cleanup tool to delete orphaned NV handles (preferred). 2. Uninstall HP OneAgent. 3. Update to fixed HP OneAgent version. 4. TPM Reset (last resort - may require WHfB reprovisioning). After cleanup, devices resume normal WHfB and authentication. Reference: ICM for HP OneAgent TPM issue Feb 2026.

---

## Phase 7: Object Quota
> 2 related entries

### Error 'DirectoryQuotaExceededException: The directory object quota limit for the Tenant has been exceeded. Please ask your administrator to increas...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Default Entra ID tenant object quota is 50k objects. Quota protects service from accidental or intentional over-provisioning beyond tenant needs.

**Solution**: 1) Customer checks current quota: GET https://graph.microsoft.com/beta/organization?$select=directorySizeQuota. 2) Internally: ASC > Tenant Explorer > Tenant Config > Object Quota. 3) For quota increase: follow 'Creating ICM for tenant quota increase requests' process. 4) Customer can monitor with alerts using script from https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/the-case-of-azure-ad-quota-exhaustion/ba-p/2496133. Note: Azure AD B2C quotas are different, see separat

---

### DirectoryQuotaExceededException: The directory object quota limit for the Tenant has been exceeded
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Default tenant object quota is 50k. Protects service from over-provisioning.

**Solution**: 1) GET /beta/organization?$select=directorySizeQuota. 2) ASC > Tenant Explorer > Tenant Config > Object Quota. 3) ICM for quota increase. 4) Monitor: https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/the-case-of-azure-ad-quota-exhaustion/ba-p/2496133

---

## Phase 8: Workday
> 2 related entries

### DuplicateTargetEntries error during Workday worker conversion (CW to FTE or vice versa): two Workday entries matching the same AD entry
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When CW converts to FTE retaining the same WorkerID, provisioning engine gets two user profiles with same WorkerID but different WID (anchor), breaking one-to-one mapping. Note: post 5/5/2021 fix, active worker profile auto-assumes ownership.

**Solution**: Post-2021: active worker auto-assumes ownership. If still occurring: Option 1: Assign different WorkerIDs for CW/FTE. Option 2: Set Skip-Out-of-Scope-Deletions=true, exclude inactive worker via WID scoping filter, clear metadata and restart via Graph API.

---

### Workday attribute mapping fails with SchemaInvalid error due to unsupported XPATH function (e.g. sibling::node())
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Provisioning engine supports limited XPATH/XSLT functions. Functions like sibling::node() are not in the supported set.

**Solution**: Replace unsupported XPATH functions. Supported: Name, last, Position, String, Substring, Concat, substring-after, starts-with, string-length, Contains, Translate, normalize-space, substring-before, Boolean, True, Not, False, Number, Ceiling, Sum, Round, Floor.

---

## Phase 9: Lifecycle Workflows
> 2 related entries

### Lifecycle Workflow history shows success for delete user task but user still exists in on-premises AD
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known bug: LCW does not receive feedback from provisioning agent, so workflow history immediately shows success without confirming on-prem deletion completed

**Solution**: Verify deletion directly in on-prem AD using ADUC. Deletion should occur seconds after workflow runs. If still exists, check provisioning agent logs and gMSA permissions

---

### Lifecycle Workflow fails when attempting to delete a large set of on-premises user accounts in a single run
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: On-prem deletion is subject to accidental deletion prevention threshold of the underlying provisioning service, blocking mass deletions

**Solution**: Process users in smaller batches by adjusting workflow scope. Check provisioning agent accidental deletion prevention threshold (default 500) and consider temporarily increasing it

---

## Phase 10: Aadsshloginforlinux
> 1 related entries

### AADSSHLoginForLinux VM extension install fails with Non-zero exit code: 23 and error Detected obsolete packages. Please uninstall AADLoginForLinux ...
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: The old AADLoginForLinux VM extension (v1 device code flow) or remnants are still installed on the VM, blocking the new AADSSHLoginForLinux extension.

**Solution**: Uninstall the older AADLoginForLinux VM extension from the VM. The AADSSHLoginForLinux extension status should then change to Provisioning succeeded.

---

## Phase 11: Aadsts1400001
> 1 related entries

### AADSTS1400001: Request nonce not provided. Common during WHFB sign-in. OAuth invalid_request.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Device missing OS updates/patches, or nonce not generated correctly. Outdated OS builds commonly trigger this.

**Solution**: (1) Update device OS, (2) Check app nonce generation, (3) If patched+correct, ICM to ESTS EEE. Check Event IDs 1085/1081 + Webauth.ETL.

---

## Phase 12: Adfs
> 1 related entries

### ADFS DeviceRegistrationService fails to initialize. Event ID 2076 in Device Registration Service Tracing/Debug log with error: Metadata contains a ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Administrator enabled ALL WS-Trust Endpoints in ADFS Endpoint configuration causing the MEX document (/adfs/services/trust/mex) to grow beyond the 65536 byte MaxReceivedMessageSize buffer limit used by DRS MetadataExchangeClient during localhost MEX loading at service startup.

**Solution**: Disable unnecessary WS-Trust Endpoints using ADFS Endpoint configuration. Refer to ADFS Endpoints - Purpose guide to identify which endpoints are required. Restart ADFS service after disabling unnecessary endpoints.

---

## Phase 13: Conditional Access
> 1 related entries

### Windows Hello for Business PIN setup or macOS Platform SSO credential registration fails/blocked during new device provisioning after April 2026 ro...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: New CA enforcement for passwordless credential registration extends to WHfB and macOS Platform SSO. CA policies targeting Register security information user action now apply during credential registration, not just sign-in

**Solution**: Review CA policies targeting User actions > Register security information. Validate grant controls (MFA, device compliance, trusted locations). Use Report-only mode to assess impact before enforcement. Rollout begins April 2026, default enforcement May 2026

---

## Phase 14: Role Assignable Groups
> 1 related entries

### DirSync (AADConnect) cannot be disabled because an on-premises directory-synced group is nested inside a role-assignable cloud group (isAssignableT...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Adding an on-premises directory-synced group as a member of a role-assignable cloud group intentionally blocks disabling DirSync. This prevents an unsupported state where a non-role-assignable group would exist inside a role-assignable group after DirSync disable changes source of authority

**Solution**: 1) Use the Locate Nested Groups PowerShell Script to find all on-premises groups nested in role-assignable cloud groups. 2) Remove on-prem groups from the role-assignable groups. 3) Disable DirSync. 4) After AADConnect is working again, re-add the on-premises groups. If still failing after these steps, engage Provisioning support team

---

## Phase 15: Sync
> 1 related entries

### Need to reprovision a user that was deleted from on-premises AD but restored from Azure AD Recycle Bin - object is orphaned with DirSyncEnabled=fal...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Azure AD object is disconnected from on-premises source. Shadow properties remain from previous sync. The object needs to be hard-matched back to a new on-premises AD object using SourceAnchor/ImmutableId.

**Solution**: 1) Ensure AADConnect uses ms-ds-ConsistencyGuid as SourceAnchor. 2) Create similar user in on-prem AD (same UPN/Mail/ProxyAddresses). 3) Get ImmutableId: Get-MgUser -Property OnPremisesImmutableId. 4) Copy ImmutableId to on-prem AD: Set-ADSyncToolsMsDsConsistencyGuid -Identity <UPN> -Value <ImmutableId>. 5) Run delta sync.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AADSSHLoginForLinux VM extension install fails with Non-zero exit code: 23 an... | The old AADLoginForLinux VM extension (v1 device code flo... | Uninstall the older AADLoginForLinux VM extension from th... | 🟢 9.5 | ADO Wiki |
| 2 | AADJ device cannot SSO to on-premise share folder with WHFB PIN. Works with u... | WHFB key trust or certificate trust not configured for hy... | Configure WHFB key trust or cert trust. Requirements: 1) ... | 🟢 9.0 | OneNote |
| 3 | Kerberos auth fails with KDC_ERR_CLIENT_NAME_MISMATCH when AADJ user accesses... | msDS-KeyCredentialLink attribute empty in on-prem AD. Sho... | 1) Verify msDS-KeyCredentialLink exists for user in on-pr... | 🟢 9.0 | OneNote |
| 4 | msDS-KeyCredentialLink in on-prem AD keeps being written back by AAD Connect ... | AAD Connect sync rule 'Out to AD - User NGCKey' writes Az... | Delete source in Azure AD: 1) Verify WHfB via browser F12... | 🟢 9.0 | OneNote |
| 5 | WHFB PIN provisioning appears on AAD Registered (workplace joined) device, wh... | When a Win10 machine is registered in Azure AD, the syste... | 1) WHFB on AAD Registered is by-design but not officially... | 🟢 9.0 | OneNote |
| 6 | HP devices: RDP/Win365 auth error dictionary attack mitigation triggered, TPM... | HP OneAgent consumes all TPM NV handles (up to 14), block... | Run HP cleanup tool for orphaned NV handles, or uninstall... | 🟢 8.5 | ADO Wiki |
| 7 | Federated user signed into local Windows client using WHfB certificate trust ... | The user attempting to connect to the Azure Virtual Deskt... | Add the user to either the 'Virtual Machine Administrator... | 🟢 8.5 | ADO Wiki |
| 8 | After disabling Windows Hello for Business via GPO (Computer or User > Admini... | Changing the GPO to Disabled only prevents new provisioni... | 1. Set GPO 'Use Windows Hello for Business' to Disabled t... | 🟢 8.5 | ADO Wiki |
| 9 | WHfB provisioning fails when migrating from Hybrid Azure AD joined Key Trust ... | Microsoft Passport Authentication is not enabled in ADFS ... | 1. Launch ADFS management console. 2. Browse to Services ... | 🟢 8.5 | ADO Wiki |
| 10 | After running ADPREP /DOMAINPREP for Windows Server 2016 AD schema upgrade, t... | The RID 526 and 527 cannot be resolved to friendly names ... | Move the PDC Emulator FSMO role to a Windows Server 2016 ... | 🟢 8.5 | ADO Wiki |
| 11 | Users migrated from one AD domain/forest to another domain/forest are unable ... | WHfB keys are bound to the user's original domain identit... | 1. Run 'certutil -deletehellocontainer' on the device (ch... | 🟢 8.5 | ADO Wiki |
| 12 | Windows Hello for Business biometric data (fingerprint/facial recognition) is... | The biometric device (fingerprint reader or camera) has '... | Before performing the in-place upgrade, uncheck 'Allow th... | 🟢 8.5 | ADO Wiki |
| 13 | WHfB Cloud Kerberos Trust does not work when Certificate Trust policies are a... | Cloud Kerberos Trust is incompatible with Certificate Tru... | Remove Certificate Trust policies (GPO or MDM) before dep... | 🟢 8.5 | ADO Wiki |
| 14 | User cannot sign in with WHfB Cloud Kerberos Trust on a Microsoft Entra hybri... | Cloud Kerberos Trust requires an initial sign-in with Dom... | Ensure the user performs their first sign-in on the hybri... | 🟢 8.5 | ADO Wiki |
| 15 | WHfB on-premises (Cert Trust / Key Trust) provisioning fails with error 0X801... | MFA authentication method 'ngcmfa' is not enabled on the ... | Run on ADFS server: set-AdfsDeviceRegistration -AllowedAu... | 🟢 8.5 | ADO Wiki |
| 16 | Windows Hello for Business key-based authentication fails when only Windows S... | Known issue with Windows Server 2019 DCs affecting WHfB k... | Install KB4487044 on the Windows Server 2019 Domain Contr... | 🟢 8.5 | ADO Wiki |
| 17 | Federated user with WHfB certificate trust gets stuck in infinite sign-in loo... | User not assigned Azure RBAC Virtual Machine Administrato... | Add user to Virtual Machine Administrator Login or Virtua... | 🟢 8.5 | ADO Wiki |
| 18 | After disabling WHfB via GPO, previously configured PCs still have WHfB crede... | GPO Disabled only prevents new provisioning. Does not rem... | 1. Set GPO Disabled. 2. Each machine: elevated certutil -... | 🟢 8.5 | ADO Wiki |
| 19 | WHfB provisioning fails migrating Key Trust to Certificate Trust. Event 362: ... | Microsoft Passport Authentication not enabled in ADFS Glo... | ADFS > Services > Auth Methods > Edit Primary > Intranet:... | 🟢 8.5 | ADO Wiki |
| 20 | After AD schema upgrade to 2016, Key Admins (RID 526) and Enterprise Key Admi... | RID 526/527 need Windows Server 2016 DC holding PDC Emula... | Move PDC Emulator to 2016 DC: Move-ADDirectoryServerOpera... | 🟢 8.5 | ADO Wiki |
| 21 | Users migrated from one AD domain/forest to another cannot authenticate using... | WHfB keys bound to original domain identity, invalid afte... | 1. certutil -deletehellocontainer. 2. If device migrated:... | 🟢 8.5 | ADO Wiki |
| 22 | Error 'DirectoryQuotaExceededException: The directory object quota limit for ... | Default Entra ID tenant object quota is 50k objects. Quot... | 1) Customer checks current quota: GET https://graph.micro... | 🟢 8.5 | ADO Wiki |
| 23 | DirectoryQuotaExceededException: The directory object quota limit for the Ten... | Default tenant object quota is 50k. Protects service from... | 1) GET /beta/organization?$select=directorySizeQuota. 2) ... | 🟢 8.5 | ADO Wiki |
| 24 | SuccessFactors to AD provisioning fails with 'Could not calculate the disting... | Default CN mapping uses displayName from SuccessFactors. ... | Change CN attribute mapping from displayName to expressio... | 🟢 8.5 | ADO Wiki |
| 25 | SuccessFactors custom entity attributes (e.g. BadgeInfoNav) cannot be retriev... | Provisioning does not support expansion of custom entitie... | Ask customer to: 1) Map desired attribute value to a cust... | 🟢 8.5 | ADO Wiki |
| 26 | SuccessFactors Writeback fails with SuccessFactorsWritebackRequiredProperties... | In SuccessFactors, personIdExternal and userId may have d... | Ask customer to incorporate userId attribute value during... | 🟢 8.5 | ADO Wiki |
| 27 | DuplicateTargetEntries error during Workday worker conversion (CW to FTE or v... | When CW converts to FTE retaining the same WorkerID, prov... | Post-2021: active worker auto-assumes ownership. If still... | 🟢 8.5 | ADO Wiki |
| 28 | HR to AD provisioning fails with InsufficientAccessRights error (DSID-03150F9... | Two causes: 1) Target OU does not inherit domain-level pe... | Cause 1: Enable inheritance on OU (AD Users & Computers >... | 🟢 8.5 | ADO Wiki |
| 29 | HR to Azure AD provisioning fails with AzureActiveDirectoryCannotUpdateObject... | extensionAttributes (1-15) in Azure AD can originate from... | Check if impacted users were originally created from exte... | 🟢 8.5 | ADO Wiki |
| 30 | Test connection fails after provisioning agent installation/upgrade with Hybr... | Three causes: 1) Agent installed but GMSA wizard setup no... | Check 'View on-premises agents' link: active = rule out c... | 🟢 8.5 | ADO Wiki |
