---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_Consent_Experiences/Troubleshooting/Troubleshooting Consent in Azure AD"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_Consent_Experiences%2FTroubleshooting%2FTroubleshooting%20Consent%20in%20Azure%20AD"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Consent in Azure AD

General guide for troubleshooting consent in Entra ID. Applies to OpenID Connect and OAuth2 based authentications. SAML based applications may throw same errors but have different solutions (check SAMLRequest configuration).

## Common Error Codes

- **AADSTS65001**: The user or administrator has not consented to use the application
- **AADSTS650056**: Misconfigured application - missing permissions for AAD Graph
- **AADSTS90094**: Admin consent required (user consent disabled)
- **AADSTS90008**: Application misconfigured, must require at least 'Sign in and read user profile'
- **AADSTS900941**: Administrator consent required due to risky app
- **AADSTS900981**: Admin consent request received for risky app

## High-Level Scenarios

- User.Read permission is missing
- User consent is disabled
- User Assignment required is enabled on the application
- Service principal does not exist in tenant for client app
- Service principal does not exist in tenant for resource
- Hitting the consent URL (prompt=admin_consent & prompt=consent)
- Scopes requested that have not been consented to
- The scope/permission requires Admin consent
- User Consent Blocked for Risky Apps

**Note:** Simply adding permissions to an application registration is NOT consenting to the permissions.

## Key Concepts

### Application Registration vs Enterprise Application
- **Application Registration** (Application object): Where permissions are configured
- **Enterprise Application** (ServicePrincipal object): Where consent grants are recorded
- Assigning permissions to the ServicePrincipal defines what is "consented"

### Delegated vs Application Permissions
- Delegated: For user sign-in scenarios
- Application: For service principal authentication via client credential flow

## Known Issues

### Security hardening of consent popup UX
Default button changed from Accept to Cancel (mid-July 2024). Only impacts mouse-move-screen-click automation, not API automation.

### Applications do not present consent prompt
Special property (AdminConsentSSO) added to some Service Principals to avoid consent. Applied to SAML apps or apps created by first-party apps with admin role (implied consent). Only considered for app+user case without authorization code/access token issuance.

### Consent prompt appears twice
When app sends dynamic scopes, first call evaluates existing Graph delegations, second call evaluates dynamic scopes. By design. ICM ref: 250523706.

## Troubleshooting Steps

### 1. Use ASC
- Tenant Explorer > Application > search by AppID > Permissions tab
- Four tabs: Admin Consent, User Consent, Consent Sign-in Errors, Consent Audit Logs

### 2. Check User.Read Permission
At minimum, any sign-in app should have Microsoft Graph 'User.Read' or 'openid' Delegated permission added and consented.

### 3. Get Sign-in Request
Capture the URL sent to Entra ID (from Fiddler, browser bar, or ASC Sign-in Diagnostics).

**V1 endpoint:** `https://{instance}/{tenant}/oauth2/authorize?client_id={AppId}&response_type=code&redirect_uri={uri}&resource={resource}&scope={scope}&prompt={prompt}`

**V2 endpoint:** `https://{instance}/{tenant}/oauth2/v2.0/authorize?client_id={AppId}&response_type=code&redirect_uri={uri}&scope={scope}&prompt={prompt}`

### 4. Check Tenant Consent Settings
Portal: Enterprise Applications > User settings > "Users can consent to apps accessing company data on their behalf"
- Yes: Users can consent to non-admin permissions
- No: Users always get "Need admin approval", admin must perform admin consent

ASC: Application > Settings > "User can consent to apps accessing data"

### 5. Verify Application Exists
Search Enterprise Applications by AppId. If not found → perform admin consent.

### 6. Check User Assignment Required
Enterprise App > Properties > User assignment required
- If Yes: Admin must perform consent (user consent blocked to prevent self-assignment)

### 7. Verify Permissions
Compare Enterprise App permissions page with {Scope} in auth request.
- OpenID scopes (openid, email, profile, offline_access) generally not listed - ignore
- Missing scopes → admin must consent

### 8. Verify Resource Exists
Common errors:
- **AADSTS650052**: Resource not subscribed/enabled
- **AADSTS650057**: Invalid resource, not in requested permissions
- **AADSTS500011**: Resource principal not found in tenant

### 9. Check prompt Parameter
Remove prompt=consent/admin_consent once consent is granted.

### 10. Perform Admin Consent
Global Admin / Application Admin accesses app, checks "Consent on behalf of your organization", clicks Accept.

### 11. Force Admin Consent
Add &prompt=consent to the original sign-in request URL.
V2 endpoint with all required scopes: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?client_id={AppId}&response_type=code&redirect_uri={uri}&scope={scopes}&prompt=consent`

## Tips
- Application permissions always require admin consent from Global Admin
- Application Admins can consent to Delegated permissions requiring admin consent
- adminconsent URL only grants permissions configured in App Registration: `https://login.microsoftonline.com/{tenant}/adminconsent?client_id={AppId}`
- ASC Troubleshooter: Open OAuth2:Authorize row > Gateway tab > load AAD Gateway logs > search "IncomingURL" for scopes and prompt parameter
