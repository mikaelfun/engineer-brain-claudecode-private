# Troubleshoot Consent Issues in Microsoft Entra ID

> Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/troubleshoot-consent-issues

## Common Error Codes

| Error | Description |
|-------|-------------|
| AADSTS65001 | User or admin has not consented to use the application |
| AADSTS650056 | Misconfigured application (missing permissions, wrong app ID) |
| AADSTS90094 | Admin policy prevents granting permissions |
| AADSTS90008 | App misconfigured - must require at least User.Read |
| AADSTS900941 | Admin consent required due to risky app |
| AADSTS900981 | Admin consent request for risky app warning |

## 7-Step Decision Tree

### Step 1: Get the sign-in request
Capture the OAuth2 authorize URL from browser address bar or Fiddler. Key params: `client_id`, `scope`, `resource`, `prompt`.

### Step 2: Check if user consent is allowed
- Portal > Entra ID > Enterprise apps > Consent and permissions
- "Do not allow user consent" → admin must consent
- "Allow user consent for apps" → continue to Step 3

### Step 3: Verify application exists in tenant
- Enterprise applications > search by App-ID
- Not found → perform admin consent (this creates the SP)

### Step 4: Check user assignment required
- Enterprise app > Properties > "Assignment required"
- If Yes → admin must consent

### Step 5: Compare requested vs granted permissions
- Enterprise app > Permissions
- Compare with `scope` in sign-in request
- Missing scopes → admin consent needed

### Step 6: Verify resource exists in tenant
- Test: `https://{instance}/{tenant}/oauth2/authorize?response_type=code&client_id={appId}&resource={resourceUri}`
- AADSTS650052 → resource not subscribed
- AADSTS650057 → resource not in app registration
- AADSTS500011 → resource principal not found

### Step 7: Check prompt parameter
- `prompt=consent` or `prompt=admin_consent` forces consent screen
- Remove prompt param after initial consent

## Resolution: Admin Consent

### Option A: Interactive
1. Global/Application Admin signs in to the app
2. Check "Consent on behalf of your organization"

### Option B: Admin Consent URL
```
https://login.microsoftonline.com/{tenant}/adminconsent?client_id={appId}
```

### Option C: V2 endpoint with explicit scopes
```
https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?client_id={appId}&response_type=code&redirect_uri={uri}&scope=openid+profile+User.Read+Directory.Read.All&prompt=consent
```

## Key Concepts
- Adding permissions to app registration does NOT consent them - must also grant on service principal
- Application permissions always require admin consent
- Delegated permissions may require admin consent depending on scope
- Audit logs: Entra ID > Audit logs > Category=ApplicationManagement, Activity=Consent to application
