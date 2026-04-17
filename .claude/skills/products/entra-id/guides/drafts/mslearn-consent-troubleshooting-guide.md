# Consent Troubleshooting Guide (Entra ID)

> Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/troubleshoot-consent-issues

## Common Error Codes

| Error | Meaning |
|-------|---------|
| AADSTS65001 | User/admin has not consented to the application |
| AADSTS650056 | Misconfigured application (missing permissions, wrong issuer, no admin consent) |
| AADSTS90094 | Admin policy prevents granting permissions |
| AADSTS90008 | App misconfigured, must require at least User.Read |
| AADSTS900941 | App considered risky, admin consent required |

## 7-Step Decision Tree

### Step 1: Capture the sign-in request
- Get the OAuth2 authorize URL from browser address bar or HTTP capture tool
- Key parameters: `client_id`, `scope`, `resource`, `prompt`, `tenant-id`

### Step 2: Check user consent settings
- Entra ID > Enterprise applications > Consent and permissions
- If "Do not allow user consent" → admin must perform consent

### Step 3: Verify application exists in tenant
- Enterprise applications > Application Type = All > search by App-ID
- If not found → perform admin consent to create service principal

### Step 4: Check user assignment requirement
- Enterprise app > Properties > Assignment required
- If Yes → admin must consent; user assignment rules apply

### Step 5: Compare permissions requested vs granted
- Enterprise app > Permissions vs `scope` in sign-in request
- Missing scopes need consent (delegated vs application type matters)
- OpenID scopes (openid, email, profile, offline_access) may not appear

### Step 6: Verify resource exists in tenant
- Test: `https://{aad-instance}/{tenant}/oauth2/authorize?response_type=code&client_id={appId}&resource={resourceUri}`
- AADSTS650052 → resource not subscribed
- AADSTS650057 → resource not in app registration API permissions
- AADSTS500011 → resource principal not found (wrong URI or single-tenant)

### Step 7: Check prompt parameter
- `prompt=consent` or `prompt=admin_consent` forces consent screen every time
- Remove after initial consent is granted

## Admin Consent Methods

1. **Portal**: Admin signs in to app, checks "Consent on behalf of your organization"
2. **Consent URL**: `https://login.microsoftonline.com/{tenant}/adminconsent?client_id={appId}`
3. **V2 endpoint with scopes**: `...oauth2/v2.0/authorize?...scope={scopes}&prompt=consent`

## Diagnostic: Audit Logs
- Entra ID > Audit logs > Category: ApplicationManagement > Status: Failure > Activity: Consent to application
- Check STATUS REASON for details (e.g., UserConsentBlockedForRiskyAppsException)
