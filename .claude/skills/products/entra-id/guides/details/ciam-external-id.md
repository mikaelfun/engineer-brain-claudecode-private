# ENTRA-ID CIAM/External ID — Detailed Troubleshooting Guide

**Entries**: 25 | **Drafts fused**: 5 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-ciam-overview-tsg.md, ado-wiki-e-ciam-device-code-flow.md, ado-wiki-h-ciam-guest-user-federated-login-redirect.md, ado-wiki-h-fix-invalid-request-login-hint-ciam.md, ado-wiki-h-update-css-ext-link-selector-ciam.md
**Generated**: 2026-04-07

---

## Phase 1: Ciam
> 18 related entries

### User has username identity on their Entra External ID user object but cannot sign in using username - only email works
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Username sign-in method is not enabled in tenant Sign-in Identifiers policy. Information on the user object is separate from what the user can utilize for sign-in.

**Solution**: Enable Username in Sign-in Identifiers under Entra ID > External Identities. The sign-in identifier policy must explicitly allow username as a sign-in method.

---

### Custom regex validation configured for username in Entra External ID but users can still sign in with usernames that do not match the regex pattern
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Both Username and Custom Username are selected in Sign-in Identifiers. Username overrides Custom Username when both are enabled.

**Solution**: Configure Sign-in identifiers to only include Custom Username, remove the Username option. If both are selected, Username will override Custom Username.

---

### Email OTP verification code stated to work for 30 minutes expires before 30 minutes during MFA in Entra External ID (CIAM)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: OTP expiration depends on scenario: 30 minutes for first-factor auth, but only 10 minutes when used as second-factor MFA or SSPR.

**Solution**: By design. First-factor OTP valid 30 min. MFA second-factor or SSPR must complete within 10 minutes. Ref: https://learn.microsoft.com/entra/external-id/customers/concept-multifactor-authentication-customers#email-one-time-passcode

---

### Customer wants to unlink Entra External ID tenant from one Azure subscription and relink to another subscription
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Unlike Azure AD B2C, Entra External ID does not support unlinking and re-linking tenants to subscriptions. Deleting the Azure resource will attempt to delete the entire tenant.

**Solution**: Unlinking/re-linking is NOT supported. WARNING: Deleting the Azure resource will attempt to delete the entire tenant (unlike B2C which just orphans billing). Do not delete the resource if intent is only to move subscriptions.

---

### Invited guest users cannot sign in through External ID Tenant User Flows in Entra External ID (CIAM)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Invited guest users are only supported in External ID Tenants for managing the tenant via administrator roles, not for user flow sign-in.

**Solution**: Instruct users to create new consumer accounts. Guest users in CIAM tenants are for admin management only, not end-user sign-in via user flows.

---

### Custom regex for username validation in Entra External ID does not enforce validation - authentication succeeds with non-matching usernames
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: The regex expression itself is invalid. No built-in validation exists for custom regular expressions beyond ensuring they do not match email address format.

**Solution**: Verify the regex is actually valid. Test regex patterns independently before configuring. Authentication will fail at runtime if the username does not match a valid regex.

---

### Workforce login page displayed instead of CIAM/External ID sign-up page (shows 'Can't access your account?' instead of 'No account? Create one')
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Replication delay for the user flow configuration. User flow data not yet replicated to all ESTS nodes.

**Solution**: Refresh browser after 1-2 minutes. Verify user flow is linked to the application matching the client ID in the login URL. Check app registration and user flow configuration.

---

### AADSTS50011: Redirect URI mismatch when running CIAM sample app - 'The redirect URI specified in the request does not match the redirect URIs confi...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Replication delay updating the redirect URI in app registration, or multiple samples downloaded in same wizard run overriding each other's redirect URIs.

**Solution**: 1) Wait a few minutes and retry. 2) Verify redirect URI in app registration matches the one in error. 3) If using wizard, exit/restart between sample runs to use separate app registrations.

---

### AADSTS7000215: Invalid client secret provided when running ASP.NET Core CIAM sample
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Replication delay updating the client secret in app registration, or multiple samples in same wizard run creating conflicting secrets.

**Solution**: Wait a few minutes and retry (may need up to next day in some cases). Verify client secret exists in app registration and matches the app configuration value.

---

### Unable to delete CIAM/External ID tenant - deletion fails even after removing all resources
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: The b2c-extensions-app was not deleted. This app is hidden under 'All applications' and users skip it because the name says 'do not modify'.

**Solution**: Delete the b2c-extensions-app found under 'All applications' in the Entra portal, then retry tenant deletion. Note: user flows deletion checklist never shows green tick even after all flows deleted - this can be ignored.

---

## Phase 2: Entra External Id
> 3 related entries

### In Entra External ID (CIAM), using login_hint parameter with email addresses from providers like hotmail.com, outlook.com, gmail.com, or yahoo.com ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: When login_hint contains an email from a well-known provider domain, the authorization endpoint interprets it as a federated identity provider login without proper domain disambiguation, causing a redirect to login.live.com instead of the CIAM tenant.

**Solution**: Add the domain_hint parameter alongside login_hint in the authorization request URL. For example, for Gmail users add "&domain_hint=google.com". Full URL format: https://{tenant}.ciamlogin.com/oauth2/v2.0/authorize?client_id=<id>&response_type=code&redirect_uri=<uri>&login_hint=<email>&domain_hint=<provider_domain>. Ensure redirect_uri matches the registered URI for the client application.

---

### After Fluent migration UX rollout in Entra External ID, internal navigation links ("No account? Create one", "Sign in instead", Resend code) lose t...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: As part of modern accessibility enhancements (Fluent migration), internal navigation links changed from using the generic "a, a:link" CSS selector to a new ".ext-link" class selector. Existing custom CSS targeting "a, a:link" no longer matches these elements. Note: Custom CSS is being removed for Entra ID (workforce) but remains available for Entra External ID.

**Solution**: Update the custom CSS file to include the new ".ext-link" selector. Copy the styles previously applied to "a, a:link" and also apply them to ".ext-link". This can be done proactively before the UX rollout to ensure a seamless transition. Reference: https://learn.microsoft.com/en-us/entra/fundamentals/reference-company-branding-css-template

---

### Local account guest users in Entra External ID are redirected to federated login page when signup is disabled in user flow and home tenant has Alte...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Bug in ESTS (Bug 3043172): When signup is disabled in user flow and the home tenant has Alternate Login ID enabled, the system incorrectly redirects local account guest users to the federated login flow instead of allowing local authentication.

**Solution**: Workaround: Enable signup in user flow, then configure an OnAttributeCollectionStart custom authentication extension to send a block page to users attempting to sign up. This allows invited/created guest users to sign in while preventing unwanted signups. Reference: https://learn.microsoft.com/en-us/entra/external-id/customers/concept-custom-extensions

---

## Phase 3: Aadsts
> 2 related entries

### AADSTS500207: The account type cannot be used for the resource you are trying to access. Occurs when accessing a CIAM (Entra External ID for Custom...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CIAM apps only support applications configured for single-tenant (Accounts in this directory only). The application registration is configured as multi-tenant, which is not supported for CIAM.

**Solution**: Configure the application registration as single-tenant (Accounts in this directory only) in Entra ID portal.

---

### AADSTS500208: The domain is not a valid login domain for the account type. Consumer user from Azure AD B2C or Entra External ID (CIAM) tenant fails...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Consumer user from B2C or CIAM tenant is directed to login.microsoftonline.com instead of the correct endpoint (b2clogin.com for B2C, ciamlogin.com for CIAM). For guest admin/invitation scenarios hitting login.microsoftonline.com, the user has no valid role assigned in the resource tenant.

**Solution**: For B2C users: redirect to b2clogin.com. For CIAM users: redirect to ciamlogin.com. For guest admin scenarios accessing B2C/CIAM tenant via Entra/Azure portals: assign a valid role to the user in the resource tenant.

---

## Phase 4: External Id
> 1 related entries

### SMS cannot be used as first factor or for self-service password reset in Entra External ID tenants. Voice-based MFA also not supported. Authenticat...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: SMS is only supported as a second-factor MFA method in External ID. SSPR and first-factor scenarios require Email OTP.

**Solution**: Use Email OTP for SSPR. SMS is only for MFA second factor. Cannot disable EOTP at tenant level if SSPR is needed. Voice MFA not supported in External ID.

---

## Phase 5: Tenant Restrictions
> 1 related entries

### User cannot access allowed partner tenant SPO/resources with Universal TR (NaaS) even though the partner is allow-listed in XTAP policy - using ext...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Confusion between outbound access policy and TRv2: if user uses home tenant identity, this is outbound access policy not TRv2. TRv2 only applies when using external identity. Token infiltration may also occur if PID in token does not match PID in header.

**Solution**: 1) Clarify identity type: home identity = outbound access policy, external identity = TRv2. 2) Check access token xms_trpid claim. 3) Use Kusto RoxyHttpOperationEvent to verify TRv2Enabled and Result. 4) Check app_server_status (401 = workload block). 5) If Result not success, escalate to NaaS Datapath or eSTS.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | User has username identity on their Entra External ID user object but cannot ... | Username sign-in method is not enabled in tenant Sign-in ... | Enable Username in Sign-in Identifiers under Entra ID > E... | 🟢 8.5 | ADO Wiki |
| 2 | Custom regex validation configured for username in Entra External ID but user... | Both Username and Custom Username are selected in Sign-in... | Configure Sign-in identifiers to only include Custom User... | 🟢 8.5 | ADO Wiki |
| 3 | Email OTP verification code stated to work for 30 minutes expires before 30 m... | OTP expiration depends on scenario: 30 minutes for first-... | By design. First-factor OTP valid 30 min. MFA second-fact... | 🟢 8.5 | ADO Wiki |
| 4 | Customer wants to unlink Entra External ID tenant from one Azure subscription... | Unlike Azure AD B2C, Entra External ID does not support u... | Unlinking/re-linking is NOT supported. WARNING: Deleting ... | 🟢 8.5 | ADO Wiki |
| 5 | Invited guest users cannot sign in through External ID Tenant User Flows in E... | Invited guest users are only supported in External ID Ten... | Instruct users to create new consumer accounts. Guest use... | 🟢 8.5 | ADO Wiki |
| 6 | AADSTS500207: The account type cannot be used for the resource you are trying... | CIAM apps only support applications configured for single... | Configure the application registration as single-tenant (... | 🟢 8.5 | ADO Wiki |
| 7 | AADSTS500208: The domain is not a valid login domain for the account type. Co... | Consumer user from B2C or CIAM tenant is directed to logi... | For B2C users: redirect to b2clogin.com. For CIAM users: ... | 🟢 8.5 | ADO Wiki |
| 8 | Custom regex for username validation in Entra External ID does not enforce va... | The regex expression itself is invalid. No built-in valid... | Verify the regex is actually valid. Test regex patterns i... | 🔵 7.5 | ADO Wiki |
| 9 | Workforce login page displayed instead of CIAM/External ID sign-up page (show... | Replication delay for the user flow configuration. User f... | Refresh browser after 1-2 minutes. Verify user flow is li... | 🔵 6.5 | ADO Wiki |
| 10 | AADSTS50011: Redirect URI mismatch when running CIAM sample app - 'The redire... | Replication delay updating the redirect URI in app regist... | 1) Wait a few minutes and retry. 2) Verify redirect URI i... | 🔵 6.5 | ADO Wiki |
| 11 | AADSTS7000215: Invalid client secret provided when running ASP.NET Core CIAM ... | Replication delay updating the client secret in app regis... | Wait a few minutes and retry (may need up to next day in ... | 🔵 6.5 | ADO Wiki |
| 12 | Unable to delete CIAM/External ID tenant - deletion fails even after removing... | The b2c-extensions-app was not deleted. This app is hidde... | Delete the b2c-extensions-app found under 'All applicatio... | 🔵 6.5 | ADO Wiki |
| 13 | CIAM tenant deleted but Azure resource stuck - cannot remove resource from su... | Product defect: when following official deletion docs, te... | 1) Confirm tenant is deleted in backend (use DSXplorer, n... | 🔵 6.5 | ADO Wiki |
| 14 | JWT decode error after July 2025: 'Signed JWT rejected: Another algorithm exp... | Application is using login.microsoftonline.com openid-con... | Configure the application to use https://{tenant}.ciamlog... | 🔵 6.5 | ADO Wiki |
| 15 | Disable sign-up feature not working correctly when home tenant has Alt Login ... | Bug 3043172: When signup is disabled in user flow AND hom... | Known PG bug (Epic 2678087 / Bug 3043172). Escalate via I... | 🔵 6.5 | ADO Wiki |
| 16 | Email OTP users cannot sign in and see blank screen when Identity Protection ... | Identity Protection should NOT be enabled for EEID tenant... | Disable Identity Protection MFA registration policy on th... | 🔵 6.5 | ADO Wiki |
| 17 | OAuth 2.0 Device Code Flow in Entra External ID (CIAM): verification_uri poin... | Preview limitation: Device Code Flow response returns ver... | Manually change verification_uri from login.microsoftonli... | 🔵 6.5 | ADO Wiki |
| 18 | OAuth 2.0 Device Code Flow in Entra External ID (CIAM) tenant fails - verific... | Preview limitation: initial verification_uri returned by ... | Manually change verification_uri from https://login.micro... | 🔵 6.5 | ADO Wiki |
| 19 | ADSTS50132 error (session not valid due to password expiration/recent change/... | Known preview limitation of Device Code Flow in Entra Ext... | No current workaround for external IDP + Device Code Flow... | 🔵 6.5 | ADO Wiki |
| 20 | User cannot access allowed partner tenant SPO/resources with Universal TR (Na... | Confusion between outbound access policy and TRv2: if use... | 1) Clarify identity type: home identity = outbound access... | 🔵 6.5 | ADO Wiki |
| 21 | OAuth 2.0 Device Code Flow in CIAM: signing in with external IDP fails with A... | Preview limitation: External IDP federation + Device Code... | Known preview limitation (Oct 2025). No workaround. Use l... | 🔵 5.5 | ADO Wiki |
| 22 | SMS cannot be used as first factor or for self-service password reset in Entr... | SMS is only supported as a second-factor MFA method in Ex... | Use Email OTP for SSPR. SMS is only for MFA second factor... | 🔵 5.5 | ADO Wiki |
| 23 | In Entra External ID (CIAM), using login_hint parameter with email addresses ... | When login_hint contains an email from a well-known provi... | Add the domain_hint parameter alongside login_hint in the... | 🔵 5.5 | ADO Wiki |
| 24 | After Fluent migration UX rollout in Entra External ID, internal navigation l... | As part of modern accessibility enhancements (Fluent migr... | Update the custom CSS file to include the new ".ext-link"... | 🔵 5.5 | ADO Wiki |
| 25 | Local account guest users in Entra External ID are redirected to federated lo... | Bug in ESTS (Bug 3043172): When signup is disabled in use... | Workaround: Enable signup in user flow, then configure an... | 🔵 5.5 | ADO Wiki |
