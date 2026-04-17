# ENTRA-ID SAML SSO — Detailed Troubleshooting Guide

**Entries**: 136 | **Drafts fused**: 14 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-get-all-saml-apps-powershell.md, ado-wiki-a-saml-request-troubleshooting-flow.md, ado-wiki-a-saml-request-validation.md, ado-wiki-a-saml-screwdriver-sp-initiated-lab.md, ado-wiki-c-debug-saml-protocol.md, ado-wiki-c-lab-saml-tool-idp-sp-initiated-flows.md, ado-wiki-c-saml-tool-idp-sp-flow-testing.md, ado-wiki-c-using-claims-x-ray-saas-saml-testing.md, ado-wiki-d-generate-saml-request.md, ado-wiki-e-develop-saml2-app.md
**Generated**: 2026-04-07

---

## Phase 1: Saml
> 49 related entries

### Mooncake myapps portal (myapps.windowsazure.cn) cannot launch SAML SSO applications. Error AADSTS50011: redirect URI mismatch for myapps application.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Mooncake myapps portal does not support launching SAML SSO apps the same way as global AAD. The myapps app registration in Mooncake does not have correct redirect URIs.

**Solution**: Forge SAML sign-in URL manually: 1) Capture SAMLRequest from global AAD test login via F12. 2) Decode at samltool.com/decode.php. 3) Modify AssertionConsumerServiceURL (=reply URL), Issuer (=Entity ID), IssueInstant. 4) Re-encode and URL-encode. 5) Construct: https://login.partner.microsoftonline.cn/{tenant}/saml2?SAMLRequest={encoded}. Reply URL in Mooncake: App registration > Authentication > Redirect URIs. Entity ID: Expose an API > Application ID URI.

---

### AADSTS65005: Invalid resource error when accessing SaaS application via SAML SSO. Client requested access to resource not listed in requested permi...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: The Identifier (Entity ID) URL was not configured in the Enterprise Application SSO advanced URL settings. The SAML request Issuer from application side did not match any configured identifier.

**Solution**: Go to Enterprise Application SSO configuration page > Advanced URL settings, manually enter the correct Identifier URL matching the SAML request Issuer. Use Fiddler to capture SAML request and verify the Issuer value.

---

### Enterprise application SAML SSO failure with redirect loop. User sign-in redirects cyclically between two URLs.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Duplicate application registrations in the directory. The configured Enterprise Application was not the correct one with the proper attribute mapping. Identifier URL mismatch between duplicate apps.

**Solution**: 1) Check App Registrations for duplicate apps with same name. 2) Delete duplicate registrations. 3) Verify the correct app has proper identifier and attribute configuration. 4) For multi-tenant apps that cannot be deleted, set availableToOtherTenants=false in Manifest first.

---

### SaaS application (Replicon) SAML SSO fails with Azure AD. Error shows permission issue from a different/unknown tenant.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: The Identifier URL in SAML request was missing a path segment (/saml2/). Mismatch between app-configured identifier and Azure AD Enterprise App identifier caused authentication to hit wrong tenant.

**Solution**: Capture Fiddler trace of SAML SSO flow. Compare SAML request identifier with Enterprise App SSO configuration. Fix the identifier URL to include the missing path segment. Use Test SAML SSO feature in Azure Portal to validate.

---

### SSO fails with SAML assertion too old error. Application rejects AuthnInstant timestamp as stale (e.g. months old) even though SAML token Condition...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Mismatch between Azure AD SSO session token lifetime and application Max Authentication Age setting. Persistent tokens have 180-day lifetime; nonpersistent 24 hours. Application was configured with shorter Max Auth Age (e.g. 92 days) than Azure AD token lifetime.

**Solution**: Align application Max Authentication Age with Azure AD token lifetime. For persistent tokens: set app Max Auth to >= 181 days. Review Azure AD configurable token lifetime policies for reference.

---

### AAD SAML SSO application uses tenant-level certificate instead of application-level certificate. SSO breaks periodically (monthly) because tenant-l...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: UseCustomTokenSigningKey attribute is missing for the application in backend. Likely caused by creating the application from old Azure portal. Without this attribute, federation metadata only contains tenant-level certificates.

**Solution**: In Azure portal: go to application Single sign-on page → Create new certificate → Mark new certificate active → Save. Verify in federation metadata that new cert issuer is Microsoft Azure Federated SSO Certificate. Update the new certificate in the SP (application) side.

---

### SAML SSO fails: application rejects AuthnStatement as too old. SAML response AuthnInstant timestamp is months old despite valid token NotBefore/Not...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Mismatch between Azure AD SSO session token lifetime (persistent=180d, nonpersistent=24h) and application Max Authentication Age setting. Azure AD reuses AuthnInstant from original authentication, but application enforces stricter max age (e.g., 92 days).

**Solution**: Align application Max Authentication Age with Azure AD token lifetime. E.g., change Jive Max Authentication from 92 days to 181 days (> AAD persistent token 180d). Ref: https://docs.microsoft.com/en-us/azure/active-directory/active-directory-configurable-token-lifetimes

---

### AAD SAML SSO application periodically breaks (e.g., monthly). SAML signing certificate uses tenant-level certificate (issuer: accounts.accesscontro...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Application backend is missing UseCustomTokenSigningKey attribute, likely because app was created from old Azure portal. Without this attribute, federation metadata only contains tenant-level certificates.

**Solution**: 1) Azure Portal > Enterprise Apps > Single sign-on > Create new certificate. 2) Mark new certificate active and Save. 3) Verify new cert in app-specific metadata URL. 4) Confirm issuer is 'Microsoft Azure Federated SSO Certificate'. 5) Upload new cert to SP (e.g., SAP).

---

### SAML request signature verification errors: 76020 (Application configured to use only protocols with signed requests), 76021 (Application configure...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: These errors occur when SAML request signing is enabled on an application (requestSignatureVerification.isSignedRequestRequired=true) but the request, certificates, or algorithms are misconfigured. Each error code indicates a specific misconfiguration in the SAML request signing chain.

**Solution**: 76020: Use only /saml2 endpoint. 76021: Sign the SAML request or avoid /common endpoint for LOB apps. 76022: Add a verify certificate to the application. 76023: Security incident - verify app configuration. 76024: Delete unused verify certificates or include KeyInfo in requests. 76025: Include SigAlg in request, or re-submit if request expired (>1h). Check DiagnosticTracesIfx EventId 19929 for diagnostic logs.

---

### SAML multi-instancing SP-initiated errors: 76031 (This endpoint does not support SAML request signing) or 76032 (This service principal ID is not a...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: 76031: SP-Initiated workflow is not supported when SAML request signing (isSignedRequestRequired) is enabled. 76032: The service principal identifier in the URL is not in GUID format.

**Solution**: 76031: Either set isSignedRequestRequired to false, or use the regular /saml2 endpoint. 76032: Pass the service principal object ID as a GUID in the URL path. Use AllPerRequestTable Kusto query with Call column = 'processRequestWithIssuerOverride' to verify SP-initiated flow.

---

## Phase 2: B2C
> 13 related entries

### Error AADB2C90167: The signing certificate does not contain a private key and cannot be used for signing, when configuring SAML in Azure AD B2C
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: A certificate uploaded to B2C policy keys (e.g. B2C_1A_SamlIdpCert) contains only the public key. The SAML2AssertionIssuer technical profile requires a private key to sign SAML responses.

**Solution**: Upload a .PFX certificate file containing both the public and private keys to the B2C policy key. A .CER or .PEM with only the public key will cause this error.

---

### AADB2C90031 during SAML federation: B2C returns "Policy does not specify a default user journey" when SAML IDP responds without RelayState parameter
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The SAML identity provider does not include the original RelayState parameter in its response to B2C SAML SP AuthRequest, causing B2C to lose context about which policy/journey to use

**Solution**: Configure the external SAML IDP or SAML RP to include RelayState in its replies to the B2C SAML Technical Profile. Use Kusto logs and HAR trace to verify.

---

### B2C + SAML IDP: popup appears/vanishes when SPA acquires access token. MSAL.js silent iframe fails, falls back to popup.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SAML IDP metadata has HTTP-POST before HTTP-Redirect in SingleSignOnService. iframe POST blocked by browser.

**Solution**: Reorder SAML IDP metadata: HTTP-Redirect before HTTP-POST in SingleSignOnService. Verify via Kusto IfxSamlProviderRequestEvent.

---

### Azure AD B2C users with multiple SAML/OIDC/OAuth2 identity providers are redirected to the wrong IDP after session expiry instead of the IDP they o...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multiple IDP Technical Profiles share the same Session Management Technical Profile name (e.g., SM-Saml-idp). B2C resolves SSO sessions by finding the first alphabetical match, selecting the wrong IDP.

**Solution**: Assign a unique Session Management Technical Profile name to each IDP Technical Profile. Note: the EnforceReferencingSSOTP metadata flag was introduced to fix this but has been discontinued - verify with EEE if still present on tenant.

---

### B2C does not send logout request to SAML IDP during sign-out; SAML IDP session not terminated
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SAML IDP metadata is missing the SingleLogoutService element for HTTP-POST and HTTP-Redirect bindings, so B2C cannot send logout requests to the IDP

**Solution**: Check the SAML IDP metadata for SingleLogoutService entries. Ask customer to add SingleLogoutService bindings to IDP metadata: <md:SingleLogoutService Binding='urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST' Location='...'/>

---

### B2C does not send logout request to SAML IDP even though SingleLogoutService is present in IDP metadata
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The SAML IDP Technical Profile in B2C uses SM-Noop (no-op session management), which suppresses the logout request to the identity provider

**Solution**: Change the session management from SM-Noop to another provider such as SM-Social. In the SAML IDP TechnicalProfile, update UseTechnicalProfileForSessionManagement ReferenceId from SM-Noop to SM-Social or appropriate session management provider

---

### AADB2C90031 error: Policy B2C_1A_TrustFrameworkBase does not specify a default user journey when integrating SAML IDP with B2C
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The SAML IDP does not send the RelayState parameter back with the SAML Response; B2C requires RelayState to route to the correct user journey

**Solution**: Ask the customer to configure their SAML IDP to include the RelayState in the SAML Response (same RelayState value received in the SAML Request). The IDP vendor/configuration team should resolve this

---

### ResponderException: The service provider is not a valid audience of the assertion during SAML IDP sign-in in B2C
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The IssuerUri in the SAML AuthnRequest sent by B2C does not match the Audience element in the SAML Response from the IDP

**Solution**: Check the SAML IDP configuration to ensure Audience in the SAML Response matches the IssuerUri configured in B2C. The IssuerUri from B2C SAML request must be set as the Audience (Service Provider EntityID) in the IDP

---

### AADB2C99025 error: The specified SAML Binding method urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact is not supported in B2C
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The SAML IDP metadata specifies HTTP-Artifact binding, which Azure AD B2C does not support natively

**Solution**: Configure the SAML IDP to use HTTP-POST or HTTP-Redirect bindings instead of HTTP-Artifact. The IDP metadata should declare SingleSignOnService and SingleLogoutService entries with HTTP-POST or HTTP-Redirect bindings only

---

### ResponderException: The claims provider response has an invalid signature during SAML IDP authentication in B2C
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The certificate used to sign the SAML token is incorrect or is not found in the IDP metadata URL configured in B2C

**Solution**: Verify the SAML IDP metadata URL is correct and accessible, and that the certificate in the metadata matches what the IDP uses to sign tokens. Update the IDP metadata URL in B2C Technical Profile if incorrect

---

## Phase 3: Aadsts
> 8 related entries

### AADSTS399274: The application with App ID is configured for SAML SSO and could not be used with non-SAML protocol. New SAML applications fail to ac...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Security change rolled out by October 11, 2024: apps marked as SAML (via preferredSingleSignOnMode on service principal) can no longer receive JWT tokens through OAuth2/OIDC protocols. Only affects new dependencies; existing apps with OAuth/OIDC traffic are allowlisted.

**Solution**: Customer must create a separate App Registration specifically for OAuth authentication (via App registration portal). Two apps needed: one Enterprise App for SAML SSO and one App Registration for OAuth/client credentials flow. If not working, escalate to ICM: AAD First Party Apps / Application Model.

---

### AADSTS5000819: SAML Assertion is invalid. Email address claim is missing or does not match domain from an external realm. Internal user fails to ac...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Customer configured a Direct Federation (SAML/WS-Fed) trust pointing to their own Entra tenant. This is unsupported when a federated trust between Entra ID and on-prem IdP already exists. Entra ID does not support multiple federations with identical issuers.

**Solution**: Delete the SAML/WS-Fed external trust that points to the same Entra tenant. Direct Federation is meant for guest users (external to tenant), not internal users.

---

### AADSTS500083: Unable to verify token signature. No trusted realm found with identifier. Federated user sign-in fails with SAML/WS-Fed authenticatio...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Mismatch between ImmutableId stored in Azure AD and NameID/ImmutableID in SAML token from federated IdP. Match is case-sensitive. Common: on-prem sAMAccountName case changed after initial sync but AAD Connect did not re-sync (only casing differs).

**Solution**: 1) Check AADConnect sync AnchorAttribute in ASC. 2) Retrieve ImmutableId from Directory object in ASC. 3) Compare against NameID/ImmutableID in SAML token - must be exact case-sensitive match. 4) If casing differs, change on-prem sAMAccountName to match ImmutableId exactly (same case).

---

### AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application. Also appears as invalid_request f...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The redirect_uri (OpenID Connect) or AssertionConsumerServiceUrl (SAML) in the auth request does not exist in the application registration in Entra ID.

**Solution**: Add the redirect URI or ACS URL to the application registration. Use Fiddler to capture the auth request and identify the exact redirect_uri/ACS URL. For first-party (Microsoft-owned) apps, the owning product team must update URLs - Entra ID Auth team cannot modify first-party app URLs.

---

### AADSTS50070: Signout failed. The request specified session indexes which did not match the existing session(s). SAML logout fails when session inde...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User has multiple SAML sessions active (each with different SessionIndex values). The logout request sends a SessionIndex from an earlier session that no longer matches the currently active session. This is a browser/app issue, not an ESTS issue.

**Solution**: Ensure the SAML logout request uses the SessionIndex from the most recent SAML Response AuthnStatement. The application must track which SessionIndex is currently active and use that value in the LogoutRequest.

---

### AADSTS7500525: XML error in SAML message. The SAML request generated by the application is incorrect or invalid.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application vendor constructs a malformed SAML AuthnRequest that does not conform to SAML protocol specifications. May also occur when compressed SAML requests use wrong binding type.

**Solution**: Collect Fiddler/SAML tracer to identify failing SAML request. Have app vendor fix SAML request format per SAML RFC. Ensure compression is only used for Redirect binding, not POST binding. Ref: https://learn.microsoft.com/en-us/entra/identity-platform/single-sign-on-saml-protocol#authnrequest

---

### AADSTS75008: Received SAML request with unexpected destination. Application sends incorrect optional destination attribute in SAML AuthnRequest.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application includes an unexpected destination attribute in the SAML request that does not match the expected Entra ID endpoint.

**Solution**: Have the customer remove the destination attribute from the application-side SAML configuration. Collect Fiddler trace of working vs non-working scenarios. Decode SAMLRequest using Fiddler TextWizard (Transform From DeflatedSaml).

---

### AADSTS90081: WS-Federation message error during IDP-initiated signout from external IDP (Okta/Shibboleth) via /login.srf endpoint.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: /login.srf endpoint only handles SAML/WS-Fed responses, not SAMLRequest from external IdP for logout.

**Solution**: Cannot initiate SAML logout to /login.srf from external IDP. Platform limitation. File feature request if needed.

---

## Phase 4: Aws
> 6 related entries

### AWS provisioning Test Connection fails with 'DiceCredentialValidationFailure: We are unable to authorize access to AWS Single-Account Access' when ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The AWS user account used for provisioning is required by AWS policy to perform MFA. The Test Connection POST call fails with 400 Bad Request because MFA cannot be satisfied programmatically.

**Solution**: Exclude the AWS service account from the AWS MFA policy so that programmatic access (used by Azure AD provisioning) is not blocked by MFA requirements.

---

### User clicking AWS Single-Account Access app from MyApps gets 'invalid SAML response' error. The SAML response is missing the 'https://aws.amazon.co...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Managed users were added to the Users and groups blade of the AWS Single-Account Access application before provisioning of AWS roles was enabled, so they were assigned 'Default Access' instead of an actual AWS role.

**Solution**: Navigate to Users and groups blade of the AWS Single-Account Access application, select the affected user, click Edit assignment, and under Select a role choose one of the roles provisioned from AWS instead of Default Access.

---

### AWS CLI returns 'ExpiredTokenException: Token must be redeemed within 5 minutes of issuance' or 'ExpiredToken when calling the ListRoles operation:...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: For the 5-minute error: user did not select their AWS role and press ENTER within 5 minutes after sign-in. For the SessionDuration error: the SessionDuration claim value (default 900 seconds = 15 minutes) has elapsed since the credential was issued.

**Solution**: Re-run MSEntraAuthAWSCLI.exe and complete role selection promptly. To extend token lifetime, edit the SessionDuration claim under Single sign-on > Attributes & Claims of the AWS Single-Account Access app (valid range: 900-43200 seconds).

---

### User clicking AWS Single-Account Access app from MyApps gets invalid SAML response. Missing https://aws.amazon.com/SAML/Attributes/Role claim. User...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Managed users added before AWS role provisioning was enabled got Default Access instead of actual AWS role.

**Solution**: Edit user assignment in Users and groups blade, select a provisioned AWS role instead of Default Access.

---

### AWS CLI returns ExpiredTokenException (token must be redeemed within 5 minutes) or ExpiredToken (security token expired) after Azure AD sign-in.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: 5-min error: user did not select role in time. SessionDuration error: default 900s elapsed.

**Solution**: Re-run MSEntraAuthAWSCLI.exe. To extend token lifetime, edit SessionDuration claim (900-43200 seconds) under Single sign-on > Attributes & Claims.

---

### AWS SAML SSO fails with invalid SAML response error on AWS side after setup. AAD shows no errors. Provisioning shows no export activity.
**Score**: 🔵 7.0 | **Source**: OneNote

**Root Cause**: User assigned Default Access role instead of provisioned AWS role. AWS SSO requires Role and RoleSessionName claims with actual AWS IAM roles. AWS user provisioning from AAD NOT supported - only role sync (AWS->AAD). AWS uses JIT provisioning for users.

**Solution**: 1) Configure auto-provisioning to sync AWS roles to AAD (not users). 2) Assign users with actual AWS role (synced) instead of Default Access. 3) Ensure Role and RoleSessionName claims configured in SAML attributes.

---

## Phase 5: Claims
> 5 related entries

### Group claim missing from SAML/JWT token when using group name regex transform; TraceCode 25729 in logs: 'Overage limit has been hit for groups'
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User has 1000+ group memberships; token group overage limit is reached before the transform can be applied — the transform is silently ignored

**Solution**: Apply group name filtering in the claims configuration to reduce the number of groups below the overage threshold before the transform runs

---

### Only the first custom group claim transform appears in the token; subsequent group claim transforms are silently ignored; TraceCode 25721 in logs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Only one custom group-based claim is permitted per token. Multiple custom group claims configured via a claims mapping policy have subsequent transforms ignored.

**Solution**: Consolidate to a single custom claim sourced from group claims. The Entra portal enforces this limit; the issue only occurs when configuring multiple group-sourced claims directly via policy.

---

### Custom claim from additional user attribute (extension attribute) is missing from the token; TraceCode 25701: 'The user claim with ExtensionID XXX ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The source attribute is empty or not populated on the user object. For synced users, the attribute may not be configured in the sync rules or not populated on the on-premises object.

**Solution**: Check user object via Graph Explorer or Entra portal UI to verify the attribute has a value. For synced attributes: verify sync configuration and confirm the on-premises user object has the attribute populated.

---

### Custom claims using extension attribute not emitted in token (TraceCode 25701): 'The user claim with ExtensionID failed to emit because property wa...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Source attribute is empty or not populated on the user object. For synced users, the attribute may not be configured for sync in AAD Connect or the on-premises user object doesn't have the value.

**Solution**: Check user object via Graph Explorer or portal UI. For synced attributes, verify AAD Connect sync configuration includes the attribute and that the on-premises user object has the value populated. Claim will be omitted (not error) if source is empty.

---

### After configuring Join() transformation for NameID claim, the token shows persistentId instead of the expected joined value
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Either (a) both source attributes are unpopulated on the user object (if only one is present, it's used as-is), or (b) the Join() result is in email format but the domain portion is not in the tenant's verified domains list.

**Solution**: Check user attributes in Graph Explorer for both source attributes. Verify the domain used in the Join result is in the tenant's verified domain list (Azure AD → Custom domain names). Try using a different NameID format or a verified domain in the join.

---

## Phase 6: Identifier Uri
> 4 related entries

### Failed to add identifier URI error: 'All newly added URIs must contain a tenant verified domain, tenant ID, or appId, as per tenant policy.' Occurs...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Identifier URI protection enforcement (deployed May 19, 2025) blocks non-default identifier URIs to prevent impersonation attacks. The tenant's defaultAppManagementPolicy has uriAdditionWithoutUniqueTenantIdentifier or nonDefaultUriAddition restriction enabled.

**Solution**: Options: (1) Use default URI format: api://{appId} or api://{tenantId}/{appId}. (2) Configure app to receive v2 tokens (set requestedAccessTokenVersion=2, but cannot revert to v1 afterwards). (3) Use SAML protocol for SSO. (4) Grant per-app exemption using appManagementPolicies API or GrantAppExemption.ps1 script. (5) Grant caller exemption using GrantCallerExemption.ps1. (6) Admin can disable protection entirely (not recommended) using DisableIdentifierUriProtection.ps1. Reference: https://aka.

---

### Failed to add identifier URI: All newly added URIs must contain tenant verified domain, tenant ID, or appId. Error in Expose an API blade.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Identifier URI protection enforcement (May 2025) blocks non-default URIs. defaultAppManagementPolicy has nonDefaultUriAddition restriction enabled.

**Solution**: (1) Use default URI: api://{appId}. (2) Switch to v2 tokens. (3) Use SAML. (4) Per-app exemption via appManagementPolicies. (5) Caller exemption. (6) Disable protection (not recommended). Ref: https://aka.ms/identifier-uri-formatting-error

---

### Failed to add identifier URI: All newly added URIs must contain a tenant verified domain, tenant ID, or appId, as per tenant policy. Occurs after M...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Tenant app management policy enforces identifier URI protection (uriAdditionWithoutUniqueTenantIdentifier or nonDefaultUriAddition restriction). New URIs must contain unique tenant identifier.

**Solution**: Options: 1) Use default URI api://{appId} or api://{tenantId}/{appId}. 2) Switch to v2 tokens (requestedAccessTokenVersion=2). 3) Configure as SAML SSO app. 4) Get per-app exemption via custom appManagementPolicy. 5) Get per-actor exemption via custom security attribute. Admin can run DisableIdentifierUriProtection.ps1 to opt out.

---

### 'Failed to add identifier URI. All newly added URIs must contain a tenant verified domain, tenant ID, or appId, as per tenant policy' error after M...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft auto-enabled the uriAdditionWithoutUniqueTenantIdentifier restriction in the tenant default app management policy on May 19 2025. Non-default identifier URIs that don't contain tenant verified domain/ID/appId are blocked.

**Solution**: Use default URIs api://{appId} or api://{tenantId}/{appId}. Alternatively configure app for v2.0 tokens, or use SAML SSO. Admins can exempt specific apps via GrantAppExemption.ps1 or disable tenant policy via DisableIdentifierUriProtection.ps1 (not recommended). Opt-out: run DisableIdentifierUriProtection.ps1.

---

## Phase 7: Application Proxy
> 4 related entries

### AADSTS50011 error 'The reply URL specified in the request does not match the reply URLs configured for the application' when accessing SAML-based a...
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: The External URL of the Application Proxy app is not configured as a Reply URL in the SAML SSO settings. When the published app's internal Assertion Consumer Service URL differs from the App Proxy External URL, both must be registered as Reply URLs in Entra SAML configuration.

**Solution**: Add the App Proxy External URL as a Reply URL: Entra Portal > Enterprise Applications > app > Single sign-on > Basic SAML Configuration > Edit. Ensure both the app's ACS URL and App Proxy External URL are listed as Reply URLs. For SP-initiated sign-on, verify the SAML AuthnRequest AssertionConsumerServiceURL matches a configured Reply URL. Use ASC Sign-ins Diagnostics (Expert View > Diagnostic Logs, search 'Reply url specified in the request') to identify the mismatched URL.

---

### Creating or updating Microsoft Entra Application Proxy app fails with error 'This External Url is already in use by another application' (appProxyE...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The exact same external URL is already configured in another Application Proxy app, Enterprise App Reply URL, Identifier URI (SAML SSO), or ServicePrincipalNames

**Solution**: Use ASC Tenant Explorer > Application Proxy to locate the app with the duplicate external URL. Also query MS Graph: GET /applications?$filter=identifierUris/any(uri:uri eq 'URL') and GET /servicePrincipals?$filter=servicePrincipalNames/any(x: startsWith(x, 'URL')). Check with and without trailing slash. If updating an existing app, check if the SAML Identifier or App Registration Reply URL matches the new external URL and remove the conflict.

---

### Configuring Microsoft Entra Application Proxy fails with 'Alternate URL entered is already used by another application' when updating alternate URL...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multiple causes: (1) Another app uses the same alternate URL; (2) Invalid characters in app name or URL; (3) SAML SSO default Reply URL matches current external URL preventing URL change (bug: Unable to remove redirectUri used as defaultRedirectUri); (4) HMA configuration conflict; (5) New fallback domain was configured

**Solution**: For SAML SSO conflict: in SAML configuration, modify the default Reply URL (append 'temp/' path), save, update App Proxy external URL, then restore correct default Reply URL. For other causes: locate and remove conflicting URL from the other app or fix invalid characters.

---

### SAML SSO through Microsoft Entra Application Proxy fails with multiple login prompts or authentication loop; user sees repeated re-authentication r...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Reply URL in SAML configuration does not match or is not a sub-path under the Application Proxy External URL. The handoff between pre-authentication flow and SAML SSO flow breaks when URLs are misaligned.

**Solution**: Set SAML Reply URL root to match or be a path under the Application Proxy External URL. If the backend app expects the Reply URL to be the internal URL, install the My Apps Secure Sign-In Extension which performs automatic client-side redirect to the App Proxy Service.

---

## Phase 8: Aadsts75011
> 3 related entries

### SAML SSO fails with AADSTS75011: Authentication method WindowsIntegrated does not match requested authentication method Password, ProtectedTransport.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: SaaS app SAML request has RequestedAuthnContext Comparison="exact" requesting PasswordProtectedTransport (forms-based auth). Internal users authenticate via Windows Integrated Authentication (WIA), causing exact comparison to fail.

**Solution**: Contact SaaS app vendor to: 1) Change RequestedAuthnContext Comparison from "exact" to less restrictive value, or 2) Allow other authentication methods in SAML request besides PasswordProtectedTransport. Verify by checking SAMLRequest in Fiddler for RequestedAuthnContext element.

---

### AADSTS75011: Authentication method mismatch during SAML SSO. User authenticates with X509/MultiFactor but app requests Password/ProtectedTransport ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The SAML application includes RequestedAuthnContext specifying a specific auth method (e.g. Password). User authenticates with a different method (e.g. certificate/MFA). With Comparison=exact, methods must match exactly.

**Solution**: Contact app vendor to: 1) Remove RequestedAuthnContext from SAML request (optional element), OR 2) Set to Unspecified. Workaround: user signs out and signs in with the method requested by the app. Long-term: use Conditional Access instead of RequestedAuthnContext.

---

### AADSTS75011: Authentication method mismatch - user auth method does not match requested AuthnContextClassRef in SAML SSO
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: SAML request contains RequestedAuthnContext requiring specific AuthnContextClassRef but user has active session using different auth method

**Solution**: Ask app vendor to remove RequestedAuthnContext from SAML request (optional). Or set forceAuthn=true in SAML request to force fresh authentication

---

## Phase 9: Aadsts50107
> 3 related entries

### AADSTS50107: "The requested federation realm object does not exist" for federated domain with third-party IdP returning incorrect IssuerURI.
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: Third-party IdP returns an incorrect IssuerURI in the SAML response. Entra ID cannot match it to an existing federation realm object.

**Solution**: Option 1: Contact third-party IdP to fix the IssuerURI. Option 2: Update IssuerURI in Entra ID using Update-MgDomainFederationConfiguration -DomainId "domain.com" -IssuerUri "{correct-value}". For SAML protocol add -PreferredAuthenticationProtocol SAMLP.

---

### AADSTS50107: "The requested federation realm object does not exist" during On-Behalf-Of (OBO) flow with SAML assertion.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The SAML assertion used in OBO flow is issued by Azure AD (http://sts.windows.net/{TenantID}) instead of the federated IdP (e.g., AD FS). Azure AD blocks its own issuer in this context.

**Solution**: Ensure the SAML assertion is issued by the federated IdP (e.g., AD FS), not by Azure AD. Regenerate the assertion using the correct identity provider.

---

### AADSTS50107 error: Federation realm object does not exist - guest redemption fails via SAML external trust
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: Issuer URL in SAML response does not match issuer URL in Entra ID direct federation config

**Solution**: Update issuer URL in External Identities > Identity providers > Custom to match SAML response

---

## Phase 10: Chrome Extension
> 2 related entries

### Microsoft Single Sign On Chrome extension shows 'Access requested' and SSO does not work; chrome_debug.log shows 'ChromeBrowserCore error NoExtensi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Chrome extension permissions not properly granted by admin policy; extension is installed but lacks site access permissions

**Solution**: Customer must work with their admin (or Google) to grant correct permissions to the Microsoft Single Sign On extension

---

### Chrome SSO does not work when Microsoft Editor spelling/grammar extension is installed alongside Microsoft Single Sign On extension
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Interference between Microsoft Editor Chrome extension (gpaiobkfhnonedkhhfjpmhdalgeoebfa) and Microsoft Single Sign On extension. Microsoft Editor is in maintenance mode. Root cause unknown. ICM: 532505445

**Solution**: Disable or remove the Microsoft Editor Chrome extension. Track ICM 532505445 for updates

---

## Phase 11: Salesforce
> 2 related entries

### Salesforce SSO fails with device activation requirement after Salesforce security hardening; SAML AuthnContextClassRef shows Password even when MFA...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: eSTS picks first auth type claim for AuthnContextClassRef. For Password+MFA, it emits Password. For passkeys, it emits Unspecified. Salesforce requires secure auth method indicators.

**Solution**: As of 2026-01-30, Salesforce updated to accept multipleauthn and mfa values. If user completes MFA, SAML response includes multipleauthn claim value. For OAuth apps, use V1 endpoint to get amr claim. No action needed for customers using MFA.

---

### Salesforce SSO fails with device activation requirement; SAML AuthnContextClassRef shows Password even when MFA completed
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: eSTS picks first auth type for AuthnContextClassRef. For Password+MFA it emits Password.

**Solution**: Salesforce updated 2026-01-30 to accept multipleauthn and mfa values. No action needed for MFA users.

---

## Phase 12: Gallery App
> 2 related entries

### Global Admin unable to add specific gallery applications in Enterprise Apps - Create button greyed out for Linked SSO or Password SSO only apps
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design: apps supporting only Linked/Password SSO are not identity-integrated (no SAML/OIDC/SCIM) and cannot be added via Gallery template.

**Solution**: Expected behavior. These apps cannot be added from the gallery. If SSO integration is needed, contact the ISV to integrate with Entra ID using SAML, OIDC, or SCIM.

---

### Gallery Apps Create button greyed out for Linked/Password SSO only apps
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design: apps supporting only Linked/Password SSO cannot be added via Gallery template.

**Solution**: Expected behavior. Contact ISV to integrate with SAML, OIDC, or SCIM.

---

## Phase 13: Aadsts650056
> 2 related entries

### AADSTS650056 (SAML): Misconfigured application. Issuer in SAMLRequest does not match the Identifier (Entity ID) configured on the Enterprise applic...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Issuer element in the SAMLRequest does not match the Identifier URI / App ID URI configured on the Enterprise application in Entra ID.

**Solution**: Either update the Enterprise application Identifier (Entity ID) to match the Issuer in the SAMLRequest, or update the SaaS application configuration to send the correct Issuer value.

---

### AADSTS650056: Misconfigured application in SAML authentication flow. The Issuer provided in the SAMLRequest does not match the Identifier (Entity ID).
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Issuer element in the SAMLRequest does not match the Identifier (Entity ID) / Identifier URI / App ID URI configured on the Enterprise application in Entra ID.

**Solution**: Either change the Identifier URI on the Enterprise application to match the Issuer in the SAMLRequest, or update the SaaS application configuration to send the correct Issuer value matching the configured Identifier.

---

## Phase 14: Adfs
> 1 related entries

### One specific federated user cannot access SharePoint Online. SAML token IssuerURI contains trailing newline. Other O365 apps work for same user.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: User UPN in Active Directory stored in Base64-encoded format (ldifde export shows encoded value). The encoded UPN contains trailing newline character which gets embedded in SAML token IssuerURI.

**Solution**: Revert user UPN in Active Directory from Base64-encoded format to normal plain text UPN. Verify via ldifde -f export.txt -r samaccountname=<user>.

---

## Phase 15: Sso
> 1 related entries

### Picturepark SAML-based SSO integration fails. SSO does not work after following the official Microsoft tutorial for Picturepark SAML SSO configurat...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Picturepark only supports WS-Federation protocol, not SAML. The official Microsoft documentation incorrectly provides SAML SSO configuration steps for Picturepark.

**Solution**: Change the SAML endpoint to WS-Federation endpoint in the Azure AD enterprise application configuration. Configure Picturepark to use the WS-Fed endpoint URL instead of the SAML endpoint. All other configurations from the tutorial remain valid after the endpoint change.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AADSTS50107: "The requested federation realm object does not exist" for feder... | Third-party IdP returns an incorrect IssuerURI in the SAM... | Option 1: Contact third-party IdP to fix the IssuerURI. O... | 🟢 9.5 | ADO Wiki |
| 2 | AADSTS50011 error 'The reply URL specified in the request does not match the ... | The External URL of the Application Proxy app is not conf... | Add the App Proxy External URL as a Reply URL: Entra Port... | 🟢 9.5 | ADO Wiki |
| 3 | One specific federated user cannot access SharePoint Online. SAML token Issue... | User UPN in Active Directory stored in Base64-encoded for... | Revert user UPN in Active Directory from Base64-encoded f... | 🟢 9.0 | OneNote |
| 4 | Mooncake myapps portal (myapps.windowsazure.cn) cannot launch SAML SSO applic... | Mooncake myapps portal does not support launching SAML SS... | Forge SAML sign-in URL manually: 1) Capture SAMLRequest f... | 🟢 9.0 | OneNote |
| 5 | Picturepark SAML-based SSO integration fails. SSO does not work after followi... | Picturepark only supports WS-Federation protocol, not SAM... | Change the SAML endpoint to WS-Federation endpoint in the... | 🟢 9.0 | OneNote |
| 6 | SAML SSO fails with AADSTS75011: Authentication method WindowsIntegrated does... | SaaS app SAML request has RequestedAuthnContext Compariso... | Contact SaaS app vendor to: 1) Change RequestedAuthnConte... | 🟢 9.0 | OneNote |
| 7 | AADSTS65005: Invalid resource error when accessing SaaS application via SAML ... | The Identifier (Entity ID) URL was not configured in the ... | Go to Enterprise Application SSO configuration page > Adv... | 🟢 9.0 | OneNote |
| 8 | Enterprise application SAML SSO failure with redirect loop. User sign-in redi... | Duplicate application registrations in the directory. The... | 1) Check App Registrations for duplicate apps with same n... | 🟢 9.0 | OneNote |
| 9 | SaaS application (Replicon) SAML SSO fails with Azure AD. Error shows permiss... | The Identifier URL in SAML request was missing a path seg... | Capture Fiddler trace of SAML SSO flow. Compare SAML requ... | 🟢 9.0 | OneNote |
| 10 | Optional claims customization not taking effect or being overwritten. Claims ... | Azure AD has 3 hierarchical levels for claims customizati... | Check all 3 levels: 1) App Registration > Token configura... | 🟢 9.0 | OneNote |
| 11 | Unable to save user provisioning configuration in G Suite app; error The cred... | Azure AD per-application storage limit (1KB max) for cert... | Use two separate G Suite apps (one for SSO, one for provi... | 🟢 9.0 | OneNote |
| 12 | SSO fails with SAML assertion too old error. Application rejects AuthnInstant... | Mismatch between Azure AD SSO session token lifetime and ... | Align application Max Authentication Age with Azure AD to... | 🟢 9.0 | OneNote |
| 13 | AAD SAML SSO application uses tenant-level certificate instead of application... | UseCustomTokenSigningKey attribute is missing for the app... | In Azure portal: go to application Single sign-on page → ... | 🟢 9.0 | OneNote |
| 14 | SAML SSO fails: application rejects AuthnStatement as too old. SAML response ... | Mismatch between Azure AD SSO session token lifetime (per... | Align application Max Authentication Age with Azure AD to... | 🟢 9.0 | OneNote |
| 15 | AAD SAML SSO application periodically breaks (e.g., monthly). SAML signing ce... | Application backend is missing UseCustomTokenSigningKey a... | 1) Azure Portal > Enterprise Apps > Single sign-on > Crea... | 🟢 9.0 | OneNote |
| 16 | Microsoft Single Sign On Chrome extension shows 'Access requested' and SSO do... | Chrome extension permissions not properly granted by admi... | Customer must work with their admin (or Google) to grant ... | 🟢 8.5 | ADO Wiki |
| 17 | AWS provisioning Test Connection fails with 'DiceCredentialValidationFailure:... | The AWS user account used for provisioning is required by... | Exclude the AWS service account from the AWS MFA policy s... | 🟢 8.5 | ADO Wiki |
| 18 | User clicking AWS Single-Account Access app from MyApps gets 'invalid SAML re... | Managed users were added to the Users and groups blade of... | Navigate to Users and groups blade of the AWS Single-Acco... | 🟢 8.5 | ADO Wiki |
| 19 | AWS CLI returns 'ExpiredTokenException: Token must be redeemed within 5 minut... | For the 5-minute error: user did not select their AWS rol... | Re-run MSEntraAuthAWSCLI.exe and complete role selection ... | 🟢 8.5 | ADO Wiki |
| 20 | SAML request signature verification errors: 76020 (Application configured to ... | These errors occur when SAML request signing is enabled o... | 76020: Use only /saml2 endpoint. 76021: Sign the SAML req... | 🟢 8.5 | ADO Wiki |
| 21 | SAML multi-instancing SP-initiated errors: 76031 (This endpoint does not supp... | 76031: SP-Initiated workflow is not supported when SAML r... | 76031: Either set isSignedRequestRequired to false, or us... | 🟢 8.5 | ADO Wiki |
| 22 | User clicking AWS Single-Account Access app from MyApps gets invalid SAML res... | Managed users added before AWS role provisioning was enab... | Edit user assignment in Users and groups blade, select a ... | 🟢 8.5 | ADO Wiki |
| 23 | AWS CLI returns ExpiredTokenException (token must be redeemed within 5 minute... | 5-min error: user did not select role in time. SessionDur... | Re-run MSEntraAuthAWSCLI.exe. To extend token lifetime, e... | 🟢 8.5 | ADO Wiki |
| 24 | SAML request signature verification errors: 76020 (only signed protocols), 76... | SAML request signing enabled (requestSignatureVerificatio... | 76020: Use /saml2 endpoint. 76021: Sign request or avoid ... | 🟢 8.5 | ADO Wiki |
| 25 | SAML multi-instancing SP-initiated errors: 76031 (endpoint does not support S... | 76031: SP-Initiated not supported with SAML request signi... | 76031: Set isSignedRequestRequired to false or use regula... | 🟢 8.5 | ADO Wiki |
| 26 | Cannot reliably enumerate all SAML SSO apps. Get-MgServicePrincipal filter on... | PreferredSingleSignOnMode attribute introduced in later A... | Filter on PreferredSingleSignOnMode for most apps. For nu... | 🟢 8.5 | ADO Wiki |
| 27 | Failed to add identifier URI error: 'All newly added URIs must contain a tena... | Identifier URI protection enforcement (deployed May 19, 2... | Options: (1) Use default URI format: api://{appId} or api... | 🟢 8.5 | ADO Wiki |
| 28 | SAML Token Encryption certificate upload fails when configuring token encrypt... | Wrong certificate format used for upload. The certificate... | Export/obtain the certificate as an X.509 .cer file (publ... | 🟢 8.5 | ADO Wiki |
| 29 | SAML token encryption configured but tokens are not being encrypted, or appli... | TokenEncryptionKeyID attribute in the application manifes... | Verify tokenEncryptionKeyId in the app manifest matches t... | 🟢 8.5 | ADO Wiki |
| 30 | SAML SSO fails — token is sent encrypted by Azure AD but the application cann... | Key mismatch: the public key certificate uploaded to Azur... | 1) Use Fiddler to capture the SAML response and verify th... | 🟢 8.5 | ADO Wiki |
