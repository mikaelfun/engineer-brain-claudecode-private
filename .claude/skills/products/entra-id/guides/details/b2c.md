# ENTRA-ID Azure AD B2C — Detailed Troubleshooting Guide

**Entries**: 89 | **Drafts fused**: 27 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-b2c-conditional-access-ip-p2-retirement.md, ado-wiki-a-b2c-end-of-sale-reference.md, ado-wiki-b-b2c-linkedin-oidc-idp.md, ado-wiki-b-debug-idp-federation-azure-ad-b2c.md, ado-wiki-c-b2c-email-delivery-troubleshooting.md, ado-wiki-c-b2c-kusto-queries.md, ado-wiki-c-b2c-latency-kusto-queries.md, ado-wiki-c-configure-fiddler-b2c.md, ado-wiki-c-tsg-troubleshooting-afd-b2c-504-errors.md, ado-wiki-d-b2c-locate-correlation-id-and-logs.md
**Generated**: 2026-04-07

---

## Phase 1: Custom Policy
> 14 related entries

### Azure AD B2C custom policy XML file exceeds 1024 KB (1 MB) size limit — unable to upload policy
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Single B2C custom policy file exceeds the default 1024 KB maximum policy file size limit

**Solution**: Raise ICM to request policy file size increase to 2 MB. No additional cost to customer. Example ICM: incident/224729690.

---

### Need to pass extra query parameters like login_hint from Azure AD B2C to federated IdP but user flows do not support this
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: B2C standard user flows do not support passing custom query parameters to federated IdPs; requires custom policy

**Solution**: Use B2C custom policy: Add ClaimType LoginHint, then InputClaim with PartnerClaimType=login_hint DefaultValue={OIDC:LoginHint}. In MSAL.js use extraQueryParams

---

### B2C custom policies: Continue/Create button not grayed during email verification (Signup/Forgot Password). Users can click before verification comp...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Missing Display Controls (VerificationControl) with SSPR-based email verification. Without them, B2C does not enforce verification completion before enabling submit.

**Solution**: Add: 1) verificationCode ClaimType, 2) emailVerificationControl/emailVerificationSSPRControl DisplayControls, 3) AadSspr-SendCode/VerifyCode TPs, 4) Update ForgotPassword/LocalAccountDiscovery to use DisplayControlReferenceId.

---

### B2C GenerateJson produces escaped double quotes in JSON array values. dest shows as escaped string instead of proper value.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CreateJsonArray intermediate step then GenerateJson causes double-encoding. First transformation outputs JSON string, second re-escapes it.

**Solution**: Remove CreateJsonArray. Pass original claim directly to GenerateJson. Test with minimal policy using SelfAssertedAttributeProvider.

---

### Azure AD B2C SSO does not work after password reset when using custom policies - user is not recognized in subsequent authentication requests becau...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The password reset UserJourney does not enlist into SM-AAD session management, so objectId/signInName/authenticationSource claims are not written to the SSO cookie after password reset

**Solution**: Add an OrchestrationStep in the password reset UserJourney that calls a ClaimsTransformation TechnicalProfile (CT-EnlistIntoSM-AAD) with UseTechnicalProfileForSessionManagement referencing SM-AAD. This writes objectId into the x-ms-cpim-sso cookie enabling SSO post password reset

---

### Password incorrect error message does not change in Azure AD B2C custom policy even after modifying the metadata in login-NonInteractive technical ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known B2C bug: localization breaks when login-NonInteractive TechnicalProfile metadata contains <Item Key='grant_type'>password</Item>

**Solution**: Remove the line <Item Key='grant_type'>password</Item> from the login-NonInteractive TechnicalProfile metadata and re-upload the custom policy. Also update LocalizedResources/LocalizedString as they take precedence over metadata

---

### Azure AD B2C custom policy months dropdown is broken when using Thai language (th) localization
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Default localization file has incorrect format for Thai language months string - commas missing between month values

**Solution**: Override months string in custom policy LocalizedResources for Thai: <LocalizedString ElementType='UxElement' StringId='months'>,,,,,,,,,,,</LocalizedString>

---

### Error uploading B2C custom policy: The policy being uploaded is not XML or is not correctly formatted: Data at the root level is invalid. Line 1, p...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Hidden BOM (Byte Order Mark) or invisible space character at position 1:2 in the XML policy file that is not visible in VSCode

**Solution**: Use a hex editor or Beyond Compare to identify the hidden character at line 1 position 1, remove it (or copy content to a new file), and re-upload. The extra space/BOM causes XML parsing to fail

---

### B2C SSO not working after password reset - SSO cookie lacks claims
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Password reset UserJourney missing SM-AAD enlistment

**Solution**: Add OrchestrationStep with CT-EnlistIntoSM-AAD referencing SM-AAD

---

### B2C password error message unchanged after modifying login-NonInteractive TP
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug: localization breaks with grant_type=password in metadata

**Solution**: Remove grant_type=password item, update LocalizedResources

---

## Phase 2: Error Code
> 8 related entries

### Error AADB2C90080: Refresh token grant expired
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Refresh token expired/revoked

**Solution**: Request new auth code

---

### Error AADB2C90088: Grant not issued for this endpoint
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Token for different endpoint

**Solution**: Use correct endpoint

---

### Error AADB2C90167: Signing cert has no private key
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Cert lacks private key

**Solution**: Upload PFX with private key

---

### Error AADB2C90240: Token malformed - OIDC signature fail
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Key mismatch with external IdP

**Solution**: Verify IdP metadata and keys

---

### Error AADB2C90240: Intermittent signature failure
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Key rotation/metadata cache

**Solution**: Re-upload policy or wait for refresh

---

### Error AADB2C90289: IdP connection timeout
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Network issue to external IdP

**Solution**: Check reachability and firewall

---

### Error AADB2C90289: IdP TLS handshake failure
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TLS mismatch or cert chain issue

**Solution**: Ensure TLS 1.2+ and valid chain

---

### Error AADB2C90289: IdP DNS resolution failure
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: DNS cannot resolve hostname

**Solution**: Verify hostname and DNS

---

## Phase 3: Apple Idp
> 4 related entries

### Azure AD B2C Sign in with Apple ID stops working after ~6 months. Users cannot authenticate via Apple identity provider.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Apple client secrets expire every 6 months. If not renewed, the federation breaks silently.

**Solution**: Renew the Apple client secret before expiration. Admin receives a warning 1 month before expiry. Requires Apple developer account membership. See: https://learn.microsoft.com/azure/active-directory-b2c/identity-provider-apple-id

---

### Azure AD B2C with Apple IDP: Apple does not return email, firstName, lastName claims on sign-up. User created in B2C tenant is missing these values...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Apple only sends user profile information (first name, last name, email) on the very first sign-in with a new relying party. Subsequent sign-ins do not include these claims.

**Solution**: Use Custom Policies instead of User Flows. Configure email as an output claim in the Apple technical profile. See: https://learn.microsoft.com/azure/active-directory-b2c/identity-provider-apple-id?pivots=b2c-custom-policy#configure-apple-as-an-identity-provider-1

---

### Sign in with Apple integration in Azure AD B2C stops working after approximately 6 months
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Apple client secrets expire every 6 months automatically.

**Solution**: Renew the Apple secret before expiration. Admin receives a warning when 1 month remains. Apple developer account membership is required to configure Sign in with Apple.

---

### Sign-up with Apple IDP in Azure AD B2C does not return email, firstname, or lastname. User created in B2C is missing these values. Log shows: A cla...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Apple only provides user profile information (first name, last name, email) on the very first sign-in with a new relying party. Subsequent sign-ins do not include this data.

**Solution**: Use Custom Policies where email can be added as an output claim. Configure Apple as identity provider with custom policy per Microsoft docs: identity-provider-apple-id?pivots=b2c-custom-policy#configure-apple-as-an-identity-provider-1

---

## Phase 4: End Of Sale
> 3 related entries

### Cannot create new Azure AD B2C tenant after B2C End of Sale (May 2025). Portal creation blocked for new customers.
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: B2C End of Sale policy blocks new tenant creation. Only existing B2C customers with active tenants can create new B2C P1 tenants.

**Solution**: If customer has business justification, work with account manager to submit an Ask.Entra request at https://aka.ms/askentra to get exception approval for new B2C tenant creation.

---

### Azure AD B2C End of Sale: new customers cannot purchase B2C after May 1, 2025. B2C P2 tier retires March 15, 2026. Existing customers can continue ...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Microsoft product lifecycle decision. B2C is being replaced by Microsoft Entra External ID. GoLocal for Japan/Australia expected GA Aug 2025; GCC and China timelines TBD.

**Solution**: Existing customers: continue using B2C (P1 only for new tenants). New customers: evaluate Microsoft Entra External ID. Migration tooling: JIT/hybrid capabilities private preview May 2025, public preview EoQ1FY26. Mooncake: same timeline, details TBD.

---

### New customer or engineer unable to create a new Azure AD B2C tenant after May 1, 2025; Azure portal only shows workforce or external tenant options...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD B2C reached End of Sale on May 1, 2025. Only tenants that had an Azure subscription linked to a B2C tenant as of the May 1, 2025 snapshot are permitted to create additional B2C tenants. New customers cannot purchase or create Azure AD B2C.

**Solution**: For new customers: B2C is End of Sale; redirect to Microsoft Entra External ID. For existing customers (had subscription linked before May 1, 2025 snapshot): they can create new B2C tenants using same or a new subscription. Dev tenant without prior B2C (but prod has B2C): follow the exception escalation process. Full service continues until at least 2030 for existing customers.

---

## Phase 5: Msal
> 3 related entries

### MSAL prompt parameter (select_account or login) is ignored during Azure AD B2C authentication with federated IdP - user auto signed in
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: B2C does not pass prompt parameter from MSAL to federated IdP by default. User may be authenticated via AAD-joined device or SSO session

**Solution**: Configure B2C custom policy: Add ClaimType aadPrompt with PartnerClaimType=prompt, then InputClaim in AAD technical profile with DefaultValue=login or select_account. Verify via Fiddler

---

### MSAL returns id_token and refresh_token but no access_token when acquiring token from Azure AD B2C
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Invalid scope passed or API permission scopes not created/consented on the B2C app registration

**Solution**: Create scopes on API app reg, grant permissions on client app reg, pass correct scope format. For B2C can use app-id as scope. Changes can take up to 2h to propagate.

---

### MSAL B2C: No account matching the specified username / No matching account found in token cache
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: B2C custom policy includes tid claim in OutputClaims which conflicts with MSAL cache account lookup

**Solution**: Remove tid claim from B2C custom policy OutputClaims. Use alternative claim (issuerTenantId mapped to utid) if tenant ID needed.

---

## Phase 6: Throttling
> 2 related entries

### Azure AD B2C returns HTTP 429 throttling error — customer traffic exceeds per-tenant or per-IP RPS limits (Gateway throttling or B2C downstream ser...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: B2C request rate exceeds Azure AD B2C service throttling limits. Two types: Gateway throttling (AAD Gateway layer) and B2C throttling (downstream services like SMS/Phone MFA)

**Solution**: 1) Collect tenant ID, policy name, timestamps + correlation IDs of 429 errors. 2) Use ASC troubleshooter: [Identity][B2C] Scoping TSG → B2C Tenant Throttling HTTP 429 Errors. 3) For rate limit increase: customer must first enable B2C Custom Domain + integrate WAF partner (Akamai/Azure WAF/CloudFlare) with IP rate limiting and bot protection. 4) Under 500 RPS increase can bypass WAF requirement. 5) Raise ICM with CID TA Triage using template (tmpl=Y1j3q3). 6) Pricing: ~$10K/mo for 500 RPS, ~$25K/

---

### Azure AD B2C policy is being throttled with category Cpim.TPEngine.RequestPerPolicyTenantWithDevMode
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The B2C custom policy has DeploymentMode set to Development, which imposes a lower throttling limit

**Solution**: Remove or change the DeploymentMode from Development in the TrustFrameworkPolicy element. See https://learn.microsoft.com/azure/active-directory-b2c/trustframeworkpolicy

---

## Phase 7: Msal Js
> 2 related entries

### MSAL.js ClientAuthError: endpoints_resolution_error - "Endpoints cannot be resolved". Cloud Discovery Instance call fails or authority not validated.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Authority URL malformed or not recognized. For B2C/CIAM/third-party IdP, knownAuthorities missing, causing MSAL to attempt Cloud Discovery which only works with standard Entra ID.

**Solution**: Entra ID: authority = https://login.microsoftonline.com/{tenant}. B2C: authority = https://contoso.b2clogin.com/{tenant}/{policy}, knownAuthorities: ["contoso.b2clogin.com"]. CIAM: authority = https://contoso.ciamlogin.com/{tenant} with matching knownAuthorities.

---

### X-Frame-Options deny during B2C authentication with SAML SSO, third-party IdP, or MFA. B2C custom policy fails to render in iframe.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: B2C custom policies involving SAML SSO, external IdP redirects, or MFA trigger iframe flows blocked by X-Frame-Options: DENY.

**Solution**: Use loginPopup/acquireTokenPopup. For SAML SSO: configure HTTP Redirect (GET) binding instead of POST. Consider B2C Embedded sign-up/sign-in experience with custom policies.

---

## Phase 8: Aadb2C90289
> 2 related entries

### Error AADB2C90289: We encountered an error connecting to the identity provider - caused by AADSTS7000222 expired client secret on external Entra ID...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The client_secret in the B2C policy key for the external Entra ID identity provider has expired (AADSTS7000222).

**Solution**: Generate a new client secret on the external tenant app registration (https://aka.ms/NewClientSecret). Update the B2C policy key: Azure Portal > Azure AD B2C > Identity Experience Framework > Policy Keys > update the key. Verify via ASC Tenant Explorer > Audit Logs > Category=KeyManagement.

---

### Error AADB2C90289: We encountered an error connecting to the identity provider - caused by AADSTS50146 MissingCustomSigningKey when SSO/claims-mapp...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The external app has custom signing keys due to claims-mapping configuration (AADSTS50146). B2C uses standard OIDC metadata URL which does not include app-specific signing key info.

**Solution**: Update the metadata URL in B2C identity provider configuration to include appid query parameter: https://login.microsoftonline.com/{tenant}/.well-known/openid-configuration?appid={applicationId}. This directs B2C to the app-specific signing key endpoint.

---

## Phase 9: Azure Government
> 2 related entries

### Azure AD B2C is not available in Microsoft Azure Government - end of sale May 1, 2025, customers need to migrate
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD B2C Government (GCC preview) has been discontinued. After May 1, 2025, the B2C-G SKU is removed and new tenant creation is blocked.

**Solution**: Advise customers to migrate from B2C Government to Entra External ID (commercial) for CIAM. MEEID for US Government has no timeline yet. After May 1 existing customers cannot create new B2C Government tenants.

---

### Azure Government B2C tenant customer cannot find the "Link a subscription" option in the Azure portal for billing as described in public docs
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Linking an Azure Government B2C tenant to an Azure subscription is not supported (confirmed 2024-12-12). This is a documented limitation specific to Azure Government vs. global Azure.

**Solution**: This is a known unsupported scenario for Azure Government B2C. Reference: "Compare Azure Government and global Azure - Azure Active Directory B2C" documentation. There is no workaround currently available.

---

## Phase 10: Aadb2C90063
> 2 related entries

### AADB2C90063: Unable to create new IEF Policy key in B2C portal. Error: The key has failed to be created. There is a problem with the service. IDX10...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The B2C_1A_AdminClientEncryptionKeyContainer has been accidentally modified to contain more than 1 key. The service expects exactly 1 key for encryption/decryption and throws an error when multiple keys are found.

**Solution**: Delete the B2C_1A_AdminClientEncryptionKeyContainer (which has multiple keys). Then create a new policy key using the manual option. The AdminClientEncryptionKeyContainer will be automatically regenerated with a single key.

---

### AADB2C90063: Unable to create custom authentication extension in B2C. Error: There is a problem with the service.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Enterprise App "Azure Active Directory Authentication Extensions" (AppId 99045fe1-7639-4a75-9d4a-577b6ca3810f) does not exist in the tenant, which is required for custom authentication extensions.

**Solution**: Create the service principal: Connect-MgGraph then New-MgServicePrincipal -AppId 99045fe1-7639-4a75-9d4a-577b6ca3810f. Wait 30 minutes for propagation.

---

## Phase 11: Tls
> 2 related entries

### After disabling TLS 1.0 and TLS 1.1 for an Azure AD B2C tenant, Qualys SSL Labs report still shows TLS 1.0/1.1 as enabled/supported
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Qualys SSL Labs only proves that TLS 1.0/1.1 is accessible at the protocol/network layer. Azure AD B2C Gateway disables TLS 1.0/1.1 at the service level - the request does not proceed even if SSL Labs can initiate a connection at the protocol level.

**Solution**: Verify service-level enforcement using curl: `curl https://login.microsoftonline.com/te/{tenant.onmicrosoft.com} --tlsv1.0 --tls-max 1.0` or `curl https://login.microsoftonline.com/cpim?tenantid={tenantId} --tlsv1.1 --tls-max 1.1`. The SSL Labs report is a false positive; TLS 1.0/1.1 is correctly blocked at the B2C service layer.

---

### Qualys SSL Labs report lists RSA and CBC TLS 1.2 ciphers as WEAK for Azure AD B2C; customer requests these ciphers be disabled
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: RSA and CBC ciphers are flagged as weak but have no known active exploits. Azure AD B2C gateway team has no plans to disable them due to backward compatibility requirements for older B2C clients (as of February 2024).

**Solution**: No native method to disable specific weak ciphers in Azure AD B2C. If customer needs fewer ciphers: implement Azure Front Door in front of B2C and enforce TLS 1.2 - this reduces available cipher set. SSL Labs still gives grade A with these ciphers present. No SLA or timeline for native cipher removal.

---

## Phase 12: 404
> 2 related entries

### Azure AD B2C sign-in returns Server Error 404 at OpenIdConnectConfiguration GetConfigurationAsync
**Score**: 🔵 5.5 | **Source**: MS Learn

**Root Cause**: Policy Name (SignInPolicyId/PasswordResetPolicyId/UserProfilePolicyId) missing or incorrect in web.config

**Solution**: Verify ida:SignInPolicyId, ida:PasswordResetPolicyId, ida:UserProfilePolicyId in web.config match Azure B2C portal

---

### Azure AD B2C sign-in returns 404 HttpRequestException for openid-configuration policy endpoint
**Score**: 🔵 5.5 | **Source**: MS Learn

**Root Cause**: ida:SignUpPolicyId missing or incorrect in Web.config

**Solution**: Verify ida:SignUpPolicyId exists and matches sign-up policy name from B2C portal

---

## Phase 13: Password Expiration
> 1 related entries

### Azure AD B2C local account passwords expire after 90 days unexpectedly. Users cannot sign in with expired passwords.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: B2C local accounts created via custom policy or Azure AD Graph API do not have passwordPolicies set to DisablePasswordExpiration by default. Only accounts created by built-in password policy get this automatically. Without this setting, passwords expire after 90 days.

**Solution**: Run PowerShell: Connect-AzureAD → Get-AzureADUser -All $true | Set-AzureADUser -PasswordPolicies DisablePasswordExpiration. Alternatively use Graph API PATCH with {"passwordPolicies":"DisablePasswordExpiration"}. After patching, the original password can be used again immediately. For large tenants, pace writes to under 7000/5min to avoid 429 throttling.

---

## Phase 14: User Restore
> 1 related entries

### Unable to restore deleted B2C user. Error: 'A conflicting object with one or more of the specified property values is present in the directory' (Re...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: The deleted B2C user's AlternativeSecurityId (AltSecID) conflicts with an existing active user. AltSecID is used by external IdP features - type 1=MSA, 5=AAD, 6=BYOI. When a new user is created with the same external identity after the original was deleted, both share the same AltSecID, blocking restore.

**Solution**: 1) Check MSODS Kusto logs (IfxAuditLoggingCommon + IfxUlsEvents) using correlationId from audit log to identify the conflicting attribute. 2) If browser trace shows conflicted attribute name → search existing users for that value. 3) If no attribute shown → check AltSecID: use ASC/Graph API beta to get deleted user's alternativeSecurityIds, then search active users for matching values. 4) Customer must delete or modify the conflicting active user, then restore the deleted user.

---

## Phase 15: Emails Claim
> 1 related entries

### Azure AD B2C user flow does not return 'emails' claim in token for some users. Users created via Graph API don't get emails claim, but users create...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Users created via Graph API without proper 'identities' attribute are not recognized as B2C local/consumer accounts. The emails claim comes from the identities attribute (signInName without default domain) and otherMails attribute. Users must have creationType=LocalAccount to be treated as consumer accounts.

**Solution**: When creating B2C users via Graph API, use Example 2 from MS docs (Create user with social and local account identities): include 'identities' array with signInType, issuer, and issuerAssignedId. Also set passwordProfile with forceChangePasswordNextSignIn=false and passwordPolicies. Note: use Graph API beta to view all user attributes (v1.0 omits some). The 'Mail' attribute does NOT contribute to emails claim, only identities signInName and otherMails do.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot create new Azure AD B2C tenant after B2C End of Sale (May 2025). Porta... | B2C End of Sale policy blocks new tenant creation. Only e... | If customer has business justification, work with account... | 🟢 10.0 | OneNote |
| 2 | Azure AD B2C local account passwords expire after 90 days unexpectedly. Users... | B2C local accounts created via custom policy or Azure AD ... | Run PowerShell: Connect-AzureAD → Get-AzureADUser -All $t... | 🟢 9.0 | OneNote |
| 3 | Azure AD B2C End of Sale: new customers cannot purchase B2C after May 1, 2025... | Microsoft product lifecycle decision. B2C is being replac... | Existing customers: continue using B2C (P1 only for new t... | 🟢 9.0 | OneNote |
| 4 | Unable to restore deleted B2C user. Error: 'A conflicting object with one or ... | The deleted B2C user's AlternativeSecurityId (AltSecID) c... | 1) Check MSODS Kusto logs (IfxAuditLoggingCommon + IfxUls... | 🟢 9.0 | OneNote |
| 5 | Azure AD B2C user flow does not return 'emails' claim in token for some users... | Users created via Graph API without proper 'identities' a... | When creating B2C users via Graph API, use Example 2 from... | 🟢 9.0 | OneNote |
| 6 | Cannot create VM or enable AADDS inside Azure AD B2C tenant. | B2C tenants are consumer identity (CIAM) only. No infrast... | B2C only supports user flows, custom policies, identity p... | 🟢 9.0 | OneNote |
| 7 | Azure AD B2C returns HTTP 429 throttling error — customer traffic exceeds per... | B2C request rate exceeds Azure AD B2C service throttling ... | 1) Collect tenant ID, policy name, timestamps + correlati... | 🟢 8.5 | ADO Wiki |
| 8 | Azure AD B2C custom policy XML file exceeds 1024 KB (1 MB) size limit — unabl... | Single B2C custom policy file exceeds the default 1024 KB... | Raise ICM to request policy file size increase to 2 MB. N... | 🟢 8.5 | ADO Wiki |
| 9 | Azure AD B2C tenant count per subscription exceeds default limit of 20 — cann... | Default Azure AD B2C tenant creation limit is 20 per subs... | Raise ICM to request B2C tenant creation limit increase. ... | 🟢 8.5 | ADO Wiki |
| 10 | App management policy to restrict password secret lifetime (maxLifetime) is n... | If the app was created before the date in restrictForApps... | Set restrictForAppsCreatedAfterDateTime to an earlier dat... | 🟢 8.5 | ADO Wiki |
| 11 | IDX10205: Issuer validation failed. The iss claim in the access token does no... | The iss claim in the token does not match the expected is... | Ensure the Authority URL matches the token version. For v... | 🟢 8.5 | ADO Wiki |
| 12 | Customer wants to use Managed Identity with Azure AD B2C but it is not availa... | Managed Identity does not support Azure AD B2C. B2C is no... | Managed Identity is not supported for B2C. Use alternativ... | 🟢 8.5 | ADO Wiki |
| 13 | Groups claim is not available in Azure AD B2C user flow policy tokens. No gro... | Azure AD B2C user flow policies do not support the groups... | Use B2C custom policies instead of user flows to include ... | 🟢 8.5 | ADO Wiki |
| 14 | Azure AD Reporting API (auditLogs/signIns) returns 403 with Authentication_Re... | Three possible causes: (1) Tenant is B2C which cannot use... | Verify tenant has Azure AD Premium P1 or P2 subscription.... | 🟢 8.5 | ADO Wiki |
| 15 | User clicks Forgot password link during Azure AD B2C sign-in and app receives... | By design B2C redirects back to app with error AADB2C9011... | In MSAL.js subscribe to msal:loginFailure, check for AADB... | 🟢 8.5 | ADO Wiki |
| 16 | MSAL prompt parameter (select_account or login) is ignored during Azure AD B2... | B2C does not pass prompt parameter from MSAL to federated... | Configure B2C custom policy: Add ClaimType aadPrompt with... | 🟢 8.5 | ADO Wiki |
| 17 | Claims from external IdP not mapped correctly to Azure AD B2C tokens - e.g. u... | B2C does not automatically map all claims from federated ... | In Trust Framework policy: add ClaimType under ClaimsSche... | 🟢 8.5 | ADO Wiki |
| 18 | Need to pass extra query parameters like login_hint from Azure AD B2C to fede... | B2C standard user flows do not support passing custom que... | Use B2C custom policy: Add ClaimType LoginHint, then Inpu... | 🟢 8.5 | ADO Wiki |
| 19 | MSAL returns id_token and refresh_token but no access_token when acquiring to... | Invalid scope passed or API permission scopes not created... | Create scopes on API app reg, grant permissions on client... | 🟢 8.5 | ADO Wiki |
| 20 | MSAL B2C: No account matching the specified username / No matching account fo... | B2C custom policy includes tid claim in OutputClaims whic... | Remove tid claim from B2C custom policy OutputClaims. Use... | 🟢 8.5 | ADO Wiki |
| 21 | MSAL.js ClientAuthError: endpoints_resolution_error - "Endpoints cannot be re... | Authority URL malformed or not recognized. For B2C/CIAM/t... | Entra ID: authority = https://login.microsoftonline.com/{... | 🟢 8.5 | ADO Wiki |
| 22 | X-Frame-Options deny during B2C authentication with SAML SSO, third-party IdP... | B2C custom policies involving SAML SSO, external IdP redi... | Use loginPopup/acquireTokenPopup. For SAML SSO: configure... | 🟢 8.5 | ADO Wiki |
| 23 | B2C tenant quota error creating users but Graph API shows total quota below 100% | B2C has 1 company segment + 4 data segments with individu... | Check per-segment quotas via DS Explorer. Add/verify cust... | 🟢 8.5 | ADO Wiki |
| 24 | B2C custom policy RestfulProvider API calls timing out after April 2025; prev... | RestfulProvider timeout reduced from 30s to 10s as of Apr... | Optimize REST API to respond within 10s. Use Kusto (AllIf... | 🟢 8.5 | ADO Wiki |
| 25 | B2C tenant DDoS via default b2clogin.com domain causing throttling; need to b... | b2clogin.com default domain publicly accessible, targetab... | 1) Configure custom domain via AFD + WAF. 2) Verify no le... | 🟢 8.5 | ADO Wiki |
| 26 | Error AADB2C90080: The provided grant has expired when using a refresh token ... | The refresh token being used has expired. B2C refresh tok... | Add error handling in the application to detect expired g... | 🟢 8.5 | ADO Wiki |
| 27 | Error AADB2C90088: The provided grant has not been issued for this endpoint. ... | The B2C policy used to acquire the authorization code dif... | Ensure the same B2C custom policy is used for both acquir... | 🟢 8.5 | ADO Wiki |
| 28 | Error AADB2C90240: Token malformed - B2C cannot verify the signature of the t... | The external IDP signed the token but B2C could not verif... | Verify the client_secret is correctly configured and refe... | 🟢 8.5 | ADO Wiki |
| 29 | Error AADB2C90289: We encountered an error connecting to the identity provide... | The client_secret in the B2C policy key for the external ... | Generate a new client secret on the external tenant app r... | 🟢 8.5 | ADO Wiki |
| 30 | Error AADB2C90289: We encountered an error connecting to the identity provide... | The external app has custom signing keys due to claims-ma... | Update the metadata URL in B2C identity provider configur... | 🟢 8.5 | ADO Wiki |
