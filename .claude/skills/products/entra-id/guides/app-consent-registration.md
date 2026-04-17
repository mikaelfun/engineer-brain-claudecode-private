# ENTRA-ID App Registration & Consent — Quick Reference

**Entries**: 161 | **21V**: Partial (157/161)
**Last updated**: 2026-04-07
**Keywords**: consent, app-registration, admin-consent, aadsts90094, aadsts90095, multi-tenant

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/app-consent-registration.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | AADSTS50126: "Invalid username or password" during non-interactive sign-in using Resource Owner P... | Federated user accounts are not supported for ROPC grant by default. Also may... | Use a managed (non-federated) account for ROPC, or switch to a supported auth... | 🟢 9.5 | ADO Wiki |
| 2 📋 | Need to grant delegated permissions for specific AAD users only (not all via admin consent). ROPC... | Admin consent grants for all users. ROPC has no interactive UI. Need programm... | Use MS Graph oauth2permissiongrant API. Caller needs DelegatedPermissionGrant... | 🟢 9.0 | OneNote |
| 3 📋 | AADSTS7000218: request body must contain client_assertion or client_secret when connecting MgGrap... | App registration platform set to Web instead of Mobile and desktop applications | Change app platform to Mobile and desktop applications, enable Allow public c... | 🟢 9.0 | OneNote |
| 4 📋 | AADSTS50011: Redirect URI mismatch when using Connect-MgGraph with custom app | Redirect URI not configured for Mobile platform | Add redirect URIs: https://login.microsoftonline.com/common/oauth2/nativeclie... | 🟢 9.0 | OneNote |
| 5 📋 | AAD enterprise application does not appear in My Apps Portal after assigning users. App registrat... | By design. Wildcard reply URLs have limited support in Azure AD v1 and are no... | Remove wildcard reply URLs and replace with exact redirect URIs. Wildcards in... | 🟢 9.0 | OneNote |
| 6 📋 | Customer wants to use dynamic parameters in redirect URI (e.g., https://xxx.com?aaa={a}&bbb={b}).... | Azure AD redirect URI wildcard matching has limitations: wildcards (*) can ma... | Use supported wildcard formats only: https://*.mstest.com or https://www.mste... | 🟢 9.0 | OneNote |
| 7 📋 | Enterprise application SSO blade is not available/not visible in Azure portal. App Type shows N/A... | By design. When an application is created through App Registration (not from ... | Configure SSO through the Enterprise Applications blade directly (not App Reg... | 🟢 9.0 | OneNote |
| 8 📋 | AADSTS65001: User or administrator has not consented to use the application. Web app fails to get... | Admin consent was not granted for the app. Silent token acquisition (no user ... | Grant admin consent via Azure Portal Grant Permissions button. Verify consent... | 🟢 9.0 | OneNote |
| 9 📋 | AADSTS90033: A transient error has occurred when performing admin consent to web app. Error persi... | Application has too many API permissions configured (25+). Directory Proxy (D... | Reduce the number of API permissions per consent request or use Dynamic conse... | 🟢 9.0 | OneNote |
| 10 📋 | Need to export expiration dates of all Service Principal and App Registration secrets/certificate... | No built-in portal feature to bulk-view all SP/App credential expiry dates. M... | Use official PowerShell script from Azure China docs: https://docs.azure.cn/z... | 🟢 9.0 | OneNote |
| 11 📋 | SSO not working when connecting to new AVD session host - fresh AAD auth + consent prompt Allow r... | By design: each new session host requires fresh auth and consent. AAD cache l... | Configure target device groups per MS docs: configure-single-sign-on#configur... | 🟢 8.5 | ADO Wiki |
| 12 📋 | AADSTS90097 error 'An error has occurred during admin consent processing. Review should have at l... | No reviewer is configured in the admin consent workflow settings (Enterprise ... | Configure at least one reviewer with Global Administrator, Cloud Application ... | 🟢 8.5 | ADO Wiki |
| 13 📋 | AADSTS65004 error 'User declined to consent to access the app' appears during admin consent reque... | Expected behavior - user clicked 'Back to app' button on the admin consent re... | No action needed - this is by design. Inform the user that clicking 'Back to ... | 🟢 8.5 | ADO Wiki |
| 14 📋 | After July 2025, users get AADSTS90094 (Need admin approval, admin consent workflow enabled) or A... | Microsoft deployed a new secure-by-default user consent policy ('Let Microsof... | Admins can opt out by setting user consent to 'Low impact' (second option) or... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Tenants that previously had user consent turned OFF are now allowing users to consent to more per... | A product bug during the rollout of the new updated default consent policy ac... | This was mitigated by PG over the weekend of August 16-17, 2025. If a tenant ... | 🟢 8.5 | ADO Wiki |
| 16 📋 | Restoring a soft-deleted service principal fails with error: Cannot restore ServicePrincipal with... | The service principal's backing app registration is also soft-deleted and mus... | 1) Restore the soft-deleted app registration first: POST /directory/deletedIt... | 🟢 8.5 | ADO Wiki |
| 17 📋 | Non-admin users get AADSTS65001 or AADSTS90094 'Need Admin Approval' when consenting to app, desp... | One or more permissions dynamically requested by the app (e.g., offline_acces... | 1) Check sign-in logs for errorCode=AdminConsentRequired. 2) Map GraphRequest... | 🟢 8.5 | ADO Wiki |
| 18 📋 | End users see 'Need admin approval' (AADSTS90094) when consenting to a legitimate app. Audit logs... | Microsoft's Risk Based Step-up Consent feature flagged the consent request as... | For IT admins: If convinced the app is not malicious, grant tenant-wide admin... | 🟢 8.5 | ADO Wiki |
| 19 📋 | After July 2025, users get AADSTS90094 or AADSTS90095 when consenting to apps requesting Files.Re... | New secure-by-default user consent policy (Secure Future Initiative) requires... | Opt out by setting user consent to Low impact or Off in Entra admin portal, o... | 🟢 8.5 | ADO Wiki |
| 20 📋 | Tenants with user consent turned OFF now allow users to consent to more permissions than expected... | Product bug during new default consent policy rollout accidentally enabled us... | Mitigated Aug 16-17, 2025. If still affected, escalate via ICM 669687504. Own... | 🟢 8.5 | ADO Wiki |
| 21 📋 | Non-admin users get AADSTS65001 or AADSTS90094 Need Admin Approval when consenting to app, despit... | One or more permissions dynamically requested by the app (e.g. offline_access... | 1) Check sign-in logs for errorCode=AdminConsentRequired. 2) Map GraphRequest... | 🟢 8.5 | ADO Wiki |
| 22 📋 | End users see Need admin approval (AADSTS90094) when consenting to a legitimate app. Audit logs s... | Microsoft Risk Based Step-up Consent feature flagged the consent request as r... | For IT admins: If convinced app is not malicious, grant tenant-wide admin con... | 🟢 8.5 | ADO Wiki |
| 23 📋 | AADSTS90094 or AADSTS90095 error during sign-in. Application request to Entra ID includes 'prompt... | The application sends 'prompt=consent' in the authorization request to Entra ... | Ask the app vendor/owner to remove 'prompt=consent' from the authorization re... | 🟢 8.5 | ADO Wiki |
| 24 📋 | AADSTS90094 or AADSTS90095 error. Microsoft detects risky permissions request. Audit Logs show 'C... | Microsoft's risk detection system has flagged the application's permissions r... | Review the risk detection in Audit Logs (ApplicationManagement > Consent to a... | 🟢 8.5 | ADO Wiki |
| 25 📋 | AADSTS90094 or AADSTS90095 error. Enterprise app has 'User assignment required' set to Yes, and a... | When 'User assignment required' is enabled, Entra ID disallows all user conse... | Either: (1) Disable 'User assignment required' on the Enterprise App, let use... | 🟢 8.5 | ADO Wiki |
| 26 📋 | AADSTS90094 or AADSTS90095 error. Permissions in the 'scope' parameter of the auth request are no... | The 'Grant admin consent' button uses /adminconsent endpoint which only grant... | Use the /authorize endpoint with dynamic consent: Global admin navigates to t... | 🟢 8.5 | ADO Wiki |
| 27 📋 | User is prompted for consent twice during application sign-in. First consent prompt appears, user... | Application sends dynamic scopes in the request. Due to current ESTS code des... | This is by-design behavior. Inform the customer that dynamic scope evaluation... | 🟢 8.5 | ADO Wiki |
| 28 📋 | AADSTS65001: The user or administrator has not consented to use the application. Or AADSTS90008: ... | Application is missing the minimum required Microsoft Graph 'User.Read' or 'o... | 1. Add Microsoft Graph 'User.Read' delegated permission to the App Registrati... | 🟢 8.5 | ADO Wiki |
| 29 📋 | AADSTS650059: The application (appId:{appId}) is not configured for use in tenant (tenantId:{tena... | Application was previously configured as multi-tenant (AzureADMultipleOrgs) b... | If the app needs to work cross-tenant: change signInAudience on the app regis... | 🟢 8.5 | ADO Wiki |
| 30 📋 | SignInAudience value 'AzureADMultipleOrgs' not allowed as per assigned policy. Error when creatin... | Tenant admin has configured app management policy (defaultAppManagementPolicy... | Contact tenant admin to either: (1) Update the policy to allow the desired si... | 🟢 8.5 | ADO Wiki |
| 31 📋 | SP-Less authentication works for App A but fails for App B in the same tenant — inconsistent beha... | SP-Less authentication is deprecated. Some legacy resource apps (e.g., MS Gra... | Do not rely on SP-Less authentication behavior. Create Service Principals for... | 🟢 8.5 | ADO Wiki |
| 32 📋 | AADSTS700016: Application with identifier '31359c7f-bd7e-475c-86db-fdb8c937548e' (PnP Management ... | As of 9/9/2024, PnP Management Shell multitenant app was disabled. The applic... | Follow instructions at https://pnp.github.io/blog/post/changes-pnp-management... | 🟢 8.5 | ADO Wiki |
| 33 📋 | AADSTS700016: Application with identifier 'd1ddf0e4-d672-4dae-b554-9d5bdfd93547' was not found in... | Intune PowerShell example scripts reference a deprecated app ID. Customers ne... | Register a new App Registration in Entra ID with required Intune API permissi... | 🟢 8.5 | ADO Wiki |
| 34 📋 | AADSTS90094 or AADSTS90095 error during sign-in. Application request includes prompt=consent para... | Application sends prompt=consent in authorization request, forcing consent pr... | Ask app vendor/owner to remove prompt=consent from authorization request. | 🟢 8.5 | ADO Wiki |
| 35 📋 | AADSTS90094/90095 error. Microsoft detects risky permissions. Audit Logs show Risky application d... | Risk detection flagged application permissions as risky, blocking user consent. | Review risk detection in Audit Logs. If app valid, admin should approve. | 🟢 8.5 | ADO Wiki |
| 36 📋 | AADSTS90094/90095 error. Enterprise app has User assignment required=Yes, admin consent not granted. | User assignment required disallows all user consent because consenting causes... | (1) Disable User assignment required, let user consent, re-enable. Or (2) Adm... | 🟢 8.5 | ADO Wiki |
| 37 📋 | AADSTS90094/90095 error. Permissions in scope not admin consented. Grant admin consent button doe... | Grant admin consent uses /adminconsent endpoint which only grants permissions... | Use /authorize endpoint with dynamic consent: Global admin navigates to URL w... | 🟢 8.5 | ADO Wiki |
| 38 📋 | User prompted for consent twice during sign-in. First consent, then login, then second consent wi... | Dynamic scopes: first call evaluates existing Graph delegations, second call ... | By-design. App can minimize by registering all permissions in App Registratio... | 🟢 8.5 | ADO Wiki |
| 39 📋 | AADSTS65001: user/admin has not consented. Or AADSTS90008: app misconfigured, must require Sign i... | Application missing Microsoft Graph User.Read or openid delegated permission,... | 1. Add User.Read delegated permission. 2. Admin consent with Consent on behal... | 🟢 8.5 | ADO Wiki |
| 40 📋 | AADSTS650059: Application not configured for use in tenant. SignInAudience AzureADMyOrg limiting ... | App changed from multi-tenant to single-tenant. External SPs cannot authentic... | Change signInAudience to AzureADMultipleOrgs in home tenant app registration.... | 🟢 8.5 | ADO Wiki |
| ... | *121 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **consent** related issues (7 entries) `[onenote]`
2. Check **app-registration** related issues (3 entries) `[onenote]`
3. Check **admin-consent** related issues (3 entries) `[ado-wiki]`
4. Check **ropc** related issues (2 entries) `[ado-wiki]`
5. Check **delegation** related issues (2 entries) `[onenote]`
6. Check **msgraph** related issues (2 entries) `[onenote]`
7. Check **redirect-uri** related issues (2 entries) `[onenote]`
8. Check **wildcard** related issues (2 entries) `[onenote]`
