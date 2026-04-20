# ENTRA-ID App Registration & Consent — Detailed Troubleshooting Guide

**Entries**: 164 | **Drafts fused**: 18 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-app-consent-policies-lab.md, ado-wiki-a-azure-ad-admin-consent-workflow.md, ado-wiki-a-grant-user-consent-on-behalf-powershell.md, ado-wiki-a-microsoft-managed-consent-policy-change.md, ado-wiki-a-revoke-admin-user-consent-entra-powershell.md, ado-wiki-a-understanding-prompt-consent-oauth-request.md, ado-wiki-a-user-consent-settings-admin-consent-workflow.md, ado-wiki-a-user-consent-settings-low-risk-permissions.md, ado-wiki-a-user-low-risk-permission-consent.md, ado-wiki-azure-ad-admin-consent-workflow.md
**Generated**: 2026-04-07

---

## Phase 1: Consent
> 34 related entries

### Need to grant delegated permissions for specific AAD users only (not all via admin consent). ROPC flow cannot raise interactive consent prompts.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Admin consent grants for all users. ROPC has no interactive UI. Need programmatic per-user consent.

**Solution**: Use MS Graph oauth2permissiongrant API. Caller needs DelegatedPermissionGrant.ReadWrite.All. Create per-user consent grants via POST.

---

### After July 2025, users get AADSTS90094 (Need admin approval, admin consent workflow enabled) or AADSTS90095 (Approval required, admin consent workf...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft deployed a new secure-by-default user consent policy ('Let Microsoft manage your consent settings') as part of the Secure Future Initiative. This policy requires admin consent for high-risk file/site delegated permissions regardless of the AdminConsentRequired flag.

**Solution**: Admins can opt out by setting user consent to 'Low impact' (second option) or 'Off' (first option) in Entra admin portal. Alternatively, create a custom consent policy to fully revert changes. Existing user consents remain valid; only new consent requests are affected.

---

### Tenants that previously had user consent turned OFF are now allowing users to consent to more permissions than they should. This was observed aroun...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: A product bug during the rollout of the new updated default consent policy accidentally enabled user consent on tenants that had user consent explicitly turned off. The bug was in the policy application logic that affected tenants with disabled consent settings.

**Solution**: This was mitigated by PG over the weekend of August 16-17, 2025. If a tenant still has consent turned off but users can consent to more than expected, escalate via ICM 669687504 and add the tenant. Owning Service: AAD Applications, Owning Team: Triage.

---

### Non-admin users get AADSTS65001 or AADSTS90094 'Need Admin Approval' when consenting to app, despite tenant configured 'Allow User consent for apps...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: One or more permissions dynamically requested by the app (e.g., offline_access, email) are not classified as low risk in the tenant's consent RBAC policy (microsoft-user-default-low). Even though the explicitly configured permissions are low risk, the additional scopes in the actual token request are evaluated against the consent policy and fail

**Solution**: 1) Check sign-in logs for errorCode=AdminConsentRequired. 2) Map GraphRequestId to internalCorrelationId in DPX Kusto logs (GlobalIfxUlsEvents). 3) Identify which EntitlementId lacks microsoft-user-default-low in ApplicablePolicies. 4) Look up the EntitlementId in FirstPartyPortal to identify the permission. 5) Add the missing permission (e.g., Microsoft Graph → offline_access) to low risk classification via Entra portal → Enterprise apps → Consent and permissions → Permission classifications

---

### End users see 'Need admin approval' (AADSTS90094) when consenting to a legitimate app. Audit logs show 'Risky application detected' or 'UserConsent...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft's Risk Based Step-up Consent feature flagged the consent request as risky. The feature evaluates permission requests to non-admin users and blocks those deemed risky. This can be a false positive for legitimate apps, especially those without Publisher Verification

**Solution**: For IT admins: If convinced the app is not malicious, grant tenant-wide admin consent. Monitor risky consent requests via Log Analytics: AuditLogs | where ResultDescription contains 'Risky application detected'. For developers: Apply Publisher Verification to reduce false positives (https://docs.microsoft.com/en-us/azure/active-directory/develop/publisher-verification-overview). Post September 2023, apps without Publisher Verification are more likely to be blocked. Internal: check DPX logs for U

---

### After July 2025, users get AADSTS90094 or AADSTS90095 when consenting to apps requesting Files.Read.All, Files.ReadWrite.All, Sites.Read.All, or Si...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: New secure-by-default user consent policy (Secure Future Initiative) requires admin consent for high-risk file/site permissions regardless of AdminConsentRequired flag.

**Solution**: Opt out by setting user consent to Low impact or Off in Entra admin portal, or create a custom consent policy to revert. Existing consents remain valid.

---

### Tenants with user consent turned OFF now allow users to consent to more permissions than expected (Aug 16-18, 2025).
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Product bug during new default consent policy rollout accidentally enabled user consent on tenants with consent explicitly disabled.

**Solution**: Mitigated Aug 16-17, 2025. If still affected, escalate via ICM 669687504. Owning Service: AAD Applications, Team: Triage.

---

### Non-admin users get AADSTS65001 or AADSTS90094 Need Admin Approval when consenting to app, despite tenant configured Allow User consent for apps fr...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: One or more permissions dynamically requested by the app (e.g. offline_access, email) are not classified as low risk in the tenant consent RBAC policy (microsoft-user-default-low). Even though explicitly configured permissions are low risk, additional scopes in the actual token request fail policy evaluation

**Solution**: 1) Check sign-in logs for errorCode=AdminConsentRequired. 2) Map GraphRequestId to internalCorrelationId in DPX Kusto logs (GlobalIfxUlsEvents). 3) Identify which EntitlementId lacks microsoft-user-default-low in ApplicablePolicies. 4) Look up EntitlementId in FirstPartyPortal to identify the permission. 5) Add the missing permission to low risk classification via Entra portal > Enterprise apps > Consent and permissions > Permission classifications

---

### End users see Need admin approval (AADSTS90094) when consenting to a legitimate app. Audit logs show Risky application detected or UserConsentBlock...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft Risk Based Step-up Consent feature flagged the consent request as risky. After September 2023 backend change, apps without Publisher Verification are more likely to be blocked

**Solution**: For IT admins: If convinced app is not malicious, grant tenant-wide admin consent. Monitor via Log Analytics: AuditLogs | where ResultDescription contains Risky application detected. For developers: Apply Publisher Verification. Internal: check DPX logs for UserConsentBlockedForRiskyAppsException in GlobalIfxUlsEvents/GlobalIfxRestBusinessCommon with tagId 03jo

---

### User is prompted for consent twice during application sign-in. First consent prompt appears, user accepts, gets redirected to login, enters credent...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application sends dynamic scopes in the request. Due to current ESTS code design, during the first call to Entra ID only existing Graph delegations are evaluated and marked as stale; dynamic scopes are evaluated during the second call. This is by-design behavior.

**Solution**: This is by-design behavior. Inform the customer that dynamic scope evaluation requires two consent prompts. The application can minimize this by registering all required permissions in App Registration and pre-consenting. Reference ICM: 250523706

---

## Phase 2: App Registration
> 14 related entries

### New App Registration experience does not display warning/error when adding redirect URI that already exists under a different platform type; URI si...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: UI bug in new App Registration experience (Bug 3497427). Old experience correctly shows validation message.

**Solution**: Use the old App Registration experience which displays the expected validation error, or check existing redirect URIs across all platform types before adding.

---

### Soft deleted multi-tenant application objects not automatically hard deleted after 30 days
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design: applications with signInAudience set to AzureADMultipleOrgs/AzureADandPersonalMicrosoftAccount/PersonalMicrosoftAccount are not auto hard-deleted since Nov 2018.

**Solution**: Manually hard delete via PowerShell: Get-MgDirectoryDeletedItemAsApplication | ForEach-Object { Remove-MgDirectoryDeletedItem -DirectoryObjectId $_.Id }. Or change AvailableToOtherTenants to false in manifest.

---

### Unable to add OAuth scope longer than 40 characters in App Registration UI
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: UI bug: actual API limit is 120 characters but portal enforces 40 (ADO 2904326)

**Solution**: Use Graph API to create scope, or create via UI with <=40 chars then edit in Manifest view to desired length.

---

### New App Registration experience does not show warning when adding redirect URI that exists under different platform type
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: UI bug in new App Registration experience (Bug 3497427)

**Solution**: Use old App Registration experience or check existing redirect URIs across all platform types before adding.

---

### Soft deleted multi-tenant apps not automatically hard deleted after 30 days
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design since Nov 2018 for multi-tenant signInAudience apps.

**Solution**: Manually hard delete via PowerShell or change AvailableToOtherTenants to false.

---

### New app creation fails with AppId URI (identifierUri) validation error - URI not part of tenant verified domain list
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Change introduced October 2021 enforces all AppId URIs must use a verified tenant domain or api:// scheme. Does not affect existing apps; only new apps or existing apps adding a new URI.

**Solution**: Use api://{appId} or api://{tenantId}/{string} scheme, or set URI to https://<tenantInitialDomain>.onmicrosoft.com/<string>. Validate whether app actually needs an AppId URI. Remove wildcard URIs (e.g. https://*.mydomain.com). Add domain to verified domain list if needed.

---

### Soft-deleted app registration does not immediately appear in the 'Deleted apps' tab in App Registrations portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known caching issue - recently deleted app may not show up immediately in the Deleted applications list.

**Solution**: Refresh the page. The deleted app should appear after a page refresh.

---

### Restoring or permanently deleting a soft-deleted app registration fails
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Either (1) user does not have required permissions, or (2) app was deleted more than 30 days ago (restore only). Restore requires Owner or Global Admin. Permanent delete requires Owner, Global Admin, App Admin, Cloud App Admin, or Hybrid Identity Admin.

**Solution**: Verify user has correct role. For restore: must be Owner or Global Admin AND deletion must be within 30 days. For permanent delete: Owner, Global Admin, App Admin, Cloud App Admin, or Hybrid Identity Admin.

---

### Error when creating a new app registration or updating identifier URIs (AppId URI / identifierUri). New app cannot be created with the desired URI....
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: October 2021 change: all AppId URIs for new app registrations or URI updates must use domains in the tenant's verified domain list. Wildcard URIs (e.g. https://*.mydomain.com) are also blocked as a security risk.

**Solution**: Use valid URI patterns: api://{appId}, api://{tenantId}/{appId}, api://{tenantId}/{string}, api://{string}/{appId}; or https://{tenantInitialDomain}.onmicrosoft.com/{string}, https://{verifiedCustomDomain}/{string}, https://{string}.{verifiedCustomDomain}, https://{string}.{verifiedCustomDomain}/{string}. Add the domain to the verified domain list if needed. The tenant's initial .onmicrosoft.com domain is always valid. Reference: https://aka.ms/AAe22df

---

### New app registrations created programmatically via MS Graph API (POST /v1.0/applications) no longer allow personal Microsoft accounts (hotmail.com,...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: March 2024 change: signInAudience for new apps created via MS Graph (POST https://graph.microsoft.com/v1.0/applications) now defaults to 'AzureADMyOrg' (single-tenant), previously defaulted to 'AzureADandPersonalMicrosoftAccount'. This aligns with the Entra portal default. Existing apps are not affected.

**Solution**: Explicitly set the signInAudience parameter in the POST /v1.0/applications request body to the desired value (e.g. 'AzureADMultipleOrgs' or 'AzureADandPersonalMicrosoftAccount') if multi-tenant or personal account support is needed. Announcement: https://techcommunity.microsoft.com/t5/microsoft-entra-blog/what-s-new-in-microsoft-entra/ba-p/3796394

---

## Phase 3: Aadsts90094
> 9 related entries

### AADSTS90094 or AADSTS90095 error during sign-in. Application request to Entra ID includes 'prompt=consent' parameter, causing consent prompt even w...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The application sends 'prompt=consent' in the authorization request to Entra ID, which forces a consent prompt regardless of existing consent grants.

**Solution**: Ask the app vendor/owner to remove 'prompt=consent' from the authorization request sent to Entra ID. Reference: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-implicit-grant-flow

---

### AADSTS90094 or AADSTS90095 error. Microsoft detects risky permissions request. Audit Logs show 'Consent to application - Risky application detected'.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft's risk detection system has flagged the application's permissions request as risky, blocking user consent.

**Solution**: Review the risk detection in Audit Logs (ApplicationManagement > Consent to application). If the app is valid, admin should approve it. Reference: https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/application-sign-in-unexpected-user-consent-error#requesting-not-authorized-permissions-error

---

### AADSTS90094 or AADSTS90095 error. Enterprise app has 'User assignment required' set to Yes, and admin consent has not been granted.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When 'User assignment required' is enabled, Entra ID disallows all user consent because consenting would cause user self-assignment, defeating the purpose of assignment requirement.

**Solution**: Either: (1) Disable 'User assignment required' on the Enterprise App, let user consent, then re-enable it. Or (2) Admin grants consent via /authorize endpoint with dynamic consent and checks 'Consent on behalf of your organization'. Reference: https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/what-is-access-management#requiring-user-assignment-for-an-app

---

### AADSTS90094 or AADSTS90095 error. Permissions in the 'scope' parameter of the auth request are not admin consented. Clicking 'Grant admin consent' ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The 'Grant admin consent' button uses /adminconsent endpoint which only grants permissions registered in App Registration. If permissions are requested dynamically via scope parameter but not registered in App Registration, clicking the button won't grant them. Certain permissions (Files.Read.All, Files.ReadWrite.All, Sites.Read.All, Sites.ReadWrite.All) always require admin consent even if AdminConsentRequired is false.

**Solution**: Use the /authorize endpoint with dynamic consent: Global admin navigates to the same URL the user got the error on (or constructs it with the correct scope), checks 'Consent on behalf of your organization', and clicks Accept. URL format: https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id={AppID}&response_type=code&redirect_uri={RedirectURI}&response_mode=fragment&scope={permissions}&state=12345&nonce=12345&prompt=consent

---

### AADSTS90094 or AADSTS90095 error during sign-in. Application request includes prompt=consent parameter, causing consent prompt even when admin cons...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application sends prompt=consent in authorization request, forcing consent prompt regardless of existing grants.

**Solution**: Ask app vendor/owner to remove prompt=consent from authorization request.

---

### AADSTS90094/90095 error. Microsoft detects risky permissions. Audit Logs show Risky application detected.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Risk detection flagged application permissions as risky, blocking user consent.

**Solution**: Review risk detection in Audit Logs. If app valid, admin should approve.

---

### AADSTS90094/90095 error. Enterprise app has User assignment required=Yes, admin consent not granted.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User assignment required disallows all user consent because consenting causes self-assignment.

**Solution**: (1) Disable User assignment required, let user consent, re-enable. Or (2) Admin grants consent via /authorize with Consent on behalf of your organization checked.

---

### AADSTS90094/90095 error. Permissions in scope not admin consented. Grant admin consent button does not resolve.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Grant admin consent uses /adminconsent endpoint which only grants permissions in App Registration. Dynamic scope permissions not covered. Files.Read.All, Sites.Read.All always require admin consent.

**Solution**: Use /authorize endpoint with dynamic consent: Global admin navigates to URL with all scopes, checks Consent on behalf of org, clicks Accept.

---

### AADSTS90094/AADSTS90095: Admin consent required. 90094 when admin consent workflow disabled, 90095 when enabled. Non-admin user cannot consent.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Four causes: 1) Request includes prompt=consent. 2) Risky permissions detected. 3) User assignment required without admin consent. 4) Permissions in scope not admin consented (Files.Read.All, Sites.Read.All require admin consent even if AdminConsentRequired=false).

**Solution**: Cause 1: Remove prompt=consent. Cause 2: Review risk in audit logs. Cause 3: Disable user assignment or grant admin consent. Cause 4: As Global Admin, use /authorize endpoint with prompt=consent, check Consent on behalf of org. Do NOT use /adminconsent (only pre-registered permissions).

---

## Phase 4: Aadsts
> 6 related entries

### AADSTS50001: The application named X was not found in the tenant named contoso.onmicrosoft.com. Application has not been installed by admin or cons...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The application (identified by client_id) does not exist as a service principal in the target tenant. Causes: wrong Application ID, wrong tenant in auth request, or app is single-tenant but accessed from a different tenant.

**Solution**: 1) Verify client_id (Application ID) is correct. 2) Verify the tenant in the auth URL is correct (if common, uses user home tenant). 3) If app is from another tenant, configure as multi-tenant. 4) Have admin navigate to consent URL: https://login.microsoftonline.com/{tenant}/adminconsent?client_id={application-id}. Note: Application ID != Object ID.

---

### AADSTS500011: The resource principal named resource-id was not found in the tenant. The requested resource (service principal) does not exist in th...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The service principal for the requested resource does not exist in the target tenant. The resource identifier (via resource or scope parameter) cannot be resolved to a service principal.

**Solution**: 1) Look up app in Enterprise Apps (Application Type=All). 2) Go to Permissions, click Grant admin consent. 3) If still failing, use consent URL: https://login.microsoftonline.com/{tenant}/adminconsent&client_id={resource-id}. 4) If SP does not exist, create via PowerShell: New-MgServicePrincipal -AppId. First-party apps: owning team provides correct identifiers.

---

### AADSTS700016: Application with identifier was not found in the directory. Auth request sent to wrong tenant or app not registered/consented.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: App does not exist in the directory (wrong AppId), or app is single-tenant but accessed from another tenant, or national cloud app accessed from global tenant.

**Solution**: Verify the AppId (not ObjectId). If cross-tenant, convert app to multi-tenant via Azure portal. If single-tenant with guest user, use tenant-specific authority endpoint. For national clouds, register app in the correct cloud.

---

### AADSTS700054: response_type id_token is not enabled for the application. Sign-in request with response_type=id_token fails.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The app registration has not enabled the ID token implicit grant flow. enableIdTokenIssuance is set to false in the application manifest.

**Solution**: In App Registration > Manifest, set web.implicitGrantSettings.enableIdTokenIssuance to true. Or remove id_token from the response_type parameter. Allow up to 30 minutes for changes to reflect.

---

### AADSTS90094: AdminConsentRequired - app needs admin-level permissions. Non-admin user or risky permission detection.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: App requests admin-only permissions; or Microsoft detected risky request; or user assignment required without admin consent; or AllowedToReadOtherUsers=False.

**Solution**: Admin grant consent via Entra portal. For AllowedToReadOtherUsers: Update-MgPolicyAuthorizationPolicy -AllowedToReadOtherUsers $true. Configure user consent policy.

---

### AADSTS900971: No reply address provided. Redirect URI missing or misconfigured during authentication.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Reply URL missing/misconfigured in app registration, not in auth request, formatting errors, or mismatch with multiple URLs.

**Solution**: Verify reply URL in App registrations > Authentication. Ensure redirect_uri matches registered URL exactly. Check formatting/typos.

---

## Phase 5: Aadsts65001
> 5 related entries

### AADSTS65001: User or administrator has not consented to use the application. Web app fails to get access token silently after deployment.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Admin consent was not granted for the app. Silent token acquisition (no user interaction) cannot prompt interactive consent. Consent status can be verified via MSODS Explorer delegation entries.

**Solution**: Grant admin consent via Azure Portal Grant Permissions button. Verify consent with MSODS Explorer delegation entries (Source=app SP, Target=resource SP). Use eSTS Logs Viewer/LogsMiner to confirm DelegationDoesNotExist error stopped. Track who granted consent via Jarvis MSODS activity logs using Service Principal Object ID.

---

### AADSTS65001: The user or administrator has not consented to use the application. Or AADSTS90008: user/admin has not consented, application is misco...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application is missing the minimum required Microsoft Graph 'User.Read' or 'openid' delegated permission, or the permission has not been consented to.

**Solution**: 1. Add Microsoft Graph 'User.Read' delegated permission to the App Registration's API Permissions. 2. Perform admin consent: have Global Admin or Application Admin access the app, review permissions, check 'Consent on behalf of your organization', and click Accept. 3. If scope in auth request has permissions not listed on Enterprise App permissions page, admin must consent to those missing permissions via /authorize endpoint with dynamic consent.

---

### AADSTS65001: user/admin has not consented. Or AADSTS90008: app misconfigured, must require Sign in and read user profile.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application missing Microsoft Graph User.Read or openid delegated permission, or permission not consented.

**Solution**: 1. Add User.Read delegated permission. 2. Admin consent with Consent on behalf of org. 3. For missing scope permissions, use /authorize with dynamic consent.

---

### AADSTS65001: The user or administrator has not consented to use the application. User sees Need admin approval during sign-in.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Required permissions not consented. Causes: User.Read missing, user consent disabled, user assignment required, SP missing for client/resource app, or scopes in request not consented.

**Solution**: 1) Add/consent User.Read. 2) Check tenant user consent settings. 3) Verify SP exists for client and resource apps. 4) Verify all scopes consented. 5) Admin consent via V2 endpoint with prompt=consent.

---

### AADSTS65001: The user or administrator has not consented to use the application with ID. User sees consent error when accessing third-party or regi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Admin consent has not been granted for the application. The app API permissions require admin consent but it has not been performed.

**Solution**: For registered apps: Azure AD > App registrations > select app > API Permissions > Grant consent. For third-party apps: use admin consent URL v1 or v2 format with tenant-id, app-id, and redirect-uri.

---

## Phase 6: Aadsts650056
> 4 related entries

### AADSTS650056: Misconfigured application. Client has not listed any permissions for AAD Graph, or admin has not consented in tenant.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: App registration missing required permissions configuration, or permissions don't match what app requests at sign-in.

**Solution**: Review app registration API permissions. Ensure all required permissions listed. Grant admin consent via Enterprise Applications > Permissions. Verify application identifier matches.

---

### AADSTS650056 (OAuth): Misconfigured application. Client has not listed any permissions for the resource in app registration, or admin has not conse...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The client app registration lacks API permissions for the requested resource, or admin consent has not been granted for the configured permissions.

**Solution**: Add required API permissions (at minimum Microsoft Graph User.Read delegated) to the app registration for both client and resource apps. Then have admin grant consent.

---

### AADSTS650056: Misconfigured application in OAuth flow. Client has not listed any permissions for the resource in the requested permissions.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The app registration for the client did not add API permissions for the requested resource, or admin has not consented to the permissions in the tenant.

**Solution**: Add the required API permissions to the app registration (at minimum Microsoft Graph User.Read delegated permission for both client and resource). Have a tenant admin consent to the application.

---

### AADSTS650056: Misconfigured application - sign-in fails with error about missing permissions, invalid Issuer in SAML request, or missing admin consent
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: App registration Issuer mismatch with SAML EntityID, or application missing required Microsoft Graph permissions (e.g. User.Read), or admin has not granted consent

**Solution**: For SAML: ensure Issuer in SAMLRequest matches Identifier (Entity ID). For permissions: add User.Read delegated permission. For consent: admin grants consent via portal or build consent URL with prompt=consent

---

## Phase 7: Msal Android
> 4 related entries

### MSAL Android authentication fails with redirect URI mismatch error. The signature hash in the redirect URI does not match the app signing certifica...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Android app signature hash used in the redirect URI (msauth://<package>/<hash>) does not match the actual signing certificate. The hash may change after publishing to Google Play Store due to Google Play App Signing.

**Solution**: Regenerate signature hash using keytool: keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64. For Play Store apps, get hash from Play Console > Setup > App Integrity > App signing. Update both the Entra ID app registration redirect URI and the MSAL config file. Ensure the hash is URL-encoded in the redirect URI but NOT in AndroidManifest.xml.

---

### MSAL Android app not redirected back to the application after completing authentication or MFA. User completes sign-in in browser/broker but app do...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The BrowserTabActivity intent filter in AndroidManifest.xml is misconfigured. Common issues: missing leading "/" in android:path for the signature hash, incorrect package name in android:host, or redirect_uri in MSAL config not matching the manifest.

**Solution**: Verify AndroidManifest.xml has correct BrowserTabActivity with intent-filter: android:scheme="msauth", android:host="<package_name>", android:path="/<base64_signature_hash>" (note leading /). Ensure redirect_uri in MSAL config matches.

---

### MSAL Android error: "More than one app is listening for the URL scheme defined for BrowserTabActivity in the AndroidManifest.xml". Multiple apps ha...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multiple apps on the device have registered the same msauth:// redirect URI scheme in their AndroidManifest.xml.

**Solution**: Use a unique redirect URL scheme (e.g., com.yourapp.msauth://). Alternatively, set authorization_user_agent to WEBVIEW in MSAL config. Detect conflicting apps using PackageManager.queryIntentActivities().

---

### MSAL Android Manifest merger error: "uses-sdk:minSdkVersion 19 cannot be smaller than version 21 declared in library". Build fails.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MSAL Android library requires minimum SDK version 21 (Android 5.0 Lollipop).

**Solution**: Update AndroidManifest.xml: set uses-sdk android:minSdkVersion to 21 or higher.

---

## Phase 8: B2C
> 4 related entries

### AADB2C90006: The redirect URI provided in the request is not registered for the client ID. Occurs during B2C sign-in.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The redirect URI in the sign-in request does not match any registered redirect URI on the B2C application registration

**Solution**: Add the exact redirect URI to the application registration in Azure AD B2C portal (Web App / SPA / Native). B2C tenants have long propagation times - wait up to 2 hours after adding.

---

### AADB2C90057: The provided application is not configured to allow the OAuth Implicit flow. B2C sign-in with response_type=id_token or token fails.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The B2C application registration does not have Implicit grant flow enabled. B2C requires BOTH ID tokens and Access tokens to be enabled for implicit flow, even if only one is needed.

**Solution**: In Entra Admin Center > App registrations > Authentication > Implicit grant and hybrid flows: enable both "ID tokens" and "Access tokens" checkboxes. Alternatively, set enableIdTokenIssuance and enableAccessTokenIssuance to true in app manifest.

---

### AADB2C90068: An application of version V1 was found when searching for version V2, or the provided application is not valid against this service.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The B2C application was not registered following the correct B2C app registration steps. The Supported account types is not set to "Accounts in any identity provider or organizational directory (for authenticating users with user flows)".

**Solution**: Re-register the application following https://learn.microsoft.com/azure/active-directory-b2c/tutorial-register-applications. Ensure Supported account types is set to "Accounts in any identity provider or organizational directory". Verify in app registration > Authentication settings.

---

### B2C portal error: cannot find b2c-extensions-app. Application missing from App registrations.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: b2c-extensions-app soft/hard-deleted, or exists with wrong Redirect URI (should be https://extensions.cpim.windows.net).

**Solution**: 1) Check App registrations for b2c-extensions-app. 2) Fix Redirect URI to https://extensions.cpim.windows.net. 3) If deleted, restore from Deleted apps (30-day window). 4) If hard-deleted, submit IcM.

---

## Phase 9: Aadsts650059
> 3 related entries

### AADSTS650059: The application (appId:{appId}) is not configured for use in tenant (tenantId:{tenantId}). The value AzureADMyOrg set for application...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application was previously configured as multi-tenant (AzureADMultipleOrgs) but was later changed to single-tenant (AzureADMyOrg). Service principals created in external tenants during multi-tenant period can no longer authenticate. ESTS enforcement blocks single-tenant apps from being used outside home tenant (enforced after July 14, 2025).

**Solution**: If the app needs to work cross-tenant: change signInAudience on the app registration in the home tenant to 'AzureADMultipleOrgs' or 'AzureADandPersonalMicrosoftAccount'. If the customer doesn't own the app, contact the app owner to update signInAudience. If single-tenant is intended, no action needed - external SPs will error. Reference: https://learn.microsoft.com/en-us/entra/identity-platform/howto-convert-app-to-be-multi-tenant

---

### AADSTS650059: Application not configured for use in tenant. SignInAudience AzureADMyOrg limiting its use.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: App changed from multi-tenant to single-tenant. External SPs cannot authenticate. ESTS enforcement after July 14, 2025.

**Solution**: Change signInAudience to AzureADMultipleOrgs in home tenant app registration. If customer does not own app, contact app owner.

---

### AADSTS650059: The application is not configured for use in tenant. SignInAudience AzureADMyOrg limits use outside home tenant. App was converted fr...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: App registration signInAudience was changed from multi-tenant to single-tenant (AzureADMyOrg), but SPs in external tenants still try to obtain tokens. ESTS now blocks single-tenant apps from being used outside home tenant.

**Solution**: If app should support multiple tenants: update signInAudience to AzureADMultipleOrgs or AzureADandPersonalMicrosoftAccount. If single-tenant is intended: no action needed. Whitelisted apps deadline: July 14, 2025.

---

## Phase 10: Aadsts650051
> 3 related entries

### AADSTS650051: The application needs access to a service the organization has not subscribed to. Resource API service principal missing in user tena...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multi-tenant app references a resource API registered in another tenant. The resource API service principal has not been consented or created in the user tenant.

**Solution**: Admin of user tenant must consent to resource API: 1) Admin Consent URL with resource API App ID, or 2) PowerShell: New-MgServicePrincipal -AppId {Resource-API-AppId}. Then create app role assignment if needed via New-MgServicePrincipalAppRoleAssignment.

---

### AADSTS650051: The application needs access to a service that your organization has not subscribed to. Occurs when signing into a multi-tenant app a...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The resource API registered in tenant A has not been consented or provisioned in tenant B where the user is signing in. The service principal for the resource API is missing in the target tenant.

**Solution**: Create the service principal for the resource API in the target tenant using: (1) Admin Consent URL: https://login.microsoftonline.com/common/oauth2/authorize?prompt=admin_consent&response_type=code&client_id={Resource-API-AppId}, or (2) PowerShell: New-MgServicePrincipal -AppId {Resource-API-AppId}. Then create app role assignments with New-MgServicePrincipalAppRoleAssignment.

---

### AADSTS650051: Application is requesting permissions that are either invalid or out of date. Misleading error during consent grant, actual cause is ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User or service principal exceeded the limit of 1500 role assignments (Azure AD service limit). MSODS returns EntitlementValidationException but the error message is masked as AADSTS650051.

**Solution**: Query MSODS tables in Kusto using the Correlation ID + Timestamp from the Audit Log to find the actual EntitlementValidationException. Reduce role assignments below 1500 limit per Azure AD Service Limits and Restrictions.

---

## Phase 11: Myapps
> 2 related entries

### AAD enterprise application does not appear in My Apps Portal after assigning users. App registration uses wildcard reply URLs (e.g., http://localho...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: By design. Wildcard reply URLs have limited support in Azure AD v1 and are not supported in v2. Apps with only wildcard reply URLs will not show in My Apps Portal. The new App Registration blade treats wildcards as illegal.

**Solution**: Remove wildcard reply URLs and replace with exact redirect URIs. Wildcards increase security surface area (XSS, referrer header leaks). In the new App Registration blade, wildcards cannot be saved.

---

### New app registrations created after March 1, 2021 do not appear in My Apps portal for end users, even though the app is properly configured
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Starting March 1, 2021, new App Registrations are hidden by default in My Apps. The 'Visible to users' property on the enterprise application is set to No by default.

**Solution**: Navigate to Microsoft Entra admin center > Enterprise applications, find the application, go to Properties, and set 'Visible to users?' to Yes.

---

## Phase 12: Aadsts65004
> 2 related entries

### AADSTS65004 error 'User declined to consent to access the app' appears during admin consent request flow
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Expected behavior - user clicked 'Back to app' button on the admin consent request page instead of clicking 'Request approval'. Entra ID generates AADSTS65004 and sends it to the redirect URI.

**Solution**: No action needed - this is by design. Inform the user that clicking 'Back to app' cancels the consent request. User should click 'Request approval' to submit the admin consent request.

---

### AADSTS65004: User Declined to consent to access the app. Error appears after user clicks Back to app button in the Admin Consent Workflow.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Expected behavior by design. When user clicks Back to app during admin consent workflow, Entra ID sends AADSTS65004 to the redirect URI because user is not authorized to perform user consent.

**Solution**: This error is expected. Set expectations with customer: after user submits admin consent request and administrator approves it, user must start a NEW authentication flow for the application. The Back to app button does NOT complete the original auth flow.

---

## Phase 13: Aadsts700016
> 2 related entries

### AADSTS700016: Application with identifier '31359c7f-bd7e-475c-86db-fdb8c937548e' (PnP Management Shell) was not found in the directory. Customer ge...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: As of 9/9/2024, PnP Management Shell multitenant app was disabled. The application is no longer available as a shared multitenant registration, so customers must register the application in their own tenant.

**Solution**: Follow instructions at https://pnp.github.io/blog/post/changes-pnp-management-shell-registration/ to register PnP Management Shell in own tenant, or use own Entra ID identity per https://pnp.github.io/cli-microsoft365/user-guide/using-own-identity/. Route case to SharePoint Online: SharePoint/SharePoint Online/Identity and Authentication/App Authentication. Identity can help with app registration questions via collab.

---

### AADSTS700016: Application with identifier 'd1ddf0e4-d672-4dae-b554-9d5bdfd93547' was not found in the directory when running Intune PowerShell exam...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Intune PowerShell example scripts reference a deprecated app ID. Customers need to register their own Microsoft Entra ID app registration and update scripts accordingly.

**Solution**: Register a new App Registration in Entra ID with required Intune API permissions, then update PowerShell scripts with the new App ID. Refer to https://learn.microsoft.com/en-us/mem/intune/fundamentals/in-development. Route updating scripts to Intune team; AADSTS errors and app registration help can be provided by Entra Identity via collab.

---

## Phase 14: Isdisabled
> 2 related entries

### Application cannot access resources or obtain new tokens. Enterprise app shows disabled/deactivated.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: isDisabled=true set on App Registration. Different from accountEnabled and disabledByMicrosoftStatus.

**Solution**: PATCH .../beta/.../applications/{appObjectId} with {isDisabled:false}. Verify via GET. Changes take up to 60 minutes.

---

### Application deactivated (isDisabled=true): cannot access protected resources or obtain new tokens. Changes may take up to 60 minutes.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: App registration isDisabled set to true via Entra portal, Graph API, or App lifecycle manager. Three disable mechanisms: accountEnabled (SP), disabledByMicrosoftStatus (Microsoft), isDisabled (owner).

**Solution**: Re-enable: PATCH /beta/myorganization/applications/{appObjectId} with {isDisabled:false}. Or use Entra portal. Requires Application.ReadWrite.All. For lifecycle manager issues: verify owner consent, check medenia trace logs.

---

## Phase 15: Manifest
> 2 related entries

### Error "No other properties may be modified when certification properties are being modified" when saving application manifest in Azure Portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application has certification property set. Portal sends PATCH to update all properties including read-only certification property.

**Solution**: Use Microsoft Graph API to update only the specific property needed instead of the manifest editor.

---

### Error No other properties may be modified when certification properties are being modified when saving application manifest
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application has certification property set. Portal sends PATCH to update all properties including read-only certification property.

**Solution**: Use Microsoft Graph API to update only the specific property needed instead of the manifest editor.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AADSTS50126: "Invalid username or password" during non-interactive sign-in us... | Federated user accounts are not supported for ROPC grant ... | Use a managed (non-federated) account for ROPC, or switch... | 🟢 9.5 | ADO Wiki |
| 2 | Need to grant delegated permissions for specific AAD users only (not all via ... | Admin consent grants for all users. ROPC has no interacti... | Use MS Graph oauth2permissiongrant API. Caller needs Dele... | 🟢 9.0 | OneNote |
| 3 | AADSTS7000218: request body must contain client_assertion or client_secret wh... | App registration platform set to Web instead of Mobile an... | Change app platform to Mobile and desktop applications, e... | 🟢 9.0 | OneNote |
| 4 | AADSTS50011: Redirect URI mismatch when using Connect-MgGraph with custom app | Redirect URI not configured for Mobile platform | Add redirect URIs: https://login.microsoftonline.com/comm... | 🟢 9.0 | OneNote |
| 5 | AAD enterprise application does not appear in My Apps Portal after assigning ... | By design. Wildcard reply URLs have limited support in Az... | Remove wildcard reply URLs and replace with exact redirec... | 🟢 9.0 | OneNote |
| 6 | Customer wants to use dynamic parameters in redirect URI (e.g., https://xxx.c... | Azure AD redirect URI wildcard matching has limitations: ... | Use supported wildcard formats only: https://*.mstest.com... | 🟢 9.0 | OneNote |
| 7 | Enterprise application SSO blade is not available/not visible in Azure portal... | By design. When an application is created through App Reg... | Configure SSO through the Enterprise Applications blade d... | 🟢 9.0 | OneNote |
| 8 | AADSTS65001: User or administrator has not consented to use the application. ... | Admin consent was not granted for the app. Silent token a... | Grant admin consent via Azure Portal Grant Permissions bu... | 🟢 9.0 | OneNote |
| 9 | AADSTS90033: A transient error has occurred when performing admin consent to ... | Application has too many API permissions configured (25+)... | Reduce the number of API permissions per consent request ... | 🟢 9.0 | OneNote |
| 10 | Need to export expiration dates of all Service Principal and App Registration... | No built-in portal feature to bulk-view all SP/App creden... | Use official PowerShell script from Azure China docs: htt... | 🟢 9.0 | OneNote |
| 11 | SSO not working when connecting to new AVD session host - fresh AAD auth + co... | By design: each new session host requires fresh auth and ... | Configure target device groups per MS docs: configure-sin... | 🟢 8.5 | ADO Wiki |
| 12 | AADSTS90097 error 'An error has occurred during admin consent processing. Rev... | No reviewer is configured in the admin consent workflow s... | Configure at least one reviewer with Global Administrator... | 🟢 8.5 | ADO Wiki |
| 13 | AADSTS65004 error 'User declined to consent to access the app' appears during... | Expected behavior - user clicked 'Back to app' button on ... | No action needed - this is by design. Inform the user tha... | 🟢 8.5 | ADO Wiki |
| 14 | After July 2025, users get AADSTS90094 (Need admin approval, admin consent wo... | Microsoft deployed a new secure-by-default user consent p... | Admins can opt out by setting user consent to 'Low impact... | 🟢 8.5 | ADO Wiki |
| 15 | Tenants that previously had user consent turned OFF are now allowing users to... | A product bug during the rollout of the new updated defau... | This was mitigated by PG over the weekend of August 16-17... | 🟢 8.5 | ADO Wiki |
| 16 | Restoring a soft-deleted service principal fails with error: Cannot restore S... | The service principal's backing app registration is also ... | 1) Restore the soft-deleted app registration first: POST ... | 🟢 8.5 | ADO Wiki |
| 17 | Non-admin users get AADSTS65001 or AADSTS90094 'Need Admin Approval' when con... | One or more permissions dynamically requested by the app ... | 1) Check sign-in logs for errorCode=AdminConsentRequired.... | 🟢 8.5 | ADO Wiki |
| 18 | End users see 'Need admin approval' (AADSTS90094) when consenting to a legiti... | Microsoft's Risk Based Step-up Consent feature flagged th... | For IT admins: If convinced the app is not malicious, gra... | 🟢 8.5 | ADO Wiki |
| 19 | After July 2025, users get AADSTS90094 or AADSTS90095 when consenting to apps... | New secure-by-default user consent policy (Secure Future ... | Opt out by setting user consent to Low impact or Off in E... | 🟢 8.5 | ADO Wiki |
| 20 | Tenants with user consent turned OFF now allow users to consent to more permi... | Product bug during new default consent policy rollout acc... | Mitigated Aug 16-17, 2025. If still affected, escalate vi... | 🟢 8.5 | ADO Wiki |
| 21 | Non-admin users get AADSTS65001 or AADSTS90094 Need Admin Approval when conse... | One or more permissions dynamically requested by the app ... | 1) Check sign-in logs for errorCode=AdminConsentRequired.... | 🟢 8.5 | ADO Wiki |
| 22 | End users see Need admin approval (AADSTS90094) when consenting to a legitima... | Microsoft Risk Based Step-up Consent feature flagged the ... | For IT admins: If convinced app is not malicious, grant t... | 🟢 8.5 | ADO Wiki |
| 23 | AADSTS90094 or AADSTS90095 error during sign-in. Application request to Entra... | The application sends 'prompt=consent' in the authorizati... | Ask the app vendor/owner to remove 'prompt=consent' from ... | 🟢 8.5 | ADO Wiki |
| 24 | AADSTS90094 or AADSTS90095 error. Microsoft detects risky permissions request... | Microsoft's risk detection system has flagged the applica... | Review the risk detection in Audit Logs (ApplicationManag... | 🟢 8.5 | ADO Wiki |
| 25 | AADSTS90094 or AADSTS90095 error. Enterprise app has 'User assignment require... | When 'User assignment required' is enabled, Entra ID disa... | Either: (1) Disable 'User assignment required' on the Ent... | 🟢 8.5 | ADO Wiki |
| 26 | AADSTS90094 or AADSTS90095 error. Permissions in the 'scope' parameter of the... | The 'Grant admin consent' button uses /adminconsent endpo... | Use the /authorize endpoint with dynamic consent: Global ... | 🟢 8.5 | ADO Wiki |
| 27 | User is prompted for consent twice during application sign-in. First consent ... | Application sends dynamic scopes in the request. Due to c... | This is by-design behavior. Inform the customer that dyna... | 🟢 8.5 | ADO Wiki |
| 28 | AADSTS65001: The user or administrator has not consented to use the applicati... | Application is missing the minimum required Microsoft Gra... | 1. Add Microsoft Graph 'User.Read' delegated permission t... | 🟢 8.5 | ADO Wiki |
| 29 | AADSTS650059: The application (appId:{appId}) is not configured for use in te... | Application was previously configured as multi-tenant (Az... | If the app needs to work cross-tenant: change signInAudie... | 🟢 8.5 | ADO Wiki |
| 30 | SignInAudience value 'AzureADMultipleOrgs' not allowed as per assigned policy... | Tenant admin has configured app management policy (defaul... | Contact tenant admin to either: (1) Update the policy to ... | 🟢 8.5 | ADO Wiki |


---

## Incremental Update (2026-04-18) - +3 entries from contentidea-kb

### This KB article describes a problem with the Azure portal under Azure Active Directory -> App Registrations blade may not show the correct certificate...
**Score**: 🟡 6.5 | **Source**: ContentIdea KB | **ID**: entra-id-3641

**Description**: This KB article describes a problem with the Azure portal under Azure Active Directory -> App Registrations blade may not show the correct certificate thumbprint for certain application using the Powershell command New-AzureRmADAppCredential to create a certificate key:

> This entry contains description only, no explicit root cause/solution.


### Users/Customers claim that they cannot see their Line-Of-Business applications on Azure AD's Conditional Access Application picker, when creating new ...
**Score**: 🟢 8.0 | **Source**: ContentIdea KB | **ID**: entra-id-3654

**Root Cause**: This can happen when the user has created the application as a native app, or does not have a Web App platform configured under its Platform Configurations in Authentication sections of the application's app registration portal.Conditional Access does not apply to native apps , because it wouldn't p...

**Solution**: The resolution on this is to apply Conditional Access to the available APIs that the application is invoking/accessing, or to the service that the API falls under.


### Taking Examples : App name : <Application Name> with App ID : 2fddb45a-3701-403d-8063-69c4f8531838Attribute value ( Role ) : Service-based_Development...
**Score**: 🟢 8.0 | **Source**: ContentIdea KB | **ID**: entra-id-3662

**Root Cause**: Usually when this happens, the cause is that the role that currently exists in the application with that name is not the same role that previously had it. Each role has a unique identifier -  &quot;id&quot; in this case. During the initial times of the application�s creation and usage, AAD would hav...

**Solution**: 1) First, take a look in ASC using the AppId in the right tenant, to see if this role ( you can search with the id  ) is present as part of the serviceprincipal's roles, or the application's roles definition. ASC > Azure AD Explorer > Applications > AppId > Service Principal / ApplicationObject2) Ma...

