# ENTRA-ID B2B Guest Access — Detailed Troubleshooting Guide

**Entries**: 123 | **Drafts fused**: 14 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-b2b-invitations-blocked-tsg.md, ado-wiki-c-auto-remove-stale-pending-guest-users.md, ado-wiki-c-b2b-searching-service-logs.md, ado-wiki-d-avd-b2b-identities.md, ado-wiki-d-b2b-aadsts-error-codes.md, ado-wiki-d-b2b-xtap.md, ado-wiki-e-b2b-collaboration-sponsors.md, ado-wiki-e-ca-fine-grained-guest-policies.md, ado-wiki-e-ca-guests-and-roles.md, ado-wiki-g-inactive-guest-report.md
**Generated**: 2026-04-07

---

## Phase 1: B2B
> 60 related entries

### Cross-tenant B2B collaboration fails when customer restricts allowed applications to Office365 only. Guest users cannot login to guest tenant porta...
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: MicrosoftAdminPortals app is implicitly required for portal access but not included in the Office365 app bundle. This app cannot be added via Portal UI directly - only via Graph API.

**Solution**: Use Graph API to PATCH crossTenantAccessPolicy partner settings. Add MicrosoftAdminPortals app (AppId: c44b4083-3bb0-49c1-b47d-974e53cbdf3c) and the required portal app (80ccca67-54bd-44ab-8625-4b79c4dc7775) to the b2bCollaborationInbound.applications.targets array alongside Office365. Endpoint: PATCH https://microsoftgraph.chinacloudapi.cn/v1.0/policies/crossTenantAccessPolicy/partners/{guestTenantId}. Prerequisites: register app with Graph permission to modify CrossTenant settings, obtain Grap

---

### B2B guest user authentication fails after migrating from Tango to CC B2B. Guest users in Tenant B can no longer authenticate because home tenant (T...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: After deprecating Tenant A (global), Tenant B's guest users still point to Tenant A as home tenant for authentication. Cross-tenant access with 21V Tenant C (same domain) is not set up.

**Solution**: 1) Set up cross-tenant access between Tenant B and 21V Tenant C. 2) Reset redemption status for guest users in Tenant B. 3) Resend invitation — users will re-accept using Tenant C as home tenant.

---

### B2B invitation cannot be sent when invited user UPN and email address differ. Portal and PowerShell only send invitations to accounts where UPN mat...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Azure AD B2B invitation mechanism uses the same address for both authentication lookup and email delivery.

**Solution**: Workaround 1: Invite via Portal, manually copy InviteRedeemUrl and forward to actual email. Workaround 2: Use PowerShell bulk invite (New-AzureADMSInvitation) which returns InviteRedeemUrl in output.

---

### AADSTS50107: The requested federation realm object does not exist - occurs during B2B SAML/WS-Fed guest sign-in
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Three possible causes: (1) IDP-initiated sign-on attempted, which is not supported by Entra External ID SAML Federation; (2) No matching SAML/WS-Fed federation configuration found in the resource tenant for the realm in the token; (3) External SAML IDP sent SAMLResponse to wrong endpoint (e.g., /common instead of /login.srf)

**Solution**: (1) Use SP-initiated sign-on via Entra supported endpoints only; (2) Verify federation config exists in resource tenant via ASC Graph Explorer: GET /directory/federationConfigurations/graph.samlOrWsFedExternalDomainFederation; (3) Ensure IDP sends SAMLResponse to https://login.microsoftonline.com/login.srf (workforce) or https://<tenantID>.ciamlogin.com/login.srf (External ID)

---

### AADSTS5000819: Email address claim is missing or does not match domain from an external realm / AADSTS500089: SAML 2.0 assertion validation failed ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SAML Response from external IDP is missing required attributes or sent to incorrect destination URL. Required: (1) Correct Destination URL, (2) NameID with email format, (3) emailaddress claim attribute, (4) AudienceRestriction matching https://login.microsoftonline.com/<tenantID>/

**Solution**: Capture HAR/Fiddler trace, decode SAMLResponse sent to login.microsoftonline.com/login.srf, verify all 4 required SAML attributes are present with correct values. If missing, reconfigure the external SAML IDP to emit them. Also verify email domain matches a configured Entra SAML federated identity provider.

---

### AADSTS5000811: Unable to verify token signature. The signing key identifier does not match any valid registered keys - during B2B SAML federation s...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SAML Response signed with a certificate that does not match the signing certificate configured in the Entra External ID SAML Federation configuration

**Solution**: (1) Capture Fiddler trace, decode SAMLResponse, extract X509Certificate value; (2) Compare with signingCertificate in ASC Graph Explorer GET /directory/federationConfigurations/graph.samlOrWsFedExternalDomainFederation; (3) If mismatch, customer contacts SAML IDP for updated metadata XML and reconfigures Entra SAML Federation signing certificate per docs

---

### Invitation redemption failed - An error has occurred. Please retry again shortly - on invitations.microsoft.com during B2B SAML federation invite r...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Underlying AADSTS authentication error on login.microsoftonline.com/login.srf is relayed to invitations.microsoft.com, causing a generic failure message

**Solution**: Capture HAR/Fiddler, inspect invitations.microsoft.com request Webforms section to find the relayed AADSTS error code and correlation ID. Troubleshoot the root cause AADSTS error (commonly AADSTS50107, AADSTS5000819, AADSTS5000811). Use ASC Auth Troubleshooter with correlation ID for further analysis.

---

### B2B invite redemption prompt: You are currently signed in as user1@domain.com, however, user2@domain.com was invited. Do you want to switch? - duri...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Email claim in the SAMLResponse (http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress) does not match the invited guest user's email address in mail/proxyAddress attribute

**Solution**: Capture HAR/Fiddler, decode SAMLResponse, check emailaddress attribute value matches the invited email found in the Guest user object's mail/proxyAddress. If mismatch, either the IDP needs to emit the correct email or the invitation was sent to the wrong address.

---

### B2B guest users with SAML/WS-Fed federation are redirected to an Entra tenant login page instead of the configured SAML federated Identity Provider
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Guest's domain (e.g., contoso.com) is a DNS-verified domain on another Entra tenant. Default redemption order prioritizes Entra (azureActiveDirectory) above SAML/WS-Fed federation (externalFederation)

**Solution**: (1) Verify SAML federation config exists via ASC Graph Explorer; (2) Confirm domain is Entra-verified by checking https://login.microsoftonline.com/contoso.com/.well-known/openid-configuration; (3) Resource tenant admin reorders redemption order via Cross-Tenant Access Settings to prioritize externalFederation above azureActiveDirectory. Verify via GET /policies/crossTenantAccessPolicy/default?$select=invitationRedemptionIdentityProviderConfiguration

---

### Unable to configure SAML/WS-Fed direct federation for a domain - API error: Invalid domain. Domain should match the passiveSignInUri
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known bug: when the federation domain (e.g., mydomain.com) differs from the passive authentication endpoint domain (e.g., login.mydomain.com), the API rejects the configuration. Also fails if the domain is DNS-verified on Azure AD or auth URL domain is not in the allowed list.

**Solution**: Workaround for domain mismatch bug: add DNS TXT record in format DirectFedPassiveSignInUri=https://login.mydomain.com/adfs (note: must use DirectFedPassiveSignInUri= format, not DirectFedAuthUrl= as shown in some docs). Also verify: (1) domain is not DNS-verified on another Azure AD tenant; (2) auth URL domain matches target domain or is in allowed list (accounts.google.com, pingidentity.com, login.pingone.com, okta.com, my.salesforce.com).

---

## Phase 2: Tap
> 4 related entries

### Error 'Temporary Access Pass cannot be added to an external guest user' when trying to assign TAP
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TAP is not supported for external guest users (users federated or invited from other Entra ID tenants). Only members and internal guests are supported

**Solution**: TAP can only be issued to members and internally managed guests. For external guest users, alternative authentication methods must be used

---

### Error 'Temporary Access Pass cannot be added to an external guest user' when trying to add TAP to a guest account; admin expects TAP to work for al...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TAP is supported for internal guest accounts but NOT for external guest accounts. Admin may confuse internal vs external guest types

**Solution**: Verify account type in ASC: Internal Guest has Sources=MOERA domain only, CreationType=N/A, UserType=Guest, ExternalUserState=N/A. External Guest has Sources from other tenants, CreationType=Invitation. TAP only works for Internal Guests

---

### TAP does not work for external guest users - error: Temporary Access Pass cannot be added to an external guest user
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: External guest users (federated signInType) are not supported for TAP. Only internal member and internal guest accounts can use TAP.

**Solution**: Verify account type via Graph API: GET /users/{id}?$select=identities. If signInType=federated and issuer=ExternalAzureAD, TAP is not supported. TAP only works for accounts with signInType=userPrincipalName.

---

### TAP provisioning fails for guest account - need to determine if account is internal guest (TAP supported) vs external guest (not supported)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TAP only applies to Internal Guest Accounts (signInType=userPrincipalName, issuer=tenant domain). External Guest Accounts (signInType=federated, issuer=ExternalAzureAD) are blocked.

**Solution**: Check user identities via Graph: GET /users/{id}?$select=identities. Internal Guest: signInType=userPrincipalName. In ASC: Sources should not show Microsoft Account; Creation Type=N/A; External User State=N/A.

---

## Phase 3: Cross Cloud
> 3 related entries

### Cross-cloud B2B guest user cannot access Azure Portal when navigating to portal.azure.com or portal.azure.cn directly without specifying tenant.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Default portal endpoint cannot determine which tenant the guest user should authenticate against in cross-cloud scenarios.

**Solution**: MUST use tenanted endpoint: portal.azure.com/<tenant>.onmicrosoft.com or portal.azure.cn/<tenant_ID>. Direct portal.azure.com will NOT work.

---

### Cross-cloud B2B guest invitation fails for consumer accounts (Microsoft personal accounts / LiveID).
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: CC B2B only supports organizational accounts. Consumer accounts (outlook.com, hotmail.com, live.com) are not supported.

**Solution**: Use organizational accounts (onmicrosoft.com or custom verified domain). Consumer/LiveID cannot be invited as CC B2B guests.

---

### CC B2B does not support Azure Data Explorer (ADX) web UI authentication or Dynamics 365 access for guest users.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: ADX web UI and Dynamics 365 are not on the official supported app list for cross-cloud B2B. Only supported: SharePoint/OneDrive, Office Web, Teams, Power BI.

**Solution**: No workaround for ADX web UI or Dynamics 365 via CC B2B. For ADX: use REST API or Kusto Explorer with explicit token.

---

## Phase 4: Tenant Governance
> 3 related entries

### Sending a governance invitation from the governed tenant fails with HTTP 403 forbidden: "Failed to send governance invitation"
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The governing tenant has not enabled the "Allow other tenants to send governance invitations to this tenant" setting in Tenant governance settings

**Solution**: Navigate to Tenant governance settings blade under Settings → Toggle "Allow other tenants to send governance invitations to this tenant" to Enabled → Save. Graph API: PATCH /directory/tenantGovernance/settings with body {"canReceiveInvitations":true}

---

### Sending a governance invitation from the governed tenant fails with HTTP 403 Forbidden: Failed to send governance invitation
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The governing tenant has not enabled the Allow other tenants to send governance invitations setting in Tenant Governance Settings

**Solution**: In the governing tenant: Entra admin center > Settings > Tenant governance settings > Toggle Allow other tenants to send governance invitations to Enabled > Save. Graph API: PATCH /directory/tenantGovernance/settings with body {canReceiveInvitations:true}

---

### Sending a governance invitation fails with HTTP 403: Maximum limit of 10 reached
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The governed tenant has already sent the maximum of 10 outbound governance invitations

**Solution**: Delete existing outbound invitations that are no longer needed, then retry. Invitations expire after 30 days automatically

---

## Phase 5: Claims
> 2 related entries

### User.usertype claim returns "UserTypeCloudManaged" instead of expected "Member" or "Guest" values
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known backend bug (Work Item 2838247)

**Solution**: Use conditional claim issuance: emit "Member" if User Type is "Members", emit "Guest" if User Type is "All Guests". Note: B2B users converted to Member still get "Guest"; use altSecId to distinguish external vs internal.

---

### User.usertype claim returns UserTypeCloudManaged instead of Member/Guest
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known backend bug (Work Item 2838247)

**Solution**: Use conditional claim issuance. B2B converted to Member still shows Guest; use altSecId.

---

## Phase 6: Entra Domain Services
> 2 related entries

### SamAccountName in Microsoft Entra Domain Services has random GUID characters appended (e.g. CN=John Doe (0eFEDF225))
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SamAccountName is based on MailNickname property. When MailNickname is >20 chars or conflicts with another user's SamAccountName, sync agent appends 11-char GUID suffix. Common with guest users sharing same MailNickname.

**Solution**: 1) Find conflicting users via Get-EntraUser filtering by mailNickname. 2) Temporarily change both users' MailNicknames to unique values. 3) Wait for sync to MEDS. 4) Change desired user's MailNickname back to original. 5) Verify SamAccountName is correct after 5-10 min sync. For >20 char issue: shorten MailNickname to <20 chars.

---

### External/guest user cannot sign in to Microsoft Entra Domain Services managed domain
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MEDS does not have credentials for external user accounts. External users authenticating to MEDS is not a supported scenario.

**Solution**: Inform customer this is not supported. External users cannot sign in to the managed domain. Only internal member users (cloud-only or synced) are supported.

---

## Phase 7: Myapps
> 2 related entries

### Collection Owners don't see the Collections blade under Enterprise Apps when they sign into the Azure portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Collection owner account has Guest membership in another tenant and they signed into the Azure portal of that guest tenant instead of their home tenant.

**Solution**: Perform a 'Switch user' or 'Switch directory' in the Azure portal to change back to the owner's home tenant where the Collections are configured.

---

### Collection Owners cannot see the Collections blade under Enterprise Apps in Azure portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Collection owner account has Guest membership in another tenant and signed into the Azure portal of that (guest) tenant instead of their home tenant.

**Solution**: Perform Switch user / switch directory to change back to the home tenant where the owner account has full access.

---

## Phase 8: Aadsts50020
> 2 related entries

### AADSTS50020/16003/500211/50034/51004: B2B user account does not exist in resource tenant - User account from identity provider does not exist in te...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: External user tried to sign into resource tenant but no guest account matching that username was found via proxy address lookup. Causes: user not invited, invite not redeemed, duplicate proxyAddress conflict, wrong tenant endpoint, or stale guest object from re-created home user.

**Solution**: 1) Verify guest user in resource tenant via ASC. 2) Check ProxyAddress matches. 3) If no user, invite via B2B. 4) If invite pending, check InviteTicket. 5) For duplicate proxyAddress, check conflicting Contact objects. 6) Use ASC Auth Troubleshooter with correlation ID to analyze AuthQuery(UserData) diagnostic logs.

---

### AADSTS50020 error: User account from identity provider does not exist in tenant
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: Multiple causes: single-tenant app, wrong endpoint, wrong session, uninvited guest, user assignment required, ROPC with personal accounts, stale guest from re-created user

**Solution**: Change signInAudience; use correct endpoint (/organizations or /common); InPrivate browser; invite guest; assign user to app; use tenant-specific endpoint for ROPC; reset guest redemption status

---

## Phase 9: Dynamic Groups
> 2 related entries

### Guest user is not added to a dynamic Office 365 group despite matching the membership rule
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: If the group is an Office 365 group, the AllowToAddGuests directory setting may block guest addition. A sensitivity label assigned to the group can override AllowToAddGuests to False, making it read-only.

**Solution**: Check audit logs for Assign label to group events. Verify AllowToAddGuests setting at both tenant-level and group-level. If a sensitivity label with guest policy is assigned, AllowToAddGuests becomes read-only. Reference: https://learn.microsoft.com/en-us/graph/group-directory-settings

---

### Guest user not added to dynamic O365 group despite matching membership rule
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AllowToAddGuests=False at tenant/group level. Sensitivity label assignment can silently override AllowToAddGuests when EnableMIPLabels=True.

**Solution**: Check AllowToAddGuests via PowerShell. Check audit logs for 'Assign label to group'. Review guest policy on sensitivity label. Ref: https://learn.microsoft.com/en-us/graph/group-directory-settings

---

## Phase 10: Aadsts
> 2 related entries

### AADSTS50020: User account from identity provider does not exist in tenant and cannot access the application. Occurs in CSP/Partner scenarios where ...
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: User account from partner/external tenant is not present as a guest or does not have required partner admin group membership. In B2B direct link redemption, no corresponding guest user in PendingAcceptance state with matching proxyAddress found in resource tenant.

**Solution**: Ensure user is added to Partner Admin Groups (e.g., AdminAgents) in the Partner tenant. For B2B scenarios, create guest user in resource tenant. For CSP, follow MS Graph CSP auth docs and GDAP admin permissions guidance.

---

### AADSTS701014: Cannot generate more one time passcodes (OneTimeCodeGenerationErrorGenerateLimit) during B2B email OTP authentication.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Too many OTP codes requested within a 30-minute window. Maximum is 2 OTP codes per datacenter per 30 minutes.

**Solution**: Wait at least 30 minutes before requesting new OTP codes. Inform user about the rate limit of 2 OTP codes per datacenter per 30-minute window.

---

## Phase 11: Ests
> 2 related entries

### High latency (>2s) for guest user sign-in when guest tenant is in different geo from home tenant. StsResponseTime and DpxTotalTimeSum significantly...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: DPX calls to retrieve home tenant user data must cross geo-locations. ESTS and DPX are 1:1 mapped in same fault domain. Cross-geo DPX data retrieval adds significant latency.

**Solution**: Expected behavior. DPX SLA is 5 seconds. Check DPX/MSODS region in ASC sign-in logs (UserTenantMsodsRegionScope). Consider multi-geo data replication if legal requirements met.

---

### Guest user (B2B) sees account does not exist error when trying to authenticate, even though the guest account exists in the tenant
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Email OTP authentication method is disabled in the tenant authentication methods policy; with no available auth method for the guest, GetCredentialType returns IfExistsResult=1 (NotExists)

**Solution**: Enable Email OTP in the authentication methods policy; verify the authentication scenario and methods are supported and enabled by tenant admins

---

## Phase 12: Proxy Address
> 2 related entries

### Guest user mail property and primary proxy address (SMTP:) are out of sync. The mail shows the invited email but proxyAddresses does not contain it...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: When a guest is invited to a tenant where a contact already exists with the same proxy address, the mail property is set for the invited user but the address is not added to the proxyAddresses collection. This is by-design behavior for guest users.

**Solution**: This is expected behavior for guest users. The mail property for guests reflects the invited email regardless of proxy address state. If the customer needs them in sync, they may need to remove the conflicting contact object first, then re-invite the guest.

---

### Adding a non-verified domain to proxyAddresses for a user with Exchange license silently fails (no error returned) in certain scenarios: guest user...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The code has special-case handling for guest re-invitation and mail-update-to-same-value scenarios that bypasses the normal verified-domain check, causing the operation to silently succeed without actually applying the change.

**Solution**: Be aware that these two scenarios are known silent failure cases. Verify the domain in the tenant or remove the Exchange license before attempting to add non-verified domain proxy addresses.

---

## Phase 13: Guest User
> 2 related entries

### UPN of an invited guest user appears to be truncated - only partial email address shown before #EXT#
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The UPN part before @ is limited to 54 characters (59 including #EXT#). If the invited guest has a very long email address, only the first 54 characters are used.

**Solution**: This is a known platform limitation. The 54-character limit on UPN prefix for guest users is enforced by design. Inform customer of this limitation.

---

### Guest Users created manually in Azure AD using PowerShell (New-MsolUser with -UserType Guest) are unable to login to SharePoint site. After changin...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: The Usertype needs to be Member in AAD or the #EXT# string in the user name is causing the failure.

**Solution**: Option 1: Change the member type to Member using Set-MsolUser -UserPrincipalName UPN -UserType Member. Option 2: Replace #EXT# in username with -ext.

---

## Phase 14: Aadsts530004
> 2 related entries

### AADSTS530004: AcceptCompliantDevice setting is not configured for this organization. External (guest) users blocked from accessing protected resour...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Three causes: (1) Resource tenant inbound XTAP does not trust compliant device claims from external user home org while CA requires device compliance. (2) External user token not from Intune-joined device in home tenant (only Intune-joined devices send IsCompliantDeviceAccepted:true claim). (3) Legacy/classic CA policy with RequiredDeviceState=Known or resource app legacy auth policy with same config.

**Solution**: For XTAP: enable Trust compliant device in resource tenant inbound cross-tenant access settings. Ensure guest device is Intune-joined in home tenant, user signs in with PRT (not incognito). For legacy CA: migrate classic policies to modern CA. For legacy auth policies: app owner should migrate to modern CA. Use ASC Auth Troubleshooter Expert View (XTAP + CA Diagnostic tabs) for diagnosis.

---

### AADSTS530004 error: AcceptCompliantDevice setting not configured for guest user
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: CA policy requires device compliance/hybrid join but XTAP trust not configured; device auth fails in InPrivate/unsupported browsers

**Solution**: Create XTAP policy with Trust compliant/hybrid devices; ensure device Intune-enrolled; remove Require approved client app for guests

---

## Phase 15: Gsa
> 2 related entries

### Switching GSA client account to resource tenant fails when the resource tenant is configured for required MFA in cross-tenant settings and the home...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Known limitation: the external user access feature does not support the combination of required MFA in resource tenant cross-tenant config with passwordless sign-in (PSI) on Authenticator in home tenant.

**Solution**: No workaround currently available. This is a documented known limitation. Avoid enforcing MFA in cross-tenant settings when home tenant users rely on passwordless sign-in via Authenticator.

---

### External user access in resource tenant fails when compliant network policies are enforced for private applications. External users from other tena...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: External users cannot meet the compliant network requirement from an external tenant. The compliant network check does not recognize external tenant GSA connections.

**Solution**: External users must be excluded from compliant network Conditional Access policies applied to private applications. Create an exclusion group for B2B guests in the CA policy conditions.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cross-tenant B2B collaboration fails when customer restricts allowed applicat... | MicrosoftAdminPortals app is implicitly required for port... | Use Graph API to PATCH crossTenantAccessPolicy partner se... | 🟢 10.0 | OneNote |
| 2 | AADSTS50020: User account from identity provider does not exist in tenant and... | User account from partner/external tenant is not present ... | Ensure user is added to Partner Admin Groups (e.g., Admin... | 🟢 9.5 | ADO Wiki |
| 3 | B2B/CCB2B users cannot SSO on MDM iOS devices. Edge login always requires pas... | Issue 1: Prompt=login forces fresh login. Issue 2: Device... | Check broker logs for Prompt=login. Cross-tenant issue: e... | 🟢 9.0 | OneNote |
| 4 | B2B guest user authentication fails after migrating from Tango to CC B2B. Gue... | After deprecating Tenant A (global), Tenant B's guest use... | 1) Set up cross-tenant access between Tenant B and 21V Te... | 🟢 9.0 | OneNote |
| 5 | Encrypted documents shared from Azure China cloud to Commercial cloud users a... | Cross-cloud AIP/sensitivity label encryption does not sup... | Do NOT send encrypted documents as attachments across clo... | 🟢 9.0 | OneNote |
| 6 | Cross-cloud B2B guest user cannot access SharePoint documents. Authentication... | SharePoint cross-cloud B2B authentication requires the UP... | Authenticate using UPN, not email address. Inform users t... | 🟢 9.0 | OneNote |
| 7 | B2B invitation cannot be sent when invited user UPN and email address differ.... | Azure AD B2B invitation mechanism uses the same address f... | Workaround 1: Invite via Portal, manually copy InviteRede... | 🟢 9.0 | OneNote |
| 8 | Cross-cloud B2B guest user cannot access Azure Portal when navigating to port... | Default portal endpoint cannot determine which tenant the... | MUST use tenanted endpoint: portal.azure.com/<tenant>.onm... | 🟢 9.0 | OneNote |
| 9 | Cross-cloud B2B guest invitation fails for consumer accounts (Microsoft perso... | CC B2B only supports organizational accounts. Consumer ac... | Use organizational accounts (onmicrosoft.com or custom ve... | 🟢 9.0 | OneNote |
| 10 | CC B2B does not support Azure Data Explorer (ADX) web UI authentication or Dy... | ADX web UI and Dynamics 365 are not on the official suppo... | No workaround for ADX web UI or Dynamics 365 via CC B2B. ... | 🟢 9.0 | OneNote |
| 11 | 21v Azure portal has a known issue blocking Cross-Cloud B2B guest user login.... | Platform-level known issue in 21v (Mooncake) Azure portal... | Issue has been fixed by PG. If recurring, escalate via IC... | 🟢 9.0 | OneNote |
| 12 | Guest user cross-tenant SSO shows GUID as NameID instead of email address. Na... | Claims mapping policies do not apply to guest users (B2B)... | Cannot use mail as NameID for guest users via claims mapp... | 🟢 9.0 | OneNote |
| 13 | Email one-time passcode (EOTP) is not delivered to B2B guest users whose acco... | In Mooncake, the EOTP flow relies on live.com (GetOneTime... | Verify whether the B2B guest user account is MSA-register... | 🟢 8.5 | OneNote |
| 14 | Verified ID Issuance: "attestations.missing" / "Credential subject in output ... | B2B guest account does not have First name and Last name ... | Edit the guest user account properties in the resource te... | 🟢 8.5 | ADO Wiki |
| 15 | AADSTS50107: The requested federation realm object does not exist - occurs du... | Three possible causes: (1) IDP-initiated sign-on attempte... | (1) Use SP-initiated sign-on via Entra supported endpoint... | 🟢 8.5 | ADO Wiki |
| 16 | AADSTS5000819: Email address claim is missing or does not match domain from a... | SAML Response from external IDP is missing required attri... | Capture HAR/Fiddler trace, decode SAMLResponse sent to lo... | 🟢 8.5 | ADO Wiki |
| 17 | AADSTS5000811: Unable to verify token signature. The signing key identifier d... | SAML Response signed with a certificate that does not mat... | (1) Capture Fiddler trace, decode SAMLResponse, extract X... | 🟢 8.5 | ADO Wiki |
| 18 | Invitation redemption failed - An error has occurred. Please retry again shor... | Underlying AADSTS authentication error on login.microsoft... | Capture HAR/Fiddler, inspect invitations.microsoft.com re... | 🟢 8.5 | ADO Wiki |
| 19 | B2B invite redemption prompt: You are currently signed in as user1@domain.com... | Email claim in the SAMLResponse (http://schemas.xmlsoap.o... | Capture HAR/Fiddler, decode SAMLResponse, check emailaddr... | 🟢 8.5 | ADO Wiki |
| 20 | B2B guest users with SAML/WS-Fed federation are redirected to an Entra tenant... | Guest's domain (e.g., contoso.com) is a DNS-verified doma... | (1) Verify SAML federation config exists via ASC Graph Ex... | 🟢 8.5 | ADO Wiki |
| 21 | Unable to configure SAML/WS-Fed direct federation for a domain - API error: I... | Known bug: when the federation domain (e.g., mydomain.com... | Workaround for domain mismatch bug: add DNS TXT record in... | 🟢 8.5 | ADO Wiki |
| 22 | Google Workspace SAML federated B2B guest user gets 403 error: app_not_config... | Google Workspace does not have a SAML relying party appli... | Google Workspace IDP admin follows https://support.google... | 🟢 8.5 | ADO Wiki |
| 23 | B2B invitation fails due to proxyAddress or mail attribute conflict — invited... | ProxyAddress or mail attribute conflict: the invited emai... | In Azure Support Center → Tenant Explorer, search Users/G... | 🟢 8.5 | ADO Wiki |
| 24 | B2B service logs on aadb2bprod.westus2 Kusto cluster are PII-redacted since A... | PII redaction policy applied to B2B service logs starting... | Track scenarios/ICMs/Cases in CSS AAD Log Access Tracking... | 🟢 8.5 | ADO Wiki |
| 25 | Sending a governance invitation from the governed tenant fails with HTTP 403 ... | The governing tenant has not enabled the "Allow other ten... | Navigate to Tenant governance settings blade under Settin... | 🟢 8.5 | ADO Wiki |
| 26 | Sending a governance invitation from the governed tenant fails with HTTP 403 ... | The governing tenant has not enabled the Allow other tena... | In the governing tenant: Entra admin center > Settings > ... | 🟢 8.5 | ADO Wiki |
| 27 | Sending a governance invitation fails with HTTP 403: Maximum limit of 10 reached | The governed tenant has already sent the maximum of 10 ou... | Delete existing outbound invitations that are no longer n... | 🟢 8.5 | ADO Wiki |
| 28 | User.usertype claim returns "UserTypeCloudManaged" instead of expected "Membe... | Known backend bug (Work Item 2838247) | Use conditional claim issuance: emit "Member" if User Typ... | 🟢 8.5 | ADO Wiki |
| 29 | User.usertype claim returns UserTypeCloudManaged instead of Member/Guest | Known backend bug (Work Item 2838247) | Use conditional claim issuance. B2B converted to Member s... | 🟢 8.5 | ADO Wiki |
| 30 | SamAccountName in Microsoft Entra Domain Services has random GUID characters ... | SamAccountName is based on MailNickname property. When Ma... | 1) Find conflicting users via Get-EntraUser filtering by ... | 🟢 8.5 | ADO Wiki |
