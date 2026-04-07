# ENTRA-ID User Provisioning (SCIM) — Detailed Troubleshooting Guide

**Entries**: 29 | **Drafts fused**: 10 | **Kusto queries**: 0
**Draft sources**: ado-wiki-b-build-self-hosted-scim-lab.md, ado-wiki-b-configuring-provisioning.md, ado-wiki-b-entra-enterprise-app-provisioning-ui-changes.md, ado-wiki-b-identity-provisioning-with-entra-id.md, ado-wiki-b-user-provisioning-errors-graph.md, ado-wiki-c-entra-inbound-user-provisioning.md, ado-wiki-d-scim-identity-s500-sev-c-volume-transition.md, ado-wiki-f-understanding-aad-provisioning-engine.md, onenote-fiddler-sso-provisioning-troubleshoot.md, onenote-sso-provisioning-fiddler.md
**Generated**: 2026-04-07

---

## Phase 1: Provisioning
> 11 related entries

### Azure AD to SaaS app (e.g., Salesforce) provisioning syncs unexpected/incorrect timezone for user accounts.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Azure AD user accounts do not have a timezone attribute. The attribute mapping for TimeZoneSidKey is missing or incorrectly configured in enterprise application provisioning settings.

**Solution**: Edit or create attribute mapping: Enterprise app > Provisioning > Mappings. For TimeZoneSidKey: Mapping type=None, Default value=desired timezone (e.g., Australia/Sydney), Target attribute=TimeZoneSidKey, Apply=Always. If not listed, click Add New Mapping.

---

### Google App provisioning configuration fails to save with error: Size of input ExternalSecret data is invalid. Credentials could not be saved due to...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Combined configuration data (credentials + settings like notification email) exceeds Azure AD internal storage limit for ExternalSecret.

**Solution**: Two workarounds: 1) Use two separate gallery app instances - one for SSO, one for provisioning, to reduce per-app storage. 2) Remove optional fields like Notification Email from provisioning page to reduce data size.

---

### Azure AD provisioning fails to export/import new roles from SaaS apps (AWS, Salesforce, etc.) to Azure AD service principal. Role creation errors d...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Role names imported from SaaS app contain invalid characters or exceed 120-character length limit. Azure AD Graph API restricts allowed characters to: ! # $ % & ' ( ) * + , - . / : ; < = > ? @ [ ] ^ + _ ` { | } ~ and ranges 0-9, A-Z, a-z. Space and other characters are not allowed. Names must not begin with *.

**Solution**: Fix role names in the source SaaS application to comply with Azure AD Graph API character and length restrictions. Ensure role displayName does not exceed 120 chars and uses only allowed characters. Verify using GlobalIfxAuditEvent Kusto query with reportableIdentifier containing the role display name to trace the import/export flow.

---

### Custom attribute not provisioned outbound to enterprise application. Provisioning schema shows FlowBehavior set to FlowWhenChanged, causing attribu...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: FlowBehavior is set to FlowWhenChanged in the provisioning schema JSON. Some target apps (e.g. Workday Writeback) require specific attributes to be included in every sync cycle even when unchanged.

**Solution**: Navigate to Enterprise App > Provisioning > Edit attribute mappings > Show advanced options > Review your schema here. Search for FlowWhenChanged, locate the target attribute, change FlowBehavior from FlowWhenChanged to FlowAlways. Save and test with provisioning on demand. Verify attribute flows in incremental sync cycles.

---

### User export to AWS IAM Identity Center fails with StatusCode 400 BadRequest: Request is unparsable, syntactically incorrect, or violates schema.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User object in Entra ID is missing one or more required attributes for AWS SCIM provisioning: firstName, lastName, displayName, or userName.

**Solution**: Ensure all users in provisioning scope have firstName, lastName, displayName, and userName attributes populated in Entra ID before provisioning to AWS IAM Identity Center. Use the gallery app (AWS IAM Identity Center) instead of legacy non-gallery or BYOA versions.

---

### User export to AWS IAM Identity Center fails with 400 BadRequest when provisioning email or phone number attributes. Error: Request is unparsable, ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AWS IAM Identity Center does not support multi-valued attributes for email and phone numbers. Having two source attributes both mapped to the same target field (e.g. two attributes mapping to phoneNumber) or a user with multiple values in these fields triggers the error.

**Solution**: Option 1: Ensure user has only one value for phoneNumber/email in source. Option 2: Remove duplicate attribute mappings - keep only one source attribute mapped to each target phone/email field in the provisioning attribute mappings.

---

### Group membership update fails during outbound provisioning. User cannot be added to group in target application. Error: unable to resolve reference.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The member user is not being successfully provisioned from Entra ID to the target system. The Sync Fabric engine needs to resolve the user sourceAnchor (Entra ID ObjectId) to targetAnchor (target system primary key) via the Connector Data Store. Users out of scope or failing due to sync/export errors cannot be resolved.

**Solution**: Ensure the member user is in provisioning scope and successfully provisioning to the target before attempting group membership sync. Fix any user-level synchronization or export errors first. Verify user appears in provisioning logs with successful export before troubleshooting group membership.

---

### After performing clear state/restart of provisioning job, group members are orphaned in target system - members remain in target group even after b...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When clear state is performed while a read/write gap (backlog) exists and group membership removal changes have been ingested but not yet digested (processed) by Sync Fabric engine, the engine loses confidence in its authority over those members and takes conservative action (does nothing). The membership removal is lost and never re-evaluated.

**Solution**: Check for read/write gap before performing clear state. If orphaning has occurred, manually clean up orphaned members in target system. This issue only impacts apps where group objects are provisioned source-to-target, NOT apps using Sync assigned users and groups mode. Product group has fix on roadmap (no public ETA).

---

### Directory extension attributes are missing from the source attribute dropdown in provisioning attribute mappings; customer cannot find extension at...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The getAvailableExtensionProperties API used by the attribute mapping UX has a limit of 1000 Service Principals. If tenant has >1000 SPs, extensions from apps beyond the limit are not discovered. Also possible: extensions do not exist in tenant, multi-valued extensions are not supported in mappings, or the appId referenced in schema editor is invalid

**Solution**: Verify extensions exist via Graph API (POST directoryObject/getAvailableExtensionProperties) or PowerShell (Get-MgApplication). If >1000 SPs in tenant, use schema editor to manually add extension: Enterprise Apps > App > Provisioning > Edit attribute mappings > Show advanced options > Edit attribute list for Microsoft Entra ID. Add full extension name (extension_appId_attributeName). Access schema editor via URL: portal.azure.com/?Microsoft_AAD_Connect_Provisioning_forceSchemaEditorEnabled=true.

---

### All group members removed from Oracle IDCS (Identity Cloud Service) when only one user is removed from the Azure AD group; provisioning to Oracle I...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Non-gallery app with Oracle connector is not SCIM compliant. Custom/BYOA SCIM application is not supported for Oracle Cloud Infrastructure Console or Oracle IDCS integration; the gallery app has been customized to work with the Oracle SCIM server

**Solution**: Switch from the non-gallery/BYOA SCIM app to the official gallery app for Oracle Cloud Infrastructure Console. Follow tutorial: https://learn.microsoft.com/en-us/entra/identity/saas-apps/oracle-cloud-infrastructure-console-provisioning-tutorial. Integrating with Oracle IDCS using a custom/BYOA application is not supported

---

## Phase 2: Scim
> 7 related entries

### Auto-provisioning (SCIM) for non-gallery app fails with SystemForCrossDomainIdentityManagementCredentialValidationFailure. Test Connection intermit...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: The SCIM endpoint URL provided by the app vendor has an invalid/mismatched SSL certificate (e.g., cert for *.lastpass.com but URL is different subdomain). Azure AD SCIM provisioning agent rejects untrusted remote certificate during TLS handshake. Jarvis log shows: 'The remote certificate is invalid according to the validation procedure'.

**Solution**: Use the correct SCIM endpoint URL that has a valid SSL certificate. For LastPass example: change from old URL format to https://lastpass.com/scimapi/{accountId}. Verify the URL's SSL cert in browser before configuring. Restart full sync after URL change.

---

### SCIM Validator tool shows error "Please enter a URL" even after entering a valid URL into the endpoint field.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The entered URL is missing the protocol prefix (https:// or http://). The SCIM Validator requires URLs to begin with HTTPS or HTTP.

**Solution**: Ensure the SCIM endpoint URL begins with https:// or http:// (e.g., https://myapp.example.com/scim). Add the protocol prefix and retry.

---

### SCIM Validator tool shows "SCIM Validation failed. Internal Server Error" after reviewing attributes and initiating the test.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The entered SCIM endpoint URL is not valid or the endpoint does not exist. The server returns a 500 error because it cannot reach the specified endpoint.

**Solution**: Verify the SCIM endpoint URL is correct and the endpoint is accessible. Ensure the SCIM server is running and reachable from the internet. Correct the URL and retry the validation.

---

### SCIM Validator tool shows "Invalid credentials!" after reviewing attributes and initiating the test.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The entered bearer token or credentials are incorrect, or the SCIM endpoint URL is invalid/does not exist.

**Solution**: Review and correct the bearer token and SCIM endpoint URL. Ensure the token has not expired and matches what the SCIM server expects. Re-enter credentials and retry.

---

### SCIM Validator tool shows "Could not discover the schema during processing" after submitting the endpoint and credentials.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The SCIM endpoint URL entered is invalid. The validator cannot reach the /Schemas endpoint to discover the schema definition.

**Solution**: Verify the SCIM endpoint URL is correct and accessible. Ensure the SCIM server implements the /Schemas endpoint per SCIM 2.0 spec (RFC 7643). Correct the URL and retry.

---

### SCIM Validator tool shows "/schemas endpoint not found" after submitting the endpoint and credentials.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The SCIM server does not implement the /Schemas endpoint for schema discovery. This is required by the SCIM 2.0 specification for the validator to discover supported attributes.

**Solution**: Implement the /Schemas endpoint on the SCIM server per SCIM 2.0 spec. Refer to Microsoft docs on schema discovery: https://docs.microsoft.com/en-us/azure/active-directory/app-provisioning/use-scim-to-provision-users-and-groups#schemas-schema-discovery

---

### Customer asks about SCIM provisioning availability for non-gallery/BYOA applications in Mooncake.
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: SCIM provisioning via non-gallery app was a feature gap. As of Feb 2025, confirmed GA. Supported: Custom/BYOA/non-gallery app. Not yet: specific gallery apps. Outbound SCIM: CY25H2. Sync Fabric: CY25Q3.

**Solution**: SCIM provisioning for non-gallery apps is GA in Mooncake (Feb 2025). For gallery apps (e.g., Databricks confirmed working), test directly. Track ADO 10155 for timeline.

---

## Phase 3: Ecma
> 2 related entries

### ECMA Connector Host provisioning placed into quarantine with error SystemForCrossDomainIdentityManagementCredentialValidationFailure: While attempt...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: ECMA Connector Host is not accessible from Microsoft Entra ID. Common causes: server offline, Microsoft ECMA2Host service not running, TCP port 8585 not listening or not reachable from the Internet.

**Solution**: Verify ECMA Host server is online. Check ECMA2Host service status (Get-Service "Microsoft ECMA2Host") and port 8585 is listening (netstat -aonb | select-string "8585"). Verify inbound TCP 8585 connectivity from Internet using Test-NetConnection or the Test Connection button in Entra provisioning portal. If connectivity fails, check firewall rules and run TestECMA2HostConnection.ps1 script under C:\Program Files\Microsoft ECMA2Host\Troubleshooting.

---

### ECMA Connector Host Test Connection fails with error "You appear to have entered invalid credentials" (SystemForCrossDomainIdentityManagementCreden...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: No active provisioning agent assigned to the enterprise application. Customer did not select the correct active agent and click Assign agents in the On-Premises Connectivity section of the provisioning configuration.

**Solution**: In the Entra provisioning configuration, go to On-Premises Connectivity section after setting Provisioning Mode to Automatic. Select the correct active agent from the list and click Assign agents (Steps 2 and 3 of On-Premises Connectivity) before running Test Connection.

---

## Phase 4: Cross Cloud Sync
> 1 related entries

### Mooncake provisioning feature parity status: cross-cloud sync private preview refresh (March 2025), cross-tenant sync (China→China supported), Clou...
**Score**: 🟢 9.0 | **Source**: OneNote

**Solution**: Feature status as of Aug 2025: HR-driven provisioning (API-driven supported, Workday/SuccessFactors NOT supported), Cloud Sync (AD↔Entra supported), Cross-tenant sync (China→China supported, China→Commercial NOT supported), SCIM BYOA/non-gallery GA. Cross-cloud sync private preview refresh targeting April 2025 with UX-based setup replacing PowerShell; public preview targeting June 2025. Licensing TBD before public preview.

---

## Phase 5: Windows 365
> 1 related entries

### Customer reports Azure AD Join failure or provisioning issue on device with displayname starting with 'CPC-' (Windows 365 Cloud PC)
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Windows 365 Cloud PCs use a unique 'zero touch' AADJ process, not standard Entra ID AADJ. AADJ failures on W365 Cloud PCs are provisioning failures owned by W365 team.

**Solution**: Identify Cloud PC: displayname starts with 'CPC-', Device Model in Intune shows 'Cloud PC Enterprise'. Transfer case to W365 team: Business → SAP 'Windows 365\Windows 365\Windows 365 Business Edition\Provisioning\Provisioning Failure'; Enterprise → SAP 'Windows 365\Windows 365\Windows 365 Enterprise Edition\Provisioning\Provisioning Failure'.

---

## Phase 6: Aws
> 1 related entries

### AWS provisioning Test Connection fails with DiceCredentialValidationFailure when configuring Cloud Sync Provisioning on the AWS Single-Account Acce...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The AWS user account used for provisioning is required by AWS policy to perform MFA. The Test Connection POST call fails with 400 Bad Request.

**Solution**: Exclude the AWS service account from the AWS MFA policy so programmatic access is not blocked.

---

## Phase 7: Exchange Online
> 1 related entries

### Creating a Distribution list in Exchange Online / Azure AD sync fails with error: 'The value specified for property Alias is incorrect. Reason: Con...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Exchange Online and Azure AD restrict a set of reserved words (abuse, admin, administrator, hostmaster, majordomo, postmaster, root, secure, security, ssl-admin, webmaster) from being used as primary email aliases for security and operational reasons

**Solution**: Create the distribution list first with a temporary non-blocked alias (e.g., 'dl-temp'), then update the primary alias to the desired blocked word after the object is created in Exchange/AAD

---

## Phase 8: Enterprise App
> 1 related entries

### After October 2024 update, Entra Enterprise App Provisioning settings (Admin Credentials / Tenant URL / Secret Token, Attribute Mappings) cannot be...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: UI migration from Knockout API to React API for the Entra Enterprise Apps Provisioning blade. Provisioning options moved to dedicated sub-blades. Initial rollout to custom (non-gallery) enterprise applications only; Gallery apps roll out over subsequent 3 months.

**Solution**: Find settings in new dedicated blades: (1) Tenant URL and Secret Token → new 'Connectivity (Preview)' blade; (2) Attribute Mappings → new 'Attribute Mapping (Preview)' blade; (3) Email notification, deletion threshold, provisioning scope → new 'Overview (Preview)' Properties tab. No functional changes — same settings in new locations. Both old and new experiences available until January 2025. A banner on Overview (Preview) page informs of upcoming changes.

---

## Phase 9: Case Routing
> 1 related entries

### Need to validate if M365 Identity tenant is concierge (seat count < 300). IsConcierge in Case Buddy is unreliable for concierge validation.
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: The IsConcierge attribute in Case Buddy and the Support Area Name attribute are unreliable for concierge validation. Only the DfM (Dynamics for Microsoft) IsConcierge attribute is accurate.

**Solution**: Validate concierge status using IsConcierge attribute in Dynamics for Microsoft (DfM/DfMEU). If IsConcierge=Yes and no Premier/CSS/S500 customer program, transfer case to SAP: Office Products/Office 365/Office 365/Concierge. If customer has Premier or CSS/S500 program, keep in SCIM queues regardless of concierge status.

---

## Phase 10: Aadsts5000225
> 1 related entries

### Users receive AADSTS5000225 error: This tenant has been blocked due to inactivity. ASC may show Error code 67: TenantAuthBlockReasonLifecycle. All ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft lifecycle policy blocks tenants inactive >200 days past billing cycle. Day 0: notification email. Day 30: login block AADSTS5000225 by OMS Commerce. Day 60: tenant permanently deleted.

**Solution**: 1) Collect tenant ID, correlation ID, timestamp. 2) SE files ICM using ASC template [ID][IDM] AADSTS5000225 Tenant Lifecycle Reauth Request. 3) TA confirms in DS Explorer: _IsDeleted=False, DirectoryFeatures has TenantAuthBlockReasonLifecycle[67]. 4) Check USGov via OpenID metadata - if USGov, transfer to Azure GSX Identity Gov. 5) TA runs Geneva action LifeCycle - Extend Tenant Lifecycle For Dormancy with Is Reactivate Forever checked (requires AME groups TM-SCIMID-CMRC-OPS and AP-SCIMID-CMRC-O

---

## Phase 11: Throttling
> 1 related entries

### Azure AD Connect synchronization is throttled during object provisioning - customer wants to increase write limits for large-scale sync
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Write limits during object provisioning are by design and uniformly enforced. High-volume burst writes can cause directory contention, data corruption risk, and downstream impact. Microsoft Support cannot increase write limits.

**Solution**: 1) Distribute writes over time - introduce synced objects in phases. 2) Reduce high-cost writes: minimize on-premises group memberships, favor cloud-native groups. 3) Use Group SOA with Group Writeback via Cloud Sync. No exception process for increasing limits.

---

## Phase 12: Cross Tenant Sync
> 1 related entries

### EntityTypeNotSupported warning in cross-tenant sync provisioning logs when groups are in sync scope
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Cross-tenant group sync is not enabled in the sync configuration. The Provision Microsoft Entra ID Groups object mapping is disabled.

**Solution**: If customer wants to sync groups: enable group sync by setting Provision Microsoft Entra ID Groups to enabled in sync config Mappings and enabling Allow group synchronization in target tenant inbound access settings. If not intending to sync groups, the warning can be safely ignored.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure AD to SaaS app (e.g., Salesforce) provisioning syncs unexpected/incorre... | Azure AD user accounts do not have a timezone attribute. ... | Edit or create attribute mapping: Enterprise app > Provis... | 🟢 9.0 | OneNote |
| 2 | Google App provisioning configuration fails to save with error: Size of input... | Combined configuration data (credentials + settings like ... | Two workarounds: 1) Use two separate gallery app instance... | 🟢 9.0 | OneNote |
| 3 | Auto-provisioning (SCIM) for non-gallery app fails with SystemForCrossDomainI... | The SCIM endpoint URL provided by the app vendor has an i... | Use the correct SCIM endpoint URL that has a valid SSL ce... | 🟢 9.0 | OneNote |
| 4 | Mooncake provisioning feature parity status: cross-cloud sync private preview... | - | Feature status as of Aug 2025: HR-driven provisioning (AP... | 🟢 9.0 | OneNote |
| 5 | AWS provisioning Test Connection fails with DiceCredentialValidationFailure w... | The AWS user account used for provisioning is required by... | Exclude the AWS service account from the AWS MFA policy s... | 🟢 8.5 | ADO Wiki |
| 6 | Creating a Distribution list in Exchange Online / Azure AD sync fails with er... | Exchange Online and Azure AD restrict a set of reserved w... | Create the distribution list first with a temporary non-b... | 🟢 8.5 | ADO Wiki |
| 7 | After October 2024 update, Entra Enterprise App Provisioning settings (Admin ... | UI migration from Knockout API to React API for the Entra... | Find settings in new dedicated blades: (1) Tenant URL and... | 🟢 8.5 | ADO Wiki |
| 8 | Users receive AADSTS5000225 error: This tenant has been blocked due to inacti... | Microsoft lifecycle policy blocks tenants inactive >200 d... | 1) Collect tenant ID, correlation ID, timestamp. 2) SE fi... | 🟢 8.5 | ADO Wiki |
| 9 | Azure AD provisioning fails to export/import new roles from SaaS apps (AWS, S... | Role names imported from SaaS app contain invalid charact... | Fix role names in the source SaaS application to comply w... | 🟢 8.5 | ADO Wiki |
| 10 | Azure AD Connect synchronization is throttled during object provisioning - cu... | Write limits during object provisioning are by design and... | 1) Distribute writes over time - introduce synced objects... | 🟢 8.5 | ADO Wiki |
| 11 | EntityTypeNotSupported warning in cross-tenant sync provisioning logs when gr... | Cross-tenant group sync is not enabled in the sync config... | If customer wants to sync groups: enable group sync by se... | 🟢 8.5 | ADO Wiki |
| 12 | SCIM Validator tool shows error "Please enter a URL" even after entering a va... | The entered URL is missing the protocol prefix (https:// ... | Ensure the SCIM endpoint URL begins with https:// or http... | 🟢 8.5 | ADO Wiki |
| 13 | SCIM Validator tool shows "SCIM Validation failed. Internal Server Error" aft... | The entered SCIM endpoint URL is not valid or the endpoin... | Verify the SCIM endpoint URL is correct and the endpoint ... | 🟢 8.5 | ADO Wiki |
| 14 | SCIM Validator tool shows "Invalid credentials!" after reviewing attributes a... | The entered bearer token or credentials are incorrect, or... | Review and correct the bearer token and SCIM endpoint URL... | 🟢 8.5 | ADO Wiki |
| 15 | SCIM Validator tool shows "Could not discover the schema during processing" a... | The SCIM endpoint URL entered is invalid. The validator c... | Verify the SCIM endpoint URL is correct and accessible. E... | 🟢 8.5 | ADO Wiki |
| 16 | SCIM Validator tool shows "/schemas endpoint not found" after submitting the ... | The SCIM server does not implement the /Schemas endpoint ... | Implement the /Schemas endpoint on the SCIM server per SC... | 🟢 8.5 | ADO Wiki |
| 17 | Custom attribute not provisioned outbound to enterprise application. Provisio... | FlowBehavior is set to FlowWhenChanged in the provisionin... | Navigate to Enterprise App > Provisioning > Edit attribut... | 🟢 8.5 | ADO Wiki |
| 18 | User export to AWS IAM Identity Center fails with StatusCode 400 BadRequest: ... | User object in Entra ID is missing one or more required a... | Ensure all users in provisioning scope have firstName, la... | 🟢 8.5 | ADO Wiki |
| 19 | User export to AWS IAM Identity Center fails with 400 BadRequest when provisi... | AWS IAM Identity Center does not support multi-valued att... | Option 1: Ensure user has only one value for phoneNumber/... | 🟢 8.5 | ADO Wiki |
| 20 | Group membership update fails during outbound provisioning. User cannot be ad... | The member user is not being successfully provisioned fro... | Ensure the member user is in provisioning scope and succe... | 🟢 8.5 | ADO Wiki |
| 21 | After performing clear state/restart of provisioning job, group members are o... | When clear state is performed while a read/write gap (bac... | Check for read/write gap before performing clear state. I... | 🟢 8.5 | ADO Wiki |
| 22 | Directory extension attributes are missing from the source attribute dropdown... | The getAvailableExtensionProperties API used by the attri... | Verify extensions exist via Graph API (POST directoryObje... | 🟢 8.5 | ADO Wiki |
| 23 | All group members removed from Oracle IDCS (Identity Cloud Service) when only... | Non-gallery app with Oracle connector is not SCIM complia... | Switch from the non-gallery/BYOA SCIM app to the official... | 🟢 8.5 | ADO Wiki |
| 24 | Customer asks about SCIM provisioning availability for non-gallery/BYOA appli... | SCIM provisioning via non-gallery app was a feature gap. ... | SCIM provisioning for non-gallery apps is GA in Mooncake ... | 🟢 8.0 | OneNote |
| 25 | Provisioning to AWS IAM Identity Center fails due to invalid/unsupported char... | AWS IAM Identity Center does not allow certain characters... | Clean attribute values in Entra ID (source) to remove uns... | 🔵 7.5 | ADO Wiki |
| 26 | Customer reports Azure AD Join failure or provisioning issue on device with d... | Windows 365 Cloud PCs use a unique 'zero touch' AADJ proc... | Identify Cloud PC: displayname starts with 'CPC-', Device... | 🔵 6.5 | ADO Wiki |
| 27 | Need to validate if M365 Identity tenant is concierge (seat count < 300). IsC... | The IsConcierge attribute in Case Buddy and the Support A... | Validate concierge status using IsConcierge attribute in ... | 🔵 6.5 | ADO Wiki |
| 28 | ECMA Connector Host provisioning placed into quarantine with error SystemForC... | ECMA Connector Host is not accessible from Microsoft Entr... | Verify ECMA Host server is online. Check ECMA2Host servic... | 🔵 6.5 | ADO Wiki |
| 29 | ECMA Connector Host Test Connection fails with error "You appear to have ente... | No active provisioning agent assigned to the enterprise a... | In the Entra provisioning configuration, go to On-Premise... | 🔵 6.5 | ADO Wiki |
